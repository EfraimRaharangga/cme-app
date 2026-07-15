<?php

namespace App\Http\Controllers;

use App\Models\AtpRecord;
use App\Models\GudangBarang;
use App\Models\Survey;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function cmeDashboard(Request $request): Response
    {
        $role = $request->session()->get('role');
        if ($role !== 'admin' && $role !== 'staff_cme') {
            return redirect('/survey');
        }

        $userId = $request->session()->get('user_id');

        $totalAtp = AtpRecord::count();
        $totalSurvey = Survey::count();
        $totalBarang = GudangBarang::sum('stok') ?? 0;
        $totalUsers = User::count();

        $accept = AtpRecord::where('verdict', 'ACCEPT')->count();
        $pending = AtpRecord::where(function ($q) {
            $q->where('verdict', '')->orWhereNull('verdict');
        })->count();

        $recentAtp = AtpRecord::orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'nama_site', 'tanggal', 'verdict']);

        return Inertia::render('Dashboard/CmeDashboard', [
            'stats' => [
                'totalAtp' => $totalAtp,
                'totalSurvey' => $totalSurvey,
                'totalBarang' => $totalBarang,
                'totalUsers' => $totalUsers,
                'accept' => $accept,
                'pending' => $pending,
                'mySurveyCount' => Survey::where('created_by', $userId)->count(),
            ],
            'recentAtp' => $recentAtp,
        ]);
    }

    public function surveyDashboard(Request $request): Response
    {
        $role = $request->session()->get('role');
        $userId = $request->session()->get('user_id');

        $query = Survey::query();
        if ($role === 'vendor') {
            $query->where('created_by', $userId);
        }

        $total = (clone $query)->count();
        $mine = Survey::where('created_by', $userId)->count();
        $totalUsers = User::count();

        $recent = $query->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard/SurveyDashboard', [
            'stats' => [
                'total' => $total,
                'mine' => $mine,
                'users' => $totalUsers,
            ],
            'recent' => $recent,
        ]);
    }

    public function atpDashboard(Request $request): Response
    {
        $role = $request->session()->get('role');
        $userId = $request->session()->get('user_id');

        if ($role !== 'admin' && $role !== 'staff_cme' && $role !== 'vendor') {
            return redirect('/survey');
        }

        $query = AtpRecord::query();
        if ($role === 'vendor') {
            $query->where('created_by', $userId);
        }

        $total = (clone $query)->count();
        $accept = (clone $query)->where('verdict', 'ACCEPT')->count();
        $cond = (clone $query)->where('verdict', 'CONDITIONAL')->count();
        $reject = (clone $query)->where('verdict', 'REJECT')->count();
        $pending = (clone $query)->where(function ($q) {
            $q->where('verdict', '')->orWhereNull('verdict');
        })->count();

        $recent = $query->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard/AtpDashboard', [
            'stats' => [
                'total' => $total,
                'accept' => $accept,
                'conditional' => $cond,
                'reject' => $reject,
                'pending' => $pending,
            ],
            'recent' => $recent,
        ]);
    }
}
