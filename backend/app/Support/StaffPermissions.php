<?php

namespace App\Support;

class StaffPermissions
{
    public const MODULES = [
        'dashboard' => ['view' => true],
        'requests' => ['view' => true, 'manage' => true],
        'services' => ['view' => true, 'manage' => true],
        'documents' => ['view' => true, 'manage' => true],
        'tracking' => ['view' => true],
        'appointments' => ['view' => true, 'manage' => true],
    ];

    public static function defaults(): array
    {
        return self::MODULES;
    }

    public static function normalize(?array $permissions): array
    {
        $normalized = self::defaults();

        foreach (self::MODULES as $module => $abilities) {
            if ($module === 'dashboard' || !isset($permissions[$module])) {
                continue;
            }

            foreach ($abilities as $ability => $default) {
                $normalized[$module][$ability] = (bool) (
                    $permissions[$module][$ability] ?? $default
                );
            }

            if (isset($normalized[$module]['manage'])) {
                $normalized[$module]['manage'] = $normalized[$module]['manage']
                    && $normalized[$module]['view'];
            }
        }

        if (!$normalized['requests']['view']) {
            $normalized['appointments']['manage'] = false;
        }

        return $normalized;
    }

    public static function allows(?array $permissions, string $module, string $ability): bool
    {
        if (!array_key_exists($module, self::MODULES)
            || !array_key_exists($ability, self::MODULES[$module])) {
            return false;
        }

        if ($permissions === null) {
            return true;
        }

        return ($permissions[$module][$ability] ?? false) === true;
    }
}
