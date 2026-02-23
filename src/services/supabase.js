import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Field translators ────────────────────────────────────────────────────────

/** DB meals row → app meal object */
export function dbMealToApp(row) {
  return {
    id:          row.id,
    userId:      row.user_id,
    name:        row.name,
    calories:    row.calories,
    protein:     Number(row.protein),
    fat:         Number(row.fat),
    carbs:       Number(row.carbs),
    weight_g:    row.weight_g,
    description: row.description ?? '',
    timestamp:   new Date(row.eaten_at).getTime(),
  }
}

/** App meal object → DB insert payload */
export function appMealToDb(meal, userId) {
  return {
    user_id:     userId,
    name:        meal.name,
    calories:    meal.calories,
    protein:     meal.protein,
    fat:         meal.fat,
    carbs:       meal.carbs,
    weight_g:    meal.weight_g ?? 0,
    description: meal.description ?? '',
    eaten_at:    meal.timestamp ? new Date(meal.timestamp).toISOString() : new Date().toISOString(),
  }
}

/** DB water_log row → app water entry */
export function dbWaterToApp(row) {
  return {
    id:        row.id,
    userId:    row.user_id,
    amount:    row.amount,
    timestamp: new Date(row.logged_at).getTime(),
  }
}

/** DB profiles row → currentUser shape */
export function dbProfileToUser(row, email) {
  return {
    id:        row.id,
    email:     email ?? '',
    name:      row.name ?? '',
    weight:    Number(row.weight),
    height:    Number(row.height),
    age:       row.age,
    waterGoal: row.water_goal,
    goals: {
      calories: row.goal_calories,
      protein:  row.goal_protein,
      fat:      row.goal_fat,
      carbs:    row.goal_carbs,
    },
  }
}
