// Copies the web game (repo root) into www/ for Capacitor. The service worker is left out: the app ships its files locally.
import { cpSync, rmSync, mkdirSync } from 'node:fs';
rmSync('www', { recursive: true, force: true }); mkdirSync('www');
for (const f of ['index.html', 'fonts.css', 'manifest.webmanifest']) cpSync(f, 'www/' + f);
for (const d of ['fonts', 'icons', 'img']) cpSync(d, 'www/' + d, { recursive: true });
console.log('www/ ready');
