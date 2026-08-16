/* ============================================================
   SORU HAVUZU
   Ayrı bölüm: mevcut kalıcı sorulardan rastgele test oluşturur.
   ============================================================ */
(function () {
  "use strict";

  const POOL_PATH = "/api/questions/pool";
  let currentPool = [];
  let filters = { ders: "tumu", konu: "tumu", zorluk: "tumu", sayi: 10 };

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
  }

  function poolPageAc() {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    const root = document.querySelector("#page-soru-havuzu");
    if (!root) return;
    root.classList.add("active");
    document.querySelectorAll(".nav-item, .bn-item").forEach((b) => {
      b.classList.toggle("active", b.dataset.page === "soru-havuzu");
    });
    render();
    yukle();
    window.scrollTo(0, 0);
  }

  function render() {
    const root = document.querySelector("#page-soru-havuzu");
    if (!root) return;

    const dersler = Array.isArray(window.SUBJECTS_META) ? window.SUBJECTS_META : [];
    const konular = filters.ders === "tumu"
      ? []
      : (dersler.find((d) => String(d.id) === String(filters.ders))?.konular || []);

    root.innerHTML = `
      <div class="page-head">
        <h1>📚 Soru Havuzu</h1>
        <div class="alt">Daha önce kaydedilmiş sorulardan rastgele test oluştur.</div>
      </div>
      <div class="card card-pad">
        <div class="section-title">Filtreler</div>
        <div class="grid grid-2">
          <div class="field">
            <label>Ders</label>
            <select id="poolDers">
              <option value="tumu">Tüm Dersler</option>
              ${dersler.map((d) => `<option value="${esc(d.id)}" ${String(filters.ders) === String(d.id) ? "selected" : ""}>${esc(d.name)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label>Konu</label>
            <select id="poolKonu">
              <option value="tumu">Tüm Konular</option>
              ${konular.map((k) => `<option value="${esc(k.ad || k.id)}" ${String(filters.konu) === String(k.ad || k.id) ? "selected" : ""}>${esc(k.ad || k.id)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label>Zorluk</label>
            <select id="poolZorluk">
              <option value="tumu">Tüm Zorluklar</option>
              <option value="kolay" ${filters.zorluk === "kolay" ? "selected" : ""}>Kolay</option>
              <option value="orta" ${filters.zorluk === "orta" ? "selected" : ""}>Orta</option>
              <option value="zor" ${filters.zorluk === "zor" ? "selected" : ""}>Zor</option>
            </select>
          </div>
          <div class="field">
            <label>Soru sayısı</label>
            <select id="poolSayi">
              <option value="10" ${filters.sayi === 10 ? "selected" : ""}>10 soru</option>
              <option value="20" ${filters.sayi === 20 ? "selected" : ""}>20 soru</option>
              <option value="40" ${filters.sayi === 40 ? "selected" : ""}>40 soru</option>
            </select>
          </div>
        </div>
        <button type="button" class="btn btn-primary" id="poolGetirBtn">Soruları Getir</button>
      </div>
      <div class="card card-pad" id="poolSonuc">
        <div class="empty-state">Sorular yükleniyor…</div>
      </div>
    `;

    document.querySelector("#poolDers")?.addEventListener("change", (e) => {
      filters.ders = e.target.value;
      filters.konu = "tumu";
      render();
    });
    document.querySelector("#poolKonu")?.addEventListener("change", (e) => { filters.konu = e.target.value; });
    document.querySelector("#poolZorluk")?.addEventListener("change", (e) => { filters.zorluk = e.target.value; });
    document.querySelector("#poolSayi")?.addEventListener("change", (e) => { filters.sayi = Number(e.target.value); });
    document.querySelector("#poolGetirBtn")?.addEventListener("click", yukle);
  }

  async function yukle() {
    const root = document.querySelector("#poolSonuc");
    if (!root) return;
    const base = typeof apiBaseUrlAl === "function" ? apiBaseUrlAl() : "";
    if (!base) {
      root.innerHTML = `<div class="empty-state">Önce Ayarlar bölümünden backend adresini kaydet.</div>`;
      return;
    }

    root.innerHTML = `<div class="empty-state">Sorular getiriliyor…</div>`;
    try {
      const params = new URLSearchParams({
        ders: filters.ders,
        konu: filters.konu,
        zorluk: filters.zorluk,
        sayi: String(filters.sayi)
      });
      const response = await fetch(`${base}${POOL_PATH}?${params.toString()}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.sorular)) {
        throw new Error(data.hata || "Soru havuzu yüklenemedi.");
      }
      currentPool = data.sorular;
      cizSonuc();
    } catch (error) {
      console.error("[soru-havuzu]", error);
      root.innerHTML = `<div class="empty-state">${esc(error.message || "Sunucu bağlantısı başarısız.")}</div>`;
    }
  }

  function cizSonuc() {
    const root = document.querySelector("#poolSonuc");
    if (!root) return;
    if (!currentPool.length) {
      root.innerHTML = `<div class="empty-state">Bu filtrelerle eşleşen soru bulunamadı.</div>`;
      return;
    }

    root.innerHTML = `
      <div class="section-title">
        <span>${currentPool.length} soru bulundu</span>
        <button type="button" class="btn btn-accent btn-sm" id="poolTestBtn">Testi Başlat</button>
      </div>
      <div class="pool-soru-list">
        ${currentPool.map((q, i) => `
          <div class="card card-pad" style="margin-bottom:10px;">
            <strong>${i + 1}. ${esc(q.question)}</strong>
            <div class="alt" style="margin-top:6px;">${esc(q.subject || "")} · ${esc(q.topic || "")}</div>
          </div>
        `).join("")}
      </div>
    `;

    document.querySelector("#poolTestBtn")?.addEventListener("click", () => {
      if (typeof testModalBaslat === "function") {
        testModalBaslat(currentPool, `📚 Soru Havuzu (${currentPool.length} Soru)`);
      } else {
        toast("Test ekranı henüz hazır değil.");
      }
    });
  }

  window.renderSoruHavuzu = poolPageAc;

  document.addEventListener("click", (event) => {
    const btn = event.target.closest?.("[data-page='soru-havuzu']");
    if (!btn) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    poolPageAc();
  }, true);
})();
