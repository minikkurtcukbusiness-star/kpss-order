/* ============================================================
   SORU HAVUZU
   Kalıcı sorulardan rastgele test oluşturur.
   ============================================================ */
(function () {
  "use strict";

  const POOL_PATH = "/api/questions/pool";
  let currentPool = [];
  let filters = { ders: "tumu", konu: "tumu", zorluk: "tumu", sayi: 10 };

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function getSubjects() {
    try {
      if (typeof SUBJECTS_META !== "undefined" && Array.isArray(SUBJECTS_META)) return SUBJECTS_META;
    } catch (_) {}
    return [];
  }

  function poolPageAc() {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    const root = document.querySelector("#page-soru-havuzu");
    if (!root) return;
    root.classList.add("active");
    root.style.pointerEvents = "auto";
    root.style.position = "relative";
    root.style.zIndex = "2";
    document.querySelectorAll(".nav-item, .bn-item").forEach((b) => {
      b.classList.toggle("active", b.dataset.page === "soru-havuzu");
    });
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    const root = document.querySelector("#page-soru-havuzu");
    if (!root) return;

    const dersler = getSubjects();
    const konular = filters.ders === "tumu"
      ? []
      : (dersler.find((d) => String(d.id) === String(filters.ders))?.konular || []);

    root.innerHTML = `
      <div class="page-head">
        <h1>📚 Soru Havuzu</h1>
        <div class="alt">Daha önce kaydedilmiş sorulardan rastgele test oluştur.</div>
      </div>
      <div class="card card-pad soru-havuzu-panel">
        <div class="section-title">Filtreler</div>
        <div class="grid grid-2">
          <div class="field"><label for="poolDers">Ders</label>
            <select id="poolDers" class="pool-select">
              <option value="tumu">Tüm Dersler</option>
              ${dersler.map((d) => `<option value="${esc(d.id)}" ${String(filters.ders) === String(d.id) ? "selected" : ""}>${esc(d.name)}</option>`).join("")}
            </select>
          </div>
          <div class="field"><label for="poolKonu">Konu</label>
            <select id="poolKonu" class="pool-select">
              <option value="tumu">Tüm Konular</option>
              ${konular.map((k) => `<option value="${esc(k.ad || k.id)}" ${String(filters.konu) === String(k.ad || k.id) ? "selected" : ""}>${esc(k.ad || k.id)}</option>`).join("")}
            </select>
          </div>
          <div class="field"><label for="poolZorluk">Zorluk</label>
            <select id="poolZorluk" class="pool-select">
              <option value="tumu">Tüm Zorluklar</option>
              <option value="kolay" ${filters.zorluk === "kolay" ? "selected" : ""}>Kolay</option>
              <option value="orta" ${filters.zorluk === "orta" ? "selected" : ""}>Orta</option>
              <option value="zor" ${filters.zorluk === "zor" ? "selected" : ""}>Zor</option>
            </select>
          </div>
          <div class="field"><label for="poolSayi">Soru Sayısı</label>
            <select id="poolSayi" class="pool-select">
              <option value="10" ${filters.sayi === 10 ? "selected" : ""}>10 soru</option>
              <option value="20" ${filters.sayi === 20 ? "selected" : ""}>20 soru</option>
              <option value="40" ${filters.sayi === 40 ? "selected" : ""}>40 soru</option>
            </select>
          </div>
        </div>
        <button type="button" class="btn btn-primary" id="poolGetirBtn">Soruları Getir</button>
      </div>
      <div class="card card-pad" id="poolSonuc"><div class="empty-state">Henüz soru yüklenmedi.</div></div>
    `;

    const dersEl = document.querySelector("#poolDers");
    const konuEl = document.querySelector("#poolKonu");
    const zorlukEl = document.querySelector("#poolZorluk");
    const sayiEl = document.querySelector("#poolSayi");
    const getirEl = document.querySelector("#poolGetirBtn");

    dersEl?.addEventListener("change", (e) => {
      filters.ders = e.target.value;
      filters.konu = "tumu";
      render();
    });
    konuEl?.addEventListener("change", (e) => { filters.konu = e.target.value; });
    zorlukEl?.addEventListener("change", (e) => { filters.zorluk = e.target.value; });
    sayiEl?.addEventListener("change", (e) => { filters.sayi = Number(e.target.value) || 10; });
    getirEl?.addEventListener("click", (e) => { e.preventDefault(); yukle(); });
  }

  async function yukle() {
    const root = document.querySelector("#poolSonuc");
    if (!root) return;
    root.innerHTML = `<div class="empty-state">Sorular getiriliyor…</div>`;

    if (typeof apiIstek !== "function") {
      root.innerHTML = `<div class="empty-state">API istemcisi yüklenemedi. Sayfayı yenileyin.</div>`;
      return;
    }

    try {
      const params = new URLSearchParams({
        ders: filters.ders,
        konu: filters.konu,
        zorluk: filters.zorluk,
        sayi: String(filters.sayi)
      });
      const sonuc = await apiIstek(`${POOL_PATH}?${params.toString()}`, { timeoutMs: 15000 });
      if (!sonuc.ok) throw new Error(sonuc.mesaj || "Soru havuzu yüklenemedi.");
      currentPool = Array.isArray(sonuc.veri?.sorular) ? sonuc.veri.sorular : [];
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
      <div class="section-title"><span>${currentPool.length} soru bulundu</span><button type="button" class="btn btn-accent btn-sm" id="poolTestBtn">Testi Başlat</button></div>
      <div class="pool-soru-list">${currentPool.map((q, i) => `<div class="card card-pad" style="margin-bottom:10px;"><strong>${i + 1}. ${esc(q.question)}</strong><div class="alt" style="margin-top:6px;">${esc(q.subject || "")} · ${esc(q.topic || "")}</div></div>`).join("")}</div>`;
    document.querySelector("#poolTestBtn")?.addEventListener("click", () => {
      if (typeof testModalBaslat === "function") testModalBaslat(currentPool, `📚 Soru Havuzu (${currentPool.length} Soru)`);
      else toast("Test ekranı henüz hazır değil.");
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
