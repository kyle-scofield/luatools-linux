import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Cover from '../components/Cover.jsx';

function fmt(bytes) {
  if (bytes > 1e9) return (bytes / 1e9).toFixed(1) + ' ГБ';
  if (bytes > 1e6) return (bytes / 1e6).toFixed(0) + ' МБ';
  return '< 1 МБ';
}

function ago(ts) {
  if (!ts) return '';
  const d = Date.now() / 1000 - ts;
  if (d < 3600) return `${Math.floor(d / 60)} мин`;
  if (d < 86400) return `${Math.floor(d / 3600)} ч`;
  if (d < 2592000) return `${Math.floor(d / 86400)} дн`;
  return new Date(ts * 1000).toLocaleDateString('ru');
}

export default function Home({ onGame }) {
  const [games, setGames] = useState(null);
  const [steam, setSteam] = useState(false);

  useEffect(() => {
    api('/games').then(setGames).catch(() => setGames([]));
    api('/steam/running').then(r => setSteam(r.running)).catch(() => {});
  }, []);

  if (!games) return <Loader />;

  const total = games.reduce((s, g) => s + g.size, 0);
  const recent = games.filter(g => g.lastPlayed > 0).slice(0, 6);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold">Добро пожаловать</h1>
        <p className="text-[13px] text-gray mt-1">Управление Steam библиотекой</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="stat-card purple">
          <div className="text-[28px] font-bold text-purple tabular-nums">{games.length}</div>
          <div className="text-[12px] text-gray mt-1">Установлено игр</div>
        </div>
        <div className="stat-card green">
          <div className="text-[28px] font-bold text-green tabular-nums">{fmt(total)}</div>
          <div className="text-[12px] text-gray mt-1">На диске</div>
        </div>
        <div className="stat-card blue">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${steam ? 'bg-green animate-pulse' : 'bg-gray2'}`} />
            <span className="text-[16px] font-semibold">{steam ? 'Онлайн' : 'Оффлайн'}</span>
          </div>
          <div className="text-[12px] text-gray mt-1">Steam</div>
        </div>
      </div>

      {/* Recent */}
      {recent.length > 0 && (
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Недавно запущенные</h2>
            <span className="text-[12px] text-gray2">{recent.length} из {games.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {recent.map(g => (
              <button key={g.appid} onClick={() => onGame(g.appid)}
                className="card card-hover overflow-hidden text-left cursor-pointer group">
                <div className="relative overflow-hidden">
                  <Cover appid={g.appid} name={g.name} className="w-full group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-2 right-2 badge bg-black/50 text-[10px] text-white/80 backdrop-blur-sm">
                    {ago(g.lastPlayed)}
                  </span>
                </div>
                <div className="px-3.5 py-3">
                  <div className="text-[13px] font-semibold truncate">{g.name}</div>
                  <div className="text-[11px] text-gray2 mt-0.5">{fmt(g.size)}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* All games table */}
      {games.length > 0 && (
        <section>
          <h2 className="text-[16px] font-semibold mb-4">Все игры</h2>
          <div className="card overflow-hidden divide-y divide-bd">
            {games.map(g => (
              <button key={g.appid} onClick={() => onGame(g.appid)}
                className="w-full flex items-center gap-4 px-4 py-2.5 text-left hover:bg-white/[.025] transition-colors cursor-pointer group">
                <div className="w-[52px] h-[24px] rounded overflow-hidden shrink-0">
                  <Cover appid={g.appid} name={g.name} aspect="h-full w-full" className="object-cover" />
                </div>
                <span className="flex-1 min-w-0 text-[13px] font-medium truncate group-hover:text-purple transition-colors">{g.name}</span>
                <span className="text-[12px] text-gray tabular-nums shrink-0">{fmt(g.size)}</span>
                <span className="text-[11px] text-gray2 shrink-0 w-[70px] text-right tabular-nums">{ago(g.lastPlayed)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {games.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-s2 flex items-center justify-center mb-4 text-[28px] text-gray2">?</div>
          <p className="text-[14px] text-gray">Игры не найдены</p>
          <p className="text-[12px] text-gray2 mt-1">Укажите путь к Steam в настройках</p>
        </div>
      )}
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center h-full gap-1.5">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
      ))}
    </div>
  );
}
