const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PDF_DIR = path.join(ROOT, '..', 'soruk');
const OUT_DIR = path.join(ROOT, 'data', 'parsed-questions');
const TMP_DIR = process.env.OCR_TMP_DIR || path.join(require('os').tmpdir(), 'kpss-ocr');
const TESS = process.env.TESSERACT_PATH || 'tesseract';
const PDFINFO = process.env.PDFINFO_PATH || 'pdfinfo';
const PDFTOPPM = process.env.PDFTOPPM_PATH || 'pdftoppm';

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

function year(name) {
  const m = name.match(/20(14|16|18|20|22|24)/);
  return m ? Number(m[0]) : null;
}

function fixEncoding(value) {
  let s = String(value || '');
  for (let i = 0; i < 2; i++) {
    if (!/[ÃÂÄÅÆÐÑÖÜÝÞß]|â€|ðŸ|\uFFFD/.test(s)) break;
    try {
      const repaired = Buffer.from(s, 'latin1').toString('utf8');
      if (!repaired || repaired === s) break;
      s = repaired;
    } catch (_) { break; }
  }
  return s;
}

function clean(s) {
  return fixEncoding(s).replace(/\r/g, '').replace(/\u00ad/g, '')
    .replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function lesson(s, current) {
  if (/GENEL YETENEK|ÖSYM\/GY|OÖ\/GY/i.test(s)) return 'Genel Yetenek';
  if (/GENEL KÜLTÜR|ÖSYM\/GK|OÖ\/GK/i.test(s)) return 'Genel Kültür';
  return current || 'Belirlenmemiş';
}

function answer(s) {
  const m = s.match(/(?:DOĞRU\s*CEVAP|CEVAP)\s*[:：]?\s*([ABCDE])/i);
  return m ? m[1].toUpperCase() : null;
}

function options(body) {
  const out = { A: '', B: '', C: '', D: '', E: '' };
  const re = /(?:^|\s)([ABCDE])\s*[\)\.:]\s*/gi;
  const marks = [];
  let m;
  while ((m = re.exec(body))) marks.push({ l: m[1].toUpperCase(), i: m.index + m[0].length });
  for (let i = 0; i < marks.length; i++) {
    const a = marks[i].i;
    const b = i + 1 < marks.length ? marks[i + 1].i - 1 : body.length;
    const value = body.slice(a, b).replace(/\s+/g, ' ').trim();
    if (value && !out[marks[i].l]) out[marks[i].l] = value;
  }
  return out;
}

function parse(text, y, les) {
  const t = clean(text);
  const ms = [...t.matchAll(/(?:^|\n|\s)(\d{1,2})\.\s+/g)];
  const out = [];
  for (let i = 0; i < ms.length; i++) {
    const n = Number(ms[i][1]);
    if (n < 1 || n > 60) continue;
    const start = ms[i].index + ms[i][0].length;
    const end = i + 1 < ms.length ? ms[i + 1].index : t.length;
    const body = t.slice(start, end).replace(/Diğer sayfaya geçiniz\.?/gi, '').trim();
    if (body.length < 20 || /Bu testte 60 soru vardır|Cevaplarınızı/i.test(body)) continue;
    const optionStart = body.search(/(?:^|\s)A\s*[\)\.:]\s*/i);
    const q = (optionStart >= 0 ? body.slice(0, optionStart) : body).replace(/\s+/g, ' ').trim();
    if (q.length < 20) continue;
    out.push({ yil: y, ders: les, soruNo: n, soru: q, options: options(body), correctAnswer: answer(body), topic: 'Belirlenmemiş', source: `KPSS ${y} Ortaöğretim` });
  }
  return out;
}

function pages(pdfPath) {
  const raw = execFileSync(PDFINFO, [pdfPath], { encoding: 'utf8' });
  const m = raw.match(/^Pages:\s*(\d+)/mi);
  if (!m) throw new Error(`Sayfa sayısı bulunamadı: ${pdfPath}`);
  return Number(m[1]);
}

function renderPage(pdfPath, prefix, page) {
  const base = path.join(TMP_DIR, `${prefix}-${page}`);
  const png = `${base}.png`;
  if (!fs.existsSync(png)) execFileSync(PDFTOPPM, ['-png', '-r', '200', '-f', String(page), '-l', String(page), '-singlefile', pdfPath, base], { stdio: 'ignore' });
  return png;
}

function ocr(image) {
  return execFileSync(TESS, [image, 'stdout', '-l', 'tur', '--psm', '3'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
}

function processPdf(file) {
  const y = year(file);
  const prefix = path.basename(file, '.pdf');
  const pdfPath = path.join(PDF_DIR, file);
  const totalPages = pages(pdfPath);
  let les = null;
  const all = [];
  for (let p = 1; p <= totalPages; p++) {
    const image = renderPage(pdfPath, prefix, p);
    const text = clean(ocr(image));
    les = lesson(text, les);
    all.push(...parse(text, y, les));
    try { fs.unlinkSync(image); } catch (_) {}
  }
  const map = new Map();
  for (const q of all) {
    const key = `${q.ders}-${q.soruNo}`;
    if (!map.has(key) || q.soru.length > map.get(key).soru.length) map.set(key, q);
  }
  const questions = [...map.values()].sort((a, b) => a.soruNo - b.soruNo);
  const result = {
    yil: y,
    kaynakDosya: file,
    soruSayisi: questions.length,
    genelYetenek: questions.filter(q => q.ders === 'Genel Yetenek').length,
    genelKultur: questions.filter(q => q.ders === 'Genel Kültür').length,
    cevapliSoruSayisi: questions.filter(q => q.correctAnswer).length,
    sorular: questions
  };
  fs.writeFileSync(path.join(OUT_DIR, `${y}-ocr.json`), JSON.stringify(result, null, 2), 'utf8');
  console.log(`${file}: ${totalPages} sayfa | ${questions.length} soru | GY ${result.genelYetenek} | GK ${result.genelKultur}`);
  return questions.length;
}

const files = fs.readdirSync(PDF_DIR).filter(x => x.toLowerCase().endsWith('.pdf')).sort();
let total = 0;
for (const file of files) {
  if (year(file)) total += processPdf(file);
}
console.log(`TOPLAM OCR SORUSU: ${total}`);
