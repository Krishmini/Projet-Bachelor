import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import logo from "../assets/FEMME.png";
import psychoImg from "../assets/psy.png";
import socialImg from "../assets/soc.png";
import financeImg from "../assets/fin.png";

export default function Home() {
  const [search, setSearch]     = useState('');
  const navigate                = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/ressources?q=${encodeURIComponent(search)}`);
  };

  const categories = [
  {
    key: 'psychologique',
    label: 'Soutien Psychologique',
    image: psychoImg
  },
  {
    key: 'sociale',
    label: 'Aide Sociale',
    image: socialImg
  },
  {
    key: 'financiere',
    label: 'Aide Financière',
    image: financeImg
  },
];

  return (
    <div className="home">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-content">
          <div className="home-hero-illustration">
              <img src={logo} alt="Logo" className="brand-logo" />
            
          </div>
          <div className="home-hero-text">
            <h1>Vous n'êtes pas seul.</h1>
            <br></br>
            <form onSubmit={handleSearch} className="search-bar">
              <input
                type="text"
                placeholder="Rechercher une ressource..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field search-input"
              />
              <button type="submit" className="btn btn-primary search-btn">🔍</button>
            </form>
          </div>
        </div>
      </section>
<br></br><br></br>
      {/* Catégories */}
      <section className="home-categories">
        <div className="container">
          <div className="categories-grid">
            {categories.map((cat) => (
              <button
                key={cat.key}
                className="category-card"
                style={{ '--cat-bg': cat.color }}
                onClick={() => navigate(`/ressources?categorie=${cat.key}`)}
              >
                <img src={cat.image} alt={cat.label} className="category-icon"/>
                <span className="category-label">{cat.label}</span>
                <span className="btn btn-primary category-btn">Voir</span>
              </button>
            ))}
          </div>
        </div>
      </section>
<br></br><br></br>
      {/* À propos */}
      <section className="home-about">
        <div className="container">
            <h2>À propos</h2>
            <p>
              Nous croyons que chaque personne mérite d'être soutenue dans les moments difficiles.
              Notre plateforme offre une aide concrète, accessible et bienveillante à toutes celles et ceux
              qui ont besoin, qu'il s'agisse de difficultés sociales, psychologiques ou financières.
            </p>
          </div>
        
      </section>
    </div>
  );
}
