import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer } from 'lucide-react';

function formatDateIndonesian(dateInput) {
    if (!dateInput) return '-';
    let date;
    if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        const parts = String(dateInput).split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            date = new Date(year, month, day);
        } else {
            date = new Date(dateInput);
        }
    }
    if (isNaN(date.getTime())) return String(dateInput);

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

export default function PrintBal({ record }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const bal = record.bal || {};

    // Determine verdict display text
    const rawVerdict = record.verdict || 'PENDING';
    let verdictText = 'MENUNGGU';
    let verdictColor = 'text-[#CA8A04]'; // Amber for warning/pending
    
    if (rawVerdict === 'ACCEPT' || rawVerdict === 'CONDITIONAL') {
        verdictText = 'DITERIMA';
        verdictColor = 'text-[#16A34A]'; // Emerald Green
    } else if (rawVerdict === 'REJECT') {
        verdictText = 'DITOLAK';
        verdictColor = 'text-[#DC2626]'; // Red
    }

    const orderDate = bal.tanggal_mulai || record.tanggal;
    const locationStr = record.latitude && record.longitude 
        ? `${record.latitude}, ${record.longitude}` 
        : (bal.lokasi || record.nama_site || '-');

    return (
        <div className="bg-white min-h-screen text-black font-body text-xs leading-relaxed max-w-[210mm] mx-auto print-container p-8 flex flex-col justify-between">
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
                        className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-wider rounded transition"
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

            <div className="flex-grow space-y-6">
                {/* DOC HEADER */}
                <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4">
                    <div>
                        <img src="/weave-logo.png" alt="Weave Logo" className="h-10 object-contain" />
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-sm text-gray-900 font-headlines">{record.nama_site}</h3>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                            {formatDateIndonesian(bal.tanggal || record.tanggal)} | No. PO: {bal.no_po || record.no_po || '-'}
                        </p>
                    </div>
                </div>

                <div className="text-center py-2">
                    <h1 className="text-base font-black uppercase tracking-wider text-gray-900">BERITA ACARA LAPANGAN</h1>
                </div>

                {/* INTRODUCTORY BODY */}
                <div className="border-t border-b border-gray-900 py-3 my-4 space-y-2">
                    <div className="grid grid-cols-[120px_10px_1fr] gap-x-2">
                        <span className="font-bold text-gray-700">Project</span>
                        <span>:</span>
                        <span className="text-gray-900">{bal.project || record.nama_site || '-'}</span>

                        <span className="font-bold text-gray-700">Pesanan (PO)</span>
                        <span>:</span>
                        <span className="text-gray-900">{bal.no_po || record.no_po || '-'}</span>

                        <span className="font-bold text-gray-700">Tanggal pesanan</span>
                        <span>:</span>
                        <span className="text-gray-900">{formatDateIndonesian(orderDate)}</span>

                        <span className="font-bold text-gray-700">Pelaksana</span>
                        <span>:</span>
                        <span className="text-gray-900">{bal.pelaksana || record.hasil_json?.approval?.vendor_company || '-'}</span>

                        <span className="font-bold text-gray-700">Lokasi</span>
                        <span>:</span>
                        <span className="text-gray-900 font-mono">{locationStr}</span>
                    </div>
                </div>

                {/* BODY CONTENT */}
                <div className="space-y-4 text-justify">
                    <p>
                        Berdasarkan hasil pemeriksaan / Uji Terima, yang dilaksanakan mulai tanggal {formatDateIndonesian(bal.tanggal_mulai)}, oleh Tim Uji Terima terhadap, yang dilaksanakan oleh WEAVE yang terikat Perjanjian Kontrak dengan PT {bal.pihak2 || record.hasil_json?.approval?.cme_company || '........................'} dengan Nomor Pesanan: {bal.no_po || record.no_po || '-'}. Tanggal {formatDateIndonesian(bal.tanggal || record.tanggal)}.
                    </p>
                    <p>
                        Pekerjaan tersebut telah / belum sesuai dengan spesifikasi WEAVE yang ditentukan di dalam Perjanjian Kontrak tersebut dan secara teknis dapat dinyatakan :
                    </p>
                </div>

                {/* VERDICT */}
                <div className="text-center py-6">
                    <h3 className={`text-xl font-black uppercase tracking-widest ${verdictColor}`}>
                        {verdictText}
                    </h3>
                </div>

                {/* CLOSING */}
                <p className="text-justify">
                    Demikian Berita Acara Lapangan ini dibuat dengan sebenarnya dan dipergunakan sebagaimana mestinya.
                </p>

                {/* DUAL SIGNATURE */}
                <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs break-inside-avoid">
                    <div className="flex flex-col justify-between h-32 border border-gray-150 p-4 rounded bg-gray-50/30">
                        <span className="font-bold uppercase tracking-wider text-[9px] text-[#2563EB]">Pihak I (Pelaksana)</span>
                        <span className="text-[10px] font-semibold text-gray-800">{bal.pihak1 || record.hasil_json?.approval?.vendor_company || '-'}</span>
                        <div className="h-8" />
                        <div>
                            <span className="font-bold text-gray-900 underline block">{bal.nama1 || '........................'}</span>
                            <span className="text-[9px] text-gray-500 block mt-0.5">{bal.jabatan1 || 'CME Lead Inspector'}</span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between h-32 border border-gray-150 p-4 rounded bg-gray-50/30">
                        <span className="font-bold uppercase tracking-wider text-[9px] text-gray-500">Pihak II (Pengawas / CME)</span>
                        <span className="text-[10px] font-semibold text-gray-800">{bal.pihak2 || record.hasil_json?.approval?.cme_company || '-'}</span>
                        <div className="h-8" />
                        <div>
                            <span className="font-bold text-gray-900 underline block">{bal.nama2 || '........................'}</span>
                            <span className="text-[9px] text-gray-500 block mt-0.5">{bal.jabatan2 || 'CME Lead Auditor'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="print-footer border-t border-gray-300 pt-2 mt-8 flex justify-between text-[9px] text-gray-500 font-mono">
                <span>{formatDateIndonesian(new Date())}</span>
                <span>PT. Integrasi Jaringan Ekosistem (WEAVE)</span>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body { background: white; margin: 0; padding: 0; }
                    .print\\:hidden { display: none !important; }
                    .print-container { padding: 20mm 15mm !important; min-h-screen; display: flex; flex-direction: column; justify-content: space-between; }
                    .print-footer { border-t: 1px solid #d1d5db; padding-top: 8px; margin-top: auto; }
                }
                @page { size: A4 portrait; margin: 0; }
            `}} />
        </div>
    );
}
