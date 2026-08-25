import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-content">
        <p>© 2026 OnEstLà — Projet pédagogique</p>

        <nav aria-label="Informations légales">
          <Link to="/mentions-legales">Mentions légales</Link>
          <Link to="/politique-confidentialite">
            Politique de confidentialité
          </Link>
          <Link to="/contact">Nous contacter</Link>
        </nav>
      </div>
    </footer>
  );
}
