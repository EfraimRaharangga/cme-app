<?php

namespace App\Http\Controllers;

use App\Models\AtpPhoto;
use App\Models\AtpRecord;
use App\Models\AtpTemplate;
use App\Models\BalData;
use App\Models\BastpData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Requests\StoreAtpRequest;
use App\Http\Requests\UpdateAtpRequest;
use App\Http\Requests\StoreAtpTemplateRequest;

class AtpController extends Controller
{
    private $defaultTemplate = [
        ['ty' => 'sec', 'tx' => 'I. PONDASI BETON'],
        ['ty' => 'sub', 'tx' => 'A. Dimensi & Geometri'],
        ['ty' => 'it', 'd' => ['Panjang total pondasi', 'Sesuai gambar ±3m', 'Roll meter', '', 0, 0, 0, ''], '_id' => 'def_0'],
        ['ty' => 'it', 'd' => ['Lebar pondasi', 'Sesuai gambar, ±2m', 'Meteran', '', 0, 0, 0, ''], '_id' => 'def_1'],
        ['ty' => 'it', 'd' => ['Tinggi pondasi', '50-60cm', 'Roll meter', '', 0, 0, 0, ''], '_id' => 'def_2'],
        ['ty' => 'it', 'd' => ['Kerataan permukaan — waterpass', '±3mm', 'Waterpass', '', 0, 0, 0, ''], '_id' => 'def_3'],
        ['ty' => 'sec', 'tx' => 'II. KERANGKENG (Atap & Las)'],
        ['ty' => 'it', 'd' => ['Profil kolom — hollow', '40×40×5mm', 'Jangka sorong', '', 0, 0, 0, ''], '_id' => 'def_14'],
        ['ty' => 'it', 'd' => ['Pintu dapat dibuka', 'Buka tutup sempurna', 'Uji 5x', '', 0, 0, 0, ''], '_id' => 'def_23'],
        ['ty' => 'sec', 'tx' => 'III. GROUNDING'],
        ['ty' => 'it', 'd' => ['Tahanan grounding — earth tester', '≤5Ω', 'Earth Tester', '', 0, 0, 0, ''], '_id' => 'def_38'],
        ['ty' => 'sec', 'tx' => 'IV. PANEL ATS / AMF'],
        ['ty' => 'it', 'd' => ['ATS 4P 100A — transfer', 'Lancar', 'Lever manual', '', 0, 0, 0, ''], '_id' => 'def_42'],
        ['ty' => 'sec', 'tx' => 'V. GENSET'],
        ['ty' => 'it', 'd' => ['Start manual — starter OK', 'Engine running', 'Start', '', 0, 0, 0, ''], '_id' => 'def_68']
    ];

    public function index(Request $request): Response
    {
        $role = $request->session()->get('role');
        $userId = $request->session()->get('user_id');
        $search = $request->input('cari');

        $query = AtpRecord::query();
        if ($role === 'vendor') {
            $query->where('created_by', $userId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_site', 'like', "%{$search}%")
                  ->orWhere('no_po', 'like', "%{$search}%")
                  ->orWhere('region', 'like', "%{$search}%");
            });
        }

        $records = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('Atp/List', [
            'records' => $records,
            'filters' => $request->only(['cari']),
        ]);
    }

    public function create(Request $request): Response
    {
        $userId = $request->session()->get('user_id');
        $templates = AtpTemplate::where('created_by', $userId)->get();

        $selectedTemplate = $this->defaultTemplate;
        if ($request->has('template_id')) {
            $t = AtpTemplate::find($request->input('template_id'));
            if ($t) {
                $selectedTemplate = $t->data_json;
            }
        }

        return Inertia::render('Atp/New', [
            'defaultTemplate' => $selectedTemplate,
            'templates' => $templates,
        ]);
    }

    public function store(StoreAtpRequest $request)
    {
        $userId = $request->session()->get('user_id');

        DB::beginTransaction();
        try {
            $record = AtpRecord::create([
                'nama_site' => $request->input('nama_site'),
                'tanggal' => $request->input('tanggal'),
                'region' => $request->input('region') ?? '',
                'latitude' => $request->input('latitude') ?? '',
                'longitude' => $request->input('longitude') ?? '',
                'no_po' => $request->input('no_po'),
                'hasil_json' => $request->input('hasil_json', []),
                'verdict' => $request->input('verdict') ?? '',
                'verdict_notes' => $request->input('verdict_notes'),
                'approval_json' => $request->input('approval_json', []),
                'bastp_json' => $request->input('bastp_json'),
                'created_by' => $userId,
            ]);

            // Handle uploads
            if ($request->has('fotos_item')) {
                foreach ($request->input('fotos_item') as $itemId => $fileList) {
                    foreach ($fileList as $idx => $fileData) {
                        $tempPath = $fileData['path'] ?? null;
                        if (!$tempPath) continue;

                        $fullTempPath = storage_path('app/public/' . $tempPath);
                        if (file_exists($fullTempPath)) {
                            $atpPhoto = AtpPhoto::create([
                                'atp_id' => $record->id,
                                'item_id' => $itemId,
                                'file_path' => basename($fullTempPath),
                            ]);

                            $atpPhoto->addMedia($fullTempPath)
                                     ->toMediaCollection('photo');
                        }
                    }
                }
            }

            DB::commit();
            return redirect('/atp')->with('success', 'Data ATP berhasil disimpan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menyimpan ATP: ' . $e->getMessage());
        }
    }

    public function detail(Request $request, $id): Response
    {
        $record = AtpRecord::with(['photos', 'bal', 'bastp'])->findOrFail($id);
        return Inertia::render('Atp/Detail', [
            'record' => $record,
        ]);
    }

    public function edit(Request $request, $id): Response
    {
        $record = AtpRecord::findOrFail($id);
        $userId = $request->session()->get('user_id');
        $templates = AtpTemplate::where('created_by', $userId)->get();

        return Inertia::render('Atp/Edit', [
            'record' => $record,
            'templates' => $templates,
        ]);
    }

    public function update(UpdateAtpRequest $request, $id)
    {
        $record = AtpRecord::findOrFail($id);

        DB::beginTransaction();
        try {
            $record->update([
                'nama_site' => $request->input('nama_site'),
                'tanggal' => $request->input('tanggal'),
                'region' => $request->input('region') ?? '',
                'latitude' => $request->input('latitude') ?? '',
                'longitude' => $request->input('longitude') ?? '',
                'no_po' => $request->input('no_po'),
                'hasil_json' => $request->input('hasil_json', []),
                'verdict' => $request->input('verdict') ?? '',
                'verdict_notes' => $request->input('verdict_notes'),
                'approval_json' => $request->input('approval_json', []),
            ]);

            // Handle uploads
            if ($request->has('fotos_item')) {
                foreach ($request->input('fotos_item') as $itemId => $fileList) {
                    foreach ($fileList as $idx => $fileData) {
                        $tempPath = $fileData['path'] ?? null;
                        if (!$tempPath) continue;

                        $fullTempPath = storage_path('app/public/' . $tempPath);
                        if (file_exists($fullTempPath)) {
                            $atpPhoto = AtpPhoto::create([
                                'atp_id' => $record->id,
                                'item_id' => $itemId,
                                'file_path' => basename($fullTempPath),
                            ]);

                            $atpPhoto->addMedia($fullTempPath)
                                     ->toMediaCollection('photo');
                        }
                    }
                }
            }

            DB::commit();
            return redirect('/atp/' . $record->id)->with('success', 'Data ATP berhasil diupdate!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal update ATP: ' . $e->getMessage());
        }
    }

    public function delete(Request $request, $id)
    {
        $record = AtpRecord::findOrFail($id);
        $record->delete();

        return redirect('/atp')->with('success', 'ATP berhasil dihapus!');
    }

    public function print(Request $request, $id): Response
    {
        $record = AtpRecord::with(['photos', 'bal', 'bastp'])->findOrFail($id);
        return Inertia::render('Atp/Print', [
            'record' => $record,
        ]);
    }

    // BAL report handlers
    public function printBal(Request $request, $id): Response
    {
        $record = AtpRecord::with(['bal'])->findOrFail($id);
        return Inertia::render('Atp/PrintBal', [
            'record' => $record,
        ]);
    }

    public function saveBal(Request $request, $id)
    {
        $record = AtpRecord::findOrFail($id);

        $request->validate([
            'project' => 'required|string|max:255',
            'no_po' => 'required|string|max:255',
            'tanggal_mulai' => 'required|date',
            'tanggal' => 'required|date',
            'pelaksana' => 'required|string|max:255',
            'lokasi' => 'required|string|max:255',
            'hasil' => 'required|string|max:255',
            'pihak1' => 'required|string|max:255',
            'pihak2' => 'required|string|max:255',
            'nama1' => 'required|string|max:255',
            'jabatan1' => 'required|string|max:255',
            'nama2' => 'required|string|max:255',
            'jabatan2' => 'required|string|max:255',
        ]);

        $bal = BalData::updateOrCreate(
            ['atp_id' => $record->id],
            $request->only([
                'project', 'no_po', 'tanggal_mulai', 'tanggal',
                'pelaksana', 'lokasi', 'hasil', 'pihak1', 'pihak2',
                'nama1', 'jabatan1', 'nama2', 'jabatan2'
            ])
        );

        return redirect('/atp/' . $record->id)->with('success', 'Data Berita Acara Lapangan (BAL) berhasil disimpan!');
    }

    public function deleteBal($id)
    {
        $record = AtpRecord::findOrFail($id);
        if ($record->bal) {
            $record->bal->delete();
        }
        return redirect('/atp/' . $record->id)->with('success', 'Data Berita Acara Lapangan (BAL) berhasil dihapus!');
    }

    // BASTP report handlers
    public function printBastp(Request $request, $id): Response
    {
        $record = AtpRecord::with(['bastp'])->findOrFail($id);
        return Inertia::render('Atp/PrintBastp', [
            'record' => $record,
        ]);
    }

    public function saveBastp(Request $request, $id)
    {
        $record = AtpRecord::findOrFail($id);

        $request->validate([
            'p1_nama' => 'required|string|max:255',
            'p1_alamat' => 'required|string',
            'p2_nama' => 'required|string|max:255',
            'p2_jabatan' => 'required|string|max:255',
            'p2_alamat' => 'required|string',
            'pekerjaan' => 'required|string|max:255',
            'mengetahui1' => 'required|string|max:255',
            'mengetahui2' => 'required|string|max:255',
        ]);

        $bastp = BastpData::updateOrCreate(
            ['atp_id' => $record->id],
            $request->only([
                'p1_nama', 'p1_alamat', 'p2_nama', 'p2_jabatan', 'p2_alamat',
                'pekerjaan', 'mengetahui1', 'mengetahui2', 'photos'
            ])
        );

        return redirect('/atp/' . $record->id)->with('success', 'Data BASTP berhasil disimpan!');
    }

    public function deleteBastp($id)
    {
        $record = AtpRecord::findOrFail($id);
        if ($record->bastp) {
            $record->bastp->delete();
        }
        return redirect('/atp/' . $record->id)->with('success', 'Data BASTP berhasil dihapus!');
    }

    // Customizer template builder
    public function custom(Request $request): Response
    {
        $userId = $request->session()->get('user_id');
        $templates = AtpTemplate::where('created_by', $userId)->get();

        return Inertia::render('Atp/Custom', [
            'defaultTemplate' => $this->defaultTemplate,
            'templates' => $templates,
        ]);
    }

    public function storeTemplate(StoreAtpTemplateRequest $request)
    {
        $userId = $request->session()->get('user_id');

        AtpTemplate::create([
            'title' => $request->input('title'),
            'data_json' => $request->input('data_json'),
            'created_by' => $userId,
        ]);

        return redirect('/atp/custom')->with('success', 'Template ATP berhasil disimpan!');
    }

    public function deleteTemplate(Request $request, $id)
    {
        $userId = $request->session()->get('user_id');
        $t = AtpTemplate::where('id', $id)->where('created_by', $userId)->firstOrFail();
        $t->delete();

        return redirect('/atp/custom')->with('success', 'Template ATP berhasil dihapus!');
    }
}
