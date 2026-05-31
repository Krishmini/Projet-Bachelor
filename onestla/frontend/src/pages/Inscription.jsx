import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import './Auth.css';
import logo from "../assets/FEMME.png";

export default function Inscription() {
  const navigate         = useNavigate();
  const [form, setForm]  = useState({ nom: '', prenom: '', email: '', password: '', confirm: '' });
  const [error, setError]   = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await register(form.nom, form.prenom, form.email, form.password);
      setSuccess(true);
      setTimeout(() => navigate('/connexion'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="contact-header">
                    <img src={logo} alt="Logo" className="brand-logo" />
              <h1>Inscription</h1>
            </div>
      <br></br><br></br><br></br><br></br>

      <div className="container auth-container">
          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">Compte créé ! Redirection vers la connexion...</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-row">
              <div className="input-group">
                <input name="nom" className="input-field" placeholder="Nom" value={form.nom}
                  onChange={handleChange} required />
              </div>
              <div className="input-group">
                <input name="prenom" className="input-field" placeholder="Prénom" value={form.prenom}
                  onChange={handleChange} required />
              </div>
            </div>
<br></br><br></br>
            <div className="input-group">
              <input name="email" type="email" className="input-field" placeholder="📧 votre@email.fr"
                value={form.email} onChange={handleChange} required />
            </div>
<br></br><br></br>
            <div className="input-group">
              <input name="password" type="password" className="input-field" placeholder="🔒 Mot de passe"
                value={form.password} onChange={handleChange} required />
            </div>
<br></br><br></br>
            <div className="input-group">
              <input name="confirm" type="password" className="input-field" placeholder="🔒 Confirmer le mot de passe"
                value={form.confirm} onChange={handleChange} required />
            </div>
            <div className="auth-actions">
              <Link to="/connexion" className="auth-link">Déjà un compte ?</Link><hr></hr>
              <button type="submit" className="btn btn-secondary" disabled={loading || success}>
                {loading ? 'Inscription...' : "S'inscrire"}
              </button>
            </div>
            
          </form>
        </div>
      </div>
  );
}
