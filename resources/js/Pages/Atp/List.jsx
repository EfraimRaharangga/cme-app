import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Input from '../../Components/Input';
import Button from '../../Components/Button';

export default function List({ records, filters }) {
    const [search, setSearch] = useState(filters.cari || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/atp', { cari: search }, { preserveState: true });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ATP ini? Semua data terkait (termasuk foto, BAL, dan BASTP) akan ikut terhapus.')) {
            router.delete(`/atp/${id}`);
        }
    };

    return (
        <>
            <Head title="Riwayat ATP - Web CME" />

            <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Riwayat ATP Check
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Daftar riwayat pemeriksaan Acceptance Test Procedure (ATP) RBS.
                    </p>
                </div>
                <div>
                    <Link
                        href="/atp/baru"
                        className="inline-flex items-center justify-center px-4 py-2 bg-[#00ADB5] border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-[#008f96] transition"
                    >
                        + ATP Baru
                    </Link>
                </div>
            </div>

            <Card className="mb-6 p-4">
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <Input
                        type="text"
                        placeholder="🔍 Cari nama site, region, atau no. PO..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit" variant="primary">
                        Cari
                    </Button>
                </form>
            </Card>

            <Card title="Daftar Laporan ATP">
                <Table headers={['No', 'Nama Site', 'Tanggal', 'Region', 'No. PO', 'Verdict', 'Aksi']}>
                    {records.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                                Belum ada laporan ATP
                            </td>
                        </tr>
                    ) : (
                        records.map((row, idx) => (
                            <tr key={row.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 text-center font-bold text-gray-400">{idx + 1}</td>
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
                                        {row.verdict || 'PENDING'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex gap-2 justify-center">
                                        <Link
                                            href={`/atp/${row.id}`}
                                            className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-700 rounded-md transition"
                                        >
                                            Detail
                                        </Link>
                                        <Link
                                            href={`/atp/${row.id}/edit`}
                                            className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-700 rounded-md transition"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(row.id)}
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
        </>
    );
}


List.layout = page => <AppLayout children={page} />;
