import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Input from '../../Components/Input';
import Button from '../../Components/Button';

export default function MasukList({ transactions, filters }) {
    const [search, setSearch] = useState(filters.cari || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/gudang/masuk-history', { cari: search }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Riwayat Barang Masuk - Web CME" />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Riwayat Barang Masuk (BM)
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Daftar transaksi barang masuk dan suplai logistik terdata.
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
                        placeholder="🔍 Cari nomor form, supplier, penerima..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit" variant="primary">
                        Cari
                    </Button>
                </form>
            </Card>

            <Card title="Log Surat Jalan / Barang Masuk">
                <Table headers={['No Form', 'Tanggal', 'Judul Transaksi', 'Supplier', 'Penerima', 'Lokasi', 'Aksi']}>
                    {transactions.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                                Belum ada log transaksi masuk
                            </td>
                        </tr>
                    ) : (
                        transactions.map((tr) => (
                            <tr key={tr.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-mono font-bold text-gray-900">{tr.no_form}</td>
                                <td className="px-6 py-4 text-center text-gray-500">{tr.tanggal}</td>
                                <td className="px-6 py-4 font-semibold text-gray-800">{tr.judul || '-'}</td>
                                <td className="px-6 py-4 font-medium text-gray-700">{tr.supplier}</td>
                                <td className="px-6 py-4 text-center text-gray-700">{tr.penerima}</td>
                                <td className="px-6 py-4 text-center text-gray-600">{tr.lokasi || '-'}</td>
                                <td className="px-6 py-4 text-center">
                                    <Link
                                        href={`/gudang/masuk-history/${tr.id}`}
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
        </AppLayout>
    );
}
