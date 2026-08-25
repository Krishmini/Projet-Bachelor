import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import './PasswordReset.css';

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await forgotPassword(email);

      setSuccess(response.data.message);
      setEmail('');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Impossible d’envoyer la demande.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-page">
      <header className="password-header">
        <h1>Mot de passe oublié</h1>
        <p>
          Saisissez votre adresse e-mail pour recevoir un lien
          de réinitialisation.
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

        {!success && (
          <form
            className="password-form"
            onSubmit={handleSubmit}
          >
            <label htmlFor="forgot-email">
              Adresse e-mail
            </label>

            <input
              id="forgot-email"
              type="email"
              placeholder="votre@email.fr"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Envoi en cours...'
                : 'Recevoir le lien'}
            </button>
          </form>
        )}

        <Link
          to="/connexion"
          className="password-back"
        >
          ← Retour à la connexion
        </Link>
      </main>
    </div>
  );
}