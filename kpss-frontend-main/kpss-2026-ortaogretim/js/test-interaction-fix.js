/* ============================================================
   TEST ETKİLEŞİM DÜZELTMESİ
   Seçenek butonlarının tıklanmasını tek ve güvenilir akışta yönetir.
   ============================================================ */
(function () {
  function cevapNorm(v) {
    return String(v ?? '').trim().toUpperCase().replace(/[.)].*$/, '').charAt(0);
  }

  window.testModalBaslat = function (sorular, baslik, kayitCallback, bitisCallback) {
    let index = 0;
    let dogru = 0;
    let yanlis = 0;
    let cevaplandi = false;

    function soruCiz() {
      const s = sorular[index] || {};
      const secenekler = s.secenekler || s.options || {};
      const entries = Object.entries(secenekler).filter(([h, m]) => String(m ?? '').trim() !== '');
      cevaplandi = false;

      const html = `
        <div class="alt" style="margin-bottom:8px;">Soru ${index + 1} / ${sorular.length}</div>
        <div style="font-weight:600;line-height:1.55;margin-bottom:14px;">${s.soru || s.question || 'Soru metni bulunamadı.'}</div>
        <div id="testSecenekler" style="display:grid;gap:8px;">
          ${entries.map(([harf, metin]) => `
            <button type="button" class="btn btn-outline test-option-fix" data-secenek="${String(harf).toUpperCase()}" style="display:block;width:100%;text-align:left;white-space:normal;cursor:pointer;pointer-events:auto;position:relative;z-index:2;">
              <strong>${harf})</strong> ${metin}
            </button>`).join('')}
        </div>
        <div id="testAciklama" style="margin-top:12px;"></div>
      `;

      modalAc(baslik, html, `<button type="button" class="btn btn-accent" id="testIleriBtn" style="display:none;">${index + 1 < sorular.length ? 'Sonraki Soru' : 'Testi Bitir'}</button>`);

      const buttons = Array.from(document.querySelectorAll('#testSecenekler [data-secenek]'));
      buttons.forEach(btn => {
        btn.onclick = function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          if (cevaplandi) return;
          cevaplandi = true;

          const secilen = cevapNorm(btn.dataset.secenek);
          const dogruCevap = cevapNorm(s.dogruCevap ?? s.correctAnswer ?? s.correct_answer);
          const dogruMu = !!dogruCevap && secilen === dogruCevap;

          buttons.forEach(b => {
            b.disabled = true;
            b.style.pointerEvents = 'none';
          });

          btn.classList.remove('btn-outline');
          btn.style.borderWidth = '2px';
          btn.style.borderColor = dogruMu ? 'var(--success, #3E8E63)' : 'var(--danger, #C0483D)';
          btn.style.background = dogruMu ? 'var(--success-tint, #E5F2EA)' : 'var(--danger-tint, #FBEAE8)';

          if (!dogruMu && dogruCevap) {
            const dogruBtn = buttons.find(b => cevapNorm(b.dataset.secenek) === dogruCevap);
            if (dogruBtn) {
              dogruBtn.style.borderWidth = '2px';
              dogruBtn.style.borderColor = 'var(--success, #3E8E63)';
              dogruBtn.style.background = 'var(--success-tint, #E5F2EA)';
            }
          }

          if (dogruMu) dogru++; else yanlis++;

          const aciklama = s.aciklama || s.explanation || '';
          const aciklamaEl = document.querySelector('#testAciklama');
          if (aciklamaEl) {
            aciklamaEl.innerHTML = `<strong>${dogruCevap ? `Doğru cevap: ${dogruCevap}` : 'Cevap kaydedildi.'}</strong>${aciklama ? `<br>${aciklama}` : ''}`;
          }

          const ileri = document.querySelector('#testIleriBtn');
          if (ileri) {
            ileri.style.display = 'inline-flex';
            ileri.focus();
          }

          if (typeof kayitCallback === 'function') kayitCallback(s, dogruMu);
        };
      });

      const ileri = document.querySelector('#testIleriBtn');
      if (ileri) {
        ileri.type = 'button';
        ileri.onclick = function (ev) {
          ev.preventDefault();
          index++;
          if (index < sorular.length) {
            soruCiz();
            return;
          }
          modalAc(baslik, `
            <div style="text-align:center;padding:20px 0;">
              <div style="font-size:28px;font-weight:700;">${dogru} / ${sorular.length}</div>
              <div class="alt">Doğru: ${dogru} · Yanlış: ${yanlis}</div>
            </div>
          `, '<button type="button" class="btn btn-accent" id="testKapatBtn">Kapat</button>');
          document.querySelector('#testKapatBtn')?.addEventListener('click', modalKapat);
          if (typeof bitisCallback === 'function') bitisCallback();
        };
      }
    }

    if (!Array.isArray(sorular) || sorular.length === 0) {
      modalAc(baslik, '<p>Gösterilecek soru bulunamadı.</p>', '<button type="button" class="btn btn-accent" id="testKapatBtn">Kapat</button>');
      document.querySelector('#testKapatBtn')?.addEventListener('click', modalKapat);
      return;
    }
    soruCiz();
  };
})();
