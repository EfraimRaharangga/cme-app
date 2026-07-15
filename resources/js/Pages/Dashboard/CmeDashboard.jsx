import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import { ClipboardCheck, FileSpreadsheet, HardDrive, Users, CheckCircle, Clock } from 'lucide-react';

export default function CmeDashboard({ stats, recentAtp }) {
    return (
        <AppLayout>
            <Head title="CME Dashboard - Web CME" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                    Selamat pagi, CME Administrator 👋
                </h1>
                <p className="text-sm text-gray-500 font-headlines mt-1">
                    Web CME — Central Monitoring &amp; Evaluation Overview
                </p>
            </div>

            {/* STATS WIDGETS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-l-4 border-l-[#00ADB5] p-2 hover:-translate-y-0.5 transition duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total ATP</p>
                            <h4 className="text-2xl font-black text-gray-900 mt-1 font-headlines">{stats.totalAtp}</h4>
                        </div>
                        <div className="p-3 bg-[#00ADB5]/10 text-[#00ADB5] rounded-full">
                            <ClipboardCheck className="h-5 w-5 stroke-[1.5]" />
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 font-medium">
                        {stats.accept} Disetujui &bull; {stats.pending} Tertunda
                    </div>
                </Card>

                <Card className="border-l-4 border-l-gray-900 p-2 hover:-translate-y-0.5 transition duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Survey ODC</p>
                            <h4 className="text-2xl font-black text-gray-900 mt-1 font-headlines">{stats.totalSurvey}</h4>
                        </div>
                        <div className="p-3 bg-gray-100 text-gray-900 rounded-full">
                            <FileSpreadsheet className="h-5 w-5 stroke-[1.5]" />
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 font-medium">
                        {stats.mySurveyCount} Survey Saya
                    </div>
                </Card>

                <Card className="border-l-4 border-l-[#00ADB5] p-2 hover:-translate-y-0.5 transition duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stok Gudang</p>
                            <h4 className="text-2xl font-black text-gray-900 mt-1 font-headlines">{stats.totalBarang}</h4>
                        </div>
                        <div className="p-3 bg-[#00ADB5]/10 text-[#00ADB5] rounded-full">
                            <HardDrive className="h-5 w-5 stroke-[1.5]" />
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 font-medium">
                        Total item terdaftar
                    </div>
                </Card>

                <Card className="border-l-4 border-l-gray-900 p-2 hover:-translate-y-0.5 transition duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengguna</p>
                            <h4 className="text-2xl font-black text-gray-900 mt-1 font-headlines">{stats.totalUsers}</h4>
                        </div>
                        <div className="p-3 bg-gray-100 text-gray-900 rounded-full">
                            <Users className="h-5 w-5 stroke-[1.5]" />
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 font-medium">
                        Akun aktif terdaftar
                    </div>
                </Card>
            </div>

            {/* ASYMMETRICAL GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* RECENT ATP TABLES */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="📋 ATP Terbaru">
                        <Table headers={['Nama Site', 'Tanggal', 'Verdict', 'Aksi']}>
                            {recentAtp.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-medium">
                                        Belum ada data ATP
                                    </td>
                                </tr>
                            ) : (
                                recentAtp.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-bold text-gray-900">{record.nama_site}</td>
                                        <td className="px-6 py-4 text-center text-gray-500">{record.tanggal}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                                    record.verdict === 'ACCEPT'
                                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                        : record.verdict === 'CONDITIONAL'
                                                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                        : record.verdict === 'REJECT'
                                                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                                                }`}
                                            >
                                                {record.verdict || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                href={`/atp/${record.id}`}
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

                {/* QUICK LINKS & SUMMARY */}
                <div className="space-y-6">
                    <Card title="🔗 Akses Cepat">
                        <div className="grid grid-cols-1 gap-3">
                            <Link
                                href="/atp/baru"
                                className="flex items-center justify-between p-3.5 border border-gray-100 rounded-lg hover:border-[#00ADB5] hover:bg-gray-50/20 transition group"
                            >
                                <span className="font-semibold text-sm text-gray-800 group-hover:text-black">📝 Buat ATP Baru</span>
                                <span className="text-gray-400 group-hover:text-[#00ADB5]">&rarr;</span>
                            </Link>
                            <Link
                                href="/survey/baru"
                                className="flex items-center justify-between p-3.5 border border-gray-100 rounded-lg hover:border-[#00ADB5] hover:bg-gray-50/20 transition group"
                            >
                                <span className="font-semibold text-sm text-gray-800 group-hover:text-black">📋 Buat Survey Baru</span>
                                <span className="text-gray-400 group-hover:text-[#00ADB5]">&rarr;</span>
                            </Link>
                            <Link
                                href="/gudang"
                                className="flex items-center justify-between p-3.5 border border-gray-100 rounded-lg hover:border-[#00ADB5] hover:bg-gray-50/20 transition group"
                            >
                                <span className="font-semibold text-sm text-gray-800 group-hover:text-black">📦 Kelola Stok Gudang</span>
                                <span className="text-gray-400 group-hover:text-[#00ADB5]">&rarr;</span>
                            </Link>
                        </div>
                    </Card>

                    <Card title="📊 Ringkasan Kelayakan">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-emerald-50/30 border border-emerald-100 rounded-lg">
                                <span className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                                    <CheckCircle className="h-4 w-4 stroke-[1.5]" />
                                    ATP Diterima
                                </span>
                                <span className="text-xl font-black text-emerald-800">{stats.accept}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-amber-50/30 border border-amber-100 rounded-lg">
                                <span className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider">
                                    <Clock className="h-4 w-4 stroke-[1.5]" />
                                    Draft / Pending
                                </span>
                                <span className="text-xl font-black text-amber-800">{stats.pending}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
