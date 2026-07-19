import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Search, { filterData } from '../../Components/Search';
import Pagination from '../../Components/Pagination';

export default function MasukDetail({ transaction }) {
    const photos = transaction.media_urls || [];
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const filteredDetails = filterData(transaction.details, searchQuery);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredDetails.length / itemsPerPage);
    const paginatedDetails = filteredDetails.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            <Head title={`Detail Masuk ${transaction.no_form} - Web CME`} />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Detail Barang Masuk
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Surat jalan masuk &bull; Form: {transaction.no_form}
                    </p>
                </div>
                <Link
                    href="/gudang/history"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition"
                >
                    &larr; Riwayat
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Items received lists */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="📦 Rincian Barang Diterima">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 mb-4">
                            <Search value={searchQuery} onChange={handleSearchChange} />
                        </div>

                        <Table headers={['No', 'Spesifikasi Barang', 'Kategori', 'Tipe / Model', 'Kuantitas Diterima', 'Satuan']}>
                            {paginatedDetails.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400 font-medium">
                                        Tidak ada rincian barang diterima.
                                    </td>
                                </tr>
                            ) : (
                                paginatedDetails.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-3 text-center font-bold text-gray-400">
                                            {(currentPage - 1) * itemsPerPage + idx + 1}
                                        </td>
                                        <td className="px-6 py-3 font-bold text-gray-900">{row.nama_barang}</td>
                                        <td className="px-6 py-3 text-center text-gray-500 font-medium">{row.barang?.kategori || '-'}</td>
                                        <td className="px-6 py-3 text-center text-gray-600 font-mono text-xs">{row.tipe_barang || '-'}</td>
                                        <td className="px-6 py-3 text-center font-black text-gray-800">{row.jumlah}</td>
                                        <td className="px-6 py-3 text-center text-gray-500">{row.satuan}</td>
                                    </tr>
                                ))
                            )}
                        </Table>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredDetails.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </Card>
                </div>

                {/* Metadata card */}
                <div className="space-y-6">
                    <Card title="📝 Metadata Transaksi">
                        <div className="space-y-4 text-xs text-gray-700">
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase">Judul Batch</p>
                                <p className="text-sm font-bold text-gray-900 mt-0.5">{transaction.judul || '-'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Tanggal Terima</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{transaction.tanggal}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Blok / Lokasi Rak</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{transaction.lokasi || '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Supplier Pengirim</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{transaction.supplier}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Penerima Gudang</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{transaction.penerima}</p>
                                </div>
                            </div>

                            {transaction.keterangan && (
                                <div className="pt-3 border-t border-gray-100">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Catatan / Memo</p>
                                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">{transaction.keterangan}</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* ATTACHMENT NOTES PICTURES */}
                    {photos.length > 0 && (
                        <Card title=" Nota &amp; Surat Jalan Fisik">
                            <div className="grid grid-cols-2 gap-3">
                                {photos.map((ph, idx) => (
                                    <div key={idx} className="border border-gray-150 rounded-lg overflow-hidden bg-gray-50">
                                        <img
                                            src={ph}
                                            alt="Surat Jalan"
                                            className="w-full h-32 object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

MasukDetail.layout = page => <AppLayout children={page} />;
