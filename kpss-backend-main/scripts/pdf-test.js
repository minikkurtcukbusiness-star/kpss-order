const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

async function testPDF() {
  const pdfPath = path.join(
    __dirname,
    "..",
    "data",
    "soru-kaynagi",
    "KPSS 2022 GY GK Deneme 1.pdf"
  );

  console.log("PDF okunuyor:");
  console.log(pdfPath);

  const buffer = fs.readFileSync(pdfPath);

  const parser = new PDFParse({ data: buffer });

  const result = await parser.getText();

  console.log("\n========================================");
  console.log("PDF SAYFA SAYISI:", result.total);
  console.log("METİN UZUNLUĞU:", result.text.length);
  console.log("========================================\n");

  console.log(result.text.slice(0, 10000));

  await parser.destroy();
}

testPDF().catch(err => {
  console.error("\nPDF OKUMA HATASI:");
  console.error(err);
  process.exit(1);
});
