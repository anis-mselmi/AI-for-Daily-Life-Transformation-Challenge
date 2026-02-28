import { useState } from 'react';
import { supabase } from '../../services/supabase';
import { Loader2, Sparkles } from 'lucide-react';
import './AuthForm.css';

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', type: '' });

    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setMsg({ text: error.message, type: 'error' });
      } else {
        setMsg({ 
          text: isSignUp ? 'Check your email for the recovery link!' : 'Welcome back! Redirecting...', 
          type: 'success' 
        });
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setMsg({ text: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="header-emoji" style={{ margin: '0 auto 1.5rem', width: 'fit-content' }}>
          <Sparkles size={32} />
        </div>
        <h2>{isSignUp ? 'Join Chef\'s Hub' : 'Welcome Back'}</h2>
        <p>{isSignUp ? 'Create an account to save your recipe history' : 'Sign in to access your culinary collection'}</p>
      </div>

      <form className="auth-form-body" onSubmit={handleSubmit}>
        <div className="auth-input-group">
          <input 
            className="auth-input"
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
        </div>
        
        <div className="auth-input-group">
          <input 
            className="auth-input"
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button className="auth-submit-btn" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" style={{ margin: '0 auto' }} /> : (isSignUp ? 'Start Your Journey' : 'Sign In')}
        </button>
      </form>

      <div className="auth-switch-text">
        {isSignUp ? 'Already a member?' : 'New to the kitchen?'}
        <span className="auth-switch-link" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Sign In Instead' : 'Create an Account'}
        </span>
      </div>

      {msg.text && (
        <div className={`auth-msg ${msg.type}`}>
          {msg.text}
        </div>
      )}
    </div>
  );
};
