import './Legal.css';

export default function MentionsLegales() {
  return (
    <main className="legal-page">
      <article className="container legal-card">
        <h1>Mentions légales</h1>

        <h2>Éditeur du site</h2>
        <p>
          OnEstLà est un projet pédagogique réalisé dans le cadre
          d’une formation en développement informatique.
        </p>
        <p>
          Responsable de publication : <strong>Krishmini Kulakrishna</strong><br />
          Contact : <strong>krimini2005@gmail.com</strong>
        </p>


        <h2>Propriété intellectuelle</h2>
        <p>
          Les contenus, textes, éléments graphiques et développements
          présents sur OnEstLà ne peuvent pas être reproduits sans
          autorisation. Les marques et contenus appartenant à des tiers
          restent la propriété de leurs auteurs respectifs.
        </p>

        <h2>Responsabilité</h2>
        <p>
          Les informations affichées sont fournies à titre indicatif.
          OnEstLà ne remplace ni un professionnel de santé, ni un service
          social, ni un service d’urgence.
        </p>

        <div className="legal-warning">
          <strong>Urgence :</strong> appelez le 15, le 112 ou le 3114
          en cas de détresse ou de danger immédiat.
        </div><br></br><br></br>
      </article>
    </main>
  );
}
