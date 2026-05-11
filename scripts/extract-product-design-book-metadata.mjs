/**
 * Reads pages 1–5 of PDFs in studying/product-design (and aliases) and writes
 * src/data/productDesignStudyBookMetadata.json.
 * Run: node scripts/extract-product-design-book-metadata.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const PRODUCT_DESIGN_FOLDER_NAMES = ['product-design', 'Product design', 'product design'];
const outPath = path.join(root, 'src', 'data', 'productDesignStudyBookMetadata.json');

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
  const head = lines.slice(0, 70);

  let best = '';
  let bestScore = -999;

  const productBoost =
    /\b(product\s+design|product\s+management|user\s+experience|\bux\b|user\s+interface|\bui\b|wireframe|wireframing|prototype|prototyping|design\s+system|journey\s+map|usability|human[-\s]centered|design\s+thinking|scrum|agile|new\s+product|industrial\s+design)\b/i;

  const boilerplate =
    /TEXTS\s*&\s*DOCUMENTS|series offers to the student|Getty Center for the History|Eminent scholars guide|Basel\s*·\s*Boston|Blackwell Science Ltd|DISTRIBUTORS|Books\s+LLC|Amazon\s+Digital/i;

  for (const line of head) {
    if (line.length < 6) continue;
    let score = 0;
    if (line.length >= 12 && line.length <= 160) score += 22;
    if (/^chapter\s+\d+|^\d+\.\s+\w/i.test(line)) score -= 28;
    if (/^(table of contents|contents|preface|foreword|copyright|author index|index)$/i.test(line)) score -= 45;
    if (/copyright|all rights reserved|^©|^isbn|http:\/\/|https:\/\/|www\.|@|\.edu\b|\.gov\b/i.test(line)) score -= 42;
    if (boilerplate.test(line)) score -= 60;
    if (productBoost.test(line)) score += 38;
    if (/introduction|handbook|manual|guide|edition|course|tutorial|fundamentals|principles|essentials/i.test(line))
      score += 12;
    if (/^\d+$/.test(line)) score -= 55;
    if (/^\d[\d\s\-–]{8,}$/.test(line)) score -= 50;
    if (/^[a-f0-9]{16,}$/i.test(line.replace(/\s/g, ''))) score -= 38;
    if (line.length > 190) score -= 22;
    if (/^[a-z\s]{3,25}$/i.test(line) && line.split(/\s+/).length <= 2 && line.length < 22) score -= 12;
    const letters = (line.match(/[A-Za-z]/g) ?? []).length;
    const upper = (line.match(/[A-Z]/g) ?? []).length;
    if (letters > 8 && upper / letters > 0.5 && line.length < 110 && productBoost.test(line)) score += 24;
    if (score > bestScore) {
      bestScore = score;
      best = line;
    }
  }

  if (!best || bestScore < 6) return shorten(fallback, 160);
  return shorten(best, 160);
}

function isNoiseSummaryLine(l) {
  return (
    /^isbn\b/i.test(l) ||
    /^printed in the united states/i.test(l) ||
    /^—\s*\d+(st|nd|rd|th)?\s+ed\./i.test(l) ||
    /\bNA\d{4}\./.test(l) ||
    /^\d{10}\s+\d{3}\s+[\d\s]+$/.test(l) ||
    /^includes bibliographical references/i.test(l) ||
    /^p\.\s*cm\./i.test(l) ||
    /^rev\.\s+ed\.\s+of:/i.test(l) ||
    /intentionally left blank/i.test(l) ||
    /GETTY CENTER PUBLICATION/i.test(l)
  );
}

function boilerplateSummary(l) {
  return /TEXTS\s*&\s*DOCUMENTS|series offers to the student|Getty Center for the History|Eminent scholars guide/i.test(l);
}

function chooseSummary(lines, title) {
  let clean = lines
    .map((l) => cleanText(l))
    .filter(Boolean)
    .filter((l) => !isNoiseSummaryLine(l))
    .filter((l) => !boilerplateSummary(l));
  const titleSeed = title.slice(0, Math.min(22, title.length));
  let startIdx = Math.max(0, clean.findIndex((l) => l.includes(titleSeed)) + 1);

  let summary = clean
    .slice(startIdx, startIdx + 22)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (summary.length < 70) {
    summary = clean.slice(1, 24).join(' ').trim();
  }
  if (!summary || summary.length < 40) {
    summary = clean.slice(0, 24).join(' ').trim();
  }
  if (!summary) return 'Product design study material (PDF).';
  return shorten(summary, 560);
}

async function extractOne(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await getDocument({ data, useSystemFonts: true, disableFontFace: true }).promise;

  const lines = [];
  const maxPages = Math.min(5, doc.numPages);
  for (let p = 1; p <= maxPages; p += 1) {
    const page = await doc.getPage(p);
    const pageLines = await pageToLines(page);
    lines.push(...pageLines);
    if (lines.length > 90) break;
  }

  const title = chooseTitle(lines, path.basename(filePath));
  const description = chooseSummary(lines, title);
  return { title, description };
}

async function main() {
  const studying = path.join(root, 'studying');
  const bookDirs = PRODUCT_DESIGN_FOLDER_NAMES.map((n) => path.join(studying, n)).filter((dir) => fs.existsSync(dir));
  const primaryDir = path.join(studying, 'product-design');
  if (!fs.existsSync(primaryDir)) {
    fs.mkdirSync(primaryDir, { recursive: true });
  }

  const out = {};
  const seen = new Set();

  for (const booksDir of bookDirs.length ? bookDirs : [primaryDir]) {
    const names = fs
      .readdirSync(booksDir)
      .filter((f) => /\.pdf$/i.test(f))
      .sort();
    for (const name of names) {
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const fp = path.join(booksDir, name);
      try {
        process.stderr.write(`${name}... `);
        out[name] = await extractOne(fp);
        process.stderr.write('ok\n');
      } catch (err) {
        process.stderr.write(`fail (${err.message})\n`);
        out[name] = { title: prettify(name), description: 'Product design study material (PDF).' };
      }
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
