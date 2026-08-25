import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '40px' }}>Chargement...</p>;
  }

  if (!user) {
    return (
      <Navigate
        to="/connexion"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          message: 'Vous devez vous connecter pour accéder à cette page.',
        }}
      />
    );
  }

  return children;
}