import type { MealId, Recipe, RecipeSuggestion } from './types'

/**
 * AI servis katmanı.
 *
 * Bu dosya, yemek önerisi üreten mantığı uygulamadan soyutlar. Şu an mock
 * (sahte) veri üretiyor, ancak `generateRecipeSuggestion` fonksiyonunun imzası
 * gerçek bir API'ye (örn. bir /api/suggest route handler'ı üzerinden OpenAI,
 * Vercel AI Gateway vb.) bağlanacak şekilde tasarlandı.
 *
 * ÖNEMLİ: API anahtarları burada YER ALMAZ. Gerçek entegrasyonda istek bir
 * sunucu tarafı route handler'a gönderilmeli ve anahtar ortam değişkeninde
 * (server-side env) tutulmalıdır.
 */

const STAPLES = ['Tuz', 'Karabiber', 'Zeytinyağı']

interface Template {
  emoji: string
  title: (main: string) => string
  summary: string
  difficulty: Recipe['difficulty']
  prepTime: number
  cookTime: number
  servings: number
  extraNeeds: string[]
  steps: (ings: string[]) => string[]
}

function titleCase(s: string) {
  return s.charAt(0).toLocaleUpperCase('tr') + s.slice(1)
}

function list(ings: string[]) {
  if (ings.length === 0) return 'malzemeleri'
  if (ings.length === 1) return ings[0].toLocaleLowerCase('tr')
  const lower = ings.map((i) => i.toLocaleLowerCase('tr'))
  return `${lower.slice(0, -1).join(', ')} ve ${lower[lower.length - 1]}`
}

const TEMPLATES: Record<MealId, Template[]> = {
  kahvalti: [
    {
      emoji: '🍳',
      title: (m) => `${titleCase(m)}lı Menemen`,
      summary: 'Kahvaltının vazgeçilmezi, tavada pratik bir başlangıç.',
      difficulty: 'Kolay',
      prepTime: 5,
      cookTime: 12,
      servings: 2,
      extraNeeds: ['Tereyağı'],
      steps: (i) => [
        'Tavaya biraz yağ alıp orta ateşte ısıt.',
        `${list(i)} malzemelerini doğrayıp tavaya ekle.`,
        'Malzemeler yumuşayana kadar 5-6 dakika kavur.',
        'Çırpılmış yumurtaları ekleyip karıştırarak pişir.',
        'Tuz ve karabiber ekleyip sıcak servis et.',
      ],
    },
    {
      emoji: '🧀',
      title: (m) => `${titleCase(m)}lı Omlet`,
      summary: 'Birkaç dakikada hazır, protein dolu bir kahvaltı.',
      difficulty: 'Kolay',
      prepTime: 4,
      cookTime: 8,
      servings: 1,
      extraNeeds: ['Yumurta'],
      steps: (i) => [
        'Yumurtaları bir kâsede çırp.',
        `${titleCase(list(i))} malzemelerini küçük küçük doğra.`,
        'Yağlı tavaya doğranan malzemeleri ekleyip hafifçe kavur.',
        'Üzerine çırpılmış yumurtayı dök ve kısık ateşte pişir.',
        'İkiye katlayıp servis tabağına al.',
      ],
    },
    {
      emoji: '🥪',
      title: () => 'Fırın Tost',
      summary: 'Elindekilerle çıtır çıtır bir tost.',
      difficulty: 'Kolay',
      prepTime: 5,
      cookTime: 7,
      servings: 2,
      extraNeeds: ['Ekmek', 'Kaşar peyniri'],
      steps: (i) => [
        'Ekmekleri ortadan ikiye kes.',
        `Arasına ${list(i)} yerleştir.`,
        'Tost makinesine ya da fırına ver.',
        'Kızarana kadar bekle ve sıcak servis et.',
      ],
    },
  ],
  ogle: [
    {
      emoji: '🍲',
      title: (m) => `${titleCase(m)}lı Sote`,
      summary: 'Öğle için hafif ve doyurucu bir sote.',
      difficulty: 'Kolay',
      prepTime: 10,
      cookTime: 20,
      servings: 3,
      extraNeeds: ['Salça'],
      steps: (i) => [
        `${titleCase(list(i))} malzemelerini kuşbaşı doğra.`,
        'Tencerede yağı ısıtıp malzemeleri ekle.',
        'Bir yemek kaşığı salça ekleyip kavur.',
        'Az su ekleyip kısık ateşte 15 dakika pişir.',
        'Tuz ve baharatları ekleyip servis et.',
      ],
    },
    {
      emoji: '🍚',
      title: (m) => `${titleCase(m)}lı Pilav`,
      summary: 'Yanında turşuyla harika giden pratik bir öğün.',
      difficulty: 'Orta',
      prepTime: 10,
      cookTime: 25,
      servings: 4,
      extraNeeds: ['Pirinç', 'Tereyağı'],
      steps: (i) => [
        'Pirinci ılık suda birkaç dakika beklet ve süz.',
        `${titleCase(list(i))} malzemelerini doğrayıp tereyağında kavur.`,
        'Pirinci ekleyip birkaç dakika daha kavur.',
        'Sıcak su ekleyip kapağını kapat ve kısık ateşte pişir.',
        'Suyunu çekince 10 dakika dinlendirip servis et.',
      ],
    },
    {
      emoji: '🥗',
      title: () => 'Mevsim Salatası',
      summary: 'Elindekilerle ferah, sağlıklı bir salata.',
      difficulty: 'Kolay',
      prepTime: 12,
      cookTime: 0,
      servings: 2,
      extraNeeds: ['Limon'],
      steps: (i) => [
        `${titleCase(list(i))} malzemelerini yıkayıp doğra.`,
        'Bir kâsede hepsini birleştir.',
        'Zeytinyağı, limon, tuz ekle.',
        'Güzelce karıştırıp taze servis et.',
      ],
    },
  ],
  aksam: [
    {
      emoji: '🍗',
      title: (m) => `Fırında Sebzeli ${titleCase(m)}`,
      summary: 'Tek tepside pişen, akşam sofrasına yakışan bir tarif.',
      difficulty: 'Orta',
      prepTime: 15,
      cookTime: 40,
      servings: 4,
      extraNeeds: ['Zeytinyağı'],
      steps: (i) => [
        `${titleCase(list(i))} malzemelerini iri parçalar hâlinde doğra.`,
        'Bir kâsede zeytinyağı, tuz ve baharatlarla harmanla.',
        'Fırın tepsisine tek sıra hâlinde yerleştir.',
        'Önceden ısıtılmış 200°C fırında yaklaşık 40 dakika pişir.',
        'Üzeri kızarınca fırından al ve sıcak servis et.',
      ],
    },
    {
      emoji: '🍝',
      title: (m) => `${titleCase(m)}lı Makarna`,
      summary: 'Hızlı ve herkesin sevdiği bir akşam yemeği.',
      difficulty: 'Kolay',
      prepTime: 10,
      cookTime: 20,
      servings: 3,
      extraNeeds: ['Makarna'],
      steps: (i) => [
        'Makarnayı tuzlu suda haşlayıp süz.',
        `${titleCase(list(i))} malzemelerini doğrayıp yağda kavur.`,
        'Haşlanan makarnayı sosun içine ekle.',
        'Birkaç dakika karıştırarak pişir.',
        'Sıcakken servis et.',
      ],
    },
    {
      emoji: '🍜',
      title: (m) => `${titleCase(m)}lı Sebze Çorbası`,
      summary: 'Sıcacık, doyurucu bir çorba.',
      difficulty: 'Kolay',
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      extraNeeds: ['Tereyağı'],
      steps: (i) => [
        `${titleCase(list(i))} malzemelerini küçük küçük doğra.`,
        'Tencerede tereyağında kısaca kavur.',
        'Üzerini geçecek kadar su ekle.',
        'Malzemeler yumuşayana kadar kaynat.',
        'İsteğe göre blenderdan geçirip servis et.',
      ],
    },
  ],
  ara: [
    {
      emoji: '🥪',
      title: () => 'Pratik Sandviç',
      summary: 'İki dakikada hazır, hafif bir ara öğün.',
      difficulty: 'Kolay',
      prepTime: 5,
      cookTime: 0,
      servings: 1,
      extraNeeds: ['Ekmek'],
      steps: (i) => [
        'Ekmeği ortadan kes.',
        `Arasına ${list(i)} yerleştir.`,
        'İstersen tost makinesinde ısıt.',
        'Afiyetle ye.',
      ],
    },
    {
      emoji: '🧆',
      title: (m) => `${titleCase(m)}lı Kek`,
      summary: 'Çay saatine yakışan hafif bir atıştırmalık.',
      difficulty: 'Orta',
      prepTime: 15,
      cookTime: 35,
      servings: 6,
      extraNeeds: ['Un', 'Yumurta', 'Şeker'],
      steps: (i) => [
        'Yumurta ve şekeri çırp.',
        `${titleCase(list(i))} ve unu ekleyip karıştır.`,
        'Yağlanmış kalıba dök.',
        '175°C fırında 35 dakika pişir.',
        'Ilıyınca dilimleyip servis et.',
      ],
    },
    {
      emoji: '🥣',
      title: () => 'Meyveli Yoğurt Kâsesi',
      summary: 'Sağlıklı ve tok tutan bir ara öğün.',
      difficulty: 'Kolay',
      prepTime: 5,
      cookTime: 0,
      servings: 1,
      extraNeeds: ['Yoğurt', 'Bal'],
      steps: (i) => [
        'Kâseye yoğurdu al.',
        `Üzerine ${list(i)} ekle.`,
        'Bir tatlı kaşığı bal gezdir.',
        'Karıştırıp taze tüket.',
      ],
    },
  ],
  tatli: [
    {
      emoji: '🍰',
      title: (m) => `${titleCase(m)}lı Sufle`,
      summary: 'Akışkan kıvamıyla tatlı krizini bastıran bir lezzet.',
      difficulty: 'Orta',
      prepTime: 15,
      cookTime: 12,
      servings: 4,
      extraNeeds: ['Çikolata', 'Un', 'Yumurta', 'Şeker'],
      steps: (i) => [
        'Çikolata ve tereyağını benmari usulü erit.',
        `Yumurta, şeker ve ${list(i)} ekleyip çırp.`,
        'Un ekleyip pürüzsüz bir kıvam elde et.',
        'Yağlı kâselere doldur.',
        '200°C fırında 10-12 dakika pişir ve sıcak servis et.',
      ],
    },
    {
      emoji: '🍮',
      title: () => 'Sütlü İrmik Tatlısı',
      summary: 'Hafif ve pratik bir kaşık tatlısı.',
      difficulty: 'Kolay',
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      extraNeeds: ['Süt', 'İrmik', 'Şeker'],
      steps: (i) => [
        'İrmiği yağda hafifçe kavur.',
        'Süt ve şekeri ekleyip karıştır.',
        `Üzerine ${list(i)} ekleyip kaynat.`,
        'Koyulaşınca kâselere paylaştır.',
        'Soğuyunca servis et.',
      ],
    },
    {
      emoji: '🍪',
      title: (m) => `${titleCase(m)}lı Kurabiye`,
      summary: 'Çayın yanına birebir, kolay bir tatlı.',
      difficulty: 'Kolay',
      prepTime: 15,
      cookTime: 18,
      servings: 8,
      extraNeeds: ['Un', 'Tereyağı', 'Şeker'],
      steps: (i) => [
        'Tereyağı ve şekeri kremsi olana dek çırp.',
        `${titleCase(list(i))} ve unu ekleyip yumuşak bir hamur yoğur.`,
        'Ceviz büyüklüğünde parçalar kopar.',
        'Yağlı kâğıtlı tepsiye diz.',
        '175°C fırında 18 dakika pişir.',
      ],
    },
  ],
}

function makeRecipe(
  template: Template,
  meal: MealId,
  ingredients: string[],
  index: number,
): Recipe {
  const main = ingredients[0] ?? 'sebze'
  const staplesNeeded = STAPLES.filter(
    (s) => !ingredients.some((i) => i.toLocaleLowerCase('tr') === s.toLocaleLowerCase('tr')),
  )
  const extra = template.extraNeeds.filter(
    (s) => !ingredients.some((i) => i.toLocaleLowerCase('tr') === s.toLocaleLowerCase('tr')),
  )
  const missing = Array.from(new Set([...extra, ...staplesNeeded]))

  return {
    id: `${meal}-${index}-${Date.now()}`,
    title: template.title(main),
    emoji: template.emoji,
    meal,
    prepTime: template.prepTime,
    cookTime: template.cookTime,
    servings: template.servings,
    difficulty: template.difficulty,
    usedIngredients: ingredients.map(titleCase),
    missingIngredients: missing,
    steps: template.steps(ingredients),
    summary: template.summary,
  }
}

export interface GenerateOptions {
  signal?: AbortSignal
}

/**
 * Verilen öğün ve malzemelere göre yemek önerisi üretir.
 *
 * @param meal Seçilen öğün
 * @param ingredients Kullanıcının elindeki malzemeler
 * @returns Ana tarif + alternatifler
 */
export async function generateRecipeSuggestion(
  meal: MealId,
  ingredients: string[],
): Promise<RecipeSuggestion> {
  // Gerçek API entegrasyonu buraya gelecek. Örn:
  //   const res = await fetch('/api/suggest', {
  //     method: 'POST',
  //     body: JSON.stringify({ meal, ingredients }),
  //   })
  //   return res.json()
  await new Promise((r) => setTimeout(r, 1600))

  const cleaned = ingredients.map((i) => i.trim()).filter(Boolean)
  const templates = TEMPLATES[meal]

  const recipes = templates.map((t, idx) => makeRecipe(t, meal, cleaned, idx))

  const note =
    cleaned.length < 2
      ? 'Daha isabetli öneriler için birkaç malzeme daha eklemeni öneririz. Tarifler mevcut malzemelerine göre uyarlandı.'
      : undefined

  return {
    main: recipes[0],
    alternatives: recipes.slice(1),
    note,
  }
}
