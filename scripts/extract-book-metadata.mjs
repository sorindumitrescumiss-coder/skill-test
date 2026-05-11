/**
 * Reads pages 1–2 of each PDF in studying/web/books/web books and writes
 * src/data/studyBookMetadata.json with inferred title + description.
 * Run: node scripts/extract-book-metadata.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const booksDir = path.join(root, 'studying', 'web', 'books', 'web books');
const outPath = path.join(root, 'src', 'data', 'studyBookMetadata.json');

const require = createRequire(import.meta.url);
const pdfjsPath = require.resolve('pdfjs-dist/legacy/build/pdf.mjs');
const pdfjs = await import(pathToFileURL(pdfjsPath).href);

const { getDocument } = pdfjs;

function prettifyFileName(fileName) {
  return fileName
    .replace(/\.pdf$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*\([^)]*PDFDrive[^)]*\)/gi, '')
    .trim();
}

/** Group text items into lines (top-to-bottom). */
async function pageToLines(page) {
  const tc = await page.getTextContent();
  const items = tc.items
    .filter((i) => 'str' in i && i.str && String(i.str).trim())
    .map((i) => {
      const m = i.transform;
      return { str: String(i.str), x: m[4], y: m[5] };
    });
  if (!items.length) return [];
  items.sort((a, b) => b.y - a.y || a.x - b.x);
  const lines = [];
  let bucket = [];
  let y0 = items[0].y;
  const tol = 4;
  for (const it of items) {
    if (Math.abs(it.y - y0) <= tol) {
      bucket.push(it);
    } else {
      bucket.sort((a, b) => a.x - b.x);
      const line = bucket.map((b) => b.str).join(' ').replace(/\s+/g, ' ').trim();
      if (line) lines.push(line);
      bucket = [it];
      y0 = it.y;
    }
  }
  if (bucket.length) {
    bucket.sort((a, b) => a.x - b.x);
    const line = bucket.map((b) => b.str).join(' ').replace(/\s+/g, ' ').trim();
    if (line) lines.push(line);
  }
  return lines;
}

function cleanText(s) {
  return s
    .replace(/[\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shorten(s, max) {
  const t = cleanText(s);
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + '…';
}

/** Known title patterns from filename → regex to find the real title line */
const FILENAME_TITLE_HINTS = [
  {
    test: (f) => /bishop|pattern-recognition/i.test(f),
    matchLine: (l) => /pattern recognition and machine learning/i.test(l) && l.length < 120,
  },
  {
    test: (f) => /woychowsky|0132272679/i.test(f),
    matchLine: (l) =>
      /introduction to ajax|enterprise ajax|web development/i.test(l) && l.length < 140,
  },
  {
    test: (f) => /learning.web.design|learning_web_design|niederst/i.test(f),
    matchLine: (l) =>
      /^learning web design\b/i.test(cleanText(l)) ||
      (/learning web design/i.test(l) && /beginner|guide|html|edition/i.test(l) && l.length < 130),
  },
  {
    test: (f) => /web.programming.with.html5|john dean/i.test(f),
    matchLine: (l) =>
      /programming with html5|html5, css, and javascript/i.test(l) && l.length < 100,
  },
  {
    test: (f) => /a-practical-guide-to-developing-effective-web-based-learning/i.test(f),
    matchLine: (l) =>
      /a practical guide to developing effective web-?based learning/i.test(l) && l.length < 120,
  },
  {
    test: (f) => /the-missing-link.*web.development/i.test(f),
    matchLine: (l) =>
      /the missing link.*web development and programming/i.test(l) || /^the missing link/i.test(l),
  },
  {
    test: (f) => /dokumen\.pub|wordpress-a-8620884/i.test(f),
    matchLine: (l) =>
      /web development.*html.*css.*javascript.*php.*mysql.*wordpress/i.test(l) && l.length < 160,
  },
];

function titleFromHints(fileName, lines) {
  const base = path.basename(fileName);
  for (const hint of FILENAME_TITLE_HINTS) {
    if (!hint.test(base)) continue;
    for (const line of lines) {
      if (hint.matchLine(line)) return shorten(line, 160);
    }
  }
  return null;
}

const BAD_LINE =
  /series editors|^www\.|allitebooks|national open university of nigeria$|teaching guidelines for$|application packet|^\s*volume \d+, issue|^\s*doi:\s*10\.|^\s*chapter\s*1\.\s*basic concepts\s*table/i;

function titleScore(line, fileName) {
  const t = cleanText(line);
  if (t.length < 6) return -100;
  const low = t.toLowerCase();
  let s = 0;
  if (t.length > 200) s -= 40;
  if (t.length >= 15 && t.length <= 100) s += 25;
  if (BAD_LINE.test(t)) s -= 90;
  if (/^©|^copyright|^page\s*\d+|^\d+$/.test(low)) s -= 80;
  if (/instructor.?s guide$/i.test(t) && !/learning web design/i.test(t)) s -= 40;
  if (/faculty of|department of science|course syllabus$/i.test(t)) s -= 50;
  if (/\b(web programming|web development|machine learning|web design|javascript|html5)\b/i.test(t))
    s += 35;
  if (/\b(guide|handbook|fundamentals|introduction)\b/i.test(t)) s += 15;
  if (/^\d+[a-z]{2}\s+edition|^"/i.test(t)) s -= 35;
  s += Math.min(25, t.length / 6);
  return s;
}

function pickTitle(lines, fileName) {
  const hinted = titleFromHints(fileName, lines);
  if (hinted) return hinted;

  const base = path.basename(fileName);
  const filtered = lines.map((l) => cleanText(l)).filter(Boolean);
  let best = null;
  let bestScore = -999;
  for (const c of filtered.slice(0, 35)) {
    const sc = titleScore(c, base);
    if (sc > bestScore) {
      bestScore = sc;
      best = c;
    }
  }
  const fallback = prettifyFileName(base);
  if (!best || bestScore < 12) return shorten(fallback, 160);
  if (bestScore < 22 && fallback.length > 15 && /^\d|^[a-f0-9-]{20,}$/i.test(best.replace(/\s/g, '')))
    return shorten(fallback, 160);
  return shorten(best, 160);
}

function pickDescription(lines, title, fileName) {
  const filtered = lines.map((l) => cleanText(l)).filter(Boolean);
  const ti = filtered.findIndex((l) => title.length > 10 && l.includes(title.slice(0, Math.min(25, title.length))));
  const start = ti >= 0 ? ti + 1 : 2;
  let rest = filtered.slice(start).join(' ');
  rest = cleanText(rest);
  if (rest.length > 580) rest = rest.slice(0, 577) + '…';
  if (rest.length < 40) {
    rest = filtered.slice(1, 12).join(' ');
    rest = cleanText(rest);
    if (rest.length > 580) rest = rest.slice(0, 577) + '…';
  }
  if (!rest || rest.length < 25) return 'Study material (PDF).';
  return rest;
}

async function extractMeta(filePath) {
  const buf = fs.readFileSync(filePath);
  const data = new Uint8Array(buf);
  const doc = await getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
  }).promise;
  const n = Math.min(2, doc.numPages);
  const allLines = [];
  for (let p = 1; p <= n; p++) {
    const page = await doc.getPage(p);
    const lines = await pageToLines(page);
    allLines.push(...lines);
    if (allLines.length > 45) break;
  }
  const base = path.basename(filePath);
  const title = pickTitle(allLines, filePath);
  const description = pickDescription(allLines, title, filePath);
  return { title, description };
}

async function main() {
  if (!fs.existsSync(booksDir)) {
    console.error('Missing books dir:', booksDir);
    process.exit(1);
  }
  const files = fs.readdirSync(booksDir).filter((f) => /\.pdf$/i.test(f));
  const meta = {};
  for (const name of files.sort()) {
    const fp = path.join(booksDir, name);
    try {
      process.stderr.write(`${name}… `);
      const m = await extractMeta(fp);
      meta[name] = m;
      process.stderr.write('ok\n');
    } catch (e) {
      process.stderr.write(`fail (${e.message})\n`);
      meta[name] = {
        title: prettifyFileName(name),
        description: 'Open study book (PDF).',
      };
    }
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(meta, null, 2), 'utf8');
  console.log('Wrote', outPath, Object.keys(meta).length, 'entries');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
