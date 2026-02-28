import type { Recipe } from '../types/recipe';
import { getHuggingFaceResponse } from './huggingface';

const extractJSON = (text: string): string => {
  // Regex to find content inside [ ] or { } even if markdown is present
  const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!match) throw new Error("No JSON found");
  let json = match[0];
  // Sanitize literal control characters that break JSON.parse (line breaks, etc are okay inside strings if escaped, 
  // but literal ones are often returned by LLMs)
  return json.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
};

export const generateRecipeList = async (
  ingredients: string, 
  lang: 'EN' | 'FR' = 'EN',
  prefs?: { budget: string; familySize: string; cuisine: string, dishType: string }
): Promise<Recipe[]> => {
  const langText = lang === 'FR' ? 'French (Français)' : 'English';
  
  const prompt = `Task: Propose 6 recipe ideas using these ingredients: ${ingredients}. 
  Context: Budget: ${prefs?.budget}, Family: ${prefs?.familySize}, Cuisine: ${prefs?.cuisine}, Dish Type: ${prefs?.dishType}.
  Language: ${langText}.
  Output: Return ONLY a valid JSON array. DO NOT include any introductory text, markdown formatting (like \`\`\`json), or concluding notes.
  Each object MUST follow this schema exactly:
  [{ 
    "id": "unique_id_string",
    "title": "Recipe Name", 
    "description": "Short catchy summary", 
    "mealType": "Entrée or Main or Dessert",
    "prepTime": "XX mins", 
    "servings": "${prefs?.familySize}", 
    "difficulty": "Easy/Moderate/Hard",
    "cuisine": "${prefs?.cuisine}",
    "isFull": false
  }]`;

  try {
    const rawResponse = await getHuggingFaceResponse(prompt);
    const jsonStr = extractJSON(rawResponse);
    const recipes = JSON.parse(jsonStr) as Recipe[];
    
    return recipes.map((r, i) => ({
      ...r,
      id: `recipe_${Date.now()}_${i}`
    }));
  } catch (error) {
    console.error("Recipe List Error:", error);
    throw new Error("Failed to generate recipe ideas");
  }
};

export const generateRecipeDetails = async (
  recipe: Recipe,
  lang: 'EN' | 'FR' = 'EN'
): Promise<Recipe> => {
  const langText = lang === 'FR' ? 'French (Français)' : 'English';
  
  const prompt = `Task: Provided the recipe idea "${recipe.title}" (${recipe.description}), generate the full ingredients and step-by-step instructions.
  Language: ${langText}.
  Output: Return ONLY a valid JSON object. DO NOT include any markdown code blocks or text.
  Schema:
  {
    "ingredients": ["Detail quantity e.g. 500g chicken breasts", "..."], 
    "instructions": ["Short step description", "..."], 
    "timerMinutes": [0, 5, 0] 
  }`;

  try {
    const rawResponse = await getHuggingFaceResponse(prompt);
    const jsonStr = extractJSON(rawResponse);
    const details = JSON.parse(jsonStr);
    
    return { 
      ...recipe, 
      ingredients: Array.isArray(details.ingredients) ? details.ingredients : [],
      instructions: Array.isArray(details.instructions) ? details.instructions : [],
      timerMinutes: Array.isArray(details.timerMinutes) ? details.timerMinutes : [0, 5, 0],
      isFull: true 
    };
  } catch (error) {
    console.error("Recipe Details Error:", error);
    return { 
      ...recipe, 
      ingredients: ["Error generating details. Please try again."], 
      instructions: ["The AI had a hiccup. Click 'View More' again to retry."],
      isFull: true 
    };
  }
};

export const generateMealPlan = async (
  days: 3 | 7,
  ingredients: string,
  lang: 'EN' | 'FR' = 'EN',
  prefs?: { budget: string; familySize: string; cuisine: string }
): Promise<Recipe[]> => {
  const langText = lang === 'FR' ? 'French (Français)' : 'English';
  const durationText = days === 3 ? '3 days' : 'full week (7 days)';

  const prompt = `Task: Create a meal plan for ${durationText} using these ingredients: ${ingredients}.
  Context: Budget: ${prefs?.budget}, Family: ${prefs?.familySize}, Cuisine: ${prefs?.cuisine}.
  Language: ${langText}.
  Output: Return ONLY a valid JSON array of recipe objects.
  Each object MUST follow this schema exactly:
  [{ 
    "day": "Day 1",
    "title": "Recipe Name", 
    "description": "Short summary", 
    "mealType": "Breakfast/Lunch/Dinner",
    "prepTime": "XX mins", 
    "servings": "${prefs?.familySize}", 
    "difficulty": "Easy/Moderate/Hard",
    "cuisine": "${prefs?.cuisine}",
    "isFull": false
  }]
  Provide 3 recipes (Breakfast, Lunch, Dinner) for each of the ${days} days. Total ${days * 3} recipes.`;

  try {
    const rawResponse = await getHuggingFaceResponse(prompt);
    const jsonStr = extractJSON(rawResponse);
    const recipes = JSON.parse(jsonStr);
    
    return recipes.map((r: any, i: number) => ({
      ...r,
      id: `plan_${Date.now()}_${i}`
    }));
  } catch (error) {
    console.error("Meal Plan Error:", error);
    throw new Error("Failed to generate meal plan");
  }
};
