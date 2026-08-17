// Ürün detay sayfası — thumbnail, swatch, ölçü, adet ve akordiyon davranışları
document.addEventListener('DOMContentLoaded', () => {

  // Thumbnail -> ana görsel
  const mainImage = document.getElementById('mainImage');
  document.querySelectorAll('.thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      if (mainImage) mainImage.src = thumb.dataset.img;
    });
  });

  // Renk seçimi
  document.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
    });
  });

  // Ölçü seçimi
  document.querySelectorAll('.size-box').forEach(sz => {
    sz.addEventListener('click', () => {
      document.querySelectorAll('.size-box').forEach(s => s.classList.remove('active'));
      sz.classList.add('active');
    });
  });

  // Adet sayacı
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

  // Akordiyon
  document.querySelectorAll('.acc-row').forEach(row => {
    row.addEventListener('click', () => {
      const isOpen = row.classList.contains('open');
      document.querySelectorAll('.acc-row').forEach(r => r.classList.remove('open'));
      if (!isOpen) row.classList.add('open');
    });
  });

});
