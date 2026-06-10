import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, '..');
const envPath = resolve(webRoot, '.env');

function loadDotEnv(filePath) {
    const merged = { ...process.env };
    try {
        const content = readFileSync(filePath, 'utf8');
        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eq = trimmed.indexOf('=');
            if (eq === -1) continue;
            const key = trimmed.slice(0, eq).trim();
            let value = trimmed.slice(eq + 1).trim();
            if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            }
            if (!(key in process.env)) {
                merged[key] = value;
            }
        }
    } catch {
        // .env optional when Docker passes ARGs as process.env
    }
    return merged;
}

function requireEnv(env, key) {
    const value = env[key];
    if (!value) {
        throw new Error(
            `[generate-get-troott-html] Missing ${key}. Set it in apps/web/.env or the build environment.`,
        );
    }
    return value;
}

const env = loadDotEnv(envPath);

const playStore = requireEnv(env, 'VITE_TROOTT_PLAY_STORE_URL');
const appStore = requireEnv(env, 'VITE_TROOTT_APP_STORE_URL');
const webAppUrl = requireEnv(env, 'VITE_TROOTT_WEB_APP_URL');
const dmgUrl = env.VITE_TROOTT_DMG_URL?.trim() || webAppUrl;
const exeUrl = env.VITE_TROOTT_EXE_URL?.trim() || webAppUrl;

const html = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Get Troott</title>
        <meta name="robots" content="noindex" />
        <script>
            (function () {
                var TARGETS = {
                    android: ${JSON.stringify(playStore)},
                    ios: ${JSON.stringify(appStore)},
                    web: ${JSON.stringify(webAppUrl)},
                    dmg: ${JSON.stringify(dmgUrl)},
                    exe: ${JSON.stringify(exeUrl)},
                };

                function detectPackage(ua) {
                    if (/Android/i.test(ua)) return 'android';
                    if (/iPhone|iPod|iPad/i.test(ua)) return 'ios';
                    if (/Windows/i.test(ua)) return 'exe';
                    if (/Macintosh|Mac OS X/i.test(ua)) return 'dmg';
                    return 'web';
                }

                var params = new URLSearchParams(window.location.search);
                var pkg = params.get('package');
                var ua = navigator.userAgent || '';
                var key = pkg && TARGETS[pkg] ? pkg : detectPackage(ua);
                var target = TARGETS[key] || TARGETS.web;
                window.location.replace(target);
            })();
        </script>
    </head>
    <body>
        <p>Redirecting to Troott…</p>
        <p>
            <a href=${JSON.stringify(webAppUrl)}>Continue to Troott web app</a>
        </p>
    </body>
</html>
`;

const outPath = resolve(webRoot, 'public/get-troott.html');
writeFileSync(outPath, html, 'utf8');
console.log(`[generate-get-troott-html] Wrote ${outPath}`);
