import { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function Settings({ config, onSave }) {
  const [steamPath, setSteamPath] = useState(config?.steamPath || '');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    const cfg = { ...config, steamPath: steamPath || null };
    await api('/config', { method: 'POST', body: cfg });
    onSave(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-10 max-w-[600px]">
      <h1 className="text-[24px] font-bold mb-6">Settings</h1>

      <div className="card mb-5">
        <div className="px-5 py-4 border-b border-bd">
          <div className="text-[14px] font-semibold">Steam path</div>
        </div>
        <div className="px-5 py-4">
          <input value={steamPath} onChange={e => setSteamPath(e.target.value)}
            placeholder="~/.local/share/Steam" className="input mb-3" />
          <div className="flex items-center gap-2 mb-4">
            <span className={`w-2 h-2 rounded-full ${config?.steamFound ? 'bg-green' : 'bg-red'}`} />
            <span className="text-[12px] text-gray2">
              {config?.steamFound ? 'Steam detected' : 'Steam not found'}
              {config?.steamPath && ` · ${config.steamPath}`}
            </span>
          </div>
          <button onClick={save} className="btn btn-primary text-[13px]">
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-bd">
          <div className="text-[14px] font-semibold">About</div>
        </div>
        <div className="divide-y divide-bd">
          {[
            ['Version', '1.0.0'],
            ['Platform', 'Linux'],
            ['Engine', 'Node.js + React'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between px-5 py-3 text-[13px]">
              <span className="text-gray2">{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
