<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use App\Models\SurveyItem;
use App\Models\SurveyPhoto;
use App\Models\SurveyTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Requests\StoreSurveyRequest;
use App\Http\Requests\UpdateSurveyRequest;
use App\Http\Requests\StoreSurveyTemplateRequest;

class SurveyController extends Controller
{
    private $defaultCategories = [
        'KELISTRIKAN' => [
            ['1.1', 'Sumber Listrik PLN', 'select', ['1 Phase', '3 Phase']],
            ['1.2', 'MCB Utama', 'text', ''],
            ['1.3', 'Kabel Power', 'text', ''],
            ['1.4', 'Grounding Pusat', 'select', ['Tersedia', 'Tidak']],
        ],
        'GENSET & ATS' => [
            ['2.1', 'ATS (Automatic Transfer Switch)', 'select', ['AMF (dengan module)', 'Manual', 'Timer']],
            ['2.2', 'Genset', 'select', ['Sudah ada', 'Belum ada']],
        ],
        'INFRASTRUKTUR FISIK' => [
            ['3.1', 'Pondasi / Landasan', 'select', ['3m x 2m', '2m x 3m', 'Lainnya']],
            ['3.2', 'Pintu Kerangkeng (Cage Door)', 'select', ['2 pintu', '1 pintu']],
            ['3.3', 'Dinding & Lantai', 'select', ['Baik', 'Retak', 'Lembab', 'Perlu perbaikan']],
            ['3.4', 'Kabel Tray / Duct', 'select', ['Baik', 'Penuh', 'Rusak', 'Perlu tambahan']],
        ],
        'RACK & DISTRIBUSI' => [
            ['4.1', 'ACPDB Rack ODC', 'select', ['Full (penuh)', 'Masih ada space']],
            ['4.2', 'Space Grounding Busbar', 'text', ''],
            ['4.3', 'Sisa PDU (Power Distribution Unit)', 'text', ''],
            ['4.4', 'Rack 1', 'select', ['Ada', 'Tidak']],
            ['4.5', 'Space Rack 1 — Front', 'select', ['Tersedia', 'Penuh']],
            ['4.6', 'Space Rack 1 — Back', 'select', ['Tersedia', 'Penuh']],
            ['4.7', 'Rack 2', 'select', ['Ada', 'Tidak']],
            ['4.8', 'Space Rack 2 — Front', 'select', ['Tersedia', 'Penuh']],
            ['4.9', 'Space Rack 2 — Back', 'select', ['Tersedia', 'Penuh']],
        ],
        'LINGKUNGAN & KEAMANAN' => [
            ['5.1', 'Pendinginan (Cooling)', 'multi', ['Unit 1', 'Unit 2']],
            ['5.2', 'Kondisi Atap', 'select', ['Baik', 'Bocor', 'Perlu perbaikan']],
            ['5.3', 'Suhu Ambient / Sekitar', 'text', ''],
            ['5.4', 'Kebersihan Ruangan', 'select', ['Bersih', 'Cukup', 'Kotor']],
        ],
    ];



    public function create(Request $request): Response
    {
        $userId = $request->session()->get('user_id');
        $templates = SurveyTemplate::where('created_by', $userId)->get();

        $selectedTemplate = $this->defaultCategories;
        if ($request->has('template_id')) {
            $t = SurveyTemplate::find($request->input('template_id'));
            if ($t) {
                $selectedTemplate = $t->kategori_json;
            }
        }

        return Inertia::render('Survey/New', [
            'defaultTemplate' => $selectedTemplate,
            'templates' => $templates,
        ]);
    }

    public function store(StoreSurveyRequest $request)
    {
        $userId = $request->session()->get('user_id');

        DB::beginTransaction();
        try {
            $survey = Survey::create([
                'nama_site' => $request->input('nama_site'),
                'tanggal_survey' => $request->input('tanggal_survey'),
                'nama_surveyor' => $request->input('nama_surveyor'),
                'lokasi' => $request->input('lokasi') ?? '',
                'latitude' => $request->input('latitude') ?? '',
                'longitude' => $request->input('longitude') ?? '',
                'catatan_tambahan' => $request->input('catatan_tambahan'),
                'created_by' => $userId,
            ]);

            $items = $request->input('items', []);
            $itemIdMap = [];

            foreach ($items as $key => $item) {
                $status = $item['status'] ?? '';
                $kondisi = $item['kondisi'] ?? '';
                if (isset($item['kondisi_1_jenis']) || isset($item['kondisi_1_kondisi'])) {
                    $parts = [];
                    if (!empty($item['kondisi_1_jenis']) || !empty($item['kondisi_1_kondisi'])) {
                        $parts[] = '1. ' . ($item['kondisi_1_jenis'] ?? '-') . ($item['kondisi_1_kondisi'] ? ' [' . $item['kondisi_1_kondisi'] . ']' : '');
                    }
                    if (!empty($item['kondisi_2_jenis']) || !empty($item['kondisi_2_kondisi'])) {
                        $parts[] = '2. ' . ($item['kondisi_2_jenis'] ?? '-') . ($item['kondisi_2_kondisi'] ? ' [' . $item['kondisi_2_kondisi'] . ']' : '');
                    }
                    $kondisi = implode("\n", $parts);
                }

                $surveyItem = SurveyItem::create([
                    'survey_id' => $survey->id,
                    'kategori' => $item['kategori'],
                    'nomor_item' => $item['nomor'],
                    'nama_item' => $item['nama'],
                    'status_check' => $status,
                    'kondisi_nilai' => $kondisi,
                    'catatan' => $item['catatan'] ?? '',
                ]);
                $itemIdMap[$key] = $surveyItem->id;
            }

            // Handle files
            if ($request->has('photos')) {
                foreach ($request->input('photos') as $key => $fileList) {
                    $itemId = $itemIdMap[$key] ?? null;
                    if (!$itemId) continue;

                    foreach ($fileList as $idx => $fileData) {
                        $tempPath = $fileData['path'] ?? null;
                        if (!$tempPath) continue;

                        $fullTempPath = storage_path('app/public/' . $tempPath);
                        if (file_exists($fullTempPath)) {
                            $surveyPhoto = SurveyPhoto::create([
                                'survey_id' => $survey->id,
                                'item_id' => $itemId,
                                'file_path' => basename($fullTempPath),
                            ]);

                            $surveyPhoto->addMedia($fullTempPath)
                                        ->toMediaCollection('photo');
                        }
                    }
                }
            }

            DB::commit();
            return redirect('/survey')->with('success', 'Data survey ODC berhasil disimpan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menyimpan data: ' . $e->getMessage());
        }
    }

    public function detail(Request $request, $id): Response
    {
        $survey = Survey::with(['items', 'photos'])->findOrFail($id);
        return Inertia::render('Survey/Detail', [
            'survey' => $survey,
        ]);
    }

    public function edit(Request $request, $id)
    {
        $survey = Survey::with(['items', 'photos'])->findOrFail($id);
        $userId = $request->session()->get('user_id');
        $templates = SurveyTemplate::where('created_by', $userId)->get();

        return Inertia::render('Survey/Edit', [
            'survey' => $survey,
            'templates' => $templates,
        ]);
    }

    public function update(UpdateSurveyRequest $request, $id)
    {
        $survey = Survey::findOrFail($id);

        DB::beginTransaction();
        try {
            $survey->update([
                'nama_site' => $request->input('nama_site'),
                'tanggal_survey' => $request->input('tanggal_survey'),
                'nama_surveyor' => $request->input('nama_surveyor'),
                'lokasi' => $request->input('lokasi') ?? '',
                'latitude' => $request->input('latitude') ?? '',
                'longitude' => $request->input('longitude') ?? '',
                'catatan_tambahan' => $request->input('catatan_tambahan'),
            ]);

            $items = $request->input('items', []);
            foreach ($items as $item) {
                $status = $item['status'] ?? '';
                $kondisi = $item['kondisi'] ?? '';
                if (isset($item['kondisi_1_jenis']) || isset($item['kondisi_1_kondisi'])) {
                    $parts = [];
                    if (!empty($item['kondisi_1_jenis']) || !empty($item['kondisi_1_kondisi'])) {
                        $parts[] = '1. ' . ($item['kondisi_1_jenis'] ?? '-') . ($item['kondisi_1_kondisi'] ? ' [' . $item['kondisi_1_kondisi'] . ']' : '');
                    }
                    if (!empty($item['kondisi_2_jenis']) || !empty($item['kondisi_2_kondisi'])) {
                        $parts[] = '2. ' . ($item['kondisi_2_jenis'] ?? '-') . ($item['kondisi_2_kondisi'] ? ' [' . $item['kondisi_2_kondisi'] . ']' : '');
                    }
                    $kondisi = implode("\n", $parts);
                }

                if (!empty($item['item_db_id'])) {
                    SurveyItem::where('id', $item['item_db_id'])->update([
                        'status_check' => $status,
                        'kondisi_nilai' => $kondisi,
                        'catatan' => $item['catatan'] ?? '',
                    ]);
                }
            }

            // Handle uploads
            if ($request->has('photos')) {
                foreach ($request->input('photos') as $key => $fileList) {
                    $ri = SurveyItem::where('survey_id', $survey->id)->where('nomor_item', $key)->first();
                    if (!$ri) continue;

                    foreach ($fileList as $idx => $fileData) {
                        $tempPath = $fileData['path'] ?? null;
                        if (!$tempPath) continue;

                        $fullTempPath = storage_path('app/public/' . $tempPath);
                        if (file_exists($fullTempPath)) {
                            $surveyPhoto = SurveyPhoto::create([
                                'survey_id' => $survey->id,
                                'item_id' => $ri->id,
                                'file_path' => basename($fullTempPath),
                            ]);

                            $surveyPhoto->addMedia($fullTempPath)
                                        ->toMediaCollection('photo');
                        }
                    }
                }
            }

            DB::commit();
            return redirect('/survey/' . $survey->id)->with('success', 'Survey ODC berhasil diupdate!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal update survey: ' . $e->getMessage());
        }
    }

    public function delete(Request $request, $id)
    {
        $survey = Survey::findOrFail($id);
        $survey->delete(); // Cascades deletes survey_items & survey_photos via DB foreign keys

        return redirect('/survey')->with('success', 'Data survey ODC berhasil dihapus!');
    }

    public function print(Request $request, $id): Response
    {
        $survey = Survey::with(['items', 'photos'])->findOrFail($id);
        return Inertia::render('Survey/Print', [
            'survey' => $survey,
        ]);
    }

    // Template customizer sub-views
    public function custom(Request $request): Response
    {
        $userId = $request->session()->get('user_id');
        $templates = SurveyTemplate::where('created_by', $userId)->get();

        return Inertia::render('Survey/Custom', [
            'defaultCategories' => $this->defaultCategories,
            'templates' => $templates,
        ]);
    }

    public function storeTemplate(StoreSurveyTemplateRequest $request)
    {
        $userId = $request->session()->get('user_id');

        SurveyTemplate::create([
            'title' => $request->input('title'),
            'kategori_json' => $request->input('kategori_json'),
            'created_by' => $userId,
        ]);

        return redirect('/survey/custom')->with('success', 'Template baru berhasil disimpan!');
    }

    public function deleteTemplate(Request $request, $id)
    {
        $userId = $request->session()->get('user_id');
        $t = SurveyTemplate::where('id', $id)->where('created_by', $userId)->firstOrFail();
        $t->delete();

        return redirect('/survey/custom')->with('success', 'Template berhasil dihapus!');
    }
}
