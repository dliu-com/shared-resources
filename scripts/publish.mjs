#!/usr/bin/env node
// Publishes public/ to https://files.dliu.com/dliu.com/ by writing straight to the Files bucket
// (dliu-com/file-server) with your AWS CLI credentials. public/ui/v1/dl.css becomes
// https://files.dliu.com/dliu.com/ui/v1/dl.css.
//
//   FILES_BUCKET=<FileServer FileBucketName> node scripts/publish.mjs [--dry-run]
//
// The Files API cannot write dliu.com/ (a reserved path, and its role is denied there), so only a deployer's
// AWS credentials can. Objects get the same content type, cache header and storage class Files gives uploads.
// Replacing an object makes Files clear CloudFront's copy within about a minute (S3 event → its clear function).
// Each object carries the SHA-256 of its bytes, so unchanged files are skipped without trusting the CDN.

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const SITE = 'https://files.dliu.com';
const PREFIX = 'dliu.com';
// Same as Files' own uploads (file-server lambda/api/store.js FILE_CACHE_CONTROL and STORAGE_CLASS).
const CACHE_CONTROL = 'public, max-age=300, s-maxage=86400, stale-while-revalidate=86400';
const STORAGE_CLASS = 'INTELLIGENT_TIERING';
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

const aws = async (...args) => JSON.parse((await run('aws', [...args, '--output', 'json'], { maxBuffer: 1 << 20 })).stdout || '{}');

async function head(bucket, key) {
  try {
    return await aws('s3api', 'head-object', '--bucket', bucket, '--key', key);
  } catch (error) {
    if (/\b(404|Not Found|NoSuchKey)\b/.test(String(error.stderr || error.message))) return null;
    throw new Error(`Could not read s3://${bucket}/${key}: ${String(error.stderr || error.message).trim()}`);
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const bucket = process.env.FILES_BUCKET;
  if (!bucket || !/^[a-z0-9.-]{3,63}$/.test(bucket)) throw new Error('Set FILES_BUCKET to the FileServer FileBucketName output (make publish does this)');

  const changed = [];
  for (const file of await listFiles(ROOT)) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const type = TYPES[path.extname(file).toLowerCase()];
    if (!type) throw new Error(`No content type for ${rel}; add its extension to TYPES`);
    const bytes = await readFile(file);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const key = `${PREFIX}/${rel}`;
    const live = await head(bucket, key);
    const same = live && live.Metadata && live.Metadata.sha256 === sha256 && live.ContentType === type && live.CacheControl === CACHE_CONTROL;
    if (same) {
      console.log(`unchanged  ${SITE}/${key}`);
      continue;
    }
    changed.push({ file, key, type, sha256, exists: Boolean(live) });
  }

  for (const { file, key, type, sha256, exists } of changed) {
    if (dryRun) {
      console.log(`would send ${SITE}/${key}`);
      continue;
    }
    await aws('s3api', 'put-object', '--bucket', bucket, '--key', key, '--body', file,
      '--content-type', type, '--cache-control', CACHE_CONTROL, '--storage-class', STORAGE_CLASS,
      '--metadata', `sha256=${sha256}`, '--checksum-algorithm', 'SHA256');
    console.log(`${exists ? 'replaced' : 'added'}   ${SITE}/${key}`);
  }
  if (!dryRun && changed.some((c) => c.exists)) console.log('Files clears the CDN copy of replaced files within about a minute.');
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
