"""turkish-recipes-175K → uygulamanın tarif dosyası.

Kaynak: https://huggingface.co/datasets/mmkocak/turkish-recipes-175K (Apache-2.0)
"""
import json, re, unicodedata, collections, sys

HEDEF_OGUN = 1000  # öğün başına

# ── kategori → (öğün, emoji) ────────────────────────────────────────────
# Sıra ÖNEMLİ: "Tatlı Kurabiyeler" önce tatlı kuralına takılmalı.
KURALLAR = [
    # (öğün, emoji, kategoride aranan parçalar)
    ('tatli', '🍰', ['tatlı kek', 'yaş pasta', 'pasta', 'cheesecake']),
    ('tatli', '🍪', ['tatlı kurabiye', 'kurabiye tarifleri', 'anne kurabiyesi', 'donut']),
    ('tatli', '🍮', ['sütlü tatlı', 'muhallebi']),
    ('tatli', '🍯', ['şerbetli', 'helva', 'lokum', 'geleneksel tatlı']),
    ('tatli', '🍨', ['dondurma']),
    ('tatli', '🍫', ['çikolatalı']),
    ('tatli', '🍓', ['meyveli tatlı', 'komposto', 'hoşaf']),
    ('tatli', '🎂', ['kek']),
    ('tatli', '🥧', ['tart']),
    ('tatli', '🍬', ['tatlı']),

    ('kahvalti', '🥐', ['poğaça', 'çörek', 'simit', 'açma']),
    ('kahvalti', '🥟', ['börek']),
    ('kahvalti', '🍳', ['yumurta', 'omlet']),
    ('kahvalti', '🥞', ['krep', 'pankek', 'gözleme']),
    ('kahvalti', '🍞', ['ekmek']),
    ('kahvalti', '🧀', ['peynirli', 'süt ürünleri']),
    ('kahvalti', '🍳', ['kahvaltı', 'sahur']),

    ('ara', '🥗', ['salata']),
    ('ara', '🥙', ['meze', 'kanepe', 'aperatif']),
    ('ara', '🥪', ['tost', 'sandviç', 'dürüm', 'hamburger']),
    ('ara', '🍕', ['pizza']),
    ('ara', '🥤', ['içecek']),
    ('ara', '🍟', ['kızartma']),
    ('ara', '🥨', ['tuzlu kurabiye', 'tuzlu atıştırmalık', 'atıştırmalık', 'çay saati',
                   'kiş', 'milföy', 'kuruyemiş', 'tuzlu kek']),
    ('ara', '🥧', ['hamur işi']),

    ('ogle', '🍲', ['çorba']),
    ('ogle', '🍝', ['makarna', 'erişte']),
    ('ogle', '🥟', ['mantı']),
    ('ogle', '🍚', ['pilav']),
    ('ogle', '🫘', ['bakliyat']),
    ('ogle', '🫒', ['zeytinyağlı']),
    ('ogle', '🥬', ['sebze', 'semizotlu']),
    ('ogle', '🍢', ['dolma', 'sarma']),
    ('ogle', '🥘', ['sulu yemek', 'ev yemekleri', 'diyet yemek', 'hızlı yemek',
                    'pratik yemek', 'glutensiz yemek', 'vejetaryen', 'vegan', 'diyet']),

    ('aksam', '🍗', ['tavuk', 'hindi']),
    ('aksam', '🍖', ['kebap', 'et yemek', 'kırmızı et', 'biftek', 'sakatat', 'çiğ köfte']),
    ('aksam', '🧆', ['köfte']),
    ('aksam', '🐟', ['balık', 'deniz ürün']),
    ('aksam', '🫓', ['pide', 'lahmacun']),
    ('aksam', '🥘', ['fırın yemek', 'airfryer', 'güveç', 'yöresel', 'mutfağı', 'mutfakları',
                     'davet', 'iftar yemek', 'yılbaşı', 'bayram yemek', 'akşam yemeği',
                     'patates yemek', 'et']),
]

# Uygulamaya hiç girmeyecek kategoriler
DISLA = ['bebek', 'turşu', 'kış hazırlık', 'reçel', 'salamura', 'pekmez', 'baharat yapımı',
         'yazarlar', 'video', 'faydalı bilgiler', 'sizden gelenler', 'mevsiminde',
         'diyetler', 'özel beslenme', 'takviye', 'kalori', 'sos', 'derin dondurucu',
         'buzluk', 'dondurulmuş', 'diğer tarifler', 'çocuk', 'diyabetik']

MEAL_FALLBACK_EMOJI = {'kahvalti': '🍳', 'ogle': '🍲', 'aksam': '🍽️', 'ara': '🥪', 'tatli': '🍰'}

# ── emoji: ÖNCE tarif adına bak ─────────────────────────────────────────
# Kategoriden seçmek yetmiyor: "Kahvaltılık Tarifler" kategorisinde 3000'den
# fazla tarif var ve hepsi aynı emojiyi alıyordu (menemen de, simit de).
# Tarif adı çok daha ayırt edici. Sıra önemli — özel olan önce gelmeli.
TATLI_EMOJI = [
    ('🍩', ['donut', 'halka tatlı']),
    ('🧇', ['waffle']),
    ('🍨', ['dondurma', 'buzlu']),
    ('🍮', ['sütlaç', 'muhallebi', 'puding', 'supangle', 'kazandibi', 'krem karamel',
            'krem şokola', 'tavuk göğsü', 'güllaç', 'aşure', 'trileçe', 'magnolia']),
    ('🥮', ['helva']),
    ('🍯', ['baklava', 'kadayıf', 'künefe', 'şöbiyet', 'revani', 'şekerpare', 'lokma',
            'tulumba', 'kalburabastı', 'sütlü nuriye', 'şerbet', 'ballı']),
    ('🍬', ['lokum', 'şeker', 'karamel', 'marshmallow']),
    ('🍫', ['browni', 'brownie', 'çikolata', 'mozaik', 'kakao', 'trüf']),
    ('🍪', ['kurabiye', 'bisküvi', 'kek dilim', 'çörek otlu']),
    ('🥧', ['tart', 'turta', 'strudel']),
    ('🍰', ['cheesecake', 'pasta', 'tiramisu', 'pandispanya', 'rulo']),
    ('🎂', ['kek', 'muffin', 'cupcake']),
    ('🍎', ['elmalı', 'elma']),
    ('🍌', ['muzlu', 'muz']),
    ('🍓', ['çilek', 'frambuaz', 'orman meyveli']),
    ('🍋', ['limonlu']),
    ('🍊', ['portakal', 'mandalina']),
    ('🥤', ['limonata', 'şerbeti', 'içecek', 'smoothie', 'milkshake']),
    ('🍵', ['çayı']),
]

TUZLU_EMOJI = [
    ('🍳', ['menemen', 'omlet', 'yumurta', 'sahanda', 'kaygana', 'çılbır', 'mıhlama',
            'kuymak', 'şakşuka yumurta']),
    ('🥟', ['börek', 'milföy', 'mantı', 'yufka', 'çibörek', 'muska', 'sigara böreği']),
    ('🥐', ['poğaça', 'açma', 'çörek', 'simit', 'kruvasan']),
    ('🍞', ['ekmek', 'bazlama', 'lavaş', 'sandviç ekmeği', 'galeta']),
    ('🥞', ['krep', 'pankek', 'gözleme', 'katmer', 'pişi', 'bazlama']),
    ('🧀', ['peynirli', 'kaşarlı', 'peynir', 'kaşar']),
    ('🍕', ['pizza', 'lahmacun']),
    ('🫓', ['pide', 'pita']),
    ('🥪', ['tost', 'sandviç', 'burger', 'hamburger', 'dürüm', 'wrap', 'bagel']),
    ('🍲', ['çorba', 'çorbası']),
    ('🍝', ['makarna', 'spagetti', 'erişte', 'noodle', 'penne', 'fettucine', 'lazanya']),
    ('🍚', ['pilav', 'bulgur', 'kuskus', 'risotto']),
    ('🥗', ['salata', 'salatası']),
    ('🥙', ['humus', 'ezme', 'meze', 'kanepe', 'tarator', 'pilaki', 'acuka', 'atom']),
    ('🧆', ['köfte', 'kofte', 'falafel', 'içli köfte']),
    ('🐟', ['balık', 'somon', 'hamsi', 'levrek', 'çipura', 'karides', 'midye', 'kalamar',
            'ton balığı', 'alabalık', 'palamut', 'lüfer']),
    ('🍗', ['tavuk', 'kanat', 'piliç', 'hindi', 'nugget']),
    ('🍖', ['kebap', 'kebabı', 'biftek', 'bonfile', 'kavurma', 'rosto', 'sucuk', 'pastırma',
            'kuşbaşı', 'kıymalı', 'et sote', 'saç kavurma', 'ciğer', 'kuzu', 'dana', 'şiş']),
    ('🍆', ['patlıcan', 'karnıyarık', 'musakka', 'imambayıldı', 'beğendi']),
    ('🥔', ['patates']),
    ('🍟', ['kızartma', 'cips', 'çıtır']),
    ('🥒', ['kabak', 'mücver', 'salatalık', 'turşu']),
    ('🍅', ['domates']),
    ('🍄', ['mantar']),
    ('🌽', ['mısır']),
    ('🥬', ['ıspanak', 'pırasa', 'lahana', 'marul', 'semizotu', 'brokoli', 'karnabahar',
            'enginar', 'bamya', 'taze fasulye', 'yaprak']),
    ('🫘', ['nohut', 'fasulye', 'mercimek', 'barbunya', 'bakliyat', 'börülce']),
    ('🍢', ['dolma', 'sarma', 'sarması', 'dolması']),
    ('🫒', ['zeytinyağlı', 'zeytin']),
    ('🥘', ['güveç', 'türlü', 'sote', 'tava', 'fırında', 'kapama', 'saç']),
    ('🥤', ['limonata', 'ayran', 'içecek', 'smoothie', 'şalgam']),
    ('☕', ['kahve']),
    ('🍵', ['çayı', 'bitki çayı']),
]


YUMUSAMA = {'k': 'ğ', 'p': 'b', 't': 'd', 'ç': 'c'}


def kok_bicimleri(kelime):
    """'balık' → {'balık','balığ'} ; 'ekmek' → {'ekmek','ekmeğ'}
    Ünsüz yumuşaması yüzünden 'balık' anahtarı 'balığı' kelimesini tutmuyor."""
    bicimler = {kelime}
    if kelime and kelime[-1] in YUMUSAMA:
        bicimler.add(kelime[:-1] + YUMUSAMA[kelime[-1]])
    return bicimler


def emoji_adtan(baslik, ogun):
    """Tarif adından emoji seç.

    İki tuzak var:
    1. Kelime İÇİNDE arama yanlış eşleşiyor — "kaçmaz" içinde "açma",
       "balığı" içinde "bal" bulunuyor. Bu yüzden kelime BAŞINA bakıyoruz.
    2. Ünsüz yumuşaması: "ekmek" anahtarı "ekmeği" kelimesini tutmuyor.
       Bu yüzden yumuşamış biçimi de deniyoruz.

    Tatlılarda tuzlu anahtarlar hiç denenmez; yoksa "Sütlü Tavuk Göğsü"
    tatlısı tavuk emojisi alır.
    """
    a = baslik.lower()
    kelimeler = [w for w in re.split(r'[^a-zçğıöşü]+', a) if w]
    tablolar = [TATLI_EMOJI] if ogun == 'tatli' else [TUZLU_EMOJI, TATLI_EMOJI]
    for tablo in tablolar:
        for emoji, anahtarlar in tablo:
            for anahtar in anahtarlar:
                if ' ' in anahtar:
                    # çok kelimeli anahtar zaten ayırt edici, doğrudan aransın
                    if anahtar in a:
                        return emoji
                elif any(w.startswith(b) for w in kelimeler for b in kok_bicimleri(anahtar)):
                    return emoji
    return None


def esle(kategori):
    k = kategori.lower()
    for d in DISLA:
        if d in k:
            return None
    for ogun, emoji, parcalar in KURALLAR:
        for p in parcalar:
            if p in k:
                return ogun, emoji
    return None


# ── zorluk: sabit kural ─────────────────────────────────────────────────
def zorluk(adim, malzeme, sure):
    """Sabit kural — her tarife aynı ölçüt uygulanır.
    Kolay: 45 dakikaya kadar VE en fazla 10 adım VE en fazla 10 malzeme
    Zor  : 90 dakika ve üzeri VEYA 16+ adım VEYA 16+ malzeme
    """
    if sure <= 45 and adim <= 10 and malzeme <= 10:
        return 'Kolay'
    if sure >= 90 or adim >= 16 or malzeme >= 16:
        return 'Zor'
    return 'Orta'


# öğün başına zorluk kotası — dağılım gerçekçi olsun diye
KOTA = {'Kolay': 420, 'Orta': 400, 'Zor': 180}


ISO = re.compile(r'^PT(?:(\d+)H)?(?:(\d+)M)?$')
def dk(v):
    m = ISO.match(str(v or '').strip())
    return int(m.group(1) or 0) * 60 + int(m.group(2) or 0) if m else None

HTML_ETIKET = re.compile(r'<[^>]{1,60}>')
BASLIK_SON = re.compile(r'\s*\((videolu|resimli|videosu|video)\)\s*$', re.I)

def html_sil(s):
    return re.sub(r'\s+', ' ', HTML_ETIKET.sub(' ', s)).strip()
BOLUM_BASLIGI = re.compile(r'^[^:]{2,30}:\s*$')

def norm_baslik(t):
    t = unicodedata.normalize('NFKC', t).lower()
    return re.sub(r'[^a-zçğıöşü0-9]+', '', t)


def temiz_mi(r):
    ing, ins = r.get('ingredients') or [], r.get('instructions') or []
    if not (3 <= len(ing) <= 25 and 3 <= len(ins) <= 25):
        return False
    if not r.get('category') or not r.get('title'):
        return False
    if not str(r.get('servings') or '').strip().isdigit():
        return False
    if dk(r.get('prep_time')) is None or dk(r.get('cook_time')) is None:
        return False
    metin = r['title'] + ' '.join(ing) + ' '.join(ins) + r['category']
    if '�' in metin or '&' in metin and ';' in metin:
        return False
    if any(len(s) < 12 for s in ins):
        return False
    if any(len(s) > 400 for s in ins):
        return False
    return True


havuz = collections.defaultdict(list)
gorulen = set()
okunan = elenen = 0

for dosya in sys.argv[1:]:
    for line in open(dosya, encoding='utf-8'):
        okunan += 1
        r = json.loads(line)
        if not temiz_mi(r):
            elenen += 1
            continue
        e = esle(r['category'])
        if not e:
            elenen += 1
            continue
        ogun, emoji = e

        baslik = BASLIK_SON.sub('', r['title'].strip())
        anahtar = norm_baslik(baslik)
        if not anahtar or anahtar in gorulen:
            continue
        gorulen.add(anahtar)

        malzemeler = [html_sil(m) for m in r['ingredients']]
        malzemeler = [m for m in malzemeler
                      if m and not BOLUM_BASLIGI.match(m) and 2 <= len(m) <= 60]
        if len(malzemeler) < 3:
            continue
        adimlar = [html_sil(s) for s in r['instructions']]
        adimlar = [s for s in adimlar if len(s) >= 12]
        if len(adimlar) < 3:
            continue
        # temizlikten sonra hâlâ işaretleme ya da bağlantı kaldıysa kaydı at
        kalan = ' '.join(malzemeler + adimlar + [baslik])
        if '<' in kalan or '>' in kalan or 'http' in kalan.lower():
            continue
        hazirlik, pisirme = dk(r['prep_time']), dk(r['cook_time'])
        toplam = hazirlik + pisirme
        if not (5 <= toplam <= 300):
            continue
        kisi = int(r['servings'])
        if not (1 <= kisi <= 20):
            continue

        # kalite puanı: anlatımı ayrıntılı ve derli toplu tarifler öne çıksın.
        # Zorluk katmanlarını bozmamak için uzunluğu doğrudan ödüllendirmiyoruz.
        p = 0
        p += min(len(' '.join(adimlar)) // 150, 10)  # yeterince ayrıntılı anlatım
        p += 6 if len(baslik) <= 40 else 0
        p += 4 if 4 <= len(malzemeler) <= 16 else 0
        p += 4 if 4 <= len(adimlar) <= 20 else 0
        p += 3 if kisi <= 8 else 0

        havuz[ogun].append({
            'i': anahtar[:28],
            't': baslik,
            # önce tarif adı, olmazsa kategori, o da olmazsa öğün varsayılanı
            'e': emoji_adtan(baslik, ogun) or emoji or MEAL_FALLBACK_EMOJI[ogun],
            'm': ogun,
            'p': hazirlik,
            'c': pisirme,
            's': kisi,
            'd': zorluk(len(adimlar), len(malzemeler), toplam),
            'g': malzemeler,
            'a': adimlar,
            '_p': p,
        })

print(f'okunan: {okunan}  elenen: {elenen}')
print('havuz:', {k: len(v) for k, v in havuz.items()})

secilen = []
for ogun, liste in havuz.items():
    liste.sort(key=lambda x: -x['_p'])
    kalan = 0
    for seviye, kota in KOTA.items():
        katman = [r for r in liste if r['d'] == seviye][:kota + kalan]
        kalan += kota - len(katman)  # o seviyede yeterli yoksa diğerine devret
        secilen.extend(katman)
for r in secilen:
    del r['_p']
secilen.sort(key=lambda r: (r['m'], r['t']))

# id'ler benzersiz olsun (başlık kısaltması çakışabiliyor)
sayac = collections.Counter()
for r in secilen:
    sayac[r['i']] += 1
    if sayac[r['i']] > 1:
        r['i'] = f"{r['i']}{sayac[r['i']]}"

print('seçilen:', collections.Counter(r['m'] for r in secilen))
print('zorluk :', collections.Counter(r['d'] for r in secilen))
print('emoji  :', len(set(r['e'] for r in secilen)), 'farklı')
print('emojisiz:', sum(1 for r in secilen if not r['e']))

js = json.dumps(secilen, ensure_ascii=False, separators=(',', ':'))
open('recipes.json', 'w', encoding='utf-8').write(js)
import gzip
print(f'\nrecipes.json: {len(js.encode())/1024/1024:.2f} MB  (gzip {len(gzip.compress(js.encode()))/1024/1024:.2f} MB)')
print(f'toplam {len(secilen)} tarif')
