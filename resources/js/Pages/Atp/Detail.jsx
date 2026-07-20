import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import Modal from '../../Components/Modal';
import ConfirmationModal from '../../Components/ConfirmationModal';
import { Plus, Trash2, Printer, ArrowLeft } from 'lucide-react';
import SearchInput, { filterData } from '../../Components/Search';
import Pagination from '../../Components/Pagination';
import Breadcrumbs from '../../Components/Breadcrumbs';

export default function Detail({ record }) {
    const mapRef = useRef(null);
    const [showBalForm, setShowBalForm] = useState(false);
    const [showBastpForm, setShowBastpForm] = useState(false);
    const [deletingBal, setDeletingBal] = useState(false);
    const [deletingBastp, setDeletingBastp] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    });

    // Define initial values for disabling fields if pre-filled
    const initialBalValues = {
        project: record.bal?.project || record.nama_site || '',
        no_po: record.bal?.no_po || record.no_po || '',
        tanggal_mulai: record.bal?.tanggal_mulai || '',
        tanggal: record.bal?.tanggal || record.tanggal || '',
        pelaksana: record.bal?.pelaksana || record.hasil_json?.approval?.vendor_company || '',
        lokasi: record.bal?.lokasi || record.nama_site || '',
        hasil: record.bal?.hasil || record.verdict || '',
        pihak1: record.bal?.pihak1 || record.hasil_json?.approval?.vendor_company || '',
        pihak2: record.bal?.pihak2 || record.hasil_json?.approval?.cme_company || '',
        nama1: record.bal?.nama1 || record.hasil_json?.approval?.vendor_1_name || '',
        jabatan1: record.bal?.jabatan1 || record.hasil_json?.approval?.vendor_1_role || '',
        nama2: record.bal?.nama2 || record.hasil_json?.approval?.cme_1_name || '',
        jabatan2: record.bal?.jabatan2 || record.hasil_json?.approval?.cme_1_role || '',
    };

    const initialBastpValues = {
        p1_nama: record.bastp?.p1_nama || record.hasil_json?.approval?.vendor_1_name || '',
        p1_alamat: record.bastp?.p1_alamat || '',
        p2_nama: record.bastp?.p2_nama || record.hasil_json?.approval?.cme_1_name || '',
        p2_jabatan: record.bastp?.p2_jabatan || record.hasil_json?.approval?.cme_1_role || '',
        p2_alamat: record.bastp?.p2_alamat || '',
        pekerjaan: record.bastp?.pekerjaan || '',
        mengetahui1: record.bastp?.mengetahui1 || '',
        mengetahui2: record.bastp?.mengetahui2 || '',
        photos: record.bastp?.photos || '',
    };

    // Initial forms states for BAL
    const balForm = useForm({ ...initialBalValues });

    // Initial forms states for BASTP
    const bastpForm = useForm({ ...initialBastpValues });

    // Initialize Map coords
    useEffect(() => {
        if (typeof window !== 'undefined' && record.latitude && record.longitude) {
            const initMap = () => {
                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }
                const container = document.getElementById('map-atp-detail');
                if (container && container._leaflet_id) {
                    container._leaflet_id = null;
                }

                const lat = parseFloat(record.latitude);
                const lng = parseFloat(record.longitude);
                const center = [lat, lng];

                const map = window.L.map('map-atp-detail').setView(center, 14);
                mapRef.current = map;

                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap contributors',
                }).addTo(map);

                window.L.marker(center).addTo(map)
                    .bindPopup(`<b>Site ${record.nama_site}</b><br/>ATP coordinates point.`)
                    .openPopup();
            };

            if (window.L) {
                initMap();
            } else {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
                document.head.appendChild(link);

                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
                script.onload = initMap;
                document.body.appendChild(script);
            }
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [record]);

    const handleSaveBal = (e) => {
        e.preventDefault();
        setConfirmModal({
            isOpen: true,
            title: 'Simpan Berita Acara Lapangan (BAL)',
            message: 'Apakah Anda yakin ingin menyimpan dokumen BAL ini? Data yang sudah diisi akan dikunci.',
            type: 'info',
            onConfirm: () => {
                balForm.post(`/atp/${record.id}/bal`, {
                    onSuccess: () => setShowBalForm(false)
                });
            }
        });
    };

    const handleSaveBastp = (e) => {
        e.preventDefault();
        setConfirmModal({
            isOpen: true,
            title: 'Simpan BASTP / Handover',
            message: 'Apakah Anda yakin ingin menyimpan dokumen BASTP ini? Data yang sudah diisi akan dikunci.',
            type: 'info',
            onConfirm: () => {
                bastpForm.post(`/atp/${record.id}/bastp`, {
                    onSuccess: () => setShowBastpForm(false)
                });
            }
        });
    };

    const handleDeleteBal = (e) => {
        if (e) e.preventDefault();
        setConfirmModal({
            isOpen: true,
            title: 'Hapus Berita Acara Lapangan (BAL)',
            message: 'Apakah Anda yakin ingin menghapus dokumen BAL ini? Tindakan ini tidak dapat dibatalkan.',
            type: 'danger',
            onConfirm: () => {
                setDeletingBal(true);
                router.delete(`/atp/${record.id}/bal`, {
                    preserveScroll: true,
                    preserveState: true,
                    onFinish: () => setDeletingBal(false)
                });
            }
        });
    };

    const handleDeleteBastp = (e) => {
        if (e) e.preventDefault();
        setConfirmModal({
            isOpen: true,
            title: 'Hapus BASTP / Handover',
            message: 'Apakah Anda yakin ingin menghapus dokumen BASTP ini? Tindakan ini tidak dapat dibatalkan.',
            type: 'danger',
            onConfirm: () => {
                setDeletingBastp(true);
                router.delete(`/atp/${record.id}/bastp`, {
                    preserveScroll: true,
                    preserveState: true,
                    onFinish: () => setDeletingBastp(false)
                });
            }
        });
    };

    const app = record.hasil_json?.approval || {};
    const itemNames = record.hasil_json?.itemNames || {};
    const itemStds = record.hasil_json?.itemStds || {};
    const itemTools = record.hasil_json?.itemTools || {};
    const itemVals = record.hasil_json?.items || {};
    const itemHasil = record.hasil_json?.hasil || {};
    const itemCatatan = record.hasil_json?.catatan || {};

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const itemsList = Object.entries(itemNames).map(([key, name]) => ({
        key,
        name,
        tool: itemTools[key],
        std: itemStds[key],
        hasil: itemHasil[key],
        val: itemVals[key],
        catatan: itemCatatan[key]
    }));

    const filteredItems = filterData(itemsList, searchQuery);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            <Head title={`ATP Detail ${record.nama_site} - Web CME`} />

            <Breadcrumbs items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'ATP Check', href: '/atp' },
                { label: record.nama_site || `ATP #${record.id}` }
            ]} />

            <div className="mb-6 flex items-center gap-3">
                <Link
                    href="/atp"
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-black transition shrink-0"
                >
                    <ArrowLeft className="h-4 w-4 stroke-[1.5]" />
                </Link>
                <div className="flex-grow">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Detail ATP Check
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Informasi site {record.nama_site} &bull; No. PO: {record.no_po}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                    <Link
                        href={`/atp/${record.id}/edit`}
                        className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase rounded-lg transition"
                    >
                        Edit
                    </Link>
                    <Link
                        href={`/atp/${record.id}/print`}
                        className="px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold uppercase rounded-lg transition"
                    >
                        Cetak ATP
                    </Link>
                </div>
            </div>

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* 1. Detail Site Card */}
                <Card title="Detail Site">
                    <div className="space-y-3.5 text-xs text-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase">Tanggal Audit</p>
                                        <p className="font-bold text-gray-900 mt-0.5">{record.tanggal}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase">No. PO / SPK</p>
                                        <p className="font-bold text-gray-900 mt-0.5">{record.no_po}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Wilayah / Region</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{record.region || '-'}</p>
                                </div>

                                {record.latitude && (
                                    <div className="pt-2">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase">Koordinat GPS</p>
                                        <code className="text-xs bg-gray-100 text-gray-500 font-mono px-2 py-0.5 rounded inline-block mt-1">
                                            {record.latitude}, {record.longitude}
                                        </code>
                                    </div>
                                )}
                            </div>

                            {record.latitude && (
                                <div className="h-[200px] w-full border border-gray-200 rounded-lg overflow-hidden z-10">
                                    <div id="map-atp-detail" className="h-full w-full" />
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* 2. Checkpoint Table Card */}
                <Card title="Checkpoint Parameter ATP">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 mb-4">
                        <SearchInput value={searchQuery} onChange={handleSearchChange} />
                    </div>

                    <Table headers={['Nama Parameter', 'Standard', 'Hasil', 'Status', 'Catatan', 'Dokumentasi']}>
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400 font-medium">
                                    Tidak ada data checkpoint
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => {
                                const itemPhotos = record.photos.filter(p => String(p.item_id) === String(item.key));
                                return (
                                    <tr key={item.key} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 font-bold text-gray-900">
                                            {item.name}
                                            <div className="text-[10px] text-gray-400 mt-0.5">Alat: {item.tool}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs text-gray-500">{item.std}</td>
                                        <td className="px-4 py-3 text-center font-semibold text-gray-700">{item.hasil || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${item.val === 'OK'
                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                    : item.val === 'NG'
                                                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                                    }`}
                                            >
                                                {item.val || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-xs">{item.catatan || '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                {itemPhotos.map((photo) => (
                                                    <div
                                                        key={photo.id}
                                                        className="relative w-10 h-10 rounded border border-gray-200 overflow-hidden bg-white shadow-sm hover:border-[#00ADB5] transition cursor-pointer"
                                                        onClick={() => setSelectedImage(photo.file_url)}
                                                    >
                                                        <img
                                                            src={photo.file_url}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.src = 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=85';
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                                {itemPhotos.length === 0 && <span className="text-gray-400 text-xs">-</span>}
                                            </div>
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

                {/* 3. Verdict Keputusan Card */}
                <Card title="Verdict Keputusan">
                    <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-400 uppercase">Status Kelayakan</span>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${record.verdict === 'ACCEPT'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : record.verdict === 'CONDITIONAL'
                                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                        : record.verdict === 'REJECT'
                                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                                    }`}
                            >
                                {record.verdict || 'PENDING'}
                            </span>
                        </div>
                        {record.verdict_notes && (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-600">
                                <p className="font-bold text-gray-700 mb-1">Catatan Verdict:</p>
                                {record.verdict_notes}
                            </div>
                        )}
                    </div>
                </Card>

                {/* 4. Pihak Otorisasi Card */}
                <Card title="Pihak Otorisasi">
                    <div className="space-y-3.5 text-xs text-gray-700">
                        <div>
                            <p className="font-bold text-primary mb-1">Pihak Pelaksana (Vendor)</p>
                            <p className="font-semibold text-gray-900">{app.vendor_company || '-'}</p>
                            <p className="text-gray-500 mt-0.5">{app.vendor_1_name} ({app.vendor_1_role})</p>
                        </div>
                        <div className="pt-2.5 border-t border-gray-100">
                            <p className="font-bold text-gray-900 mb-1">Tim Evaluasi (CME Team)</p>
                            <p className="font-semibold text-gray-900">{app.cme_company || '-'}</p>
                            <p className="text-gray-500 mt-0.5">{app.cme_1_name} ({app.cme_1_role})</p>
                        </div>
                    </div>
                </Card>

                {/* 5. Dokumen Pendukung Grid (2x2 Layout on Desktop) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* BAL Card */}
                    <Card title="Berita Acara Lapangan (BAL)">
                        <div className="flex flex-col justify-between h-full space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Dokumen resmi Berita Acara Lapangan yang digunakan untuk mencatat hasil audit fisik di lokasi site.
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-400">Status:</span>
                                    {record.bal ? (
                                        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            Selesai dibuat
                                        </span>
                                    ) : (
                                        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600 border border-gray-200">
                                            Belum dibuat
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                {record.bal ? (
                                    <>
                                        <Link
                                            href={`/atp/${record.id}/bal`}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold uppercase rounded-lg transition"
                                        >
                                            <Printer className="h-3.5 w-3.5 stroke-[1.5]" />
                                            Cetak
                                        </Link>
                                        <Button
                                            variant="danger"
                                            onClick={handleDeleteBal}
                                            className="px-3 py-2"
                                            processing={deletingBal}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                                            Hapus
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowBalForm(true)}
                                        className="w-full sm:w-auto"
                                    >
                                        <Plus className="h-3.5 w-3.5 stroke-[1.5]" />
                                        Buat BAL
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* BASTP Card */}
                    <Card title="BASTP / Handover">
                        <div className="flex flex-col justify-between h-full space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Berita Acara Serah Terima Pekerjaan (BASTP) untuk proses serah terima formal dengan pemberi kerja.
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-400">Status:</span>
                                    {record.bastp ? (
                                        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            Selesai dibuat
                                        </span>
                                    ) : (
                                        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600 border border-gray-200">
                                            Belum dibuat
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                {record.bastp ? (
                                    <>
                                        <Link
                                            href={`/atp/${record.id}/bastp`}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold uppercase rounded-lg transition"
                                        >
                                            <Printer className="h-3.5 w-3.5 stroke-[1.5]" />
                                            Cetak
                                        </Link>
                                        <Button
                                            variant="danger"
                                            onClick={handleDeleteBastp}
                                            className="px-3 py-2"
                                            processing={deletingBastp}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                                            Hapus
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowBastpForm(true)}
                                        className="w-full sm:w-auto"
                                    >
                                        <Plus className="h-3.5 w-3.5 stroke-[1.5]" />
                                        Buat BASTP
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Cetak ATP Card (Spans across 2 columns on desktop) */}
                    <div className="lg:col-span-2">
                        <Card title="Cetak ATP">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 leading-relaxed font-body">
                                        Cetak laporan Checklist Parameter ATP lengkap beserta data koordinat GPS, verdict keputusan, otorisasi tanda tangan, dan lampiran foto dokumentasi fisik.
                                    </p>
                                </div>
                                <Link
                                    href={`/atp/${record.id}/print`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase rounded-lg transition shrink-0 font-body"
                                >
                                    <Printer className="h-4 w-4 stroke-[1.5]" />
                                    Cetak Dokumen ATP
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* BAL DIALOG MODAL */}
            <Modal isOpen={showBalForm} onClose={() => setShowBalForm(false)} title="Buat Berita Acara Lapangan (BAL)" size="max-w-2xl">
                <form onSubmit={handleSaveBal} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Nama Project" value={balForm.data.project} onChange={(e) => balForm.setData('project', e.target.value)} required disabled={!!initialBalValues.project} error={balForm.errors.project} />
                        <Input label="Nomor PO" value={balForm.data.no_po} onChange={(e) => balForm.setData('no_po', e.target.value)} required disabled={!!initialBalValues.no_po} error={balForm.errors.no_po} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Mulai Tanggal" type="date" value={balForm.data.tanggal_mulai} onChange={(e) => balForm.setData('tanggal_mulai', e.target.value)} required disabled={!!initialBalValues.tanggal_mulai} error={balForm.errors.tanggal_mulai} />
                        <Input label="Selesai Tanggal" type="date" value={balForm.data.tanggal} onChange={(e) => balForm.setData('tanggal', e.target.value)} required disabled={!!initialBalValues.tanggal} error={balForm.errors.tanggal} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="Pelaksana Pekerjaan" value={balForm.data.pelaksana} onChange={(e) => balForm.setData('pelaksana', e.target.value)} required disabled={!!initialBalValues.pelaksana} error={balForm.errors.pelaksana} />
                        <Input label="Lokasi / Site" value={balForm.data.lokasi} onChange={(e) => balForm.setData('lokasi', e.target.value)} required disabled={!!initialBalValues.lokasi} error={balForm.errors.lokasi} />
                        <Input label="Hasil Rekomendasi" value={balForm.data.hasil} onChange={(e) => balForm.setData('hasil', e.target.value)} required disabled={!!initialBalValues.hasil} error={balForm.errors.hasil} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                        <div>
                            <h4 className="font-bold text-primary uppercase tracking-wider mb-2">Pihak I (Pelaksana)</h4>
                            <Input label="Nama Perusahaan" value={balForm.data.pihak1} onChange={(e) => balForm.setData('pihak1', e.target.value)} required disabled={!!initialBalValues.pihak1} error={balForm.errors.pihak1} />
                            <Input label="Nama Representative" value={balForm.data.nama1} onChange={(e) => balForm.setData('nama1', e.target.value)} required disabled={!!initialBalValues.nama1} error={balForm.errors.nama1} className="mt-2" />
                            <Input label="Jabatan Representative" value={balForm.data.jabatan1} onChange={(e) => balForm.setData('jabatan1', e.target.value)} required disabled={!!initialBalValues.jabatan1} error={balForm.errors.jabatan1} className="mt-2" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-2">Pihak II (Pengawas)</h4>
                            <Input label="Nama Perusahaan" value={balForm.data.pihak2} onChange={(e) => balForm.setData('pihak2', e.target.value)} required disabled={!!initialBalValues.pihak2} error={balForm.errors.pihak2} />
                            <Input label="Nama Representative" value={balForm.data.nama2} onChange={(e) => balForm.setData('nama2', e.target.value)} required disabled={!!initialBalValues.nama2} error={balForm.errors.nama2} className="mt-2" />
                            <Input label="Jabatan Representative" value={balForm.data.jabatan2} onChange={(e) => balForm.setData('jabatan2', e.target.value)} required disabled={!!initialBalValues.jabatan2} error={balForm.errors.jabatan2} className="mt-2" />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end border-t pt-3">
                        <Button type="submit" variant="primary" processing={balForm.processing}>Simpan BAL</Button>
                        <Button type="button" variant="outline" onClick={() => setShowBalForm(false)}>Batal</Button>
                    </div>
                </form>
            </Modal>

            {/* BASTP DIALOG MODAL */}
            <Modal isOpen={showBastpForm} onClose={() => setShowBastpForm(false)} title="Buat BASTP (BA Serah Terima Pekerjaan)" size="max-w-2xl">
                <form onSubmit={handleSaveBastp} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Nama Pihak I (Pelaksana)" value={bastpForm.data.p1_nama} onChange={(e) => bastpForm.setData('p1_nama', e.target.value)} required disabled={!!initialBastpValues.p1_nama} error={bastpForm.errors.p1_nama} />
                        <Input label="Alamat Pihak I" value={bastpForm.data.p1_alamat} onChange={(e) => bastpForm.setData('p1_alamat', e.target.value)} required disabled={!!initialBastpValues.p1_alamat} error={bastpForm.errors.p1_alamat} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Nama Pihak II (Pemberi Kerja)" value={bastpForm.data.p2_nama} onChange={(e) => bastpForm.setData('p2_nama', e.target.value)} required disabled={!!initialBastpValues.p2_nama} error={bastpForm.errors.p2_nama} />
                        <Input label="Jabatan Pihak II" value={bastpForm.data.p2_jabatan} onChange={(e) => bastpForm.setData('p2_jabatan', e.target.value)} required disabled={!!initialBastpValues.p2_jabatan} error={bastpForm.errors.p2_jabatan} />
                    </div>
                    <div className="space-y-3">
                        <Input label="Alamat Pihak II" value={bastpForm.data.p2_alamat} onChange={(e) => bastpForm.setData('p2_alamat', e.target.value)} required disabled={!!initialBastpValues.p2_alamat} error={bastpForm.errors.p2_alamat} />
                        <Input label="Nama Pekerjaan (BASTP)" value={bastpForm.data.pekerjaan} onChange={(e) => bastpForm.setData('pekerjaan', e.target.value)} required disabled={!!initialBastpValues.pekerjaan} error={bastpForm.errors.pekerjaan} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                        <Input label="Mengetahui Pihak I (Nama/Jabatan)" value={bastpForm.data.mengetahui1} onChange={(e) => bastpForm.setData('mengetahui1', e.target.value)} required disabled={!!initialBastpValues.mengetahui1} error={bastpForm.errors.mengetahui1} placeholder="Nama Pemeriksa I" />
                        <Input label="Mengetahui Pihak II (Nama/Jabatan)" value={bastpForm.data.mengetahui2} onChange={(e) => bastpForm.setData('mengetahui2', e.target.value)} required disabled={!!initialBastpValues.mengetahui2} error={bastpForm.errors.mengetahui2} placeholder="Nama Pemeriksa II" />
                    </div>
                    <div className="flex gap-2 justify-end border-t pt-3">
                        <Button type="submit" variant="primary" processing={bastpForm.processing}>Simpan BASTP</Button>
                        <Button type="button" variant="outline" onClick={() => setShowBastpForm(false)}>Batal</Button>
                    </div>
                </form>
            </Modal>

            {/* Photo Preview Zoom Modal */}
            <Modal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                title="Pratinjau Foto Dokumentasi"
                size="max-w-2xl"
            >
                <div className="flex justify-center items-center p-2 bg-gray-900 rounded-lg">
                    <img
                        src={selectedImage}
                        alt="Zoomed Preview"
                        className="max-w-full max-h-[70vh] object-contain rounded"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=85';
                        }}
                    />
                </div>
            </Modal>

            {/* Local Confirmation Modal */}
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


Detail.layout = page => <AppLayout children={page} />;
