// Kategori sayfası — URL'deki ?cat= parametresine göre Sheet'teki TÜM ürünleri
// filtreler (öne çıkan olsun olmasın). Sheet'e eklenen her ürün, category
// sütunu eşleştiği sürece burada otomatik belirir.
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  const grid = document.getElementById('category-grid');
  const titleEl = document.getElementById('categoryTitle');
  const breadcrumbEl = document.getElementById('breadcrumbCurrent');

  if (!cat) {
    grid.innerHTML = '<p style="color:var(--ink-dim); grid-column:1/-1; text-align:center;">Kategori belirtilmedi.</p>';
    return;
  }

  document.title = `${cat} — Özerler Kuyumculuk`;
  titleEl.textContent = cat;
  breadcrumbEl.textContent = cat;

  loadProducts().then(products => {
    // büyük/küçük harf duyarsız eşleştirme
    const matches = products.filter(p => (p.category || '').trim().toLowerCase() === cat.trim().toLowerCase());
    if (matches.length === 0) {
      grid.innerHTML = `<p style="color:var(--ink-dim); grid-column:1/-1; text-align:center;">${cat} kategorisinde henüz ürün yok.</p>`;
      return;
    }
    grid.innerHTML = matches.map(cardHTML).join('');
  }).catch(err => {
    console.error('Ürünler yüklenemedi:', err);
    grid.innerHTML = '<p style="color:var(--ink-dim); grid-column:1/-1; text-align:center;">Ürünler şu anda yüklenemiyor.</p>';
  });

  function cardHTML(p) {
    const img = firstProductImage(p.id);
    const badge = p.badge ? `<span class="card-badge">${p.badge}</span>` : '';
    const outOfStock = !p.inStock ? '<span class="card-badge" style="background:#26211C; color:#fff; left:auto; right:12px;">Stokta Yok</span>' : '';
    return `
      <a class="card" href="product.html?slug=${encodeURIComponent(p.id)}">
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
