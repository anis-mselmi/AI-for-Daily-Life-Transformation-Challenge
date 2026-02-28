import { CookingPot } from 'lucide-react';
import './EmptyState.css';

export const EmptyState = () => {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrapper">
        <CookingPot size={64} className="empty-icon" strokeWidth={1.5} />
      </div>
      <p className="empty-text">
        Your recipe will appear here after you click <span className="highlight">"Get Recipe"</span>
      </p>
    </div>
  );
};
