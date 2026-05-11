/**
 * Reads pages 1–2 of each PDF in studying/blockchain and writes
 * src/data/blockchainStudyBookMetadata.json with inferred title + summary text.
 * Run: node scripts/extract-blockchain-book-metadata.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const booksDir = path.join(root, 'studying', 'blockchain');
const outPath = path.join(root, 'src', 'data', 'blockchainStudyBookMetadata.json');

const require = createRequire(import.meta.url);
const pdfjsPath = require.resolve('pdfjs-dist/legacy/build/pdf.mjs');
const pdfjs = await import(pathToFileURL(pdfjsPath).href);
const { getDocument } = pdfjs;

function prettify(fileName) {
  return fileName
    .replace(/\.pdf$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanText(s) {
  return String(s)
    .replace(/[\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shorten(s, max) {
  const t = cleanText(s);
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

async function pageToLines(page) {
  const tc = await page.getTextContent();
  const items = tc.items
    .filter((i) => 'str' in i && String(i.str).trim())
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
      lines.push(cleanText(bucket.map((b) => b.str).join(' ')));
      bucket = [it];
      y0 = it.y;
    }
  }
  if (bucket.length) {
    bucket.sort((a, b) => a.x - b.x);
    lines.push(cleanText(bucket.map((b) => b.str).join(' ')));
  }

  return lines.filter(Boolean);
}

function chooseTitle(lines, fileName) {
  const fallback = prettify(fileName);
  let best = '';
  let bestScore = -999;

  for (const line of lines.slice(0, 40)) {
    if (line.length < 6) continue;
    let score = 0;
    if (line.length >= 12 && line.length <= 120) score += 25;
    if (/^chapter\s+\d+/i.test(line)) score -= 30;
    if (/^(table of contents|contents|copyright|author index)/i.test(line)) score -= 40;
    if (
      /blockchain|bitcoin|ethereum|cryptocurrency|distributed ledger|dlt|web3|defi|nft|smart contract|consensus|hash|ledger/i.test(
        line,
      )
    ) {
      score += 32;
    }
    if (/introduction|guide|handbook|for dummies|beginner|primer|white paper|report/i.test(line)) score += 12;
    if (/^\d+$/.test(line)) score -= 50;
    if (/^[a-f0-9]{20,}$/i.test(line.replace(/\s/g, ''))) score -= 35;
    if (line.length > 170) score -= 20;
    if (score > bestScore) {
      bestScore = score;
      best = line;
    }
  }

  if (!best || bestScore < 8) return shorten(fallback, 160);
  return shorten(best, 160);
}

function chooseSummary(lines, title) {
  const clean = lines.map((l) => cleanText(l)).filter(Boolean);
  const startIdx = Math.max(
    0,
    clean.findIndex((l) => l.includes(title.slice(0, Math.min(18, title.length)))) + 1,
  );

  let summary = clean
    .slice(startIdx, startIdx + 14)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (summary.length < 60) {
    summary = clean.slice(1, 16).join(' ').trim();
  }
  if (!summary) return 'Blockchain study material (PDF).';
  return shorten(summary, 560);
}

async function extractOne(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await getDocument({ data, useSystemFonts: true, disableFontFace: true }).promise;

  const lines = [];
  for (let p = 1; p <= Math.min(2, doc.numPages); p += 1) {
    const page = await doc.getPage(p);
    const pageLines = await pageToLines(page);
    lines.push(...pageLines);
    if (lines.length > 60) break;
  }

  const title = chooseTitle(lines, path.basename(filePath));
  const description = chooseSummary(lines, title);
  return { title, description };
}

async function main() {
  if (!fs.existsSync(booksDir)) {
    console.error('Missing books dir:', booksDir);
    process.exit(1);
  }

  const files = fs.readdirSync(booksDir)
    .filter((f) => /\.pdf$/i.test(f))
    .sort();
  const out = {};

  for (const name of files) {
    const fp = path.join(booksDir, name);
    try {
      process.stderr.write(`${name}... `);
      out[name] = await extractOne(fp);
      process.stderr.write('ok\n');
    } catch (err) {
      process.stderr.write(`fail (${err.message})\n`);
      out[name] = { title: prettify(name), description: 'Blockchain study material (PDF).' };
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log(`Wrote ${outPath} with ${Object.keys(out).length} entries`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
