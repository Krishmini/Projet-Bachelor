import { useState } from 'react';
import { searchCommunes } from '../services/api';
import './CommuneSearch.css';

export default function CommuneSearch({
  ville,
  codePostal,
  onSelect,
}) {
  const [search, setSearch] = useState(
    codePostal || ville || ''
  );

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    const value = search.trim();

    if (value.length < 2) {
      setError(
        'Saisissez une ville ou un code postal.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await searchCommunes(value);

      setResults(response.data.slice(0, 6));

      if (response.data.length === 0) {
        setError('Aucune commune trouvée.');
      }
    } catch (err) {
      console.error('Erreur API communes :', err);

      setError(
        'Impossible de rechercher les communes.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (commune) => {
    const searchedPostalCode = /^\d{5}$/.test(
      search.trim()
    )
      ? search.trim()
      : null;

    const selectedPostalCode =
      commune.codesPostaux?.find(
        (postalCode) =>
          postalCode === searchedPostalCode
      ) ||
      commune.codesPostaux?.[0] ||
      '';

    onSelect({
      ville: commune.nom,
      codePostal: selectedPostalCode,
    });

    setSearch(
      `${selectedPostalCode} - ${commune.nom}`
    );

    setResults([]);
    setError(null);
  };

  return (
    <div className="commune-search">
      <label>Localisation</label>

      <div className="commune-search-row">
        <input
          type="text"
          className="input-field"
          placeholder="Ville ou code postal"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleSearch();
            }
          }}
        />

        <button
          type="button"
          className="commune-search-button"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
       </div>

      <button
        type="button"
        className="commune-national-button"
        onClick={() => {
          onSelect({
            ville: 'France entière',
            codePostal: '',
          });

          setSearch('France entière');
          setResults([]);
          setError(null);
        }}
      >
        🌍 Disponible partout en France
      </button>

      {ville && (
        <div className="commune-selected">
          📍 Localisation sélectionnée :
          <strong>
            {codePostal ? `${codePostal} ${ville}` : ville}
          </strong>
        </div>
      )}

      {error && (
        <div className="commune-error">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="commune-results">
          {results.map((commune) => (
            <button
              type="button"
              className="commune-result"
              key={commune.code}
              onClick={() =>
                handleSelect(commune)
              }
            >
              <strong>{commune.nom}</strong>

              <span>
                {commune.codesPostaux?.join(', ')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}