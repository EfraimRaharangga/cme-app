import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import Select from '../../Components/Select';
import Modal from '../../Components/Modal';
import ImageUpload from '../../Components/ImageUpload';
import SearchInput, { filterData } from '../../Components/Search';
import Pagination from '../../Components/Pagination';
import {
    Package,
    ArrowUpRight,
    ArrowDownLeft,
    Plus,
    Palette,
    Search,
    X,
    History
} from 'lucide-react';

function MetricCard({ title, value, action }) {
    return (
        <div className="bg-surface rounded-xl p-5 flex flex-col justify-between h-32 border border-border/40 hover:border-border transition duration-150">
            <div className="flex items-start justify-between w-full">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>
            <div className="mt-2">
                <span className="text-3xl font-black text-text font-headlines leading-none">{value}</span>
            </div>
        </div>
    );
}

export default function Stock({ items, categories, totals, filters, totalMasukCount, totalKeluarCount }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const filteredItems = filterData(items, searchQuery);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Modal controllers state
    const [showMasukModal, setShowMasukModal] = useState(false);
    const [showKeluarModal, setShowKeluarModal] = useState(false);
    const [showKatModal, setShowKatModal] = useState(false);
    const [showTipeModal, setShowTipeModal] = useState(false);
    const [showColorModal, setShowColorModal] = useState(false);

    // Color-coded label state
    const [categoryColors, setCategoryColors] = useState(() => {
        const saved = localStorage.getItem('gudang_category_colors');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) { }
        }
        return {
            'MCB': '#2563EB',
            'PDU': '#16A34A',
            'Recti': '#CA8A04',
            'Inverter': '#DC2626',
            'Baterai': '#7C3AED',
            'UPS': '#0891B2',
            'Kabel': '#EA580C',
            'Konektor': '#DB2777',
            'Busbar': '#475569',
            'Panel': '#059669',
            'Grounding': '#4F46E5',
        };
    });

    const updateCategoryColor = (category, color) => {
        const updated = { ...categoryColors, [category]: color };
        setCategoryColors(updated);
        localStorage.setItem('gudang_category_colors', JSON.stringify(updated));
    };

    // Forms initialization
    const masukForm = useForm({
        judul: '',
        kategori_batch: categories[0] || '',
        tanggal: new Date().toISOString().split('T')[0],
        supplier: '',
        penerima: '',
        lokasi: '',
        keterangan: '',
        items: [], // empty list by default as requested
        foto: [],
    });

    const keluarForm = useForm({
        judul: '',
        kategori_batch: categories[0] || '',
        tanggal: new Date().toISOString().split('T')[0],
        pengambil: '',
        jabatan: '',
        lokasi_tujuan: '',
        keperluan: '',
        proyek: '',
        tujuan: '',
        keterangan: '',
        items: [], // empty list by default for outgoing too
        foto: [],
    });

    const katForm = useForm({ kategori: '', satuan: 'Pcs' });
    const tipeForm = useForm({ kategori: categories[0] || '', tipe: '' });

    // Item row helpers for transactions
    const addMasukItem = () => {
        masukForm.setData('items', [...masukForm.data.items, { kategori: '', tipe: '', jumlah: '' }]);
    };

    const removeMasukItem = (idx) => {
        const next = masukForm.data.items.filter((_, i) => i !== idx);
        masukForm.setData('items', next);
    };

    const addKeluarItem = () => {
        keluarForm.setData('items', [...keluarForm.data.items, { kategori: '', tipe: '', jumlah: '' }]);
    };

    const removeKeluarItem = (idx) => {
        const next = keluarForm.data.items.filter((_, i) => i !== idx);
        keluarForm.setData('items', next);
    };

    const handleMasukSubmit = (e) => {
        e.preventDefault();
        if (masukForm.data.items.length === 0) {
            alert('Harap tambahkan minimal 1 item untuk dicatat.');
            return;
        }
        masukForm.post('/gudang/masuk', {
            onSuccess: () => {
                setShowMasukModal(false);
                masukForm.reset();
            }
        });
    };

    const handleKeluarSubmit = (e) => {
        e.preventDefault();
        if (keluarForm.data.items.length === 0) {
            alert('Harap tambahkan minimal 1 item untuk dicatat.');
            return;
        }
        // Verify stock limits
        const hasInvalidQty = keluarForm.data.items.some(item => {
            const matched = items.find(it => it.kategori === item.kategori && it.tipe === item.tipe);
            const stock = matched ? matched.stok : 0;
            const qty = parseInt(item.jumlah);
            return isNaN(qty) || qty > stock || qty < 0;
        });
        if (hasInvalidQty) {
            alert('Terdapat kesalahan input jumlah barang keluar (melebihi stok tersedia atau kurang dari 0).');
            return;
        }
        keluarForm.post('/gudang/keluar', {
            onSuccess: () => {
                setShowKeluarModal(false);
                keluarForm.reset();
            }
        });
    };

    const handleKatSubmit = (e) => {
        e.preventDefault();
        katForm.post('/gudang/kategori', {
            onSuccess: () => {
                setShowKatModal(false);
                katForm.reset();
            }
        });
    };

    const handleTipeSubmit = (e) => {
        e.preventDefault();
        tipeForm.post('/gudang/tipe', {
            onSuccess: () => {
                setShowTipeModal(false);
                tipeForm.reset();
            }
        });
    };

    return (
        <>
            <Head title="Stok Gudang - Web CME" />

            <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Inventaris Stok Gudang
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Monitoring kuantitas material CME, pengeluaran logistik, dan incoming supply ledger.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/gudang/history"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase rounded-lg transition shadow-sm"
                    >
                        <History className="h-4 w-4 stroke-[1.5]" />
                        Riwayat Transaksi
                    </Link>
                </div>
            </div>

            {/* WAREHOUSE METRIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <MetricCard
                    title="Kategori Aktif"
                    value={categories.length}
                    action={
                        <Button onClick={() => setShowKatModal(true)} variant="secondary" className="px-2 py-1 text-[10px]" title="Tambah Kategori">
                            <Plus className="h-4 w-4 stroke-[1.5]" />
                        </Button>
                    }
                />
                <MetricCard
                    title="Total Variasi"
                    value={items.length}
                    action={
                        <Button onClick={() => setShowTipeModal(true)} variant="outline" className="px-2 py-1 text-[10px]" title="Tambah Tipe">
                            <Plus className="h-4 w-4 stroke-[1.5]" />
                        </Button>
                    }
                />
                <MetricCard
                    title="Barang Masuk (BM)"
                    value={<span className=" font-headlines">{totalMasukCount || 0} Form</span>}
                    action={
                        <Button
                            onClick={() => {
                                masukForm.setData('items', []);
                                setShowMasukModal(true);
                            }}
                            variant="primary"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase rounded-lg transition duration-150 whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4 stroke-[1.5]" />
                        </Button>
                    }
                />
                <MetricCard
                    title="Barang Keluar (BK)"
                    value={<span className=" font-headlines">{totalKeluarCount || 0} Form</span>}
                    action={
                        <Button
                            onClick={() => {
                                keluarForm.setData('items', []);
                                setShowKeluarModal(true);
                            }}
                            variant="secondary"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase rounded-lg transition duration-150 whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4 stroke-[1.5]" />
                        </Button>
                    }
                />
            </div>

            {/* CONSOLIDATED MASTER STOCK TABLE */}
            <Card
                title="Daftar Stok Master"
                headerActions={
                    <Button onClick={() => setShowColorModal(true)} variant="outline" className="flex items-center gap-1.5 text-xs py-1 px-3">
                        <Palette className="h-4 w-4 stroke-[1.5]" />
                        Warna Kategori
                    </Button>
                }
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 mb-4">
                    <SearchInput value={searchQuery} onChange={handleSearchChange} />
                </div>

                <Table headers={['Nama Barang / Spesifikasi', 'Kategori', 'Tipe / Model', 'Min Stok Limit', 'Stok Saat Ini', 'Satuan', 'Status']}>
                    {paginatedItems.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                                Tidak ada data barang terdaftar.
                            </td>
                        </tr>
                    ) : (
                        paginatedItems.map((row) => {
                            const isLow = row.stok <= row.min_stok;
                            const badgeBgColor = categoryColors[row.kategori] || '#475569';
                            return (
                                <tr key={row.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-3 font-bold text-gray-900">{row.nama}</td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <span
                                            className="inline-block px-2.5 py-1 rounded text-white text-[10px] font-bold uppercase tracking-wider shadow-sm"
                                            style={{ backgroundColor: badgeBgColor }}
                                        >
                                            {row.kategori}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-center text-gray-500 font-mono text-xs whitespace-nowrap">{row.tipe || '-'}</td>
                                    <td className="px-6 py-3 text-center font-semibold text-gray-400">{row.min_stok}</td>
                                    <td className={`px-6 py-3 text-center font-black ${isLow ? 'text-rose-600' : 'text-gray-900'}`}>
                                        {row.stok}
                                    </td>
                                    <td className="px-6 py-3 text-center text-gray-500">{row.satuan}</td>
                                    <td className="px-6 py-3 text-center whitespace-nowrap">
                                        {isLow ? (
                                            <span className="inline-block bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                                LOW LIMIT
                                            </span>
                                        ) : (
                                            <span className="inline-block bg-emerald-50 border border-emerald-250 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                                TERSEDIA
                                            </span>
                                        )}
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
                    totalItems={filteredItems.length}
                    itemsPerPage={itemsPerPage}
                />
            </Card>

            {/* BARANG MASUK MODAL */}
            <Modal isOpen={showMasukModal} onClose={() => setShowMasukModal(false)} title="Catat Barang Masuk (BM)" size="max-w-4xl">
                <form onSubmit={handleMasukSubmit} className="space-y-4 text-xs font-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Judul Transaksi / Batch" value={masukForm.data.judul} onChange={(e) => masukForm.setData('judul', e.target.value)} placeholder="e.g. Supply MCB Q2" />
                        <Input label="Tanggal Terima" type="date" value={masukForm.data.tanggal} onChange={(e) => masukForm.setData('tanggal', e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Supplier / Vendor Pengirim" value={masukForm.data.supplier} onChange={(e) => masukForm.setData('supplier', e.target.value)} required placeholder="PT. Supplier Metal" />
                        <Input label="Penerima Gudang" value={masukForm.data.penerima} onChange={(e) => masukForm.setData('penerima', e.target.value)} required placeholder="Nama checker" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Lokasi Rak / Blok" value={masukForm.data.lokasi} onChange={(e) => masukForm.setData('lokasi', e.target.value)} placeholder="Rak A1" />
                        <div className="w-full">
                            <label className="block font-medium text-xs text-gray-700 mb-1">Keterangan / Memo</label>
                            <textarea value={masukForm.data.keterangan} onChange={(e) => masukForm.setData('keterangan', e.target.value)} className="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none" />
                        </div>
                    </div>
                    <div className="w-full">
                        <label className="block font-medium text-xs text-gray-700 mb-1">Unggah Nota / Surat Jalan Fisik</label>
                        <ImageUpload
                            compact={false}
                            multiple={true}
                            value={masukForm.data.foto || []}
                            onChange={(files) => masukForm.setData('foto', files)}
                        />
                    </div>

                    {/* Multiple items adding grid */}
                    <div className="border-t pt-4 space-y-3">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-gray-900 text-sm">List Barang Masuk</h4>
                            <Button type="button" onClick={addMasukItem} variant="outline" className="py-1 px-3 text-xs flex items-center gap-1">
                                <Plus className="h-3.5 w-3.5" /> Tambah Baris
                            </Button>
                        </div>

                        {masukForm.data.items.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                                <Package className="h-8 w-8 mx-auto text-gray-300 stroke-[1.5] mb-2" />
                                <p className="text-gray-400 text-xs">Belum ada item ditambahkan. Klik "+ Tambah Baris" di atas.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {masukForm.data.items.map((item, idx) => {
                                    const specsForCat = items.filter(it => it.kategori === item.kategori && it.tipe).map(it => it.tipe);
                                    const uniqueSpecs = [...new Set(specsForCat)];
                                    const matched = items.find(it => it.kategori === item.kategori && it.tipe === item.tipe);
                                    const stock = matched ? matched.stok : 0;

                                    const isQtyDisabled = !item.kategori || !item.tipe;
                                    let qtyPlaceholder = "Pilih Kategori";
                                    if (item.kategori && !item.tipe) {
                                        qtyPlaceholder = "Pilih Tipe";
                                    } else if (item.kategori && item.tipe) {
                                        qtyPlaceholder = `Stok saat ini: ${stock}`;
                                    }

                                    return (
                                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-200 relative">
                                            <Select
                                                label="Kategori"
                                                value={item.kategori}
                                                onChange={(e) => {
                                                    const next = [...masukForm.data.items];
                                                    next[idx].kategori = e.target.value;
                                                    next[idx].tipe = '';
                                                    next[idx].jumlah = '';
                                                    masukForm.setData('items', next);
                                                }}
                                                options={categories}
                                                placeholder="Pilih Kategori..."
                                                required
                                            />

                                            <Select
                                                label="Tipe / Spesifikasi"
                                                value={item.tipe}
                                                onChange={(e) => {
                                                    const next = [...masukForm.data.items];
                                                    next[idx].tipe = e.target.value;
                                                    next[idx].jumlah = '';
                                                    masukForm.setData('items', next);
                                                }}
                                                options={uniqueSpecs}
                                                placeholder={item.kategori ? "Pilih Tipe..." : "Pilih Kategori"}
                                                disabled={!item.kategori}
                                                required
                                            />

                                            <div className="flex gap-2 items-end">
                                                <div className="flex-grow">
                                                    <Input
                                                        label="Jumlah Masuk"
                                                        type="number"
                                                        min="1"
                                                        value={item.jumlah}
                                                        onChange={(e) => {
                                                            const next = [...masukForm.data.items];
                                                            next[idx].jumlah = e.target.value;
                                                            masukForm.setData('items', next);
                                                        }}
                                                        placeholder={qtyPlaceholder}
                                                        disabled={isQtyDisabled}
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMasukItem(idx)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-200 mb-1"
                                                    title="Hapus Baris"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4 flex justify-end gap-2">
                        <Button type="submit" variant="primary" processing={masukForm.processing}>Simpan Transaksi</Button>
                        <Button type="button" variant="outline" onClick={() => setShowMasukModal(false)}>Batal</Button>
                    </div>
                </form>
            </Modal>

            {/* BARANG KELUAR MODAL */}
            <Modal isOpen={showKeluarModal} onClose={() => setShowKeluarModal(false)} title="Catat Barang Keluar (BK)" size="max-w-4xl">
                <form onSubmit={handleKeluarSubmit} className="space-y-4 text-xs font-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Judul Pekerjaan / Proyek" value={keluarForm.data.judul} onChange={(e) => keluarForm.setData('judul', e.target.value)} placeholder="Pekerjaan Genset Site Jagakarsa" />
                        <Input label="Tanggal Rilis" type="date" value={keluarForm.data.tanggal} onChange={(e) => keluarForm.setData('tanggal', e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Nama Pengambil / Koordinator" value={keluarForm.data.pengambil} onChange={(e) => keluarForm.setData('pengambil', e.target.value)} required placeholder="Budi Santoso" />
                        <Input label="Jabatan Pengambil" value={keluarForm.data.jabatan} onChange={(e) => keluarForm.setData('jabatan', e.target.value)} placeholder="Subcon Lead" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Site Tujuan / Delivery" value={keluarForm.data.lokasi_tujuan} onChange={(e) => keluarForm.setData('lokasi_tujuan', e.target.value)} required placeholder="Site JGK-012" />
                        <div className="w-full">
                            <label className="block font-medium text-xs text-gray-700 mb-1">Keperluan / Keterangan</label>
                            <textarea value={keluarForm.data.keterangan} onChange={(e) => keluarForm.setData('keterangan', e.target.value)} className="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none" />
                        </div>
                    </div>
                    <div className="w-full">
                        <label className="block font-medium text-xs text-gray-700 mb-1">Unggah Dokumen Pengeluaran / Bukti Fisik</label>
                        <ImageUpload
                            compact={false}
                            multiple={true}
                            value={keluarForm.data.foto || []}
                            onChange={(files) => keluarForm.setData('foto', files)}
                        />
                    </div>

                    {/* Release list */}
                    <div className="border-t pt-4 space-y-3">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-gray-900 text-sm">List Barang Keluar</h4>
                            <Button type="button" onClick={addKeluarItem} variant="outline" className="py-1 px-3 text-xs flex items-center gap-1">
                                <Plus className="h-3.5 w-3.5" /> Tambah Baris
                            </Button>
                        </div>

                        {keluarForm.data.items.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                                <Package className="h-8 w-8 mx-auto text-gray-300 stroke-[1.5] mb-2" />
                                <p className="text-gray-400 text-xs">Belum ada item ditambahkan. Klik "+ Tambah Baris" di atas.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {keluarForm.data.items.map((item, idx) => {
                                    const specsForCat = items.filter(it => it.kategori === item.kategori && it.tipe).map(it => it.tipe);
                                    const uniqueSpecs = [...new Set(specsForCat)];
                                    const matched = items.find(it => it.kategori === item.kategori && it.tipe === item.tipe);
                                    const availableStock = matched ? matched.stok : 0;

                                    const isQtyDisabled = !item.kategori || !item.tipe;
                                    let qtyPlaceholder = "Pilih Kategori";
                                    if (item.kategori && !item.tipe) {
                                        qtyPlaceholder = "Pilih Tipe";
                                    } else if (item.kategori && item.tipe) {
                                        qtyPlaceholder = `Tersedia: ${availableStock}`;
                                    }

                                    const isOverStock = item.jumlah && parseInt(item.jumlah) > availableStock;
                                    const isUnderZero = item.jumlah && parseInt(item.jumlah) < 0;

                                    return (
                                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-200 relative">
                                            <Select
                                                label="Kategori"
                                                value={item.kategori}
                                                onChange={(e) => {
                                                    const next = [...keluarForm.data.items];
                                                    next[idx].kategori = e.target.value;
                                                    next[idx].tipe = '';
                                                    next[idx].jumlah = '';
                                                    keluarForm.setData('items', next);
                                                }}
                                                options={categories}
                                                placeholder="Pilih Kategori..."
                                                required
                                            />

                                            <Select
                                                label="Tipe / Spesifikasi"
                                                value={item.tipe}
                                                onChange={(e) => {
                                                    const next = [...keluarForm.data.items];
                                                    next[idx].tipe = e.target.value;
                                                    next[idx].jumlah = '';
                                                    keluarForm.setData('items', next);
                                                }}
                                                options={uniqueSpecs}
                                                placeholder={item.kategori ? "Pilih Tipe..." : "Pilih Kategori"}
                                                disabled={!item.kategori}
                                                required
                                            />

                                            <div className="flex gap-2 items-end">
                                                <div className="flex-grow">
                                                    <Input
                                                        label="Jumlah Keluar"
                                                        type="number"
                                                        min="0"
                                                        max={availableStock}
                                                        value={item.jumlah}
                                                        onChange={(e) => {
                                                            const next = [...keluarForm.data.items];
                                                            next[idx].jumlah = e.target.value;
                                                            keluarForm.setData('items', next);
                                                        }}
                                                        placeholder={qtyPlaceholder}
                                                        disabled={isQtyDisabled}
                                                        required
                                                        className={isOverStock || isUnderZero ? 'border-red-500 text-red-600 focus:ring-red-500' : ''}
                                                    />
                                                    {isOverStock && (
                                                        <p className="text-[10px] text-red-500 mt-1 font-semibold">Jumlah melebihi stok tersedia!</p>
                                                    )}
                                                    {isUnderZero && (
                                                        <p className="text-[10px] text-red-500 mt-1 font-semibold">Jumlah tidak boleh kurang dari 0!</p>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeKeluarItem(idx)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-200 mb-1"
                                                    title="Hapus Baris"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4 flex justify-end gap-2">
                        <Button type="submit" variant="primary" processing={keluarForm.processing}>Simpan Transaksi</Button>
                        <Button type="button" variant="outline" onClick={() => setShowKeluarModal(false)}>Batal</Button>
                    </div>
                </form>
            </Modal>

            {/* ADD CATEGORY MODAL */}
            <Modal isOpen={showKatModal} onClose={() => setShowKatModal(false)} title="Tambah Kategori Baru" size="max-w-md">
                <form onSubmit={handleKatSubmit} className="space-y-4 text-xs font-body">
                    <Input label="Nama Kategori" value={katForm.data.kategori} onChange={(e) => katForm.setData('kategori', e.target.value)} required placeholder="e.g. Splicer" />
                    <Input label="Satuan Default" value={katForm.data.satuan} onChange={(e) => katForm.setData('satuan', e.target.value)} required placeholder="Pcs / Unit / Roll" />
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-150">
                        <Button type="submit" variant="primary" processing={katForm.processing}>Simpan</Button>
                        <Button type="button" variant="outline" onClick={() => setShowKatModal(false)}>Batal</Button>
                    </div>
                </form>
            </Modal>

            {/* ADD SPEC-TYPE MODAL */}
            <Modal isOpen={showTipeModal} onClose={() => setShowTipeModal(false)} title="Tambah Tipe Baru" size="max-w-md">
                <form onSubmit={handleTipeSubmit} className="space-y-4 text-xs font-body">
                    <Select label="Kategori" value={tipeForm.data.kategori} onChange={(e) => tipeForm.setData('kategori', e.target.value)} options={categories} placeholder="Pilih..." required />
                    <Input label="Nama Tipe / Spesifikasi" value={tipeForm.data.tipe} onChange={(e) => tipeForm.setData('tipe', e.target.value)} required placeholder="e.g. 1P 16A" />
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-150">
                        <Button type="submit" variant="primary" processing={tipeForm.processing}>Simpan</Button>
                        <Button type="button" variant="outline" onClick={() => setShowTipeModal(false)}>Batal</Button>
                    </div>
                </form>
            </Modal>

            {/* CATEGORY COLOR SETTINGS MODAL */}
            <Modal isOpen={showColorModal} onClose={() => setShowColorModal(false)} title="Atur Warna Label Kategori" size="max-w-lg">
                <div className="space-y-4 text-xs font-body">
                    <p className="text-gray-500 mb-2">
                        Sesuaikan warna latar belakang label kategori pada tabel stok master. Perubahan disimpan secara lokal.
                    </p>
                    <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2">
                        {categories.map((cat) => (
                            <div key={cat} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="font-bold text-gray-700">{cat}</span>
                                <div className="flex items-center gap-3">
                                    <span
                                        className="inline-block px-2.5 py-1 rounded text-white text-[10px] font-bold uppercase tracking-wider shadow-sm"
                                        style={{ backgroundColor: categoryColors[cat] || '#475569' }}
                                    >
                                        {cat} Preview
                                    </span>
                                    <input
                                        type="color"
                                        value={categoryColors[cat] || '#475569'}
                                        onChange={(e) => updateCategoryColor(cat, e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end pt-3 border-t border-gray-100">
                        <Button type="button" variant="primary" onClick={() => setShowColorModal(false)}>
                            Selesai
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

Stock.layout = page => <AppLayout children={page} />;
