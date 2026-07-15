import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Input from '../../Components/Input';
import Button from '../../Components/Button';
import ConfirmationModal from '../../Components/ConfirmationModal';

export default function List({ surveys, filters }) {
    const [search, setSearch] = useState(filters.cari || '');
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/survey', { cari: search }, { preserveState: true });
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Hapus Laporan Survey',
            message: 'Apakah Anda yakin ingin menghapus data survey ODC ini? Semua data terkait (termasuk foto) akan ikut terhapus.',
            type: 'danger',
            onConfirm: () => router.delete(`/survey/${id}`)
        });
    };

    return (
        <>
            <Head title="Riwayat Survey - Web CME" />

            <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Riwayat Survey ODC
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Daftar riwayat pemeriksaan site dan koordinat surveyor.
                    </p>
                </div>
                <div>
                    <Link
                        href="/survey/baru"
                        className="inline-flex items-center justify-center px-4 py-2 bg-[#00ADB5] border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-[#008f96] transition"
                    >
                        + Survey Baru
                    </Link>
                </div>
            </div>

            <Card className="mb-6 p-4">
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <Input
                        type="text"
                        placeholder="Cari nama site, surveyor, atau lokasi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit" variant="primary">
                        Cari
                    </Button>
                </form>
            </Card>

            <Card title="Daftar Laporan Survey ODC">
                <Table headers={['Nama Site', 'Tanggal Survey', 'Surveyor', 'Lokasi', 'Koordinat', 'Aksi']}>
                    {surveys.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-400 font-medium">
                                Belum ada laporan survey ODC
                            </td>
                        </tr>
                    ) : (
                        surveys.map((survey) => (
                            <tr key={survey.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-bold text-gray-900">{survey.nama_site}</td>
                                <td className="px-6 py-4 text-center text-gray-500">{survey.tanggal_survey}</td>
                                <td className="px-6 py-4 text-center font-medium text-gray-700">{survey.nama_surveyor}</td>
                                <td className="px-6 py-4 text-gray-600">{survey.lokasi || '-'}</td>
                                <td className="px-6 py-4 text-center">
                                    {survey.latitude ? (
                                        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                                            {survey.latitude}, {survey.longitude}
                                        </code>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex gap-2 justify-center">
                                        <Link
                                            href={`/survey/${survey.id}`}
                                            className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-700 rounded-md transition"
                                        >
                                            Detail
                                        </Link>
                                        <Link
                                            href={`/survey/${survey.id}/edit`}
                                            className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-700 rounded-md transition"
                                        >
                                            Edit
                                        </Link>
                                        <Link
                                            href={`/survey/${survey.id}/print`}
                                            className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-700 rounded-md transition"
                                        >
                                            Cetak
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(survey.id)}
                                            className="px-2.5 py-1 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-300 border border-gray-300 text-xs font-semibold text-gray-700 rounded-md transition"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </Table>
            </Card>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </>
    );
}


List.layout = page => <AppLayout children={page} />;
