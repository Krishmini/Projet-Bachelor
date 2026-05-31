import { Link } from 'react-router-dom';
import './RessourceCard.css';

const ICONS = {
  psychologique: '',
  sociale: '',
  financiere: '',
};

export default function RessourceCard({ ressource }) {
  return (
    <div className="ressource-card">
      <div className="ressource-card-icon">{ICONS[ressource.categorie] || ''}</div>
      <div className="ressource-card-body">
        <span className={`badge badge-${ressource.categorie}`}>{ressource.categorie}</span>
        <h3>{ressource.titre}</h3>
        <p>{ressource.description}</p>
      </div>
      <Link to={`/ressources/${ressource.id}`} className="btn btn-primary ressource-card-btn">
        Voir détails
      </Link>
    </div>
  );
}

