<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260530181358 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE contact DROP FOREIGN KEY `FK_4C62E638FC6CD52A`');
        $this->addSql('DROP TABLE contact');
        $this->addSql('ALTER TABLE ressource DROP FOREIGN KEY `FK_939F45446AF12ED9`');
        $this->addSql('DROP INDEX IDX_939F45446AF12ED9 ON ressource');
        $this->addSql('ALTER TABLE ressource ADD contenu LONGTEXT DEFAULT NULL, DROP localisation, DROP telephone, DROP site_web, DROP date_validation, CHANGE type categorie VARCHAR(50) NOT NULL, CHANGE valide_par_id created_by_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE ressource ADD CONSTRAINT FK_939F4544B03A8386 FOREIGN KEY (created_by_id) REFERENCES `user` (id)');
        $this->addSql('CREATE INDEX IDX_939F4544B03A8386 ON ressource (created_by_id)');
        $this->addSql('ALTER TABLE user ADD is_verified TINYINT NOT NULL, CHANGE mot_de_passe password VARCHAR(255) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE contact (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(100) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_general_ci`, prenom VARCHAR(100) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_general_ci`, email VARCHAR(180) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_general_ci`, sujet VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_general_ci`, message LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_general_ci`, date_envoi DATETIME NOT NULL, is_read TINYINT NOT NULL, ressource_id INT DEFAULT NULL, INDEX IDX_4C62E638FC6CD52A (ressource_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_general_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE contact ADD CONSTRAINT `FK_4C62E638FC6CD52A` FOREIGN KEY (ressource_id) REFERENCES ressource (id)');
        $this->addSql('ALTER TABLE ressource DROP FOREIGN KEY FK_939F4544B03A8386');
        $this->addSql('DROP INDEX IDX_939F4544B03A8386 ON ressource');
        $this->addSql('ALTER TABLE ressource ADD localisation VARCHAR(255) DEFAULT NULL, ADD telephone VARCHAR(255) DEFAULT NULL, ADD site_web VARCHAR(255) DEFAULT NULL, ADD date_validation DATETIME DEFAULT NULL, DROP contenu, CHANGE categorie type VARCHAR(50) NOT NULL, CHANGE created_by_id valide_par_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE ressource ADD CONSTRAINT `FK_939F45446AF12ED9` FOREIGN KEY (valide_par_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_939F45446AF12ED9 ON ressource (valide_par_id)');
        $this->addSql('ALTER TABLE `user` DROP is_verified, CHANGE password mot_de_passe VARCHAR(255) NOT NULL');
    }
}
