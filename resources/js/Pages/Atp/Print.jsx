import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer } from 'lucide-react';

export default function Print({ record }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const app = record.hasil_json?.approval || {};
    const itemNames = record.hasil_json?.itemNames || {};
    const itemStds = record.hasil_json?.itemStds || {};
    const itemTools = record.hasil_json?.itemTools || {};
    const itemVals = record.hasil_json?.items || {};
    const itemHasil = record.hasil_json?.hasil || {};
    const itemCatatan = record.hasil_json?.catatan || {};

    const verdictColors = {
        ACCEPT: 'text-[#16A34A]',
        CONDITIONAL: 'text-[#CA8A04]',
        REJECT: 'text-[#DC2626]',
        PENDING: 'text-[#64748B]',
    };
    const currentVerdict = record.verdict || 'PENDING';
    const verdictColorClass = verdictColors[currentVerdict] || verdictColors.PENDING;

    return (
        <div className="bg-white min-h-screen text-black font-body text-xs leading-relaxed max-w-[210mm] mx-auto print-container p-8">
            <Head title={`Cetak ATP - ${record.nama_site}`} />

            {/* PRINT BAR */}
            <div className="mb-6 flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 print:hidden">
                <span className="font-bold text-gray-700 flex items-center gap-2">
                    <Printer className="h-4 w-4 stroke-[1.5]" />
                    Pratinjau Cetak Checklist ATP
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded transition"
                    >
                        Cetak
                    </button>
                    <Link
                        href={`/atp/${record.id}`}
                        className="px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-100 rounded text-xs font-semibold text-gray-700 transition"
                    >
                        Kembali
                    </Link>
                </div>
            </div>

            {/* HEADER */}
            <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4 mb-6">
                <div>
                    <img src="/weave-logo.png" alt="Weave Logo" className="h-10 object-contain" />
                </div>
                <div className="text-right">
                    <h3 className="font-bold text-sm text-gray-900 font-headlines">{record.nama_site}</h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {record.tanggal} | No. PO: {record.no_po}
                    </p>
                </div>
            </div>

            {/* METADATA */}
            <div className="grid grid-cols-2 gap-4 border border-gray-900 p-4 rounded mb-6 text-[11px]">
                <div>
                    <p className="text-[9px] uppercase font-bold text-gray-400">Nama Site</p>
                    <p className="text-sm font-bold text-gray-900">{record.nama_site}</p>
                    <p className="text-[9px] uppercase font-bold text-gray-400 mt-2">Region / Wilayah</p>
                    <p className="text-xs font-semibold text-gray-700">{record.region || '-'}</p>
                </div>
                <div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-[9px] uppercase font-bold text-gray-400">Tanggal Audit</p>
                            <p className="text-xs font-bold text-gray-800">{record.tanggal}</p>
                        </div>
                        <div>
                            <p className="text-[9px] uppercase font-bold text-gray-400">Nomor PO / SPK</p>
                            <p className="text-xs font-bold text-gray-800">{record.no_po}</p>
                        </div>
                    </div>
                    {record.latitude && (
                        <div className="mt-2">
                            <p className="text-[9px] uppercase font-bold text-gray-400">Koordinat Lokasi</p>
                            <code className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                {record.latitude}, {record.longitude}
                            </code>
                        </div>
                    )}
                </div>
            </div>

            {/* VERDICT SECTION */}
            <div className="border border-gray-900 p-4 rounded mb-6 break-inside-avoid">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-gray-700">Verdict:</span>
                    <span className={`font-black text-sm uppercase tracking-wider ${verdictColorClass}`}>
                        {currentVerdict}
                    </span>
                </div>
                {record.verdict_notes && (
                    <p className="text-xs text-gray-650 mt-1 whitespace-pre-wrap font-body">
                        catatan :{record.verdict_notes}
                    </p>
                )}
            </div>

            {/* CHECKLIST DATA TABLE */}
            <div className="mb-6">
                <table className="w-full border-collapse text-left text-[10px]">
                    <thead>
                        <tr className="border-b-2 border-gray-900 bg-gray-50 font-bold uppercase">
                            <th className="py-2 px-2 border border-gray-300">Pemeriksaan Parameter</th>
                            <th className="py-2 px-2 border border-gray-300 w-24">Standard</th>
                            <th className="py-2 px-2 border border-gray-300 w-24">Alat Ukur</th>
                            <th className="py-2 px-2 border border-gray-300 w-20 text-center">Hasil</th>
                            <th className="py-2 px-2 border border-gray-300 w-16 text-center">Verdict</th>
                            <th className="py-2 px-2 border border-gray-300 w-32">Catatan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {Object.entries(itemNames).map(([key, name]) => (
                            <tr key={key} className="break-inside-avoid">
                                <td className="py-2 px-2 border border-gray-200 font-bold text-gray-800">{name}</td>
                                <td className="py-2 px-2 border border-gray-200 text-gray-500 font-mono text-[9px]">{itemStds[key]}</td>
                                <td className="py-2 px-2 border border-gray-200 text-gray-500 font-mono text-[9px]">{itemTools[key]}</td>
                                <td className="py-2 px-2 border border-gray-200 text-center text-gray-700 font-semibold">{itemHasil[key] || '-'}</td>
                                <td className="py-2 px-2 border border-gray-200 text-center font-bold text-xs">
                                    {itemVals[key] || '-'}
                                </td>
                                <td className="py-2 px-2 border border-gray-200 text-gray-500">{itemCatatan[key] || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* APPROVAL SECTION / SIGNATURE BLOCK */}
            <div className="grid grid-cols-2 gap-8 break-inside-avoid mt-12 text-center text-[11px]">
                <div className="flex flex-col justify-between h-28 border border-gray-100 p-3 rounded">
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">Pihak Pelaksana (Vendor)</span>
                    <span className="text-xs font-semibold text-gray-900 block">{app.vendor_company || '-'}</span>
                    <div className="h-10" />
                    <div>
                        <span className="font-bold text-gray-900 underline block">{app.vendor_1_name || '........................'}</span>
                        <span className="text-[9px] text-gray-500 block mt-0.5">{app.vendor_1_role || 'CME Representative'}</span>
                    </div>
                </div>

                <div className="flex flex-col justify-between h-28 border border-gray-100 p-3 rounded">
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">Tim Evaluasi (CME Team)</span>
                    <span className="text-xs font-semibold text-gray-900 block">{app.cme_company || '-'}</span>
                    <div className="h-10" />
                    <div>
                        <span className="font-bold text-gray-900 underline block">{app.cme_1_name || '........................'}</span>
                        <span className="text-[9px] text-gray-500 block mt-0.5">{app.cme_1_role || 'CME Lead Auditor'}</span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body { background: white; margin: 0; padding: 0; }
                    .print\\:hidden { display: none !important; }
                    .print-container { padding: 20mm 15mm !important; }
                }
                @page { size: A4 portrait; margin: 0; }
            `}} />
        </div>
    );
}
