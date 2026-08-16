const fs = require("fs");
const path = require("path");

const klasor = path.join(__dirname, "../data/pdf-text");

function yilBul(dosya) {
  const eslesme = dosya.match(/20(14|16|18|20|22|24)/);
  return eslesme ? eslesme[0] : "bilinmiyor";
}

function soruSayisiBul(metin) {
  const eslesmeler = metin.match(/(?:^|\n)\s*(\d{1,2})\./g);

  if (!eslesmeler) return 0;

  const sayilar = eslesmeler
    .map(x => {
      const m = x.match(/(\d{1,2})\./);
      return m ? Number(m[1]) : null;
    })
    .filter(Boolean);

  return sayilar.length ? Math.max(...sayilar) : 0;
}

function encodingKontrol(metin) {
  const bozuklar = [
    "Ã",
    "Ä",
    "Å",
    "â",
    "Â"
  ];

  return bozuklar.some(x => metin.includes(x));
}

function bolumleriBul(metin) {
  const sonuc = [];

  if (/GENEL YETENEK/i.test(metin)) {
    sonuc.push("Genel Yetenek");
  }

  if (/GENEL KÜLTÜR/i.test(metin) || /GENEL KÃœLTÃœR/i.test(metin)) {
    sonuc.push("Genel Kültür");
  }

  return sonuc;
}

function cevapAnahtariVarMi(metin) {
  const kaliplar = [
    /CEVAP ANAHTARI/i,
    /CEVAPLAR/i,
    /GENEL YETENEK.*A\s*B\s*C\s*D\s*E/i,
    /GENEL KÜLTÜR.*A\s*B\s*C\s*D\s*E/i
  ];

  return kaliplar.some(k => k.test(metin));
}

function ilkSorulariBul(metin) {
  const sonuc = [];

  for (let i = 1; i <= 10; i++) {
    const regex = new RegExp(
      `(?:^|\\n)\\s*${i}\\.\\s+([^\\n]+)`,
      "m"
    );

    const match = metin.match(regex);

    if (match) {
      sonuc.push({
        numara: i,
        baslangic: match[1].trim().slice(0, 150)
      });
    }
  }

  return sonuc;
}

function analizEt(dosya) {
  const yol = path.join(klasor, dosya);
  const metin = fs.readFileSync(yol, "utf8");

  return {
    dosya,
    yil: yilBul(dosya),
    karakterSayisi: metin.length,
    tahminiSoruSayisi: soruSayisiBul(metin),
    bolumler: bolumleriBul(metin),
    cevapAnahtariVarMi: cevapAnahtariVarMi(metin),
    encodingBozuk: encodingKontrol(metin),
    ilkSorular: ilkSorulariBul(metin)
  };
}

function main() {
  console.log("========================================");
  console.log("KPSS PDF ANALİZİ");
  console.log("========================================");

  if (!fs.existsSync(klasor)) {
    throw new Error("PDF text klasörü bulunamadı: " + klasor);
  }

  const dosyalar = fs
    .readdirSync(klasor)
    .filter(x => x.toLowerCase().endsWith(".txt"));

  console.log(`Dosya sayısı: ${dosyalar.length}`);
  console.log("");

  const rapor = [];

  for (const dosya of dosyalar) {
    console.log("----------------------------------------");
    console.log(dosya);

    try {
      const sonuc = analizEt(dosya);

      rapor.push(sonuc);

      console.log("Yıl:", sonuc.yil);
      console.log("Karakter:", sonuc.karakterSayisi);
      console.log("Tahmini soru:", sonuc.tahminiSoruSayisi);
      console.log("Bölümler:", sonuc.bolumler.join(", ") || "Bulunamadı");
      console.log(
        "Encoding bozuk:",
        sonuc.encodingBozuk ? "EVET" : "HAYIR"
      );
      console.log(
        "Cevap anahtarı:",
        sonuc.cevapAnahtariVarMi ? "VAR" : "BULUNAMADI"
      );

      if (sonuc.ilkSorular.length) {
        console.log("İlk bulunan sorular:");

        for (const soru of sonuc.ilkSorular) {
          console.log(
            `  ${soru.numara}. ${soru.baslangic}`
          );
        }
      }

      console.log("");
    } catch (err) {
      console.error("HATA:", err.message);
    }
  }

  const raporYolu = path.join(
    __dirname,
    "../data/pdf-analysis.json"
  );

  fs.writeFileSync(
    raporYolu,
    JSON.stringify(rapor, null, 2),
    "utf8"
  );

  console.log("========================================");
  console.log("ANALİZ TAMAMLANDI");
  console.log("Rapor:");
  console.log(raporYolu);
  console.log("========================================");
}

main();