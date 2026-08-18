// Ana sayfa — "Öne Çıkan Parçalar" ızgarasını Sheet verisinden oluşturur
import { loadProducts, formatPrice, firstProductImage, whatsappLink } from './products-data.js';

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  loadProducts().then(products => {
    const featured = products.filter(p => p.featured);
    if (featured.length === 0) {
      grid.innerHTML = '<p style="color:var(--ink-dim); grid-column:1/-1; text-align:center;">Henüz öne çıkan ürün eklenmedi.</p>';
      return;
    }
    grid.innerHTML = featured.map(cardHTML).join('');
  }).catch(err => {
    console.error('Ürünler yüklenemedi:', err);
    grid.innerHTML = '<p style="color:var(--ink-dim); grid-column:1/-1; text-align:center;">Ürünler şu anda yüklenemiyor.</p>';
  });

  function cardHTML(p) {
    const img = firstProductImage(p.code);
    const badge = p.badge ? `<span class="card-badge">${p.badge}</span>` : '';
    return `
      <div class="card-wrap">
        <a class="card" href="/product?slug=${encodeURIComponent(p.id)}">
          <div class="card-image">
            ${badge}
            <img src="${img}" alt="${p.name}" loading="lazy">
          </div>
          <div class="card-body">
            <span class="card-cat">${p.category} · ${p.subcategory}</span>
            <div class="card-name">${p.name}</div>
            <div class="card-price">${formatPrice(p.price)}</div>
          </div>
        </a>
        <a href="${whatsappLink(p)}" target="_blank" rel="noopener" class="ghost-link card-wa-link">WhatsApp'tan Sor →</a>
      </div>`;
  }
});
