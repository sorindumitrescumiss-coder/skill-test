import fs from 'fs';
import path from 'path';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

export function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME[ext] ?? 'application/octet-stream';
}

/** Resolve path under root; returns null if unsafe or missing. */
export function resolveUnderRoot(rootDir: string, segments: string[]): string | null {
  if (!segments.length) return null;
  const rootResolved = path.resolve(rootDir);
  const resolved = path.resolve(path.join(rootResolved, ...segments));
  const rel = path.relative(rootResolved, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  if (!fs.existsSync(resolved)) return null;
  return resolved;
}

export function resolveFileOrIndex(rootDir: string, segments: string[]): string | null {
  const direct = resolveUnderRoot(rootDir, segments);
  if (!direct) return null;
  const st = fs.statSync(direct);
  if (st.isFile()) return direct;
  if (st.isDirectory()) {
    const indexHtml = path.join(direct, 'index.html');
    if (fs.existsSync(indexHtml) && fs.statSync(indexHtml).isFile()) return indexHtml;
  }
  return null;
}
