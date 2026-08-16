// LOCAL BROWSER TEST - Kendi tarayıcında çalıştır
// Chrome'u aç ve console'a bu script'i yapıştır

(async () => {
  console.log('=== LOCAL BROWSER AUTO TEST ===\n');

  let total = 0, passed = 0, failed = 0;

  const runTest = async (name, fn) => {
    total++;
    console.log(`[${name}]`);

    try {
      const result = await fn();

      if (result) {
        passed++;
        console.log(`  ✅ PASS\n`);
      } else {
        failed++;
        console.log(`  ❌ FAIL\n`);
      }

      return result;
    } catch (e) {
      failed++;
      console.log(`  ❌ ERROR: ${e.message}\n`);
      return false;
    }
  };

  // TEST 1: Ana Sayfa Navigasyonu
  await runTest('Ana Sayfa Navigasyonu', async () => {
    const btn = document.querySelector('.nav-item[data-page="anasayfa"]');
    if (!btn) throw new Error('Button not found');

    btn.click();
    await new Promise(r => setTimeout(r, 500));

    const page = document.querySelector('#page-anasayfa');
    return page && page.classList.contains('active');
  });

  // TEST 2: Dersler
  await runTest('Dersler', async () => {
    const btn = document.querySelector('.nav-item[data-page="dersler"]');
    if (!btn) throw new Error('Button not found');

    btn.click();
    await new Promise(r => setTimeout(r, 500));

    const page = document.querySelector('#page-dersler');
    return page && page.classList.contains('active');
  });

  // TEST 3: Ders Çalış
  await runTest('Ders Çalış', async () => {
    const btn = document.querySelector('.nav-item[data-page="calisma"]');
    if (!btn) throw new Error('Button not found');

    btn.click();
    await new Promise(r => setTimeout(r, 500));

    const page = document.querySelector('#page-calisma');
    return page && page.classList.contains('active');
  });

  // TEST 4: Soru Havuzu
  await runTest('Soru Havuzu', async () => {
    const btn = document.querySelector('.nav-item[data-page="soru-havuzu"]');
    if (!btn) throw new Error('Button not found');

    btn.click();
    await new Promise(r => setTimeout(r, 500));

    const page = document.querySelector('#page-soru-havuzu');
    return page && page.classList.contains('active');
  });

  // TEST 5: Ayarlar
  await runTest('Ayarlar', async () => {
    const btn = document.querySelector('.nav-item[data-page="ayarlar"]');
    if (!btn) throw new Error('Button not found');

    btn.click();
    await new Promise(r => setTimeout(r, 500));

    const page = document.querySelector('#page-ayarlar');
    return page && page.classList.contains('active');
  });

  // TEST 6: Mobile Bottom Nav
  await runTest('Mobile Bottom Navigation', async () => {
    const btns = document.querySelectorAll('.bn-item');
    if (btns.length === 0) throw new Error('No bottom buttons');

    btns[0].click();
    await new Promise(r => setTimeout(r, 500));

    const active = document.querySelector('.page.active');
    return active && active.dataset.page === btns[0].dataset.page;
  });

  // TEST 7: sayfaGec Function
  await runTest('sayfaGec Function', async () => {
    if (typeof sayfaGec !== 'function') throw new Error('sayfaGec not defined');

    const btn = document.querySelector('.nav-item[data-page="dersler"]');
    btn?.click();
    await new Promise(r => setTimeout(r, 500));

    const active = document.querySelector('.page.active');
    return active && active.dataset.page === 'dersler';
  });

  // TEST 8: renderSayfa Function
  await runTest('renderSayfa Function', async () => {
    if (typeof renderSayfa !== 'function') throw new Error('renderSayfa not defined');

    renderSayfa('soru-havuzu');
    await new Promise(r => setTimeout(r, 500));

    const page = document.querySelector('#page-soru-havuzu');
    return page && page.classList.contains('active');
  });

  // TEST 9: Event Listeners
  await runTest('Event Listeners', async () => {
    const btns = document.querySelectorAll('.nav-item');
    let allHaveListeners = true;

    btns.forEach(btn => {
      if (!btn.onclick) allHaveListeners = false;
    });

    return allHaveListeners;
  });

  // TEST 10: All Pages Exist
  await runTest('All Pages Exist', async () => {
    const pages = ['anasayfa', 'calisma', 'dersler', 'plan', 'denemeler', 'istatistik',
                   'guncel', 'ayarlar', 'soru-havuzu'];

    let allExist = true;
    pages.forEach(pageId => {
      const el = document.getElementById(`page-${pageId}`);
      if (!el) allExist = false;
    });

    return allExist;
  });

  // Final
  console.log('='.repeat(50));
  console.log(`TOTAL: ${total} | PASS: ${passed} | FAIL: ${failed}`);
  console.log(`RATE: ${((passed/total)*100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('✅ ALL TESTS PASSED!');
  } else {
    console.log('❌ SOME TESTS FAILED!');
  }

  return { total, passed, failed, rate: ((passed/total)*100).toFixed(1) };
})();
