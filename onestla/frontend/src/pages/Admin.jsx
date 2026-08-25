import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommuneSearch from '../components/CommuneSearch';


import {
  adminGetUsers,
  adminGetRessources,
  adminValidateUser,
  adminDeleteUser,
  
  adminUpdateUserStatus,
  adminUpdateUserRole,

  adminValidateRessource,
  adminDeleteRessource,
  adminCreateRessource,
  adminUpdateRessource,
  adminGetDemandes,
  adminUpdateDemande,
} from '../services/api';

import './Admin.css';

const EMPTY_RESSOURCE = {
  titre: '',
  description: '',
  contenu: '',
  categorie: 'psychologique',
  ville: '',
  codePostal: '',
};

const DEMANDE_STATUSES = {
  ENVOYEE: 'Envoyée',
  EN_COURS: 'En cours de traitement',
  TRAITEE: 'Traitée',
  REFUSEE: 'Refusée',
};

const DEMANDE_CATEGORIES = [
  {
    value: 'psychologique',
    label: 'Psychologique',
  },
  {
    value: 'sociale',
    label: 'Sociale',
  },
  {
    value: 'financiere',
    label: 'Financière',
  },
];

export default function Admin() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('users');

  const [users, setUsers] = useState([]);
  const [ressources, setRessources] = useState([]);
  const [demandes, setDemandes] = useState([]);

  const [savingUser, setSavingUser] = useState(null);

  const [userMessage, setUserMessage] = useState(null);

  const [loading, setLoading] = useState(true);

  // Création d’une ressource
  const [showCreate, setShowCreate] = useState(false);
  const [newRes, setNewRes] = useState(EMPTY_RESSOURCE);

  // Modification d’une ressource
  const [editingRes, setEditingRes] = useState(null);
  const [resourceMessage, setResourceMessage] = useState(null);
  const [savingResource, setSavingResource] = useState(false);

  // Gestion des demandes
  const [savingDemande, setSavingDemande] = useState(null);
  const [demandeMessage, setDemandeMessage] = useState(null);


  const [
  demandeStatusFilter,
  setDemandeStatusFilter,
] = useState('');

const [
  demandeCategoryFilter,
  setDemandeCategoryFilter,
] = useState('');

const [
  openedDemandeId,
  setOpenedDemandeId,
] = useState(null);


  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }

    Promise.all([
      adminGetUsers(),
      adminGetRessources(),
      adminGetDemandes(),
    ])
      .then(([usersResponse, ressourcesResponse, demandesResponse]) => {
        setUsers(usersResponse.data);
        setRessources(ressourcesResponse.data);
        setDemandes(demandesResponse.data);
      })
      .catch((error) => {
        console.error(
          'Erreur de chargement administrateur :',
          error
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

// Utilisateurs

  const handleValidateUser = async (id) => {
    await adminValidateUser(id);

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === id
          ? { ...user, isVerified: !user.isVerified }
          : user
      )
    );
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) {
      return;
    }

    await adminDeleteUser(id);

    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== id)
    );
  };


  const handleUserStatus = async (user) => {
  setSavingUser(user.id);
  setUserMessage(null);

  try {
    const response = await adminUpdateUserStatus(
      user.id,
      !user.isActive
    );

    setUsers((currentUsers) =>
      currentUsers.map((item) =>
        item.id === user.id
          ? {
              ...item,
              isActive: response.data.user.isActive,
            }
          : item
      )
    );

    setUserMessage({
      type: 'success',
      text: response.data.message,
    });
  } catch (error) {
    setUserMessage({
      type: 'error',
      text:
        error.response?.data?.error ||
        'Impossible de modifier l’état du compte.',
    });
  } finally {
    setSavingUser(null);
  }
};

const handleUserRole = async (user, role) => {
  setSavingUser(user.id);
  setUserMessage(null);

  try {
    const response = await adminUpdateUserRole(
      user.id,
      role
    );

    setUsers((currentUsers) =>
      currentUsers.map((item) =>
        item.id === user.id
          ? {
              ...item,
              roles: response.data.user.roles,
            }
          : item
      )
    );

    setUserMessage({
      type: 'success',
      text: response.data.message,
    });
  } catch (error) {
    setUserMessage({
      type: 'error',
      text:
        error.response?.data?.error ||
        'Impossible de modifier le rôle.',
    });
  } finally {
    setSavingUser(null);
  }
};

// Ressources

  const handleValidateRes = async (id) => {
    await adminValidateRessource(id);

    setRessources((currentRessources) =>
      currentRessources.map((ressource) =>
        ressource.id === id
          ? {
              ...ressource,
              isValidated: !ressource.isValidated,
            }
          : ressource
      )
    );
  };

  const handleDeleteRes = async (id) => {
    if (!window.confirm('Supprimer cette ressource ?')) {
      return;
    }

    await adminDeleteRessource(id);

    setRessources((currentRessources) =>
      currentRessources.filter(
        (ressource) => ressource.id !== id
      )
    );

    if (editingRes?.id === id) {
      setEditingRes(null);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setResourceMessage(null);

    try {
      const response = await adminCreateRessource({
        ...newRes,
        isValidated: true,
      });

      setRessources((currentRessources) => [
        response.data,
        ...currentRessources,
      ]);

      setShowCreate(false);
      setNewRes(EMPTY_RESSOURCE);

      setResourceMessage({
        type: 'success',
        text: 'La ressource a bien été créée.',
      });
    } catch (error) {
      setResourceMessage({
        type: 'error',
        text:
          error.response?.data?.error ||
          'Impossible de créer la ressource.',
      });
    }
  };

  const handleStartEdit = (ressource) => {
    setShowCreate(false);
    setResourceMessage(null);

    setEditingRes({
      id: ressource.id,
      titre: ressource.titre,
      description: ressource.description,
      contenu: ressource.contenu || '',
      categorie: ressource.categorie,
      ville: ressource.ville || '',
      codePostal: ressource.codePostal || '',
      isValidated: ressource.isValidated,
    });

    window.scrollTo({
      top: 200,
      behavior: 'smooth',
    });
  };

  const handleCancelEdit = () => {
    setEditingRes(null);
    setResourceMessage(null);
  };

  const handleUpdateRessource = async (event) => {
    event.preventDefault();

    if (!editingRes) {
      return;
    }

    setSavingResource(true);
    setResourceMessage(null);

    try {
      const response = await adminUpdateRessource(
        editingRes.id,
        {
          titre: editingRes.titre,
          description: editingRes.description,
          contenu: editingRes.contenu,
          categorie: editingRes.categorie,
          ville: editingRes.ville,
          codePostal: editingRes.codePostal,
          isValidated: editingRes.isValidated,
        }
      );

      setRessources((currentRessources) =>
        currentRessources.map((ressource) =>
          ressource.id === editingRes.id
            ? response.data
            : ressource
        )
      );

      setEditingRes(null);

      setResourceMessage({
        type: 'success',
        text: 'La ressource a bien été modifiée.',
      });
    } catch (error) {
      setResourceMessage({
        type: 'error',
        text:
          error.response?.data?.error ||
          'Impossible de modifier la ressource.',
      });
    } finally {
      setSavingResource(false);
    }
  };

// Demandes d’aide

  const handleDemandeChange = (id, field, value) => {
    setDemandes((currentDemandes) =>
      currentDemandes.map((demande) =>
        demande.id === id
          ? { ...demande, [field]: value }
          : demande
      )
    );
  };

  const handleSaveDemande = async (demande) => {
    setSavingDemande(demande.id);
    setDemandeMessage(null);

    try {
      const response = await adminUpdateDemande(
        demande.id,
        {
          statut: demande.statut,
          reponseAdmin: demande.reponseAdmin || '',
        }
      );

      setDemandes((currentDemandes) =>
        currentDemandes.map((item) =>
          item.id === demande.id
            ? {
                ...item,
                statut: response.data.demande.statut,
                reponseAdmin:
                  response.data.demande.reponseAdmin,
              }
            : item
        )
      );

      setDemandeMessage({
        type: 'success',
        id: demande.id,
        text: 'La demande a bien été mise à jour.',
      });
    } catch (error) {
      setDemandeMessage({
        type: 'error',
        id: demande.id,
        text:
          error.response?.data?.error ||
          'Impossible de mettre à jour la demande.',
      });
    } finally {
      setSavingDemande(null);
    }
  };

  const filteredDemandes = demandes.filter(
  (demande) => {
    const matchStatus =
      !demandeStatusFilter ||
      demande.statut === demandeStatusFilter;

    const matchCategory =
      !demandeCategoryFilter ||
      demande.ressource?.categorie ===
        demandeCategoryFilter;

    return matchStatus && matchCategory;
  }
);

const clearDemandeFilters = () => {
  setDemandeStatusFilter('');
  setDemandeCategoryFilter('');
};


  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: '40px' }}
      >
        Chargement...
      </div>
    );
  }
  

  return (
    <div className="admin-page">
      <div className="page-hero">
        <div className="container" >
          <br></br><br></br><br></br><br></br>
          <h1>Tableau de bord</h1><br></br><br></br>
        </div>
      </div>

      <div className="container admin-layout">
        {/* Barre latérale */}
        <aside className="admin-sidebar card">
          <button
            type="button"
            className={`admin-tab ${
              tab === 'users' ? 'active' : ''
            }`}
            onClick={() => setTab('users')}
          >
            👤 Utilisateurs
            <span className="tab-count">
              {users.length}
            </span>
          </button>

          <button
            type="button"
            className={`admin-tab ${
              tab === 'ressources' ? 'active' : ''
            }`}
            onClick={() => setTab('ressources')}
          >
            📋 Ressources
            <span className="tab-count">
              {ressources.length}
            </span>
          </button>

          <button
            type="button"
            className={`admin-tab ${
              tab === 'demandes' ? 'active' : ''
            }`}
            onClick={() => setTab('demandes')}
          >
            📨 Demandes
            <span className="tab-count">
              {demandes.length}
            </span>
          </button>
        </aside>

        <main className="admin-content">
          {/* Utilisateurs */}
{tab === 'users' && (
  <div className="card admin-card">
    <div className="admin-card-header">
      <div>
        <h2>Gestion des utilisateurs</h2>

        <p className="admin-card-description">
          Validez les inscriptions, gérez les rôles
          et activez ou désactivez les comptes.
        </p>
      </div>

      <span className="admin-users-count">
        {users.length} utilisateur
        {users.length > 1 ? 's' : ''}
      </span>
    </div>

    {userMessage && (
      <div
        className={`admin-user-message ${userMessage.type}`}
      >
        {userMessage.text}
      </div>
    )}

    <div className="admin-divider" />

    <div className="admin-users-list">
      {users.map((user) => {
        const userIsAdmin =
          user.roles?.includes('ROLE_ADMIN');

        const isSaving =
          savingUser === user.id;

        return (
          <article
            key={user.id}
            className={`admin-user-card ${
              !user.isActive
                ? 'admin-user-disabled'
                : ''
            }`}
          >
            <div className="admin-user-identity">
              <div className="admin-user-avatar">
                {user.prenom
                  ?.charAt(0)
                  .toUpperCase()}

                {user.nom
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <div className="admin-user-name">
                  <strong>
                    {user.prenom} {user.nom}
                  </strong>

                  {userIsAdmin && (
                    <span className="badge-admin">
                      Administrateur
                    </span>
                  )}

                  {!user.isActive && (
                    <span className="badge-disabled">
                      Désactivé
                    </span>
                  )}
                </div>

                <span className="admin-email">
                  {user.email}
                </span>
              </div>
            </div>

            <div className="admin-user-controls">
              {/* Choix du rôle */}
              <div className="admin-user-control">
                <label htmlFor={`role-${user.id}`}>
                  Rôle
                </label>

                <select
                  id={`role-${user.id}`}
                  value={
                    userIsAdmin
                      ? 'ROLE_ADMIN'
                      : 'ROLE_USER'
                  }
                  disabled={isSaving}
                  onChange={(event) =>
                    handleUserRole(
                      user,
                      event.target.value
                    )
                  }
                >
                  <option value="ROLE_USER">
                    Utilisateur
                  </option>

                  <option value="ROLE_ADMIN">
                    Administrateur
                  </option>
                </select>
              </div>

              {/* Validation du compte */}
              <div className="admin-user-control">
                <label>Inscription</label>

                <button
                  type="button"
                  className={`btn ${
                    user.isVerified
                      ? 'btn-outline'
                      : 'btn-primary'
                  }`}
                  disabled={isSaving}
                  onClick={() =>
                    handleValidateUser(user.id)
                  }
                >
                  {user.isVerified
                    ? 'Vérifié ✓'
                    : 'Valider'}
                </button>
              </div>

              {/* Activation ou désactivation */}
              <div className="admin-user-control">
                <label>État du compte</label>

                <button
                  type="button"
                  className={`btn ${
                    user.isActive
                      ? 'btn-disable-user'
                      : 'btn-enable-user'
                  }`}
                  disabled={isSaving}
                  onClick={() =>
                    handleUserStatus(user)
                  }
                >
                  {isSaving
                    ? 'Modification...'
                    : user.isActive
                      ? 'Désactiver'
                      : 'Activer'}
                </button>
              </div>

              {/* Suppression */}
              <div className="admin-user-control">
                <label>Suppression</label>

                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={isSaving}
                  onClick={() =>
                    handleDeleteUser(user.id)
                  }
                >
                  Supprimer
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  </div>
)}


          {/* Ressources */}
          {tab === 'ressources' && (
            <div className="card admin-card">
              <div className="admin-card-header">
                <h2>Ressources</h2>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowCreate(!showCreate);
                    setEditingRes(null);
                    setResourceMessage(null);
                  }}
                >
                  {showCreate
                    ? '✕ Annuler'
                    : '+ Ajouter'}
                </button>
              </div>

              {/* Formulaire de création */}
              {showCreate && (
                <form
                  className="create-form"
                  onSubmit={handleCreate}
                >
                  <div className="auth-row">
                    <div className="input-group">
                      <label htmlFor="create-titre">
                        Titre
                      </label>

                      <input
                        id="create-titre"
                        className="input-field"
                        value={newRes.titre}
                        onChange={(event) =>
                          setNewRes({
                            ...newRes,
                            titre: event.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="create-categorie">
                        Catégorie
                      </label>

                      <select
                        id="create-categorie"
                        className="input-field"
                        value={newRes.categorie}
                        onChange={(event) =>
                          setNewRes({
                            ...newRes,
                            categorie:
                              event.target.value,
                          })
                        }
                      >
                        <option value="psychologique">
                          Psychologique
                        </option>

                        <option value="sociale">
                          Sociale
                        </option>

                        <option value="financiere">
                          Financière
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="create-description">
                      Description
                    </label>

                    <textarea
                      id="create-description"
                      className="input-field"
                      rows={3}
                      value={newRes.description}
                      onChange={(event) =>
                        setNewRes({
                          ...newRes,
                          description:
                            event.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="create-contenu">
                      Contenu
                    </label>

                    <textarea
                      id="create-contenu"
                      className="input-field"
                      rows={5}
                      value={newRes.contenu}
                      onChange={(event) =>
                        setNewRes({
                          ...newRes,
                          contenu: event.target.value,
                        })
                      }
                    />
                  </div>

                  <CommuneSearch
                    ville={newRes.ville}
                    codePostal={newRes.codePostal}
                    onSelect={({ ville, codePostal }) =>
                      setNewRes({
                        ...newRes,
                        ville,
                        codePostal,
                      })
                    }
                  />

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Créer la ressource
                  </button>
                </form>
              )}

              {/* Formulaire de modification */}
              {editingRes && (
                <form
                  className="create-form edit-resource-form"
                  onSubmit={handleUpdateRessource}
                >
                  <div className="edit-resource-header">
                    <div>
                      <h3>Modifier la ressource</h3>
                      <p>
                        Modifiez les informations puis
                        enregistrez.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="edit-close"
                      onClick={handleCancelEdit}
                      aria-label="Fermer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="auth-row">
                    <div className="input-group">
                      <label htmlFor="edit-titre">
                        Titre
                      </label>

                      <input
                        id="edit-titre"
                        className="input-field"
                        value={editingRes.titre}
                        onChange={(event) =>
                          setEditingRes({
                            ...editingRes,
                            titre: event.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="edit-categorie">
                        Catégorie
                      </label>

                      <select
                        id="edit-categorie"
                        className="input-field"
                        value={editingRes.categorie}
                        onChange={(event) =>
                          setEditingRes({
                            ...editingRes,
                            categorie:
                              event.target.value,
                          })
                        }
                      >
                        <option value="psychologique">
                          Psychologique
                        </option>

                        <option value="sociale">
                          Sociale
                        </option>

                        <option value="financiere">
                          Financière
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="edit-description">
                      Description
                    </label>

                    <textarea
                      id="edit-description"
                      className="input-field edit-description"
                      rows={3}
                      value={editingRes.description}
                      onChange={(event) =>
                        setEditingRes({
                          ...editingRes,
                          description:
                            event.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="edit-contenu">
                      Contenu détaillé
                    </label>

                    <textarea
                      id="edit-contenu"
                      className="input-field edit-content"
                      rows={6}
                      value={editingRes.contenu}
                      onChange={(event) =>
                        setEditingRes({
                          ...editingRes,
                          contenu: event.target.value,
                        })
                      }
                    />
                  </div>

                  <CommuneSearch
                    ville={editingRes.ville}
                    codePostal={editingRes.codePostal}
                    onSelect={({ ville, codePostal }) =>
                     setEditingRes({
                          ...editingRes,
                              ville,
                              codePostal,
                     })
                   }
                  />

                  <label className="edit-validation">
                    <input
                      type="checkbox"
                      checked={editingRes.isValidated}
                      onChange={(event) =>
                        setEditingRes({
                          ...editingRes,
                          isValidated:
                            event.target.checked,
                        })
                      }
                    />

                    Ressource publiée
                  </label>

                  <div className="edit-resource-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleCancelEdit}
                    >
                      Annuler
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={savingResource}
                    >
                      {savingResource
                        ? 'Enregistrement...'
                        : 'Enregistrer les modifications'}
                    </button>
                  </div>
                </form>
              )}

              {resourceMessage && (
                <div
                  className={`resource-message ${resourceMessage.type}`}
                >
                  {resourceMessage.text}
                </div>
              )}

              <div className="admin-divider" />

              {/* Liste des ressources */}
              {ressources.map((ressource) => (
                <div
                  key={ressource.id}
                  className="admin-row"
                >
                  <span
                    className={`badge badge-${ressource.categorie}`}
                  >
                    {ressource.categorie}
                  </span>

                  <span className="admin-name">
                    {ressource.titre}
                  </span>

                  {ressource.ville && (
                    <span className="admin-location">
                      📍 {ressource.codePostal}{' '}
                      {ressource.ville}
                    </span>
                  )}

                  <div className="admin-actions">
                    <button
                      type="button"
                      className="btn btn-edit"
                      onClick={() =>
                        handleStartEdit(ressource)
                      }
                    >
                      Modifier
                    </button>

                    <button
                      type="button"
                      className={`btn ${
                        ressource.isValidated
                          ? 'btn-outline'
                          : 'btn-primary'
                      }`}
                      onClick={() =>
                        handleValidateRes(ressource.id)
                      }
                    >
                      {ressource.isValidated
                        ? 'Publié ✓'
                        : 'Valider'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() =>
                        handleDeleteRes(ressource.id)
                      }
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Demandes */}
{tab === 'demandes' && (
  <div className="card admin-card">
    <div className="admin-card-header">
      <div>
        <h2>Demandes d’aide</h2>

        <p className="admin-card-description">
          Filtrez et ouvrez une demande pour
          consulter son contenu et répondre à
          l’utilisateur.
        </p>
      </div>

      <span className="admin-demandes-result-count">
        {filteredDemandes.length}{' '}
        résultat
        {filteredDemandes.length > 1
          ? 's'
          : ''}
      </span>
    </div>

    {/* Filtres */}
    <div className="admin-demande-filters">
      <div className="admin-filter-field">
        <label htmlFor="filter-demande-status">
          Statut
        </label>

        <select
          id="filter-demande-status"
          value={demandeStatusFilter}
          onChange={(event) => {
            setDemandeStatusFilter(
              event.target.value
            );

            setOpenedDemandeId(null);
          }}
        >
          <option value="">
            Tous les statuts
          </option>

          {Object.entries(
            DEMANDE_STATUSES
          ).map(([value, label]) => (
            <option
              key={value}
              value={value}
            >
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-filter-field">
        <label htmlFor="filter-demande-category">
          Catégorie
        </label>

        <select
          id="filter-demande-category"
          value={demandeCategoryFilter}
          onChange={(event) => {
            setDemandeCategoryFilter(
              event.target.value
            );

            setOpenedDemandeId(null);
          }}
        >
          <option value="">
            Toutes les catégories
          </option>

          {DEMANDE_CATEGORIES.map(
            (categorie) => (
              <option
                key={categorie.value}
                value={categorie.value}
              >
                {categorie.label}
              </option>
            )
          )}
        </select>
      </div>

      {(demandeStatusFilter ||
        demandeCategoryFilter) && (
        <button
          type="button"
          className="admin-clear-filters"
          onClick={clearDemandeFilters}
        >
          ✕ Effacer les filtres
        </button>
      )}
    </div>

    <div className="admin-divider" />

    {demandes.length === 0 && (
      <div className="admin-empty">
        <span>📭</span>

        <h3>Aucune demande d’aide</h3>

        <p>
          Les demandes envoyées par les
          utilisateurs apparaîtront ici.
        </p>
      </div>
    )}

    {demandes.length > 0 &&
      filteredDemandes.length === 0 && (
        <div className="admin-empty">
          <span>🔍</span>

          <h3>Aucun résultat</h3>

          <p>
            Aucune demande ne correspond aux
            filtres sélectionnés.
          </p>

          <button
            type="button"
            className="btn btn-outline"
            onClick={clearDemandeFilters}
          >
            Effacer les filtres
          </button>
        </div>
      )}

    <div className="admin-demandes-list">
      {filteredDemandes.map((demande) => {
        const isOpened =
          openedDemandeId === demande.id;

        const categorie =
          demande.ressource?.categorie || '';

        return (
          <article
            className={`admin-demande ${
              isOpened
                ? 'admin-demande-opened'
                : ''
            }`}
            key={demande.id}
          >
            {/* Résumé de la demande */}
            <div className="admin-demande-summary">
              <div className="admin-demande-summary-content">
                <div className="admin-demande-badges">
                  <span
                    className={
                      `badge badge-${categorie}`
                    }
                  >
                    {categorie}
                  </span>

                  <span
                    className={
                      `admin-demande-status-badge ` +
                      `admin-status-${demande.statut.toLowerCase()}`
                    }
                  >
                    {DEMANDE_STATUSES[
                      demande.statut
                    ] || demande.statut}
                  </span>
                </div>

                <h3>
                  {demande.ressource?.titre}
                </h3>

                <div className="admin-demande-summary-info">
                  <span>
                    👤{' '}
                    {demande.utilisateur?.prenom}{' '}
                    {demande.utilisateur?.nom}
                  </span>

                  <span>
                    ✉️{' '}
                    {demande.utilisateur?.email}
                  </span>

                  <span>
                    📅{' '}
                    {new Date(
                      demande.createdAt.replace(
                        ' ',
                        'T'
                      )
                    ).toLocaleDateString(
                      'fr-FR',
                      {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      }
                    )}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={
                  isOpened
                    ? 'btn btn-outline'
                    : 'btn btn-primary'
                }
                onClick={() =>
                  setOpenedDemandeId(
                    isOpened
                      ? null
                      : demande.id
                  )
                }
              >
                {isOpened
                  ? 'Fermer'
                  : 'Ouvrir la demande'}
              </button>
            </div>

            {/* Détail ouvert */}
            {isOpened && (
              <div className="admin-demande-details">
                <div className="admin-demande-user">
                  <div>
                    <strong>
                      Utilisateur
                    </strong>

                    <span>
                      {demande.utilisateur?.prenom}{' '}
                      {demande.utilisateur?.nom}
                    </span>
                  </div>

                  <div>
                    <strong>
                      Adresse e-mail
                    </strong>

                    <span>
                      {demande.utilisateur?.email}
                    </span>
                  </div>

                  <div>
                    <strong>
                      Date d’envoi
                    </strong>

                    <span>
                      {new Date(
                        demande.createdAt.replace(
                          ' ',
                          'T'
                        )
                      ).toLocaleString(
                        'fr-FR'
                      )}
                    </span>
                  </div>
                </div>

                <div className="admin-demande-message">
                  <strong>
                    Message de l’utilisateur
                  </strong>

                  <p>
                    {demande.message}
                  </p>
                </div>

                <div className="admin-demande-management">
                  <div className="admin-filter-field">
                    <label
                      htmlFor={
                        `statut-${demande.id}`
                      }
                    >
                      Statut de la demande
                    </label>

                    <select
                      id={
                        `statut-${demande.id}`
                      }
                      className={
                        `admin-status ` +
                        `admin-status-${demande.statut.toLowerCase()}`
                      }
                      value={demande.statut}
                      onChange={(event) =>
                        handleDemandeChange(
                          demande.id,
                          'statut',
                          event.target.value
                        )
                      }
                    >
                      {Object.entries(
                        DEMANDE_STATUSES
                      ).map(
                        ([value, label]) => (
                          <option
                            key={value}
                            value={value}
                          >
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="admin-response-field">
                  <label
                    htmlFor={
                      `reponse-${demande.id}`
                    }
                  >
                    Réponse de l’équipe OnEstLà
                  </label>

                  <textarea
                    id={
                      `reponse-${demande.id}`
                    }
                    value={
                      demande.reponseAdmin || ''
                    }
                    placeholder="Exemple : Nous allons vous mettre en contact avec cette association..."
                    rows={5}
                    maxLength={3000}
                    onChange={(event) =>
                      handleDemandeChange(
                        demande.id,
                        'reponseAdmin',
                        event.target.value
                      )
                    }
                  />

                  <span className="admin-response-counter">
                    {
                      (
                        demande.reponseAdmin ||
                        ''
                      ).length
                    }
                    /3000
                  </span>
                </div>

                {demandeMessage?.id ===
                  demande.id && (
                  <div
                    className={
                      `admin-save-message ` +
                      `${demandeMessage.type}`
                    }
                  >
                    {demandeMessage.text}
                  </div>
                )}

                <div className="admin-demande-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={
                      savingDemande ===
                      demande.id
                    }
                    onClick={() =>
                      handleSaveDemande(
                        demande
                      )
                    }
                  >
                    {savingDemande ===
                    demande.id
                      ? 'Enregistrement...'
                      : 'Enregistrer la demande'}
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  </div>
)}
        </main>
      </div>
    </div>
  );
}
