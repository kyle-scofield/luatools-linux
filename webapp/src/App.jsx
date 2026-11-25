import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from './api.js';
import Home from './pages/Home.jsx';
import Library from './pages/Library.jsx';
import GameDetail from './pages/GameDetail.jsx';
import Settings from './pages/Settings.jsx';

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } };

const NAV = [
  { id: 'home', label: 'Home', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: 'library', label: 'Manage', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { id: 'mode', label: 'Mode', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
  { id: 'fixes', label: 'Fixes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
];

export default function App() {
  const [tab, setTab] = useState('home');
  const [gameId, setGameId] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => { api('/config').then(setConfig).catch(() => {}); }, []);

  const go = id => { setTab(id); setGameId(null); };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[180px] shrink-0 flex flex-col bg-bg">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#7C5CFC" opacity="0.2"/>
            <path d="M12 6v8l6 3" stroke="#7C5CFC" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-[15px] font-semibold">LuaTools</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 mt-1">
          {NAV.map(({ id, label, icon }) => (
            <button key={id} onClick={() => go(id)}
              className={`sidebar-link ${tab === id && !gameId ? 'active' : ''}`}>
              {icon}
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-2 space-y-0.5">
          <button onClick={() => { if(confirm('Restart Steam?')) api('/steam/restart',{method:'POST'}); }}
            className="sidebar-link text-[13px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Restart Steam
          </button>
          <button onClick={() => go('settings')}
            className={`sidebar-link text-[13px] ${tab === 'settings' ? 'active' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            Settings
          </button>
        </div>
        <div className="px-5 pb-4 text-[11px] text-gray2">
          v1.0.0 · Linux
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {gameId ? (
            <motion.div key={`g-${gameId}`} {...fade}>
              <GameDetail appid={gameId} onBack={() => setGameId(null)} />
            </motion.div>
          ) : (
            <motion.div key={tab} {...fade}>
              {tab === 'home' && <Home onGame={setGameId} config={config} />}
              {tab === 'library' && <Library onGame={setGameId} />}
              {tab === 'mode' && <ModePage />}
              {tab === 'fixes' && <FixesPage />}
              {tab === 'settings' && <Settings config={config} onSave={setConfig} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ModePage() {
  const [proton, setProton] = useState(null);
  useEffect(() => { api('/proton').then(setProton).catch(() => setProton([])); }, []);
  return (
    <div className="p-10">
      <h1 className="text-[24px] font-bold mb-6">Mode</h1>
      <div className="card">
        <div className="status-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C5CFC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Mode · Native Linux (No Proton needed for native games)
        </div>
      </div>
      {proton && proton.length > 0 && (
        <div className="mt-6">
          <h2 className="text-[16px] font-semibold mb-3">Installed Proton versions</h2>
          <div className="card divide-y divide-bd">
            {proton.map(p => (
              <div key={p} className="px-5 py-3 text-[13px] text-ink">{p}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FixesPage() {
  return (
    <div className="p-10">
      <h1 className="text-[24px] font-bold mb-6">Fixes</h1>
      <div className="card p-6 text-[14px] text-gray">
        <p>No fixes available yet.</p>
        <p className="text-[13px] text-gray2 mt-2">Game-specific fixes and patches will appear here.</p>
      </div>
    </div>
  );
}
