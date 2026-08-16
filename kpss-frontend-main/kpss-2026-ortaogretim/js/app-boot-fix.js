/* KPSS navigation/runtime recovery
   The previous app.js contained two orphan code blocks that prevented the
   entire script from parsing. This small compatibility layer restores the
   current navigation after the known-good app core is loaded. */
(function () {
  function bindNavigation() {
    document.querySelectorAll('.nav-item, .bn-item').forEach(function (btn) {
      if (btn.dataset.navRecoveryBound === '1') return;
      btn.dataset.navRecoveryBound = '1';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof sayfaGec === 'function') sayfaGec(btn.dataset.page);
      });
    });
  }

  function renderCurrentPage(page) {
    if (page === 'anasayfa' && typeof renderAnaSayfa === 'function') return renderAnaSayfa();
    if (page === 'calisma' && typeof renderCalisma === 'function') return renderCalisma();
    if (page === 'dersler' && typeof renderDersler === 'function') return renderDersler();
    if (page === 'plan' && typeof renderPlan === 'function') return renderPlan();
    if (page === 'denemeler' && typeof renderDenemeler === 'function') return renderDenemeler();
    if (page === 'istatistik' && typeof renderIstatistik === 'function') return renderIstatistik();
    if (page === 'guncel' && typeof renderGuncel === 'function') return renderGuncel();
    if (page === 'soru-havuzu' && typeof renderSoruHavuzu === 'function') return renderSoruHavuzu();
    if (page === 'ayarlar' && typeof renderAyarlar === 'function') return renderAyarlar();
  }

  window.renderSayfa = renderCurrentPage;

  function bootRecovery() {
    bindNavigation();
    if (typeof temaUygula === 'function') temaUygula();
    var active = document.querySelector('.nav-item.active')?.dataset.page || 'anasayfa';
    if (typeof sayfaGec === 'function') sayfaGec(active);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootRecovery, { once: true });
  } else {
    bootRecovery();
  }
})();
