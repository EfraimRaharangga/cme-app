import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import { ClipboardCheck, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

export default function AtpDashboard({ stats, recent }) {
    return (
        <>
            <Head title="ATP Dashboard - Web CME" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                    ATP Dashboard
                </h1>
                <p className="text-sm text-gray-500 font-headlines mt-1">
                    Acceptance Test Procedure Monitoring Hub
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <Card className="border-l-4 border-l-gray-900 p-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total ATP</p>
                            <h4 className="text-xl font-black text-gray-900 mt-1 font-headlines">{stats.total}</h4>
                        </div>
                        <div className="p-2 bg-gray-100 text-gray-900 rounded-full">
                            <ClipboardCheck className="h-4 w-4 stroke-[1.5]" />
                        </div>
                    </div>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 p-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ACCEPT</p>
                            <h4 className="text-xl font-black text-emerald-600 mt-1 font-headlines">{stats.accept}</h4>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
                            <CheckCircle2 className="h-4 w-4 stroke-[1.5]" />
                        </div>
                    </div>
                </Card>

                <Card className="border-l-4 border-l-amber-500 p-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">CONDITIONAL</p>
                            <h4 className="text-xl font-black text-amber-600 mt-1 font-headlines">{stats.conditional}</h4>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-full">
                            <AlertTriangle className="h-4 w-4 stroke-[1.5]" />
                        </div>
                    </div>
                </Card>

                <Card className="border-l-4 border-l-rose-500 p-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">REJECT</p>
                            <h4 className="text-xl font-black text-rose-600 mt-1 font-headlines">{stats.reject}</h4>
                        </div>
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-full">
                            <XCircle className="h-4 w-4 stroke-[1.5]" />
                        </div>
                    </div>
                </Card>

                <Card className="border-l-4 border-l-gray-400 p-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">PENDING</p>
                            <h4 className="text-xl font-black text-gray-600 mt-1 font-headlines">{stats.pending}</h4>
                        </div>
                        <div className="p-2 bg-gray-50 text-gray-500 rounded-full">
                            <Clock className="h-4 w-4 stroke-[1.5]" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card
                        title="📋 ATP Terbaru"
                        headerActions={
                            <Link
                                href="/atp/baru"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00ADB5] hover:bg-[#008f96] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
                            >
                                + ATP Baru
                            </Link>
                        }
                    >
                        <Table headers={['No', 'Nama Site', 'Tanggal', 'Lokasi', 'No. PO', 'Verdict', 'Aksi']}>
                            {recent.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                                        Belum ada data ATP
                                    </td>
                                </tr>
                            ) : (
                                recent.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 text-center font-bold text-gray-500">{idx + 1}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{row.nama_site}</td>
                                        <td className="px-6 py-4 text-center text-gray-500">{row.tanggal}</td>
                                        <td className="px-6 py-4 text-center text-gray-600">{row.region || '-'}</td>
                                        <td className="px-6 py-4 text-center font-medium text-gray-700">{row.no_po}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                                    row.verdict === 'ACCEPT'
                                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                        : row.verdict === 'CONDITIONAL'
                                                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                        : row.verdict === 'REJECT'
                                                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                                                }`}
                                            >
                                                {row.verdict || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                href={`/atp/${row.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition"
                                            >
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </Table>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Panduan Kategori Verdict">
                        <div className="space-y-4 text-xs text-gray-600">
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <span className="w-2.5 h-2.5 mt-1 rounded-full bg-emerald-500 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-gray-900">ACCEPT</p>
                                        <p className="text-[11px]">Seluruh checklist item bernilai YES. Dokumen BAL & BASTP dapat ditandatangani.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-2.5 h-2.5 mt-1 rounded-full bg-amber-500 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-gray-900">CONDITIONAL</p>
                                        <p className="text-[11px]">Sebagian kecil checklist minor bernilai NO. Butuh perbaikan minor dalam 7 hari kerja.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-2.5 h-2.5 mt-1 rounded-full bg-rose-500 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-gray-900">REJECT</p>
                                        <p className="text-[11px]">Terdapat checklist kritikal bernilai NO. Harus dilakukan perbaikan total dan re-ATP.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-3 border-t">
                                <Link href="/instruction" className="text-xs font-bold text-[#00ADB5] hover:underline">
                                    Lihat Panduan Teknis (SOW) &rarr;
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}


AtpDashboard.layout = page => <AppLayout children={page} />;
