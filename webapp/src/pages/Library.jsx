import { useEffect, useState, useMemo } from 'react';
import { api } from '../api.js';
import { SearchIcon } from '../components/Icons.jsx';
import Cover from '../components/Cover.jsx';

function fmt(bytes) {
  if (bytes > 1e9) return (bytes / 1e9).toFixed(1) + ' ГБ';
  if (bytes > 1e6) return (bytes / 1e6).toFixed(0) + ' МБ';
  return '< 1 МБ';
}

export default function Library({ onGame }) {
  const [games, setGames] = useState(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('recent');
  const [view, setView] = useState('grid');

  useEffect(() => { api('/games').then(setGames).catch(() => setGames([])); }, []);

  const list = useMemo(() => {
    if (!games) return [];
    let f = games.filter(g => !q || g.name.toLowerCase().includes(q.toLowerCase()) || String(g.appid).includes(q));
    if (sort === 'name') f = [...f].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'size') f = [...f].sort((a, b) => b.size - a.size);
    return f;
  }, [games, q, sort]);

  if (!games) return <div className="flex items-center justify-center h-full"><div className="w-2 h-2 bg-purple rounded-full animate-pulse" /></div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold">Библиотека</h1>
          <p className="text-[12px] text-gray2 mt-0.5">{games.length} игр · {fmt(games.reduce((s,g)=>s+g.size,0))}</p>
        </div>
        <div className="flex gap-1.5">
          {['grid','list'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${view === v ? 'bg-purpleDim text-purple' : 'text-gray2 hover:text-gray hover:bg-white/[.03]'}`}>
              {v === 'grid' ? <GridIcon /> : <ListIcon />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray2"><SearchIcon /></span>
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Поиск..." className="input pl-10" />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="input w-[160px]">
          <option value="recent">Недавние</option>
          <option value="name">По имени</option>
          <option value="size">По размеру</option>
        </select>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-3 gap-4">
          {list.map(g => (
            <button key={g.appid} onClick={() => onGame(g.appid)}
              className="card card-hover overflow-hidden text-left cursor-pointer group">
              <div className="relative overflow-hidden">
                <Cover appid={g.appid} name={g.name} className="w-full group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="px-3.5 py-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold truncate group-hover:text-purple transition-colors">{g.name}</div>
                  <div className="text-[11px] text-gray2 mt-0.5">{g.appid}</div>
                </div>
                <span className="badge bg-white/[.04] text-gray2 text-[10px] shrink-0">{fmt(g.size)}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden divide-y divide-bd">
          {list.map(g => (
            <button key={g.appid} onClick={() => onGame(g.appid)}
              className="w-full flex items-center gap-4 px-4 py-2.5 text-left hover:bg-white/[.025] transition-colors cursor-pointer group">
              <div className="w-[52px] h-[24px] rounded overflow-hidden shrink-0">
                <Cover appid={g.appid} name={g.name} aspect="h-full w-full" className="object-cover" />
              </div>
              <span className="flex-1 min-w-0 text-[13px] font-medium truncate group-hover:text-purple transition-colors">{g.name}</span>
              <span className="text-[11px] text-gray2 tabular-nums">{g.appid}</span>
              <span className="text-[12px] text-gray tabular-nums shrink-0 w-[70px] text-right">{fmt(g.size)}</span>
            </button>
          ))}
        </div>
      )}

      {list.length === 0 && <div className="text-center text-gray2 py-16 text-[14px]">Ничего не найдено</div>}
    </div>
  );
}

const GridIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>;
const ListIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="3" rx="1"/><rect x="1" y="7" width="14" height="3" rx="1"/><rect x="1" y="12" width="14" height="3" rx="1"/></svg>;
