import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRessources } from '../services/api';
import RessourceCard from '../components/RessourceCard';
import './Ressources.css';

const CATEGORIES = ['psychologique', 'sociale', 'financiere'];

export default function Ressources() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ressources, setRessources]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const categorieActive = searchParams.get('categorie') || '';
  const q               = searchParams.get('q') || '';

  useEffect(() => {
    setLoading(true);
    getRessources(categorieActive || null)
      .then((res) => setRessources(res.data))
      .catch(() => setError('Impossible de charger les ressources.'))
      .finally(() => setLoading(false));
  }, [categorieActive]);

  // Filtrer par recherche textuelle côté client
  const filtered = q
    ? ressources.filter(
        (r) =>
          r.titre.toLowerCase().includes(q.toLowerCase()) ||
          r.description.toLowerCase().includes(q.toLowerCase())
      )
    : ressources;

  const setCategorie = (cat) => {
    const params = {};
    if (cat)  params.categorie = cat;
    if (q)    params.q         = q;
    setSearchParams(params);
  };

  return (
    <div className="ressources-page">
      
      <br></br><br></br><br></br><br></br>

      <div className="container ressources-layout">
        {/* Sidebar filtres */}
        <aside className="ressources-sidebar card">
          <h3>🔍 Ressources</h3>
          <div className="filter-list">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="filter-item">
                <input
                  type="checkbox"
                  name="categorie"
                  checked={categorieActive === cat}
                  onChange={() => setCategorie(cat)}
                />
                <span className={`badge badge-${cat}`}>{cat}</span>
              </label>
            ))}
            {categorieActive && (
              <button className="btn-clear" onClick={() => setCategorie('')}>
                ✕ Effacer filtre
              </button>
            )}
          </div>
        </aside>

        {/* Contenu */}
        <main className="ressources-content">
          <div className="ressources-header">
            <h2>
              {categorieActive
                ? `Ressources : ${categorieActive}`
                : q
                ? `Résultats pour « ${q} »`
                : 'Toutes les ressources'}
            </h2>
            <span className="ressources-count">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
          </div>

          {loading && <p className="loading-msg">Chargement...</p>}
          {error   && <div className="alert alert-error">{error}</div>}

          {!loading && !error && filtered.length === 0 && (
            <div className="empty-state">
              <span>🔍</span>
              <p>Aucune ressource trouvée.</p>
            </div>
          )}

          <div className="ressources-wrapper">
  <div className="ressources-grid">
    {filtered.map((r) => (
      <RessourceCard key={r.id} ressource={r} />
    ))}
  </div>
</div>
        </main>
      </div>
    </div>
  );
}
