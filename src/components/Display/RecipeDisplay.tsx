import { useState, useEffect, useMemo } from 'react';
import { 
  Clock, Users, Flame, CheckCircle, ArrowRight, X, 
  Loader2, Download, Check, UtensilsCrossed, Plus,
  ChefHat, Scissors, Waves, Timer, RotateCw, ThermometerSnowflake,
  Zap, Trophy, ArrowDown, Edit2, Save
} from 'lucide-react';
import type { Recipe } from '../../types/recipe';
import { Typewriter } from '../UI/Typewriter';
import './RecipeDisplay.css';

interface RecipeDisplayProps {
  recipe: Recipe;
  onClose?: () => void;
  onExpand?: (id: string) => void;
  onUpdate?: (recipe: Recipe) => void;
  isExpanding?: boolean;
  disabled?: boolean;
}

export const RecipeDisplay = ({ recipe, onClose, onExpand, onUpdate, isExpanding, disabled }: RecipeDisplayProps) => {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [showTrophy, setShowTrophy] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(recipe.title);
  const [editDesc, setEditDesc] = useState(recipe.description);

  useEffect(() => {
    if (recipe.isFull && recipe.instructions && visibleSteps < recipe.instructions.length) {
      const timer = setTimeout(() => setVisibleSteps(v => v + 1), 600);
      return () => clearTimeout(timer);
    }
  }, [visibleSteps, recipe.isFull, recipe.instructions]);

  const progress = useMemo(() => {
    if (!recipe.instructions?.length) return 0;
    return Math.round((completedSteps.length / recipe.instructions.length) * 100);
  }, [completedSteps, recipe.instructions]);

  useEffect(() => {
    if (progress === 100 && !showTrophy) {
      setShowTrophy(true);
      const timer = setTimeout(() => setShowTrophy(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const getStepIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('cut') || t.includes('chop') || t.includes('dice') || t.includes('slice')) return <Scissors size={18} />;
    if (t.includes('boil') || t.includes('heat') || t.includes('cook') || t.includes('bake') || t.includes('fry') || t.includes('oven')) return <Flame size={18} />;
    if (t.includes('wash') || t.includes('rinse') || t.includes('water')) return <Waves size={18} />;
    if (t.includes('wait') || t.includes('minute') || t.includes('hour') || t.includes('rest')) return <Timer size={18} />;
    if (t.includes('mix') || t.includes('stir') || t.includes('whisk') || t.includes('combine')) return <RotateCw size={18} />;
    if (t.includes('chill') || t.includes('refrigerate') || t.includes('cold') || t.includes('fridge')) return <ThermometerSnowflake size={18} />;
    if (t.includes('serve') || t.includes('enjoy') || t.includes('plate') || t.includes('ready')) return <ChefHat size={18} />;
    return <Zap size={18} />;
  };

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSaveEdit = () => {
    if (onUpdate) {
      onUpdate({
        ...recipe,
        title: editTitle,
        description: editDesc
      });
    }
    setIsEditing(false);
  };

  const handleDownload = async () => {
    setDownloading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (recipe.imageUrl) {
      const link = document.createElement('a');
      link.href = recipe.imageUrl;
      link.download = `${recipe.title}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setDownloading(false);
  };

  if (!recipe.isFull) {
    return (
      <div 
        className={`recipe-preview-card ${disabled ? 'disabled-card' : ''}`} 
        onClick={() => !disabled && onExpand?.(recipe.id)}
      >
        <div className="preview-badge-group">
          <div className="preview-badge">{recipe.mealType}</div>
        </div>
        <div className="preview-content">
          <h3 className="preview-title">{recipe.title}</h3>
          <div className="preview-footer">
            <span className="footer-item"><Clock size={14} /> {recipe.prepTime}</span>
            <span className="footer-item"><UtensilsCrossed size={14} /> {recipe.mealType}</span>
          </div>
          <button className="expand-btn" disabled={disabled}>
            {isExpanding ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} /> View More</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-card full-mode">
      <div className="hero-section">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="hero-img" />
        ) : (
          <div className="hero-img loading-placeholder">
            <div className="loader-content">
              <Loader2 className="animate-spin" size={48} />
              <span>AI is painting your dish...</span>
            </div>
          </div>
        )}
        <div className="hero-overlay">
          <div className="meal-tag-group">
            <div className="meal-tag">{recipe.mealType}</div>
          </div>
          {isEditing ? (
            <input 
              className="edit-title-input"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
            />
          ) : (
            <h2 className="recipe-headline">{recipe.title}</h2>
          )}
          <div className="recipe-summary">
            {isEditing ? (
              <textarea 
                className="edit-desc-input"
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
              />
            ) : (
              <Typewriter text={recipe.description} speed={10} />
            )}
          </div>
        </div>
        <div className="hero-actions">
          {recipe.isFull && (
            <button 
              className={`action-circle-btn edit ${isEditing ? 'active' : ''}`} 
              onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)}
            >
              {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
            </button>
          )}
          {recipe.imageUrl && (
            <button 
              className={`action-circle-btn ${downloading ? 'downloading' : ''}`} 
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? <Loader2 className="animate-spin" /> : <Download size={20} />}
            </button>
          )}
          {onClose && (
            <button className="action-circle-btn close" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <Clock size={20} className="stat-icon" />
          <div className="stat-info">
            <span className="val">{recipe.prepTime}</span>
            <span className="lbl">Prep Time</span>
          </div>
        </div>
        <div className="divider" />
        <div className="stat">
          <Users size={20} className="stat-icon" />
          <div className="stat-info">
            <span className="val">{recipe.servings}</span>
            <span className="lbl">Serves</span>
          </div>
        </div>
        <div className="divider" />
        <div className="stat">
          <UtensilsCrossed size={20} className="stat-icon" />
          <div className="stat-info">
            <span className="val">{recipe.cuisine}</span>
            <span className="lbl">Cuisine</span>
          </div>
        </div>
        <div className="divider" />
        <div className="stat">
          <Flame size={20} className="stat-icon" />
          <div className="stat-info">
            <span className="val">{recipe.difficulty}</span>
            <span className="lbl">Difficulty</span>
          </div>
        </div>
      </div>

      <div className="recipe-grid">
        <div className="ingredients-col">
          <div className="section-header">
            <CheckCircle className="header-icon" />
            <h3>Ingredients</h3>
          </div>
          <div className="ing-grid">
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ing, i) => (
                <div key={i} className="ing-card">
                  <span className="ing-bullet">•</span> {ing}
                </div>
              ))
            ) : (
              <p className="text-muted">No ingredients data available.</p>
            )}
          </div>
        </div>

        <div className="instructions-col">
          <div className="section-header">
            <ArrowRight className="header-icon" />
            <h3>Interactive Discovery</h3>
            <div className="progress-tracker">
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="progress-text">{progress}% Completed</span>
            </div>
          </div>
          
          <div className="steps-list">
            {recipe.instructions?.slice(0, visibleSteps).map((step, i) => {
              const isCompleted = completedSteps.includes(i);
              const isCurrent = completedSteps.length === i;
              
              return (
                <div key={i} className="step-container">
                  <div 
                    className={`step-row reveal-animation ${isCompleted ? 'completed' : ''} ${isCurrent && !isCompleted ? 'active-pulse' : ''}`}
                    onClick={() => toggleStep(i)}
                  >
                    <div className="step-num">
                      {isCompleted ? <Check size={16} /> : i + 1}
                    </div>
                    <div className="step-content-wrapper">
                      <div className="step-icon-badge">
                        {getStepIcon(step)}
                      </div>
                      <p 
                        className="step-text" 
                        dangerouslySetInnerHTML={{ __html: step.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} 
                      />
                    </div>
                    {isCompleted && <div className="step-checkmark-sparkle"><Zap size={14} /></div>}
                  </div>
                  {i < (recipe.instructions?.length || 0) - 1 && (
                    <div className={`roadmap-arrow reveal-animation ${isCompleted ? 'completed' : ''}`}>
                      <ArrowDown size={32} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {showTrophy && (
            <div className="celebration-overlay">
              <Trophy size={64} className="trophy-bounce" />
              <h3>Masterpiece Completed!</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
