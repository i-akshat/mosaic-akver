import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.resolve(process.argv[2] || path.join(root, 'Mosaic-standalone.html'));
let html = await readFile(path.join(root, 'index.html'), 'utf8');
const css = await readFile(path.join(root, 'mosaic.css'), 'utf8');
const styleLink = /<link\b(?=[^>]*\brel=["']stylesheet["'])(?=[^>]*\bhref=["']\.\/mosaic\.css["'])[^>]*>/i;
if (!styleLink.test(html)) throw new Error('Could not find the app stylesheet link in index.html');
html = html.replace(styleLink, () => `<style>\n${css}\n</style>`);

html = html.replace(/<link\b[^>]*\bhref=["'](?:\.\/)?(?:manifest\.webmanifest|icon\.svg|favicon-32\.png|apple-touch-icon\.png)["'][^>]*>/gi, '');
html = html.replace(/<link\b[^>]*\bhref=["']https:\/\/fonts\.googleapis\.com\/[^"']+["'][^>]*>/gi, '');

const scriptTags = [...html.matchAll(/<script\b[^>]*\bsrc=["']\.\/(scripts\/[^"']+\.js)["'][^>]*>\s*<\/script>/gi)];
if (scriptTags.length !== 22) throw new Error(`Expected 22 app scripts, found ${scriptTags.length}`);

const bundledScripts = [];
for (const match of scriptTags.reverse()) {
  const scriptPath = match[1];
  const tag = match[0];
  if (scriptPath === 'scripts/service-worker-register.js') {
    html = html.replace(tag, '');
    continue;
  }
  const script = await readFile(path.join(root, scriptPath), 'utf8');
  if (/<\/style/i.test(script)) throw new Error(`Unsafe style terminator in ${scriptPath}`);
  if (scriptPath !== 'scripts/service-worker-register.js') bundledScripts.push(script);
  const safeScript = script.replace(/<\/script/gi, '<\\/script');
  html = html.replace(tag, () => `<script>\n${safeScript}\n</script>`);
}

if (bundledScripts.length !== 21) throw new Error(`Expected 21 inline runtime scripts, found ${bundledScripts.length}`);
if (!html.includes('id="splash"') || !html.includes('id="enter"')) throw new Error('The manual welcome screen is missing');
if (/<script\b[^>]*\bsrc=/i.test(html) || /<link\b[^>]*\brel=["']stylesheet/i.test(html)) {
  throw new Error('The standalone build still links external app scripts or styles');
}
new Function(bundledScripts.join('\n;\n'));
const cssBlocks = css.replace(/\/\*[\s\S]*?\*\//g, '');
let cssDepth = 0;
for (const character of cssBlocks) {
  if (character === '{') cssDepth++;
  if (character === '}') cssDepth--;
  if (cssDepth < 0) throw new Error('The app stylesheet has an unmatched closing brace');
}
if (cssDepth !== 0) throw new Error('The app stylesheet has unclosed blocks');

/* Verify the FINAL html, not just the source files: every app script must appear exactly once and parse on its own. */
const builtScripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
if (builtScripts.length !== 21) throw new Error(`Built HTML has ${builtScripts.length} inline scripts; expected 21. Script text was probably spliced or duplicated.`);
builtScripts.forEach((code, index) => {
  try { new Function(code); } catch (error) { throw new Error(`Inline script ${index + 1} in the built HTML has a syntax error: ${error.message}`); }
});
for (const script of bundledScripts) {
  const safeScript = script.replace(/<\/script/gi, '<\\/script');
  if (html.split(safeScript).length !== 2) throw new Error('An app script appears more than once, or not at all, in the built HTML.');
}

const bytes = Buffer.byteLength(html, 'utf8');
await writeFile(outputPath, html, 'utf8');
console.log(`Created ${outputPath} (${bytes} bytes; ${Math.ceil(bytes / 1024)} KB)`);
