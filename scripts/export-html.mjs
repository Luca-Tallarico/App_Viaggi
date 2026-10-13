import { build } from 'esbuild';
import { zipSync, strToU8 } from 'fflate';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { destinations } from '../src/data.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const cache = path.join(root, '.export-cache');
const output = path.join(root, 'download');
const run = promisify(execFile);
await mkdir(cache, { recursive: true });
await mkdir(output, { recursive: true });

const byUrl = {}, photos = {};
for (const destination of destinations) {
  const url = destination.image;
  if (!url || byUrl[url]) continue;
  const key = createHash('sha256').update(url).digest('hex');
  const file = path.join(cache, `${key}.jpg`);
  try { await access(file); }
  catch {
    // Reuse previously downloaded photos in the onboarding instance when present.
    const name = new URL(url).hostname === 'images.unsplash.com' ? `${new URL(url).pathname.slice(1)}.jpg` : 'lisbon.jpg';
    try { await writeFile(file, await readFile(path.join('/workspace/duepassi-assets', name))); }
    catch {
      const { stdout } = await run('curl', ['--fail', '--silent', '--show-error', '--location', '--max-time', '30', url], { encoding: 'buffer', maxBuffer: 8_000_000 });
      await writeFile(file, stdout);
    }
  }
  const buffer = await readFile(file);
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) throw new Error(`La fotografia di ${destination.name} non è un JPEG valido.`);
  byUrl[url] = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  if (new URL(url).hostname === 'images.unsplash.com') photos[new URL(url).pathname.slice(1)] = byUrl[url];
}

const result = await build({
  absWorkingDir: root, entryPoints: ['src/main.jsx'], bundle: true, minify: true, write: false,
  jsx: 'automatic', format: 'iife', platform: 'browser',
  define: { 'process.env.NODE_ENV': '"production"' },
  loader: { '.woff2': 'dataurl', '.woff': 'dataurl', '.png': 'dataurl', '.svg': 'dataurl' },
  outdir: path.join(cache, 'build'),
  plugins: [{
    name: 'embedded-destination-photos',
    setup(builder) {
      builder.onLoad({ filter: /\/src\/data\.js$/ }, async args => {
        let source = await readFile(args.path, 'utf8');
        source = source.replace(/^const photo = .*;$/m, `const embeddedPhotos=${JSON.stringify(photos)};\nconst photo=(id,width=1200)=>embeddedPhotos[id] || \`https://images.unsplash.com/\${id}?auto=format&fit=crop&w=\${width}&q=85\`;`);
        for (const [url, data] of Object.entries(byUrl)) {
          source = source.replaceAll(JSON.stringify(url), JSON.stringify(data)).replaceAll(`'${url}'`, JSON.stringify(data));
        }
        return { contents: source, loader: 'js' };
      });
    },
  }],
});
const js = result.outputFiles.find(file => file.path.endsWith('.js')).text.replace(/<\/script/gi, '<\\/script');
const css = result.outputFiles.find(file => file.path.endsWith('.css')).text.replace(/<\/style/gi, '<\\/style');
const html = `<!doctype html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f7f6f2"><title>Duepassi — Esplora e organizza i viaggi</title><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`;
const instructions = `DUEPASSI\n\n1. Estrai lo ZIP.\n2. Apri Duepassi.html con Chrome, Edge, Firefox o Safari.\n\nLa home mostra il globo: trascina per ruotare e clicca le località. Usa + e - per lo zoom. Seleziona Aggiungi ai viaggi per salvare una meta. Date e note sono facoltative.\n\nFoto, font e geografia del globo sono inclusi e funzionano offline. Internet serve per ricerca mondiale, mappa dettagliata, meteo, festività e collegamenti esterni.\n\nI viaggi sono salvati nel browser. Per aggiornare questa copia, sostituisci il vecchio Duepassi.html nella stessa cartella. Non è inclusa la sincronizzazione tra dispositivi.\n\nGeografia: Natural Earth, pubblico dominio, tramite World Atlas.\nFoto Lisbona: Ana Correia 28, CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:Baixa_De_Lisboa.jpg\nAltre fotografie: Unsplash.\n`;
await writeFile(path.join(output, 'Duepassi.html'), html);
const fontLicenses=await Promise.all(['dm-sans','manrope','playfair-display'].map(async font=>`${font.toUpperCase()}\n\n${await readFile(path.join(root,'node_modules','@fontsource',font,'LICENSE'),'utf8')}`));
await writeFile(path.join(output, 'Duepassi.zip'), zipSync({ 'Duepassi.html': strToU8(html), 'LEGGIMI.txt': strToU8(instructions), 'LICENZE_FONT.txt':strToU8(fontLicenses.join('\n\n--------------------\n\n')) }, { level: 6 }));
console.log('Creati download/Duepassi.html e download/Duepassi.zip con globo, foto e font incorporati.');
