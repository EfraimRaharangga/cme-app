import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer } from 'lucide-react';

function terbilang(num) {
    const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    if (num < 12) return units[num];
    if (num < 20) return terbilang(num - 10) + ' Belas';
    if (num < 100) return terbilang(Math.floor(num / 10)) + ' Puluh ' + units[num % 10];
    if (num < 200) return 'Seratus ' + terbilang(num - 100);
    if (num < 1000) return terbilang(Math.floor(num / 100)) + ' Ratus ' + terbilang(num % 100);
    if (num < 2000) return 'Seribu ' + terbilang(num - 1000);
    if (num < 1000000) return terbilang(Math.floor(num / 1000)) + ' Ribu ' + terbilang(num % 1000);
    return String(num);
}

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

function getBastpDateParts(dateInput) {
    if (!dateInput) {
        return {
            dayName: '........................',
            dateWord: '........................',
            monthName: '........................',
            yearWord: '........................',
            formattedNumeric: '../../....'
        };
    }
    let date;
    const parts = String(dateInput).split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        date = new Date(year, month, day);
    } else {
        date = new Date(dateInput);
    }
    if (isNaN(date.getTime())) {
        return {
            dayName: '........................',
            dateWord: '........................',
            monthName: '........................',
            yearWord: '........................',
            formattedNumeric: '../../....'
        };
    }

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthNum = date.getMonth();
    const yearNum = date.getFullYear();

    const dateWord = terbilang(dayNum);
    const monthName = months[monthNum];
    const yearWord = terbilang(yearNum);

    const dd = String(dayNum).padStart(2, '0');
    const mm = String(monthNum + 1).padStart(2, '0');
    const yyyy = String(yearNum);

    return {
        dayName,
        dateWord,
        monthName,
        yearWord,
        formattedNumeric: `${dd}/${mm}/${yyyy}`
    };
}

export default function PrintBastp({ record }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const bastp = record.bastp || {};
    const dateParts = getBastpDateParts(record.tanggal);

    return (
        <div className="bg-white min-h-screen text-black font-body text-xs leading-relaxed max-w-[210mm] mx-auto print-container p-8 flex flex-col justify-between">
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
                        className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-wider rounded transition"
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

            <div className="flex-grow space-y-6">
                {/* HEADER */}
                <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4">
                    <div>
                        <img src="/weave-logo.png" alt="Weave Logo" className="h-10 object-contain" />
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-sm text-gray-900 font-headlines">{record.nama_site}</h3>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                            {formatDateIndonesian(record.tanggal)} | No. PO: {record.no_po || '-'}
                        </p>
                    </div>
                </div>

                <div className="text-center py-2">
                    <h1 className="text-base font-black uppercase tracking-wider text-gray-900">BERITA ACARA SERAH TERIMA PEKERJAAN</h1>
                </div>

                {/* OPENING STATEMENT */}
                <p className="text-justify">
                    Pada hari ini <b>{dateParts.dayName}</b> Tanggal <b>{dateParts.dateWord}</b> Bulan <b>{dateParts.monthName}</b> Tahun <b>{dateParts.yearWord}</b> (<b>{dateParts.formattedNumeric}</b>), kami yang bertanda tangan di bawah ini:
                </p>

                {/* PARTIES INFO */}
                <div className="space-y-4">
                    {/* PIHAK PERTAMA */}
                    <div className="border border-gray-200 rounded p-4 bg-gray-50/10 space-y-2">
                        <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">PIHAK PERTAMA</span>
                        <div className="grid grid-cols-[100px_10px_1fr] gap-x-2">
                            <span className="text-gray-650">Nama</span>
                            <span>:</span>
                            <span className="font-semibold text-gray-900">{bastp.p1_nama || '-'}</span>

                            <span className="text-gray-650">No PO</span>
                            <span>:</span>
                            <span className="font-semibold text-gray-950 font-mono">{record.no_po || '-'}</span>

                            <span className="text-gray-650">Alamat</span>
                            <span>:</span>
                            <span className="text-gray-700">{bastp.p1_alamat || '-'}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic mt-2">
                            Dalam hal ini untuk selanjutnya disebut dengan PIHAK PERTAMA
                        </p>
                    </div>

                    {/* PIHAK KEDUA */}
                    <div className="border border-gray-200 rounded p-4 bg-gray-50/10 space-y-2">
                        <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">PIHAK KEDUA</span>
                        <div className="grid grid-cols-[100px_10px_1fr] gap-x-2">
                            <span className="text-gray-650">Nama</span>
                            <span>:</span>
                            <span className="font-semibold text-gray-900">{bastp.p2_nama || '-'}</span>

                            <span className="text-gray-650">Jabatan</span>
                            <span>:</span>
                            <span className="font-semibold text-gray-900">{bastp.p2_jabatan || '-'}</span>

                            <span className="text-gray-650">Alamat</span>
                            <span>:</span>
                            <span className="text-gray-700">{bastp.p2_alamat || '-'}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic mt-2">
                            Dalam hal ini untuk selanjutnya disebut dengan PIHAK KEDUA
                        </p>
                    </div>
                </div>

                {/* WORK DETAILS */}
                <div className="space-y-3">
                    <p className="text-justify">
                        PIHAK PERTAMA menyerahkan hasil pekerjaan kepada PIHAK KEDUA, dan PIHAK KEDUA menerima penyerahan hasil pekerjaan tersebut berupa:
                    </p>
                    <div className="border border-gray-300 p-4 rounded bg-gray-50/30">
                        <p className="font-bold text-gray-800">Nama Pekerjaan:</p>
                        <p className="text-gray-950 mt-1 font-semibold text-[13px]">{bastp.pekerjaan || 'Pekerjaan Pemasangan ODC & Rack Infrastructure Site ' + record.nama_site}</p>
                    </div>
                    <p className="text-justify">
                        Pekerjaan tersebut telah diperiksa melalui checklist ATP dengan status kelayakan final <b className="text-[#16A34A]">{record.verdict}</b>.
                    </p>
                </div>

                {/* CLOSING STATEMENT */}
                <p className="text-justify">
                    Demikian Berita Acara Serah Terima Pekerjaan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
                </p>

                {/* DUAL SIGNATURE */}
                <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs break-inside-avoid">
                    <div className="flex flex-col justify-between h-32 border border-gray-150 p-4 rounded bg-gray-50/30">
                        <span className="font-bold uppercase tracking-wider text-[9px] text-[#2563EB]">PIHAK PERTAMA</span>
                        <span className="font-bold text-gray-900">{bastp.p1_nama || '........................'}</span>
                        <div className="h-8" />
                        <div>
                            <span className="font-bold text-gray-900 block border-t border-gray-300 pt-1 w-40 mx-auto">Pelaksana Pekerjaan</span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between h-32 border border-gray-150 p-4 rounded bg-gray-50/30">
                        <span className="font-bold uppercase tracking-wider text-[9px] text-gray-500">PIHAK KEDUA</span>
                        <span className="font-bold text-gray-900">{bastp.p2_nama || '........................'}</span>
                        <div className="h-8" />
                        <div>
                            <span className="font-bold text-gray-900 block border-t border-gray-300 pt-1 w-40 mx-auto">{bastp.p2_jabatan || 'Pemberi Kerja'}</span>
                        </div>
                    </div>
                </div>

                {/* WITNESSES SECTION */}
                {(bastp.mengetahui1 || bastp.mengetahui2) && (
                    <div className="pt-8 border-t border-gray-200 break-inside-avoid">
                        <p className="text-center font-bold text-gray-500 uppercase tracking-widest text-[9px] mb-4">Mengetahui / Saksi Pemeriksa</p>
                        <div className="grid grid-cols-2 gap-12 text-center text-xs">
                            {bastp.mengetahui1 ? (
                                <div>
                                    <div className="h-12" />
                                    <span className="font-bold text-gray-900 underline block">{bastp.mengetahui1}</span>
                                    <span className="text-[9px] text-gray-450 block mt-0.5">Saksi Pelaksana</span>
                                </div>
                            ) : <div />}
                            {bastp.mengetahui2 ? (
                                <div>
                                    <div className="h-12" />
                                    <span className="font-bold text-gray-900 underline block">{bastp.mengetahui2}</span>
                                    <span className="text-[9px] text-gray-455 block mt-0.5">Saksi Pemberi Kerja</span>
                                </div>
                            ) : <div />}
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div className="print-footer border-t border-gray-300 pt-2 mt-8 flex justify-between text-[9px] text-gray-500 font-mono">
                <span>{formatDateIndonesian(new Date())}</span>
                <span>PT. Integrasi Jaringan Ekosistem (WEAVE)</span>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
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
