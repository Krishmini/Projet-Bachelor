<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ApiTest extends WebTestCase
{
    // ── Ressources publiques ──────────────────────────────────────────────────

    public function testGetRessourcesPublic(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/ressources');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('Content-Type', 'application/json');

        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
    }

    public function testGetRessourcesFilterByCategorie(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/ressources?categorie=psychologique');

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($data);

        foreach ($data as $r) {
            $this->assertEquals('psychologique', $r['categorie']);
        }
    }

    // ── Inscription ───────────────────────────────────────────────────────────

    public function testRegisterSuccess(): void
    {
        $client = static::createClient();
        $client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email'    => 'test_' . uniqid() . '@example.com',
                'password' => 'Test1234!',
                'nom'      => 'Test',
                'prenom'   => 'User',
            ])
        );

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('user', $data);
    }

    public function testRegisterMissingFields(): void
    {
        $client = static::createClient();
        $client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'incomplete@example.com'])
        );

        $this->assertResponseStatusCodeSame(400);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public function testLoginSuccess(): void
    {
        $client = static::createClient();

        // On utilise le compte admin créé par les fixtures
        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email'    => 'admin@onestla.fr',
                'password' => 'admin1234',
            ])
        );

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('token', $data);
    }

    public function testLoginWrongPassword(): void
    {
        $client = static::createClient();
        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email'    => 'admin@onestla.fr',
                'password' => 'mauvais_mdp',
            ])
        );

        $this->assertResponseStatusCodeSame(401);
    }

    // ── Endpoint protégé sans JWT ─────────────────────────────────────────────

    public function testMeWithoutToken(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/me');

        $this->assertResponseStatusCodeSame(401);
    }

    // ── Admin sans token ──────────────────────────────────────────────────────

    public function testAdminEndpointWithoutToken(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/admin/ressources');

        $this->assertResponseStatusCodeSame(401);
    }

    // ── Contact ───────────────────────────────────────────────────────────────

    public function testContactSuccess(): void
    {
        $client = static::createClient();
        $client->request(
            'POST',
            '/api/contact',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nom'     => 'Jean',
                'prenom'  => 'Test',
                'sujet'   => 'Question',
                'message' => 'Bonjour, je voudrais en savoir plus.',
            ])
        );

        $this->assertResponseIsSuccessful();
    }

    public function testContactMissingFields(): void
    {
        $client = static::createClient();
        $client->request(
            'POST',
            '/api/contact',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['nom' => 'Jean'])
        );

        $this->assertResponseStatusCodeSame(400);
    }
}
