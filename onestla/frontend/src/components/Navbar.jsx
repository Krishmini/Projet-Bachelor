import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  useAuth,
} from '../context/AuthContext';

import './Navbar.css';
import logo from '../assets/logo.png';

export default function Navbar() {
  const {
    user,
    logout,
    isAdmin,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  /*
   * Fermer automatiquement le menu
   * lorsqu’on change de page.
   */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const isActive = (path) =>
    location.pathname === path
      ? 'active'
      : '';

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link
          to="/"
          className="navbar-brand"
          onClick={closeMenu}
        >
          <img
            src={logo}
            alt="Logo OnEstLà"
            className="brand-logo"
          />
        </Link>

        {/* Bouton téléphone et tablette */}
        <button
          type="button"
          className={`navbar-toggle ${
            menuOpen ? 'opened' : ''
          }`}
          aria-label={
            menuOpen
              ? 'Fermer le menu'
              : 'Ouvrir le menu'
          }
          aria-expanded={menuOpen}
          aria-controls="navbar-navigation"
          onClick={() =>
            setMenuOpen(
              (current) => !current
            )
          }
        >
          <span />
          <span />
          <span />
        </button>

        <ul
          id="navbar-navigation"
          className={`navbar-links ${
            menuOpen ? 'navbar-links-open' : ''
          }`}
        >
          <li>
            <Link
              to="/"
              className={isActive('/')}
              onClick={closeMenu}
            >
              Accueil
            </Link>
          </li>

          <li>
            <Link
              to="/contact"
              className={isActive('/contact')}
              onClick={closeMenu}
            >
              Contact
            </Link>
          </li>

          {user && (
            <>
              {!isAdmin() && (
                <>
                  <li>
                    <Link
                      to="/ressources"
                      className={isActive(
                        '/ressources'
                      )}
                      onClick={closeMenu}
                    >
                      Ressources
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/mes-demandes"
                      className={isActive(
                        '/mes-demandes'
                      )}
                      onClick={closeMenu}
                    >
                      Mes demandes
                    </Link>
                  </li>
                </>
              )}

              {isAdmin() && (
                <li>
                  <Link
                    to="/admin"
                    className={isActive(
                      '/admin'
                    )}
                    onClick={closeMenu}
                  >
                    Admin
                  </Link>
                </li>
              )}

              <li>
                <Link
                  to="/profil"
                  className={isActive(
                    '/profil'
                  )}
                  onClick={closeMenu}
                >
                  Profil
                </Link>
              </li>

              <li>
                <button
                  type="button"
                  className="btn-logout"
                  onClick={handleLogout}
                >
                  Déconnexion
                </button>
              </li>
            </>
          )}

          {!user && (
            <li>
              <Link
                to="/connexion"
                className={isActive(
                  '/connexion'
                )}
                onClick={closeMenu}
              >
                Connexion
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}