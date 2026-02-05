# Levios Tasks Plan (Faz 0–1)

Bu plan, ilk iki fazda (MVP + operasyon) çıkarılacak modülleri, bağımlılıkları ve teslimat sırasını netleştirir.

## Kapsam ve Varsayımlar
- İlk fazda satış WhatsApp üzerinden yürütülecek.
- Ödeme ve kargo entegrasyonları Faz 2’ye kalır.
- Ürün türleri: koltuk, sandalye, masa, sehpa.
- Ürün görselleri için arka plan kaldırma + arka plan rengi seçimi gereklidir.
- Kumaş rengi, adminin yönettiği kartela/kumaş/renk katalogundan seçilir.

## Faz 0 — MVP (Katalog + WhatsApp Satış)

### P0.1 Core Framework Genişletme
- [ ] `packages/levios/core/framework`
  - [ ] Bölge bağımsız katalog/kumaş/renk tipleri
  - [ ] Medya işleme job arayüzleri (arka plan kaldırma, arka plan rengi)
  - [ ] WhatsApp satış için temel event tipleri

### P0.2 Catalog Modülü (Yeni)
- [ ] `packages/levios/modules/catalog`
  - [ ] Modeller: Kartela, Fabric, Color, ColorSwatch
  - [ ] Admin API: kartela yönetimi (CRUD)
  - [ ] Kumaş–renk ilişkisi ve publish/unpublish
  - [ ] Yetkilendirme: sadece admin yönetebilir

### P0.3 Furniture Modülü (MVP)
- [ ] `packages/levios/modules/furniture`
  - [ ] Ürün tipi: mobilya türleri + temel özellikler
  - [ ] Kumaş/renk/ölçü konfigürasyonu
  - [ ] Basit fiyatlama (kumaş + ölçü çarpanı)
  - [ ] Ürün satışa aç/kapat bayrağı

### P0.4 Media Modülü (Yeni)
- [ ] `packages/levios/modules/media`
  - [ ] Ürün görseli yükleme akışı
  - [ ] Arka plan kaldırma job (async)
  - [ ] Arka plan rengi uygulama
  - [ ] Ürün görsel varyantları

### P0.5 WhatsApp Sales Modülü (Yeni)
- [ ] `packages/levios/modules/whatsapp-sales`
  - [ ] Ürün linki → WhatsApp mesajı generator
  - [ ] Seçili kumaş/renk/ölçü metni
  - [ ] Inquiry/Lead kaydı
  - [ ] Basit durumlar: new, contacted, closed

### P0.6 Admin UI/Panel (Minimum)
- [ ] Medusa Admin’de katalog yönetimi
- [ ] Ürün listeleme + yayınla/kapat
- [ ] Görsel yükleme + arka plan rengi seçimi
- [ ] WhatsApp lead listesi

### P0.7 Testler (MVP)
- [ ] Unit: catalog + furniture
- [ ] Integration: ürün → WhatsApp akışı

## Faz 1 — Operasyon ve Yönetim

### P1.1 Catalog Geliştirmeleri
- [ ] Kartela versiyonlama
- [ ] Kartela etkinlik tarihçesi
- [ ] Rol bazlı yönetim (admin/super-admin)

### P1.2 Furniture Geliştirmeleri
- [ ] Gelişmiş fiyatlama (kumaş sınıfı + ölçü aralığı)
- [ ] Üretim süresi hesaplama
- [ ] Basit stok/üretim kapasitesi alanları

### P1.3 Media Geliştirmeleri
- [ ] Batch arka plan işlemleri
- [ ] Görsel kalite kontrol akışı
- [ ] Varyant görsel otomasyonu (kumaş rengi değişimi)

### P1.4 WhatsApp Sales Geliştirmeleri
- [ ] Lead pipeline (new → in_progress → won/lost)
- [ ] Teklif notları ve etiketler
- [ ] Basit raporlama (günlük/haftalık)

### P1.5 Admin UI Geliştirmeleri
- [ ] Operasyon panelleri
- [ ] Lead pipeline ekranı
- [ ] Kartela versiyon yönetimi

### P1.6 Testler (Operasyon)
- [ ] Integration: catalog → furniture → media
- [ ] E2E: WhatsApp lead → ürün yayınlama

## Faz 2’ye Hazırlık Notları
- Ödeme provider (iyzico) ve kargo (Yurtiçi) entegrasyonları için adapter arayüzleri şimdiden soyutlanmalı.
- Sipariş modeline geçiş için “lead → order” dönüşüm endpointi planlanmalı.

## Bağımlılık Sırası (Özet)
1) `@levios/framework` (types + base)
2) `@levios/modules/catalog`
3) `@levios/modules/furniture`
4) `@levios/modules/media`
5) `@levios/modules/whatsapp-sales`
6) Admin UI + testler

## Çıktılar (Definition of Done)
- MVP akışı: kartela → ürün → görsel → WhatsApp lead
- Admin panel üzerinden yönetim tamam
- Minimum unit/integration testleri var

## Faz 0 Detay Taslak (Entity + Service)

### Catalog Modülü
- **Entities**
  - `Kartela`: name, code, status, description, metadata
  - `Fabric`: name, code, supplier, status, metadata
  - `Color`: name, code, hex, status, metadata
  - `ColorSwatch`: marci_payload (JSON), image_url, preview_hex
  - `FabricColor` (join): fabric_id, color_id, swatch_id, is_default
- **Services**
  - `KartelaService`: CRUD, publish/unpublish
  - `FabricService`: CRUD, kartela bağlama
  - `ColorService`: CRUD, kartela bağlama
  - `SwatchService`: marci parse/validate

### Furniture Modülü
- **Entities**
  - `FurnitureProduct`: type (sofa/chair/table/coffee_table), base_price, status
  - `FurnitureVariant`: product_id, fabric_id, color_id, dimensions, price_delta
  - `Dimension`: width, depth, height, unit
  - `ProductionTime`: min_days, max_days
- **Services**
  - `FurnitureCatalogService`: ürün + variant yönetimi
  - `FurniturePricingService`: kumaş + ölçü fiyatlama
  - `FurnitureAvailabilityService`: publish/unpublish, üretim süresi

### Media Modülü
- **Entities**
  - `MediaAsset`: product_id, original_url, processed_url, status
  - `ImageJob`: type (bg_remove/bg_color), payload, status, result_url
  - `BackgroundVariant`: asset_id, color_hex, url
- **Services**
  - `MediaUploadService`: asset create
  - `BackgroundRemovalService`: job create/handle
  - `BackgroundColorService`: color apply/variant create

### WhatsApp Sales Modülü
- **Entities**
  - `WhatsAppLead`: phone, status, source, notes
  - `LeadItem`: lead_id, product_id, variant_id, qty
  - `LeadStatusHistory`: lead_id, status, changed_at
- **Services**
  - `WhatsAppMessageBuilder`: ürün + seçim + link formatla
  - `LeadService`: create/update/pipeline

### Core Framework (Ekler)
- **Interfaces**
  - `IBackgroundRemovalProvider`
  - `IBackgroundColorProvider`
  - `IWhatsAppMessageFormatter`

## Faz 0 Admin Ekranları (Minimum)
- Kartela liste + detay (kumaş ve renk bağlama)
- Ürün listesi + yayınla/kapat
- Ürün detay: kumaş/renk/ölçü seçimleri
- Görsel yükleme + arka plan rengi
- WhatsApp lead listesi + durum güncelleme
