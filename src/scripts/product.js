// Ürün detay sayfası — URL'deki ?slug= parametresine göre Sheet'ten ürünü
// bulur ve tüm sayfayı (görsel, fiyat, renk, ölçü, açıklama) buna göre kurar.
import { loadProducts, formatPrice, firstProductImage, getProductGallery, whatsappLink } from './products-data.js';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const root = document.getElementById('pdpRoot');

  if (!slug) {
    root.innerHTML = notFoundHTML();
    return;
  }

  loadProducts().then(products => {
    const product = products.find(p => p.id === slug);
    if (!product) {
      root.innerHTML = notFoundHTML();
      return;
    }
    // Sayfayı HEMEN, ilk görselle çiziyoruz — galerinin geri kalanını
    // arka planda sessizce tamamlıyoruz. Önceden tüm galeri bulunana kadar
    // bekliyorduk, bu da (özellikle tek görselli ürünlerde bile) her seferinde
    // "2. görsel var mı" diye başarısız bir istek bekletip sayfayı geciktiriyordu.
    renderProduct(product, [firstProductImage(product.code)]);
    getProductGallery(product.code).then(gallery => {
      if (gallery.length > 1) updateGallery(gallery);
    });
  }).catch(err => {
    console.error('Ürün yüklenemedi:', err);
    root.innerHTML = '<p style="text-align:center; padding:80px 6vw; color:var(--ink-dim);">Ürün şu anda yüklenemiyor.</p>';
  });

  function notFoundHTML() {
    return `<div style="text-align:center; padding:80px 6vw;">
      <p style="color:var(--ink-dim); margin-bottom:20px;">Bu ürün bulunamadı.</p>
      <a href="/home" class="pill">Ana Sayfaya Dön</a>
    </div>`;
  }

  function renderProduct(p, images) {
    document.getElementById('pageTitle').textContent = `${p.name} — Özerler Kuyumculuk`;
    document.getElementById('pageDescription').setAttribute('content', p.seoDescription || p.name);

    const catLink = document.getElementById('breadcrumbCategory');
    catLink.textContent = p.category || 'Koleksiyon';
    catLink.href = p.category ? `/category?cat=${encodeURIComponent(p.category)}` : '/home';

    const subLink = document.getElementById('breadcrumbSubcategory');
    const subSep = document.getElementById('breadcrumbSubSep');
    if (p.subcategory) {
      subLink.textContent = p.subcategory;
      subLink.href = `/category?cat=${encodeURIComponent(p.category)}&sub=${encodeURIComponent(p.subcategory)}`;
      subLink.style.display = '';
      subSep.style.display = '';
    } else {
      subLink.style.display = 'none';
      subSep.style.display = 'none';
    }

    document.getElementById('breadcrumbCurrent').textContent = p.name;

    const swatchesHTML = p.colors.length ? `
      <div class="opt-label">Renk — ${p.colors[0].name}</div>
      <div class="swatches">
        ${p.colors.map((c, i) => `<button class="swatch${i === 0 ? ' active' : ''}" style="background:${c.hex};" data-name="${c.name}" aria-label="${c.name}"></button>`).join('')}
      </div>` : '';

    const sizesHTML = p.sizes.length ? `
      <div class="opt-label">Ölçü</div>
      <div class="sizes">
        ${p.sizes.map((s, i) => `<button class="size-box${i === 0 ? ' active' : ''}">${s}</button>`).join('')}
      </div>` : '';

    const descriptionHTML = p.description ? `<p style="font-size:13.5px; color:var(--ink-dim); line-height:1.75; margin-bottom:26px;">${p.description}</p>` : '';

    const stockHTML = !p.inStock ? `<p style="color:#C77F6E; font-size:13px; margin-bottom:18px;">Şu anda stokta yok</p>` : '';

    // İlk render'da her zaman tek görsel var (galeri henüz gelmedi) — bu yüzden
    // thumbnail şeridi yok, iki kolonlu düzen. Galeri gelince updateGallery()
    // şeridi ekleyip düzeni otomatik dört kolona genişletiyor.
    root.innerHTML = `
      <div class="pdp">
        <div class="main-image">
          <img id="mainImage" src="${images[0]}" alt="${p.name}">
          <button class="wish" aria-label="Favorilere ekle">♡</button>
        </div>
        <div class="pdp-details">
          <h1 class="p-name">${p.name}</h1>
          <div class="p-code">Ürün Kodu: ${p.code || '-'}</div>
          <div class="p-price">${formatPrice(p.price)}</div>
          ${descriptionHTML}
          ${swatchesHTML}
          ${sizesHTML}
          <div class="opt-label">Adet</div>
          <div class="qty-row">
            <div class="qty"><button id="qtyMinus" aria-label="Azalt">–</button><span id="qtyValue">1</span><button id="qtyPlus" aria-label="Artır">+</button></div>
          </div>
          ${stockHTML}
          <div class="buy-row">
            <a href="#" id="waOrderBtn" rel="noopener" class="pdp-pill solid" style="${!p.inStock ? 'opacity:0.4; pointer-events:none;' : ''} display:flex; align-items:center; justify-content:center; text-decoration:none;">WhatsApp'tan Bilgi Al / Sipariş Ver</a>
          </div>
          <div class="accordion">
            <div class="acc-row"><span>Kargo Bilgisi</span><span class="plus">+</span></div>
            <div class="acc-panel">Sipariş onayından sonra 1-3 iş günü içinde sigortalı kargo ile gönderilir.</div>
            <div class="acc-row"><span>Ödeme Seçenekleri</span><span class="plus">+</span></div>
            <div class="acc-panel">Kredi kartına taksit, havale/EFT ve kapıda ödeme seçenekleri sunulur.</div>
            <div class="acc-row"><span>Garanti</span><span class="plus">+</span></div>
            <div class="acc-panel">Tüm ürünler ayar ve işçilik garantisi ile satılır.</div>
            <div class="acc-row"><span>Bakım Önerileri</span><span class="plus">+</span></div>
            <div class="acc-panel">Parfüm ve kimyasal temas ettirmeden, yumuşak bir bezle temizleyerek saklayın.</div>
          </div>
        </div>
      </div>`;

    wireInteractions(p);
  }

  // Galerinin geri kalanı (2. görsel ve sonrası) arka planda bulununca
  // thumbnail şeridini sayfaya sonradan ekler — kullanıcı bunu fark etmez,
  // sayfa zaten görünür durumdadır.
  function updateGallery(images) {
    const pdp = root.querySelector('.pdp');
    const mainImageBox = root.querySelector('.main-image');
    if (!pdp || !mainImageBox || pdp.querySelector('.thumbs')) return;

    pdp.classList.add('has-gallery');
    const thumbsHTML = images.map((img, i) => `
      <button class="thumb${i === 0 ? ' active' : ''}" data-img="${img}">
        <img src="${img}" alt="Ürün görseli ${i + 1}">
      </button>`).join('');
    const thumbsEl = document.createElement('div');
    thumbsEl.className = 'thumbs';
    thumbsEl.innerHTML = thumbsHTML;
    pdp.insertBefore(thumbsEl, mainImageBox);
    wireThumbs();
  }

  function wireThumbs() {
    const mainImage = document.getElementById('mainImage');
    document.querySelectorAll('.thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        if (mainImage) mainImage.src = thumb.dataset.img;
      });
    });
  }

  function wireInteractions(p) {
    wireThumbs();

    const waBtn = document.getElementById('waOrderBtn');
    if (waBtn) {
      waBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const qty = document.getElementById('qtyValue')?.textContent || '1';
        const activeColor = document.querySelector('.swatch.active')?.dataset.name;
        const activeSize = document.querySelector('.size-box.active')?.textContent;
        const parts = [`Adet: ${qty}`];
        if (activeColor) parts.push(`Renk: ${activeColor}`);
        if (activeSize) parts.push(`Ölçü: ${activeSize}`);
        window.open(whatsappLink(p, parts.join(', ')), '_blank', 'noopener');
      });
    }

    document.querySelectorAll('.swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
      });
    });

    document.querySelectorAll('.size-box').forEach(sz => {
      sz.addEventListener('click', () => {
        document.querySelectorAll('.size-box').forEach(s => s.classList.remove('active'));
        sz.classList.add('active');
      });
    });

    const qtyValue = document.getElementById('qtyValue');
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');
    if (qtyValue && qtyMinus && qtyPlus) {
      qtyMinus.addEventListener('click', () => {
        const current = parseInt(qtyValue.textContent, 10);
        if (current > 1) qtyValue.textContent = current - 1;
      });
      qtyPlus.addEventListener('click', () => {
        const current = parseInt(qtyValue.textContent, 10);
        qtyValue.textContent = current + 1;
      });
    }

    document.querySelectorAll('.acc-row').forEach(row => {
      row.addEventListener('click', () => {
        const isOpen = row.classList.contains('open');
        document.querySelectorAll('.acc-row').forEach(r => r.classList.remove('open'));
        if (!isOpen) row.classList.add('open');
      });
    });
  }
});
