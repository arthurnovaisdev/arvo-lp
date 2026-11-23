import { mkdir, cp, writeFile } from 'node:fs/promises';
import { renderManifesto } from './manifesto.mjs';

await mkdir('dist/assets/brand', { recursive: true });
await cp('assets/brand/logo.jpeg', 'dist/assets/brand/logo.jpeg');
await cp('assets/manifesto.css', 'dist/assets/manifesto.css');
await cp('assets/manifesto.js', 'dist/assets/manifesto.js');
await writeFile('dist/index.html', renderManifesto().replaceAll('../assets/', 'assets/'));
console.log('Built ARVO landing page in dist/.');
