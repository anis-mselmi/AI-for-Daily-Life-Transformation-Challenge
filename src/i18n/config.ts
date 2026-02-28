import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "chef_kitchen": "Chef's Kitchen",
      "ingredients": "Ingredients",
      "meat_proteins": "Meat & Proteins",
      "vegetables": "Vegetables",
      "fruits": "Fruits",
      "pantry": "Pantry",
      "family_size": "Family Size",
      "person": "Person",
      "people": "People",
      "budget_level": "Budget Level",
      "generate_recipe": "Generate My Recipe",
      "simmering": "Simmering...",
      "reset_all": "Reset All Preferences",
      "cuisine_type": "Cuisine Type",
      "tunisian": "Tunisian",
      "french": "French",
      "italian": "Italian",
      "mexican": "Mexican",
      "japanese": "Japanese",
      "indian": "Indian",
      "secret_ingredients": "Secret Ingredients",
      "quantity": "Qty",
      "add": "Add",
      "placeholder_secret": "Add a special touch... (e.g. Saffron)",
      "another_variant": "Generate Another Variant",
      "dish_type": "Dish Type",
      "entrée": "Entrée",
      "main": "Main Dish",
      "dessert": "Dessert",
      "full_package": "Full Package",
      "planning": "Planning",
      "generate_plan": "Generate Week Plan",
      "next_3_days": "Next 3 Days",
      "full_week": "Full Week (7 Days)",
      "customize_plan": "Customize Your Period"
    }
  },
  fr: {
    translation: {
      "chef_kitchen": "Cuisine du Chef",
      "ingredients": "Ingrédients",
      "meat_proteins": "Viandes & Protéines",
      "vegetables": "Légumes",
      "fruits": "Fruits",
      "pantry": "Épicerie",
      "family_size": "Taille de la famille",
      "person": "Personne",
      "people": "Personnes",
      "budget_level": "Niveau de budget",
      "generate_recipe": "Générer ma recette",
      "simmering": "Mijotage...",
      "reset_all": "Réinitialiser tout",
      "cuisine_type": "Type de cuisine",
      "tunisian": "Tunisienne",
      "french": "Française",
      "italian": "Italienne",
      "mexican": "Mexicaine",
      "japanese": "Japonaise",
      "indian": "Indienne",
      "secret_ingredients": "Ingrédients Secrets",
      "quantity": "Qté",
      "add": "Ajouter",
      "placeholder_secret": "Ajoutez une touche spéciale... (ex: Safran)",
      "another_variant": "Générer une autre variante",
      "dish_type": "Type de Plat",
      "entrée": "Entrée",
      "main": "Plat Principal",
      "dessert": "Dessert",
      "full_package": "Menu Complet",
      "planning": "Planification",
      "generate_plan": "Générer Plan de Semaine",
      "next_3_days": "Prochains 3 Jours",
      "full_week": "Semaine Complète (7 Jours)",
      "customize_plan": "Personnalisez Votre Période"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
