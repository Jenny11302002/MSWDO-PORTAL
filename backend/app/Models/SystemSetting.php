<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['settings'])]
class SystemSetting extends Model
{
    protected function casts(): array
    {
        return ['settings' => 'array'];
    }

    public static function defaults(): array
    {
        return [
            'office' => [
                'name' => 'Municipal Social Welfare and Development Office',
                'address' => '',
                'email' => '',
                'phone' => '',
            ],
            'reports' => [
                'default_period' => '30',
            ],
            'notifications' => [
                'email_enabled' => false,
                'sms_enabled' => false,
                'email_recipient' => '',
                'sms_recipient' => '',
            ],
        ];
    }

    public static function current(): self
    {
        return self::query()->firstOrCreate(
            ['id' => 1],
            ['settings' => self::defaults()]
        );
    }
}
