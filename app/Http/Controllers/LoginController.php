<?php

namespace App\Http\Controllers;

use App\Models\LoginLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function showLoginForm(Request $request)
    {
        if ($request->session()->has('user_id')) {
            $role = $request->session()->get('role');
            $target = ($role === 'admin' || $role === 'staff_cme') ? '/cme-dashboard' : '/dashboard';
            return redirect($target);
        }

        return Inertia::render('Login', [
            'status' => session('success') ?: session('warning') ?: session('error'),
            'message' => session('success') ?: session('warning') ?: session('error'),
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $username = $request->input('username');
        $password = $request->input('password');

        $user = User::where('username', $username)->first();

        $ip = $request->ip() ?? '';
        $ua = substr($request->header('User-Agent') ?? '', 0, 500);
        [$browser, $os, $device] = $this->parseUa($ua);

        if ($user && Hash::check($password, $user->password)) {
            $request->session()->put('user_id', $user->id);
            $request->session()->put('username', $user->username);
            $request->session()->put('role', $user->role);
            $request->session()->put('last_activity', time());

            LoginLog::create([
                'username' => $username,
                'status' => 'success',
                'ip_address' => $ip,
                'user_agent' => $ua,
                'browser' => $browser,
                'os' => $os,
                'device' => $device,
            ]);

            $target = ($user->role === 'admin' || $user->role === 'staff_cme') ? '/cme-dashboard' : '/dashboard';
            return redirect($target)->with('success', 'Selamat datang kembali, ' . $username . '!');
        }

        LoginLog::create([
            'username' => $username,
            'status' => 'failed',
            'ip_address' => $ip,
            'user_agent' => $ua,
            'browser' => $browser,
            'os' => $os,
            'device' => $device,
        ]);

        return redirect('/')->with('error', 'Username atau password yang Anda masukkan salah!');
    }

    public function logout(Request $request)
    {
        $request->session()->forget(['user_id', 'username', 'role', 'last_activity']);
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Anda berhasil logout.');
    }

    private function parseUa($ua): array
    {
        $browser = 'Unknown';
        $os = 'Unknown';
        $device = 'Desktop';

        if (preg_match('/MSIE|Trident/', $ua)) $browser = 'Internet Explorer';
        elseif (preg_match('/Edg\//', $ua)) $browser = 'Edge';
        elseif (preg_match('/Firefox/', $ua)) $browser = 'Firefox';
        elseif (preg_match('/Chrome\//', $ua)) $browser = 'Chrome';
        elseif (preg_match('/Safari\//', $ua)) $browser = 'Safari';
        elseif (preg_match('/OPR|Opera/', $ua)) $browser = 'Opera';

        if (preg_match('/Windows NT 10/', $ua)) $os = 'Windows 10';
        elseif (preg_match('/Windows NT 11/', $ua)) $os = 'Windows 11';
        elseif (preg_match('/Windows NT 6\.3/', $ua)) $os = 'Windows 8.1';
        elseif (preg_match('/Windows NT 6\./', $ua)) $os = 'Windows';
        elseif (preg_match('/Mac OS X/', $ua)) $os = 'macOS';
        elseif (preg_match('/Linux/', $ua) && !preg_match('/Android/', $ua)) $os = 'Linux';
        elseif (preg_match('/Android/', $ua)) {
            $os = 'Android';
            $device = 'Mobile';
        } elseif (preg_match('/iPhone|iPad/', $ua)) {
            $os = 'iOS';
            $device = 'Mobile';
        }

        return [$browser, $os, $device];
    }
}
