import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer } from 'lucide-react';

export default function Print({ survey }) {
    useEffect(() => {
        // Trigger browser print dialog after render
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Group checklist items by category
    const groupedItems = {};
    survey.items.forEach((item) => {
        if (!groupedItems[item.kategori]) {
            groupedItems[item.kategori] = [];
        }
        groupedItems[item.kategori].push(item);
    });

    return (
        <div className="bg-white min-h-screen p-8 text-black font-body text-xs leading-relaxed max-w-[210mm] mx-auto">
            <Head title={`Cetak Survey ODC - ${survey.nama_site}`} />

            {/* PRINT UTILITIES HEADER (HIDDEN IN PRINT) */}
            <div className="mb-6 flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 print:hidden">
                <span className="font-bold text-gray-700 flex items-center gap-2">
                    <Printer className="h-4 w-4 stroke-[1.5]" />
                    Mode Pratinjau Cetak A4
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded transition"
                    >
                        Cetak Laporan
                    </button>
                    <Link
                        href={`/survey/${survey.id}`}
                        className="px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-100 rounded text-xs font-semibold text-gray-700 transition"
                    >
                        Kembali
                    </Link>
                </div>
            </div>

            {/* BRANDING HEADER */}
            <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4 mb-6">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-wider font-headlines">
                        Laporan Survey ODC
                    </h2>
                    <p className="text-[10px] text-gray-500 font-headlines mt-0.5">
                        Central Monitoring &amp; Evaluation Infrastructure
                    </p>
                </div>
                <div className="text-right">
                    <h3 className="font-bold text-sm text-primary">{survey.nama_site}</h3>
                    <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                        ID Laporan: {survey.id} &bull; Date: {survey.tanggal_survey}
                    </p>
                </div>
            </div>

            {/* METADATA INFO */}
            <div className="grid grid-cols-2 gap-4 border border-gray-900 p-4 rounded mb-6">
                <div>
                    <p className="text-[9px] uppercase font-bold text-gray-400">Nama Site</p>
                    <p className="text-sm font-bold text-gray-900">{survey.nama_site}</p>
                    <p className="text-[9px] uppercase font-bold text-gray-400 mt-3">Lokasi / Alamat</p>
                    <p className="text-xs font-semibold text-gray-700">{survey.lokasi || '-'}</p>
                </div>
                <div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-[9px] uppercase font-bold text-gray-400">Tanggal Survey</p>
                            <p className="text-xs font-bold text-gray-800">{survey.tanggal_survey}</p>
                        </div>
                        <div>
                            <p className="text-[9px] uppercase font-bold text-gray-400">Nama Surveyor</p>
                            <p className="text-xs font-bold text-gray-800">{survey.nama_surveyor}</p>
                        </div>
                    </div>
                    {survey.latitude && (
                        <div className="mt-3">
                            <p className="text-[9px] uppercase font-bold text-gray-400">Koordinat GPS</p>
                            <code className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                {survey.latitude}, {survey.longitude}
                            </code>
                        </div>
                    )}
                </div>
            </div>

            {/* CHECKLIST ITEMS */}
            <div className="space-y-6">
                {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category} className="break-inside-avoid">
                        <div className="bg-gray-100 px-3 py-2 border-l-4 border-l-primary font-bold text-xs uppercase tracking-wider text-gray-800 mb-2">
                            {category}
                        </div>
                        <table className="w-full border-collapse text-left text-[11px]">
                            <thead>
                                <tr className="border-b border-gray-900 bg-gray-50 text-[10px] uppercase font-bold">
                                    <th className="py-2 px-3 border border-gray-200 text-center w-12">No</th>
                                    <th className="py-2 px-3 border border-gray-200">Kriteria Checkpoint</th>
                                    <th className="py-2 px-3 border border-gray-200 text-center w-20">Status</th>
                                    <th className="py-2 px-3 border border-gray-200">Kondisi / Catatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {items.map((it) => (
                                    <tr key={it.id}>
                                        <td className="py-2 px-3 border border-gray-200 text-center font-mono font-bold text-gray-400">
                                            {it.nomor_item}
                                        </td>
                                        <td className="py-2 px-3 border border-gray-200 font-bold text-gray-800">{it.nama_item}</td>
                                        <td className="py-2 px-3 border border-gray-200 text-center">
                                            <span className="font-bold text-xs">
                                                {it.status_check === 'checked' ? 'OK' : it.status_check === 'cross' ? 'NG' : '-'}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 border border-gray-200 text-gray-600 whitespace-pre-wrap">
                                            {it.kondisi_nilai || '-'}
                                            {it.catatan && (
                                                <div className="text-[9px] text-gray-400 italic mt-0.5">
                                                    Catatan: {it.catatan}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {/* REMARKS & SIGNATURES */}
            <div className="mt-8 grid grid-cols-2 gap-8 break-inside-avoid">
                <div className="border border-gray-200 p-3 rounded bg-gray-50/50">
                    <h4 className="font-bold text-[10px] uppercase text-gray-400 mb-1">Catatan Tambahan</h4>
                    <p className="text-xs text-gray-600 whitespace-pre-wrap">{survey.catatan_tambahan || 'Tidak ada catatan tambahan.'}</p>
                </div>
                <div className="flex flex-col justify-between items-end pr-8">
                    <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Tanda Tangan Surveyor</span>
                    <div className="h-16" />
                    <div className="text-right">
                        <span className="font-bold text-sm text-gray-900 underline block">{survey.nama_surveyor}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">Surveyor Lapangan ODC</span>
                    </div>
                </div>
            </div>

            {/* STYLE FOR PRINTING STUFF */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body { background: white; margin: 0; padding: 0; }
                    .print\\:hidden { display: none !important; }
                }
                @page { size: A4 portrait; margin: 15mm 10mm; }
            `}} />
        </div>
    );
}
