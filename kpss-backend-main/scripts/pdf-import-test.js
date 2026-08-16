const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const soruKlasoru = path.join(__dirname, "../../soruk");
const ciktiKlasoru = path.join(__dirname, "../data/pdf-text");

fs.mkdirSync(ciktiKlasoru, { recursive: true });

async function pdfOku(dosyaYolu) {
  const buffer = fs.readFileSync(dosyaYolu);

  const parser = new PDFParse({
    data: buffer
  });

  const result = await parser.getText();

  await parser.destroy();

  return result.text || "";
}

async function main() {
  console.log("========================================");
  console.log("KPSS PDF TOPLU OKUMA TESTİ");
  console.log("========================================");
  console.log("Kaynak:", soruKlasoru);
  console.log("");

  if (!fs.existsSync(soruKlasoru)) {
    throw new Error("soruk klasörü bulunamadı: " + soruKlasoru);
  }

  const pdfler = fs
    .readdirSync(soruKlasoru)
    .filter(dosya => dosya.toLowerCase().endsWith(".pdf"));

  console.log(`Bulunan PDF sayısı: ${pdfler.length}`);
  console.log("");

  for (const dosya of pdfler) {
    const tamYol = path.join(soruKlasoru, dosya);

    console.log("----------------------------------------");
    console.log("PDF:", dosya);

    try {
      const metin = await pdfOku(tamYol);

      const ciktiAdi =
        path.basename(dosya, ".pdf") + ".txt";

      const ciktiYolu = path.join(ciktiKlasoru, ciktiAdi);

      fs.writeFileSync(ciktiYolu, metin, "utf8");

      console.log("OKUNDU");
      console.log("Metin uzunluğu:", metin.length);
      console.log("Çıktı:", ciktiYolu);

      console.log("");
      console.log("İLK 500 KARAKTER:");
      console.log(metin.slice(0, 500));
      console.log("");

    } catch (hata) {
      console.error("PDF OKUMA HATASI:");
      console.error(hata);
    }
  }

  console.log("========================================");
  console.log("İŞLEM TAMAMLANDI");
  console.log("========================================");
}

main().catch(hata => {
  console.error("GENEL HATA:");
  console.error(hata);
  process.exit(1);
});