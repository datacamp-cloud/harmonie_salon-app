<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recette extends Model
{
    protected $fillable = ['date', 'prestation_id', 'client_id', 'user_id', 'prix_applique', 'notes', 'is_validated'];
    protected $casts = ['date' => 'date', 'prix_applique' => 'float', 'is_validated' => 'boolean'];

    public function prestation(): BelongsTo
    {
        return $this->belongsTo(Prestation::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
