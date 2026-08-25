import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Ressources from './pages/Ressources';
import RessourceDetail from './pages/RessourceDetail';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import Contact from './pages/Contact';
import Profil from './pages/Profil';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import DemandeAide from './pages/DemandeAide';
import MesDemandes from './pages/MesDemandes';
import MotDePasseOublie from './pages/MotDePasseOublie';
import ReinitialiserMotDePasse from './pages/ReinitialiserMotDePasse';
import MentionsLegales from './pages/MentionsLegales';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />

          <div className="app-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/connexion" element={<Connexion />} />
              <Route path="/inscription" element={<Inscription />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route
                path="/politique-confidentialite"
                element={<PolitiqueConfidentialite />}
              />
              <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
              <Route
                path="/reinitialiser-mot-de-passe"
                element={<ReinitialiserMotDePasse />}
              />

              <Route path="/ressources" element={<ProtectedRoute><Ressources /></ProtectedRoute>} />
              <Route path="/ressources/:id" element={<ProtectedRoute><RessourceDetail /></ProtectedRoute>} />
              <Route path="/ressources/:id/demande" element={<ProtectedRoute><DemandeAide /></ProtectedRoute>} />
              <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
              <Route path="/mes-demandes" element={<ProtectedRoute><MesDemandes /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            </Routes>
          </div>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
