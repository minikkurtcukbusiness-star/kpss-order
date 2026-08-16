/* ============================================================
   TEST ETKİLEŞİM — ACİL VE KALICI DÜZELTME
   Seçeneklerin gerçekten tıklanabilmesini garanti eder.
   ============================================================ */
(function () {
  'use strict';

  const style = document.createElement('style');
  style.id = 'test-interaction-emergency-style';
  style.textContent = `
    #modalOverlay.open { display:flex !important; position:fixed !important; inset:0 !important; z-index:2147483000 !important; pointer-events:auto !important; }
    #modalOverlay.open #modalBox { position:relative !important; z-index:2147483001 !important; pointer-events:auto !important; }
    #modalOverlay.open button, #modalOverlay.open [data-secenek], #modalOverlay.open [data-deneme-cevap] { pointer-events:auto !important; position:relative !important; z-index:2147483002 !important; cursor:pointer !important; }
    #modalOverlay.open .modal-body, #modalOverlay.open .modal-foot { pointer-events:auto !important; }
  `;
  document.head.appendChild(style);

  function norm(v) { return String(v ?? '').trim().toUpperCase().replace(/[^A-E].*$/, '').charAt(0); }

  window.testModalBaslat = function (sorular, baslik, kayitCallback, bitisCallback) {
    if (!Array.isArray(sorular) || !sorular.length) {
      modalAc(baslik || 'Test', '<p>Gösterilecek soru bulunamadı.</p>', '<button type="button" class="btn btn-accent" id="testKapatBtn">Kapat</button>');
      document.querySelector('#testKapatBtn')?.addEventListener('click', modalKapat);
      return;
    }

    let index = 0, dogru = 0, yanlis = 0, cevaplandi = false;

    function ciz() {
      const s = sorular[index] || {};
      const opts = s.secenekler || s.options || {};
      const entries = ['A','B','C','D','E'].map(h => [h, opts[h] ?? opts[h.toLowerCase()] ?? '']).filter(([, text]) => String(text).trim() !== '');
      cevaplandi = false;

      modalAc(baslik || 'Test',
        `<div class="alt" style="margin-bottom:8px">Soru ${index + 1} / ${sorular.length}</div>
         <div style="font-weight:600;line-height:1.6;margin-bottom:16px">${s.soru || s.question || 'Soru metni bulunamadı.'}</div>
         <div id="testSecenekler" style="display:grid;gap:10px">
           ${entries.map(([h,text]) => `<button type="button" class="btn btn-outline test-option-fix" data-secenek="${h}" style="width:100%;display:flex;justify-content:flex-start;text-align:left;white-space:normal;min-height:44px;touch-action:manipulation"><strong style="margin-right:6px">${h})</strong><span>${text}</span></button>`).join('')}
         </div>
         <div id="testAciklama" style="margin-top:14px"></div>`,
        `<button type="button" class="btn btn-accent" id="testIleriBtn" style="display:none">${index + 1 < sorular.length ? 'Sonraki Soru →' : 'Testi Bitir'}</button>`
      );

      const buttons = Array.from(document.querySelectorAll('#testSecenekler [data-secenek]'));
      buttons.forEach(btn => btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (cevaplandi) return;
        cevaplandi = true;

        const secilen = norm(btn.dataset.secenek);
        const dogruCevap = norm(s.dogruCevap ?? s.correctAnswer ?? s.correct_answer ?? s.cevap);
        const dogruMu = !!dogruCevap && secilen === dogruCevap;

        buttons.forEach(b => { b.disabled = true; b.style.pointerEvents = 'none'; });
        btn.style.border = '2px solid ' + (dogruMu ? 'var(--success,#3E8E63)' : 'var(--danger,#C0483D)');
        btn.style.background = dogruMu ? 'var(--success-tint,#E5F2EA)' : 'var(--danger-tint,#FBEAE8)';

        if (!dogruMu && dogruCevap) {
          const dogruBtn = buttons.find(b => norm(b.dataset.secenek) === dogruCevap);
          if (dogruBtn) { dogruBtn.style.border = '2px solid var(--success,#3E8E63)'; dogruBtn.style.background = 'var(--success-tint,#E5F2EA)'; }
        }

        if (dogruMu) dogru++; else yanlis++;
        const aciklama = s.aciklama || s.explanation || '';
        const bilgi = document.querySelector('#testAciklama');
        if (bilgi) bilgi.innerHTML = `<strong>${dogruCevap ? 'Doğru cevap: ' + dogruCevap : 'Cevap kaydedildi.'}</strong>${aciklama ? '<br>' + aciklama : ''}`;

        const ileri = document.querySelector('#testIleriBtn');
        if (ileri) {
          ileri.style.display = 'inline-flex';
          ileri.onclick = function (ev) {
            ev.preventDefault(); index++;
            if (index < sorular.length) ciz();
            else {
              modalAc(baslik || 'Test', `<div style="text-align:center;padding:20px"><div style="font-size:30px;font-weight:700">${dogru} / ${sorular.length}</div><div class="alt">Doğru: ${dogru} · Yanlış: ${yanlis}</div></div>`, '<button type="button" class="btn btn-accent" id="testKapatBtn">Kapat</button>');
              document.querySelector('#testKapatBtn')?.addEventListener('click', modalKapat);
              if (typeof bitisCallback === 'function') bitisCallback();
            }
          };
        }
        if (typeof kayitCallback === 'function') kayitCallback(s, dogruMu);
      }));
    }

    ciz();
  };
})();
