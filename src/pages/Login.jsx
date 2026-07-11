import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { users, login, registerUser } = useAppContext();
  
  const [isRegistering, setIsRegistering] = useState(users.length === 0);
  const [formData, setFormData] = useState({ username: '', password: '', name: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (!formData.username || !formData.password || !formData.name) {
        return setError('All fields are required');
      }
      // Force first user to be admin, otherwise they can't access admin portal
      const role = users.length === 0 ? 'admin' : 'student'; 
      registerUser(formData.username, formData.password, role, formData.name);
      
      // Auto login after register
      if (login(formData.username, formData.password)) {
        navigate(`/${role}`);
      }
    } else {
      const success = login(formData.username, formData.password);
      if (success) {
        const user = users.find(u => u.username === formData.username);
        navigate(`/${user.role}`);
      } else {
        setError('Invalid username or password');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="card login-box">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2>{isRegistering ? (users.length === 0 ? 'Create Admin Account' : 'Register') : 'Welcome Back'}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            {isRegistering ? 'Setup your account to continue' : 'Sign in to access your portal'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              className="input-field"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              placeholder="admin123"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input-field"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '16px', padding: '12px' }}>
            {isRegistering ? <><UserPlus size={18} /> Create Account</> : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        {/* Removed registration toggle so students cannot register themselves */}
      </div>
    </div>
  );
}
