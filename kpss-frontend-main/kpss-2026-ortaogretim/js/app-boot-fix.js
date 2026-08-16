/* KPSS runtime recovery layer
   Keeps the existing app structure intact and makes navigation deterministic.
   It runs after all feature scripts so it can safely recover from a missing
   renderer or a script-level navigation conflict. */
(function () {
  "use strict";

  function pageRoot(page) {
    return document.querySelector('#page-' + page);
  }

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

      if (typeof fn === 'function') {
        fn();
        return true;
      }

      console.warn('[KPSS] Sayfa renderer bulunamadı:', page);
      return false;
    } catch (err) {
      console.error('[KPSS] Sayfa render hatası:', page, err);
      const root = pageRoot(page);
      if (root) {
        root.innerHTML = '<div class="card card-pad"><h3>Sayfa yüklenemedi</h3><p>Bu bölümde bir JavaScript hatası oluştu. Diğer bölümler çalışmaya devam ediyor.</p></div>';
      }
      return false;
    }
  }

  function activate(page) {
    if (!page) page = 'anasayfa';

    document.querySelectorAll('.page').forEach(function (el) {
      el.classList.toggle('active', el.dataset.page === page);
    });
    document.querySelectorAll('.nav-item, .bn-item').forEach(function (el) {
      el.classList.toggle('active', el.dataset.page === page);
    });

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

  function bind() {
    // Capture phase is intentional: several feature modules also listen for
    // navigation clicks. One deterministic handler prevents duplicate renders.
    document.addEventListener('click', navigationClick, true);

    const theme = document.querySelector('#temaToggleBtn');
    if (theme && !theme.dataset.runtimeRecoveryBound) {
      theme.dataset.runtimeRecoveryBound = '1';
      theme.addEventListener('click', function () {
        if (typeof window.temaDegistir === 'function') window.temaDegistir();
      });
    }

    if (typeof window.temaUygula === 'function') window.temaUygula();

    const active = document.querySelector('.nav-item.active')?.dataset.page || 'anasayfa';
    activate(active);
  }

  // Expose a single recovery renderer without replacing the original lexical
  // sayfaGec function. Existing application code therefore remains untouched.
  window.kpssRuntime = { activate, renderPage };

  window.addEventListener('error', function (e) {
    console.error('[KPSS] Yakalanan frontend hatası:', e.error || e.message);
  });
  window.addEventListener('unhandledrejection', function (e) {
    console.error('[KPSS] Yakalanan promise hatası:', e.reason);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }
})();
