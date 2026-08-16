const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const INPUT_DIR = "C:\\Users\\Ahmet\\Desktop\\kpss\\soruk";
const OUTPUT_DIR = path.join(__dirname, "..", "data", "parsed-questions");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function fixEncoding(text) {
  if (!text) return "";

  // PDF zaten UTF-8 geldiyse dokunma.
  // Bozuk mojibake varsa düzelt.
  if (
    text.includes("Ã") ||
    text.includes("Ä") ||
    text.includes("Å") ||
    text.includes("â")
  ) {
    try {
      return Buffer.from(text, "latin1").toString("utf8");
    } catch {
      return text;
    }
  }

  return text;
}

function normalize(text) {
  return fixEncoding(text)
    .replace(/\r/g, "")
    .replace(/\u00ad/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function yilBul(dosya) {
  const m = dosya.match(/20(14|16|18|20|22|24)/);
  return m ? Number(m[0]) : null;
}

function dersBul(text) {
  if (/OÖ\/GY|OÖ\/GY|GENEL YETENEK/i.test(text)) {
    return "Genel Yetenek";
  }

  if (/OÖ\/GK|OÖ\/GK|GENEL KÜLTÜR/i.test(text)) {
    return "Genel Kültür";
  }

  return null;
}

function soruNumarasiBul(text) {
  const temiz = text.trim();

  // Soru bloğunun başındaki gerçek numara.
  // Örneğin:
  // 18. Yaşamak hissetmektir...
  const m = temiz.match(/^(\d{1,2})\.\s+/);

  if (!m) return null;

  const no = Number(m[1]);

  if (no < 1 || no > 60) {
    return null;
  }

  return no;
}

function secenekleriBul(lines) {
  const options = {
    A: "",
    B: "",
    C: "",
    D: "",
    E: ""
  };

  // PDF bazen:
  //
  // A)
  // B)
  // C)
  // D)
  // E)
  //
  // şeklinde seçenek harflerini ayrı verir.
  //
  // Bazen seçenek metinleri önce gelir, A-E harfleri sonra gelir.
  //
  // Bu yüzden iki farklı yapıyı kontrol ediyoruz.

  const joined = lines.join("\n");

  const markerRegex = /(?:^|\n)\s*([ABCDE])\)\s*/g;

  const markers = [];
  let match;

  while ((match = markerRegex.exec(joined)) !== null) {
    markers.push({
      harf: match[1],
      index: match.index + match[0].length
    });
  }

  if (markers.length >= 2) {
    for (let i = 0; i < markers.length; i++) {
      const mevcut = markers[i];
      const sonraki = markers[i + 1];

      const bas = mevcut.index;
      const son = sonraki ? sonraki.index - 2 : joined.length;

      options[mevcut.harf] = joined
        .slice(bas, son)
        .replace(/\s+/g, " ")
        .trim();
    }

    return options;
  }

  return options;
}

function soruMetniTemizle(text) {
  return text
    .replace(/^\d{1,2}\.\s*/, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^\s+|\s+$/g, "")
    .trim();
}

function cevapBul(text) {
  const m = text.match(/DOĞRU\s+CEVAP\s*:\s*([ABCDE])/i);

  if (!m) return null;

  return m[1].toUpperCase();
}

function soruBloğuOlabilir(text) {
  if (!text) return false;

  if (text.length < 30) return false;

  if (/Bu testte 60 soru vardır/i.test(text)) return false;

  if (/Cevaplarınızı/i.test(text)) return false;

  if (/Diğer sayfaya geçiniz/i.test(text)) return false;

  if (/DOĞRU CEVAP/i.test(text)) return true;

  return false;
}

async function pdfOku(dosyaYolu) {
  const buffer = fs.readFileSync(dosyaYolu);

  const parser = new PDFParse({
    data: buffer
  });

  try {
    return await parser.getText();
  } finally {
    await parser.destroy();
  }
}

function sayfalariGrupla(pdfResult) {
  return pdfResult.pages.map(page => ({
    num: page.num,
    text: normalize(page.text || "")
  }));
}

function soruCikarSayfadan(page) {
  const text = page.text;

  if (!text) return [];

  const cevap = cevapBul(text);

  if (!cevap) return [];

  /*
   * PDF'de soru numarası bazen metnin en başında,
   * bazen de seçeneklerden hemen önce/sonra bulunabiliyor.
   */

  const soruMatch = text.match(
    /(?:^|\n)\s*(\d{1,2})\.\s+([\s\S]*?)DOĞRU\s+CEVAP\s*:\s*([ABCDE])/i
  );

  if (!soruMatch) {
    return [];
  }

  const soruNo = Number(soruMatch[1]);

  if (soruNo < 1 || soruNo > 60) {
    return [];
  }

  const govde = soruMatch[2].trim();

  const lines = govde
    .split("\n")
    .map(x => x.trim())
    .filter(Boolean);

  const options = secenekleriBul(lines);

  let soruMetni = govde;

  // A) ile başlayan seçenek kısmını soru metninden çıkar.
  const optionIndex = soruMetni.search(
    /(?:^|\n)\s*A\)\s*/i
  );

  if (optionIndex >= 0) {
    soruMetni = soruMetni.slice(0, optionIndex);
  }

  soruMetni = soruMetniTemizle(soruMetni);

  if (!soruMetni || soruMetni.length < 20) {
    return [];
  }

  return [
    {
      soruNo,
      soru: soruMetni,
      options,
      correctAnswer: cevap
    }
  ];
}

function ayniSoruyuTekilleştir(sorular) {
  const map = new Map();

  for (const soru of sorular) {
    const key = `${soru.ders}-${soru.soruNo}`;

    if (!map.has(key)) {
      map.set(key, soru);
    }
  }

  return [...map.values()].sort((a, b) => {
    if (a.ders !== b.ders) {
      return a.ders.localeCompare(b.ders);
    }

    return a.soruNo - b.soruNo;
  });
}

async function main() {
  console.log("========================================");
  console.log("KPSS PDF → GERÇEK SORU AKTARICI");
  console.log("========================================");

  const dosyalar = fs
    .readdirSync(INPUT_DIR)
    .filter(x => x.toLowerCase().endsWith(".pdf"))
    .sort();

  console.log(`PDF sayısı: ${dosyalar.length}`);

  let toplam = 0;

  for (const dosya of dosyalar) {
    console.log("\n----------------------------------------");
    console.log(`İşleniyor: ${dosya}`);

    const yil = yilBul(dosya);
    const pdfYolu = path.join(INPUT_DIR, dosya);

    if (!yil) {
      console.log("Yıl bulunamadı, atlandı.");
      continue;
    }

    try {
      const pdf = await pdfOku(pdfYolu);
      const sayfalar = sayfalariGrupla(pdf);

      console.log(`Sayfa sayısı: ${sayfalar.length}`);

      const tumSorular = [];

      let mevcutDers = null;

      for (const page of sayfalar) {
        const text = page.text;

        const ders = dersBul(text);

        if (ders) {
          mevcutDers = ders;
        }

        const cevapli = soruCikarSayfadan(page);

        for (const soru of cevapli) {
          soru.ders = mevcutDers || "Belirlenmemiş";

          tumSorular.push({
            yil,
            ders: soru.ders,
            soruNo: soru.soruNo,
            soru: soru.soru,
            options: soru.options,
            correctAnswer: soru.correctAnswer,
            topic: "Belirlenmemiş",
            source: `KPSS ${yil} Ortaöğretim`
          });
        }
      }

      const sorular = ayniSoruyuTekilleştir(tumSorular);

      const gy = sorular.filter(
        x => x.ders === "Genel Yetenek"
      );

      const gk = sorular.filter(
        x => x.ders === "Genel Kültür"
      );

      const cevapli = sorular.filter(
        x => x.correctAnswer
      );

      const sonuc = {
        yil,
        kaynakDosya: dosya,
        soruSayisi: sorular.length,
        genelYetenek: gy.length,
        genelKultur: gk.length,
        cevapliSoruSayisi: cevapli.length,
        cevapAnahtariVarMi: cevapli.length > 0,
        sorular
      };

      const cikti = path.join(
        OUTPUT_DIR,
        `${yil}.json`
      );

      fs.writeFileSync(
        cikti,
        JSON.stringify(sonuc, null, 2),
        "utf8"
      );

      console.log(`Toplam soru: ${sorular.length}`);
      console.log(`Genel Yetenek: ${gy.length}`);
      console.log(`Genel Kültür: ${gk.length}`);
      console.log(`Cevaplı: ${cevapli.length}`);
      console.log(`Kaydedildi: ${cikti}`);

      toplam += sorular.length;
    } catch (err) {
      console.error(`HATA: ${dosya}`);
      console.error(err);
    }
  }

  console.log("\n========================================");
  console.log("İŞLEM TAMAMLANDI");
  console.log(`TOPLAM SORU: ${toplam}`);
  console.log(`ÇIKIŞ: ${OUTPUT_DIR}`);
  console.log("========================================");
}

main().catch(err => {
  console.error("KRİTİK HATA:");
  console.error(err);
  process.exit(1);
});