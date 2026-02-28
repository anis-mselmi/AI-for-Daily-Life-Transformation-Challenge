import { useState, useEffect } from 'react';
import type { Recipe, Chat } from '../types/recipe';
import { generateRecipeList, generateRecipeDetails, generateMealPlan } from '../services/recipeApi';
import { getHuggingFaceImage } from '../services/huggingface';
import { supabase } from '../services/supabase';

export interface IngredientWithQty {
  name: string;
  qty: string;
}

export const useRecipe = (userId?: string) => {
  const [ingredients, setIngredients] = useState<IngredientWithQty[]>([]);
  const [secretIngredients, setSecretIngredients] = useState<string[]>([]);
  const [budget, setBudget] = useState('Moderate');
  const [familySize, setFamilySize] = useState('2');
  const [cuisine, setCuisine] = useState('French');
  const [dishType, setDishType] = useState('Main');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);

  // Fetch Chat History & Kitchen State on Login
  useEffect(() => {
    if (userId) {
      fetchHistory();
      fetchKitchenState();
    }
  }, [userId]);

  // Handle localStorage restoration for guests on mount
  useEffect(() => {
    const saved = localStorage.getItem('kitchen_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        applyState(state);
      } catch (e) {
        console.error("Failed to parse local kitchen state", e);
      }
    }
  }, []);

  // Persistent Kitchen Sync
  useEffect(() => {
    const state = { ingredients, secretIngredients, budget, familySize, cuisine, dishType, mealPlan };
    localStorage.setItem('kitchen_state', JSON.stringify(state));

    if (userId) {
      const timer = setTimeout(() => {
        supabase
          .from('profiles')
          .upsert({ id: userId, kitchen_state: state })
          .then(({ error }) => {
            if (error) console.error("Failed to sync kitchen state:", error);
          });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ingredients, secretIngredients, budget, familySize, cuisine, dishType, mealPlan, userId]);

  const applyState = (state: any) => {
    if (state.ingredients) setIngredients(state.ingredients);
    if (state.secretIngredients) setSecretIngredients(state.secretIngredients);
    if (state.budget) setBudget(state.budget);
    if (state.familySize) setFamilySize(state.familySize);
    if (state.cuisine) setCuisine(state.cuisine);
    if (state.dishType) setDishType(state.dishType);
    if (state.mealPlan) setMealPlan(state.mealPlan);
  };

  const fetchKitchenState = async () => {
    if (!userId) return;
    const { data } = await supabase.from('profiles').select('kitchen_state').eq('id', userId).maybeSingle();
    if (data?.kitchen_state) applyState(data.kitchen_state);
  };

  const fetchHistory = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setChatHistory(data);
  };

  const createChat = async (title: string) => {
    if (!userId) {
      const guestId = `guest_${Date.now()}`;
      setChatHistory(prev => [{ id: guestId, title, created_at: new Date().toISOString() }, ...prev]);
      setCurrentChatId(guestId);
      return guestId;
    }
    const { data } = await supabase.from('chats').insert({ user_id: userId, title }).select().single();
    if (data) {
      setChatHistory(prev => [data, ...prev]);
      setCurrentChatId(data.id);
      return data.id;
    }
    return null;
  };

  const fetchChatRecipes = async (chatId: string) => {
    setLoading(true);
    setCurrentChatId(chatId);
    setMealPlan(null); // Clear active plan view if switching
    
    if (!userId) {
      setLoading(false);
      return; 
    }

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('chat_id', chatId)
        .order('day', { ascending: true })
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      if (data) {
        setRecipes(data.map((r: any) => ({
          ...r,
          mealType: r.meal_type,
          imageUrl: r.image_url,
          prepTime: r.prep_time,
          timerMinutes: r.timer_minutes,
          isFull: r.is_full
        })));
      }
    } catch (e) {
      console.error("Fetch Chat Recipes Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveRecipeToDb = async (recipe: Recipe, chatId: string) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase.from('recipes').insert({
        user_id: userId,
        chat_id: chatId,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        timer_minutes: recipe.timerMinutes || [0,0,0],
        image_url: recipe.imageUrl,
        prep_time: recipe.prepTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        cuisine: recipe.cuisine,
        meal_type: recipe.mealType,
        day: recipe.day,
        is_full: !!recipe.isFull
      }).select().single();
      
      if (error) {
        console.error("Save Recipe Error (400?):", error);
        return null;
      }
      return data?.id;
    } catch (e) {
      console.error("Save Recipe Exception:", e);
      return null;
    }
  };

  const updateRecipeInDb = async (recipe: Recipe) => {
    if (!userId || !recipe.id) return;
    try {
      const { error } = await supabase.from('recipes').update({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        image_url: recipe.imageUrl,
        is_full: !!recipe.isFull,
        meal_type: recipe.mealType,
        day: recipe.day
      }).eq('id', recipe.id);
      
      if (error) console.error("Update Recipe Error:", error);
    } catch (e) {
      console.error("Update Recipe Exception:", e);
    }
  };

  const fetchList = async (lang: 'EN' | 'FR' = 'EN') => {
    if (ingredients.length === 0 && secretIngredients.length === 0) return;
    setLoading(true);
    try {
      const allIngsStr = [...ingredients.map(i => `${i.name} (${i.qty})`), ...secretIngredients].join(', ');
      const ideas = await generateRecipeList(allIngsStr, lang, { budget, familySize, cuisine, dishType });
      
      let chatId = currentChatId;
      if (!chatId) {
        chatId = await createChat(allIngsStr.slice(0, 40) + '...');
      }

      const recipesWithChat = await Promise.all(ideas.map(async (r) => {
        const dbId = (userId && chatId) ? await saveRecipeToDb(r, chatId) : r.id;
        return { ...r, id: dbId || r.id, chat_id: chatId || undefined };
      }));

      setRecipes(prev => [...prev, ...recipesWithChat]);
    } catch (error) {
      console.error("List Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (id: string, lang: 'EN' | 'FR' = 'EN') => {
    const r = recipes.find(x => x.id === id);
    if (!r || r.isFull) return;

    try {
      const full = await generateRecipeDetails(r, lang);
      
      let imageUrl = r.imageUrl || '';
      if (!imageUrl) {
        try {
          imageUrl = await getHuggingFaceImage(full.title);
        } catch (e) {
          imageUrl = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800';
        }
      }

      const updated = { ...full, id, chat_id: r.chat_id, imageUrl, isFull: true };
      setRecipes(prev => prev.map(x => x.id === id ? updated : x));
      
      if (userId) await updateRecipeInDb(updated);
    } catch (error) {
      console.error("Details Fetch Error:", error);
    }
  };

  const fetchPlan = async (days: 3 | 7, lang: 'EN' | 'FR' = 'EN') => {
    setLoading(true);
    try {
      const allIngsStr = [...ingredients.map(i => `${i.name} (${i.qty})`), ...secretIngredients].join(', ');
      const plan = await generateMealPlan(days, allIngsStr, lang, { budget, familySize, cuisine });
      
      const chatId = await createChat(`${days}-Day Plan: ${allIngsStr.slice(0, 20)}...`);
      
      const recipesWithChat = await Promise.all(plan.map(async (r) => {
        const dbId = (userId && chatId) ? await saveRecipeToDb(r, chatId) : r.id;
        return { ...r, id: dbId || r.id, chat_id: chatId || undefined };
      }));

      setRecipes(recipesWithChat);
      setMealPlan(plan);
    } catch (error) {
      console.error("Plan Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRecipe = (updated: Recipe) => {
    setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r));
    if (userId) updateRecipeInDb(updated);
  };

  const clear = () => {
    setIngredients([]);
    setSecretIngredients([]);
    setRecipes([]);
    setMealPlan(null);
    setCurrentChatId(null);
    setDishType('Main');
  };

  return { 
    ingredients, setIngredients, secretIngredients, setSecretIngredients,
    budget, setBudget, familySize, setFamilySize, cuisine, setCuisine, dishType, setDishType,
    recipes, setRecipes, loading, fetchList, fetchDetails, fetchPlan, updateRecipe, clear, 
    chatHistory, fetchChatRecipes, mealPlan, currentChatId 
  };
};
