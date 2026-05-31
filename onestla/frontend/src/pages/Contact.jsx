import { useState } from 'react';
import { sendContact } from '../services/api';
import './Contact.css';
import logo from "../assets/FEMME.png";

export default function Contact() {
  const [form, setForm]       = useState({ nom: '', prenom: '', sujet: '', message: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendContact(form);
      setSuccess(true);
      setForm({ nom: '', prenom: '', sujet: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <img src={logo} alt="Logo" className="brand-logo" />
  <h1>Nous contacter</h1>
</div>

<div className="container contact-container">
  {error && <div className="alert alert-error">{error}</div>}
  {success && (
    <div className="alert alert-success">
      Message envoyé avec succès. Nous vous répondrons rapidement !
    </div>
  )}
  
          <form onSubmit={handleSubmit}>
            <br></br><br></br><br></br><br></br><br></br><br></br>
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
              <input name="sujet" className="input-field" placeholder="Sujet de votre message"
                value={form.sujet} onChange={handleChange} required />
            </div>
<br></br><br></br>
            <div className="input-group">
              <textarea name="message" className="input-field contact-textarea"
                placeholder="Votre message..." value={form.message}
                onChange={handleChange} required rows={5} />
            </div>
<br></br><br></br>
            <div style={{ textAlign: 'right' }}>
              <button type="submit" className="btn btn-secondary" disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </form>
        </div>
    </div>
  );
}
