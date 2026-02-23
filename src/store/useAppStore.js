import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, dbMealToApp, appMealToDb, dbWaterToApp, dbProfileToUser } from '../services/supabase'

// ─── Mock data for demo mode ──────────────────────────────────────────────────
const now = Date.now()
const day = 86_400_000

const MOCK_MEALS = [
  { name: 'Овсянка с бананом и мёдом',        calories: 320, protein: 10, fat: 5,  carbs: 60, weight_g: 250, timestamp: now - day * 0 - 7_200_000 },
  { name: 'Куриная грудка с рисом',            calories: 480, protein: 45, fat: 8,  carbs: 52, weight_g: 350, timestamp: now - day * 0 - 3_600_000 },
  { name: 'Греческий йогурт с ягодами',        calories: 150, protein: 15, fat: 3,  carbs: 18, weight_g: 200, timestamp: now - day * 0 - 1_800_000 },
  { name: 'Борщ со сметаной',                  calories: 290, protein: 12, fat: 10, carbs: 35, weight_g: 400, timestamp: now - day * 1 - 3_600_000 },
  { name: 'Гречка с котлетой',                 calories: 520, protein: 38, fat: 15, carbs: 55, weight_g: 350, timestamp: now - day * 1 - 7_200_000 },
  { name: 'Салат Цезарь с курицей',            calories: 380, protein: 28, fat: 22, carbs: 18, weight_g: 300, timestamp: now - day * 2 - 3_600_000 },
  { name: 'Пицца Маргарита (2 кусочка)',       calories: 540, protein: 20, fat: 18, carbs: 72, weight_g: 280, timestamp: now - day * 3 - 5_400_000 },
  { name: 'Творог 5% с ягодами',              calories: 180, protein: 22, fat: 5,  carbs: 14, weight_g: 200, timestamp: now - day * 4 - 3_600_000 },
  { name: 'Лосось на гриле с овощами',         calories: 420, protein: 42, fat: 20, carbs: 12, weight_g: 300, timestamp: now - day * 5 - 3_600_000 },
  { name: 'Суп-пюре из тыквы',                 calories: 160, protein:  5, fat:  6, carbs: 22, weight_g: 350, timestamp: now - day * 6 - 5_400_000 },
]

const MOCK_WATER = [
  { amount: 250, timestamp: now - 7_200_000 },
  { amount: 300, timestamp: now - 5_400_000 },
  { amount: 200, timestamp: now - 3_600_000 },
  { amount: 250, timestamp: now - 1_800_000 },
  { amount: 350, timestamp: now - day * 1 - 3_600_000 },
  { amount: 250, timestamp: now - day * 1 - 7_200_000 },
  { amount: 300, timestamp: now - day * 2 - 5_400_000 },
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
      currentUser: null,
      authLoading: true,

      initAuth: () => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (session?.user) {
              await get().loadUserData(session.user)
            } else {
              set({ currentUser: null, meals: [], waterLog: [], authLoading: false })
            }
          }
        )
        return () => subscription.unsubscribe()
      },

      loadUserData: async (authUser) => {
        const uid = authUser.id
        const email = authUser.email

        const [profileRes, mealsRes, waterRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', uid).single(),
          supabase.from('meals').select('*').eq('user_id', uid).order('eaten_at', { ascending: false }),
          supabase.from('water_log').select('*').eq('user_id', uid).order('logged_at', { ascending: false }),
        ])

        let currentUser
        if (profileRes.data) {
          currentUser = dbProfileToUser(profileRes.data, email)
        } else {
          const name = authUser.user_metadata?.name ?? ''
          const defaults = {
            id: uid, name, weight: 70, height: 170, age: 25,
            water_goal: 2000, goal_calories: 2000, goal_protein: 150, goal_fat: 65, goal_carbs: 250,
          }
          await supabase.from('profiles').upsert(defaults)
          currentUser = { id: uid, email, name, weight: 70, height: 170, age: 25, waterGoal: 2000, goals: { calories: 2000, protein: 150, fat: 65, carbs: 250 } }
        }

        const meals    = (mealsRes.data    ?? []).map(dbMealToApp)
        const waterLog = (waterRes.data    ?? []).map(dbWaterToApp)

        set({ currentUser, meals, waterLog, authLoading: false })
      },

      register: async ({ name, email, password }) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() } },
        })
        if (error) throw new Error(error.message)
      },

      login: async ({ email, password }) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message)
      },

      logout: async () => {
        await supabase.auth.signOut()
      },

      updateProfile: async (updates) => {
        const user = get().currentUser
        if (!user) return

        // Optimistic update
        const prev = get().currentUser
        const merged = { ...user, ...updates }
        set({ currentUser: merged })

        const dbUpdates = {}
        if (updates.name      !== undefined) dbUpdates.name          = updates.name
        if (updates.weight    !== undefined) dbUpdates.weight        = updates.weight
        if (updates.height    !== undefined) dbUpdates.height        = updates.height
        if (updates.age       !== undefined) dbUpdates.age           = updates.age
        if (updates.waterGoal !== undefined) dbUpdates.water_goal    = updates.waterGoal
        if (updates.goals) {
          if (updates.goals.calories !== undefined) dbUpdates.goal_calories = updates.goals.calories
          if (updates.goals.protein  !== undefined) dbUpdates.goal_protein  = updates.goals.protein
          if (updates.goals.fat      !== undefined) dbUpdates.goal_fat      = updates.goals.fat
          if (updates.goals.carbs    !== undefined) dbUpdates.goal_carbs    = updates.goals.carbs
        }

        const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id)
        if (error) {
          set({ currentUser: prev })
          throw new Error(error.message)
        }
      },

      // ── Meals ─────────────────────────────────────────────────────────────
      meals: [],

      addMeal: async (meal) => {
        const user = get().currentUser
        if (!user) throw new Error('Не авторизован')

        const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const optimistic = {
          ...meal,
          id:        tempId,
          userId:    user.id,
          timestamp: meal.timestamp ?? Date.now(),
        }

        // Optimistic insert
        const prevMeals = get().meals
        set((s) => ({ meals: [optimistic, ...s.meals] }))

        const { data, error } = await supabase
          .from('meals')
          .insert(appMealToDb(optimistic, user.id))
          .select()
          .single()

        if (error) {
          set({ meals: prevMeals })
          throw new Error(error.message)
        }

        // Replace temp entry with real DB row
        set((s) => ({
          meals: s.meals.map((m) => (m.id === tempId ? dbMealToApp(data) : m)),
        }))

        return dbMealToApp(data)
      },

      deleteMeal: async (id) => {
        const prevMeals = get().meals
        set((s) => ({ meals: s.meals.filter((m) => m.id !== id) }))

        const { error } = await supabase.from('meals').delete().eq('id', id)
        if (error) {
          set({ meals: prevMeals })
          throw new Error(error.message)
        }
      },

      // ── Water ─────────────────────────────────────────────────────────────
      waterLog: [],

      addWater: async (amount) => {
        const user = get().currentUser
        if (!user) return

        const tempId = `tmp_w_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`
        const optimistic = { id: tempId, userId: user.id, amount, timestamp: Date.now() }

        const prevWater = get().waterLog
        set((s) => ({ waterLog: [optimistic, ...s.waterLog] }))

        const { data, error } = await supabase
          .from('water_log')
          .insert({ user_id: user.id, amount, logged_at: new Date().toISOString() })
          .select()
          .single()

        if (error) {
          set({ waterLog: prevWater })
          throw new Error(error.message)
        }

        set((s) => ({
          waterLog: s.waterLog.map((w) => (w.id === tempId ? dbWaterToApp(data) : w)),
        }))

        return dbWaterToApp(data)
      },

      deleteWater: async (id) => {
        const prevWater = get().waterLog
        set((s) => ({ waterLog: s.waterLog.filter((w) => w.id !== id) }))

        const { error } = await supabase.from('water_log').delete().eq('id', id)
        if (error) {
          set({ waterLog: prevWater })
          throw new Error(error.message)
        }
      },

      // ── API Key ───────────────────────────────────────────────────────────
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),

      // ── Demo Mode ─────────────────────────────────────────────────────────
      loadMockData: async () => {
        const user = get().currentUser
        if (!user) return

        const mealRows = MOCK_MEALS.map((m) => appMealToDb(m, user.id))
        const waterRows = MOCK_WATER.map((w) => ({
          user_id: user.id,
          amount: w.amount,
          logged_at: new Date(w.timestamp).toISOString(),
        }))

        const [{ error: me }, { error: we }] = await Promise.all([
          supabase.from('meals').insert(mealRows),
          supabase.from('water_log').insert(waterRows),
        ])

        if (me) throw new Error(me.message)
        if (we) throw new Error(we.message)

        await get().loadUserData({ id: user.id, email: user.email })
      },

      clearUserMeals: async () => {
        const user = get().currentUser
        if (!user) return

        set({ meals: [], waterLog: [] })

        const [{ error: me }, { error: we }] = await Promise.all([
          supabase.from('meals').delete().eq('user_id', user.id),
          supabase.from('water_log').delete().eq('user_id', user.id),
        ])

        if (me) throw new Error(me.message)
        if (we) throw new Error(we.message)
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

      importData: async (data) => {
        const user = get().currentUser
        if (!user || !data) throw new Error('Невалидные данные')

        const mealRows  = (data.meals    || []).map((m) => appMealToDb(m, user.id))
        const waterRows = (data.waterLog || []).map((w) => ({
          user_id:   user.id,
          amount:    w.amount,
          logged_at: new Date(w.timestamp).toISOString(),
        }))

        if (mealRows.length > 0) {
          const { error } = await supabase.from('meals').insert(mealRows)
          if (error) throw new Error(error.message)
        }

        if (waterRows.length > 0) {
          const { error } = await supabase.from('water_log').insert(waterRows)
          if (error) throw new Error(error.message)
        }

        if (data.user) {
          await get().updateProfile({
            goals:     data.user.goals,
            weight:    data.user.weight,
            height:    data.user.height,
            age:       data.user.age,
            waterGoal: data.user.waterGoal,
          })
        }

        await get().loadUserData({ id: user.id, email: user.email })
      },
    }),
    {
      name: 'calorie-ai-v3',
      partialize: (s) => ({
        apiKey:         s.apiKey,
        onboardingDone: s.onboardingDone,
      }),
    }
  )
)
