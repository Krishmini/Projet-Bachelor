import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import logo from "../assets/logo.png";


export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar"><br></br>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Logo" className="brand-logo" />
          <span className="brand-name">
          </span>
        </Link>

        <ul className="navbar-links">
          <li><Link to="/" className={isActive('/')}>Accueil</Link></li>
          <li><Link to="/ressources" className={isActive('/ressources')}>Ressources</Link></li>
          {user && isAdmin() && (
            <li><Link to="/admin" className={isActive('/admin')}>Admin</Link></li>
          )}
          <li><Link to="/contact" className={isActive('/contact')}>Contact</Link></li>
          {user ? (
            <>
              <li><Link to="/profil" className={isActive('/profil')}>Profil</Link></li>
              <li>
                <button className="btn-logout" onClick={handleLogout}>Déconnexion</button>
              </li>
            </>
          ) : (
            <li><Link to="/connexion" className={isActive('/connexion')}>Connexion</Link></li>
          )}
        </ul>
      </div><br></br>
    </nav>
    
  );
}
