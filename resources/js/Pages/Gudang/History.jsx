import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Select from '../../Components/Select';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Search, { filterData } from '../../Components/Search';
import Pagination from '../../Components/Pagination';
import Breadcrumbs from '../../Components/Breadcrumbs';

export default function History({ transactions, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters.cari || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [currentPage, setCurrentPage] = useState(1);

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
        setCurrentPage(1);
    };

    // Filter by type first
    const typeFiltered = selectedType 
        ? transactions.filter(t => t.type === selectedType)
        : transactions;

    // Filter deeply by search query
    const filteredTransactions = filterData(typeFiltered, searchQuery);
    
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            <Head title="Riwayat Transaksi Gudang - Web CME" />

            <Breadcrumbs items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Gudang', href: '/gudang' },
                { label: 'Riwayat Transaksi' }
            ]} />

            <div className="mb-6 flex items-center gap-3">
                <Link
                    href="/gudang"
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-black transition shrink-0"
                >
                    <ArrowLeft className="h-4 w-4 stroke-[1.5]" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Riwayat Transaksi Gudang
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Log gabungan seluruh barang masuk (BM) dan barang keluar (BK) dari inventaris.
                    </p>
                </div>
            </div>

            <Card className="mb-6 p-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="w-full sm:w-72">
                        <Search value={searchQuery} onChange={handleSearchChange} placeholder="Cari riwayat..." />
                    </div>
                    <div className="w-full sm:w-48">
                        <Select
                            value={selectedType}
                            onChange={handleTypeChange}
                            options={[
                                { label: 'Semua Transaksi', value: '' },
                                { label: 'Barang Masuk (BM)', value: 'masuk' },
                                { label: 'Barang Keluar (BK)', value: 'keluar' }
                            ]}
                            placeholder="Pilih Tipe..."
                        />
                    </div>
                </div>
            </Card>

            <Card title="Log Mutasi & Surat Jalan Inventaris">
                <Table headers={['No Form', 'Tipe', 'Tanggal', 'Judul Transaksi / Proyek', 'Pihak Terkait / PJ', 'Lokasi Rak / Tujuan', 'Aksi']}>
                    {paginatedTransactions.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                                Belum ada log transaksi yang sesuai
                            </td>
                        </tr>
                    ) : (
                        paginatedTransactions.map((tr) => {
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

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredTransactions.length}
                    itemsPerPage={itemsPerPage}
                />
            </Card>
        </>
    );
}

History.layout = page => <AppLayout children={page} />;
