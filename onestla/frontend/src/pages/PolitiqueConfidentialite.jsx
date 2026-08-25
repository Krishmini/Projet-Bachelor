import './Legal.css';

export default function PolitiqueConfidentialite() {
  return (
    <main className="legal-page">
      <article className="container legal-card">
        <h1>Politique de confidentialité</h1>

        <h2>Données collectées</h2>
        <p>
          OnEstLà peut collecter votre nom, prénom, adresse e-mail,
          messages de contact, demandes d’aide et réponses associées.
        </p>

        <h2>Finalités</h2>
        <ul>
          <li>créer et sécuriser votre compte ;</li>
          <li>traiter vos demandes d’aide ;</li>
          <li>répondre aux messages envoyés depuis le formulaire ;</li>
          <li>assurer l’administration et la sécurité du service.</li>
        </ul>

        <h2>Accès aux données</h2>
        <p>
          Les données sont accessibles uniquement à l’utilisateur concerné
          et aux administrateurs autorisés, dans la limite nécessaire au
          traitement de la demande.
        </p>

        <h2>Conservation</h2>
        <p>
          Les données sont conservées pendant la durée nécessaire au
          fonctionnement du compte et au traitement des demandes. Elles
          sont supprimées lorsque le compte est supprimé, sauf obligation
          légale contraire.
        </p>

        <h2>Services externes</h2>
        <p>
          La recherche de villes utilise Geo API Gouv. L’application peut
          également utiliser un service d’envoi d’e-mails. Le jeton de
          connexion JWT et les informations de session sont conservés dans
          le stockage local du navigateur.
        </p>

        <h2>Vos droits</h2>
        <p>
          Vous pouvez demander l’accès, la rectification ou la suppression
          de vos données depuis votre profil ou en utilisant la page Contact.
        </p>

        <p>Dernière mise à jour : 23 août 2026.</p>
      </article>
    </main>
  );
}
