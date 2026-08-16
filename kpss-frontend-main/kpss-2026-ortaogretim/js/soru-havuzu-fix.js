/* Soru Havuzu entegrasyonu: ortak navigasyonu bozmaz, sayfayı app.js üzerinden render eder. */
(function () {
  "use strict";

  function install() {
    if (typeof window.renderSoruHavuzu !== "function") return;
    if (window.__soruHavuzuRenderWrapped) return;

    const eskiRenderSayfa = window.renderSayfa;
    window.renderSayfa = function (sayfaId) {
      if (sayfaId === "soru-havuzu") {
        window.renderSoruHavuzu();
        return;
      }
      return eskiRenderSayfa(sayfaId);
    };
    window.__soruHavuzuRenderWrapped = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
