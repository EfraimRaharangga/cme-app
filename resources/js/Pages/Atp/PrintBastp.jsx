import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer } from 'lucide-react';

export default function PrintBastp({ record }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const bastp = record.bastp || {};

    return (
        <div className="bg-white min-h-screen p-12 text-black font-body text-xs leading-relaxed max-w-[210mm] mx-auto space-y-6">
            <Head title={`BASTP - ${record.nama_site}`} />

            {/* PRINT BAR */}
            <div className="mb-6 flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 print:hidden">
                <span className="font-bold text-gray-700 flex items-center gap-2">
                    <Printer className="h-4 w-4 stroke-[1.5]" />
                    Pratinjau Cetak BASTP / Handover
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-1.5 bg-[#00ADB5] hover:bg-[#008f96] text-white text-xs font-bold uppercase tracking-wider rounded transition"
                    >
                        Cetak BASTP
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
            <div className="text-center border-b pb-4">
                <h2 className="text-base font-black uppercase tracking-wider">BERITA ACARA SERAH TERIMA PEKERJAAN (BASTP)</h2>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">No. PO: {record.no_po || '-'}</p>
            </div>

            {/* INTRO */}
            <div className="space-y-3">
                <p>
                    Kami yang bertanda tangan di bawah ini pada hari ini, tanggal <b>{record.tanggal || '........................'}</b>:
                </p>

                <div className="pl-4 space-y-2">
                    <div className="flex gap-2">
                        <span className="font-bold w-4">1.</span>
                        <div className="flex-grow">
                            <span className="font-bold">PIHAK PERTAMA (Pelaksana Pekerjaan):</span>
                            <div className="mt-1 flex gap-2">
                                <span className="w-16 text-gray-500">Nama</span>
                                <span className="w-2">:</span>
                                <span className="font-semibold text-gray-900">{bastp.p1_nama || '-'}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="w-16 text-gray-500">Alamat</span>
                                <span className="w-2">:</span>
                                <span className="text-gray-700">{bastp.p1_alamat || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <span className="font-bold w-4">2.</span>
                        <div className="flex-grow">
                            <span className="font-bold">PIHAK KEDUA (Pemberi Kerja):</span>
                            <div className="mt-1 flex gap-2">
                                <span className="w-16 text-gray-500">Nama</span>
                                <span className="w-2">:</span>
                                <span className="font-semibold text-gray-900">{bastp.p2_nama || '-'}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="w-16 text-gray-500">Jabatan</span>
                                <span className="w-2">:</span>
                                <span className="text-gray-700">{bastp.p2_jabatan || '-'}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="w-16 text-gray-500">Alamat</span>
                                <span className="w-2">:</span>
                                <span className="text-gray-700">{bastp.p2_alamat || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AGREEMENTS STATEMENT */}
            <div className="space-y-3">
                <p>
                    PIHAK PERTAMA menyerahkan hasil pekerjaan kepada PIHAK KEDUA, dan PIHAK KEDUA menerima penyerahan hasil pekerjaan tersebut berupa:
                </p>
                <div className="border border-gray-900 p-4 rounded bg-gray-50/50">
                    <p className="font-bold text-gray-800">Nama Pekerjaan:</p>
                    <p className="text-gray-700 mt-1 font-semibold">{bastp.pekerjaan || 'Pekerjaan Pemasangan ODC & Rack Infrastructure Site ' + record.nama_site}</p>
                </div>
                <p>
                    Pekerjaan tersebut telah diperiksa melalui checklist ATP dengan status kelayakan final <b>{record.verdict}</b>.
                </p>
            </div>

            {/* DUAL SIGNATURE */}
            <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs">
                <div className="flex flex-col justify-between h-32 border border-gray-150 p-4 rounded bg-gray-50/50">
                    <span className="font-bold uppercase tracking-wider text-[9px] text-[#00ADB5]">PIHAK PERTAMA</span>
                    <span className="font-bold text-gray-900">{bastp.p1_nama || '........................'}</span>
                    <div className="h-10" />
                    <div>
                        <span className="font-bold text-gray-900 block border-t pt-1 w-40 mx-auto">Pelaksana Pekerjaan</span>
                    </div>
                </div>

                <div className="flex flex-col justify-between h-32 border border-gray-150 p-4 rounded bg-gray-50/50">
                    <span className="font-bold uppercase tracking-wider text-[9px] text-gray-500">PIHAK KEDUA</span>
                    <span className="font-bold text-gray-900">{bastp.p2_nama || '........................'}</span>
                    <div className="h-10" />
                    <div>
                        <span className="font-bold text-gray-900 block border-t pt-1 w-40 mx-auto">{bastp.p2_jabatan || 'Pemberi Kerja'}</span>
                    </div>
                </div>
            </div>

            {/* WITNESSES SECTION */}
            {(bastp.mengetahui1 || bastp.mengetahui2) && (
                <div className="pt-8 border-t border-gray-200 break-inside-avoid">
                    <p className="text-center font-bold text-gray-500 uppercase tracking-widest text-[9px] mb-4">Mengetahui / Saksi Pemeriksa</p>
                    <div className="grid grid-cols-2 gap-12 text-center text-xs">
                        {bastp.mengetahui1 && (
                            <div>
                                <div className="h-12" />
                                <span className="font-bold text-gray-900 underline block">{bastp.mengetahui1}</span>
                                <span className="text-[9px] text-gray-400 block mt-0.5">Saksi Pelaksana</span>
                            </div>
                        )}
                        {bastp.mengetahui2 && (
                            <div>
                                <div className="h-12" />
                                <span className="font-bold text-gray-900 underline block">{bastp.mengetahui2}</span>
                                <span className="text-[9px] text-gray-400 block mt-0.5">Saksi Pemberi Kerja</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
