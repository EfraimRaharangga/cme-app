import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import { FileSpreadsheet, Users, User } from 'lucide-react';
import Search, { filterData } from '../../Components/Search';
import Pagination from '../../Components/Pagination';
import Breadcrumbs from '../../Components/Breadcrumbs';

export default function SurveyDashboard({ stats, recent }) {
    const { auth } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const filteredRecent = filterData(recent, searchQuery);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredRecent.length / itemsPerPage);
    const paginatedRecent = filteredRecent.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            <Head title="Survey ODC Dashboard - Web CME" />

            <Breadcrumbs items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Survey ODC' }
            ]} />

            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                    Survey ODC Dashboard
                </h1>
                <p className="text-sm text-gray-500 font-headlines mt-1">
                    Web CME — Radio Base Station Site Surveyor Stats Hub
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card 
                    className="border-l-4 border-l-[#00ADB5] p-2 cursor-pointer hover:bg-gray-50 transition duration-150"
                    onClick={() => handleSearchChange('')}
                >
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

                <Card 
                    className="border-l-4 border-l-gray-900 p-2 cursor-pointer hover:bg-gray-50 transition duration-150"
                    onClick={() => handleSearchChange(auth?.user?.name || auth?.user?.username || '')}
                >
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

                <Link href="/users" className="block">
                    <Card className="border-l-4 border-l-[#00ADB5] p-2 cursor-pointer hover:bg-gray-50 transition duration-150 h-full">
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
                </Link>
            </div>

            <div className="space-y-8">
                <Card
                    title="Survey Terbaru"
                    headerActions={
                        <Link
                            href="/survey/baru"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00ADB5] hover:bg-[#008f96] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
                        >
                            + Survey Baru
                        </Link>
                    }
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 mb-4">
                        <Search value={searchQuery} onChange={handleSearchChange} />
                    </div>

                    <Table headers={['Nama Site', 'Tanggal Survey', 'Surveyor', 'Lokasi', 'Aksi']}>
                        {paginatedRecent.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-medium">
                                    Belum ada data survey
                                </td>
                            </tr>
                        ) : (
                            paginatedRecent.map((row) => (
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

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredRecent.length}
                        itemsPerPage={itemsPerPage}
                    />
                </Card>

                <Card title="Peta & Panduan Lapangan">
                    <div className="space-y-4 text-xs text-gray-600">
                        <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-teal-900">
                            <h5 className="font-bold mb-1">Standard ODC Survey</h5>
                            <p className="leading-relaxed">Pastikan koordinat GPS presisi dan foto terdokumentasi lengkap (Depan, Dalam, Samping, Detail Grounding).</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00ADB5]" />
                                <span>Gunakan kamera HP dengan geotagging aktif</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00ADB5]" />
                                <span>Isi semua form checklist template dengan lengkap</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00ADB5]" />
                                <span>Sync data ketika sinyal internet stabil</span>
                            </div>
                        </div>
                        <div className="pt-2 border-t">
                            <Link href="/instruction" className="text-xs font-bold text-[#00ADB5] hover:underline">
                                Lihat Panduan Teknis (SOW) &rarr;
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}

SurveyDashboard.layout = page => <AppLayout children={page} />;
