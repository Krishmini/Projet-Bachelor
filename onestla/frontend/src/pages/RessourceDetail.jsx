import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRessource } from '../services/api';
import './RessourceDetail.css';


export default function RessourceDetail() {
  const { id }                  = useParams();
  const navigate                = useNavigate();
  const [ressource, setRessource] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    getRessource(id)
      .then((res) => setRessource(res.data))
      .catch(() => setError('Ressource introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '40px' }}>Chargement...</div>;
  if (error)   return <div className="container" style={{ padding: '40px' }}><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="detail-page">
      <div className="container">
        <button className="btn-back" onClick={() => navigate(-1)}>← Retour</button>

        <div className="card detail-card">
          <div className="detail-header">
            <span className="detail-icon">{ICONS[ressource.categorie] || '📋'}</span>
            <div>
              <span className={`badge badge-${ressource.categorie}`}>{ressource.categorie}</span>
              <h1>{ressource.titre}</h1>
              <p className="detail-description">{ressource.description}</p>
            </div>
          </div>

          {ressource.contenu && (
            <div className="detail-contenu">
              {ressource.contenu.split('\n').map((line, i) => {
                if (!line.trim()) return <br key={i} />;
                // Gras **texte**
                const parts = line.split(/\*\*(.+?)\*\*/g);
                return (
                  <p key={i}>
                    {parts.map((part, j) =>
                      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                    )}
                  </p>
                );
              })}
            </div>
          )}

          <div className="detail-footer">
            <button className="btn btn-primary" onClick={() => navigate('/contact')}>
              Valider l'aide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
