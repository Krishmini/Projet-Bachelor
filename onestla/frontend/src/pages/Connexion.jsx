import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import logo from "../assets/FEMME.png";

export default function Connexion() {
  const { login }          = useAuth();
  const navigate           = useNavigate();
  const [email, setEmail]  = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]  = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.roles?.includes('ROLE_ADMIN') ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="contact-header">
              <img src={logo} alt="Logo" className="brand-logo" />
        <h1>Connexion</h1>
      </div>
<br></br><br></br><br></br><br></br>
      <div className="container auth-container">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <br></br>
              <input
                type="email"
                className="input-field"
                placeholder="📧 votre@email.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
<br></br>
            <div className="input-group">
              <input
                type="password"
                className="input-field"
                placeholder="🔒 votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
<br></br><br></br>
            <div className="auth-actions">
              <Link to="/inscription" className="auth-link">Créer un compte</Link>
              <button type="submit" className="btn btn-secondary" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
