const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { pdf } = require('pdf-to-img');

const ROOT = path.join(__dirname, '..');
const PDF_DIR = path.join(ROOT, '..', 'soruk');
const IMG_DIR = path.join(ROOT, 'data', 'ocr-images');
const TXT_DIR = path.join(ROOT, 'data', 'ocr-text');
const OUT_DIR = path.join(ROOT, 'data', 'parsed-questions');
const TESS = process.env.TESSERACT_PATH || 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe';
const FORCE_REOCR = process.env.FORCE_REOCR === '1';

for (const d of [IMG_DIR, TXT_DIR, OUT_DIR]) fs.mkdirSync(d, { recursive: true });

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
    } catch (_) {
      break;
    }
  }
  return s;
}

function clean(s) {
  return fixEncoding(s)
    .replace(/\r/g, '')
    .replace(/\u00ad/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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
  while ((m = re.exec(body))) {
    marks.push({ l: m[1].toUpperCase(), i: m.index + m[0].length });
  }
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
    const body = t.slice(start, end)
      .replace(/Diğer sayfaya geçiniz\.?/gi, '')
      .trim();

    if (body.length < 20 || /Bu testte 60 soru vardır|Cevaplarınızı/i.test(body)) continue;

    const optionStart = body.search(/(?:^|\s)A\s*[\)\.:]\s*/i);
    const q = (optionStart >= 0 ? body.slice(0, optionStart) : body)
      .replace(/\s+/g, ' ')
      .trim();

    if (q.length < 20) continue;

    out.push({
      yil: y,
      ders: les,
      soruNo: n,
      soru: q,
      options: options(body),
      correctAnswer: answer(body),
      topic: 'Belirlenmemiş',
      source: `KPSS ${y} Ortaöğretim`
    });
  }

  return out;
}

async function render(pdfPath, prefix) {
  const doc = await pdf(pdfPath, { scale: 2 });
  let n = 0;
  for await (const image of doc) {
    n++;
    const f = path.join(IMG_DIR, `${prefix}-page-${n}.png`);
    if (!fs.existsSync(f)) fs.writeFileSync(f, image);
  }
  return n;
}

function ocr(image) {
  return execFileSync(
    TESS,
    [image, 'stdout', '-l', 'tur', '--psm', '3'],
    { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, windowsHide: true }
  );
}

(async () => {
  if (!fs.existsSync(TESS)) throw new Error(`Tesseract bulunamadı: ${TESS}`);

  const files = fs.readdirSync(PDF_DIR)
    .filter(x => x.toLowerCase().endsWith('.pdf'))
    .sort();

  let total = 0;

  for (const file of files) {
    const y = year(file);
    if (!y) continue;

    const prefix = path.basename(file, '.pdf');
    console.log(`\n${file}`);

    const pages = await render(path.join(PDF_DIR, file), prefix);
    let les = null;
    const all = [];

    for (let p = 1; p <= pages; p++) {
      const img = path.join(IMG_DIR, `${prefix}-page-${p}.png`);
      const txt = path.join(TXT_DIR, `${prefix}-page-${p}.txt`);
      let s;

      if (!FORCE_REOCR && fs.existsSync(txt)) {
        s = fs.readFileSync(txt, 'utf8');
      } else {
        s = ocr(img);
        fs.writeFileSync(txt, s, 'utf8');
      }

      s = clean(s);
      les = lesson(s, les);
      all.push(...parse(s, y, les));
    }

    const map = new Map();
    for (const q of all) {
      const k = `${q.ders}-${q.soruNo}`;
      if (!map.has(k) || q.soru.length > map.get(k).soru.length) map.set(k, q);
    }

    const questions = [...map.values()].sort((a, b) => a.soruNo - b.soruNo);
    const gy = questions.filter(q => q.ders === 'Genel Yetenek').length;
    const gk = questions.filter(q => q.ders === 'Genel Kültür').length;

    fs.writeFileSync(
      path.join(OUT_DIR, `${y}-ocr.json`),
      JSON.stringify({
        yil: y,
        kaynakDosya: file,
        soruSayisi: questions.length,
        genelYetenek: gy,
        genelKultur: gk,
        cevapliSoruSayisi: questions.filter(q => q.correctAnswer).length,
        sorular: questions
      }, null, 2),
      'utf8'
    );

    console.log(`Sayfa: ${pages} | Soru: ${questions.length} | GY: ${gy} | GK: ${gk}`);
    total += questions.length;
  }

  console.log(`\nTOPLAM OCR SORUSU: ${total}`);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
