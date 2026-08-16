const { execFileSync } = require('child_process');
const path = require('path');
const candidates = [process.env.TESSERACT_PATH, 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe', 'tesseract'].filter(Boolean);
for (const exe of candidates) {
  try {
    const v = execFileSync(exe, ['--version'], { encoding: 'utf8', windowsHide: true });
    console.log('Tesseract OK:', exe);
    console.log(String(v).split(/\r?\n/)[0]);
    process.exit(0);
  } catch (_) {}
}
console.error('Tesseract bulunamadı.');
process.exit(1);
