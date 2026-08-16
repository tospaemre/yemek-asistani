import type { MealId, Recipe, RecipeSuggestion } from './types'
import { sameIngredient, isPantry, stripQuantity, tokenize } from './ingredients'

/**
 * Tarif öneri motoru.
 *
 * Tarifler `public/recipes.json` içinde uygulamayla birlikte geliyor; hiçbir
 * sunucuya istek atılmıyor, internet gerekmiyor. Dosya JavaScript paketine
 * gömülmek yerine ayrı bir varlık olarak duruyor ve ilk öneri istendiğinde
 * bir kez okunuyor — böylece uygulama açılışı yavaşlamıyor.
 *
 * Veri kaynağı: mmkocak/turkish-recipes-175K (Apache-2.0). Ayrıntı için
 * depo kökündeki VERI-LISANS.md dosyasına bak.
 */

/** recipes.json içindeki ham kayıt. Alan adları boyut için kısaltılmış. */
interface RawRecipe {
  i: string // id
  t: string // başlık
  e: string // emoji
  m: MealId // öğün
  p: number // hazırlık (dk)
  c: number // pişirme (dk)
  s: number // kişi
  d: Recipe['difficulty']
  g: string[] // malzemeler (miktarıyla birlikte)
  a: string[] // adımlar
}

/** Ham kayıt + eşleştirme için önceden hesaplanmış yalın malzeme adları. */
interface Indexed {
  raw: RawRecipe
  /** [görünen hâli, eşleştirmede kullanılan yalın ad] çiftleri */
  required: Array<[string, string]>
}

let cache: Map<MealId, Indexed[]> | null = null
let loading: Promise<Map<MealId, Indexed[]>> | null = null

async function loadRecipes(): Promise<Map<MealId, Indexed[]>> {
  if (cache) return cache
  if (loading) return loading

  loading = (async () => {
    const res = await fetch('/recipes.json')
    if (!res.ok) throw new Error(`Tarif dosyası okunamadı (${res.status})`)
    const rows: RawRecipe[] = await res.json()

    const byMeal = new Map<MealId, Indexed[]>()
    for (const raw of rows) {
      // Miktar ayıklama tarif başına bir kez yapılır, her aramada değil.
      const required: Array<[string, string]> = []
      for (const line of raw.g) {
        const bare = stripQuantity(line)
        if (!isPantry(bare)) required.push([line, bare])
      }
      const list = byMeal.get(raw.m)
      if (list) list.push({ raw, required })
      else byMeal.set(raw.m, [{ raw, required }])
    }
    cache = byMeal
    return byMeal
  })()

  return loading
}

interface Scored {
  item: Indexed
  used: string[]
  missing: string[]
  score: number
}

const DIFFICULTY_ORDER: Record<Recipe['difficulty'], number> = { Kolay: 0, Orta: 1, Zor: 2 }

function score(item: Indexed, userIngredients: string[]): Scored {
  const used: string[] = []
  const missing: string[] = []

  for (const [display, bare] of item.required) {
    if (userIngredients.some((u) => sameIngredient(bare, u))) used.push(display)
    else missing.push(display)
  }

  const total = item.required.length
  const coverage = total === 0 ? 0 : used.length / total

  // Oran tek başına yanıltıcı: 3 malzemeli bir tarifin %100'ü, 10 malzemeli
  // bir tarifin %70'inden her zaman daha iyi değil. Eşleşen malzeme sayısına
  // da ağırlık veriyoruz.
  return { item, used, missing, score: coverage * 100 + used.length * 6 }
}

function compare(a: Scored, b: Scored): number {
  if (b.score !== a.score) return b.score - a.score
  if (a.missing.length !== b.missing.length) return a.missing.length - b.missing.length
  const d = DIFFICULTY_ORDER[a.item.raw.d] - DIFFICULTY_ORDER[b.item.raw.d]
  if (d !== 0) return d
  return a.item.raw.p + a.item.raw.c - (b.item.raw.p + b.item.raw.c)
}

function toRecipe(s: Scored): Recipe {
  const r = s.item.raw
  return {
    id: r.i,
    title: r.t,
    emoji: r.e,
    meal: r.m,
    prepTime: r.p,
    cookTime: r.c,
    servings: r.s,
    difficulty: r.d,
    usedIngredients: s.used,
    missingIngredients: s.missing,
    ingredients: r.g,
    steps: r.a,
  }
}

/** Eşleştirme yapılmadan, tarifi olduğu gibi gösterirken (ada göre arama). */
function toPlainRecipe(r: RawRecipe): Recipe {
  return {
    id: r.i,
    title: r.t,
    emoji: r.e,
    meal: r.m,
    prepTime: r.p,
    cookTime: r.c,
    servings: r.s,
    difficulty: r.d,
    usedIngredients: [],
    missingIngredients: [],
    ingredients: r.g,
    steps: r.a,
  }
}

/** Ana tarif + 8 alternatif. Beğenmezsen elinde bolca seçenek kalsın. */
const RESULT_COUNT = 9
const RECENT_LIMIT = 60

/** Son aramalarda gösterilen tarifler — arka arkaya aynısını çıkarmamak için. */
const recentlyShown: string[] = []

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

/**
 * Aynı malzemelerle her seferinde aynı tarifi göstermemek için, en iyi puanın
 * yakınındaki adaylardan rastgele seçim yapar.
 *
 * Sıralamanın tepesini körü körüne almak sonucu sabitliyordu. Bunun yerine
 * puanı en iyinin %80'inden yukarıda olan adaylardan bir havuz kuruluyor;
 * kalite düşmüyor ama her arama farklı çıkıyor. Son aramalarda gösterilenler
 * havuzdan çıkarılıyor ki arka arkaya tekrar etmesin.
 */
function pickVaried(ranked: Scored[]): Scored[] {
  // Havuzu puana göre değil EŞLEŞEN MALZEME SAYISINA göre kuruyoruz.
  // Puan eşiği havuzu bir iki tarife düşürüyordu; "en iyiden en fazla bir
  // malzeme eksik eşleşenler" ölçütü hem geniş hem konuyla ilgili bir küme veriyor.
  // Sıralama zaten eşleşen malzemeyi önceliklendiriyor; havuzu onun tepesinden
  // alıyoruz. Tek ek koşul eksik malzeme tavanı: "elinde 3, eksik 9" gibi bir
  // tarif önermek çeşitlilik değil, kullanışsızlık olur.
  const maxMissing = Math.max(5, ranked[0].missing.length + 2)
  let pool = ranked.filter((r) => r.missing.length <= maxMissing).slice(0, 40)
  if (pool.length < RESULT_COUNT) pool = ranked.slice(0, Math.max(RESULT_COUNT, 20))

  // Son aramalarda çıkanları ele; yeterli taze kalmazsa havuzun tamamına dön.
  const fresh = pool.filter((r) => !recentlyShown.includes(r.item.raw.i))
  const shuffled = shuffle(fresh.length >= RESULT_COUNT ? fresh : pool)

  // Ana tarif havuzdan rastgele — sıralamanın tepesini almak sonucu sabitliyordu.
  // Alternatifler kendi içinde iyiden kötüye sıralı gösterilsin.
  const main = shuffled[0]
  const alternatives = shuffled.slice(1, RESULT_COUNT).sort(compare)
  const chosen = [main, ...alternatives]

  for (const c of chosen) recentlyShown.push(c.item.raw.i)
  if (recentlyShown.length > RECENT_LIMIT) {
    recentlyShown.splice(0, recentlyShown.length - RECENT_LIMIT)
  }

  return chosen
}

function buildNote(best: Scored, ingredientCount: number): string | undefined {
  if (best.used.length === 0) {
    return 'Girdiğin malzemelerle eşleşen bir tarif bulamadık. Bunun yerine bu öğünün en kolay tariflerini listeledik — eksik malzemeleri görebilirsin.'
  }
  if (ingredientCount < 2) {
    return 'Tek malzemeyle sınırlı kaldık. Birkaç malzeme daha eklersen çok daha isabetli öneriler çıkar.'
  }
  if (best.missing.length === 0) {
    return 'Bu tarif için gereken her şey sende var, hemen başlayabilirsin.'
  }
  if (best.missing.length === 1) {
    return `Neredeyse tamam: sadece ${best.missing[0]} eksik.`
  }
  return undefined
}

/** Uygulamadaki toplam tarif sayısı (Ayarlar ekranında gösteriliyor). */
export const RECIPE_COUNT = 5000

/**
 * Tarif adına göre arama yapar.
 *
 * Türkçe duyarlı: büyük/küçük harf ve Türkçe karakterler önemsiz ("kofte"
 * yazınca "Köfte" bulunur). Birden çok kelime yazılırsa hepsinin geçmesi
 * gerekir ("tavuk sote" → içinde ikisi de olanlar).
 *
 * @param query Aranan metin
 * @param limit En fazla kaç sonuç dönsün
 */
export async function searchRecipes(query: string, limit = 40): Promise<Recipe[]> {
  const terms = tokenize(query)
  if (terms.length === 0) return []

  const byMeal = await loadRecipes()
  const hits: Array<{ raw: RawRecipe; rank: number }> = []

  for (const list of byMeal.values()) {
    for (const { raw } of list) {
      const words = tokenize(raw.t)

      // Her arama kelimesi, başlıktaki bir kelimenin başına uymalı.
      const allMatch = terms.every((t) => words.some((w) => w.startsWith(t)))
      if (!allMatch) continue

      // Türkçede asıl isim sonda: "Baklava Kek" bir kektir, "Gül Baklava"
      // baklavadır. "baklava" arayan ikincisini görmek ister. Bu yüzden
      // aramanın son kelimesi başlığın son kelimesine uyuyorsa en öne alıyoruz.
      const lastTerm = terms[terms.length - 1]
      const lastWord = words[words.length - 1]
      let rank = 2
      if (lastWord.startsWith(lastTerm)) rank = 0
      else if (words[0].startsWith(terms[0])) rank = 1

      hits.push({ raw, rank })
      if (hits.length > limit * 6) break
    }
  }

  hits.sort((a, b) => a.rank - b.rank || a.raw.t.length - b.raw.t.length)
  return hits.slice(0, limit).map((h) => toPlainRecipe(h.raw))
}

/**
 * Verilen öğün ve malzemelere göre yemek önerisi üretir.
 *
 * @param meal Seçilen öğün
 * @param ingredients Kullanıcının elindeki malzemeler
 * @returns En uygun tarif + alternatifler
 */
export async function generateRecipeSuggestion(
  meal: MealId,
  ingredients: string[],
): Promise<RecipeSuggestion> {
  const cleaned = ingredients.map((i) => i.trim()).filter(Boolean)
  const byMeal = await loadRecipes()
  const pool = byMeal.get(meal) ?? []

  if (pool.length === 0) {
    throw new Error(`"${meal}" öğünü için tarif bulunamadı`)
  }

  const ranked = pool.map((r) => score(r, cleaned)).sort(compare)
  const chosen = pickVaried(ranked)

  return {
    main: toRecipe(chosen[0]),
    alternatives: chosen.slice(1).map(toRecipe),
    note: buildNote(chosen[0], cleaned.length),
  }
}
