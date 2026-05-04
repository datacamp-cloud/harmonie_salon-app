<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Archive extends Model
{
    public $timestamps = false;

    protected $fillable = ['type', 'reference_id', 'data', 'deleted_by', 'deleted_at'];

    protected $casts = [
        'data'       => 'array',
        'deleted_at' => 'datetime',
    ];

    public function deletedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    // Helper statique pour archiver n'importe quel model
    public static function archiver(string $type, Model $model, ?int $userId = null): void
    {
        static::create([
            'type'         => $type,
            'reference_id' => $model->id,
            'data'         => $model->toArray(),
            'deleted_by'   => $userId ?? auth()->id(),
            'deleted_at'   => now(),
        ]);
    }
}
