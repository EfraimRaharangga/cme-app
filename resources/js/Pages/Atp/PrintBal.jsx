import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer } from 'lucide-react';

export default function PrintBal({ record }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const bal = record.bal || {};

    return (
        <div className="bg-white min-h-screen p-12 text-black font-body text-xs leading-relaxed max-w-[210mm] mx-auto space-y-6">
            <Head title={`BA Lapangan - ${record.nama_site}`} />

            {/* PRINT CONTROLLER */}
            <div className="mb-6 flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 print:hidden">
                <span className="font-bold text-gray-700 flex items-center gap-2">
                    <Printer className="h-4 w-4 stroke-[1.5]" />
                    Pratinjau Cetak Berita Acara Lapangan (BAL)
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-1.5 bg-[#00ADB5] hover:bg-[#008f96] text-white text-xs font-bold uppercase tracking-wider rounded transition"
                    >
                        Cetak BAL
                    </button>
                    <Link
                        href={`/atp/${record.id}`}
                        className="px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-100 rounded text-xs font-semibold text-gray-700 transition"
                    >
                        Kembali
                    </Link>
                </div>
            </div>

            {/* DOC HEADER */}
            <div className="text-center border-b pb-4">
                <h2 className="text-base font-black uppercase tracking-wider">BERITA ACARA LAPANGAN (BAL)</h2>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">Nomor PO: {bal.no_po || record.no_po || '-'}</p>
            </div>

            {/* INTRODUCTORY BODY */}
            <div className="space-y-3">
                <p>
                    Pada hari ini, tanggal <b>{bal.tanggal || record.tanggal || '........................'}</b>, bertempat di site <b>{bal.lokasi || record.nama_site || '-'}</b>, yang bertanda tangan di bawah ini menerangkan bahwa telah selesai dilaksanakan pemeriksaan lapangan (Acceptance Test Procedure) untuk:
                </p>
                
                <table className="w-full border-collapse text-xs">
                    <tbody>
                        <tr>
                            <td className="w-32 py-1 font-bold text-gray-500">Nama Project</td>
                            <td className="w-4 py-1">:</td>
                            <td className="py-1 text-gray-900 font-semibold">{bal.project || '-'}</td>
                        </tr>
                        <tr>
                            <td className="py-1 font-bold text-gray-500">Lokasi / Site</td>
                            <td className="py-1">:</td>
                            <td className="py-1 text-gray-900 font-semibold">{bal.lokasi || record.nama_site || '-'}</td>
                        </tr>
                        <tr>
                            <td className="py-1 font-bold text-gray-500">Pelaksana Pekerjaan</td>
                            <td className="py-1">:</td>
                            <td className="py-1 text-gray-900 font-semibold">{bal.pelaksana || '-'}</td>
                        </tr>
                        <tr>
                            <td className="py-1 font-bold text-gray-500">Tanggal Pemeriksaan</td>
                            <td className="py-1">:</td>
                            <td className="py-1 text-gray-900 font-semibold">
                                {bal.tanggal_mulai || '-'} s.d. {bal.tanggal || '-'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* FINDINGS RECOMMENDATIONS */}
            <div className="space-y-2 border border-gray-900 p-4 rounded">
                <h4 className="font-bold text-xs uppercase text-gray-800">1. Hasil &amp; Rekomendasi Pemeriksaan</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{bal.hasil || 'Berdasarkan hasil pemeriksaan checklist ATP, secara keseluruhan infrastruktur dinyatakan LAYAK / ACCEPT dengan beberapa catatan minor terlampir.'}</p>
            </div>

            <div className="space-y-3 text-[11px]">
                <p>
                    Demikian Berita Acara Lapangan ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya dalam proses serah terima pekerjaan.
                </p>
            </div>

            {/* DUAL SIGNATURE */}
            <div className="grid grid-cols-2 gap-12 pt-12 text-center text-xs">
                <div className="flex flex-col justify-between h-32 border border-gray-150 p-4 rounded bg-gray-50/50">
                    <span className="font-bold uppercase tracking-wider text-[9px] text-[#00ADB5]">Pihak I (Pelaksana)</span>
                    <span className="font-bold text-gray-900">{bal.pihak1 || '-'}</span>
                    <div className="h-10" />
                    <div>
                        <span className="font-bold text-gray-900 underline block">{bal.nama1 || '........................'}</span>
                        <span className="text-[9px] text-gray-400 block mt-0.5">{bal.jabatan1 || 'CME Lead Inspector'}</span>
                    </div>
                </div>

                <div className="flex flex-col justify-between h-32 border border-gray-150 p-4 rounded bg-gray-50/50">
                    <span className="font-bold uppercase tracking-wider text-[9px] text-gray-500">Pihak II (Pengawas / CME)</span>
                    <span className="font-bold text-gray-900">{bal.pihak2 || '-'}</span>
                    <div className="h-10" />
                    <div>
                        <span className="font-bold text-gray-900 underline block">{bal.nama2 || '........................'}</span>
                        <span className="text-[9px] text-gray-400 block mt-0.5">{bal.jabatan2 || 'CME Lead Auditor'}</span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body { background: white; margin: 0; padding: 0; }
                    .print\\:hidden { display: none !important; }
                }
                @page { size: A4 portrait; margin: 20mm 15mm; }
            `}} />
        </div>
    );
}
