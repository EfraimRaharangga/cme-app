<?php

use App\Http\Controllers\AtpController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GudangController;
use App\Http\Controllers\InstructionController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SurveyController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Guest Authentication Routes
Route::get('/', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Authenticated Routes (Session-protected via CustomAuthMiddleware)
Route::middleware('custom_auth')->group(function () {
    // Temporary Upload Route
    Route::post('/api/upload-temp', [App\Http\Controllers\MediaController::class, 'uploadTemp']);
    Route::post('/api/upload-temp-doc', [App\Http\Controllers\MediaController::class, 'uploadTempDoc']);

    // Dashboards
    Route::get('/dashboard', [DashboardController::class, 'cmeDashboard']);
    Route::get('/atp', [DashboardController::class, 'atpDashboard']);

    // ODC Survey Module
    Route::get('/survey', [DashboardController::class, 'surveyDashboard']);
    Route::get('/survey/baru', [SurveyController::class, 'create']);
    Route::post('/survey/baru', [SurveyController::class, 'store']);
    Route::get('/survey/custom', [SurveyController::class, 'custom']);
    Route::post('/survey/custom', [SurveyController::class, 'storeTemplate']);
    Route::delete('/survey/custom/{id}', [SurveyController::class, 'deleteTemplate']);
    Route::get('/survey/{id}', [SurveyController::class, 'detail']);
    Route::get('/survey/{id}/edit', [SurveyController::class, 'edit']);
    Route::post('/survey/{id}/edit', [SurveyController::class, 'update']);
    Route::delete('/survey/{id}', [SurveyController::class, 'delete']);
    Route::get('/survey/{id}/print', [SurveyController::class, 'print']);

    // ATP Module
    Route::get('/atp/baru', [AtpController::class, 'create']);
    Route::post('/atp/baru', [AtpController::class, 'store']);
    Route::get('/atp/custom', [AtpController::class, 'custom']);
    Route::post('/atp/custom', [AtpController::class, 'storeTemplate']);
    Route::delete('/atp/custom/{id}', [AtpController::class, 'deleteTemplate']);
    Route::get('/atp/{id}', [AtpController::class, 'detail']);
    Route::get('/atp/{id}/edit', [AtpController::class, 'edit']);
    Route::post('/atp/{id}/edit', [AtpController::class, 'update']);
    Route::delete('/atp/{id}', [AtpController::class, 'delete']);
    Route::get('/atp/{id}/print', [AtpController::class, 'print']);
    
    // BAL and BASTP print pages
    Route::get('/atp/{id}/bal', [AtpController::class, 'printBal']);
    Route::post('/atp/{id}/bal', [AtpController::class, 'saveBal']);
    Route::delete('/atp/{id}/bal', [AtpController::class, 'deleteBal']);
    Route::get('/atp/{id}/bastp', [AtpController::class, 'printBastp']);
    Route::post('/atp/{id}/bastp', [AtpController::class, 'saveBastp']);
    Route::delete('/atp/{id}/bastp', [AtpController::class, 'deleteBastp']);

    // Warehouse Inventory Module
    Route::get('/gudang', [GudangController::class, 'index']);
    Route::post('/gudang/kategori', [GudangController::class, 'storeKategori']);
    Route::post('/gudang/tipe', [GudangController::class, 'storeTipe']);
    Route::post('/gudang/masuk', [GudangController::class, 'storeMasuk']);
    Route::post('/gudang/keluar', [GudangController::class, 'storeKeluar']);
    Route::get('/gudang/history', [GudangController::class, 'history']);
    Route::get('/gudang/masuk-history/{id}', [GudangController::class, 'masukDetail']);
    Route::get('/gudang/keluar-history/{id}', [GudangController::class, 'keluarDetail']);

    // Scope of Work Spec Guides Reference Module
    Route::get('/instruction', [InstructionController::class, 'index']);
    Route::get('/instruction/{kategori}', [InstructionController::class, 'showItem']);

    // Admin Users Management (admin role checks inside controllers)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::post('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'delete']);
    Route::get('/users-logs', [UserController::class, 'logs']);

    // User Profile Module
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);
});
