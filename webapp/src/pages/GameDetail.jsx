import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Cover from '../components/Cover.jsx';

function fmt(bytes) {
  if (bytes > 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
  if (bytes > 1e6) return (bytes / 1e6).toFixed(0) + ' MB';
  return '< 1 MB';
}

export default function GameDetail({ appid, onBack }) {
  const [info, setInfo] = useState(null);
  const [manifest, setManifest] = useState(null);
  const [files, setFiles] = useState(null);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    api(`/games/${appid}`).then(setInfo).catch(() => {});
    api(`/games/${appid}/manifest`).then(setManifest).catch(() => {});
  }, [appid]);

  const loadFiles = () => {
    if (!files) api(`/games/${appid}/files`).then(setFiles).catch(() => setFiles({ files: [] }));
    setTab('files');
  };

  return (
    <div className="p-10 max-w-[900px]">
      <button onClick={onBack}
        className="flex items-center gap-2 text-[13px] text-gray hover:text-fg mb-6 transition-colors cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back
      </button>

      {/* Header */}
      <div className="flex gap-5 mb-6">
        <div className="w-[260px] shrink-0 rounded-lg overflow-hidden">
          <Cover appid={appid} name={info?.name} aspect="aspect-[460/215]" className="w-full" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[22px] font-bold">{info?.name || `App ${appid}`}</h1>
          {info?.developers && <div className="text-[13px] text-gray mt-1">{info.developers.join(', ')}</div>}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {info?.genres?.map(g => (
              <span key={g.id} className="px-2 py-0.5 rounded text-[11px] bg-purple/15 text-purpleLight">{g.description}</span>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => api(`/games/${appid}/launch`, { method: 'POST' })}
              className="btn btn-primary text-[13px]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
              Launch
            </button>
            <button onClick={() => api(`/games/${appid}/open-folder`, { method: 'POST' })}
              className="btn btn-ghost text-[13px]">Open folder</button>
            <button onClick={() => window.open(`https://store.steampowered.com/app/${appid}`, '_blank')}
              className="btn btn-ghost text-[13px]">Store</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 mb-5 border-b border-bd">
        {[
          { id: 'info', label: 'Info', action: () => setTab('info') },
          { id: 'manifest', label: 'Manifest', action: () => setTab('manifest') },
          { id: 'files', label: 'Files', action: loadFiles },
        ].map(t => (
          <button key={t.id} onClick={t.action}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors cursor-pointer
              ${tab === t.id ? 'text-purple border-purple' : 'text-gray2 border-transparent hover:text-fg'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && info && (
        <div className="card divide-y divide-bd">
          <Row k="App ID" v={appid} />
          <Row k="Developer" v={info.developers?.join(', ')} />
          <Row k="Publisher" v={info.publishers?.join(', ')} />
          <Row k="Release" v={info.release_date?.date} />
          {info.metacritic && <Row k="Metacritic" v={info.metacritic.score} />}
          {info.short_description && <Row k="About" v={info.short_description} />}
        </div>
      )}
      {tab === 'info' && !info && <div className="text-gray2 text-[14px]">Loading...</div>}

      {tab === 'manifest' && (
        <div className="card p-5">
          <pre className="text-[12px] text-ink font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
            {manifest || 'Loading...'}
          </pre>
        </div>
      )}

      {tab === 'files' && (
        <div className="card p-5">
          {files?.dir && <div className="text-[11px] text-gray2 font-mono mb-3 pb-3 border-b border-bd">{files.dir}</div>}
          <div className="max-h-[500px] overflow-y-auto space-y-px">
            {files?.files?.map((f, i) => (
              <div key={i} className="text-[12px] text-ink font-mono py-1 px-2 rounded hover:bg-white/[.03]">{f}</div>
            )) || <div className="text-gray2 text-[13px]">Loading...</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }) {
  if (!v) return null;
  return (
    <div className="flex justify-between items-baseline gap-6 px-5 py-3">
      <span className="text-[13px] text-gray2 shrink-0">{k}</span>
      <span className="text-[13px] text-fg text-right">{v}</span>
    </div>
  );
}
