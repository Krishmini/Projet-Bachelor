import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import './Auth.css';
import logo from "../assets/FEMME.png";

export default function Profil() {
  const { user, setUser } = useAuth();
  const [form, setForm]   = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    password: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await updateProfile(form);
      setUser({ ...user, nom: form.nom, prenom: form.prenom, email: form.email });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="contact-header">
              <img src={logo} alt="Logo" className="brand-logo" />
        <h1>Profil</h1>
      </div>
<br></br><br></br><br></br><br></br><br></br><br></br>
      <div className="container auth-container">
          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">Profil mis à jour !</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-row">
              <div className="input-group">
                <input name="nom" className="input-field" value={form.nom}
                  onChange={handleChange} required />
              </div>
              <div className="input-group">
                <input name="prenom" className="input-field" value={form.prenom}
                  onChange={handleChange} required />
              </div>
            </div>
<br></br><br></br>
            <div className="input-group">
              <input name="email" type="email" className="input-field" value={form.email}
                onChange={handleChange} required />
            </div>
<br></br><br></br>
            <div className="input-group">
              <input name="password" type="password" className="input-field"
                placeholder="Nouveau mot de passe" value={form.password}
                onChange={handleChange} />
            </div>
<br></br><br></br>
            <div style={{ textAlign: 'right' }}>
              <button type="submit" className="btn btn-secondary" disabled={loading}>
                {loading ? 'Mise à jour...' : 'Valider'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
