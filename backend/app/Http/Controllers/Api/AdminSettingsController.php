<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminSettingsController extends Controller
{
    public function publicProfile()
    {
        $settings = array_replace_recursive(
            SystemSetting::defaults(),
            SystemSetting::current()->settings ?? []
        );

        return response()->json([
            'success' => true,
            'data' => $settings['office'],
        ]);
    }

    public function show()
    {
        $settings = array_replace_recursive(
            SystemSetting::defaults(),
            SystemSetting::current()->settings ?? []
        );

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'office' => 'required|array:name,address,email,phone',
            'office.name' => 'required|string|max:255',
            'office.address' => 'nullable|string|max:1000',
            'office.email' => 'nullable|email|max:255',
            'office.phone' => 'nullable|string|max:30',
            'reports' => 'required|array:default_period',
            'reports.default_period' => 'required|in:30,90,365,all',
            'notifications' => 'required|array:email_enabled,sms_enabled,email_recipient,sms_recipient',
            'notifications.email_enabled' => 'required|boolean',
            'notifications.sms_enabled' => 'required|boolean',
            'notifications.email_recipient' => [
                'nullable',
                Rule::requiredIf(
                    fn () => $request->boolean('notifications.email_enabled')
                ),
                'email',
                'max:255',
            ],
            'notifications.sms_recipient' => [
                'nullable',
                Rule::requiredIf(
                    fn () => $request->boolean('notifications.sms_enabled')
                ),
                'string',
                'max:30',
            ],
        ]);

        $settings = SystemSetting::current();
        $settings->settings = $validated;
        $settings->save();

        return response()->json([
            'success' => true,
            'message' => 'System settings saved successfully.',
            'data' => $settings->settings,
        ]);
    }
}
