// Ürün verisi — Google Sheets "Publish to web" CSV bağlantısından çekilir.
// KURULUM: Google Sheets'te File > Share > Publish to web > CSV seçip aldığın
// linki aşağıya yapıştır. Sheet sütunları products-template.csv ile birebir
// aynı sırada olmalı: id,name,category,subcategory,price,code,colors,sizes,
// description,featured,inStock,badge,sortOrder,seoDescription

const PRODUCTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRC1WD4GGeqm7_fqazFK41ISRmgEA1xqlQp7z4gHAjBTokbt0dQcpYB_AdC3psIN3O7_xMrYqey9xzm/pub?output=csv";

// Sheet henüz bağlanmadıysa yerel şablon dosyasına düşer (geliştirme/test için)
const FALLBACK_CSV_URL = "/products-template.csv";

// GÖRSEL KURALI: her ürünün fotoğrafları assets/img/products/ klasöründe
// <code>_1.jpg, <code>_2.jpg, <code>_3.jpg ... şeklinde, ürünün Sheet'teki
// `code` sütununa göre (örn. OZ-4471_1.jpg) — isme göre DEĞİL, çünkü aynı
// isimde iki ürün olabilir ama kod her zaman benzersiz. 1'den başlayıp
// boşluksuz numaralanır. Sabit bir üst sınır yok — kod, bir sonraki numarayı
// bulamayana kadar aramaya devam eder. Kaç fotoğraf olursa olsun otomatik
// çalışır, kod değişikliği gerekmez.
const PRODUCTS_IMG_FOLDER = "/assets/img/products/";
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

export function normalizeProduct(row) {
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

export function loadProducts() {
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

export function formatPrice(price) {
  const n = parseFloat(price);
  if (isNaN(n)) return price;
  return '₺ ' + n.toLocaleString('tr-TR');
}

// Kartlarda gösterilecek ilk görsel — her ürünün en az _1.jpg'i olmalı
// (ürünün Sheet'teki code'una göre, isme göre değil)
export function firstProductImage(code) {
  return `${PRODUCTS_IMG_FOLDER}${code}_1.jpg`;
}

export function checkImageExists(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

// Ürün detay sayfası için: 1'den başlayıp ilk eksik numarada duran galeri listesi
// (ürünün code'una göre)
export async function getProductGallery(code) {
  const images = [];
  let i = 1;
  while (i <= IMG_SAFETY_LIMIT) {
    const src = `${PRODUCTS_IMG_FOLDER}${code}_${i}.jpg`;
    const exists = await checkImageExists(src);
    if (!exists) break;
    images.push(src);
    i++;
  }
  return images;
}
