import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Input from '../../Components/Input';
import Button from '../../Components/Button';
import Select from '../../Components/Select';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function History({ transactions, filters }) {
    const [search, setSearch] = useState(filters.cari || '');
    const [type, setType] = useState(filters.type || '');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        setIsSearching(true);
        router.get('/gudang/history', { cari: search, type }, {
            preserveState: true,
            onFinish: () => setIsSearching(false)
        });
    };

    const handleTypeChange = (e) => {
        const val = e.target.value;
        setType(val);
        router.get('/gudang/history', { cari: search, type: val }, { preserveState: true });
    };

    return (
        <>
            <Head title="Riwayat Transaksi Gudang - Web CME" />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Riwayat Transaksi Gudang
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Log gabungan seluruh barang masuk (BM) dan barang keluar (BK) dari inventaris.
                    </p>
                </div>
                <Link
                    href="/gudang"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-semibold text-text hover:bg-surface hover:text-primary transition duration-150"
                >
                    <ArrowLeft className="h-3.5 w-3.5 stroke-[1.5]" />
                    Stok Ledger
                </Link>
            </div>

            <Card className="mb-6 p-4">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                    <div className="flex-grow">
                        <Input
                            type="text"
                            placeholder="Cari nomor form, supplier, pengambil, site..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <Select
                            value={type}
                            onChange={handleTypeChange}
                            options={[
                                { label: 'Semua Transaksi', value: '' },
                                { label: 'Barang Masuk (BM)', value: 'masuk' },
                                { label: 'Barang Keluar (BK)', value: 'keluar' }
                            ]}
                            placeholder="Pilih Tipe..."
                        />
                    </div>
                    <Button type="submit" variant="primary" processing={isSearching}>
                        Cari
                    </Button>
                </form>
            </Card>

            <Card title="Log Mutasi & Surat Jalan Inventaris">
                <Table headers={['No Form', 'Tipe', 'Tanggal', 'Judul Transaksi / Proyek', 'Pihak Terkait / PJ', 'Lokasi Rak / Tujuan', 'Aksi']}>
                    {transactions.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                                Belum ada log transaksi yang sesuai
                            </td>
                        </tr>
                    ) : (
                        transactions.map((tr) => {
                            const isMasuk = tr.type === 'masuk';
                            return (
                                <tr key={`${tr.type}-${tr.id}`} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{tr.no_form}</td>
                                    <td className="px-6 py-4 text-center">
                                        {isMasuk ? (
                                            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-250 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                <ArrowUpRight className="h-3 w-3 text-emerald-600 stroke-[2]" />
                                                Masuk
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                <ArrowDownLeft className="h-3 w-3 text-amber-600 stroke-[2]" />
                                                Keluar
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-500 whitespace-nowrap">{tr.tanggal}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">{tr.judul || '-'}</td>
                                    <td className="px-6 py-4 font-medium text-gray-700">
                                        {tr.pihak}
                                        {tr.penerima_pengambil && tr.penerima_pengambil !== tr.pihak && (
                                            <span className="block text-[10px] text-gray-400 font-normal">
                                                PJ: {tr.penerima_pengambil}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-600 font-medium">{tr.lokasi}</td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <Link
                                            href={isMasuk ? `/gudang/masuk-history/${tr.id}` : `/gudang/keluar-history/${tr.id}`}
                                            className="inline-flex items-center justify-center px-3 py-1 bg-white hover:bg-surface border border-border text-xs font-semibold text-text hover:text-primary rounded-lg transition duration-150"
                                        >
                                            Detail
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </Table>
            </Card>
        </>
    );
}

History.layout = page => <AppLayout children={page} />;
