import { useState } from 'react';
import { ArrowRight, RotateCcw, Loader2, Users, Globe, UtensilsCrossed, Calendar } from 'lucide-react';
import { IngredientSelector } from './IngredientSelector';
import type { IngredientWithQty } from '../../hooks/useRecipe';
import { useTranslation } from 'react-i18next';
import './RecipeForm.css';

interface RecipeFormProps {
  ingredients: IngredientWithQty[];
  setIngredients: (items: IngredientWithQty[]) => void;
  secretIngredients: string[];
  setSecretIngredients: (items: string[]) => void;
  onGetRecipe: () => void;
  onGetPlan: (days: 3 | 7) => void;
  onClear: () => void;
  loading: boolean;
  familySize: string;
  setFamilySize: (val: string) => void;
  cuisine: string;
  setCuisine: (val: string) => void;
  dishType: string;
  setDishType: (val: string) => void;
}

export const RecipeForm = ({ 
  ingredients, 
  setIngredients, 
  secretIngredients,
  setSecretIngredients,
  onGetRecipe, 
  onGetPlan,
  onClear, 
  loading,
  familySize,
  setFamilySize,
  cuisine,
  setCuisine,
  dishType,
  setDishType
}: RecipeFormProps) => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<3 | 7 | null>(null);

  const handleGenerate = () => {
    if (selectedPlan) {
      onGetPlan(selectedPlan);
    } else {
      onGetRecipe();
    }
  };

  const handleClear = () => {
    setSelectedPlan(null);
    onClear();
  };

  const togglePlan = (days: 3 | 7) => {
    setSelectedPlan(selectedPlan === days ? null : days);
  };

  return (
    <div className="recipe-form-container">
      <div className="recipe-form-wrapper">
        <h3 className="form-header">
          <span className="header-emoji">🍳</span>
          {t('chef_kitchen')}
        </h3>

        <div className="form-body">
          <div className="form-section">
            <IngredientSelector 
              selected={ingredients} 
              onChange={setIngredients} 
              secretIngredients={secretIngredients}
              onSecretChange={setSecretIngredients}
            />
          </div>

          <div className="form-section">
            <div className="input-field">
              <label className="input-label">
                <Globe size={16} /> {t('cuisine_type')}
              </label>
              <div className="option-group">
                {['French', 'Tunisian', 'Italian', 'Mexican', 'Japanese', 'Indian'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCuisine(c)}
                    className={`option-btn ${cuisine === c ? 'selected-secondary' : ''}`}
                    style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                  >
                    {t(c.toLowerCase())}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-field">
              <label className="input-label">
                <UtensilsCrossed size={16} /> {t('dish_type')}
              </label>
              <div className="option-group">
                {['entrée', 'main', 'dessert', 'full_package'].map(dt => (
                  <button
                    key={dt}
                    type="button"
                    onClick={() => setDishType(dt)}
                    className={`option-btn ${dishType === dt ? 'selected-secondary' : ''}`}
                    style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                  >
                    {t(dt)}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-field">
              <label className="input-label">
                <Users size={16} /> {t('family_size')}
              </label>
              <div className="option-group">
                {['1', '2', '4', '6+'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFamilySize(s)}
                    className={`option-btn ${familySize === s ? 'selected-secondary' : ''}`}
                  >
                    {s} {s === '1' ? t('person') : t('people')}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-field">
              <label className="input-label">
                <Calendar size={16} /> {t('planning')}
              </label>
              <div className="option-group">
                <button 
                  type="button"
                  onClick={() => togglePlan(3)}
                  disabled={loading}
                  className={`plan-btn ${selectedPlan === 3 ? 'selected-secondary' : ''}`}
                >
                  {t('next_3_days')}
                </button>
                <button 
                  type="button"
                  onClick={() => togglePlan(7)}
                  disabled={loading}
                  className={`plan-btn ${selectedPlan === 7 ? 'selected-secondary' : ''}`}
                >
                  {t('full_week')}
                </button>
              </div>
            </div>

            <div className="action-stack">
              <button 
                type="button"
                className="generate-btn"
                onClick={handleGenerate}
                disabled={loading || (ingredients.length === 0 && secretIngredients.length === 0)}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <ArrowRight size={24} />
                )}
                {loading 
                  ? t('simmering') 
                  : selectedPlan 
                    ? `${t('generate_plan')} (${selectedPlan} ${t('days').toLowerCase()})`
                    : t('generate_recipe')
                }
              </button>
              
              <button 
                type="button"
                onClick={handleClear}
                className="reset-btn"
              >
                <RotateCcw size={18} /> {t('reset_all')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
