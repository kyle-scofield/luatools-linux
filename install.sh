#!/bin/sh
# LuaTools Linux installer
#   curl -fsSL https://raw.githubusercontent.com/kyle-scofield/luatools-linux/main/install.sh | sh
# Running it again updates LuaTools.
set -e

REPO="${LUATOOLS_REPO:-kyle-scofield/luatools-linux}"
DIR="$HOME/.local/share/luatools"
BIN="$HOME/.local/bin/luatools"

if [ -t 1 ] && [ -z "$NO_COLOR" ]; then
  E=$(printf '\033')
  C() { printf '%s[1;38;2;%sm' "$E" "$1"; }
  R="$E[0m"; D="$E[2m"; G="$E[32m"; Y="$E[33m"; RED="$E[31m"; B="$E[1m"
  P="$E[1;38;2;124;92;252m"
else
  C() { :; }
  R=; D=; G=; Y=; RED=; B=; P=
fi

say() { printf '%s\n' "$*"; }
die() { printf '%s✖%s Ошибка: %s\n' "$RED" "$R" "$*" >&2; exit 1; }

logo() {
  i=0
  while IFS= read -r line; do
    p1=$((124 - i * 4)); p2=$((92 - i * 3)); p3=$((252 - i * 6))
    w=$((255 - i * 15))
    printf '  %s%s%s\n' "$(C "$p1;$p2;$p3")" "$line" "$R"
    i=$((i + 1))
  done <<'LOGO'
██╗     ██╗   ██╗ █████╗ ████████╗ ██████╗  ██████╗ ██╗     ███████╗
██║     ██║   ██║██╔══██╗╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██╔════╝
██║     ██║   ██║███████║   ██║   ██║   ██║██║   ██║██║     ███████╗
██║     ██║   ██║██╔══██║   ██║   ██║   ██║██║   ██║██║     ╚════██║
███████╗╚██████╔╝██║  ██║   ██║   ╚██████╔╝╚██████╔╝███████╗███████║
╚══════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
LOGO
  printf '  %sSteam library manager for Linux · установка%s\n\n' "$D" "$R"
}

say ""
if [ "${COLUMNS:-80}" -ge 70 ] 2>/dev/null; then logo; else say "  ${P}LuaTools${R} Linux"; say ""; fi

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
  die "Node.js не найден. Установите: https://nodejs.org или через пакетный менеджер"
fi

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
[ "$NODE_VER" -ge 18 ] 2>/dev/null || die "Нужен Node.js 18+, сейчас: $(node -v)"
say "  ${G}✔${R} Node.js $(node -v)"

# Download / update
if [ -d "$DIR/.git" ]; then
  say "  Обновление LuaTools…"
  cd "$DIR"
  git pull --ff-only origin main 2>/dev/null || git pull origin main
else
  say "  Загрузка LuaTools…"
  mkdir -p "$(dirname "$DIR")"
  git clone --depth 1 "https://github.com/$REPO.git" "$DIR"
  cd "$DIR"
fi
say "  ${G}✔${R} Исходный код"

# Install deps
say "  Установка зависимостей…"
npm install --omit=dev --silent 2>/dev/null
cd webapp && npm install --omit=dev --silent 2>/dev/null && cd ..
say "  ${G}✔${R} Зависимости"

# Build frontend
say "  Сборка фронтенда…"
cd webapp && npx vite build --silent 2>/dev/null && cd ..
say "  ${G}✔${R} Фронтенд собран"

# Create launcher
mkdir -p "$(dirname "$BIN")"
cat > "$BIN" <<'LAUNCHER'
#!/bin/sh
DIR="$HOME/.local/share/luatools"
PORT="${LUATOOLS_PORT:-3002}"

cleanup() { [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null; }
trap cleanup EXIT INT TERM

cd "$DIR"
PORT=$PORT node server/index.js &
SERVER_PID=$!

sleep 1

# Open as app window (no browser chrome)
if command -v electron >/dev/null 2>&1; then
  electron "$DIR/webapp/dist" 2>/dev/null
elif command -v chromium >/dev/null 2>&1; then
  chromium --app="http://localhost:$PORT" --class=LuaTools 2>/dev/null
elif command -v google-chrome >/dev/null 2>&1; then
  google-chrome --app="http://localhost:$PORT" --class=LuaTools 2>/dev/null
elif command -v firefox >/dev/null 2>&1; then
  firefox --new-window "http://localhost:$PORT" 2>/dev/null
else
  echo "Открой http://localhost:$PORT в браузере"
  wait "$SERVER_PID"
fi

wait
LAUNCHER
chmod +x "$BIN"
say "  ${G}✔${R} Команда: $BIN"

# Desktop entry
DESKTOP="$HOME/.local/share/applications/luatools.desktop"
mkdir -p "$(dirname "$DESKTOP")"
cat > "$DESKTOP" <<EOF
[Desktop Entry]
Name=LuaTools
Comment=Steam library manager for Linux
Exec=$BIN
Icon=$DIR/.github/icon.svg
Terminal=false
Type=Application
Categories=Game;Utility;
StartupWMClass=LuaTools
EOF
say "  ${G}✔${R} Ярлык в меню приложений"

say ""
say "  ${G}✔${R} LuaTools установлен!"
say ""
say "  Запуск:    ${G}luatools${R}"
say "  Обновить:  curl -fsSL https://raw.githubusercontent.com/$REPO/main/install.sh | sh"
say ""

case ":$PATH:" in
  *":$(dirname "$BIN"):"*) ;;
  *) say "  ${Y}!${R} Папки $(dirname "$BIN") нет в PATH. Добавьте или запускайте: $BIN"; say "" ;;
esac
