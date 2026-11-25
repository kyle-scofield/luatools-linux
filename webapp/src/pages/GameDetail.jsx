import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { BackIcon, PlayIcon, FolderIcon, StorefrontIcon } from '../components/Icons.jsx';
import Cover from '../components/Cover.jsx';

function fmt(bytes) {
  if (bytes > 1e9) return (bytes / 1e9).toFixed(1) + ' ГБ';
  if (bytes > 1e6) return (bytes / 1e6).toFixed(0) + ' МБ';
  return '< 1 МБ';
}

export default function GameDetail({ appid, onBack }) {
  const [info, setInfo] = useState(null);
  const [manifest, setManifest] = useState(null);
  const [files, setFiles] = useState(null);
  const [tab, setTab] = useState('info');
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    api(`/games/${appid}`).then(setInfo).catch(() => {});
    api(`/games/${appid}/manifest`).then(setManifest).catch(() => {});
  }, [appid]);

  const loadFiles = () => {
    if (!files) api(`/games/${appid}/files`).then(setFiles).catch(() => setFiles({ files: [] }));
    setTab('files');
  };

  const launch = async () => {
    setLaunching(true);
    await api(`/games/${appid}/launch`, { method: 'POST' }).catch(() => {});
    setTimeout(() => setLaunching(false), 2000);
  };

  return (
    <div className="p-8 max-w-[960px]">
      <button onClick={onBack}
        className="inline-flex items-center gap-2 text-[13px] text-gray hover:text-fg mb-6 transition-colors">
        <BackIcon /> Назад
      </button>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <Cover appid={appid} name={info?.name} aspect="aspect-[21/9]" className="w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 pr-20">
          <h1 className="text-[26px] font-bold drop-shadow-lg leading-tight">{info?.name || `App ${appid}`}</h1>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {info?.genres?.map(g => (
              <span key={g.id} className="badge bg-purple/20 text-purpleLight text-[10px]">{g.description}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 mb-8">
        <button onClick={launch} disabled={launching}
          className="btn btn-primary">{launching ? 'Запуск...' : <><PlayIcon /> Запустить</>}</button>
        <button onClick={() => api(`/games/${appid}/open-folder`, { method: 'POST' })}
          className="btn btn-ghost"><FolderIcon /> Папка</button>
        <button onClick={() => window.open(`https://store.steampowered.com/app/${appid}`, '_blank')}
          className="btn btn-ghost"><StorefrontIcon /> Store</button>
        <button onClick={() => window.open(`https://www.pcgamingwiki.com/api/appid.php?appid=${appid}`, '_blank')}
          className="btn btn-ghost">PCGamingWiki</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 mb-6 border-b border-bd">
        {[
          { id: 'info', label: 'Информация', action: () => setTab('info') },
          { id: 'manifest', label: 'Манифест', action: () => setTab('manifest') },
          { id: 'files', label: 'Файлы', action: loadFiles },
        ].map(t => (
          <button key={t.id} onClick={t.action}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors
              ${tab === t.id ? 'text-purple border-purple' : 'text-gray2 border-transparent hover:text-fg'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && info && (
        <div className="grid grid-cols-2 gap-5">
          <div className="card p-5 space-y-3">
            <Row k="App ID" v={appid} />
            <Row k="Разработчик" v={info.developers?.join(', ')} />
            <Row k="Издатель" v={info.publishers?.join(', ')} />
            <Row k="Дата выхода" v={info.release_date?.date} />
            {info.metacritic && <Row k="Metacritic" v={<span className="text-green font-semibold">{info.metacritic.score}</span>} />}
          </div>
          <div className="card p-5">
            {info.short_description && (
              <p className="text-[13px] text-ink leading-relaxed">{info.short_description}</p>
            )}
            {info.pc_requirements?.minimum && (
              <div className="mt-4 pt-4 border-t border-bd">
                <div className="text-[11px] text-gray2 font-medium uppercase tracking-wider mb-2">Минимальные</div>
                <div className="text-[12px] text-gray leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: info.pc_requirements.minimum.replace(/<br\s*\/?>/g, ' ') }} />
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'info' && !info && <div className="text-center text-gray2 py-10 text-[13px]">Загрузка информации...</div>}

      {tab === 'manifest' && (
        <div className="card p-5">
          <pre className="text-[12px] text-ink font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
            {manifest || 'Загрузка...'}
          </pre>
        </div>
      )}

      {tab === 'files' && (
        <div className="card p-5">
          {files?.dir && <div className="text-[11px] text-gray2 font-mono mb-3 pb-3 border-b border-bd">{files.dir}</div>}
          <div className="max-h-[500px] overflow-y-auto space-y-px">
            {files?.files?.map((f, i) => (
              <div key={i} className="text-[12px] text-ink font-mono py-1 px-2 rounded hover:bg-white/[.03] transition-colors">{f}</div>
            )) || <div className="text-gray2 text-[13px]">Загрузка...</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }) {
  if (!v) return null;
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-[12px] text-gray2 shrink-0">{k}</span>
      <span className="text-[13px] text-fg text-right">{v}</span>
    </div>
  );
}
