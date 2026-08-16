/* ============================================================
   SORU HAVUZU
   Kalıcı ve hızlı soru havuzu sayfası
   ============================================================ */
(function(){
  const POOL_PATH = "/api/questions/pool";
  let currentPool = [];
  let currentFilters = { ders: "tumu", konu: "tumu", zorluk: "tumu", sayi: 20 };

  function esc(s){ return String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;',">":'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function poolUret() {
    const params = new URLSearchParams(currentFilters);
    fetch(apiBaseUrlAl() + POOL_PATH + '?' + params)
      .then(r => r.json())
      .then(data => {
        if (data.sorular) {
          currentPool = data.sorular;
          renderPool();
        } else if (data.hata) {
          toast(data.hata);
        } else {
          toast('Soru havuzu yüklenemedi');
        }
      })
      .catch(err => {
        console.error('[soru-havuzu]', err);
        toast('Sunucu bağlantısı hatası');
      });
  }

  function renderPool() {
    const container = $("#page-soru-havuzu");
    if (!container) return;

    const sayi = currentFilters.sayi;
    const denemeSoruSayisi = Math.min(sayi, Math.min(20, currentPool.length));

    container.innerHTML = `
      <div class="page-head">
        <h1>📚 Soru Havuzu</h1>
        <div class="alt">Kalıcı ve hızlı soru havuzundan test oluştur</div>
      </div>

      <div class="card card-pad">
        <h3>Filtreler</h3>
        <div class="grid grid-2">
          <div class="field">
            <label>Ders</label>
            <select id="poolDers">
              <option value="tumu" ${currentFilters.ders === 'tumu' ? 'selected' : ''}>Tüm Dersler</option>
              ${SUBJECTS_META.map(d => `<option value="${d.id}" ${currentFilters.ders === d.id ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label>Konu</label>
            <select id="poolKonu">
              <option value="tumu" ${currentFilters.konu === 'tumu' ? 'selected' : ''}>Tüm Konular</option>
            </select>
          </div>
          <div class="field">
            <label>Zorluk</label>
            <select id="poolZorluk">
              <option value="tumu" ${currentFilters.zorluk === 'tumu' ? 'selected' : ''}>Tüm Zorluk</option>
              <option value="kolay" ${currentFilters.zorluk === 'kolay' ? 'selected' : ''}>Kolay</option>
              <option value="orta" ${currentFilters.zorluk === 'orta' ? 'selected' : ''}>Orta</option>
              <option value="zor" ${currentFilters.zorluk === 'zor' ? 'selected' : ''}>Zor</option>
            </select>
          </div>
          <div class="field">
            <label>Soru Sayısı</label>
            <select id="poolSayi">
              <option value="10" ${currentFilters.sayi === 10 ? 'selected' : ''}>10</option>
              <option value="20" ${currentFilters.sayi === 20 ? 'selected' : ''}>20</option>
              <option value="40" ${currentFilters.sayi === 40 ? 'selected' : ''}>40</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" id="poolFiltreleBtn">Filtrele</button>
      </div>

      <div class="card card-pad" id="poolBilgi">
        <div class="pool-info">
          <span class="pool-icon">📚</span>
          <div>
            <strong>Toplam Soru: ${currentPool.length}</strong>
            <div class="alt">Şu an: ${sayi} soru test için seçildi</div>
          </div>
        </div>
      </div>

      ${currentPool.length ? `
      <div class="card card-pad">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3>Test Oluştur (${denemeSoruSayisi} soru)</h3>
          <button class="btn btn-accent" id="poolTestOlusturBtn">Testi Başlat</button>
        </div>
        <div class="pool-soru-list">
          ${currentPool.slice(0, sayi).map((q, i) => `
            <div class="pool-soru-item">
              <span class="pool-index">${i+1}.</span>
              <div class="pool-soru-text">${esc(q.question || '')}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    `;

    // Event listeners
    $('#poolDers').addEventListener('change', (e) => {
      currentFilters.ders = e.target.value;
      updateKonuFiltresi();
    });

    $('#poolKonu').addEventListener('change', (e) => {
      currentFilters.konu = e.target.value;
    });

    $('#poolZorluk').addEventListener('change', (e) => {
      currentFilters.zorluk = e.target.value;
    });

    $('#poolSayi').addEventListener('change', (e) => {
      currentFilters.sayi = Number(e.target.value);
      poolUret();
    });

    $('#poolFiltreleBtn').addEventListener('click', poolUret);
    $('#poolTestOlusturBtn').addEventListener('click', () => {
      testModalBaslat(currentPool.slice(0, currentFilters.sayi), 'Soru Havuzu Testi');
    });

    updateKonuFiltresi();
  }

  function updateKonuFiltresi() {
    const dersId = $('#poolDers')?.value;
    if (!dersId || dersId === 'tumu') {
      $('#poolKonu').innerHTML = '<option value="tumu">Tüm Konular</option>';
      return;
    }

    const konular = [];
    SUBJECTS_META.forEach(d => {
      if (d.id === dersId) {
        konular.push(...(d.konular || []).map(k => k.ad));
      }
    });

    $('#poolKonu').innerHTML = `
      <option value="tumu">Tüm Konular</option>
      ${konular.map(k => `<option value="${esc(k)}">${esc(k)}</option>`).join('')}
    `;
  }

  function poolPageAc() {
    const root = $("#page-soru-havuzu");
    if (!root) {
      document.querySelector("main.content")?.insertAdjacentHTML("beforeend", '<section class="page" data-page="soru-havuzu" id="page-soru-havuzu"></section>');
    }
    renderPool();
  }

  if (typeof window.renderSoruHavuzu === 'undefined') {
    window.renderSoruHavuzu = poolPageAc;
  }
})();