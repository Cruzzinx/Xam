<?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;


    return new class extends Migration
    {
        public function up()
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->text('prompt');
            $table->json('options');
            $table->string('answer');
            $table->integer('score')->default(1);
            $table->timestamps();
        });
    }


    public function down()
    {
        Schema::dropIfExists('questions');
    }
};
