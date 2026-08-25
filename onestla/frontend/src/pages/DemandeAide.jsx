import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createDemandeAide, getRessource } from '../services/api';
import './DemandeAide.css';

export default function DemandeAide() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ressource, setRessource] = useState(null);
  const [message, setMessage] = useState('');
  const [loadingRessource, setLoadingRessource] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRessource(id)
      .then((response) => {
        setRessource(response.data);
      })
      .catch(() => {
        setError('Cette ressource est introuvable.');
      })
      .finally(() => {
        setLoadingRessource(false);
      });
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message.trim()) {
      setError('Veuillez expliquer votre demande.');
      return;
    }

    setError(null);
    setSuccess(null);
    setSending(true);

    try {
      const response = await createDemandeAide(
        Number(id),
        message.trim()
      );

      setSuccess(response.data.message);
      setMessage('');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Une erreur est survenue lors de l’envoi.'
      );
    } finally {
      setSending(false);
    }
  };

  if (loadingRessource) {
    return (
      <div className="container" style={{ padding: '40px' }}>
        Chargement...
      </div>
    );
  }

  if (!ressource) {
    return (
      <div className="container" style={{ padding: '40px' }}>
        <div className="alert alert-error">
          {error || 'Cette ressource est introuvable.'}
        </div>
      </div>
    );
  }

  return (
  <div className="demande-page">
    <header className="demande-header">
      <h1>Demander cette aide</h1>
      <p>Expliquez-nous votre situation afin que nous puissions vous accompagner.</p>
    </header>

    <main className="demande-container">
      <button
        type="button"
        className="demande-back"
        onClick={() => navigate(-1)}
      >
        ← Retour à la ressource
      </button>

      <section className="demande-ressource">
        <span className={`badge badge-${ressource.categorie}`}>
          {ressource.categorie}
        </span>

        <h2>{ressource.titre}</h2>
        <p>{ressource.description}</p>
      </section>

      {success && (
        <div className="demande-alert demande-success">
          <strong>{success}</strong>
          <p>
            Votre demande possède maintenant le statut « Envoyée ».
          </p>
        </div>
      )}

      {error && (
        <div className="demande-alert demande-error">
          {error}
        </div>
      )}

      {!success && (
        <form className="demande-form" onSubmit={handleSubmit}>
          <label htmlFor="message">
            Expliquez brièvement votre situation
          </label>

          <p className="demande-help">
            Ne partagez pas d’informations trop sensibles. Indiquez simplement
            l’aide dont vous avez besoin.
          </p>

          <textarea
            id="message"
            placeholder="Par exemple : Je souhaite obtenir davantage d’informations sur cette aide..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={7}
            required
          />

          <div className="demande-actions">
            <button
              type="button"
              className="demande-cancel"
              onClick={() => navigate(-1)}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="demande-submit"
              disabled={sending}
            >
              {sending ? 'Envoi en cours...' : 'Envoyer ma demande'}
            </button>
          </div>
        </form>
      )}

      {success && (
        <div className="demande-actions">
          <button
            type="button"
            className="demande-submit"
            onClick={() => navigate('/ressources')}
          >
            Retour aux ressources
          </button>
        </div>
      )}
    </main>
  </div>
);
}