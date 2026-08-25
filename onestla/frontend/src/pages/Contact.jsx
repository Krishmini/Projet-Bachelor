import { useEffect, useState } from 'react';
import { getMe, sendContact } from '../services/api';
import './Contact.css';
import logo from '../assets/FEMME.png';

export default function Contact() {
  const isConnected = Boolean(localStorage.getItem('jwt_token'));

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    sujet: '',
    message: '',
    consentement: false,
  });
  const [loadingProfile, setLoadingProfile] = useState(isConnected);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isConnected) {
      setLoadingProfile(false);
      return;
    }

    getMe()
      .then(({ data: user }) => {
        setForm((previous) => ({
          ...previous,
          nom: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || '',
        }));
      })
      .catch(() => {
        setError('Impossible de récupérer les informations de votre compte.');
      })
      .finally(() => setLoadingProfile(false));
  }, [isConnected]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.consentement) {
      setError('Vous devez accepter l’utilisation de vos informations.');
      return;
    }

    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await sendContact({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim(),
        sujet: form.sujet.trim(),
        message: form.message.trim(),
        consentement: true,
      });

      setSuccess(true);
      setForm((previous) => ({
        ...previous,
        sujet: '',
        message: '',
        consentement: false,
      }));
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Erreur lors de l’envoi du message.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <img src={logo} alt="" className="brand-logo" />
        <h1>Nous contacter</h1>
      </div>

      <div className="container contact-container">
        {loadingProfile ? (
          <p className="loading-msg">Chargement de vos informations...</p>
        ) : (
          <>
            {error && <div className="alert alert-error">{error}</div>}
            {success && (
              <div className="alert alert-success">
                Message envoyé avec succès. Nous vous répondrons rapidement !
              </div>
            )}

            <form onSubmit={handleSubmit}>
            
<br></br>
              <div className="contact-account-information">
                <h2>Vos informations</h2>
                <p>
                  {isConnected
                    ? 'Ces informations proviennent de votre compte et ne peuvent pas être modifiées ici.'
                    : 'Renseignez vos coordonnées afin que nous puissions vous répondre.'}
                </p>

                <div className="auth-row">
                  <div className="input-group">
                    <label htmlFor="contact-nom">Nom</label>
                    <input
                      id="contact-nom"
                      name="nom"
                      className={`input-field ${isConnected ? 'readonly-field' : ''}`}
                      placeholder="Votre nom"
                      value={form.nom}
                      onChange={handleChange}
                      readOnly={isConnected}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="contact-prenom">Prénom</label>
                    <input
                      id="contact-prenom"
                      name="prenom"
                      className={`input-field ${isConnected ? 'readonly-field' : ''}`}
                      placeholder="Votre prénom"
                      value={form.prenom}
                      onChange={handleChange}
                      readOnly={isConnected}
                      required
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="contact-email">Adresse e-mail</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    className={`input-field ${isConnected ? 'readonly-field' : ''}`}
                    placeholder="votre@email.fr"
                    value={form.email}
                    onChange={handleChange}
                    readOnly={isConnected}
                    required
                    maxLength={180}
                  />
                </div>
              </div>

              <div className="contact-message-information">
                <h2>Votre message</h2>

                <div className="input-group">
                  <label htmlFor="contact-sujet">Sujet</label>
                  <input
                    id="contact-sujet"
                    name="sujet"
                    className="input-field"
                    placeholder="Sujet de votre message"
                    value={form.sujet}
                    onChange={handleChange}
                    required
                    minLength={3}
                    maxLength={150}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className="input-field contact-textarea"
                    placeholder="Votre message..."
                    value={form.message}
                    onChange={handleChange}
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={6}
                  />
                  <span className="contact-character-count">
                    {form.message.length}/2000
                  </span>
                </div>

                <label className="consent-field">
                  <input
                    name="consentement"
                    type="checkbox"
                    checked={form.consentement}
                    onChange={handleChange}
                    required
                  />
                  <span>
                    J’accepte que mes informations soient utilisées afin de
                    répondre à mon message.
                  </span>
                </label>

                <div className="contact-submit">
                  <button className="btn btn-secondary" disabled={loading}>
                    {loading ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
                
              </div>
            </form>
          </>
        )}
      </div>
      <br></br><br></br>
    </div>
  );
}
