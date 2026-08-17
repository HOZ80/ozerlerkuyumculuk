// Ürün verisi — Google Sheets "Publish to web" CSV bağlantısından çekilir.
// KURULUM: Google Sheets'te File > Share > Publish to web > CSV seçip aldığın
// linki aşağıya yapıştır. Sheet sütunları products-template.csv ile birebir
// aynı sırada olmalı: id,name,category,subcategory,price,code,colors,sizes,
// description,featured,inStock,badge,sortOrder,seoDescription

const PRODUCTS_CSV_URL = "PASTE_YOUR_PUBLISHED_SHEET_CSV_URL_HERE";

// Sheet henüz bağlanmadıysa yerel şablon dosyasına düşer (geliştirme/test için)
const FALLBACK_CSV_URL = "products-template.csv";

// GÖRSEL KURALI: her ürünün fotoğrafları assets/img/products/ klasöründe
// <slug>-1.jpg, <slug>-2.jpg, <slug>-3.jpg ... şeklinde, 1'den başlayıp
// boşluksuz numaralanır. Sabit bir üst sınır yok — kod, bir sonraki numarayı
// bulamayana kadar aramaya devam eder. Kaç fotoğraf olursa olsun otomatik
// çalışır, kod değişikliği gerekmez.
const PRODUCTS_IMG_FOLDER = "assets/img/products/";
const IMG_SAFETY_LIMIT = 30; // sonsuz döngüye karşı iç güvenlik sınırı, pratikte hiç dokunulmaz

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

function normalizeProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    price: row.price,
    code: row.code,
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

// Kartlarda gösterilecek ilk görsel — her ürünün en az -1.jpg'i olmalı
function firstProductImage(slug) {
  return `${PRODUCTS_IMG_FOLDER}${slug}-1.jpg`;
}

function checkImageExists(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

// Ürün detay sayfası için: 1'den başlayıp ilk eksik numarada duran galeri listesi
async function getProductGallery(slug) {
  const images = [];
  let i = 1;
  while (i <= IMG_SAFETY_LIMIT) {
    const src = `${PRODUCTS_IMG_FOLDER}${slug}-${i}.jpg`;
    const exists = await checkImageExists(src);
    if (!exists) break;
    images.push(src);
    i++;
  }
  return images;
}
