<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientPortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_register_and_access_their_profile(): void
    {
        $response = $this->postJson('/api/client/register', [
            'name' => 'Jamie Client',
            'email' => 'jamie@example.com',
            'contact_number' => '09123456789',
            'address' => 'Barangay Central',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.role', 'client')
            ->assertJsonPath('data.user.name', 'Jamie Client');

        $this->withToken($response->json('data.token'))
            ->getJson('/api/client/profile')
            ->assertOk()
            ->assertJsonPath('data.email', 'jamie@example.com');
    }

    public function test_client_requests_are_linked_to_the_authenticated_client(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $service = Service::create([
            'service_name' => 'Medical Assistance',
            'description' => 'Medical aid',
            'requirements' => 'Valid ID',
            'is_active' => true,
        ]);

        $this->withToken($client->createToken('test-client')->plainTextToken)
            ->postJson('/api/client/service-requests', [
                'service_id' => $service->id,
                'applicant_name' => $client->name,
                'contact_number' => '09123456789',
                'email' => $client->email,
                'address' => 'Barangay Central',
                'description' => 'Requesting assistance.',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('service_requests', [
            'user_id' => $client->id,
            'service_id' => $service->id,
        ]);
    }

    public function test_clients_cannot_create_announcements(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $this->withToken($client->createToken('test-client')->plainTextToken)
            ->postJson('/api/admin/announcements', [
                'title' => 'Client notice',
                'content' => 'This should not be allowed.',
                'is_published' => true,
            ])
            ->assertForbidden();
    }

    public function test_admin_can_publish_announcements_for_clients(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $adminToken = $admin->createToken('test-admin')->plainTextToken;
        $this->withToken($adminToken)
            ->postJson('/api/admin/announcements', [
                'title' => 'Office schedule',
                'content' => 'The office will be open on Monday.',
                'is_published' => false,
            ])
            ->assertCreated();

        $this->getJson('/api/announcements')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->withToken($adminToken)
            ->putJson('/api/admin/announcements/1', ['is_published' => true])
            ->assertOk();

        $this->getJson('/api/announcements')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Office schedule');
    }
}
