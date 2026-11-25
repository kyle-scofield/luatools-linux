# LuaTools Linux

Native Linux alternative to [LuaTools](https://lua.tools) — a Steam library manager with game details, manifest viewer, and quick actions.

![screenshot](https://raw.githubusercontent.com/CallWhiz56/luatools-linux/main/.github/screenshot.png)

## Features

- Steam library auto-detection
- Game details from Steam Store API (cached 7 days)
- Launch games, open install folders
- Manifest viewer, file browser
- Proton version listing
- Dark purple theme

## Stack

- **Backend**: Node.js + Express
- **Frontend**: React 19 + Vite 6 + Tailwind CSS 4 + Framer Motion
- **Data**: Steam appmanifest ACF parsing, Steam Store API

## Install

```bash
git clone https://github.com/CallWhiz56/luatools-linux.git
cd luatools-linux
npm install
cd webapp && npm install && cd ..
npm run dev
```

Open `http://localhost:5173`

## Build

```bash
npm run build
```

Serves the built frontend from `webapp/dist/` via Express on port 3002.

## Requirements

- Node.js 18+
- Steam installed (auto-detected at `~/.local/share/Steam`)

## License

MIT
