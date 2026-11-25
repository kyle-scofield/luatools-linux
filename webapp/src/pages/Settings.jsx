import { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function Settings({ config, onSave }) {
  const [steamPath, setSteamPath] = useState(config?.steamPath || '');
  const [saved, setSaved] = useState(false);
  const [proton, setProton] = useState(null);

  useEffect(() => { api('/proton').then(setProton).catch(() => {}); }, []);

  const save = async () => {
    const cfg = { ...config, steamPath: steamPath || null };
    await api('/config', { method: 'POST', body: cfg });
    onSave(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const restartSteam = () => {
    if (confirm('Перезапустить Steam?')) api('/steam/restart', { method: 'POST' });
  };

  return (
    <div className="p-8 max-w-[640px]">
      <div className="mb-8">
        <h1 className="text-[22px] font-bold">Настройки</h1>
        <p className="text-[13px] text-gray mt-1">Конфигурация LuaTools</p>
      </div>

      <div className="space-y-5">
        {/* Steam */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-blue/10 flex items-center justify-center text-blue text-[12px]">S</div>
            <h3 className="text-[14px] font-semibold">Steam</h3>
          </div>

          <label className="block mb-4">
            <span className="text-[12px] text-gray2 font-medium block mb-1.5">Путь к Steam</span>
            <input value={steamPath} onChange={e => setSteamPath(e.target.value)}
              placeholder="~/.local/share/Steam" className="input" />
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${config?.steamFound ? 'bg-green' : 'bg-red'}`} />
              <span className="text-[11px] text-gray2">
                {config?.steamFound ? 'Обнаружен' : 'Не найден'}
                {config?.steamPath && ` · ${config.steamPath}`}
              </span>
            </div>
          </label>

          <div className="flex gap-2.5">
            <button onClick={save} className="btn btn-primary text-[12px]">
              {saved ? '✓ Сохранено' : 'Сохранить'}
            </button>
            <button onClick={restartSteam} className="btn btn-ghost text-[12px]">
              Перезапустить Steam
            </button>
          </div>
        </div>

        {/* Proton */}
        {proton && proton.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-purple/10 flex items-center justify-center text-purple text-[12px]">P</div>
              <h3 className="text-[14px] font-semibold">Proton</h3>
            </div>
            <div className="space-y-1.5">
              {proton.map(p => (
                <div key={p} className="text-[12px] text-ink py-1 px-2.5 rounded bg-s2">{p}</div>
              ))}
            </div>
          </div>
        )}

        {/* About */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-green/10 flex items-center justify-center text-green text-[12px]">i</div>
            <h3 className="text-[14px] font-semibold">О программе</h3>
          </div>
          <div className="space-y-2">
            {[
              ['Версия', '1.0.0'],
              ['Платформа', 'Linux'],
              ['Движок', 'Node.js + React'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-[12px]">
                <span className="text-gray2">{k}</span>
                <span className="text-fg font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
