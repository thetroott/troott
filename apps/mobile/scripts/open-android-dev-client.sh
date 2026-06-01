#!/usr/bin/env bash
# Opens the Expo dev client with the Metro URL this repo expects (port 8177).
# Use after `pnpm start:mobile` when Android shows ConnectException / stale LAN IP.

set -euo pipefail

METRO_PORT="${EXPO_METRO_PORT:-8177}"
APP_SCHEME="${EXPO_DEV_SCHEME:-exp+troott}"
PACKAGE="${ANDROID_PACKAGE:-com.troott.app}"

# Prefer localhost via adb reverse (emulator + USB-connected devices).
DEV_SERVER_URL="${EXPO_DEV_SERVER_URL:-http://127.0.0.1:${METRO_PORT}}"

if ! command -v adb >/dev/null 2>&1; then
    echo "adb not found. Install Android platform-tools or use Expo Go / scan Metro QR."
    exit 1
fi

if ! adb get-state >/dev/null 2>&1; then
    echo "No Android device/emulator connected."
    exit 1
fi

echo "Setting adb reverse tcp:${METRO_PORT} tcp:${METRO_PORT}"
adb reverse "tcp:${METRO_PORT}" "tcp:${METRO_PORT}" || true

ENCODED_URL="$(python3 -c "import urllib.parse; print(urllib.parse.quote('${DEV_SERVER_URL}', safe=''))")"
TARGET_URL="${APP_SCHEME}://expo-development-client/?url=${ENCODED_URL}"

echo "Opening dev client URL"
echo "URL: ${TARGET_URL}"

adb shell am force-stop "${PACKAGE}" >/dev/null 2>&1 || true
adb shell am start -a android.intent.action.VIEW -d "${TARGET_URL}" "${PACKAGE}" >/dev/null

echo "Done. If the app still fails, clear app storage or set EXPO_DEV_SERVER_URL to your current LAN IP (see Metro QR)."
