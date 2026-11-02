#!/usr/bin/env node
// Publishes public/ to https://files.dliu.com/dliu.com/ through the Files managed API
// (dliu-com/file-server). public/ui/v1/dl.css becomes https://files.dliu.com/dliu.com/ui/v1/dl.css.
//
//   FILES_API_URL=<FileServer MicrosoftApiUrl> node scripts/publish.mjs [--dry-run]
//
// The Microsoft access token comes from ~/.dliu_token (Save file at https://auth.dliu.com), or
// FILES_API_TOKEN_FILE. Unchanged files are skipped; the token and presigned URLs are never printed.

import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const SITE = 'https://files.dliu.com';
const PREFIX = 'dliu.com';
const TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

async function listFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listFiles(full));
    else out.push(full);
  }
  return out.sort();
}

async function readToken() {
  const file = process.env.FILES_API_TOKEN_FILE || path.join(os.homedir(), '.dliu_token');
  const fields = Object.fromEntries((await readFile(file, 'utf8')).split(/\r?\n/).filter(Boolean)
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]));
  if (!fields.token || !fields.expires_at) throw new Error(`${file} needs token= and expires_at= lines; use Save file at auth.dliu.com`);
  if (Date.parse(fields.expires_at) <= Date.now() + 60_000) throw new Error('The saved token has expired; save a fresh one at auth.dliu.com');
  return fields.token;
}

// Files uploads are multipart with parts of at least 16 MiB, so small files are one part:
// S3's ETag is then md5(md5(bytes)) followed by -1.
const singlePartEtag = (bytes) => {
  const inner = createHash('md5').update(bytes).digest();
  return `"${createHash('md5').update(inner).digest('hex')}-1"`;
};

async function liveEtag(key) {
  const response = await fetch(`${SITE}/${key.split('/').map(encodeURIComponent).join('/')}`, { method: 'HEAD', redirect: 'manual' });
  return response.ok ? { etag: response.headers.get('etag'), type: response.headers.get('content-type') } : null;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const files = await listFiles(ROOT);
  const changed = [];
  for (const file of files) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const type = TYPES[path.extname(file).toLowerCase()];
    if (!type) throw new Error(`No content type for ${rel}; add its extension to TYPES`);
    const bytes = await readFile(file);
    const key = `${PREFIX}/${rel}`;
    const live = await liveEtag(key);
    if (live && live.etag === singlePartEtag(bytes) && live.type === type) {
      console.log(`unchanged  ${SITE}/${key}`);
      continue;
    }
    changed.push({ key, type, bytes, exists: Boolean(live) });
  }
  if (!changed.length || dryRun) {
    for (const { key } of changed) console.log(`would send ${SITE}/${key}`);
    return;
  }

  const api = new URL(process.env.FILES_API_URL || '');
  if (api.protocol !== 'https:' || api.pathname !== '/') throw new Error('FILES_API_URL must be the HTTPS FileServer MicrosoftApiUrl');
  const token = await readToken();
  const call = async (route, body) => {
    const response = await fetch(new URL(route, api), {
      method: 'POST', redirect: 'error',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`${route} ${response.status}: ${data.error || data.message || 'request failed'}`);
    return data;
  };

  for (const { key, type, bytes, exists } of changed) {
    const start = await call('/api/uploads', { path: key, size: bytes.length, contentType: type, ...(exists ? { overwrite: true } : {}) });
    try {
      if (start.partCount !== 1) throw new Error(`${key} is too big for a one-part upload`);
      const { urls } = await call('/api/uploads/parts', { token: start.token, parts: [1] });
      const put = await fetch(urls['1'], { method: 'PUT', body: bytes, redirect: 'error' });
      if (!put.ok) throw new Error(`S3 refused ${key} (${put.status})`);
      await call('/api/uploads/complete', { token: start.token, parts: [{ partNumber: 1, etag: put.headers.get('etag') }] });
    } catch (error) {
      await call('/api/uploads/abort', { token: start.token }).catch(() => {});
      throw error;
    }
    console.log(`${exists ? 'replaced' : 'added'}   ${SITE}/${key}`);
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
