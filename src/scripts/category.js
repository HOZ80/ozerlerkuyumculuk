// Kategori sayfası — iki mod çalışır:
// 1) ?cat= tek başına verildiyse: o kategorideki alt kategorileri KART olarak
//    gösterir (her kartın görseli, o alt kategorideki en düşük sortOrder'lı
//    ürünün fotoğrafıdır).
// 2) ?cat= ile birlikte ?sub= verildiyse: o alt kategorideki ürünleri, önceki
//    davranışla birebir aynı ürün listesi kartlarıyla gösterir.
import { loadProducts, formatPrice, firstProductImage } from './products-data.js';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  const sub = params.get('sub');
  const grid = document.getElementById('category-grid');
  const titleEl = document.getElementById('categoryTitle');
  const eyebrowEl = document.getElementById('categoryEyebrow');
  const breadcrumbCatWrap = document.getElementById('breadcrumbCatWrap');
  const breadcrumbEl = document.getElementById('breadcrumbCurrent');

  if (!cat) {
    grid.innerHTML = '<p style="color:var(--ink-dim); grid-column:1/-1; text-align:center;">Kategori belirtilmedi.</p>';
    return;
  }

  if (sub) {
    document.title = `${sub} — ${cat} — Özerler Kuyumculuk`;
    eyebrowEl.textContent = cat;
    titleEl.textContent = sub;
    breadcrumbCatWrap.innerHTML = `<a href="/category?cat=${encodeURIComponent(cat)}">${cat}</a><span class="sep">/</span>`;
    breadcrumbEl.textContent = sub;
  } else {
    document.title = `${cat} — Özerler Kuyumculuk`;
    eyebrowEl.textContent = 'Koleksiyon';
    titleEl.textContent = cat;
    breadcrumbCatWrap.innerHTML = '';
    breadcrumbEl.textContent = cat;
  }

  loadProducts().then(products => {
    // büyük/küçük harf duyarsız eşleştirme
    const catMatches = products.filter(p => (p.category || '').trim().toLowerCase() === cat.trim().toLowerCase());

    if (catMatches.length === 0) {
      grid.className = 'grid';
      grid.innerHTML = `<p style="color:var(--ink-dim); grid-column:1/-1; text-align:center;">${cat} kategorisinde henüz ürün yok.</p>`;
      return;
    }

    if (sub) {
      const subMatches = catMatches.filter(p => (p.subcategory || '').trim().toLowerCase() === sub.trim().toLowerCase());
      grid.className = 'grid';
      if (subMatches.length === 0) {
        grid.innerHTML = `<p style="color:var(--ink-dim); grid-column:1/-1; text-align:center;">${sub} alt kategorisinde henüz ürün yok.</p>`;
        return;
      }
      const backLink = `<a href="/category?cat=${encodeURIComponent(cat)}" class="ghost-link" style="grid-column:1/-1; margin-bottom:8px; display:inline-block;">← Tüm ${cat} alt kategorileri</a>`;
      grid.innerHTML = backLink + subMatches.map(cardHTML).join('');
    } else {
      grid.className = 'subcat-grid';
      grid.innerHTML = subcategoryCardsHTML(catMatches, cat);
    }
  }).catch(err => {
    console.error('Ürünler yüklenemedi:', err);
    grid.innerHTML = '<p style="color:var(--ink-dim); grid-column:1/-1; text-align:center;">Ürünler şu anda yüklenemiyor.</p>';
  });

  // Alt kategori kartları: her alt kategori için, o alt kategorideki en düşük
  // sortOrder'lı (Sheet'te en öne konmuş) ürünün ilk fotoğrafı temsilci görsel olur.
  function subcategoryCardsHTML(catProducts, cat) {
    const bySub = new Map();
    catProducts.forEach(p => {
      const key = (p.subcategory || '').trim();
      if (!key) return;
      const current = bySub.get(key);
      if (!current || p.sortOrder < current.sortOrder) bySub.set(key, p);
    });

    if (bySub.size === 0) {
      return `<p style="color:var(--ink-dim); grid-column:1/-1; text-align:center;">${cat} için henüz alt kategori tanımlanmamış.</p>`;
    }

    return Array.from(bySub.entries()).map(([subName, repProduct]) => {
      const img = firstProductImage(repProduct.code);
      return `
        <a class="subcat-box" href="/category?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(subName)}">
          <img src="${img}" alt="${subName}" loading="lazy">
          <div class="subcat-label"><div class="subcat-eyebrow">Koleksiyon</div><h3>${subName}</h3></div>
        </a>`;
    }).join('');
  }

  function cardHTML(p) {
    const img = firstProductImage(p.code);
    const badge = p.badge ? `<span class="card-badge">${p.badge}</span>` : '';
    const outOfStock = !p.inStock ? '<span class="card-badge" style="background:#26211C; color:#fff; left:auto; right:12px;">Stokta Yok</span>' : '';
    return `
      <a class="card" href="/product?slug=${encodeURIComponent(p.id)}">
        <div class="card-image">
          ${badge}${outOfStock}
          <img src="${img}" alt="${p.name}" loading="lazy">
        </div>
        <div class="card-body">
          <span class="card-cat">${p.category} · ${p.subcategory}</span>
          <div class="card-name">${p.name}</div>
          <div class="card-price">${formatPrice(p.price)}</div>
        </div>
      </a>`;
  }
});
