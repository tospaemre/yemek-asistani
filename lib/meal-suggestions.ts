import type { MealId } from './types'

/**
 * "Hızlı ekle" düğmelerinde gösterilen malzemeler.
 *
 * Öğüne göre değişir — tatlı seçiliyken domates ya da tavuk önermek anlamsız.
 * Listeler uydurma değil: `public/recipes.json` içindeki 5.000 tarifin malzeme
 * sıklıkları öğün bazında sayılarak çıkarıldı, sonra "ılık su", "instant maya"
 * gibi düğmeye yakışmayanlar ayıklandı.
 */
export const MEAL_SUGGESTIONS: Record<MealId, string[]> = {
  kahvalti: ['Yumurta', 'Peynir', 'Süt', 'Domates', 'Tereyağı', 'Soğan', 'Yoğurt', 'Patates'],
  ogle: ['Soğan', 'Domates', 'Sarımsak', 'Patates', 'Salça', 'Pirinç', 'Kıyma', 'Havuç'],
  aksam: ['Soğan', 'Domates', 'Tavuk', 'Kıyma', 'Patates', 'Sarımsak', 'Yeşil biber', 'Patlıcan'],
  ara: ['Patates', 'Yumurta', 'Peynir', 'Domates', 'Yoğurt', 'Un', 'Havuç', 'Maydanoz'],
  tatli: ['Süt', 'Un', 'Yumurta', 'Şeker', 'Tereyağı', 'Kakao', 'Nişasta', 'Muz'],
}
