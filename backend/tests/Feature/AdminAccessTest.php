<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_settings_are_saved_and_require_admin_access(): void
    {
        $this->getJson('/api/office-profile')
            ->assertOk()
            ->assertJsonPath(
                'data.name',
                'Municipal Social Welfare and Development Office'
            );

        $staff = User::factory()->create([
            'role' => 'staff',
            'is_active' => true,
        ]);
        Sanctum::actingAs($staff);

        $this->getJson('/api/admin/settings')->assertForbidden();

        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);
        Sanctum::actingAs($admin);

        $payload = [
            'office' => [
                'name' => 'MSWDO Test Office',
                'address' => 'Municipal Hall',
                'email' => 'office@example.test',
                'phone' => '09123456789',
            ],
            'reports' => ['default_period' => '90'],
            'notifications' => [
                'email_enabled' => true,
                'sms_enabled' => false,
                'email_recipient' => 'reports@example.test',
                'sms_recipient' => '',
            ],
        ];

        $this->putJson('/api/admin/settings', $payload)
            ->assertOk()
            ->assertJsonPath('data.reports.default_period', '90');

        $this->getJson('/api/admin/settings')
            ->assertOk()
            ->assertJsonPath('data.office.name', 'MSWDO Test Office')
            ->assertJsonPath('data.notifications.email_enabled', true);

        $payload['notifications']['email_recipient'] = '';
        $this->putJson('/api/admin/settings', $payload)
            ->assertUnprocessable();
    }

    public function test_staff_without_module_view_permission_is_denied(): void
    {
        $staff = User::factory()->create([
            'role' => 'staff',
            'is_active' => true,
            'permissions' => [
                'dashboard' => ['view' => true],
                'requests' => ['view' => false, 'manage' => false],
                'documents' => ['view' => false, 'manage' => false],
            ],
        ]);
        Sanctum::actingAs($staff);

        $this->getJson('/api/service-requests')->assertForbidden();
        $this->getJson('/api/staff/documents')->assertForbidden();
        $this->getJson('/api/staff/dashboard')
            ->assertOk()
            ->assertJsonPath('data.recent_requests', []);
    }

    public function test_staff_cannot_manage_a_module_without_manage_permission(): void
    {
        $staff = User::factory()->create([
            'role' => 'staff',
            'is_active' => true,
            'permissions' => [
                'dashboard' => ['view' => true],
                'services' => ['view' => true, 'manage' => false],
            ],
        ]);
        Sanctum::actingAs($staff);

        $this->postJson('/api/services', [])->assertForbidden();
    }

    public function test_admin_can_update_staff_module_permissions(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);
        $staff = User::factory()->create([
            'role' => 'staff',
            'is_active' => true,
        ]);
        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/staff-users/{$staff->id}", [
            'role' => 'staff',
            'permissions' => [
                'dashboard' => ['view' => true],
                'requests' => ['view' => false, 'manage' => false],
                'services' => ['view' => true, 'manage' => false],
                'appointments' => ['view' => true, 'manage' => true],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.permissions.requests.view', false)
            ->assertJsonPath('data.permissions.appointments.manage', false);
    }

    public function test_appointment_management_requires_request_view_access(): void
    {
        $staff = User::factory()->create([
            'role' => 'staff',
            'is_active' => true,
            'permissions' => [
                'dashboard' => ['view' => true],
                'requests' => ['view' => false, 'manage' => false],
                'appointments' => ['view' => true, 'manage' => true],
            ],
        ]);
        Sanctum::actingAs($staff);

        $this->postJson('/api/appointments', [])->assertForbidden();
    }
}
