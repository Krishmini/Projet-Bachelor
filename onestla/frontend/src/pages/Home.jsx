import {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import './Home.css';

import femmeImg from '../assets/FEMME.png';
import psychoImg from '../assets/psy.png';
import socialImg from '../assets/soc.png';
import financeImg from '../assets/fin.png';

export default function Home() {
  const [search, setSearch] =
    useState('');

  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      navigate('/ressources');
      return;
    }

    navigate(
      `/ressources?q=${encodeURIComponent(value)}`
    );
  };

  const categories = [
    {
      key: 'psychologique',
      label: 'Soutien psychologique',
      image: psychoImg,
    },
    {
      key: 'sociale',
      label: 'Aide sociale',
      image: socialImg,
    },
    {
      key: 'financiere',
      label: 'Aide financière',
      image: financeImg,
    },
  ];

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-content">
          <div className="home-hero-illustration">
            <img
              src={femmeImg}
              alt=""
              className="home-woman-image"
            />
          </div>

          <div className="home-hero-text">
            <h1>Vous n’êtes pas seul.</h1>

            <form
              onSubmit={handleSearch}
              className="search-bar"
            >
              <input
                type="text"
                placeholder="Rechercher une ressource..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="input-field search-input"
              />

              <button
                type="submit"
                className="btn btn-primary search-btn"
                aria-label="Rechercher"
              >
                🔍
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="home-categories">
        <div className="container">
          <div className="categories-grid">
            {categories.map((categorie) => (
              <button
                type="button"
                key={categorie.key}
                className="category-card"
                onClick={() =>
                  navigate(
                    `/ressources?categorie=${categorie.key}`
                  )
                }
              >
                <img
                  src={categorie.image}
                  alt=""
                  className="category-icon"
                />

                <span className="category-label">
                  {categorie.label}
                </span>

                <span className="btn btn-primary category-btn">
                  Voir
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="home-about">
        <div className="container">
          <div className="about-card">
            <h2>À propos</h2>

            <p>
              Nous croyons que chaque personne
              mérite d’être soutenue dans les
              moments difficiles. Notre plateforme
              offre une aide concrète, accessible
              et bienveillante à toutes celles et
              ceux qui en ont besoin, qu’il
              s’agisse de difficultés sociales,
              psychologiques ou financières.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}