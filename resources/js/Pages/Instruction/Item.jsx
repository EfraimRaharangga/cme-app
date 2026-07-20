import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Search, { filterData } from '../../Components/Search';
import Pagination from '../../Components/Pagination';

export default function Item({ kategori, spec, sow, images }) {
    // Premium placeholder specs if none exists in DB
    const defaultSpecs = {
        'ODC 1 Phase': [
            { item: 'Dimensi Pondasi', std: 'Panjang 3m, Lebar 2m, Tinggi 50cm', tool: 'Meteran Rol' },
            { item: 'Besi Hollow Kerangkeng', std: 'Hollow Galvalum 40x40x2mm', tool: 'Calipers' },
            { item: 'Kabel Power PLN', std: 'NYY 3x16mm² dari meteran ke ACPDB', tool: 'Visual / Penampang' },
            { item: 'Limit Grounding Site', std: 'Tahanan tanah ≤ 5 Ohm', tool: 'Earth Tester' },
        ],
        'ODC 3 Phase': [
            { item: 'Dimensi Pondasi', std: 'Panjang 3m, Lebar 3m, Tinggi 60cm', tool: 'Meteran Rol' },
            { item: 'Besi Hollow Kerangkeng', std: 'Hollow Galvalum 50x50x3mm', tool: 'Calipers' },
            { item: 'Kabel Power PLN', std: 'NYY 4x25mm² dari meteran ke ATS/AMF', tool: 'Visual' },
            { item: 'Limit Grounding Site', std: 'Tahanan tanah ≤ 1 Ohm', tool: 'Earth Tester' },
        ],
        'Shelter CME': [
            { item: 'Ukuran Pondasi Utama', std: 'Panjang 4m, Lebar 4m, Tebal 20cm', tool: 'Meteran Rol' },
            { item: 'Dinding Kerangkeng', std: 'Bata Ringan finishing plester & cat', tool: 'Visual' },
            { item: 'Air Conditioner (AC)', std: '2 Unit AC Split 1.5 PK Alternate', tool: 'Visual' },
            { item: 'Limit Grounding Shelter', std: 'Tahanan tanah ≤ 1 Ohm', tool: 'Earth Tester' },
        ],
    };

    const defaultSow = {
        'ODC 1 Phase': [
            '1. Lakukan penggalian tanah sedalam 40cm untuk pondasi cakar ayam.',
            '2. Cor semen adukan 1:2:3 dengan tinggi finishing 50cm di atas permukaan tanah.',
            '3. Pasang kerangkeng besi hollow dengan pengelasan sambungan full weld.',
            '4. Hubungkan kabel NYY 3x16mm² dari KWH meter ke MCB utama panel ODC.',
            '5. Uji tahanan grounding rod di bawah 5 Ohm menggunakan Earth Tester.',
        ],
        'ODC 3 Phase': [
            '1. Lakukan konstruksi pondasi beton bertulang mutu K-250.',
            '2. Rakit kerangkeng hollow pelindung outdoor cabinet dengan baut angkur M16.',
            '3. Hubungkan panel ATS/AMF ke modul panel generator cadangan.',
            '4. Tarik jalur kabel power utama 3 Phase NYY 4x25mm².',
            '5. Pasang grounding copper busbar dan grounding ring tanah di bawah 1 Ohm.',
        ],
        'Shelter CME': [
            '1. Kerjakan sloof pondasi beton keliling berdimensi 4x4m.',
            '2. Pasang dinding bata ringan setinggi 3 meter beserta pintu besi fireproof.',
            '3. Instalasi kabel tray gantung dan ducting udara.',
            '4. Pasang 2 unit AC split dengan controller modul alternation pintar.',
            '5. Koneksikan arrester petir panel utama ke grounding ring tembaga.',
        ],
    };

    const activeSpec = spec || defaultSpecs[kategori] || [];
    const activeSow = sow || defaultSow[kategori] || [];

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const filteredSpecs = filterData(activeSpec, searchQuery);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredSpecs.length / itemsPerPage);
    const paginatedSpecs = filteredSpecs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            <Head title={`Panduan ${kategori} - Web CME`} />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Panduan {kategori}
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        SOW standard, visual drawing blueprint, dan parameter audit.
                    </p>
                </div>
                <Link
                    href="/instruction"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition"
                >
                    &larr; Panduan
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Specs and SOW */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="📐 Spesifikasi Standar Material">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 mb-4">
                            <Search value={searchQuery} onChange={handleSearchChange} />
                        </div>

                        <Table headers={['Nama Parameter / Material', 'Kriteria Standard Kelayakan', 'Alat Ukur / Cara Uji']}>
                            {paginatedSpecs.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 font-medium">
                                        Tidak ada data spesifikasi material
                                    </td>
                                </tr>
                            ) : (
                                paginatedSpecs.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-3 font-bold text-gray-900">{row.item || row[0]}</td>
                                        <td className="px-6 py-3 text-gray-600 font-medium">{row.std || row[1]}</td>
                                        <td className="px-6 py-3 text-center text-gray-500 font-mono text-xs">{row.tool || row[2]}</td>
                                    </tr>
                                ))
                            )}
                        </Table>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredSpecs.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </Card>

                    <Card title="Langkah-langkah Kerja (SOW)">
                        <div className="bg-gray-50 p-4 border border-gray-250 rounded-lg space-y-3 font-medium text-xs text-gray-700 leading-relaxed">
                            {activeSow.map((step, idx) => (
                                <p key={idx} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                    {step}
                                </p>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Blueprint Drawing graphics if any */}
                <div>
                    <Card title=" Drawing Blueprint Layout">
                        {images.length === 0 ? (
                            <div className="border border-gray-200 border-dashed rounded-lg p-8 text-center text-gray-400 bg-gray-50/50">
                                <svg className="mx-auto h-8 w-8 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
                                </svg>
                                <p className="mt-2 text-xs font-semibold">Belum Ada Drawing Blueprint</p>
                                <p className="text-[10px] text-gray-400 mt-1">Gunakan form admin untuk mengunggah gambar blueprint kerja.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {images.map((img) => (
                                    <div key={img.id} className="relative rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm group">
                                        <img src={img.file_url} className="w-full object-contain" alt="Blueprint" />
                                        <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-[10px] font-bold text-white text-center">
                                            {img.filename}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}

Item.layout = page => <AppLayout children={page} />;
