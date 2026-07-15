import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Input from '../../Components/Input';
import Button from '../../Components/Button';

export default function KeluarList({ transactions, filters }) {
    const [search, setSearch] = useState(filters.cari || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/gudang/keluar-history', { cari: search }, { preserveState: true });
    };

    return (
        <>
            <Head title="Riwayat Barang Keluar - Web CME" />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Riwayat Barang Keluar (BK)
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Daftar penyerahan material logistik dan pengeluaran barang dari gudang.
                    </p>
                </div>
                <Link
                    href="/gudang"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition"
                >
                    &larr; Stok Ledger
                </Link>
            </div>

            <Card className="mb-6 p-4">
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <Input
                        type="text"
                        placeholder="🔍 Cari nomor form, pengambil, lokasi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit" variant="primary">
                        Cari
                    </Button>
                </form>
            </Card>

            <Card title="Log Pengeluaran / Barang Keluar">
                <Table headers={['No Form', 'Tanggal', 'Judul Pekerjaan', 'Pengambil', 'Site Tujuan', 'Status', 'Aksi']}>
                    {transactions.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                                Belum ada log transaksi keluar
                            </td>
                        </tr>
                    ) : (
                        transactions.map((tr) => (
                            <tr key={tr.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-mono font-bold text-gray-900">{tr.no_form}</td>
                                <td className="px-6 py-4 text-center text-gray-500">{tr.tanggal}</td>
                                <td className="px-6 py-4 font-semibold text-gray-800">{tr.judul || '-'}</td>
                                <td className="px-6 py-4 font-medium text-gray-700">{tr.pengambil}</td>
                                <td className="px-6 py-4 text-center text-gray-700">{tr.lokasi_tujuan}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                        RELEASED
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Link
                                        href={`/gudang/keluar-history/${tr.id}`}
                                        className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-700 rounded-md transition"
                                    >
                                        Detail
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </Table>
            </Card>
        </>
    );
}


KeluarList.layout = page => <AppLayout children={page} />;
