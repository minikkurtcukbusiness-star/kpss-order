// 🔧 CRITICAL NAVIGATION DEBUG SCRIPT
// Tüm navigasyon problemlerini tespit et ve düzelt

console.log('🔍 NAVIGATION PROBLEM DEBUG SCRIPT 🚀\n');

// KONTROL 1: HTML'Yİ DOĞRULA
console.log('1️⃣  HTML STRUCTURE CHECK');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const bottomNav = document.querySelector('.bottom-nav');

console.log(`   Nav items: ${navItems.length} adet`);
console.log(`   Pages: ${pages.length} adet`);
console.log(`   Bottom nav: ${bottomNav ? 'var' : 'yok'}`);

navItems.forEach((btn, i) => {
  console.log(`   [${i}] ${btn.dataset.page}`);
});
console.log('');

// KONTROL 2: EVENT LISTENER'LARI DOĞRULA
console.log('2️⃣  EVENT LISTENERS CHECK');
let listenerCount = 0;
navItems.forEach((btn, i) => {
  const hasListener = btn.onclick !== null;
  if (hasListener) listenerCount++;

  if (!hasListener) {
    console.log(`   ❌ BUTON ${i} (${btn.dataset.page}): Listener YOK!`);
  }
});
console.log(`   Toplam listener: ${listenerCount} / ${navItems.length}`);
console.log('');

// KONTROL 3: SAYFA GEC FONKSİYONU
console.log('3️⃣  SAYFA GEC FUNCTION CHECK');
if (typeof sayfaGec === 'function') {
  console.log('   ✅ sayfaGec fonksiyonu tanımlı');
} else {
  console.log('   ❌ sayfaGec fonksiyonu tanımlı DEĞİL!');
  console.log('   HATA: renderSayfa çalışamayacak!');
}
console.log('');

// KONTROL 4: RENDER SAYFA FONKSİYONU
console.log('4️⃣  RENDER SAYFA FUNCTION CHECK');
if (typeof renderSayfa === 'function') {
  console.log('   ✅ renderSayfa fonksiyonu tanımlı');

  const pagesToTest = ['anasayfa', 'dersler', 'calisma', 'soru-havuzu', 'ayarlar'];

  pagesToTest.forEach(pageId => {
    console.log(`   Testing renderSayfa('${pageId}')...`);

    try {
      renderSayfa(pageId);
      const page = document.getElementById(`page-${pageId}`);
      const isActive = page ? page.classList.contains('active') : false;

      if (isActive) {
        console.log(`      ✅ '${pageId}' render edildi, aktif`);
      } else {
        console.log(`      ❌ '${pageId}' render edildi ama aktif DEĞİL!`);
        console.log(`         Page element: ${!!page}`);
        console.log(`         Page classList: ${page ? Array.from(page.classList) : 'N/A'}`);
      }
    } catch (e) {
      console.log(`      ❌ ERROR: ${e.message}`);
    }
  });

} else {
  console.log('   ❌ renderSayfa fonksiyonu tanımlı DEĞİL!');
}
console.log('');

// KONTROL 5: SAYFA ACTİF YAPMA FONKSİYONU
console.log('5️⃣  SAYFA ACTİF KLASLARINI YAPMA CHECK');
const checkActive = (pageId) => {
  const page = document.getElementById(`page-${pageId}`);
  if (!page) return false;

  const allPages = document.querySelectorAll('.page');
  let allInactive = true;

  allPages.forEach(p => {
    p.classList.remove('active');
  });

  page.classList.add('active');

  const isActive = page.classList.contains('active');
  const allInactiveAfter = allPages.every(p => !p.classList.contains('active'));

  return isActive && !allInactiveAfter;
};

console.log('   Checking active class toggle:');
pages.forEach((page, i) => {
  const isActive = checkActive(page.dataset.page);
  console.log(`   [${i}] ${page.dataset.page}: ${isActive ? '✅ Aktif' : '❌ Aktif değil'}`);
});
console.log('');

// KONTROL 6: RENDER SAYFA ETKİSİ
console.log('6️⃣  RENDER SAYFA ETKİSİ TESTİ');
const testRender = (pageId) => {
  console.log(`   Testing renderSayfa('${pageId}')...`);

  const pageBefore = document.getElementById(`page-${pageId}`);
  const isActiveBefore = pageBefore ? pageBefore.classList.contains('active') : false;

  if (typeof renderSayfa === 'function') {
    renderSayfa(pageId);

    const pageAfter = document.getElementById(`page-${pageId}`);
    const isActiveAfter = pageAfter ? pageAfter.classList.contains('active') : false;

    console.log(`      Page before: ${pageBefore ? 'active' : 'YOK'}`);
    console.log(`      Page after: ${pageAfter ? 'active' : 'YOK'}`);
    console.log(`      Active before: ${isActiveBefore}`);
    console.log(`      Active after: ${isActiveAfter}`);

    return isActiveAfter;
  } else {
    console.log(`      ERROR: renderSayfa fonksiyonu tanımlı değil!`);
    return false;
  }
};

const results = [];
['anasayfa', 'dersler', 'calisma', 'soru-havuzu', 'ayarlar'].forEach(pageId => {
  const passed = testRender(pageId);
  results.push({ pageId, passed });
});
console.log('');

// KONTROL 7: EVENT PROPAGATION
console.log('7️⃣  EVENT PROPAGATION TESTİ');
console.log('   Tıklama işlemini tetikle ve takip et:');

const logEvent = (target, type, bubbles) => {
  console.log(`   🎯 Target: ${target.dataset.page || target.tagName}`);
  console.log(`   🎯 Type: ${type}`);
  console.log(`   🎯 Bubbles: ${bubbles}`);

  const btn = document.querySelector(`.nav-item[data-page="${target.dataset.page}"]`);
  if (btn) {
    console.log(`   ✅ Button found: ${btn.dataset.page}`);
    console.log(`   ✅ Has onclick: ${btn.onclick !== null}`);

    btn.onclick({
      target: btn,
      currentTarget: btn,
      bubbles: true,
      cancelable: true,
      stopImmediatePropagation: () => console.log('   ⚠️  stopImmediatePropagation called'),
      stopPropagation: () => console.log('   ⚠️  stopPropagation called'),
      preventDefault: () => console.log('   ⚠️  preventDefault called'),
    });

    const page = document.getElementById(`page-${btn.dataset.page}`);
    console.log(`   ✅ Page active: ${page ? page.classList.contains('active') : 'YOK'}`);
  }
};

// Test 7 farklı sayfa
['anasayfa', 'dersler', 'calisma', 'soru-havuzu', 'ayarlar'].forEach(pageId => {
  const btn = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (btn) {
    logEvent(btn, 'click', true);
  }
});
console.log('');

// KONTROL 8: NAV BAGLANTILARINI KUR
console.log('8️⃣  NAV BAGLANTILARINI KUR TESTİ');
if (typeof navBaglantilariniKur === 'function') {
  console.log('   navBaglantilariniKur fonksiyonu çalıştırılıyor...');

  try {
    navBaglantilariniKur();

    console.log('   ✅ navBaglantilariniKur çalıştı');

    // Tekrar kontrol et
    let btnsWithListener = 0;
    navItems.forEach(btn => {
      if (btn.onclick) btnsWithListener++;
    });

    console.log(`   ✅ Listener sayısı: ${btnsWithListener} / ${navItems.length}`);

    if (btnsWithListener < navItems.length) {
      console.log(`   ❌ HATA: ${navItems.length - btnsWithListener} butona listener eklenemedi!`);
    } else {
      console.log(`   ✅ Tüm butonlara listener eklendi!`);
    }

  } catch (e) {
    console.log(`   ❌ ERROR: ${e.message}`);
    console.log(`   Stack: ${e.stack}`);
  }
} else {
  console.log('   ❌ navBaglantilariniKur fonksiyonu tanımlı DEĞİL!');
}
console.log('');

// KONTROL 9: DOMContentLoaded
console.log('9️⃣  DOM LOADED CHECK');
if (document.readyState === 'loading') {
  console.log('   ⚠️  DOM still loading...');

  document.addEventListener('DOMContentLoaded', () => {
    console.log('   ✅ DOMContentLoaded fired!');

    if (typeof navBaglantilariniKur === 'function') {
      navBaglantilariniKur();
      console.log('   ✅ Nav bağlantıları kuruldu!');
    }
  });
} else {
  console.log('   ✅ DOM already loaded');

  if (typeof navBaglantilariniKur === 'function') {
    navBaglantilariniKur();
    console.log('   ✅ Nav bağlantıları kuruldu!');
  }
}
console.log('');

// KONTROL 10: TEST SENARYOSU - TAM ZİNCİR
console.log('10️⃣  COMPLETE TEST: Ana Sayfa → Dersler → Ders Çalış → Soru Havuzu → Ayarlar');
console.log('');

let sequencePassed = true;
const testSequence = async () => {
  try {
    // 1. Ana Sayfa
    const btn1 = document.querySelector('.nav-item[data-page="anasayfa"]');
    if (btn1) {
      btn1.click();
      await new Promise(r => setTimeout(r, 300));
      const page1 = document.querySelector('#page-anasayfa');
      if (!page1?.classList.contains('active')) {
        console.log('   ❌ Ana Sayfa aktif değil!');
        sequencePassed = false;
      } else {
        console.log('   ✅ Ana Sayfa aktif');
      }
    } else {
      console.log('   ❌ Ana Sayfa butonu bulunamadı!');
      sequencePassed = false;
    }

    // 2. Dersler
    await new Promise(r => setTimeout(r, 300));
    const btn2 = document.querySelector('.nav-item[data-page="dersler"]');
    if (btn2) {
      btn2.click();
      await new Promise(r => setTimeout(r, 300));
      const page2 = document.querySelector('#page-dersler');
      if (!page2?.classList.contains('active')) {
        console.log('   ❌ Dersler aktif değil!');
        sequencePassed = false;
      } else {
        console.log('   ✅ Dersler aktif');
      }
    } else {
      console.log('   ❌ Dersler butonu bulunamadı!');
      sequencePassed = false;
    }

    // 3. Ders Çalış
    await new Promise(r => setTimeout(r, 300));
    const btn3 = document.querySelector('.nav-item[data-page="calisma"]');
    if (btn3) {
      btn3.click();
      await new Promise(r => setTimeout(r, 300));
      const page3 = document.querySelector('#page-calisma');
      if (!page3?.classList.contains('active')) {
        console.log('   ❌ Ders Çalış aktif değil!');
        sequencePassed = false;
      } else {
        console.log('   ✅ Ders Çalış aktif');
      }
    } else {
      console.log('   ❌ Ders Çalış butonu bulunamadı!');
      sequencePassed = false;
    }

    // 4. Soru Havuzu
    await new Promise(r => setTimeout(r, 300));
    const btn4 = document.querySelector('.nav-item[data-page="soru-havuzu"]');
    if (btn4) {
      btn4.click();
      await new Promise(r => setTimeout(r, 300));
      const page4 = document.querySelector('#page-soru-havuzu');
      if (!page4?.classList.contains('active')) {
        console.log('   ❌ Soru Havuzu aktif değil!');
        sequencePassed = false;
      } else {
        console.log('   ✅ Soru Havuzu aktif');
      }
    } else {
      console.log('   ❌ Soru Havuzu butonu bulunamadı!');
      sequencePassed = false;
    }

    // 5. Ayarlar
    await new Promise(r => setTimeout(r, 300));
    const btn5 = document.querySelector('.nav-item[data-page="ayarlar"]');
    if (btn5) {
      btn5.click();
      await new Promise(r => setTimeout(r, 300));
      const page5 = document.querySelector('#page-ayarlar');
      if (!page5?.classList.contains('active')) {
        console.log('   ❌ Ayarlar aktif değil!');
        sequencePassed = false;
      } else {
        console.log('   ✅ Ayarlar aktif');
      }
    } else {
      console.log('   ❌ Ayarlar butonu bulunamadı!');
      sequencePassed = false;
    }

  } catch (e) {
    console.log(`   ❌ ERROR: ${e.message}`);
    sequencePassed = false;
  }
};

testSequence();
console.log('');

// FINAL REPORT
console.log('='.repeat(60));
console.log('📊 FINAL REPORT');
console.log('='.repeat(60));
console.log(`\nTestler Tamamlandı mı? ${sequencePassed ? '✅ EVET' : '❌ HAYIR'}`);
console.log(`Nav Items: ${navItems.length}`);
console.log(`Pages: ${pages.length}`);
console.log(`Listener Count: ${listenerCount}`);
console.log(`sayfaGec: ${typeof sayfaGec}`);
console.log(`renderSayfa: ${typeof renderSayfa}`);
console.log(`navBaglantilariniKur: ${typeof navBaglantilariniKur}`);
console.log('');

const issues = [];
if (listenerCount < navItems.length) {
  issues.push(`${navItems.length - listenerCount} butona listener eklenemedi`);
}
if (typeof sayfaGec !== 'function') issues.push('sayfaGec fonksiyonu tanımlı değil');
if (typeof renderSayfa !== 'function') issues.push('renderSayfa fonksiyonu tanımlı değil');
if (typeof navBaglantilariniKur !== 'function') issues.push('navBaglantilariniKur fonksiyonu tanımlı değil');

if (issues.length > 0) {
  console.log('❌ PROBLEMLER:');
  issues.forEach((issue, i) => {
    console.log(`   ${i+1}. ${issue}`);
  });
} else {
  console.log('✅ TÜM SORUNLAR GİDERİLDİ!');
}

console.log('\n🚀 TEST BİTTİ!');
