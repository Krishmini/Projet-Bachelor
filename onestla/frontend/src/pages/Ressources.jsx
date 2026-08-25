import {
  useEffect,
  useState,
} from 'react';

import {
  useSearchParams,
} from 'react-router-dom';

import {
  getRessources,
} from '../services/api';

import RessourceCard from '../components/RessourceCard';

import './Ressources.css';

const CATEGORIES = [
  'psychologique',
  'sociale',
  'financiere',
];

export default function Ressources() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [ressources, setRessources] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const categorieActive =
    searchParams.get('categorie') || '';

  const q =
    searchParams.get('q') || '';

  const localisationActive =
    searchParams.get('localisation') || '';

  const [
    localisationInput,
    setLocalisationInput,
  ] = useState(localisationActive);

  /*
   * Synchronise le champ avec l’URL.
   */
  useEffect(() => {
    setLocalisationInput(
      localisationActive
    );
  }, [localisationActive]);

  /*
   * Chargement des ressources.
   */
  useEffect(() => {
    setLoading(true);
    setError(null);

    getRessources(
      categorieActive || null,
      localisationActive || null
    )
      .then((response) => {
        setRessources(response.data);
      })
      .catch((err) => {
        console.error(
          'Erreur ressources :',
          err
        );

        setError(
          'Impossible de charger les ressources.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    categorieActive,
    localisationActive,
  ]);

  /*
   * Recherche textuelle côté frontend.
   */
  const filtered = q
    ? ressources.filter((ressource) => {
        const recherche =
          q.toLowerCase();

        return (
          ressource.titre
            ?.toLowerCase()
            .includes(recherche) ||
          ressource.description
            ?.toLowerCase()
            .includes(recherche)
        );
      })
    : ressources;

  /*
   * Modifier la catégorie sans perdre
   * la recherche et la localisation.
   */
  const setCategorie = (categorie) => {
    const params = {};

    if (categorie) {
      params.categorie = categorie;
    }

    if (q) {
      params.q = q;
    }

    if (localisationActive) {
      params.localisation =
        localisationActive;
    }

    setSearchParams(params);
  };

  /*
   * Lancer une recherche géographique.
   */
  const handleLocationSearch = (event) => {
    event.preventDefault();

    const params = {};

    if (categorieActive) {
      params.categorie =
        categorieActive;
    }

    if (q) {
      params.q = q;
    }

    const localisation =
      localisationInput.trim();

    if (localisation) {
      params.localisation =
        localisation;
    }

    setSearchParams(params);
  };

  /*
   * Supprimer uniquement la localisation.
   */
  const clearLocation = () => {
    const params = {};

    if (categorieActive) {
      params.categorie =
        categorieActive;
    }

    if (q) {
      params.q = q;
    }

    setLocalisationInput('');
    setSearchParams(params);
  };

  return (
    <div className="ressources-page">
      <br />
      <br />
      <br />
      <br />

      <div className="container ressources-layout">
        <aside className="ressources-sidebar card">
          <h3>🔍 Ressources</h3>

          <div className="filter-list">
            {CATEGORIES.map((categorie) => (
              <label
                key={categorie}
                className="filter-item"
              >
                <input
                  type="checkbox"
                  name="categorie"
                  checked={
                    categorieActive ===
                    categorie
                  }
                  onChange={() =>
                    setCategorie(categorie)
                  }
                />

                <span
                  className={
                    `badge badge-${categorie}`
                  }
                >
                  {categorie}
                </span>
              </label>
            ))}

            {categorieActive && (
              <button
                type="button"
                className="btn-clear"
                onClick={() =>
                  setCategorie('')
                }
              >
                ✕ Effacer la catégorie
              </button>
            )}
          </div>

          <div className="location-filter">
            <h4>📍 Localisation</h4>

            <form
              onSubmit={
                handleLocationSearch
              }
            >
              <input
                type="text"
                className="location-filter-input"
                placeholder="Ville ou code postal"
                value={localisationInput}
                onChange={(event) =>
                  setLocalisationInput(
                    event.target.value
                  )
                }
              />

              <button
                type="submit"
                className="location-filter-button"
              >
                Rechercher
              </button>
            </form>

            {localisationActive && (
              <div className="active-location">
                <span>
                  📍 {localisationActive}
                </span>

                <button
                  type="button"
                  onClick={clearLocation}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </aside>

        <main className="ressources-content">
          <div className="ressources-header">
            <h2>
              {categorieActive
                ? `Ressources : ${categorieActive}`
                : q
                  ? `Résultats pour « ${q} »`
                  : localisationActive
                    ? `Aides disponibles à ${localisationActive}`
                    : 'Toutes les ressources'}
            </h2>

            <span className="ressources-count">
              {filtered.length}{' '}
              résultat
              {filtered.length > 1
                ? 's'
                : ''}
            </span>
          </div>

          {localisationActive && (
            <p className="location-information">
              Les résultats comprennent les
              aides disponibles à{' '}
              <strong>
                {localisationActive}
              </strong>{' '}
              et celles disponibles partout
              en France.
            </p>
          )}

          {loading && (
            <p className="loading-msg">
              Chargement...
            </p>
          )}

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            filtered.length === 0 && (
              <div className="empty-state">
                <span>🔍</span>

                <p>
                  Aucune ressource trouvée
                  pour cette localisation.
                </p>
              </div>
            )}

          <div className="ressources-wrapper">
            <div className="ressources-grid">
              {filtered.map((ressource) => (
                <RessourceCard
                  key={ressource.id}
                  ressource={ressource}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}