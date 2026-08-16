/**
 * Gerçek Tarayıcı Navigation Testi
 * Railway deployment'ında test senaryosu
 */

const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://kpss-backend-production.up.railway.app';

async function runTests() {
  console.log('🚀 Navigation Testi Başlatılıyor...\n');

  const browser = await chromium.launch({
    headless: false, // Browser'ı aç
    slowMo: 500,     // Yavaş hareketlerle test et
  });

  const page = await browser.newPage();

  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  };

  try {
    // Test 1: Ana Sayfa Navigasyonu
    console.log('TEST 1: Ana Sayfa Navigasyonu');
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);

    const anaSayfaBtn = await page.$('.nav-item[data-page="anasayfa"]');
    if (anaSayfaBtn) {
      await anaSayfaBtn.click();
      await page.waitForTimeout(500);

      const anaSayfaPage = await page.$('#page-anasayfa');
      const isActive = await anaSayfaPage?.evaluate(el => el.classList.contains('active'));

      testResults.tests.push({
        test: 'Ana Sayfa Navigasyonu',
        passed: isActive === true,
        details: {
          buttonFound: !!anaSayfaBtn,
          pageExists: !!anaSayfaPage,
          pageActive: isActive === true,
          contentLength: anaSayfaPage ? await anaSayfaPage.evaluate(el => el.innerHTML.length) : 0,
        },
      });

      if (isActive === true) {
        console.log('  ✅ PASSED - Ana Sayfa aktif');
        testResults.summary.passed++;
      } else {
        console.log('  ❌ FAILED - Ana Sayfa aktif değil');
        testResults.summary.failed++;
      }
    } else {
      console.log('  ❌ FAILED - Ana Sayfa butonu bulunamadı');
      testResults.summary.failed++;
      testResults.tests.push({
        test: 'Ana Sayfa Navigasyonu',
        passed: false,
        details: { error: 'Button not found' },
      });
    }
    testResults.summary.total++;

    // Test 2: Dersler Navigasyonu
    console.log('\nTEST 2: Dersler Navigasyonu');
    const derslerBtn = await page.$('.nav-item[data-page="dersler"]');
    if (derslerBtn) {
      await derslerBtn.click();
      await page.waitForTimeout(500);

      const derslerPage = await page.$('#page-dersler');
      const isActive = await derslerPage?.evaluate(el => el.classList.contains('active'));

      testResults.tests.push({
        test: 'Dersler Navigasyonu',
        passed: isActive === true,
        details: {
          buttonFound: !!derslerBtn,
          pageExists: !!derslerPage,
          pageActive: isActive === true,
          contentLength: derslerPage ? await derslerPage.evaluate(el => el.innerHTML.length) : 0,
        },
      });

      if (isActive === true) {
        console.log('  ✅ PASSED - Dersler aktif');
        testResults.summary.passed++;
      } else {
        console.log('  ❌ FAILED - Dersler aktif değil');
        testResults.summary.failed++;
      }
    } else {
      console.log('  ❌ FAILED - Dersler butonu bulunamadı');
      testResults.summary.failed++;
      testResults.tests.push({
        test: 'Dersler Navigasyonu',
        passed: false,
        details: { error: 'Button not found' },
      });
    }
    testResults.summary.total++;

    // Test 3: Ders Çalış Navigasyonu
    console.log('\nTEST 3: Ders Çalış Navigasyonu');
    const calismaBtn = await page.$('.nav-item[data-page="calisma"]');
    if (calismaBtn) {
      await calismaBtn.click();
      await page.waitForTimeout(500);

      const calismaPage = await page.$('#page-calisma');
      const isActive = await calismaPage?.evaluate(el => el.classList.contains('active'));
      const contentLength = await calismaPage?.evaluate(el => el.innerHTML.length);

      testResults.tests.push({
        test: 'Ders Çalış Navigasyonu',
        passed: isActive === true,
        details: {
          buttonFound: !!calismaBtn,
          pageExists: !!calismaPage,
          pageActive: isActive === true,
          contentLength: contentLength || 0,
        },
      });

      if (isActive === true) {
        console.log('  ✅ PASSED - Ders Çalış aktif');
        testResults.summary.passed++;
      } else {
        console.log('  ❌ FAILED - Ders Çalış aktif değil');
        testResults.summary.failed++;
      }
    } else {
      console.log('  ❌ FAILED - Ders Çalış butonu bulunamadı');
      testResults.summary.failed++;
      testResults.tests.push({
        test: 'Ders Çalış Navigasyonu',
        passed: false,
        details: { error: 'Button not found' },
      });
    }
    testResults.summary.total++;

    // Test 4: Soru Havuzu Navigasyonu
    console.log('\nTEST 4: Soru Havuzu Navigasyonu');
    const soruHavuzuBtn = await page.$('.nav-item[data-page="soru-havuzu"]');
    if (soruHavuzuBtn) {
      await soruHavuzuBtn.click();
      await page.waitForTimeout(500);

      const soruHavuzuPage = await page.$('#page-soru-havuzu');
      const isActive = await soruHavuzuPage?.evaluate(el => el.classList.contains('active'));
      const contentLength = await soruHavuzuPage?.evaluate(el => el.innerHTML.length);

      testResults.tests.push({
        test: 'Soru Havuzu Navigasyonu',
        passed: isActive === true,
        details: {
          buttonFound: !!soruHavuzuBtn,
          pageExists: !!soruHavuzuPage,
          pageActive: isActive === true,
          contentLength: contentLength || 0,
        },
      });

      if (isActive === true) {
        console.log('  ✅ PASSED - Soru Havuzu aktif');
        testResults.summary.passed++;
      } else {
        console.log('  ❌ FAILED - Soru Havuzu aktif değil');
        testResults.summary.failed++;
      }
    } else {
      console.log('  ❌ FAILED - Soru Havuzu butonu bulunamadı');
      testResults.summary.failed++;
      testResults.tests.push({
        test: 'Soru Havuzu Navigasyonu',
        passed: false,
        details: { error: 'Button not found' },
      });
    }
    testResults.summary.total++;

    // Test 5: Ayarlar Navigasyonu
    console.log('\nTEST 5: Ayarlar Navigasyonu');
    const ayarlarBtn = await page.$('.nav-item[data-page="ayarlar"]');
    if (ayarlarBtn) {
      await ayarlarBtn.click();
      await page.waitForTimeout(500);

      const ayarlarPage = await page.$('#page-ayarlar');
      const isActive = await ayarlarPage?.evaluate(el => el.classList.contains('active'));

      testResults.tests.push({
        test: 'Ayarlar Navigasyonu',
        passed: isActive === true,
        details: {
          buttonFound: !!ayarlarBtn,
          pageExists: !!ayarlarPage,
          pageActive: isActive === true,
          contentLength: ayarlarPage ? await ayarlarPage.evaluate(el => el.innerHTML.length) : 0,
        },
      });

      if (isActive === true) {
        console.log('  ✅ PASSED - Ayarlar aktif');
        testResults.summary.passed++;
      } else {
        console.log('  ❌ FAILED - Ayarlar aktif değil');
        testResults.summary.failed++;
      }
    } else {
      console.log('  ❌ FAILED - Ayarlar butonu bulunamadı');
      testResults.summary.failed++;
      testResults.tests.push({
        test: 'Ayarlar Navigasyonu',
        passed: false,
        details: { error: 'Button not found' },
      });
    }
    testResults.summary.total++;

    // Test 6: Mobile Bottom Navigation
    console.log('\nTEST 6: Mobile Bottom Navigation');
    const bottomNav = await page.$('.bottom-nav');
    const bottomButtons = await page.$$('.bn-item');

    if (bottomButtons.length > 0) {
      await bottomNav.click(); // Mobile'da bottom nav'da tıklama sorunu olabiliyor
      await page.waitForTimeout(300);

      // İlk bottom butonuna tıkla
      await bottomButtons[0].click();
      await page.waitForTimeout(300);

      const activePage = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.page')).find(p => p.classList.contains('active'));
      });

      const isActive = !!activePage && activePage.dataset.page === bottomButtons[0].dataset.page;

      testResults.tests.push({
        test: 'Mobile Bottom Navigation',
        passed: isActive === true,
        details: {
          bottomNavExists: !!bottomNav,
          buttonCount: bottomButtons.length,
          activePage: activePage ? activePage.dataset.page : null,
          isCorrectPage: isActive === true,
        },
      });

      if (isActive === true) {
        console.log('  ✅ PASSED - Bottom navigation çalışıyor');
        testResults.summary.passed++;
      } else {
        console.log('  ❌ FAILED - Bottom navigation çalışmıyor');
        testResults.summary.failed++;
      }
    } else {
      console.log('  ⚠️  SKIP - Bottom navigation bulunamadı');
    }
    testResults.summary.total++;

    // Event Listener Test
    console.log('\nTEST 7: Event Listener Check');
    const eventListenerTest = await page.evaluate(() => {
      const buttons = document.querySelectorAll('.nav-item');
      const results = [];

      buttons.forEach(btn => {
        results.push({
          page: btn.dataset.page,
          hasListener: btn.onclick !== null,
        });
      });

      return results;
    });

    const allHaveListeners = eventListenerTest.every(btn => btn.hasListener);

    testResults.tests.push({
      test: 'Event Listener Check',
      passed: allHaveListeners === true,
      details: {
        buttonCount: eventListenerTest.length,
        buttonsWithListeners: eventListenerTest.filter(btn => btn.hasListener).length,
      },
    });

    if (allHaveListeners === true) {
      console.log('  ✅ PASSED - Tüm butonlarda listener var');
      testResults.summary.passed++;
    } else {
      console.log('  ❌ FAILED - Bazı butonlarda listener yok');
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // Console Errors Check
    console.log('\nTEST 8: Console Errors');
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Test navigasyonu tekrar
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);
    await page.click('.nav-item[data-page="dersler"]');
    await page.waitForTimeout(500);

    testResults.tests.push({
      test: 'Console Errors',
      passed: consoleErrors.length === 0,
      details: {
        errorCount: consoleErrors.length,
        errors: consoleErrors.slice(0, 10), // İlk 10 hatayı göster
      },
    });

    if (consoleErrors.length === 0) {
      console.log('  ✅ PASSED - Console hata yok');
      testResults.summary.passed++;
    } else {
      console.log('  ❌ FAILED - Console hatası var:', consoleErrors[0]);
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // Final Summary
    console.log('\n' + '='.repeat(50));
    console.log('SONUÇ ÖZETİ');
    console.log('='.repeat(50));
    console.log(`Toplam Test: ${testResults.summary.total}`);
    console.log(`Başarılı: ${testResults.summary.passed}`);
    console.log(`Başarısız: ${testResults.summary.failed}`);
    console.log(`Başarı Oranı: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);

    // Kaydet
    const reportPath = './navigation-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    console.log(`\n📊 Rapor kaydedildi: ${reportPath}`);

    return testResults;

  } catch (error) {
    console.error('❌ TEST ERROR:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run tests
runTests()
  .then(results => {
    console.log('\n✅ Testler tamamlandı!');
    process.exit(results.summary.failed === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Testler başarısız:', error.message);
    process.exit(1);
  });
