import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  adminGetUsers, adminGetRessources,
  adminValidateUser, adminDeleteUser,
  adminValidateRessource, adminDeleteRessource,
  adminCreateRessource,
} from '../services/api';
import './Admin.css';

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate          = useNavigate();

  const [tab, setTab]             = useState('users');
  const [users, setUsers]         = useState([]);
  const [ressources, setRessources] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newRes, setNewRes]       = useState({ titre: '', description: '', contenu: '', categorie: 'psychologique' });

  useEffect(() => {
    if (!isAdmin()) { navigate('/'); return; }
    Promise.all([adminGetUsers(), adminGetRessources()])
      .then(([u, r]) => { setUsers(u.data); setRessources(r.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleValidateUser = async (id) => {
    await adminValidateUser(id);
    setUsers(users.map(u => u.id === id ? { ...u, isVerified: !u.isVerified } : u));
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    await adminDeleteUser(id);
    setUsers(users.filter(u => u.id !== id));
  };

  const handleValidateRes = async (id) => {
    await adminValidateRessource(id);
    setRessources(ressources.map(r => r.id === id ? { ...r, isValidated: !r.isValidated } : r));
  };

  const handleDeleteRes = async (id) => {
    if (!confirm('Supprimer cette ressource ?')) return;
    await adminDeleteRessource(id);
    setRessources(ressources.filter(r => r.id !== id));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await adminCreateRessource({ ...newRes, isValidated: true });
    setRessources([res.data, ...ressources]);
    setShowCreate(false);
    setNewRes({ titre: '', description: '', contenu: '', categorie: 'psychologique' });
  };

  if (loading) return <div className="container" style={{ padding: '40px' }}>Chargement...</div>;

  return (
    
    <div className="admin-page">
      <div className="page-hero">
        <br></br><br></br><br></br><br></br>
        <div className="container"><h1>Tableau de bord</h1></div>
      </div>
<br></br><br></br>
      <div className="container admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar card">
          <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            👤 Utilisateurs <span className="tab-count">{users.length}</span>
          </button>
          <button className={`admin-tab ${tab === 'ressources' ? 'active' : ''}`} onClick={() => setTab('ressources')}>
            📋 Ressources <span className="tab-count">{ressources.length}</span>
          </button>
        </aside>

        {/* Content */}
        <main className="admin-content">

          {tab === 'users' && (
            <div className="card admin-card">
              <h2>Utilisateurs</h2>
              <div className="admin-divider" />
              {users.map((u) => (
                <div key={u.id} className="admin-row">
                  <span className="admin-name">
                    {u.nom} {u.prenom}
                    {u.roles?.includes('ROLE_ADMIN') && <span className="badge-admin">Admin</span>}
                  </span>
                  <span className="admin-email">{u.email}</span>
                  <div className="admin-actions">
                    <button
                      className={`btn ${u.isVerified ? 'btn-outline' : 'btn-primary'}`}
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => handleValidateUser(u.id)}
                    >
                      {u.isVerified ? 'Vérifié ✓' : 'Valider'}
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => handleDeleteUser(u.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'ressources' && (
            <div className="card admin-card">
              <div className="admin-card-header">
                <h2>Ressources</h2>
                <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
                  {showCreate ? '✕ Annuler' : '+ Ajouter'}
                </button>
              </div>

              {showCreate && (
                <form className="create-form" onSubmit={handleCreate}>
                  <div className="auth-row">
                    <div className="input-group">
                      <label>Titre</label>
                      <input className="input-field" value={newRes.titre}
                        onChange={e => setNewRes({ ...newRes, titre: e.target.value })} required />
                    </div>
                    <div className="input-group">
                      <label>Catégorie</label>
                      <select className="input-field" value={newRes.categorie}
                        onChange={e => setNewRes({ ...newRes, categorie: e.target.value })}>
                        <option value="psychologique">Psychologique</option>
                        <option value="sociale">Sociale</option>
                        <option value="financiere">Financière</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Description</label>
                    <input className="input-field" value={newRes.description}
                      onChange={e => setNewRes({ ...newRes, description: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label>Contenu</label>
                    <textarea className="input-field" rows={4} value={newRes.contenu}
                      onChange={e => setNewRes({ ...newRes, contenu: e.target.value })}
                      style={{ borderRadius: '16px' }} />
                  </div>
                  <button type="submit" className="btn btn-primary">Créer la ressource</button>
                </form>
              )}

              <div className="admin-divider" />

              {ressources.map((r) => (
                <div key={r.id} className="admin-row">
                  <span className={`badge badge-${r.categorie}`}>{r.categorie}</span>
                  <span className="admin-name">{r.titre}</span>
                  <div className="admin-actions">
                    <button
                      className={`btn ${r.isValidated ? 'btn-outline' : 'btn-primary'}`}
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => handleValidateRes(r.id)}
                    >
                      {r.isValidated ? 'Publié ✓' : 'Valider'}
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => handleDeleteRes(r.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
