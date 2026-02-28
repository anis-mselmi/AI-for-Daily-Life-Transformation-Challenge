import { ChefHat } from 'lucide-react';
import './Header.css';

export const Header = () => {
  return (
    <header className="header">
      <div className="icon-container">
        <ChefHat size={32} color="white" strokeWidth={2.5} />
      </div>
      <h1 className="header-title">One-Click <span className="highlight">Recipe</span> Suggestor</h1>
      <p className="header-subtitle">Enter the ingredients you have, and get a recipe instantly!</p>
    </header>
  );
};
