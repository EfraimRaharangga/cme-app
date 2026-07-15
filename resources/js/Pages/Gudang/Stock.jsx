import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import Select from '../../Components/Select';
import Modal from '../../Components/Modal';
import ImageUpload from '../../Components/ImageUpload';
import { Package, ArrowUpRight, ArrowDownLeft, ChevronDown, ChevronRight, Plus } from 'lucide-react';

export default function Stock({ items, categories, totals, filters }) {
    const [search, setSearch] = useState(filters.cari || '');
    const [openCategories, setOpenCategories] = useState(
        categories.reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
    );

    // Modal controllers state
    const [showMasukModal, setShowMasukModal] = useState(false);
    const [showKeluarModal, setShowKeluarModal] = useState(false);
    const [showKatModal, setShowKatModal] = useState(false);
    const [showTipeModal, setShowTipeModal] = useState(false);

    // Forms initialization
    const masukForm = useForm({
        judul: '',
        kategori_batch: categories[0] || '',
        tanggal: new Date().toISOString().split('T')[0],
        supplier: '',
        penerima: '',
        lokasi: '',
        keterangan: '',
        items: [{ kategori: categories[0] || '', tipe: '', jumlah: 1 }],
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
        items: [{ kategori: categories[0] || '', tipe: '', jumlah: 1 }],
        foto: [],
    });

    const katForm = useForm({ kategori: '', satuan: 'Pcs' });
    const tipeForm = useForm({ kategori: categories[0] || '', tipe: '' });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/gudang', { cari: search }, { preserveState: true });
    };

    const toggleCategory = (cat) => {
        setOpenCategories({ ...openCategories, [cat]: !openCategories[cat] });
    };

    // Item row helpers for transactions
    const addMasukItem = () => {
        masukForm.setData('items', [...masukForm.data.items, { kategori: categories[0] || '', tipe: '', jumlah: 1 }]);
    };

    const removeMasukItem = (idx) => {
        const next = masukForm.data.items.filter((_, i) => i !== idx);
        masukForm.setData('items', next);
    };

    const addKeluarItem = () => {
        keluarForm.setData('items', [...keluarForm.data.items, { kategori: categories[0] || '', tipe: '', jumlah: 1 }]);
    };

    const removeKeluarItem = (idx) => {
        const next = keluarForm.data.items.filter((_, i) => i !== idx);
        keluarForm.setData('items', next);
    };

    const handleMasukSubmit = (e) => {
        e.preventDefault();
        masukForm.post('/gudang/masuk', {
            onSuccess: () => {
                setShowMasukModal(false);
                masukForm.reset();
            }
        });
    };

    const handleKeluarSubmit = (e) => {
        e.preventDefault();
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
                    <button
                        onClick={() => setShowMasukModal(true)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase rounded-lg transition"
                    >
                        <ArrowUpRight className="h-4 w-4 stroke-[1.5]" />
                        Barang Masuk (BM)
                    </button>
                    <button
                        onClick={() => setShowKeluarModal(true)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold uppercase rounded-lg transition"
                    >
                        <ArrowDownLeft className="h-4 w-4 stroke-[1.5]" />
                        Barang Keluar (BK)
                    </button>
                </div>
            </div>

            {/* WAREHOUSE METRIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-primary p-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase">Kategori Aktif</p>
                            <h4 className="text-xl font-black text-gray-900 mt-0.5 font-headlines">{categories.length}</h4>
                        </div>
                        <button onClick={() => setShowKatModal(true)} className="p-1.5 bg-primary/15 text-primary rounded hover:bg-primary/30 transition text-xs font-bold">
                            + Kat
                        </button>
                    </div>
                </Card>
                <Card className="border-l-4 border-l-gray-900 p-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase">Total Variasi</p>
                            <h4 className="text-xl font-black text-gray-900 mt-0.5 font-headlines">{items.length}</h4>
                        </div>
                        <button onClick={() => setShowTipeModal(true)} className="p-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition text-xs font-bold">
                            + Tipe
                        </button>
                    </div>
                </Card>
                <Card className="border-l-4 border-l-primary p-2 col-span-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-500 uppercase">Akses Cepat Log:</span>
                        <div className="flex gap-2">
                            <Link href="/gudang/masuk-history" className="text-primary hover:underline font-bold">Riwayat Masuk &rarr;</Link>
                            <Link href="/gudang/keluar-history" className="text-text hover:underline font-bold">Riwayat Keluar &rarr;</Link>
                        </div>
                    </div>
                </Card>
            </div>

            {/* FILTER SEARCH */}
            <Card className="mb-6 p-4">
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <Input
                        type="text"
                        placeholder="Cari nama barang, kategori, tipe..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit" variant="primary">
                        Cari
                    </Button>
                </form>
            </Card>

            {/* COLLAPSIBLE CATEGORIES LEDGERS */}
            <div className="space-y-4">
                {categories.map((cat) => {
                    const catItems = items.filter((it) => it.kategori === cat);
                    const isOpen = openCategories[cat];
                    const catTotal = totals[cat] ?? 0;

                    return (
                        <div key={cat} className="border border-gray-250 rounded-lg overflow-hidden bg-white shadow-sm">
                            {/* Accordion header */}
                            <div
                                onClick={() => toggleCategory(cat)}
                                className="px-6 py-4 bg-gray-50 flex items-center justify-between cursor-pointer border-b border-gray-150 select-none hover:bg-gray-100/50"
                            >
                                <div className="flex items-center gap-2">
                                    {isOpen ? (
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="font-bold text-sm text-gray-900 uppercase tracking-wider">{cat}</span>
                                </div>
                                <div className="text-xs font-semibold text-gray-500">
                                    Total Stok: <span className="font-black text-gray-900">{catTotal} Pcs/Unit</span>
                                </div>
                            </div>

                            {/* Accordion body list */}
                            {isOpen && (
                                <div className="px-4 py-2 bg-white">
                                    <Table headers={['Nama Barang / Spesifikasi', 'Tipe', 'Min Stok Limit', 'Stok Saat Ini', 'Satuan', 'Status']}>
                                        {catItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                                                    Belum ada spesifikasi barang terdaftar
                                                </td>
                                            </tr>
                                        ) : (
                                            catItems.map((row) => {
                                                const isLow = row.stok <= row.min_stok;
                                                return (
                                                    <tr key={row.id} className="hover:bg-gray-50/50">
                                                        <td className="px-6 py-3 font-bold text-gray-900">{row.nama}</td>
                                                        <td className="px-6 py-3 text-center text-gray-500 font-mono">{row.tipe || '-'}</td>
                                                        <td className="px-6 py-3 text-center font-semibold text-gray-400">{row.min_stok}</td>
                                                        <td className={`px-6 py-3 text-center font-black ${isLow ? 'text-rose-600' : 'text-gray-900'}`}>
                                                            {row.stok}
                                                        </td>
                                                        <td className="px-6 py-3 text-center text-gray-500">{row.satuan}</td>
                                                        <td className="px-6 py-3 text-center">
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
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* BARANG MASUK MODAL */}
            <Modal isOpen={showMasukModal} onClose={() => setShowMasukModal(false)} title="Catat Barang Masuk (BM)" size="max-w-3xl">
                <form onSubmit={handleMasukSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Judul Transaksi / Batch" value={masukForm.data.judul} onChange={(e) => masukForm.setData('judul', e.target.value)} placeholder="e.g. Supply MCB Q2" />
                        <Input label="Tanggal Terima" type="date" value={masukForm.data.tanggal} onChange={(e) => masukForm.setData('tanggal', e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Supplier / Vendor Pengirim" value={masukForm.data.supplier} onChange={(e) => masukForm.setData('supplier', e.target.value)} required placeholder="PT. Supplier Metal" />
                        <Input label="Penerima Gudang" value={masukForm.data.penerima} onChange={(e) => masukForm.setData('penerima', e.target.value)} required placeholder="Nama checker" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Lokasi Rak / Blok" value={masukForm.data.lokasi} onChange={(e) => masukForm.setData('lokasi', e.target.value)} placeholder="Rak A1" />
                        <div className="w-full">
                            <label className="block font-medium text-xs text-gray-700 mb-1">Keterangan / Memo</label>
                            <textarea value={masukForm.data.keterangan} onChange={(e) => masukForm.setData('keterangan', e.target.value)} className="w-full border border-gray-300 rounded p-1.5" />
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
                    <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-gray-900">List Barang Masuk</h4>
                            <button type="button" onClick={addMasukItem} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold text-gray-700">+ Tambah Baris</button>
                        </div>
                        {masukForm.data.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                                <Select label="Kategori" value={item.kategori} onChange={(e) => {
                                    const items = [...masukForm.data.items];
                                    items[idx].kategori = e.target.value;
                                    masukForm.setData('items', items);
                                }} options={categories} placeholder="Pilih..." />

                                <Input label="Tipe / Spesifikasi" value={item.tipe} onChange={(e) => {
                                    const items = [...masukForm.data.items];
                                    items[idx].tipe = e.target.value;
                                    masukForm.setData('items', items);
                                }} placeholder="e.g. 1P 16A" required />

                                <Input label="Jumlah" type="number" min="1" value={item.jumlah} onChange={(e) => {
                                    const items = [...masukForm.data.items];
                                    items[idx].jumlah = e.target.value;
                                    masukForm.setData('items', items);
                                }} required className="w-20" />

                                {masukForm.data.items.length > 1 && (
                                    <button type="button" onClick={() => removeMasukItem(idx)} className="mt-4 p-1 text-red-500 hover:text-red-700 font-bold">X</button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-3 flex justify-end gap-2">
                        <Button type="submit" variant="secondary" processing={masukForm.processing}>Simpan Transaksi</Button>
                        <Button type="button" variant="outline" onClick={() => setShowMasukModal(false)}>Batal</Button>
                    </div>
                </form>
            </Modal>

            {/* BARANG KELUAR MODAL */}
            <Modal isOpen={showKeluarModal} onClose={() => setShowKeluarModal(false)} title="Catat Barang Keluar (BK)" size="max-w-3xl">
                <form onSubmit={handleKeluarSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Judul Pekerjaan / Proyek" value={keluarForm.data.judul} onChange={(e) => keluarForm.setData('judul', e.target.value)} placeholder="Pekerjaan Genset Site Jagakarsa" />
                        <Input label="Tanggal Rilis" type="date" value={keluarForm.data.tanggal} onChange={(e) => keluarForm.setData('tanggal', e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Nama Pengambil / Koordinator" value={keluarForm.data.pengambil} onChange={(e) => keluarForm.setData('pengambil', e.target.value)} required placeholder="Budi Santoso" />
                        <Input label="Jabatan Pengambil" value={keluarForm.data.jabatan} onChange={(e) => keluarForm.setData('jabatan', e.target.value)} placeholder="Subcon Lead" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Site Tujuan / Delivery" value={keluarForm.data.lokasi_tujuan} onChange={(e) => keluarForm.setData('lokasi_tujuan', e.target.value)} required placeholder="Site JGK-012" />
                        <div className="w-full">
                            <label className="block font-medium text-xs text-gray-700 mb-1">Keperluan / Keterangan</label>
                            <textarea value={keluarForm.data.keterangan} onChange={(e) => keluarForm.setData('keterangan', e.target.value)} className="w-full border border-gray-300 rounded p-1.5" />
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
                    <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-gray-900">List Barang Keluar</h4>
                            <button type="button" onClick={addKeluarItem} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold text-gray-700">+ Tambah Baris</button>
                        </div>
                        {keluarForm.data.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                                <Select label="Kategori" value={item.kategori} onChange={(e) => {
                                    const items = [...keluarForm.data.items];
                                    items[idx].kategori = e.target.value;
                                    keluarForm.setData('items', items);
                                }} options={categories} placeholder="Pilih..." />

                                <Input label="Tipe / Spesifikasi" value={item.tipe} onChange={(e) => {
                                    const items = [...keluarForm.data.items];
                                    items[idx].tipe = e.target.value;
                                    keluarForm.setData('items', items);
                                }} placeholder="e.g. 1P 16A" required />

                                <Input label="Jumlah Rilis" type="number" min="1" value={item.jumlah} onChange={(e) => {
                                    const items = [...keluarForm.data.items];
                                    items[idx].jumlah = e.target.value;
                                    keluarForm.setData('items', items);
                                }} required className="w-20" />

                                {keluarForm.data.items.length > 1 && (
                                    <button type="button" onClick={() => removeKeluarItem(idx)} className="mt-4 p-1 text-red-500 hover:text-red-700 font-bold">X</button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-3 flex justify-end gap-2">
                        <Button type="submit" variant="secondary" processing={keluarForm.processing}>Simpan Transaksi</Button>
                        <Button type="button" variant="outline" onClick={() => setShowKeluarModal(false)}>Batal</Button>
                    </div>
                </form>
            </Modal>

            {/* ADD CATEGORY MODAL */}
            <Modal isOpen={showKatModal} onClose={() => setShowKatModal(false)} title="Tambah Kategori Baru" size="max-w-md">
                <form onSubmit={handleKatSubmit} className="space-y-4 text-xs">
                    <Input label="Nama Kategori" value={katForm.data.kategori} onChange={(e) => katForm.setData('kategori', e.target.value)} required placeholder="e.g. Splicer" />
                    <Input label="Satuan Default" value={katForm.data.satuan} onChange={(e) => katForm.setData('satuan', e.target.value)} required placeholder="Pcs / Unit / Roll" />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="submit" variant="secondary" processing={katForm.processing}>Simpan</Button>
                        <Button type="button" variant="outline" onClick={() => setShowKatModal(false)}>Batal</Button>
                    </div>
                </form>
            </Modal>

            {/* ADD SPEC-TYPE MODAL */}
            <Modal isOpen={showTipeModal} onClose={() => setShowTipeModal(false)} title="Tambah Tipe Baru" size="max-w-md">
                <form onSubmit={handleTipeSubmit} className="space-y-4 text-xs">
                    <Select label="Kategori" value={tipeForm.data.kategori} onChange={(e) => tipeForm.setData('kategori', e.target.value)} options={categories} placeholder="Pilih..." required />
                    <Input label="Nama Tipe / Spesifikasi" value={tipeForm.data.tipe} onChange={(e) => tipeForm.setData('tipe', e.target.value)} required placeholder="e.g. 1P 16A" />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="submit" variant="secondary" processing={tipeForm.processing}>Simpan</Button>
                        <Button type="button" variant="outline" onClick={() => setShowTipeModal(false)}>Batal</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}


Stock.layout = page => <AppLayout children={page} />;
