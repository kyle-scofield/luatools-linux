import { useEffect, useState, useMemo } from 'react';
import { api } from '../api.js';
import Cover from '../components/Cover.jsx';

function fmt(bytes) {
  if (bytes > 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
  if (bytes > 1e6) return (bytes / 1e6).toFixed(0) + ' MB';
  return '< 1 MB';
}

export default function Library({ onGame }) {
  const [games, setGames] = useState(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('recent');

  useEffect(() => { api('/games').then(setGames).catch(() => setGames([])); }, []);

  const list = useMemo(() => {
    if (!games) return [];
    let f = games.filter(g => !q || g.name.toLowerCase().includes(q.toLowerCase()) || String(g.appid).includes(q));
    if (sort === 'name') f = [...f].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'size') f = [...f].sort((a, b) => b.size - a.size);
    return f;
  }, [games, q, sort]);

  if (!games) return <div className="flex items-center justify-center h-full text-gray2 text-[14px]">Loading...</div>;

  return (
    <div className="p-10">
      <h1 className="text-[24px] font-bold mb-6">Manage</h1>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search games..." className="input pl-10" />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="input w-[150px]">
          <option value="recent">Recent</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
        </select>
      </div>

      <div className="card divide-y divide-bd">
        {list.map(g => (
          <button key={g.appid} onClick={() => onGame(g.appid)}
            className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-white/[.025] transition-colors cursor-pointer">
            <div className="w-[52px] h-[24px] rounded overflow-hidden shrink-0">
              <Cover appid={g.appid} name={g.name} aspect="h-full w-full" className="object-cover" />
            </div>
            <span className="flex-1 min-w-0 text-[14px] truncate">{g.name}</span>
            <span className="text-[12px] text-gray2 tabular-nums shrink-0">{fmt(g.size)}</span>
            <span className="text-[11px] text-gray2 shrink-0 w-[60px] text-right">{g.appid}</span>
          </button>
        ))}
      </div>

      {list.length === 0 && <div className="text-center text-gray2 py-16 text-[14px]">No games found</div>}
    </div>
  );
}
