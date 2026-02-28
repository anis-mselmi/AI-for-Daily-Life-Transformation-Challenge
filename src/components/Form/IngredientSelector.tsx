import { Beef, Carrot, Grape, Utensils, Scale, Plus, X, Hash } from 'lucide-react';
import { useState } from 'react';
import type { IngredientWithQty } from '../../hooks/useRecipe';
import { useTranslation } from 'react-i18next';
import './IngredientSelector.css';

const CATEGORIES = [
  { id: 'meat', label: 'meat_proteins', icon: Beef, items: [
    { name: 'Chicken', unit: 'g' }, { name: 'Beef', unit: 'g' }, 
    { name: 'Fish', unit: 'g' }, { name: 'Eggs', unit: 'pcs' }, 
    { name: 'Tofu', unit: 'g' }, { name: 'Lamb', unit: 'g' }
  ]},
  { id: 'veg', label: 'vegetables', icon: Carrot, items: [
    { name: 'Spinach', unit: 'g' }, { name: 'Tomato', unit: 'pcs' }, 
    { name: 'Onion', unit: 'pcs' }, { name: 'Garlic', unit: 'cloves' }, 
    { name: 'Broccoli', unit: 'g' }, { name: 'Carrot', unit: 'pcs' }, 
    { name: 'Potato', unit: 'pcs' }
  ]},
  { id: 'fruit', label: 'fruits', icon: Grape, items: [
    { name: 'Lemon', unit: 'pcs' }, { name: 'Apple', unit: 'pcs' }, 
    { name: 'Banana', unit: 'pcs' }, { name: 'Orange', unit: 'pcs' }, 
    { name: 'Strawberry', unit: 'g' }
  ]},
  { id: 'pantry', label: 'pantry', icon: Utensils, items: [
    { name: 'Rice', unit: 'g' }, { name: 'Pasta', unit: 'g' }, 
    { name: 'Flour', unit: 'g' }, { name: 'Butter', unit: 'g' }, 
    { name: 'Cheese', unit: 'g' }, { name: 'Oil', unit: 'ml' }
  ]}
];

interface Props {
  selected: IngredientWithQty[];
  secretIngredients: string[];
  onChange: (items: IngredientWithQty[]) => void;
  onSecretChange: (items: string[]) => void;
}

export const IngredientSelector = ({ selected, secretIngredients, onChange, onSecretChange }: Props) => {
  const { t } = useTranslation();
  const [secretInput, setSecretInput] = useState('');

  const toggle = (item: string, defaultUnit: string) => {
    const isSelected = selected.find(i => i.name === item);
    if (isSelected) {
      onChange(selected.filter(i => i.name !== item));
    } else {
      const defaultQty = defaultUnit === 'pcs' || defaultUnit === 'cloves' ? '2' : '200';
      onChange([...selected, { name: item, qty: `${defaultQty}${defaultUnit}` }]);
    }
  };

  const updateQtyValue = (item: string, value: string) => {
    onChange(selected.map(i => {
      if (i.name === item) {
        const unit = i.qty.replace(/[0-9.]/g, '');
        return { ...i, qty: `${value}${unit}` };
      }
      return i;
    }));
  };

  return (
    <div className="ingredient-selector-container">
      {CATEGORIES.map((cat) => (
        <div key={cat.id} className="category-group">
          <h4 className="category-title">
            <cat.icon size={14} style={{ marginRight: '6px' }} />
            {t(cat.label)}
          </h4>
          <div className="ingredient-chips">
            {cat.items.map(itemObj => {
              const select = selected.find(i => i.name === itemObj.name);
              const qtyValue = select ? select.qty.replace(/[^0-9.]/g, '') : '';
              const unitLabel = select ? select.qty.replace(/[0-9.]/g, '') : '';

              return (
                <div key={itemObj.name} className="chip-wrapper">
                  <button
                    onClick={() => toggle(itemObj.name, itemObj.unit)}
                    className={`ingredient-chip-btn ${select ? 'selected' : ''}`}
                  >
                    {itemObj.name}
                  </button>
                  {select && (
                    <div className="qty-picker">
                      {itemObj.unit === 'pcs' ? <Hash size={10} /> : <Scale size={10} />}
                      <input 
                        className="qty-input"
                        type="number"
                        value={qtyValue}
                        onChange={(e) => updateQtyValue(itemObj.name, e.target.value)}
                      />
                      <span className="unit-label">{unitLabel}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="secret-section">
        <h4 className="category-title">{t('secret_ingredients')}</h4>
        <div className="secret-input-row">
          <input 
            className="secret-input"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            placeholder={t('placeholder_secret')}
            onKeyPress={(e) => e.key === 'Enter' && addSecret()}
          />
          <button className="add-secret-btn" onClick={addSecret}>
            <Plus size={18} />
          </button>
        </div>
        <div className="secret-chips">
          {secretIngredients.map(item => (
            <div key={item} className="secret-chip">
              {item}
              <button className="remove-secret" onClick={() => removeSecret(item)}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  function addSecret() {
    if (secretInput.trim() && !secretIngredients.includes(secretInput)) {
      onSecretChange([...secretIngredients, secretInput]);
      setSecretInput('');
    }
  }

  function removeSecret(item: string) {
    onSecretChange(secretIngredients.filter(i => i !== item));
  }
};
