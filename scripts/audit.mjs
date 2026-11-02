#!/usr/bin/env node
// Checks that every dliu.com site in sites.json uses the shared look, on the live pages:
//   - loads https://files.dliu.com/dliu.com/ui/v1/dl.css (and dl-docs.css on docs pages)
//   - uses the DL icon as favicon
//   - has the shared header (dl-header with dl-logo and dl-brand) in its HTML,
//     unless the site sets "header": "script" (header drawn by the page's script)
//   - its Content-Security-Policy, if any, allows the shared stylesheet folder and the DL icon
//
//   node scripts/audit.mjs [site …]     exit code 1 when any check fails

import { readFile } from 'node:fs/promises';

const BASE = 'https://files.dliu.com/dliu.com/';
const CSS = `${BASE}ui/v1/dl.css`;
const DOCS_CSS = `${BASE}ui/v1/dl-docs.css`;
const ICON = `${BASE}favicon.png`;

const sites = JSON.parse(await readFile(new URL('../sites.json', import.meta.url), 'utf8'));
const only = process.argv.slice(2);

// Does this CSP allow loading `url` for `directive` on a page at `pageUrl`? (CSP level 3 source matching, simplified.)
function cspAllows(csp, directive, url, pageUrl) {
  if (!csp) return true;
  const directives = Object.fromEntries(csp.split(';').map((part) => part.trim().split(/\s+/)).filter((p) => p[0]).map(([name, ...values]) => [name.toLowerCase(), values]));
  const sources = directives[directive] || directives['default-src'];
  if (!sources) return true;
  const target = new URL(url);
  return sources.some((source) => {
    if (source === '*' || source === 'https:') return true;
    if (source === "'self'") return new URL(pageUrl).origin === target.origin;
    if (!/^https:\/\//.test(source)) return false;
    const allowed = new URL(source);
    if (allowed.host !== target.host) return false;
    if (allowed.pathname === '/' ) return true;
    return allowed.pathname.endsWith('/') ? target.pathname.startsWith(allowed.pathname) : target.pathname === allowed.pathname;
  });
}

const linkHrefs = (html, rel) => [...html.matchAll(/<link\b[^>]*>/gi)]
  .map(([tag]) => tag)
  .filter((tag) => new RegExp(`rel=["']?[^"'>]*\\b${rel}\\b`, 'i').test(tag))
  .map((tag) => (tag.match(/href=["']?([^"'\s>]+)/i) || [])[1]);

async function checkPage(site, url, isDocs) {
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'dliu-shared-ui-audit' } });
  const html = await response.text();
  const csp = response.headers.get('content-security-policy');
  const styles = linkHrefs(html, 'stylesheet');
  const failures = [];
  if (!response.ok) failures.push(`HTTP ${response.status}`);
  const cssIndex = styles.indexOf(CSS);
  if (cssIndex === -1) failures.push('dl.css not loaded');
  else if (styles.slice(0, cssIndex).some((href) => !href.startsWith(BASE))) failures.push('dl.css not loaded first');
  if (isDocs && !styles.includes(DOCS_CSS)) failures.push('dl-docs.css not loaded');
  if (!linkHrefs(html, 'icon').includes(ICON)) failures.push('favicon is not the DL icon');
  if (site.header !== 'script' && !(/class=["']dl-header["']/.test(html) && /class=["']dl-logo["']/.test(html) && /class=["']dl-brand["']/.test(html))) {
    failures.push('no shared header');
  }
  if (!cspAllows(csp, 'style-src', CSS, response.url)) failures.push('CSP blocks dl.css');
  if (!cspAllows(csp, 'img-src', ICON, response.url)) failures.push('CSP blocks the DL icon');
  return failures;
}

let failed = 0;
for (const site of sites.filter((s) => !only.length || only.includes(s.site))) {
  const pages = [...site.pages.map((url) => [url, false]), ...(site.docs || []).map((url) => [url, true])];
  for (const [url, isDocs] of pages) {
    let failures;
    try { failures = await checkPage(site, url, isDocs); } catch (error) { failures = [`fetch failed: ${error.message}`]; }
    if (failures.length) failed += 1;
    console.log(`${failures.length ? '✗' : '✓'} ${url}${failures.length ? `  — ${failures.join('; ')}` : ''}`);
  }
}
console.log(failed ? `\n${failed} page(s) do not use the shared look yet.` : '\nEvery page uses the shared look.');
process.exitCode = failed ? 1 : 0;
