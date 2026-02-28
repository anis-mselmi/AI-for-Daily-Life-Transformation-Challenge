import type { Recipe } from '../types/recipe';
import { getHuggingFaceResponse } from './huggingface';

const extractJSON = (text: string): string => {
  
  // Try markdown blocks first
  const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (mdMatch && mdMatch[1]) {
    return mdMatch[1].trim();
  }

  // Find boundaries of the first structure found
  const firstBracket = text.search(/[\[\{]/);
  if (firstBracket === -1) throw new Error("No JSON structure found");
  
  const char = text[firstBracket];
  const closingChar = char === '[' ? ']' : '}';
  let stack = 0;
  let lastBracket = -1;
  let inString = false;
  let escaped = false;

  for (let i = firstBracket; i < text.length; i++) {
    const c = text[i];
    
    if (c === '"' && !escaped) {
      inString = !inString;
    }
    
    if (!inString) {
      if (c === char) stack++;
      else if (c === closingChar) {
        stack--;
        if (stack === 0) {
          lastBracket = i;
          break;
        }
      }
    }
    
    escaped = (c === '\\' && !escaped);
  }

  if (lastBracket === -1) {
    lastBracket = text.lastIndexOf(closingChar);
  }

  if (lastBracket <= firstBracket) {
    throw new Error("Invalid structure: Closing bracket not found or appears before opening bracket. The response might be truncated.");
  }

  const json = text.substring(firstBracket, lastBracket + 1);
  const cleaned = json
    .trim()
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/,\s*[\]\}]/g, (m) => m.replace(',', ''));
    
  return cleaned;
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
  Output: Return ONLY a valid JSON array. Ensure all text values use valid JSON escaping for quotes (\" and \n).
  DO NOT include any introductory text, markdown formatting (like \`\`\`json), or notes.
  Example structure:
  [{"id": "recipe1", "title": "Pasta with \"Special\" Sauce", "description": "Quick & tasty"}]`;

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
  
  const prompt = `Task: Given the recipe idea "${recipe.title}" (${recipe.description}), generate full ingredients and step-by-step instructions.
  Language: ${langText}.
  Output: Return ONLY a valid JSON object. Use double quote escaping if needed.
  Format: {"ingredients": ["500g chicken breasts", "..."], "instructions": ["Dice the chicken", "..."], "timerMinutes": [0, 5, 0]}`;

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
  Output: Return ONLY a valid JSON array. Each object MUST have keys: "day", "title", "desc", "mealType", "prep", "serv", "diff", "cuis", "isFull": false.
  Total ${days * 3} recipes. Example: [{"day": "Day 1", "title": "Recipe", "desc": "Summary", ...}]`;

  try {
    const rawResponse = await getHuggingFaceResponse(prompt);
    const jsonStr = extractJSON(rawResponse);
    const recipes = JSON.parse(jsonStr);
    
    // Map shortened keys back to Recipe type if needed, or ensure Recipe type matches
    return recipes.map((r: any, i: number) => ({
      ...r,
      description: r.desc || r.description,
      prepTime: r.prep || r.prepTime,
      servings: r.serv || r.servings,
      difficulty: r.diff || r.difficulty,
      cuisine: r.cuis || r.cuisine,
      id: `plan_${Date.now()}_${i}`
    }));
  } catch (error) {
    console.error("Meal Plan Error:", error);
    throw new Error("Failed to generate meal plan");
  }
};
