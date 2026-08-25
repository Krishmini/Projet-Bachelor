import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMesDemandes } from '../services/api';
import './MesDemandes.css';

const STATUS_LABELS = {
  ENVOYEE: 'Envoyée',
  EN_COURS: 'En cours de traitement',
  TRAITEE: 'Traitée',
  REFUSEE: 'Refusée',
};

export default function MesDemandes() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMesDemandes()
      .then((response) => {
        setDemandes(response.data);
      })
      .catch((err) => {
        setError(
          err.response?.data?.error ||
          'Impossible de charger vos demandes.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatDate = (date) => {
    if (!date) {
      return '';
    }

    return new Date(date.replace(' ', 'T')).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mes-demandes-page">
      <header className="mes-demandes-header">
        <h1>Mes demandes</h1>
        <p>Suivez ici l’avancement de toutes vos demandes d’aide.</p>
      </header>

      <main className="mes-demandes-container">
        {loading && (
          <div className="demandes-loading">
            Chargement de vos demandes...
          </div>
        )}

        {error && (
          <div className="demandes-error">
            {error}
          </div>
        )}

        {!loading && !error && demandes.length === 0 && (
          <section className="demandes-empty">
            <div className="demandes-empty-icon">📋</div>
            <h2>Vous n’avez encore envoyé aucune demande</h2>
            <p>
              Consultez nos ressources et choisissez l’aide qui correspond
              à votre situation.
            </p>

            <Link to="/ressources" className="demandes-button">
              Consulter les ressources
            </Link>
          </section>
        )}

        {!loading && demandes.length > 0 && (
          <div className="demandes-list">
            {demandes.map((demande) => (
              <article className="demande-item" key={demande.id}>
                <div className="demande-item-top">
                  <div>
                    <span
                      className={`demande-category demande-category-${demande.ressource.categorie}`}
                    >
                      {demande.ressource.categorie}
                    </span>

                    <h2>{demande.ressource.titre}</h2>
                  </div>

                  <span
                    className={`demande-status demande-status-${demande.statut.toLowerCase()}`}
                  >
                    {STATUS_LABELS[demande.statut] || demande.statut}
                  </span>
                </div>

                <p className="demande-date">
                  Envoyée le {formatDate(demande.createdAt)}
                </p>

                <div className="demande-message">
                  <h3>Votre message</h3>
                  <p>{demande.message}</p>
                </div>

                {demande.reponseAdmin ? (
                  <div className="demande-admin-response">
                    <h3>Réponse de l’équipe OnEstLà</h3>
                    <p>{demande.reponseAdmin}</p>
                  </div>
                ) : (
                  <div className="demande-waiting">
                    Votre demande a bien été reçue. Notre équipe la traitera
                    prochainement.
                  </div>
                )}

                <Link
                  to={`/ressources/${demande.ressource.id}`}
                  className="demande-resource-link"
                >
                  Voir la ressource
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}