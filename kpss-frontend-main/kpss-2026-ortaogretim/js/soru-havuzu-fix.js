/*
 * Soru Havuzu fix dosyası artık ortak navigation stabilizer olarak kullanılır.
 * Eski renderSayfa wrapper'ı kaldırıldı; global click capture kullanılmaz.
 */
(function () {
  "use strict";

  function replaceButtons() {
    document.querySelectorAll(".nav-item, .bn-item").forEach((oldBtn) => {
      const btn = oldBtn.cloneNode(true);
      oldBtn.replaceWith(btn);
    });
  }

  function bindNavigation() {
    replaceButtons();

    document.querySelectorAll(".nav-item, .bn-item").forEach((btn) => {
      const page = btn.dataset.page;
      // study.js kendi capture listener'ıyla Ders Çalış'ı yönetiyor.
      if (page === "calisma") return;

      btn.addEventListener("click", (event) => {
        event.preventDefault();
        if (typeof sayfaGec !== "function") return;
        sayfaGec(page);
        if (page === "soru-havuzu" && typeof renderSoruHavuzu === "function") {
          renderSoruHavuzu();
        }
      });
    });
  }

  function init() {
    setTimeout(bindNavigation, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
