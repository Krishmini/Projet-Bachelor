<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260825094830 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE demande_aide (id INT AUTO_INCREMENT NOT NULL, message LONGTEXT NOT NULL, statut VARCHAR(50) NOT NULL, reponse_admin LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, utilisateur_id INT NOT NULL, ressource_id INT NOT NULL, INDEX IDX_BE34F674FB88E14F (utilisateur_id), INDEX IDX_BE34F674FC6CD52A (ressource_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE ressource (id INT AUTO_INCREMENT NOT NULL, titre VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, contenu LONGTEXT DEFAULT NULL, categorie VARCHAR(50) NOT NULL, is_validated TINYINT NOT NULL, created_at DATETIME NOT NULL, ville VARCHAR(150) DEFAULT NULL, code_postal VARCHAR(10) DEFAULT NULL, created_by_id INT DEFAULT NULL, INDEX IDX_939F4544B03A8386 (created_by_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, nom VARCHAR(100) NOT NULL, prenom VARCHAR(100) NOT NULL, is_verified TINYINT NOT NULL, is_active TINYINT DEFAULT 1 NOT NULL, created_at DATETIME NOT NULL, reset_token VARCHAR(255) DEFAULT NULL, reset_token_expires_at DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_8D93D649E7927C74 (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL, available_at DATETIME NOT NULL, delivered_at DATETIME DEFAULT NULL, INDEX IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750 (queue_name, available_at, delivered_at, id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE demande_aide ADD CONSTRAINT FK_BE34F674FB88E14F FOREIGN KEY (utilisateur_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE demande_aide ADD CONSTRAINT FK_BE34F674FC6CD52A FOREIGN KEY (ressource_id) REFERENCES ressource (id)');
        $this->addSql('ALTER TABLE ressource ADD CONSTRAINT FK_939F4544B03A8386 FOREIGN KEY (created_by_id) REFERENCES `user` (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE demande_aide DROP FOREIGN KEY FK_BE34F674FB88E14F');
        $this->addSql('ALTER TABLE demande_aide DROP FOREIGN KEY FK_BE34F674FC6CD52A');
        $this->addSql('ALTER TABLE ressource DROP FOREIGN KEY FK_939F4544B03A8386');
        $this->addSql('DROP TABLE demande_aide');
        $this->addSql('DROP TABLE ressource');
        $this->addSql('DROP TABLE `user`');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
