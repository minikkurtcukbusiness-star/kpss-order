// Gerçek Tarayıcı Navigation Test Script
// http://localhost:8080 adresine yapıştır

(async () => {
  console.log('=== REAL BROWSER TEST BAŞLATILIYOR ===\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // Test Fonksiyonları
  const test = async (name, fn) => {
    totalTests++;
    console.log(`\nTEST ${totalTests}: ${name}`);

    try {
      const result = await fn();

      if (result.passed) {
        console.log(`  ✅ PASSED - ${result.message}`);
        passedTests++;
      } else {
        console.log(`  ❌ FAILED - ${result.message}`);
        console.log(`  Details:`, result.details);
        failedTests++;
      }

      return result;
    } catch (error) {
      console.log(`  ❌ ERROR - ${error.message}`);
      console.log(`  Stack:`, error.stack);
      failedTests++;
      return {
        passed: false,
        message: error.message,
        details: error.stack,
      };
    }
  };

  // Test 1: Ana Sayfa Navigasyonu
  await test('Ana Sayfa Navigasyonu', async () => {
    const btn = document.querySelector('.nav-item[data-page="anasayfa"]');
    if (!btn) throw new Error('Ana Sayfa butonu bulunamadı');

    const page = document.querySelector('#page-anasayfa');
    const isActive = page.classList.contains('active');

    return {
      passed: isActive === true,
      message: 'Ana Sayfa aktif',
      details: {
        buttonFound: true,
        pageActive: isActive,
        contentLength: page ? page.innerHTML.length : 0,
      },
    };
  });

  // Test 2: Dersler Navigasyonu
  await test('Dersler Navigasyonu', async () => {
    const btn = document.querySelector('.nav-item[data-page="dersler"]');
    if (!btn) throw new Error('Dersler butonu bulunamadı');

    btn.click();

    await new Promise(resolve => setTimeout(resolve, 300));

    const page = document.querySelector('#page-dersler');
    const isActive = page.classList.contains('active');

    return {
      passed: isActive === true,
      message: 'Dersler aktif',
      details: {
        buttonFound: true,
        pageActive: isActive,
        contentLength: page ? page.innerHTML.length : 0,
      },
    };
  });

  // Test 3: Ders Çalış Navigasyonu
  await test('Ders Çalış Navigasyonu', async () => {
    const btn = document.querySelector('.nav-item[data-page="calisma"]');
    if (!btn) throw new Error('Ders Çalış butonu bulunamadı');

    btn.click();

    await new Promise(resolve => setTimeout(resolve, 300));

    const page = document.querySelector('#page-calisma');
    const isActive = page.classList.contains('active');

    return {
      passed: isActive === true,
      message: 'Ders Çalış aktif',
      details: {
        buttonFound: true,
        buttonHasListener: btn.onclick !== null,
        pageActive: isActive,
        contentLength: page ? page.innerHTML.length : 0,
      },
    };
  });

  // Test 4: Soru Havuzu Navigasyonu
  await test('Soru Havuzu Navigasyonu', async () => {
    const btn = document.querySelector('.nav-item[data-page="soru-havuzu"]');
    if (!btn) throw new Error('Soru Havuzu butonu bulunamadı');

    btn.click();

    await new Promise(resolve => setTimeout(resolve, 300));

    const page = document.querySelector('#page-soru-havuzu');
    const isActive = page.classList.contains('active');

    return {
      passed: isActive === true,
      message: 'Soru Havuzu aktif',
      details: {
        buttonFound: true,
        buttonHasListener: btn.onclick !== null,
        pageActive: isActive,
        contentLength: page ? page.innerHTML.length : 0,
      },
    };
  });

  // Test 5: Ayarlar Navigasyonu
  await test('Ayarlar Navigasyonu', async () => {
    const btn = document.querySelector('.nav-item[data-page="ayarlar"]');
    if (!btn) throw new Error('Ayarlar butonu bulunamadı');

    btn.click();

    await new Promise(resolve => setTimeout(resolve, 300));

    const page = document.querySelector('#page-ayarlar');
    const isActive = page.classList.contains('active');

    return {
      passed: isActive === true,
      message: 'Ayarlar aktif',
      details: {
        buttonFound: true,
        buttonHasListener: btn.onclick !== null,
        pageActive: isActive,
        contentLength: page ? page.innerHTML.length : 0,
      },
    };
  });

  // Test 6: Event Listeners
  await test('Event Listeners', async () => {
    const buttons = document.querySelectorAll('.nav-item');
    let hasErrors = false;

    buttons.forEach((btn, index) => {
      if (!btn.onclick) {
        console.log(`  ❌ Buton ${index} (${btn.dataset.page}): Listener yok`);
        hasErrors = true;
      }
    });

    return {
      passed: !hasErrors,
      message: hasErrors ? 'Bazı butonlarda listener yok' : 'Tüm butonlarda listener var',
      details: {
        totalButtons: buttons.length,
        buttonsWithListeners: Array.from(buttons).filter(b => b.onclick).length,
        errorCount: hasErrors ? buttons.length - Array.from(buttons).filter(b => b.onclick).length : 0,
      },
    };
  });

  // Test 7: sayfaGec Fonksiyonu
  await test('sayfaGec Fonksiyonu', async () => {
    if (typeof sayfaGec !== 'function') throw new Error('sayfaGec fonksiyonu tanımlı değil');

    const beforeActive = document.querySelector('.page.active')?.dataset.page;

    sayfaGec('dersler');

    await new Promise(resolve => setTimeout(resolve, 300));

    const afterActive = document.querySelector('.page.active')?.dataset.page;

    return {
      passed: afterActive === 'dersler',
      message: 'sayfaGec çalışıyor',
      details: {
        beforeActive,
        afterActive,
        sayfaGecType: typeof sayfaGec,
      },
    };
  });

  // Test 8: renderSayfa Fonksiyonu
  await test('renderSayfa Fonksiyonu', async () => {
    if (typeof renderSayfa !== 'function') throw new Error('renderSayfa fonksiyonu tanımlı değil');

    const beforeActive = document.querySelector('.page.active')?.dataset.page;

    renderSayfa('soru-havuzu');

    await new Promise(resolve => setTimeout(resolve, 300));

    const page = document.querySelector('#page-soru-havuzu');
    const isActive = page.classList.contains('active');

    return {
      passed: isActive === true,
      message: 'renderSayfa çalışıyor',
      details: {
        beforeActive,
        isActive,
        renderSayfaType: typeof renderSayfa,
        pageContentLength: page ? page.innerHTML.length : 0,
      },
    };
  });

  // Test 9: Mobile Bottom Navigation
  await test('Mobile Bottom Navigation', async () => {
    const bottomNav = document.querySelector('.bottom-nav');
    const bottomButtons = document.querySelectorAll('.bn-item');

    if (bottomButtons.length === 0) throw new Error('Bottom navigation butonları bulunamadı');

    // İlk butona tıkla
    bottomButtons[0].click();

    await new Promise(resolve => setTimeout(resolve, 300));

    const activePage = document.querySelector('.page.active');
    const isActive = activePage && activePage.dataset.page === bottomButtons[0].dataset.page;

    return {
      passed: isActive === true,
      message: 'Bottom navigation çalışıyor',
      details: {
        bottomNavExists: !!bottomNav,
        buttonCount: bottomButtons.length,
        activePage: activePage ? activePage.dataset.page : null,
        isCorrectPage: isActive,
      },
    };
  });

  // Test 10: Click Delegation Test
  await test('Click Delegation Test', async () => {
    const btn = document.querySelector('.nav-item[data-page="plan"]');
    if (!btn) throw new Error('Plan butonu bulunamadı');

    // Listener'ı kontrol et
    const hasListener = btn.onclick !== null;

    // Tıkla
    btn.click();

    await new Promise(resolve => setTimeout(resolve, 300));

    const page = document.querySelector('#page-plan');
    const isActive = page.classList.contains('active');

    return {
      passed: hasListener === true && isActive === true,
      message: 'Click delegation çalışıyor',
      details: {
        buttonFound: true,
        buttonHasListener: hasListener,
        pageActive: isActive,
      },
    };
  });

  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SONUÇLARI');
  console.log('='.repeat(60));
  console.log(`Toplam Testler: ${totalTests}`);
  console.log(`Başarılı: ${passedTests}`);
  console.log(`Başarısız: ${failedTests}`);
  console.log(`Başarı Oranı: ${((passedTests / totalTests) * 100).toFixed(2)}%`);

  if (failedTests === 0) {
    console.log('\n✅ TÜM TESTLER GEÇTİ!');
  } else {
    console.log('\n❌ BAZI TESTLER BAŞARISIZ OLDU!');
  }

  // Save results
  const results = {
    timestamp: new Date().toISOString(),
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    successRate: ((passedTests / totalTests) * 100).toFixed(2),
  };

  console.log('\nSonuçlar JSON olarak kaydediliyor...');
  console.log(JSON.stringify(results, null, 2));

  // Auto-save to file
  const fs = require('fs');
  fs.writeFileSync('./real-test-results.json', JSON.stringify(results, null, 2));

})();
