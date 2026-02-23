// ─── Built-in API key (Groq) ──────────────────────────────────────────────────
// Получите бесплатно на https://console.groq.com
const BUILTIN_API_KEY = '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'

const GROQ_MODEL = 'llama-3.2-11b-vision-preview'
const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions'

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

const toBase64DataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)  // full data URL
    reader.onerror   = reject
    reader.readAsDataURL(blob)
  })

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a professional nutritionist AI. Analyze the food in this image carefully.

Rules:
1. Determine if the image contains food.
2. If yes, identify all visible dishes/ingredients and estimate total nutritional values.
3. Return ONLY valid JSON — no markdown, no code fences, no extra text.

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
Base estimates on a typical serving size.`

// ─── Main export ──────────────────────────────────────────────────────────────
export const analyzeFood = async (userApiKey, imageFile) => {
  // Use user's key if set, otherwise fall back to built-in
  const key = userApiKey?.trim() || BUILTIN_API_KEY

  if (!key) {
    throw new Error('API ключ не настроен. Перейдите в Профиль и добавьте Groq API Key.')
  }

  const blob       = await resizeImage(imageFile)
  const dataUrl    = await toBase64DataUrl(blob)

  const response = await fetch(GROQ_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role:    'user',
          content: [
            { type: 'text',      text:      SYSTEM_PROMPT },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature:     0.1,
      max_tokens:      1024,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const msg = err?.error?.message ?? response.statusText
    if (response.status === 401) throw new Error('Неверный API ключ Groq. Проверьте ключ в настройках.')
    if (response.status === 429) throw new Error('Превышен лимит запросов. Попробуйте позже.')
    throw new Error(`Ошибка Groq API: ${msg}`)
  }

  const json = await response.json()
  const raw  = json.choices?.[0]?.message?.content ?? ''

  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const data    = JSON.parse(cleaned)

    const required = ['is_food', 'name', 'calories', 'protein', 'fat', 'carbs']
    for (const key of required) {
      if (!(key in data)) throw new Error(`Отсутствует поле: ${key}`)
    }

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
