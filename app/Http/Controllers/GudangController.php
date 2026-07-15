<?php

namespace App\Http\Controllers;

use App\Models\GudangBarang;
use App\Models\GudangKeluar;
use App\Models\GudangKeluarDetail;
use App\Models\GudangMasuk;
use App\Models\GudangMasukDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GudangController extends Controller
{
    private $defaultCategories = [
        'MCB', 'PDU', 'Recti', 'Inverter', 'Baterai', 'UPS', 'Kabel', 'Konektor', 'Busbar', 'Panel', 'Grounding'
    ];

    public function index(Request $request): Response
    {
        $role = $request->session()->get('role');
        if ($role !== 'admin' && $role !== 'staff_cme') {
            return redirect('/dashboard');
        }

        $search = $request->input('cari');
        $catFilter = $request->input('kategori');

        // Retrieve predefined options and dynamically query custom entries from DB
        $customCats = GudangBarang::distinct()->pluck('kategori')->toArray();
        $categories = array_unique(array_merge($this->defaultCategories, $customCats));

        // Filter out deleted categories/types tracked in session
        $deletedCats = $request->session()->get('deleted_gudang_kat', []);
        $deletedTipes = $request->session()->get('deleted_gudang_tipe', []);

        $categories = array_values(array_diff($categories, $deletedCats));

        $query = GudangBarang::query();
        if ($catFilter) {
            $query->where('kategori', $catFilter);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('kategori', 'like', "%{$search}%")
                  ->orWhere('tipe', 'like', "%{$search}%");
            });
        }

        $items = $query->orderBy('kategori')->orderBy('tipe')->get();

        // Filter items based on deleted types session tracking
        $items = $items->filter(function ($item) use ($deletedTipes) {
            $key = $item->kategori . '|' . $item->tipe;
            return !in_array($key, $deletedTipes);
        })->values();

        // Calculate totals per category
        $categoryTotals = [];
        foreach ($categories as $cat) {
            $categoryTotals[$cat] = GudangBarang::where('kategori', $cat)->sum('stok') ?? 0;
        }

        return Inertia::render('Gudang/Stock', [
            'items' => $items,
            'categories' => $categories,
            'totals' => $categoryTotals,
            'filters' => $request->only(['cari', 'kategori']),
        ]);
    }

    public function storeKategori(Request $request)
    {
        $request->validate([
            'kategori' => 'required|string',
            'satuan' => 'required|string',
        ]);

        $kat = $request->input('kategori');
        $sat = $request->input('satuan');

        GudangBarang::create([
            'nama' => $kat . ' Default',
            'kategori' => $kat,
            'tipe' => '',
            'stok' => 0,
            'satuan' => $sat,
            'min_stok' => 0
        ]);

        return redirect('/gudang')->with('success', 'Kategori baru berhasil ditambahkan!');
    }

    public function storeTipe(Request $request)
    {
        $request->validate([
            'kategori' => 'required|string',
            'tipe' => 'required|string',
        ]);

        $kat = $request->input('kategori');
        $tipe = $request->input('tipe');

        GudangBarang::create([
            'nama' => $kat . ' ' . $tipe,
            'kategori' => $kat,
            'tipe' => $tipe,
            'stok' => 0,
            'satuan' => 'Unit',
            'min_stok' => 1
        ]);

        return redirect('/gudang')->with('success', 'Tipe baru berhasil ditambahkan!');
    }

    public function storeMasuk(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'supplier' => 'required|string',
            'penerima' => 'required|string',
            'items' => 'required|array',
        ]);

        $userId = $request->session()->get('user_id');
        $noForm = 'BM-' . date('Ymd') . '-' . time();

        DB::beginTransaction();
        try {
            $gudangMasuk = GudangMasuk::create([
                'no_form' => $noForm,
                'judul' => $request->input('judul') ?? '',
                'kategori' => $request->input('kategori_batch') ?? '',
                'tanggal' => $request->input('tanggal'),
                'supplier' => $request->input('supplier'),
                'penerima' => $request->input('penerima'),
                'lokasi' => $request->input('lokasi') ?? '',
                'keterangan' => $request->input('keterangan'),
                'diserahkan' => $request->input('diserahkan') ?? '',
                'diterima' => $request->input('penerima'),
                'created_by' => $userId,
            ]);

            // Handle file attachments
            if ($request->hasFile('foto')) {
                $fotoNames = [];
                $uploadDir = public_path('uploads/gudang');
                if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

                foreach ($request->file('foto') as $file) {
                    $ext = $file->getClientOriginalExtension();
                    $filename = 'masuk_' . $gudangMasuk->id . '_' . rand(100,999) . '_' . time() . '.' . $ext;
                    $file->move($uploadDir, $filename);
                    $fotoNames[] = $filename;
                }
                $gudangMasuk->update(['foto' => implode(',', $fotoNames)]);
            }

            foreach ($request->input('items') as $item) {
                $kat = $item['kategori'];
                $tipe = $item['tipe'];
                $jml = intval($item['jumlah']);

                if (empty($tipe) || $jml <= 0) continue;

                $nama = $kat . ' ' . $tipe;

                // Check if item exists in ledger
                $barang = GudangBarang::where('kategori', $kat)->where('tipe', $tipe)->first();
                if ($barang) {
                    $barang->stok += $jml;
                    $barang->save();
                    $barangId = $barang->id;
                    $satuan = $barang->satuan;
                } else {
                    $newBarang = GudangBarang::create([
                        'nama' => $nama,
                        'kategori' => $kat,
                        'tipe' => $tipe,
                        'stok' => $jml,
                        'satuan' => 'Unit',
                        'min_stok' => 1
                    ]);
                    $barangId = $newBarang->id;
                    $satuan = 'Unit';
                }

                GudangMasukDetail::create([
                    'masuk_id' => $gudangMasuk->id,
                    'barang_id' => $barangId,
                    'nama_barang' => $nama,
                    'tipe_barang' => $tipe,
                    'jumlah' => $jml,
                    'satuan' => $satuan,
                ]);
            }

            DB::commit();
            return redirect('/gudang')->with('success', 'Transaksi barang masuk dicatat!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal mencatat transaksi: ' . $e->getMessage());
        }
    }

    public function storeKeluar(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'pengambil' => 'required|string',
            'lokasi_tujuan' => 'required|string',
            'items' => 'required|array',
        ]);

        $userId = $request->session()->get('user_id');
        $noForm = 'BK-' . date('Ymd') . '-' . time();

        DB::beginTransaction();
        try {
            $gudangKeluar = GudangKeluar::create([
                'no_form' => $noForm,
                'judul' => $request->input('judul') ?? '',
                'kategori' => $request->input('kategori_batch') ?? '',
                'tanggal' => $request->input('tanggal'),
                'pengambil' => $request->input('pengambil'),
                'jabatan' => $request->input('jabatan') ?? '',
                'lokasi_tujuan' => $request->input('lokasi_tujuan'),
                'keperluan' => $request->input('keperluan') ?? '',
                'proyek' => $request->input('proyek') ?? '',
                'tujuan' => $request->input('tujuan') ?? '',
                'keterangan' => $request->input('keterangan') ?? '',
                'disetujui' => $request->input('disetujui') ?? '',
                'pengambil_ttd' => $request->input('pengambil'),
                'created_by' => $userId,
            ]);

            // Handle file attachments
            if ($request->hasFile('foto')) {
                $fotoNames = [];
                $uploadDir = public_path('uploads/gudang');
                if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

                foreach ($request->file('foto') as $file) {
                    $ext = $file->getClientOriginalExtension();
                    $filename = 'keluar_' . $gudangKeluar->id . '_' . rand(100,999) . '_' . time() . '.' . $ext;
                    $file->move($uploadDir, $filename);
                    $fotoNames[] = $filename;
                }
                $gudangKeluar->update(['foto' => implode(',', $fotoNames)]);
            }

            foreach ($request->input('items') as $item) {
                $kat = $item['kategori'];
                $tipe = $item['tipe'];
                $jml = intval($item['jumlah']);

                if (empty($tipe) || $jml <= 0) continue;

                $nama = $kat . ' ' . $tipe;

                $barang = GudangBarang::where('kategori', $kat)->where('tipe', $tipe)->first();
                if ($barang) {
                    $barang->stok = max(0, $barang->stok - $jml);
                    $barang->save();
                    $barangId = $barang->id;
                    $satuan = $barang->satuan;
                } else {
                    $barangId = 0;
                    $satuan = 'Unit';
                }

                GudangKeluarDetail::create([
                    'keluar_id' => $gudangKeluar->id,
                    'barang_id' => $barangId,
                    'nama_barang' => $nama,
                    'tipe_barang' => $tipe,
                    'jumlah' => $jml,
                    'satuan' => $satuan,
                ]);
            }

            DB::commit();
            return redirect('/gudang')->with('success', 'Transaksi barang keluar dicatat!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal mencatat transaksi keluar: ' . $e->getMessage());
        }
    }

    public function masukList(Request $request): Response
    {
        $search = $request->input('cari');
        $query = GudangMasuk::query();

        if ($search) {
            $query->where('no_form', 'like', "%{$search}%")
                  ->orWhere('supplier', 'like', "%{$search}%")
                  ->orWhere('penerima', 'like', "%{$search}%");
        }

        $list = $query->orderBy('tanggal', 'desc')->get();

        return Inertia::render('Gudang/MasukList', [
            'transactions' => $list,
            'filters' => $request->only(['cari']),
        ]);
    }

    public function masukDetail($id): Response
    {
        $transaction = GudangMasuk::with('details')->findOrFail($id);
        return Inertia::render('Gudang/MasukDetail', [
            'transaction' => $transaction,
        ]);
    }

    public function keluarList(Request $request): Response
    {
        $search = $request->input('cari');
        $query = GudangKeluar::query();

        if ($search) {
            $query->where('no_form', 'like', "%{$search}%")
                  ->orWhere('pengambil', 'like', "%{$search}%")
                  ->orWhere('lokasi_tujuan', 'like', "%{$search}%");
        }

        $list = $query->orderBy('tanggal', 'desc')->get();

        return Inertia::render('Gudang/KeluarList', [
            'transactions' => $list,
            'filters' => $request->only(['cari']),
        ]);
    }

    public function keluarDetail($id): Response
    {
        $transaction = GudangKeluar::with('details')->findOrFail($id);
        return Inertia::render('Gudang/KeluarDetail', [
            'transaction' => $transaction,
        ]);
    }
}
