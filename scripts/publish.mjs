#!/usr/bin/env node
// Publishes public/ to https://files.dliu.com/dliu.com/ through the Files managed API (dliu-com/file-server).
// public/ui/v1/dl.css becomes https://files.dliu.com/dliu.com/ui/v1/dl.css.
//
//   FILES_API_URL=<FileServer MicrosoftApiUrl> FILES_BUCKET=<FileServer FileBucketName> node scripts/publish.mjs [--dry-run] [--force [path …]]
//
// --force re-sends the given files (paths under public/, e.g. ui/v1/dl.css), or every file, even when unchanged.
//
// dliu.com/ is view-only on the Files website; only the managed API (a Microsoft access token from auth.dliu.com with
// files.write and the api.access role) can change it, and doing so keeps the Files listing accurate. The token comes
// from ~/.dliu_token (Save file at https://auth.dliu.com), or FILES_API_TOKEN_FILE.
// Unchanged files are found by comparing each file with the object in S3 (read with your AWS CLI credentials), so the
// CDN's copy never misleads it. The token and presigned URLs are never printed.

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
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

// The S3 object as it is now, or null. S3's ETag is the MD5 of the bytes for a plain PUT, and MD5(MD5)-1 for the
// one-part multipart uploads the Files API makes.
async function head(bucket, key) {
  try {
    const { stdout } = await run('aws', ['s3api', 'head-object', '--bucket', bucket, '--key', key, '--output', 'json']);
    return JSON.parse(stdout);
  } catch (error) {
    if (/\b(404|Not Found|NoSuchKey)\b/.test(String(error.stderr || error.message))) return null;
    throw new Error(`Could not read s3://${bucket}/${key}: ${String(error.stderr || error.message).trim()}`);
  }
}
function sameBytes(object, bytes) {
  const md5 = createHash('md5').update(bytes).digest();
  const etag = String(object.ETag || '').replace(/"/g, '');
  return object.ContentLength === bytes.length &&
    (etag === md5.toString('hex') || etag === `${createHash('md5').update(md5).digest('hex')}-1`);
}

async function readToken() {
  const file = process.env.FILES_API_TOKEN_FILE || path.join(os.homedir(), '.dliu_token');
  const fields = Object.fromEntries((await readFile(file, 'utf8')).split(/\r?\n/).filter(Boolean)
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]));
  if (!fields.token || !fields.expires_at) throw new Error(`${file} needs token= and expires_at= lines; use Save file at auth.dliu.com`);
  if (Date.parse(fields.expires_at) <= Date.now() + 60_000) throw new Error('The saved token has expired; save a fresh one at auth.dliu.com');
  return fields.token;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const forceAt = args.indexOf('--force');
  const forced = forceAt === -1 ? null : args.slice(forceAt + 1).filter((a) => !a.startsWith('--'));
  const isForced = (rel) => forced !== null && (forced.length === 0 || forced.includes(rel));
  const bucket = process.env.FILES_BUCKET;
  if (!bucket || !/^[a-z0-9.-]{3,63}$/.test(bucket)) throw new Error('Set FILES_BUCKET to the FileServer FileBucketName output (make does this)');

  const changed = [];
  for (const file of await listFiles(ROOT)) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const type = TYPES[path.extname(file).toLowerCase()];
    if (!type) throw new Error(`No content type for ${rel}; add its extension to TYPES`);
    const bytes = await readFile(file);
    const key = `${PREFIX}/${rel}`;
    const live = await head(bucket, key);
    if (!isForced(rel) && live && sameBytes(live, bytes) && live.ContentType === type) {
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
  if (changed.some((c) => c.exists)) console.log('Files clears the CDN copy of replaced files within about a minute.');
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
