import express from 'express';
import cors from 'cors';
import { readdir, readFile, writeFile, stat, access } from 'fs/promises';
import { join, basename } from 'path';
import { homedir } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const run = promisify(exec);
const app = express();
app.use(cors());
app.use(express.json());

const STEAM_PATHS = [
  join(homedir(), '.local/share/Steam'),
  join(homedir(), '.steam/steam'),
  '/usr/share/steam',
];

let steamPath = null;
const configPath = join(homedir(), '.config/luatools/config.json');

async function loadConfig() {
  try {
    const data = await readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch { return {}; }
}

async function saveConfig(cfg) {
  const dir = join(homedir(), '.config/luatools');
  await run(`mkdir -p "${dir}"`);
  await writeFile(configPath, JSON.stringify(cfg, null, 2));
}

async function findSteam() {
  const cfg = await loadConfig();
  if (cfg.steamPath) {
    try { await access(cfg.steamPath); return cfg.steamPath; } catch {}
  }
  for (const p of STEAM_PATHS) {
    try { await access(join(p, 'steamapps')); return p; } catch {}
  }
  return null;
}

function parseAcf(text) {
  const result = {};
  const lines = text.split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*"(\w+)"\s+"(.*)"\s*$/);
    if (m) result[m[1]] = m[2];
  }
  return result;
}

async function getGames() {
  if (!steamPath) return [];
  const appsDir = join(steamPath, 'steamapps');
  const files = await readdir(appsDir);
  const manifests = files.filter(f => f.startsWith('appmanifest_') && f.endsWith('.acf'));

  const games = [];
  for (const f of manifests) {
    try {
      const text = await readFile(join(appsDir, f), 'utf8');
      const data = parseAcf(text);
      if (!data.appid || !data.name) continue;
      const appid = parseInt(data.appid);
      if (appid < 100) continue;

      const lname = data.name.toLowerCase();
      const isRuntime = lname.includes('steam linux runtime') || lname.includes('proton ')
        || lname.includes('steamworks') || lname.includes('redistributable');
      if (isRuntime) continue;

      const installDir = data.installdir ? join(appsDir, 'common', data.installdir) : null;
      let installed = false;
      if (installDir) {
        try { await access(installDir); installed = true; } catch {}
      }

      games.push({
        appid,
        name: data.name,
        installdir: data.installdir || '',
        size: parseInt(data.SizeOnDisk || '0'),
        buildid: data.buildid || '',
        lastPlayed: parseInt(data.LastPlayed || '0'),
        lastUpdated: parseInt(data.LastUpdated || '0'),
        installed,
        stateFlags: parseInt(data.StateFlags || '0'),
      });
    } catch {}
  }

  return games.sort((a, b) => b.lastPlayed - a.lastPlayed);
}

async function getGameDetails(appid) {
  const cacheDir = join(homedir(), '.config/luatools/cache');
  await run(`mkdir -p "${cacheDir}"`);
  const cachePath = join(cacheDir, `${appid}.json`);

  try {
    const cached = await readFile(cachePath, 'utf8');
    const data = JSON.parse(cached);
    if (Date.now() / 1000 - (data._cachedAt || 0) < 86400 * 7) return data;
  } catch {}

  try {
    const { stdout } = await run(`curl -sL "https://store.steampowered.com/api/appdetails?appids=${appid}&l=russian"`, { timeout: 10000 });
    const json = JSON.parse(stdout);
    if (json[appid]?.success) {
      const data = json[appid].data;
      data._cachedAt = Date.now() / 1000;
      await writeFile(cachePath, JSON.stringify(data));
      return data;
    }
  } catch {}
  return null;
}

// --- Routes ---

app.get('/api/health', (_, res) => res.json({ ok: true, name: 'LuaTools Linux' }));

app.get('/api/config', async (_, res) => {
  const cfg = await loadConfig();
  res.json({ ...cfg, steamPath, steamFound: !!steamPath });
});

app.post('/api/config', async (req, res) => {
  const cfg = await loadConfig();
  Object.assign(cfg, req.body);
  await saveConfig(cfg);
  if (cfg.steamPath) steamPath = cfg.steamPath;
  res.json({ ok: true });
});

app.get('/api/games', async (_, res) => {
  const games = await getGames();
  res.json(games);
});

app.get('/api/games/:appid', async (req, res) => {
  const details = await getGameDetails(req.params.appid);
  if (!details) return res.status(404).json({ error: 'Not found' });
  res.json(details);
});

app.get('/api/games/:appid/manifest', async (req, res) => {
  if (!steamPath) return res.status(400).json({ error: 'Steam not found' });
  const f = join(steamPath, 'steamapps', `appmanifest_${req.params.appid}.acf`);
  try {
    const text = await readFile(f, 'utf8');
    res.type('text/plain').send(text);
  } catch { res.status(404).json({ error: 'Manifest not found' }); }
});

app.get('/api/games/:appid/files', async (req, res) => {
  if (!steamPath) return res.status(400).json({ error: 'Steam not found' });
  const appsDir = join(steamPath, 'steamapps');
  const f = join(appsDir, `appmanifest_${req.params.appid}.acf`);
  try {
    const text = await readFile(f, 'utf8');
    const data = parseAcf(text);
    const gameDir = join(appsDir, 'common', data.installdir);
    const { stdout } = await run(`find "${gameDir}" -maxdepth 2 -type f | head -100`);
    const files = stdout.trim().split('\n').filter(Boolean).map(p => p.replace(gameDir + '/', ''));
    res.json({ dir: gameDir, files });
  } catch { res.status(404).json({ error: 'Game not found' }); }
});

app.post('/api/games/:appid/launch', async (req, res) => {
  const appid = req.params.appid;
  try {
    exec(`steam steam://rungameid/${appid}`);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/games/:appid/open-folder', async (req, res) => {
  if (!steamPath) return res.status(400).json({ error: 'Steam not found' });
  const f = join(steamPath, 'steamapps', `appmanifest_${req.params.appid}.acf`);
  try {
    const text = await readFile(f, 'utf8');
    const data = parseAcf(text);
    const gameDir = join(steamPath, 'steamapps', 'common', data.installdir);
    exec(`xdg-open "${gameDir}"`);
    res.json({ ok: true, dir: gameDir });
  } catch { res.status(404).json({ error: 'Game not found' }); }
});

app.get('/api/steam/running', async (_, res) => {
  try {
    const { stdout } = await run('pgrep -c steam || true');
    res.json({ running: parseInt(stdout.trim()) > 0 });
  } catch { res.json({ running: false }); }
});

app.post('/api/steam/restart', async (_, res) => {
  try {
    await run('pkill -f "steam" || true');
    setTimeout(() => exec('steam &'), 2000);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/proton', async (_, res) => {
  if (!steamPath) return res.json([]);
  try {
    const commonDir = join(steamPath, 'steamapps', 'common');
    const dirs = await readdir(commonDir);
    const protons = dirs.filter(d => d.toLowerCase().includes('proton'));
    res.json(protons);
  } catch { res.json([]); }
});

// Serve built frontend
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'webapp', 'dist');
if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_, res) => res.sendFile(join(distDir, 'index.html')));
}

// --- Start ---
(async () => {
  steamPath = await findSteam();
  console.log(`Steam: ${steamPath || 'not found'}`);

  app.listen(3002, () => {
    console.log('LuaTools server on http://localhost:3002');
  });
})();
