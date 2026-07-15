import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import { FileSpreadsheet, Users, User } from 'lucide-react';

export default function SurveyDashboard({ stats, recent }) {
    return (
        <AppLayout>
            <Head title="Survey ODC Dashboard - Web CME" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                    Survey ODC Dashboard
                </h1>
                <p className="text-sm text-gray-500 font-headlines mt-1">
                    Web CME — Radio Base Station Site Surveyor Stats Hub
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-l-4 border-l-[#00ADB5] p-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Survey</p>
                            <h4 className="text-2xl font-black text-gray-900 mt-1 font-headlines">{stats.total}</h4>
                        </div>
                        <div className="p-3 bg-[#00ADB5]/10 text-[#00ADB5] rounded-full">
                            <FileSpreadsheet className="h-5 w-5 stroke-[1.5]" />
                        </div>
                    </div>
                </Card>

                <Card className="border-l-4 border-l-gray-900 p-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Survey Saya</p>
                            <h4 className="text-2xl font-black text-gray-900 mt-1 font-headlines">{stats.mine}</h4>
                        </div>
                        <div className="p-3 bg-gray-100 text-gray-900 rounded-full">
                            <User className="h-5 w-5 stroke-[1.5]" />
                        </div>
                    </div>
                </Card>

                <Card className="border-l-4 border-l-[#00ADB5] p-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pengguna</p>
                            <h4 className="text-2xl font-black text-gray-900 mt-1 font-headlines">{stats.users}</h4>
                        </div>
                        <div className="p-3 bg-[#00ADB5]/10 text-[#00ADB5] rounded-full">
                            <Users className="h-5 w-5 stroke-[1.5]" />
                        </div>
                    </div>
                </Card>
            </div>

            <Card
                title="📊 Survey Terbaru"
                headerActions={
                    <Link
                        href="/survey/baru"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00ADB5] hover:bg-[#008f96] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
                    >
                        + Survey Baru
                    </Link>
                }
            >
                <Table headers={['Nama Site', 'Tanggal Survey', 'Surveyor', 'Lokasi', 'Aksi']}>
                    {recent.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-medium">
                                Belum ada data survey
                            </td>
                        </tr>
                    ) : (
                        recent.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-bold text-gray-900">{row.nama_site}</td>
                                <td className="px-6 py-4 text-center text-gray-500">{row.tanggal_survey}</td>
                                <td className="px-6 py-4 text-center font-medium text-gray-700">{row.nama_surveyor}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    {row.lokasi || '-'}
                                    {row.latitude && (
                                        <div className="mt-1">
                                            <code className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                                {row.latitude}, {row.longitude}
                                            </code>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Link
                                        href={`/survey/${row.id}`}
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
        </AppLayout>
    );
}
