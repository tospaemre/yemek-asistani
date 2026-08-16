/**
 * Türkçe malzeme adlarını karşılaştırmak için normalleştirme katmanı.
 *
 * Kullanıcı "Soğan", "sogan", "soğanı", "soğanlar" yazabilir; tarif verisinde
 * "soğan" geçer. Hepsinin aynı şeye denk gelmesi için önce Türkçe karakterleri
 * sadeleştirip sonra basit bir gövdeleme (stemming) uyguluyoruz.
 */

const TR_ASCII: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
  â: 'a',
  î: 'i',
  û: 'u',
}

// Tarif verisindeki malzemeler miktarıyla birlikte geliyor:
// "1 su bardağı toz şeker", "125 gram tereyağı", "2-3 adet domates".
// Eşleştirme için miktarı atıp yalın adı çıkarmamız gerekiyor.
const BIRIMLER = [
  'su bardağı', 'çay bardağı', 'yemek kaşığı', 'tatlı kaşığı', 'çay kaşığı',
  'tepeleme', 'silme', 'tutam', 'demet', 'diş', 'dal', 'sap', 'paket', 'kutu',
  'adet', 'tane', 'gram', 'gr', 'kg', 'ml', 'lt', 'litre', 'fincan', 'avuç',
  'dilim', 'kase', 'bardak', 'kaşık', 'salkım', 'baş', 'parça', 'ölçek', 'top',
].join('|')

// Dikkat: burada \b KULLANILMAZ. JavaScript'te \b yalnızca ASCII harfleri
// tanır; "bardağı", "kaşığı", "diş" gibi Türkçe harfle biten birimlerden sonra
// sınır oluşmaz ve birim ayıklanamaz. Onun yerine boşluk/sonu arıyoruz.
const ONEK = new RegExp(
  '^\\s*(?:(?:bir miktar|aldığı kadar|yarım|birkaç|az miktarda|göz kararı)(?:\\s+|$))?' +
    '(?:[\\d]+(?:[.,/-][\\d]+)?\\s*)*' +
    `(?:(?:${BIRIMLER})(?:\\s+|$))*`,
  'i',
)
const PARANTEZ = /\([^)]*\)/g
const SIFATLAR =
  /\b(büyük|orta|küçük|boy|ince|iri|taze|kuru|doğranmış|rendelenmiş|kıyılmış|haşlanmış|eritilmiş|dolusu|oda sıcaklığında|isteğe bağlı)\b/gi

/**
 * Miktarı ve niteleyicileri atıp yalın malzeme adını verir.
 * "125 gram oda sıcaklığında tereyağı" → "tereyağı"
 */
export function stripQuantity(raw: string): string {
  let s = raw.replace(PARANTEZ, ' ')
  s = s.replace(ONEK, '')
  s = s.replace(SIFATLAR, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  s = s.replace(/^[,\-–:.\s]+|[,\-–:.\s]+$/g, '')
  // Tamamen silindiyse orijinaline dön; boş anahtar hiçbir şeyle eşleşmesin.
  return s.length >= 2 ? s : raw.trim()
}

/** Türkçe karakterleri sadeleştirir, noktalama ve fazla boşluğu atar. */
export function normalize(raw: string): string {
  return raw
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşüâîû]/g, (c) => TR_ASCII[c] ?? c)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Uzundan kısaya sıralı: "salcasi" önce "si" değil "sini" denensin.
// Dikkat: "ni"/"nu" listede YOK. Olsaydı "sogani" → "soga" olurdu; oysa
// doğrusu "i" ekinin atılıp "sogan" kalması.
const SUFFIXES = ['lerini', 'larini', 'sini', 'lari', 'leri', 'lar', 'ler', 'si', 'su', 'yi', 'yu', 'i', 'u']

/** Ünsüz yumuşaması: "tavuğu" → gövde "tavug", karşılığı "tavuk". */
const SOFTENED: Record<string, string> = { g: 'k', b: 'p', d: 't' }

function hardenFinal(word: string): string {
  if (word.length === 0) return word
  // .at(-1) yerine indeks: eski Android WebView sürümlerinde .at() yok.
  const hard = SOFTENED[word[word.length - 1]]
  return hard ? word.slice(0, -1) + hard : word
}

/**
 * Tek bir kelimeden yaygın Türkçe ekleri atar.
 * Sonuç 3 harften kısalacaksa ek atılmaz ("un", "et" bozulmasın).
 */
function stemWord(word: string): string {
  for (const suffix of SUFFIXES) {
    if (word.length - suffix.length >= 3 && word.endsWith(suffix)) {
      return hardenFinal(word.slice(0, -suffix.length))
    }
  }
  return hardenFinal(word)
}

/** "Domates Salçası" → ["domates", "salca"] */
export function tokenize(raw: string): string[] {
  return normalize(raw).split(' ').filter(Boolean).map(stemWord)
}

/** Karşılaştırma için tek parça anahtar: "Kaşar Peyniri" → "kasar peynir" */
export function toKey(raw: string): string {
  return tokenize(raw).join(' ')
}

/**
 * Neredeyse her mutfakta bulunan temel malzemeler. Tarifte geçseler bile
 * "eksik malzeme" sayılmazlar, yoksa hiçbir tarif tam eşleşmez.
 */
const PANTRY = ['tuz', 'karabiber', 'su', 'zeytinyagi', 'sivi yag', 'yag'].map(toKey)

export function isPantry(ingredient: string): boolean {
  const key = toKey(ingredient)
  return PANTRY.includes(key)
}

/**
 * İki malzeme adı aynı şeyi mi gösteriyor?
 *
 * Tam eşitliğin yanında "kapsama" da kabul ediliyor: kullanıcı "tavuk" yazdıysa
 * tarifteki "tavuk göğsü" eşleşir; "kaşar peyniri" yazdıysa tarifteki "kaşar"
 * eşleşir. Kapsama iki yönde de geçerli.
 */
export function sameIngredient(a: string, b: string): boolean {
  const wordsA = tokenize(a)
  const wordsB = tokenize(b)
  if (wordsA.length === 0 || wordsB.length === 0) return false
  if (wordsA.join(' ') === wordsB.join(' ')) return true

  const setA = new Set(wordsA)
  const setB = new Set(wordsB)
  const aInB = wordsA.every((w) => setB.has(w))
  const bInA = wordsB.every((w) => setA.has(w))
  return aInB || bInA
}

/** Kullanıcının listesinde bu malzemeye karşılık gelen bir giriş var mı? */
export function findMatch(ingredient: string, userIngredients: string[]): string | null {
  return userIngredients.find((u) => sameIngredient(ingredient, u)) ?? null
}
