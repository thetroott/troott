#!/usr/bin/env node
/**
 * Downloads full-topic-card PNGs (@2x) from the Troott Figma file.
 *
 * Requires: FIGMA_ACCESS_TOKEN (Personal Access Token from Figma account settings)
 *
 * Usage (from repo root or apps/mobile):
 *   FIGMA_ACCESS_TOKEN=... node apps/mobile/scripts/fetch-browse-topic-cards.mjs
 *
 * Re-exports `4995:35778` frames into `assets/images/topics/cards`.
 *
 * @see https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4995-35778
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../assets/images/topics/cards');
const FILE_KEY = '9lFM6TncipSv0pNVGBWZwA';

/** Figma frame node id -> filename (slug) */
const NODES = [
    ['4995:41277', 'healing'],
    ['4995:41282', 'prayer'],
    ['4995:41266', 'faith'],
    ['4995:41272', 'hope'],
    ['4995:41317', 'marriage'],
    ['4995:41294', 'forgiveness'],
    ['4995:41237', 'parenting'],
    ['4995:41247', 'breakthrough'],
    ['4996:41354', 'worship'],
    ['4995:41228', 'obedience'],
    ['5176:21594', 'grace'],
    ['5176:21612', 'finances'],
    ['5176:21619', 'temptation'],
    ['5176:21626', 'fear'],
];

const token = process.env.FIGMA_ACCESS_TOKEN;
if (!token) {
    console.error(
        'Set FIGMA_ACCESS_TOKEN (see https://www.figma.com/developers/api#access-tokens)',
    );
    process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const ids = NODES.map(([id]) => id).join(',');
const url = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=png&scale=2`;

const res = await fetch(url, { headers: { 'X-Figma-Token': token } });
if (!res.ok) {
    console.error(await res.text());
    process.exit(1);
}

const body = await res.json();
if (body.err) {
    console.error(body);
    process.exit(1);
}

const images = body.images ?? {};
for (const [nodeId, slug] of NODES) {
    const imgUrl = images[nodeId];
    if (!imgUrl) {
        console.warn('No URL for', nodeId, slug);
        continue;
    }
    const png = await fetch(imgUrl);
    if (!png.ok) {
        console.warn('Download failed', slug, png.status);
        continue;
    }
    const buf = Buffer.from(await png.arrayBuffer());
    const out = path.join(OUT_DIR, `${slug}-card.png`);
    fs.writeFileSync(out, buf);
    console.log('Wrote', out, buf.length, 'bytes');
}

console.log(
    'Done. Cards exported to assets/images/topics/cards. Validate browse topics in app.',
);
