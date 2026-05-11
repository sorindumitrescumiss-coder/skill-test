/**
 * Reads pages 1–3 of each PDF in studying/architecture and writes
 * src/data/architectureStudyBookMetadata.json with inferred title + summary text.
 * Run: node scripts/extract-architecture-book-metadata.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const booksDir = path.join(root, 'studying', 'architecture');
const outPath = path.join(root, 'src', 'data', 'architectureStudyBookMetadata.json');

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
  const joined = head.join(' ');

  /** Strong matches from typical title-page layouts (before generic scoring). */
  const tenBooksLine = lines.find((l) => /^(THE\s+)?TEN\s+BOOKS\s+ON\s+ARCHITECTURE/i.test(l.trim()));
  if (tenBooksLine) return 'The Ten Books on Architecture';

  const tenBooks = joined.match(/\bTHE\s+TEN\s+BOOKS\s+ON\s+ARCHITECTURE\b/i);
  if (tenBooks) return shorten(tenBooks[0], 160);

  const architectsData = head.find((l) => /^ARCHITECTS['']?\s+DATA\b/i.test(l.trim()));
  if (architectsData) return "Architects' Data";

  const constructing = head.find((l) => /^CONSTRUCTING\s+ARCHITECTURE\b/i.test(l.trim()));
  if (constructing) return 'Constructing Architecture';

  const studentHandbook = head.find((l) =>
    /architecture\s+student[\u2019']s\s+handbook\s+of\s+professional\s+practice/i.test(l),
  );
  if (studentHandbook) {
    const t = studentHandbook
      .replace(/\s*\/\s*the American Institute of Architects\.?\s*$/i, '')
      .replace(/\s*\/.*$/, '')
      .replace(/\s*—\s*.*$/, '')
      .trim();
    return shorten(t, 160);
  }

  const autonomousMl = joined.match(
    /\bA\s+Path\s+Towards\s+Autonomous\s+Machine\s+Intelligence\b/i,
  );
  if (autonomousMl) return shorten(autonomousMl[0], 160);

  const vitruviusAuthor = head.find((l) =>
    /\bMarcus\s+Vitruvius\s+Pollio\b|\bVitruvius\b.*\bTen\b|\bTen\s+Books\b.*\bArchitecture\b/i.test(l),
  );
  if (vitruviusAuthor && vitruviusAuthor.length < 160) return shorten(vitruviusAuthor, 160);

  let best = '';
  let bestScore = -999;

  const archBoost =
    /architecture|architectural|\bbim\b|building information|construction|structural|urban planning|landscape design|vitruvius|archviz|architect'?s data|neufert|building codes|sustainable design|green building|steel concrete|facade|urbanism|masterplan|handbook|manual/i;

  const boilerplate =
    /TEXTS\s*&\s*DOCUMENTS|series offers to the student|Getty Center for the History|Eminent scholars guide|Publishers for Architecture|Basel\s*·\s*Boston|Blackwell Science Ltd|DISTRIBUTORS/i;

  for (const line of head) {
    if (line.length < 6) continue;
    let score = 0;
    if (line.length >= 12 && line.length <= 160) score += 22;
    if (/^chapter\s+\d+|^\d+\.\s+\w/i.test(line)) score -= 28;
    if (/^(table of contents|contents|preface|foreword|copyright|author index|index)$/i.test(line)) score -= 45;
    if (/copyright|all rights reserved|^©|^isbn|http:\/\/|https:\/\/|www\.|@|\.edu\b|\.gov\b/i.test(line)) score -= 42;
    if (boilerplate.test(line)) score -= 60;
    if (/introductions and commentaries|equips them with the needed apparatus|ume acquaints readers/i.test(line))
      score -= 55;
    if (/^Ernst\s+Neufert\s*$/i.test(line)) score -= 25;
    if (/^Birkhäuser\s*[–-]\s*Publishers/i.test(line)) score -= 55;
    if (archBoost.test(line)) score += 38;
    if (/introduction|handbook|manual|guide|edition|atlas|encyclopedia|primer|essentials/i.test(line)) score += 14;
    if (/^\d+$/.test(line)) score -= 55;
    if (/^\d[\d\s\-–]{8,}$/.test(line)) score -= 50;
    if (/^[a-f0-9]{16,}$/i.test(line.replace(/\s/g, ''))) score -= 38;
    if (line.length > 190) score -= 22;
    if (/^[a-z\s]{3,25}$/i.test(line) && line.split(/\s+/).length <= 2 && line.length < 30) score -= 15;
    const letters = (line.match(/[A-Za-z]/g) ?? []).length;
    const upper = (line.match(/[A-Z]/g) ?? []).length;
    if (letters > 8 && upper / letters > 0.55 && line.length < 100 && archBoost.test(line)) score += 28;
    if (score > bestScore) {
      bestScore = score;
      best = line;
    }
  }

  if (!best || bestScore < 10) return shorten(fallback, 160);
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
    /^\d+\.\s+Architectural practice/i.test(l) ||
    /^720\.68/i.test(l) ||
    /intentionally left blank/i.test(l) ||
    /GETTY CENTER PUBLICATION/i.test(l) ||
    /^introductions and commentaries/i.test(l)
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
  if (!summary) return 'Architecture study material (PDF).';
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
      out[name] = { title: prettify(name), description: 'Architecture study material (PDF).' };
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
