import './Header.css';

export const Header = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src="/logo.png" alt="KoolAi Logo" className="logo-img" />
      </div>
     
      <p className="header-subtitle">MAKE YOUR FOOD RECIPE</p>
    </header>
  );
};
