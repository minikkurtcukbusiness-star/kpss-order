const fs = require("fs");
const path = require("path");
const { pdf } = require("pdf-to-img");

const PDF_PATH = "C:/Users/Ahmet/Desktop/kpss/soruk/tsk15092024.pdf";
const OUTPUT_DIR = path.join(__dirname, "..", "data", "pdf-images");

(async () => {
  try {
    console.log("PDF açılıyor...");
    console.log("Dosya:", PDF_PATH);

    if (!fs.existsSync(PDF_PATH)) {
      console.error("PDF BULUNAMADI!");
      console.error(PDF_PATH);
      process.exit(1);
    }

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const document = await pdf(PDF_PATH, {
      scale: 2
    });

    console.log("PDF açıldı.");
    console.log("Sayfalar görüntüye çevriliyor...");

    let sayfa = 0;

    for await (const image of document) {
      sayfa++;

      const output = path.join(
        OUTPUT_DIR,
        `tsk15092024-page-${sayfa}.png`
      );

      fs.writeFileSync(output, image);

      console.log(`Sayfa ${sayfa} kaydedildi.`);
    }

    console.log("");
    console.log("========================================");
    console.log("TAMAMLANDI");
    console.log(`Toplam sayfa: ${sayfa}`);
    console.log(`Çıktı klasörü: ${OUTPUT_DIR}`);
    console.log("========================================");

  } catch (error) {
    console.error("");
    console.error("HATA:");
    console.error(error);
    process.exit(1);
  }
})();