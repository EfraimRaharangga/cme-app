import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Search, { filterData } from '../../Components/Search';
import Pagination from '../../Components/Pagination';
import Modal from '../../Components/Modal';
import { FileText, Image as ImageIcon, Download, Eye } from 'lucide-react';

export default function KeluarDetail({ transaction }) {
    const photos = transaction.media_urls || [];
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Preview states
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewType, setPreviewType] = useState(null); // 'pdf' | 'image'

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const triggerPreview = (url) => {
        const isPdf = url.toLowerCase().endsWith('.pdf');
        setPreviewUrl(url);
        setPreviewType(isPdf ? 'pdf' : 'image');
    };

    const filteredDetails = filterData(transaction.details, searchQuery);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredDetails.length / itemsPerPage);
    const paginatedDetails = filteredDetails.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            <Head title={`Detail Keluar ${transaction.no_form} - Web CME`} />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Detail Barang Keluar
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Surat jalan penyerahan &bull; Form: {transaction.no_form}
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
                {/* Items lists */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Rincian Barang Diserahkan">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 mb-4">
                            <Search value={searchQuery} onChange={handleSearchChange} />
                        </div>

                        <Table headers={['No', 'Spesifikasi Barang', 'Kategori', 'Tipe / Model', 'Kuantitas Rilis', 'Satuan']}>
                            {paginatedDetails.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400 font-medium">
                                        Tidak ada rincian barang diserahkan.
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

                {/* Metadata details */}
                <div className="space-y-6">
                    <Card title="Metadata Pengeluaran">
                        <div className="space-y-4 text-xs text-gray-700">
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase">Judul Pekerjaan</p>
                                <p className="text-sm font-bold text-gray-900 mt-0.5">{transaction.judul || '-'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Tanggal Rilis</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{transaction.tanggal}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Site Penerima</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{transaction.lokasi_tujuan}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Pengambil</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{transaction.pengambil}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Jabatan</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{transaction.jabatan || '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Keperluan Proyek</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{transaction.proyek || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Disetujui Oleh</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{transaction.disetujui || '-'}</p>
                                </div>
                            </div>

                            {transaction.keterangan && (
                                <div className="pt-3 border-t border-gray-100">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Catatan / Memo</p>
                                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">{transaction.keterangan}</p>
                                </div>
                            )}

                            {photos.length > 0 && (
                                <div className="pt-3 border-t border-gray-100 space-y-2">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Lampiran Dokumen</p>
                                    <div className="space-y-2">
                                        {photos.map((ph, idx) => {
                                            const filename = ph.split('/').pop() || 'Download File';
                                            return (
                                                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                                    <span className="truncate max-w-[130px] font-mono text-[10px] text-gray-600" title={filename}>
                                                        {filename}
                                                    </span>
                                                    <a
                                                        href={ph}
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded text-[10px] font-bold transition"
                                                    >
                                                        <Download className="w-3.5 h-3.5 stroke-[1.5]" />
                                                        Download
                                                    </a>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* PHOTOS */}
                    {photos.length > 0 && (
                        <Card title="Bukti Rilis / Surat Jalan">
                            <div className="space-y-3">
                                {photos.map((ph, idx) => {
                                    const filename = ph.split('/').pop() || 'document';
                                    const isPdf = ph.toLowerCase().endsWith('.pdf');
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => triggerPreview(ph)}
                                            className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50/50 cursor-pointer transition flex items-center gap-3 group"
                                        >
                                            <div className={`p-2 rounded-lg flex-shrink-0 ${isPdf ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-primary'}`}>
                                                {isPdf ? (
                                                    <FileText className="w-6 h-6 stroke-[1.5]" />
                                                ) : (
                                                    <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-grow">
                                                <p className="text-xs font-bold text-gray-900 truncate" title={filename}>
                                                    {filename}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5 flex items-center gap-1">
                                                    <Eye className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition" />
                                                    Klik untuk Preview
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Live Preview Modal */}
            <Modal
                isOpen={previewUrl !== null}
                onClose={() => {
                    setPreviewUrl(null);
                    setPreviewType(null);
                }}
                title="Preview Dokumen"
                size="max-w-4xl"
            >
                <div className="flex justify-center items-center w-full bg-gray-50/50 rounded-lg p-2 min-h-[50vh]">
                    {previewType === 'pdf' ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-[60vh] md:h-[75vh] border-0 rounded-lg shadow-sm"
                            title="PDF Preview"
                        />
                    ) : previewType === 'image' ? (
                        <img
                            src={previewUrl}
                            className="w-full h-[60vh] md:h-[75vh] object-contain rounded-lg shadow-sm"
                            alt="Document Preview"
                        />
                    ) : null}
                </div>
            </Modal>
        </>
    );
}

KeluarDetail.layout = page => <AppLayout children={page} />;
