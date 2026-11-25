import { useState } from 'react';

const URLS = [
  id => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/header.jpg`,
  id => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/capsule_616x353.jpg`,
  id => `https://steamcdn-a.akamaihd.net/steam/apps/${id}/header.jpg`,
];

export default function Cover({ appid, name, className = '', aspect = 'aspect-[460/215]' }) {
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (idx < URLS.length - 1) setIdx(i => i + 1);
    else setFailed(true);
  };

  if (failed) {
    return (
      <div className={`cover-fallback ${aspect} ${className}`}>
        <span>{name?.[0]?.toUpperCase() || '?'}</span>
      </div>
    );
  }

  return (
    <img
      src={URLS[idx](appid)}
      alt={name || ''}
      className={`${aspect} object-cover ${className}`}
      loading="lazy"
      onError={handleError}
    />
  );
}
