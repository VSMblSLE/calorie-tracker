import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Mock data for demo mode ──────────────────────────────────────────────────
const now = Date.now()
const day = 86_400_000

const MOCK_MEALS = [
  { id: 'm1', userId: 'demo', name: 'Овсянка с бананом и мёдом',        calories: 320, protein: 10, fat: 5,  carbs: 60, weight_g: 250, timestamp: now - day * 0 - 7_200_000 },
  { id: 'm2', userId: 'demo', name: 'Куриная грудка с рисом',            calories: 480, protein: 45, fat: 8,  carbs: 52, weight_g: 350, timestamp: now - day * 0 - 3_600_000 },
  { id: 'm3', userId: 'demo', name: 'Греческий йогурт с ягодами',        calories: 150, protein: 15, fat: 3,  carbs: 18, weight_g: 200, timestamp: now - day * 0 - 1_800_000 },
  { id: 'm4', userId: 'demo', name: 'Борщ со сметаной',                  calories: 290, protein: 12, fat: 10, carbs: 35, weight_g: 400, timestamp: now - day * 1 - 3_600_000 },
  { id: 'm5', userId: 'demo', name: 'Гречка с котлетой',                 calories: 520, protein: 38, fat: 15, carbs: 55, weight_g: 350, timestamp: now - day * 1 - 7_200_000 },
  { id: 'm6', userId: 'demo', name: 'Салат Цезарь с курицей',            calories: 380, protein: 28, fat: 22, carbs: 18, weight_g: 300, timestamp: now - day * 2 - 3_600_000 },
  { id: 'm7', userId: 'demo', name: 'Пицца Маргарита (2 кусочка)',       calories: 540, protein: 20, fat: 18, carbs: 72, weight_g: 280, timestamp: now - day * 3 - 5_400_000 },
  { id: 'm8', userId: 'demo', name: 'Творог 5% с ягодами',              calories: 180, protein: 22, fat: 5,  carbs: 14, weight_g: 200, timestamp: now - day * 4 - 3_600_000 },
  { id: 'm9', userId: 'demo', name: 'Лосось на гриле с овощами',         calories: 420, protein: 42, fat: 20, carbs: 12, weight_g: 300, timestamp: now - day * 5 - 3_600_000 },
  { id:'m10', userId: 'demo', name: 'Суп-пюре из тыквы',                 calories: 160, protein:  5, fat:  6, carbs: 22, weight_g: 350, timestamp: now - day * 6 - 5_400_000 },
]

const MOCK_WATER = [
  { id: 'w1', userId: 'demo', amount: 250, timestamp: now - 7_200_000 },
  { id: 'w2', userId: 'demo', amount: 300, timestamp: now - 5_400_000 },
  { id: 'w3', userId: 'demo', amount: 200, timestamp: now - 3_600_000 },
  { id: 'w4', userId: 'demo', amount: 250, timestamp: now - 1_800_000 },
  { id: 'w5', userId: 'demo', amount: 350, timestamp: now - day * 1 - 3_600_000 },
  { id: 'w6', userId: 'demo', amount: 250, timestamp: now - day * 1 - 7_200_000 },
  { id: 'w7', userId: 'demo', amount: 300, timestamp: now - day * 2 - 5_400_000 },
]

// ─── Popular food database (local) ─────────────────────────────────────────────
export const FOOD_DATABASE = [
  { name: 'Овсянка на воде',           calories: 88,  protein: 3,  fat: 1.5, carbs: 15, weight_g: 100 },
  { name: 'Овсянка на молоке',         calories: 102, protein: 3.2,fat: 3.2, carbs: 14, weight_g: 100 },
  { name: 'Гречка отварная',           calories: 110, protein: 4.5,fat: 2.3, carbs: 21, weight_g: 100 },
  { name: 'Рис отварной',              calories: 116, protein: 2.2,fat: 0.5, carbs: 25, weight_g: 100 },
  { name: 'Макароны отварные',          calories: 112, protein: 3.5,fat: 0.4, carbs: 23, weight_g: 100 },
  { name: 'Куриная грудка',            calories: 113, protein: 23.6,fat:1.9, carbs: 0.4,weight_g: 100 },
  { name: 'Куриное бедро',             calories: 185, protein: 18, fat: 12, carbs: 0,   weight_g: 100 },
  { name: 'Говядина тушёная',          calories: 232, protein: 25, fat: 15, carbs: 0,   weight_g: 100 },
  { name: 'Свинина отбивная',          calories: 264, protein: 19, fat: 21, carbs: 0,   weight_g: 100 },
  { name: 'Лосось запечённый',         calories: 208, protein: 20, fat: 13, carbs: 0,   weight_g: 100 },
  { name: 'Треска отварная',           calories: 78,  protein: 17, fat: 0.7, carbs: 0,  weight_g: 100 },
  { name: 'Яйцо варёное',             calories: 155, protein: 13, fat: 11, carbs: 1.1, weight_g: 100 },
  { name: 'Яичница (2 яйца)',         calories: 240, protein: 16, fat: 19, carbs: 1,   weight_g: 120 },
  { name: 'Творог 5%',                 calories: 121, protein: 17, fat: 5,  carbs: 1.8, weight_g: 100 },
  { name: 'Творог 9%',                 calories: 159, protein: 16, fat: 9,  carbs: 2,   weight_g: 100 },
  { name: 'Йогурт натуральный',        calories: 60,  protein: 4,  fat: 1.5, carbs: 7,  weight_g: 100 },
  { name: 'Кефир 2.5%',               calories: 53,  protein: 2.9,fat: 2.5, carbs: 4,  weight_g: 100 },
  { name: 'Молоко 2.5%',              calories: 54,  protein: 2.8,fat: 2.5, carbs: 4.7,weight_g: 100 },
  { name: 'Сыр твёрдый',              calories: 356, protein: 25, fat: 28, carbs: 0,   weight_g: 100 },
  { name: 'Банан',                      calories: 96,  protein: 1.5,fat: 0.5, carbs: 21, weight_g: 100 },
  { name: 'Яблоко',                    calories: 47,  protein: 0.4,fat: 0.4, carbs: 10, weight_g: 100 },
  { name: 'Апельсин',                  calories: 43,  protein: 0.9,fat: 0.2, carbs: 8.1,weight_g: 100 },
  { name: 'Огурец',                    calories: 14,  protein: 0.8,fat: 0.1, carbs: 2.5,weight_g: 100 },
  { name: 'Помидор',                   calories: 20,  protein: 0.6,fat: 0.2, carbs: 4.2,weight_g: 100 },
  { name: 'Картофель отварной',         calories: 82,  protein: 2,  fat: 0.4, carbs: 17, weight_g: 100 },
  { name: 'Хлеб белый',               calories: 265, protein: 9,  fat: 3.2, carbs: 49, weight_g: 100 },
  { name: 'Хлеб чёрный',              calories: 174, protein: 6.6,fat: 1.2, carbs: 33, weight_g: 100 },
  { name: 'Борщ со сметаной',          calories: 72,  protein: 3.5,fat: 2.5, carbs: 8.5,weight_g: 100 },
  { name: 'Щи свежие',                calories: 31,  protein: 1.3,fat: 1.8, carbs: 2.1,weight_g: 100 },
  { name: 'Суп куриный',              calories: 44,  protein: 3.1,fat: 1.3, carbs: 5,  weight_g: 100 },
  { name: 'Пельмени',                  calories: 275, protein: 12, fat: 14, carbs: 25, weight_g: 100 },
  { name: 'Котлета куриная',           calories: 190, protein: 18, fat: 10, carbs: 8,  weight_g: 100 },
  { name: 'Салат Цезарь',              calories: 127, protein: 9.3,fat: 7.4, carbs: 6,  weight_g: 100 },
  { name: 'Плов с курицей',            calories: 150, protein: 9,  fat: 5.8, carbs: 17, weight_g: 100 },
  { name: 'Пицца Маргарита',           calories: 250, protein: 11, fat: 9,  carbs: 32, weight_g: 100 },
  { name: 'Шоколад молочный',          calories: 550, protein: 7.6,fat: 35, carbs: 54, weight_g: 100 },
  { name: 'Мёд',                       calories: 329, protein: 0.8,fat: 0,  carbs: 81, weight_g: 100 },
  { name: 'Орехи грецкие',             calories: 654, protein: 15, fat: 65, carbs: 7,  weight_g: 100 },
  { name: 'Миндаль',                   calories: 575, protein: 21, fat: 49, carbs: 10, weight_g: 100 },
  { name: 'Протеиновый коктейль',       calories: 120, protein: 25, fat: 1.5, carbs: 4,  weight_g: 300 },
  { name: 'Кофе с молоком',            calories: 58,  protein: 1.8,fat: 1.8, carbs: 8,  weight_g: 250 },
  { name: 'Чай с сахаром',             calories: 33,  protein: 0.1,fat: 0,  carbs: 8,  weight_g: 250 },
  { name: 'Сок апельсиновый',          calories: 45,  protein: 0.7,fat: 0.2, carbs: 10, weight_g: 100 },
]

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Onboarding ──────────────────────────────────────────────────────────
      onboardingDone: false,
      setOnboardingDone: () => set({ onboardingDone: true }),

      // ── Auth ──────────────────────────────────────────────────────────────
      users:       [],
      currentUser: null,

      register: ({ name, email, password }) => {
        const users = get().users
        if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('Пользователь с таким email уже существует')
        }
        const newUser = {
          id: `u_${Date.now()}`,
          name:      name.trim(),
          email:     email.trim().toLowerCase(),
          password,
          weight:    70,
          height:    170,
          age:       25,
          waterGoal: 2000,
          createdAt: Date.now(),
        }
        const goals = { calories: 2000, protein: 150, fat: 65, carbs: 250 }
        set((s) => ({ users: [...s.users, newUser], currentUser: { ...newUser, goals } }))
      },

      login: ({ email, password }) => {
        const user = get().users.find(
          (u) => u.email === email.trim().toLowerCase() && u.password === password
        )
        if (!user) throw new Error('Неверный email или пароль')
        const goals = user.goals ?? { calories: 2000, protein: 150, fat: 65, carbs: 250 }
        set({ currentUser: { ...user, goals } })
      },

      logout: () => set({ currentUser: null }),

      updateProfile: (updates) =>
        set((s) => {
          const updated = { ...s.currentUser, ...updates }
          const users = s.users.map((u) => (u.id === updated.id ? { ...u, ...updates } : u))
          return { currentUser: updated, users }
        }),

      // ── Meals ─────────────────────────────────────────────────────────────
      meals: [],

      addMeal: (meal) => {
        const user = get().currentUser
        if (!user) throw new Error('Не авторизован')
        const entry = {
          ...meal,
          id:        `meal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          userId:    user.id,
          timestamp: Date.now(),
        }
        set((s) => ({ meals: [...s.meals, entry] }))
        return entry
      },

      deleteMeal: (id) =>
        set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),

      // ── Water ─────────────────────────────────────────────────────────────
      waterLog: [],

      addWater: (amount) => {
        const user = get().currentUser
        if (!user) return
        const entry = {
          id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          userId: user.id,
          amount,
          timestamp: Date.now(),
        }
        set((s) => ({ waterLog: [...s.waterLog, entry] }))
        return entry
      },

      deleteWater: (id) =>
        set((s) => ({ waterLog: s.waterLog.filter((w) => w.id !== id) })),

      // ── API Key ───────────────────────────────────────────────────────────
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),

      // ── Demo Mode ─────────────────────────────────────────────────────────
      loadMockData: () => {
        const user = get().currentUser
        if (!user) return
        const taggedMeals = MOCK_MEALS.map((m) => ({ ...m, userId: user.id }))
        const taggedWater = MOCK_WATER.map((w) => ({ ...w, userId: user.id }))
        set((s) => ({
          meals:    [...s.meals.filter((m) => m.userId !== user.id), ...taggedMeals],
          waterLog: [...s.waterLog.filter((w) => w.userId !== user.id), ...taggedWater],
        }))
      },

      clearUserMeals: () => {
        const user = get().currentUser
        if (!user) return
        set((s) => ({
          meals:    s.meals.filter((m) => m.userId !== user.id),
          waterLog: s.waterLog.filter((w) => w.userId !== user.id),
        }))
      },

      // ── Export / Import ───────────────────────────────────────────────────
      exportData: () => {
        const s = get()
        const user = s.currentUser
        if (!user) return null
        return {
          version: 2,
          exportedAt: new Date().toISOString(),
          user: { name: user.name, weight: user.weight, height: user.height, age: user.age, waterGoal: user.waterGoal, goals: user.goals },
          meals: s.meals.filter((m) => m.userId === user.id),
          waterLog: s.waterLog.filter((w) => w.userId === user.id),
        }
      },

      importData: (data) => {
        const user = get().currentUser
        if (!user || !data) throw new Error('Невалидные данные')
        const taggedMeals = (data.meals || []).map((m) => ({ ...m, userId: user.id }))
        const taggedWater = (data.waterLog || []).map((w) => ({ ...w, userId: user.id }))
        set((s) => ({
          meals:    [...s.meals.filter((m) => m.userId !== user.id), ...taggedMeals],
          waterLog: [...s.waterLog.filter((w) => w.userId !== user.id), ...taggedWater],
        }))
        if (data.user) {
          get().updateProfile({
            goals: data.user.goals,
            weight: data.user.weight,
            height: data.user.height,
            age: data.user.age,
            waterGoal: data.user.waterGoal,
          })
        }
      },
    }),
    {
      name: 'calorie-ai-v3',
      partialize: (s) => ({
        users:          s.users,
        currentUser:    s.currentUser,
        meals:          s.meals,
        waterLog:       s.waterLog,
        apiKey:         s.apiKey,
        onboardingDone: s.onboardingDone,
      }),
    }
  )
)
