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

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────────────────────────
      users:       [],       // { id, name, email, password, createdAt }
      currentUser: null,     // { id, name, email, weight, height, age, goal }

      register: ({ name, email, password }) => {
        const users = get().users
        if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('Пользователь с таким email уже существует')
        }
        const newUser = {
          id: `u_${Date.now()}`,
          name:      name.trim(),
          email:     email.trim().toLowerCase(),
          password,  // stored as-is (client-only app, no real backend)
          weight:    70,
          height:    170,
          age:       25,
          createdAt: Date.now(),
        }
        const goals = {
          calories: 2000,
          protein:  150,
          fat:       65,
          carbs:    250,
        }
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
      meals: [],   // { id, userId, name, calories, protein, fat, carbs, weight_g, timestamp }

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

      // ── API Key ───────────────────────────────────────────────────────────
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),

      // ── Demo Mode ─────────────────────────────────────────────────────────
      loadMockData: () => {
        const user = get().currentUser
        if (!user) return
        const tagged = MOCK_MEALS.map((m) => ({ ...m, userId: user.id }))
        set((s) => {
          const existing = s.meals.filter((m) => m.userId === user.id)
          if (existing.length > 0) return { meals: [...s.meals.filter((m) => m.userId !== user.id), ...tagged] }
          return { meals: [...s.meals, ...tagged] }
        })
      },

      clearUserMeals: () => {
        const user = get().currentUser
        if (!user) return
        set((s) => ({ meals: s.meals.filter((m) => m.userId !== user.id) }))
      },

      // ── Selectors (reactive — call in component with useAppStore(selector)) ─
      getUserMeals: () => {
        const user = get().currentUser
        if (!user) return []
        return get().meals.filter((m) => m.userId === user.id)
      },
    }),
    {
      name: 'calorie-ai-v2',
      partialize: (s) => ({
        users:       s.users,
        currentUser: s.currentUser,
        meals:       s.meals,
        apiKey:      s.apiKey,
      }),
    }
  )
)
