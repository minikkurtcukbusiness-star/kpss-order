/*
 * Tek merkezden güvenli sidebar/bottom navigation.
 * Amaç: eski anonim click listener'larını çoğaltmadan menüleri deterministik tutmak.
 */
(function () {
  "use strict";

  function replaceButtons(selector) {
    document.querySelectorAll(selector).forEach((oldBtn) => {
      const btn = oldBtn.cloneNode(true);
      oldBtn.replaceWith(btn);
    });
  }

  function bind() {
    replaceButtons(".nav-item, .bn-item");

    document.querySelectorAll(".nav-item, .bn-item").forEach((btn) => {
      const page = btn.dataset.page;

      // study.js zaten capture aşamasında Ders Çalış'ı yönetiyor.
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

  document.addEventListener("DOMContentLoaded", () => {
    // app.js init önce çalışsın; sonra eski button listener'larını temizleyelim.
    setTimeout(bind, 0);
  });
})();
