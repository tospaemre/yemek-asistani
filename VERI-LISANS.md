# Tarif verisinin kaynağı ve lisansı

`public/recipes.json` dosyasındaki 5.000 tarif bu projede yazılmadı, açık lisanslı
bir veri setinden türetildi.

## Kaynak

**turkish-recipes-175K**
https://huggingface.co/datasets/mmkocak/turkish-recipes-175K

- Lisans: **Apache License 2.0**
- Kaynaktaki kayıt sayısı: 174.975
- Veri setinin kendi açıklaması: "Halka açık Türkçe yemek tarifi kaynaklarından
  toplanmış; başlık, malzeme listesi, talimatlar, kategori, etiket, porsiyon,
  pişirme süreleri ve besin değerleri içerir."

Apache-2.0 lisansının tam metni:
https://www.apache.org/licenses/LICENSE-2.0

## Bu projede ne değiştirildi

Ham veri olduğu gibi kullanılmadı. `scripts/tarif-uret.py` betiği kaynak veriyi
işleyip `public/recipes.json` dosyasını üretiyor:

1. **Eleme** — malzemesi, adımı, kategorisi, porsiyonu ya da süresi eksik olan;
   bozuk karakter, HTML etiketi veya bağlantı içeren kayıtlar atıldı.
   164.476 kayıt okundu, 46.350'si elendi.
2. **Tekrar ayıklama** — aynı başlığa sahip tarifler teke indirildi.
3. **Öğün eşlemesi** — kaynaktaki 260 kategori uygulamanın beş öğününe
   (kahvaltı / öğle / akşam / ara öğün / tatlı) eşlendi. Bebek maması, turşu,
   reçel, sos gibi öğün sayılmayan kategoriler kapsam dışı bırakıldı.
4. **Emoji** — kaynakta emoji yok. Her kategoriye bir emoji atandı; kategori
   her kayıtta dolu olduğu için emojisiz tarif kalmıyor.
5. **Zorluk** — kaynakta zorluk alanı yok. Sabit bir kuralla hesaplanıyor:
   - `Kolay`: toplam süre ≤ 45 dk **ve** ≤ 10 adım **ve** ≤ 10 malzeme
   - `Zor`: toplam süre ≥ 90 dk **veya** ≥ 16 adım **veya** ≥ 16 malzeme
   - `Orta`: diğerleri
6. **Seçim** — öğün başına 1.000 tarif; her öğünde zorluk dağılımı korunacak
   şekilde (yaklaşık 420 Kolay / 400 Orta / 180 Zor) ve anlatımı en ayrıntılı
   olanlar öncelikli.

Süre, porsiyon ve kategori bilgileri **doğrudan kaynak veriden** gelir; tahmin
edilmez. Emoji ve zorluk yukarıdaki kurallarla türetilir.

## Yeniden üretmek için

```bash
# Kaynak veriyi indir
curl -LO https://huggingface.co/datasets/mmkocak/turkish-recipes-175K/resolve/main/data/train.jsonl
curl -LO https://huggingface.co/datasets/mmkocak/turkish-recipes-175K/resolve/main/data/validation.jsonl

python3 scripts/tarif-uret.py train.jsonl validation.jsonl
# → recipes.json üretir, public/ altına kopyala
```

## Not

Veri seti Apache-2.0 ile yayımlanmıştır ve kaynağını açıkça belirtir. Yine de
altındaki tarif metinleri halka açık sitelerden derlenmiştir. Bu proje ticari
değildir; hak sahibi bir itirazda bulunursa ilgili içerik kaldırılacaktır.
