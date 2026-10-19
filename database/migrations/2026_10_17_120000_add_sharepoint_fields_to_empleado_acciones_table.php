<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empleado_acciones', function (Blueprint $table) {
            $table->unsignedBigInteger('sharepoint_id')->nullable()->after('id');
            $table->string('sharepoint_guid', 36)->nullable()->after('sharepoint_id');
            $table->enum('origen', ['manual', 'sharepoint'])->default('manual')->after('sharepoint_guid');
            $table->string('pais', 2)->nullable()->after('observaciones');

            $table->unique('sharepoint_id');
            $table->index('origen');
        });
    }

    public function down(): void
    {
        Schema::table('empleado_acciones', function (Blueprint $table) {
            $table->dropUnique(['sharepoint_id']);
            $table->dropIndex(['origen']);
            $table->dropColumn(['sharepoint_id', 'sharepoint_guid', 'origen', 'pais']);
        });
    }
};