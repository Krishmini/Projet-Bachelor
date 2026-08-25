import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteMyAccount, updateProfile } from '../services/api';
import './Auth.css';
import logo from '../assets/FEMME.png';

export default function Profil() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    password: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await updateProfile(form);
      setUser({ ...user, nom: form.nom, prenom: form.prenom, email: form.email });
      setForm((previous) => ({ ...previous, password: '' }));
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Supprimer définitivement votre compte et toutes vos demandes ? Cette action est irréversible.'
    );

    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteMyAccount();
      logout();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de supprimer le compte.');
      setDeleting(false);
    }
  };

  return (
    <div className="auth-page profile-page">
      <div className="contact-header">
        <img src={logo} alt="" className="brand-logo" />
        <h1>Profil</h1>
      </div>

      <div className="container auth-container profile-container">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">Profil mis à jour !</div>}
<br></br><br></br><br></br>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="auth-row">
            <div className="input-group">
              <label htmlFor="profile-nom">Nom</label>
              <input id="profile-nom" name="nom" className="input-field" value={form.nom} onChange={handleChange} required maxLength={100} />
            </div>
            <div className="input-group">
              <label htmlFor="profile-prenom">Prénom</label>
              <input id="profile-prenom" name="prenom" className="input-field" value={form.prenom} onChange={handleChange} required maxLength={100} />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="profile-email">Adresse e-mail</label>
            <input id="profile-email" name="email" type="email" className="input-field" value={form.email} onChange={handleChange} required maxLength={180} />
          </div>

          <div className="input-group">
            <label htmlFor="profile-password">Nouveau mot de passe</label>
            <input id="profile-password" name="password" type="password" className="input-field" placeholder="Laisser vide pour ne pas modifier" value={form.password} onChange={handleChange} minLength={8} />
          </div>

          <div className="profile-actions">
            <button className="btn btn-secondary" disabled={loading || deleting}>
              {loading ? 'Mise à jour...' : 'Valider'}
            </button>
          </div>
        </form>
<br></br><br></br>
        <section className="delete-account-zone">
          <h2>Supprimer mon compte</h2><br></br>
          <p>
            Cette action supprimera définitivement votre compte ainsi que
            toutes les demandes d’aide qui lui sont associées.
          </p><br></br>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDeleteAccount}
            disabled={deleting || loading}
          >
            {deleting ? 'Suppression...' : 'Supprimer définitivement mon compte'}
          </button>
        </section>
        <br></br><br></br>
      </div>
    </div>
  );
}
