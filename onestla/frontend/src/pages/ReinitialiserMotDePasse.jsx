import { useState } from 'react';
import {
  Link,
  useSearchParams,
} from 'react-router-dom';

import { resetPassword } from '../services/api';
import './PasswordReset.css';

export default function ReinitialiserMotDePasse() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccess(null);
    setError(null);

    if (!token) {
      setError(
        'Le lien de réinitialisation est invalide.'
      );
      return;
    }

    if (password.length < 8) {
      setError(
        'Le mot de passe doit contenir au minimum 8 caractères.'
      );
      return;
    }

    if (password !== confirmation) {
      setError(
        'Les deux mots de passe ne correspondent pas.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(
        token,
        password
      );

      setSuccess(response.data.message);
      setPassword('');
      setConfirmation('');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Impossible de modifier le mot de passe.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-page">
      <header className="password-header">
        <h1>Nouveau mot de passe</h1>
        <p>
          Choisissez un nouveau mot de passe sécurisé.
        </p>
      </header>

      <main className="password-container">
        {success && (
          <div className="password-alert password-success">
            {success}
          </div>
        )}

        {error && (
          <div className="password-alert password-error">
            {error}
          </div>
        )}

        {!success && token && (
          <form
            className="password-form"
            onSubmit={handleSubmit}
          >
            <label htmlFor="new-password">
              Nouveau mot de passe
            </label>

            <input
              id="new-password"
              type="password"
              placeholder="Minimum 8 caractères"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength={8}
              required
            />

            <label htmlFor="confirm-password">
              Confirmer le mot de passe
            </label>

            <input
              id="confirm-password"
              type="password"
              placeholder="Confirmez votre mot de passe"
              value={confirmation}
              onChange={(event) =>
                setConfirmation(event.target.value)
              }
              minLength={8}
              required
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Modification...'
                : 'Modifier mon mot de passe'}
            </button>
          </form>
        )}

        {success && (
          <Link
            to="/connexion"
            className="password-login-button"
          >
            Se connecter
          </Link>
        )}

        {!success && (
          <Link
            to="/connexion"
            className="password-back"
          >
            ← Retour à la connexion
          </Link>
        )}
      </main>
    </div>
  );
}