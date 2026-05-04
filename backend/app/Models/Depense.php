<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Depense extends Model
{
    protected $fillable = ['date', 'charge_id', 'user_id', 'montant', 'notes', 'is_validated'];
    protected $casts = ['date' => 'date', 'montant' => 'float', 'is_validated' => 'boolean'];

    public function charge(): BelongsTo
    {
        return $this->belongsTo(Charge::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
