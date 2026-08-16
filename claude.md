# KPSS Uygulaması - Geliştirme Kuralları

## 1. Proje Mimarisi

Bu proje mevcut mimarisi korunarak geliştirilecektir.

Frontend:
- Vanilla JavaScript
- HTML
- CSS
- Framework ekleme (React, Vue vb.) yapma.

Backend:
- Node.js
- Express.js
- SQLite
- Mevcut backend yapısını koru.

Mevcut klasör yapısını gereksiz yere değiştirme.

## 2. Temel Kural

Önce mevcut kodu oku ve sorunun nedenini anla.

Sonra sadece gerekli dosyalarda minimum değişiklik yap.

Çalışan özellikleri gereksiz yere yeniden yazma.

Aynı işi yapan yeni sistem oluşturma.

Mevcut fonksiyon veya sistemi değiştirmeden önce nerelerde kullanıldığını kontrol et.

## 3. Bug Düzeltme

Bir hata düzeltirken:

1. Hatanın gerçek nedenini bul.
2. İlgili dosyaları incele.
3. Fonksiyonun diğer kullanım yerlerini kontrol et.
4. Minimum değişiklik yap.
5. Değişiklik sonrası ilgili özelliği test et.
6. Başka özelliklerin bozulmadığını kontrol et.

Sadece semptomu gizleyen geçici çözümler kullanma.

## 4. Dosya Yönetimi

Gereksiz dosya oluşturma.

Mevcut dosyanın görevini yerine getirebiliyorsan yeni dosya oluşturma.

Bir dosyayı silmeden önce:
- Nerelerde kullanıldığını kontrol et.
- HTML script bağlantılarını kontrol et.
- Fonksiyon çağrılarını kontrol et.
- Başka dosyaların bağımlılığını kontrol et.

Bir dosyayı silmek veya büyük ölçüde değiştirmek gerekiyorsa önce kullanıcıdan onay iste.

## 5. JavaScript

Mevcut Vanilla JS yapısını koru.

Global fonksiyonları değiştirmeden önce nerelerde kullanıldığını kontrol et.

Event listener çakışmalarına dikkat et.

Aynı buton için birden fazla event listener oluşturma.

Mevcut state, localStorage ve uygulama akışını gereksiz yere değiştirme.

## 6. API ve Backend

Mevcut API endpointlerini gereksiz yere değiştirme.

Bir endpoint değiştirilecekse frontend'deki kullanım yerlerini de kontrol et.

API hatalarında kullanıcıya anlaşılır hata göster.

Timeout, 429, 5xx ve bağlantı hatalarını güvenli şekilde ele al.

AI API çağrılarında gereksiz tekrar istekleri oluşturma.

## 7. AI Soru Üretimi

AI tarafından üretilen JSON verisini güvenli şekilde doğrula.

Türkçe karakterleri ve Unicode karakterleri koru.

JSON parsing sırasında Türkçe karakterlerin bozulmasına izin verme.

Eksik veya geçersiz soru geldiğinde uygulamanın tamamen çökmesini engelle.

Bir AI modeli hata verdiğinde aynı isteği sonsuza kadar tekrar gönderme.

## 8. Türkçe ve Unicode

Uygulama Türkçe olduğu için:

- ğ
- ü
- ş
- ı
- ö
- ç
- İ

gibi karakterleri koru.

Encoding değişiklikleri yapma.

UTF-8 kullanımını koru.

String işlemlerinde Unicode uyumluluğuna dikkat et.

## 9. UI / UX

Mevcut tasarım dilini koru.

Yeni özellik eklerken mevcut tasarımla uyumlu çalış.

Gereksiz popup, modal veya buton ekleme.

Mobil görünümü bozma.

Loading ve hata durumlarında kullanıcıya geri bildirim göster.

## 10. Çalışma Sistemi

Çalışma Merkezi, Pomodoro, Focus Hub ve çalışma kayıtlarının mevcut yapısını koru.

"Çalış" butonu gibi bir özellik bozuksa önce event listener, DOM, data attribute ve fonksiyon bağlantılarını kontrol et.

Aynı özelliği birden fazla farklı sistemle çözmeye çalışma.

## 11. Test Sistemi

5 soruda çalışan sistemin 20 veya 40 soruda da çalışmasını sağla.

AI soru üretiminde:
- JSON sınırlarını
- token limitlerini
- timeoutları
- rate limitleri
- duplicate soruları
- eksik soruları

kontrol et.

## 12. Değişiklik Yapmadan Önce

Küçük bug düzeltmelerinde gerekli dosyaları okuyarak doğrudan çözüm üret.

Büyük mimari değişikliklerde kullanıcıdan önce onay al.

Kullanıcı istemediği sürece:
- framework değiştirme
- veritabanı değiştirme
- API sağlayıcısı değiştirme
- klasör yapısını değiştirme
- çalışan sistemi baştan yazma.

## 13. Git

Git geçmişini bozma.

Kullanıcı istemeden:
- git reset
- git checkout
- git clean
- force push

kullanma.

GitHub'a push yapmadan önce değişiklikleri kontrol et.

## 14. Güvenlik

API anahtarlarını kaynak koduna yazma.

.env dosyalarını Git'e ekleme.

Gizli anahtarları terminal çıktısında gösterme.

Mevcut API anahtarlarını değiştirme veya silme.

## 15. Çalışma Şekli

Her görevde şu sırayı takip et:

1. İsteği anla.
2. İlgili dosyaları bul.
3. Mevcut kodu oku.
4. Sorunun nedenini belirle.
5. Minimum değişiklik yap.
6. Değişikliği test et.
7. Sonucu kontrol et.
8. Kullanıcıya kısa bir özet ver.

## 16. Büyük Değişiklikler

Birden fazla sistemi etkileyen büyük bir değişiklik gerekiyorsa önce:

- hangi dosyaların değişeceğini
- neden değişeceğini
- mevcut özelliklere etkisini

açıkla ve kullanıcı onayı olmadan uygulama.

## 17. En Önemli Kural

Amaç sadece kod yazmak değil, mevcut KPSS uygulamasını bozmadan geliştirmektir.

Her zaman:

MEVCUT SİSTEMİ KORU → SORUNU BUL → MİNİMUM DEĞİŞİKLİK → TEST ET
