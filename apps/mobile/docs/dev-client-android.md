# Development client: Android and Metro

## Metro port

- Use a **single** Metro instance for the app you are debugging. Two Troott checkouts (e.g. one on **8081**, another on **8082**) make it easy to open the dev client against the wrong bundler and worsen Dev Launcher issues.
- If port **8081** is already taken, Expo will offer another port; the **`exp+` URL must match** the host and port of the Metro you started for **this** repo.
- This app’s scripts default to **8177** (`pnpm --filter @troott/mobile run start` / `start:clear`). Prefer **`pnpm start:mobile`** or **`pnpm start:mobile:clear`** from the monorepo root for a clean cache.
- **Command spelling:** use a space before the script args separator: `pnpm run expo:mobile -- start` (not `expo:mobile--`, which is a different / invalid script name).
- If another Metro is bound to **8081** (e.g. another clone), either **stop that process** or always start this app on **8177** so the dev client’s embedded URL stays aligned with your workflow.

## Android: `Failed to connect to /192.168.x.x` (ConnectException)

The dev build **remembers the last Metro URL** (LAN IP + port). If your machine’s IP changed (Wi‑Fi reconnect, VPN, different network), Android keeps calling the old address (e.g. `192.168.100.11`) while Metro is on a new one (e.g. `192.168.100.114:8177`).

**Fix (pick one):**

1. **Recommended — adb reverse + localhost** (emulator or USB device):

    ```bash
    pnpm start:mobile          # terminal 1 — keep running
    pnpm --filter @troott/mobile run android:open-dev-client   # terminal 2
    ```

    This runs `adb reverse tcp:8177 tcp:8177` and opens  
    `exp+troott://expo-development-client/?url=http://127.0.0.1:8177`.

2. **Dev Launcher UI** — tap **Reload**, or open the dev menu and enter the URL from the Metro QR (`http://<current-ip>:8177`).

3. **Clear stale URL** — Android Settings → Apps → Troott → Storage → **Clear storage**, then scan the Metro QR again.

4. **Physical device, no USB** — set the URL to match Metro’s QR host:

    ```bash
    EXPO_DEV_SERVER_URL=http://192.168.100.114:8177 pnpm --filter @troott/mobile run android:open-dev-client
    ```

5. **Unreliable LAN** — `pnpm --filter @troott/mobile exec expo start --port 8177 --tunnel` and use the tunnel URL in the dev client.

## Android: `App react context shouldn't be created before`

This is a **native** `expo-dev-launcher` error (not a JavaScript bundle failure). It is a known class of issues with development builds; see [expo/expo#35385](https://github.com/expo/expo/issues/35385).

Try in order:

1. **Force-quit** the Android app and **cold start** it once.
2. Avoid opening **iOS and Android** against the same Metro session in quick succession while the first client is still initializing.
3. **Clear app data** for the dev client on the emulator, or reinstall the dev build.
4. Keep **`expo`**, **`expo-dev-client`**, and **`expo-dev-launcher`** aligned with your SDK; upgrade if you hit a known fixed version.

5. If the crash persists after a **hot reload** or JS error: **force-stop** the app on the emulator (`adb shell am force-stop <package>` or the OS app switcher), then open it again from the launcher.

6. **Rebuild the dev client** if native modules or `expo-dev-client` versions changed:

    ```bash
    pnpm --filter @troott/mobile run android
    ```

    (Or your usual `prebuild` + run workflow.)

## MMKV / remote debugging

If you see MMKV falling back to in-memory storage, disable **remote JS debugging** and use on-device debugging (e.g. React Native DevTools) so JSI is available.
