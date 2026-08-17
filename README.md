# Özerler Kuyumculuk

Astro ile kurulmuş, Netlify üzerinde otomatik build/deploy edilen kurumsal site.

## Proje yapısı

```
src/
  layouts/StoreLayout.astro   → ticker + nav + footer içeren ortak iskelet
  components/Nav.astro        → menü (tek dosya, tüm sayfalara otomatik yansır)
  components/Footer.astro     → footer (tek dosya, tüm sayfalara otomatik yansır)
  components/Ticker.astro     → piyasa şeridi
  pages/index.astro           → "/" — giriş/karşılama sayfası
  pages/home.astro            → "/home" — ana site
  pages/product.astro         → "/product?slug=..." — ürün detay sayfası (Sheet'ten dinamik)
  pages/category.astro        → "/category?cat=..." — kategori listesi (Sheet'ten dinamik)
public/
  assets/css/style.css        → tüm tasarım (renk, font, bileşen stilleri)
  assets/js/                  → ürün/kategori/ana sayfa mantığı (Sheet'i okuyan kod)
  assets/img/                 → hero, kategori, ürün görselleri
  products-template.csv       → Sheet bağlanmadıysa kullanılan örnek veri
```

## Nav/Footer artık nerede değişiyor

Menüde veya footer'da bir değişiklik gerektiğinde artık **tek dosya** yeterli:
`src/components/Nav.astro` ya da `src/components/Footer.astro`. Tüm sayfalara
otomatik yansır, her sayfayı tek tek değiştirmeye gerek yok.

## Google Sheets bağlantısı

`public/assets/js/products-data.js` dosyasının en üstündeki
`PRODUCTS_CSV_URL` satırına, Sheet'in "Publish to web → CSV" linkini yapıştır.
Sütun sırası: `id,name,category,subcategory,price,code,colors,sizes,
description,featured,inStock,badge,sortOrder,seoDescription`

## Ürün görselleri

`public/assets/img/products/<slug>-1.jpg`, `-2.jpg`, `-3.jpg`... — 1'den
başlayıp boşluksuz devam ettiği sürece kaç tane olursa olsun otomatik bulunur.

## Yerel geliştirme (opsiyonel)

```
npm install
npm run dev       # yerel önizleme, canlı yenileme ile
npm run build     # dist/ klasörüne statik çıktı üretir (Netlify bunu otomatik yapar)
```

## Deploy

GitHub'a push attığında Netlify bu repo'yu otomatik build edip yayınlar
(`netlify.toml` içindeki `npm run build` komutuyla). Statik dosyaları elle
sürükleyip bırakmaya artık gerek yok — kaynak kodu push etmen yeterli.
