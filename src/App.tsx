import { useState, useEffect, useMemo } from 'react';
import { Sparkles, X, Plus } from 'lucide-react';
import { Header } from './components/Layout/Header';
import { RecipeForm } from './components/Form/RecipeForm';
import { RecipeDisplay } from './components/Display/RecipeDisplay';
import { EmptyState } from './components/Display/EmptyState';
import { Sidebar } from './components/Layout/Sidebar';
import { AuthForm } from './components/Auth/AuthForm';
import { useRecipe } from './hooks/useRecipe';
import { useAuth } from './hooks/useAuth';
import { supabase } from './services/supabase';
import { useTranslation } from 'react-i18next';
import type { Recipe } from './types/recipe';
import './i18n/config';
import './index.css';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const [showAuth, setShowAuth] = useState(false);
  const [expandingId, setExpandingId] = useState<string | null>(null);
  
  const { 
    ingredients, setIngredients, 
    secretIngredients, setSecretIngredients,
    familySize, setFamilySize,
    cuisine, setCuisine,
    dishType, setDishType,
    recipes,
    loading, fetchList, fetchDetails, fetchPlan, updateRecipe, clear, 
    chatHistory, fetchChatRecipes, currentChatId
  } = useRecipe(user?.id);

  const groupedRecipes = useMemo(() => {
    const groups: { [key: string]: Recipe[] } = {};
    recipes.forEach(r => {
      const day = r.day || 'Results';
      if (!groups[day]) groups[day] = [];
      groups[day].push(r);
    });
    return groups;
  }, [recipes]);

  useEffect(() => {
    // Initial fetch if needed, though useRecipe handles it
  }, [user]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  if (authLoading) return <div className="loading-screen text-primary font-black animate-pulse">CHEF IS PREPARING...</div>;

  return (
    <div className="layout">
      {user && (
        <Sidebar 
          chatHistory={chatHistory} 
          activeChatId={currentChatId}
          onSelectChat={fetchChatRecipes} 
          onLogout={() => supabase.auth.signOut()}
          onNewChat={clear}
          userEmail={user.email}
        />
      )}
      
      <main className="main-viewport">
        <div className="top-nav">
          <div className="nav-left-info">
            <span className="status-badge">Discovery Mode Active</span>
          </div>
          
          <div className="nav-right-groups">
            <div className="lang-switcher">
              <button 
                onClick={() => changeLanguage('en')} 
                className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
              >
                EN
              </button>
              <button 
                onClick={() => changeLanguage('fr')} 
                className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`}
              >
                FR
              </button>
            </div>

            {!user && (
              <button className="premium-btn" onClick={() => setShowAuth(true)}>
                <div className="btn-content">
                  <Sparkles size={18} />
                  <span>Join to Save History</span>
                </div>
              </button>
            )}
          </div>
        </div>

        <div className="content-container">
          {showAuth ? (
            <div className="auth-overlay">
              <div className="auth-modal">
                <button className="close-auth" onClick={() => setShowAuth(false)}><X /></button>
                <AuthForm onSuccess={() => setShowAuth(false)} />
              </div>
            </div>
          ) : (
            <>
              <Header />
              <RecipeForm 
                ingredients={ingredients}
                setIngredients={setIngredients}
                secretIngredients={secretIngredients}
                setSecretIngredients={setSecretIngredients}
                familySize={familySize}
                setFamilySize={setFamilySize}
                cuisine={cuisine}
                setCuisine={setCuisine}
                dishType={dishType}
                setDishType={setDishType}
                onGetRecipe={() => fetchList(i18n.language.toUpperCase() as any)}
                onGetPlan={(days) => fetchPlan(days, i18n.language.toUpperCase() as any)}
                onClear={clear}
                loading={loading}
              />
              
              <div className="results-grid discovery-mode">
                {recipes.length === 0 ? (
                  <EmptyState />
                ) : (
                  <>
                    <div className="recipe-discovery-grid">
                      {Object.entries(groupedRecipes).sort().map(([day, items]) => (
                        <div key={day} className="day-group-section">
                          {day !== 'Results' && <h3 className="day-section-title">{day}</h3>}
                          <div className="day-recipes-list">
                            {items.map((recipe, index) => (
                              <RecipeDisplay 
                                key={recipe.id || index} 
                                recipe={recipe} 
                                isExpanding={expandingId === recipe.id}
                                disabled={!!expandingId && expandingId !== recipe.id}
                                onUpdate={updateRecipe}
                                onExpand={async (id) => {
                                  setExpandingId(id);
                                  await fetchDetails(id, i18n.language.toUpperCase() as any);
                                  setExpandingId(null);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {!loading && (ingredients.length > 0 || secretIngredients.length > 0) && (
                      <button 
                        onClick={() => fetchList(i18n.language.toUpperCase() as any)}
                        className="generate-more-btn"
                      >
                        <Plus size={32} /> {t('another_variant')}
                      </button>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
