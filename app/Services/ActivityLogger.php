<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class ActivityLogger
{
    public static function log(string $action, string $description, ?object $model = null, ?array $details = null): void
    {
        try {
            $user = Auth::user();

            ActivityLog::create([
                'user_id'      => $user?->id,
                'performed_by' => $user?->name ?? $user?->email ?? 'Système',
                'role'         => $user?->role ?? 'system',
                'action'       => $action,
                'description'  => $description,
                'model_type'   => $model ? get_class($model) : null,
                'model_id'     => $model?->id,
                'model_name'   => self::modelName($model),
                'details'      => $details ? json_encode($details, JSON_UNESCAPED_UNICODE) : null,
            ]);
        } catch (\Throwable) {
            // Ne jamais crasher l'application à cause du logging
        }
    }

    private static function modelName(?object $model): ?string
    {
        if (!$model) return null;

        return $model->reference
            ?? $model->nom
            ?? $model->name
            ?? $model->titre
            ?? $model->email
            ?? ('#' . $model->id);
    }
}
