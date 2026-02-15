import { GoogleGenerativeAI } from '@google/generative-ai'

// ─── Image resize (max 1024×1024, JPEG 85%) ──────────────────────────────────
export const resizeImage = (file, maxSize = 1024) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width >= height) {
          height = Math.round((height * maxSize) / width)
          width  = maxSize
        } else {
          width  = Math.round((width * maxSize) / height)
          height = maxSize
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))), 'image/jpeg', 0.85)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Не удалось загрузить изображение')) }
    img.src = url
  })

const toBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1])
    reader.onerror   = reject
    reader.readAsDataURL(blob)
  })

// ─── System prompt ────────────────────────────────────────────────────────────
const PROMPT = `You are a professional nutritionist AI.
Analyze the food in this image carefully.

Rules:
1. Determine if the image contains food.
2. If yes, identify all visible dishes/ingredients and estimate total nutritional values.
3. Return ONLY valid JSON — no markdown, no code fences.

Required JSON schema:
{
  "is_food": boolean,
  "name": string,
  "description": string,
  "calories": number,
  "protein": number,
  "fat": number,
  "carbs": number,
  "weight_g": number,
  "ingredients": [{ "name": string, "calories": number }]
}

If is_food is false, set all numeric fields to 0 and arrays to [].
Use Russian language for name, description and ingredient names.
Base estimates on a typical serving of the identified food.`

// ─── Main export ──────────────────────────────────────────────────────────────
export const analyzeFood = async (apiKey, imageFile) => {
  if (!apiKey?.trim()) {
    throw new Error('API ключ не установлен. Перейдите в Профиль → Настройки и добавьте Gemini API Key.')
  }

  // Resize first to reduce payload
  const blob   = await resizeImage(imageFile)
  const base64 = await toBase64(blob)

  let model
  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim())
    model = genAI.getGenerativeModel({
      model:            'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    })
  } catch {
    throw new Error('Неверный формат API ключа.')
  }

  let raw
  try {
    const result = await model.generateContent([
      PROMPT,
      { inlineData: { data: base64, mimeType: 'image/jpeg' } },
    ])
    raw = result.response.text()
  } catch (err) {
    const msg = err.message ?? ''
    if (msg.includes('API_KEY_INVALID') || msg.includes('403') || msg.includes('401')) {
      throw new Error('Неверный API ключ. Проверьте ключ в настройках.')
    }
    if (msg.includes('SAFETY') || msg.includes('safety')) {
      throw new Error('Изображение заблокировано фильтром безопасности. Попробуйте другое фото.')
    }
    throw new Error(`Ошибка Gemini API: ${msg}`)
  }

  try {
    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const data    = JSON.parse(cleaned)

    // Validate shape
    const required = ['is_food', 'name', 'calories', 'protein', 'fat', 'carbs']
    for (const key of required) {
      if (!(key in data)) throw new Error(`Отсутствует поле: ${key}`)
    }

    // Coerce numbers
    return {
      is_food:     Boolean(data.is_food),
      name:        String(data.name || ''),
      description: String(data.description || ''),
      calories:    Math.round(Number(data.calories) || 0),
      protein:     Math.round(Number(data.protein)  || 0),
      fat:         Math.round(Number(data.fat)       || 0),
      carbs:       Math.round(Number(data.carbs)     || 0),
      weight_g:    Math.round(Number(data.weight_g)  || 0),
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    }
  } catch (err) {
    throw new Error(`Ошибка разбора ответа AI: ${err.message}`)
  }
}
