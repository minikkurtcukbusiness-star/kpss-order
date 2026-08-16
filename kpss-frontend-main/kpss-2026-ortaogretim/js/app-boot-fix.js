/* KPSS runtime recovery layer
   Keeps the existing app structure intact and makes navigation deterministic. */
(function () {
  "use strict";

  function pageRoot(page) { return document.querySelector('#page-' + page); }

  function renderPage(page) {
    try {
      const fn = {
        anasayfa: window.renderAnaSayfa,
        calisma: window.renderCalisma,
        dersler: window.renderDersler,
        plan: window.renderPlan,
        denemeler: window.renderDenemeler,
        istatistik: window.renderIstatistik,
        guncel: window.renderGuncel,
        'soru-havuzu': window.renderSoruHavuzu,
        ayarlar: window.renderAyarlar
      }[page];
      if (typeof fn === 'function') { fn(); return true; }
      console.warn('[KPSS] Sayfa renderer bulunamadı:', page);
      return false;
    } catch (err) {
      console.error('[KPSS] Sayfa render hatası:', page, err);
      const root = pageRoot(page);
      if (root) root.innerHTML = '<div class="card card-pad"><h3>Sayfa yüklenemedi</h3><p>Bu bölümde bir JavaScript hatası oluştu. Diğer bölümler çalışmaya devam ediyor.</p></div>';
      return false;
    }
  }

  function activate(page) {
    page = page || 'anasayfa';
    document.querySelectorAll('.page').forEach(function (el) { el.classList.toggle('active', el.dataset.page === page); });
    document.querySelectorAll('.nav-item, .bn-item').forEach(function (el) { el.classList.toggle('active', el.dataset.page === page); });
    if (window.uiState) window.uiState.sayfa = page;
    renderPage(page);
    window.scrollTo(0, 0);
  }

  function navigationClick(e) {
    const btn = e.target.closest && e.target.closest('.nav-item, .bn-item');
    if (!btn || !btn.dataset.page) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    activate(btn.dataset.page);
  }

  function patchGlobalNavigation() {
    if (typeof window.sayfaGec !== 'function' || window.sayfaGec.__kpssRecovery) return;
    const original = window.sayfaGec;
    function recoveredSayfaGec(page) {
      if (page === 'calisma' || page === 'soru-havuzu') {
        activate(page);
        return;
      }
      return original(page);
    }
    recoveredSayfaGec.__kpssRecovery = true;
    window.sayfaGec = recoveredSayfaGec;
  }

  function bind() {
    patchGlobalNavigation();
    document.addEventListener('click', navigationClick, true);
    if (typeof window.temaUygula === 'function') window.temaUygula();
    const active = document.querySelector('.nav-item.active')?.dataset.page || 'anasayfa';
    activate(active);
  }

  window.kpssRuntime = { activate, renderPage };
  window.addEventListener('error', function (e) { console.error('[KPSS] Frontend hatası:', e.error || e.message); });
  window.addEventListener('unhandledrejection', function (e) { console.error('[KPSS] Promise hatası:', e.reason); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
})();
