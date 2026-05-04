<?php

namespace App\Http\Controllers;

use App\Models\Archive;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;

trait Archivable
{
    protected function archiverEtSupprimer(string $type, Model $model): JsonResponse
    {
        Archive::archiver($type, $model);
        $model->delete();

        return response()->json(['message' => ucfirst($type) . ' supprime et archive.']);
    }
}
