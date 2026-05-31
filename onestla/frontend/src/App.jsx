import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Ressources from './pages/Ressources';
import RessourceDetail from './pages/RessourceDetail';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import Contact from './pages/Contact';
import Profil from './pages/Profil';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/ressources"     element={<Ressources />} />
          <Route path="/ressources/:id" element={<RessourceDetail />} />
          <Route path="/connexion"      element={<Connexion />} />
          <Route path="/inscription"    element={<Inscription />} />
          <Route path="/contact"        element={<Contact />} />
          <Route path="/profil"         element={<Profil />} />
          <Route path="/admin"          element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
