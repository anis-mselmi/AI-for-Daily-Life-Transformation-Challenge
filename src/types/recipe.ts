export interface MealPlanEntry {
  day: string;
  recipeId: string;
  title: string;
  mealType: string;
}

export interface MealPlan {
  id: string;
  userId: string;
  startDate: string;
  durationDays: 3 | 7;
  entries: MealPlanEntry[];
}

export interface Chat {
  id: string;
  title: string;
  created_at?: string;
}

export interface Recipe {
  id: string;
  chat_id?: string;
  title: string;
  description: string;
  mealType: string;
  prepTime: string;
  servings: string;
  difficulty: string;
  cuisine: string;
  ingredients?: string[];
  instructions?: string[];
  timerMinutes?: number[];
  imageUrl?: string;
  isFull?: boolean;
  day?: string;
  created_at?: string;
}
