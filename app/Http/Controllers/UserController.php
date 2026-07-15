<?php

namespace App\Http\Controllers;

use App\Models\LoginLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $role = $request->session()->get('role');
        if ($role !== 'admin') {
            return redirect('/dashboard');
        }

        $users = User::orderBy('id')->get();
        return Inertia::render('User/List', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $role = $request->session()->get('role');
        if ($role !== 'admin') return redirect('/dashboard');

        $request->validate([
            'username' => 'required|string|max:50|unique:users,username',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,surveyor,visitor,atp,staff_cme,vendor',
        ]);

        User::create([
            'username' => trim($request->input('username')),
            'password' => Hash::make($request->input('password')),
            'role' => $request->input('role'),
        ]);

        return redirect('/users')->with('success', 'User baru berhasil ditambahkan!');
    }

    public function update(Request $request, $id)
    {
        $role = $request->session()->get('role');
        if ($role !== 'admin') return redirect('/dashboard');

        $user = User::findOrFail($id);

        $request->validate([
            'username' => 'required|string|max:50|unique:users,username,' . $user->id,
            'role' => 'required|string|in:admin,surveyor,visitor,atp,staff_cme,vendor',
        ]);

        $user->username = trim($request->input('username'));
        $user->role = $request->input('role');

        if ($request->filled('password')) {
            $request->validate([
                'password' => 'string|min:6',
            ]);
            $user->password = Hash::make($request->input('password'));
        }

        $user->save();

        return redirect('/users')->with('success', 'User berhasil diupdate!');
    }

    public function delete(Request $request, $id)
    {
        $role = $request->session()->get('role');
        $currentUserId = $request->session()->get('user_id');

        if ($role !== 'admin') return redirect('/dashboard');

        if (intval($id) === intval($currentUserId)) {
            return redirect('/users')->with('error', 'Tidak dapat menghapus akun Anda sendiri!');
        }

        if (intval($id) === 1) {
            return redirect('/users')->with('error', 'Akun admin utama tidak dapat dihapus!');
        }

        $user = User::findOrFail($id);
        $user->delete();

        return redirect('/users')->with('success', 'User berhasil dihapus!');
    }

    public function logs(Request $request): Response
    {
        $role = $request->session()->get('role');
        if ($role !== 'admin') {
            return redirect('/dashboard');
        }

        $logs = LoginLog::orderBy('created_at', 'desc')->limit(100)->get();

        return Inertia::render('User/Logs', [
            'logs' => $logs,
        ]);
    }
}
