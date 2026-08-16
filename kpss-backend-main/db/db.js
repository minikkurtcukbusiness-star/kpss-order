/* ==========================================================================
   db/db.js
   SQLite veritabanı (tek dosya).
   ========================================================================== */

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const dbYolu = process.env.DATABASE_PATH || "./data/kpss.db";
fs.mkdirSync(path.dirname(dbYolu), { recursive: true });

const db = new Database(dbYolu);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  ad TEXT,
  tip TEXT DEFAULT 'ucretsiz',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  subject TEXT,
  topic TEXT,
  question TEXT,
  options TEXT,
  correct_answer TEXT,
  explanation TEXT,
  difficulty TEXT,
  source TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_questions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  question_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS test_results (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  test_turu TEXT,
  dogru INTEGER,
  yanlis INTEGER,
  bos INTEGER,
  detay TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS wrong_questions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  question_id TEXT,
  verilen_cevap TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS study_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  subject TEXT,
  dakika INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS current_affairs (
  id TEXT PRIMARY KEY,
  title TEXT,
  summary TEXT,
  category TEXT,
  published_at TEXT,
  source_name TEXT,
  source_url TEXT,
  content TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  current_affairs_id TEXT,
  title TEXT,
  url TEXT,
  domain TEXT,
  fetched_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  gun TEXT,
  sayi INTEGER DEFAULT 0,
  UNIQUE(user_id, gun)
);

CREATE TABLE IF NOT EXISTS ai_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  islem TEXT,
  saglayici TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reported_questions (
  id TEXT PRIMARY KEY,
  question_id TEXT,
  user_id TEXT,
  sebep TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  anahtar TEXT PRIMARY KEY,
  deger TEXT
);

CREATE INDEX IF NOT EXISTS idx_test_results_user_date ON test_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wrong_questions_user_date ON wrong_questions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_subject_topic ON questions(subject, topic);
CREATE INDEX IF NOT EXISTS idx_current_affairs_date ON current_affairs(published_at);
`);

// Uygulamanın soru havuzu ilk açılışta boş kalmasın diye özgün demo/örnek sorular.
// Bunlar geçmiş ÖSYM soruları değildir; gerçek soru dosyaları daha sonra import edilebilir.
const poolSeed = [
  ["turkce","Ses Bilgisi","Aşağıdaki sözcüklerin hangisinde ünlü daralması vardır?",{"A":"bekliyor","B":"kitaplık","C":"çocuklar","D":"kalemlik","E":"evler"},"A","\"bekle-yor\" biçiminde eylem kökündeki e'nin i'ye dönüşmesi ünlü daralmasıdır.","orta"],
  ["turkce","Yazım Kuralları","Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?",{"A":"Her şey yolunda gidiyor.","B":"Bugün Ankara'ya gideceğim.","C":"Bir çok konu çalıştım.","D":"Akşamüstü görüşürüz.","E":"Hiçbir şey söylemedi."},"C","Doğru kullanım \"birçok\" şeklindedir.","kolay"],
  ["turkce","Noktalama İşaretleri","Soru anlamı taşıyan cümlenin sonuna hangi noktalama işareti getirilir?",{"A":".","B":",","C":":","D":"?","E":";"},"D","Soru cümlelerinin sonunda soru işareti kullanılır.","kolay"],
  ["turkce","Sözcükte Anlam","\"Titiz bir öğrenci\" sözündeki \"titiz\" sözcüğünün anlamı hangisidir?",{"A":"Özensiz","B":"Dikkatli","C":"Kararsız","D":"Çekingen","E":"Unutkan"},"B","Titiz; ayrıntılara dikkat eden, özenli anlamındadır.","kolay"],
  ["turkce","Cümlede Anlam","\"Bu konuyu tekrar tekrar çalıştı.\" cümlesinde anlatılmak istenen temel durum nedir?",{"A":"Erteleme","B":"Kararsızlık","C":"Süreklilik","D":"Pişmanlık","E":"Şaşkınlık"},"C","\"Tekrar tekrar\" ifadesi süreklilik bildirir.","kolay"],
  ["turkce","Paragrafta Anlam","Bir paragrafın ana düşüncesi için aşağıdakilerden hangisi söylenebilir?",{"A":"Yalnızca örneklerden oluşur","B":"Metnin temel iletisidir","C":"Her zaman ilk cümlededir","D":"Başlıkla aynıdır","E":"Yalnızca sonuç cümlesidir"},"B","Ana düşünce, parçanın okuyucuya vermek istediği temel iletidir.","orta"],
  ["turkce","Fiilimsi","Aşağıdakilerden hangisinde isim-fiil vardır?",{"A":"Koşarak geldi.","B":"Gülümseyen çocuk","C":"Kitap okumayı severim.","D":"Giden otobüs","E":"Yazınca haber ver."},"C","\"okumayı\" sözcüğü -ma ekiyle isim-fiildir.","orta"],
  ["turkce","Cümlenin Öğeleri","\"Ali dün kütüphanede kitap okudu.\" cümlesinde özne hangisidir?",{"A":"dün","B":"kütüphanede","C":"kitap","D":"Ali","E":"okudu"},"D","Eylemi yapan varlık \"Ali\"dir.","kolay"],
  ["matematik","Temel Kavramlar","3 + 5 × 2 işleminin sonucu kaçtır?",{"A":"16","B":"13","C":"11","D":"10","E":"8"},"B","Çarpma önce yapılır: 3 + 10 = 13.","kolay"],
  ["matematik","Sayı Basamakları","507 sayısında 5 rakamının basamak değeri kaçtır?",{"A":"5","B":"50","C":"500","D":"507","E":"5000"},"C","5 yüzler basamağındadır ve basamak değeri 500'dür.","kolay"],
  ["matematik","Bölme ve Bölünebilme","246 sayısı aşağıdakilerden hangisine kesinlikle bölünür?",{"A":"5","B":"7","C":"9","D":"3","E":"11"},"D","Rakamları toplamı 12 olduğu için 3'e bölünür.","kolay"],
  ["matematik","EBOB - EKOK","12 ve 18 sayılarının EBOB'u kaçtır?",{"A":"2","B":"3","C":"4","D":"6","E":"9"},"D","12 ve 18'in ortak bölenlerinin en büyüğü 6'dır.","kolay"],
  ["matematik","Rasyonel Sayılar","1/2 + 1/4 işleminin sonucu nedir?",{"A":"1/8","B":"2/6","C":"3/4","D":"1","E":"5/4"},"C","1/2 = 2/4 olduğundan toplam 3/4'tür.","kolay"],
  ["matematik","Mutlak Değer","|-7| + |3| işleminin sonucu kaçtır?",{"A":"4","B":"7","C":"10","D":"-10","E":"-4"},"C","Mutlak değerler 7 ve 3'tür; toplam 10 eder.","kolay"],
  ["matematik","Üslü Sayılar","2^5 işleminin sonucu kaçtır?",{"A":"10","B":"16","C":"25","D":"32","E":"64"},"D","2'nin beşinci kuvveti 32'dir.","kolay"],
  ["matematik","Oran - Orantı","4 kalem 20 TL ise aynı kalemlerden 7 tanesi kaç TL'dir?",{"A":"28","B":"30","C":"35","D":"40","E":"45"},"C","Bir kalem 5 TL'dir; 7 × 5 = 35 TL.","kolay"],
  ["matematik","Sayı Problemleri","Ardışık iki doğal sayının toplamı 17 ise küçük sayı kaçtır?",{"A":"7","B":"8","C":"9","D":"10","E":"11"},"B","x + (x+1)=17 olduğundan x=8.","orta"],
  ["tarih","İslamiyet Öncesi Türk Tarihi","İslamiyet öncesi Türklerde devletin başında bulunan hükümdara verilen unvanlardan biri hangisidir?",{"A":"Sultan","B":"Kağan","C":"Halife","D":"Vezir","E":"Padişah"},"B","Kağan, İslamiyet öncesi Türk devletlerinde yaygın hükümdar unvanıdır.","kolay"],
  ["tarih","İlk Türk İslam Devletleri","Türklerin İslamiyet'i kabulünden sonra kurduğu ilk büyük devletlerden biri hangisidir?",{"A":"Karahanlılar","B":"Frigler","C":"Hititler","D":"Urartular","E":"Lidyalılar"},"A","Karahanlılar, ilk Müslüman Türk devletleri arasında yer alır.","kolay"],
  ["tarih","Osmanlı Kuruluş Dönemi","Osmanlı Devleti'nin kurucusu kimdir?",{"A":"Orhan Bey","B":"I. Murat","C":"Osman Bey","D":"Yıldırım Bayezid","E":"Fatih Sultan Mehmet"},"C","Osmanlı Beyliği Osman Bey tarafından kurulmuştur.","kolay"],
  ["tarih","Osmanlı Yükselme Dönemi","İstanbul'un fethi hangi padişah döneminde gerçekleşmiştir?",{"A":"I. Murat","B":"II. Murat","C":"Fatih Sultan Mehmet","D":"Kanuni Sultan Süleyman","E":"Yavuz Sultan Selim"},"C","İstanbul 1453'te II. Mehmet tarafından fethedilmiştir.","kolay"],
  ["tarih","I. Dünya Savaşı","Osmanlı Devleti I. Dünya Savaşı'nda hangi blokta yer almıştır?",{"A":"İtilaf Devletleri","B":"Bağlantısızlar","C":"Merkezî olmayan blok","D":"İttifak Devletleri","E":"Tarafsızlar"},"D","Osmanlı Devleti İttifak Devletleri safında savaşa girmiştir.","kolay"],
  ["tarih","Milli Mücadele Hazırlık Dönemi","Amasya Genelgesi'nin temel vurgularından biri hangisidir?",{"A":"Saltanatın güçlendirilmesi","B":"Milletin bağımsızlığını yine milletin azim ve kararının kurtarması","C":"İstanbul'un terk edilmesi","D":"Halifeliğin kaldırılması","E":"Cumhuriyetin ilan edilmesi"},"B","Amasya Genelgesi milli egemenlik anlayışının önemli belgelerindendir.","orta"],
  ["tarih","TBMM'nin Açılışı ve İç İsyanlar","TBMM hangi tarihte açılmıştır?",{"A":"19 Mayıs 1919","B":"23 Nisan 1920","C":"29 Ekim 1923","D":"30 Ağustos 1922","E":"1 Kasım 1922"},"B","TBMM 23 Nisan 1920'de açılmıştır.","kolay"],
  ["tarih","Atatürk İlkeleri","Milli egemenliği esas alan Atatürk ilkesi hangisidir?",{"A":"Devletçilik","B":"Laiklik","C":"Cumhuriyetçilik","D":"İnkılapçılık","E":"Halkçılık"},"C","Cumhuriyetçilik milli egemenlik ilkesini esas alır.","kolay"],
  ["cografya","Dünya'nın Şekli ve Hareketleri","Dünya'nın kendi ekseni etrafındaki hareketine ne ad verilir?",{"A":"Yıllık hareket","B":"Günlük hareket","C":"Presesyon","D":"Devrim hareketi","E":"Öteleme"},"B","Dünya'nın ekseni etrafındaki dönüşü günlük harekettir.","kolay"],
  ["cografya","Coğrafi Konum","Paraleller hangi yönde uzanır?",{"A":"Kuzey-güney","B":"Doğu-batı","C":"Kuzeydoğu-güneybatı","D":"Dikey","E":"Meridyenlerle aynı"},"B","Paraleller doğu-batı doğrultusunda uzanır.","kolay"],
  ["cografya","İklim Bilgisi","Sıcaklığın ekvatordan kutuplara doğru genel olarak azalmasının temel nedeni nedir?",{"A":"Nemlilik","B":"Basınç","C":"Güneş ışınlarının geliş açısı","D":"Rüzgârlar","E":"Bitki örtüsü"},"C","Güneş ışınlarının geliş açısı kutuplara doğru küçülür.","orta"],
  ["cografya","Türkiye'de Nüfus","Türkiye'de nüfusun yoğun olduğu alanlarda aşağıdakilerden hangisinin etkisi daha belirgindir?",{"A":"Aşırı yükselti","B":"Ulaşım ve ekonomik imkânlar","C":"Kuraklık","D":"Don olayları","E":"Engebeli arazi"},"B","Ulaşım ve ekonomik faaliyetler nüfus yoğunluğunu artırabilir.","orta"],
  ["cografya","Göç","İnsanların iş bulma amacıyla başka bir yerleşmeye gitmesine ne ad verilir?",{"A":"Mevsimlik göç","B":"Ekonomik göç","C":"Zorunlu göç","D":"Turistik göç","E":"Tersine göç"},"B","İş ve geçim amacı ekonomik göçün temel nedenlerindendir.","kolay"],
  ["cografya","Ekonomik Faaliyetler","Tarımda makine kullanımının artması aşağıdakilerden hangisine doğrudan katkı sağlar?",{"A":"İş gücü ihtiyacının artmasına","B":"Üretim hızının artmasına","C":"Yer şekillerinin değişmesine","D":"İklimin değişmesine","E":"Nüfusun tamamen azalmasına"},"B","Makineleşme tarımsal üretimin hızını ve verimliliğini artırabilir.","kolay"],
  ["vatandaslik","Hukukun Temel Kavramları","Hukuk kurallarını diğer toplumsal kurallardan ayıran temel özelliklerden biri nedir?",{"A":"Gönüllü olması","B":"Devlet yaptırımına bağlı olması","C":"Sadece aile içinde geçerli olması","D":"Yazısız olması","E":"Değişmez olması"},"B","Hukuk kurallarının devlet tarafından uygulanan yaptırımları vardır.","orta"],
  ["vatandaslik","1982 Anayasası Genel Esasları","Türkiye Cumhuriyeti'nin yönetim şekli nedir?",{"A":"Monarşi","B":"Oligarşi","C":"Cumhuriyet","D":"Teokrasi","E":"Federasyon"},"C","Anayasa'nın 1. maddesine göre devletin şekli Cumhuriyettir.","kolay"],
  ["vatandaslik","Yasama (TBMM)","Türkiye'de yasama yetkisi hangi organa aittir?",{"A":"Cumhurbaşkanı","B":"TBMM","C":"Anayasa Mahkemesi","D":"Bakanlıklar","E":"Danıştay"},"B","Yasama yetkisi Türk Milleti adına TBMM'ye aittir.","kolay"],
  ["vatandaslik","Yürütme","Yürütme yetkisi ve görevi Anayasa'ya göre kime aittir?",{"A":"TBMM","B":"Cumhurbaşkanı","C":"Anayasa Mahkemesi","D":"Danıştay","E":"Sayıştay"},"B","Yürütme yetkisi ve görevi Cumhurbaşkanı tarafından kullanılır.","kolay"],
  ["vatandaslik","Yargı","Anayasa'ya göre yargı yetkisi kim tarafından kullanılır?",{"A":"TBMM adına","B":"Cumhurbaşkanı adına","C":"Bağımsız ve tarafsız mahkemelerce","D":"Bakanlıklarca","E":"Valiliklerce"},"C","Yargı yetkisi bağımsız ve tarafsız mahkemelerce kullanılır.","orta"],
  ["vatandaslik","Temel Hak ve Özgürlükler","Kişinin düşüncelerini açıklayabilmesi hangi hakla ilgilidir?",{"A":"Mülkiyet hakkı","B":"Düşünce ve kanaat özgürlüğü","C":"Seçme hakkı","D":"Çalışma hakkı","E":"Dilekçe hakkı"},"B","Düşünce ve kanaat özgürlüğü bu alanı kapsar.","kolay"],
  ["vatandaslik","Uluslararası Kuruluşlar (BM, AB, NATO vb.)","NATO'nun temel amacı aşağıdakilerden hangisiyle daha yakından ilgilidir?",{"A":"Kültürel mirasın korunması","B":"Kolektif savunma","C":"Para politikası","D":"Tarım politikası","E":"Spor organizasyonu"},"B","NATO kolektif savunma anlayışına dayalı bir ittifaktır.","kolay"],
  ["matematik","Yüzde Problemleri","200'ün %15'i kaçtır?",{"A":"15","B":"20","C":"25","D":"30","E":"35"},"D","200 × 0,15 = 30.","kolay"],
  ["matematik","Kar - Zarar Problemleri","100 TL maliyetli bir ürün 120 TL'ye satılırsa kâr oranı yüzde kaçtır?",{"A":"10","B":"15","C":"20","D":"25","E":"30"},"C","20 TL kâr, 100 TL maliyetin %20'sidir.","kolay"],
  ["matematik","Olasılık","Adil bir zar atıldığında çift sayı gelme olasılığı nedir?",{"A":"1/6","B":"1/3","C":"1/2","D":"2/3","E":"5/6"},"C","Çift sayılar 2,4,6 olmak üzere 3 elverişli sonuç vardır: 3/6=1/2.","kolay"]
];

if (db.prepare("SELECT COUNT(*) AS n FROM questions").get().n === 0) {
  const insert = db.prepare(`INSERT INTO questions
    (id, subject, topic, question, options, correct_answer, explanation, difficulty, source, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seed', 'system')`);
  const insertMany = db.transaction(rows => {
    rows.forEach((q, i) => insert.run(`seed-${String(i + 1).padStart(3, "0")}`, q[0], q[1], q[2], JSON.stringify(q[3]), q[4], q[5], q[6]));
  });
  insertMany(poolSeed);
}

module.exports = db;
