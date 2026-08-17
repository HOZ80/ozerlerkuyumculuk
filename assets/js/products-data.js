// Ürün verisi — Google Sheets "Publish to web" CSV bağlantısından çekilir.
// KURULUM: Google Sheets'te File > Share > Publish to web > CSV seçip aldığın
// linki aşağıya yapıştır. Sheet sütunları products-template.csv ile birebir
// aynı sırada olmalı: id,name,category,subcategory,price,code,
// image1,image2,image3,image4,colors,sizes,description,featured,inStock,
// badge,sortOrder,seoDescription

const PRODUCTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRC1WD4GGeqm7_fqazFK41ISRmgEA1xqlQp7z4gHAjBTokbt0dQcpYB_AdC3psIN3O7_xMrYqey9xzm/pubhtml";

// Sheet henüz bağlanmadıysa yerel şablon dosyasına düşer (geliştirme/test için)
const FALLBACK_CSV_URL = "products-template.csv";

function parseColorField(raw) {
  // "Sarı Altın|#E8B84B,Rose Altın|#E7C9B8" -> [{name, hex}, ...]
  if (!raw) return [];
  return raw.split(',').map(part => {
    const [name, hex] = part.split('|');
    return { name: (name || '').trim(), hex: (hex || '#ccc').trim() };
  }).filter(c => c.name);
}

function parseSizeField(raw) {
  if (!raw) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

function parseImages(row) {
  return [row.image1, row.image2, row.image3, row.image4].filter(Boolean);
}

function normalizeProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    price: row.price,
    code: row.code,
    images: parseImages(row),
    colors: parseColorField(row.colors),
    sizes: parseSizeField(row.sizes),
    description: row.description,
    featured: (row.featured || '').trim().toLowerCase() === 'evet',
    inStock: (row.inStock || '').trim().toLowerCase() !== 'hayır',
    badge: row.badge,
    sortOrder: parseInt(row.sortOrder, 10) || 999,
    seoDescription: row.seoDescription
  };
}

function loadProducts() {
  const url = (PRODUCTS_CSV_URL.indexOf('PASTE_YOUR') === 0) ? FALLBACK_CSV_URL : PRODUCTS_CSV_URL;
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const products = results.data
          .map(normalizeProduct)
          .filter(p => p.id)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        resolve(products);
      },
      error: (err) => reject(err)
    });
  });
}

function formatPrice(price) {
  const n = parseFloat(price);
  if (isNaN(n)) return price;
  return '₺ ' + n.toLocaleString('tr-TR');
}
