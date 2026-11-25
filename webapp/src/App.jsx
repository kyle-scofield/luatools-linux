import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from './api.js';
import { HomeIcon, LibraryIcon, SettingsIcon } from './components/Icons.jsx';
import Home from './pages/Home.jsx';
import Library from './pages/Library.jsx';
import GameDetail from './pages/GameDetail.jsx';
import Settings from './pages/Settings.jsx';

const NAV = [
  { id: 'home', label: 'Главная', Icon: HomeIcon },
  { id: 'library', label: 'Библиотека', Icon: LibraryIcon },
  { id: 'settings', label: 'Настройки', Icon: SettingsIcon },
];

const fade = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.15 } };

export default function App() {
  const [tab, setTab] = useState('home');
  const [gameId, setGameId] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => { api('/config').then(setConfig).catch(() => {}); }, []);

  const go = id => { setTab(id); setGameId(null); };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-[200px] shrink-0 bg-s1 border-r border-bd flex flex-col">
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple to-purpleLight flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>
          </div>
          <div>
            <div className="text-[14px] font-bold tracking-tight">LuaTools</div>
            <div className="text-[10px] text-gray2 font-medium">Linux · v1.0.0</div>
          </div>
        </div>

        <nav className="flex-1 px-2.5 space-y-0.5">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => go(id)}
              className={`sidebar-link w-full ${tab === id && !gameId ? 'active' : ''}`}>
              <span className="icon"><Icon /></span>
              {label}
            </button>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-bd">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${config?.steamFound ? 'bg-green' : 'bg-red'}`} />
            <span className="text-[11px] text-gray2">Steam {config?.steamFound ? 'подключён' : 'не найден'}</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-bg">
        <AnimatePresence mode="wait">
          {gameId ? (
            <motion.div key={`game-${gameId}`} {...fade}>
              <GameDetail appid={gameId} onBack={() => setGameId(null)} />
            </motion.div>
          ) : (
            <motion.div key={tab} {...fade}>
              {tab === 'home' && <Home onGame={setGameId} />}
              {tab === 'library' && <Library onGame={setGameId} />}
              {tab === 'settings' && <Settings config={config} onSave={setConfig} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
