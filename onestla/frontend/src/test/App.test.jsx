import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RessourceCard from '../components/RessourceCard'
import Connexion from '../pages/Connexion'
import { AuthProvider } from '../context/AuthContext'

// ── Mock axios/api ────────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  login: vi.fn(),
  getMe: vi.fn(),
  getRessources: vi.fn(() => Promise.resolve({ data: [] })),
  sendContact: vi.fn(),
  register: vi.fn(),
  updateProfile: vi.fn(),
  adminGetUsers: vi.fn(() => Promise.resolve({ data: [] })),
  adminGetRessources: vi.fn(() => Promise.resolve({ data: [] })),
  adminValidateUser: vi.fn(),
  adminDeleteUser: vi.fn(),
  adminValidateRessource: vi.fn(),
  adminDeleteRessource: vi.fn(),
  adminCreateRessource: vi.fn(),
}))

const mockRessource = {
  id: 1,
  titre: 'Soutien psychologique',
  description: 'Besoin de parler ? Des professionnels sont disponibles.',
  categorie: 'psychologique',
  isValidated: true,
  createdAt: '2025-01-01',
}

// ── RessourceCard ─────────────────────────────────────────────────────────────
describe('RessourceCard', () => {
  it('affiche le titre de la ressource', () => {
    render(
      <MemoryRouter>
        <RessourceCard ressource={mockRessource} />
      </MemoryRouter>
    )
    expect(screen.getByText('Soutien psychologique')).toBeInTheDocument()
  })

  it('affiche la description', () => {
    render(
      <MemoryRouter>
        <RessourceCard ressource={mockRessource} />
      </MemoryRouter>
    )
    expect(screen.getByText(/professionnels sont disponibles/)).toBeInTheDocument()
  })

  it('affiche le badge de catégorie', () => {
    render(
      <MemoryRouter>
        <RessourceCard ressource={mockRessource} />
      </MemoryRouter>
    )
    expect(screen.getByText('psychologique')).toBeInTheDocument()
  })

  it('affiche le lien Voir détails', () => {
    render(
      <MemoryRouter>
        <RessourceCard ressource={mockRessource} />
      </MemoryRouter>
    )
    expect(screen.getByText('Voir détails')).toBeInTheDocument()
  })

  it('lien pointe vers /ressources/:id', () => {
    render(
      <MemoryRouter>
        <RessourceCard ressource={mockRessource} />
      </MemoryRouter>
    )
    const link = screen.getByRole('link', { name: /voir détails/i })
    expect(link).toHaveAttribute('href', '/ressources/1')
  })
})

// ── Connexion page ────────────────────────────────────────────────────────────
describe('Connexion', () => {
  it('affiche le formulaire de connexion', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Connexion />
        </AuthProvider>
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText('votre@email.fr')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByText('Se connecter')).toBeInTheDocument()
  })

  it('affiche un lien vers la page inscription', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Connexion />
        </AuthProvider>
      </MemoryRouter>
    )
    expect(screen.getByText('Créer un compte')).toBeInTheDocument()
  })

  it('affiche une erreur en cas de mauvais identifiants', async () => {
    const { login } = await import('../services/api')
    login.mockRejectedValueOnce({
      response: { data: { message: 'Email ou mot de passe incorrect.' } },
    })

    render(
      <MemoryRouter>
        <AuthProvider>
          <Connexion />
        </AuthProvider>
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('votre@email.fr'), {
      target: { value: 'test@test.fr' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'mauvais' },
    })
    fireEvent.click(screen.getByText('Se connecter'))

    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect.')).toBeInTheDocument()
    })
  })
})

// ── RessourceCard – toutes catégories ────────────────────────────────────────
describe('RessourceCard – catégories', () => {
  const cats = ['psychologique', 'sociale', 'financiere']
  cats.forEach((cat) => {
    it(`affiche l'icône correcte pour ${cat}`, () => {
      const r = { ...mockRessource, categorie: cat }
      render(<MemoryRouter><RessourceCard ressource={r} /></MemoryRouter>)
      expect(screen.getByText(cat)).toBeInTheDocument()
    })
  })
})
