import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Cover from '../components/Cover.jsx';

export default function Home({ onGame, config }) {
  const [games, setGames] = useState(null);
  const [steam, setSteam] = useState(false);

  useEffect(() => {
    api('/games').then(setGames).catch(() => setGames([]));
    api('/steam/running').then(r => setSteam(r.running)).catch(() => {});
  }, []);

  if (!games) return <div className="flex items-center justify-center h-full text-gray2 text-[14px]">Loading...</div>;

  const recent = games.filter(g => g.lastPlayed > 0).slice(0, 8);
  const lastGame = games[0];

  return (
    <div className="p-10">
      <h1 className="text-[24px] font-bold mb-6">Welcome to LuaTools</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card px-6 py-5">
          <div className="text-[32px] font-bold text-purple">{games.length}</div>
          <div className="text-[13px] text-gray mt-1">Games on board</div>
        </div>
        <div className="card px-6 py-5">
          <div className="text-[11px] text-gray2 uppercase tracking-wider">Last played</div>
          <div className="text-[16px] font-semibold mt-1">{lastGame?.name || '—'}</div>
        </div>
      </div>

      {/* Status */}
      <div className="card mb-6">
        <div className="status-row">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${steam ? 'bg-green/20 text-green' : 'bg-red/20 text-red'}`}>
            {steam ? '✓' : '✕'}
          </span>
          Steam {steam ? 'detected' : 'not detected'} · {config?.steamPath || 'auto'}
        </div>
        <div className="status-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Platform · Linux native
        </div>
        <div className="status-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C5CFC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Mode · Steam Library Manager
        </div>
      </div>

      {/* Drop zone */}
      <div className="drop-zone mb-8">
        <div className="flex flex-col items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C5CFC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <div className="text-[14px] font-medium">Drop .lua, .manifest or .zip files here</div>
          <div className="text-[12px] text-gray2">They're placed into the right Steam folders automatically.</div>
          <button className="btn btn-ghost mt-2 text-[12px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
            Browse files...
          </button>
        </div>
      </div>

      {/* Recently played */}
      {recent.length > 0 && (
        <>
          <h2 className="text-[16px] font-semibold mb-4">Recently added</h2>
          <div className="game-scroll">
            {recent.map(g => (
              <div key={g.appid} className="game-thumb" onClick={() => onGame(g.appid)}>
                <Cover appid={g.appid} name={g.name} aspect="" className="rounded-lg w-[180px] h-[85px]" />
                <div className="name">{g.name}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
