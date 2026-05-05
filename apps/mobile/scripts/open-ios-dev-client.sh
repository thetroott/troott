#!/usr/bin/env bash

set -euo pipefail

DEVICE_UDID="${IOS_DEVICE_UDID:-booted}"
APP_SCHEME="${EXPO_DEV_SCHEME:-exp+troott}"
DEV_SERVER_URL="${EXPO_DEV_SERVER_URL:-http://127.0.0.1:8177}"
MAX_RETRIES="${OPENURL_MAX_RETRIES:-5}"
RETRY_DELAY_SECS="${OPENURL_RETRY_DELAY_SECS:-2}"

TARGET_URL="${APP_SCHEME}://expo-development-client/?url=${DEV_SERVER_URL}"

echo "Opening dev client URL on simulator (${DEVICE_UDID})"
echo "URL: ${TARGET_URL}"

attempt=1
while [ "${attempt}" -le "${MAX_RETRIES}" ]; do
    if xcrun simctl openurl "${DEVICE_UDID}" "${TARGET_URL}" >/dev/null 2>&1; then
        echo "Opened dev client URL successfully."
        exit 0
    fi

    if [ "${attempt}" -lt "${MAX_RETRIES}" ]; then
        echo "OpenURL failed (attempt ${attempt}/${MAX_RETRIES}); retrying in ${RETRY_DELAY_SECS}s..."
        sleep "${RETRY_DELAY_SECS}"
    fi
    attempt=$((attempt + 1))
done

echo "OpenURL retry exhausted; relaunching app then retrying once..."

if [ "${DEVICE_UDID}" = "booted" ]; then
    xcrun simctl terminate booted com.dmlscript.troottclient >/dev/null 2>&1 || true
    xcrun simctl launch booted com.dmlscript.troottclient >/dev/null 2>&1 || true
else
    xcrun simctl terminate "${DEVICE_UDID}" com.dmlscript.troottclient >/dev/null 2>&1 || true
    xcrun simctl launch "${DEVICE_UDID}" com.dmlscript.troottclient >/dev/null 2>&1 || true
fi

sleep "${RETRY_DELAY_SECS}"

xcrun simctl openurl "${DEVICE_UDID}" "${TARGET_URL}"
echo "Opened dev client URL after relaunch fallback."
