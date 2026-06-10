<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParametresController extends Controller
{
    public function index()
    {
        return Inertia::render('DEE/Parametres/Index', [
            'settings' => [
                'mail_username'   => Setting::get('mail_username'),
                'mail_from_name'  => Setting::get('mail_from_name', 'ANEAQ'),
                'mail_host'       => Setting::get('mail_host', 'smtp.gmail.com'),
                'mail_port'       => Setting::get('mail_port', '587'),
                'mail_encryption' => Setting::get('mail_encryption', 'tls'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'mail_email'      => 'required|email|max:255',
            'mail_from_name'  => 'required|string|max:100',
            'mail_password'   => 'nullable|string|max:255',
            'mail_host'       => 'required|string|max:100',
            'mail_port'       => 'required|integer',
            'mail_encryption' => 'required|in:tls,ssl,none',
        ]);

        $email      = $validated['mail_email'];
        $name       = $validated['mail_from_name'];
        $host       = $validated['mail_host'];
        $port       = (string) $validated['mail_port'];
        $encryption = $validated['mail_encryption'];
        $password   = !empty($validated['mail_password'])
            ? $validated['mail_password']
            : Setting::get('mail_password');

        // 1. Save to DB
        Setting::set('mail_username',     $email);
        Setting::set('mail_from_address', $email);
        Setting::set('mail_from_name',    $name);
        Setting::set('mail_host',         $host);
        Setting::set('mail_port',         $port);
        Setting::set('mail_encryption',   $encryption);
        if (!empty($validated['mail_password'])) {
            Setting::set('mail_password', $password);
        }

        // 2. Write to .env so changes persist across server restarts
        $this->updateEnv([
            'MAIL_USERNAME'     => $email,
            'MAIL_FROM_ADDRESS' => $email,
            'MAIL_FROM_NAME'    => $name,
            'MAIL_HOST'         => $host,
            'MAIL_PORT'         => $port,
            'MAIL_ENCRYPTION'   => $encryption,
            'MAIL_PASSWORD'     => $password,
        ]);

        // 3. Apply immediately for this request (and future requests via AppServiceProvider)
        config([
            'mail.from.address'            => $email,
            'mail.from.name'               => $name,
            'mail.mailers.smtp.username'   => $email,
            'mail.mailers.smtp.password'   => $password,
            'mail.mailers.smtp.host'       => $host,
            'mail.mailers.smtp.port'       => (int) $port,
            'mail.mailers.smtp.encryption' => $encryption !== 'none' ? $encryption : null,
        ]);

        return back()->with('success', 'Paramètres email mis à jour avec succès. Les emails seront envoyés depuis ' . $email . '.');
    }

    private function updateEnv(array $values): void
    {
        $envPath = base_path('.env');

        if (!file_exists($envPath)) {
            return;
        }

        $content = file_get_contents($envPath);

        foreach ($values as $key => $value) {
            // Always wrap in double quotes — safe for all values including spaces and apostrophes
            // Do NOT use addslashes: .env double-quoted strings don't need backslash escaping
            $formatted = '"' . str_replace('"', '\\"', $value) . '"';

            if (preg_match("/^{$key}=.*/m", $content)) {
                $content = preg_replace("/^{$key}=.*/m", "{$key}={$formatted}", $content);
            } else {
                $content .= "\n{$key}={$formatted}";
            }
        }

        file_put_contents($envPath, $content);
    }
}
