import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Input from '../../Components/Input';
import Button from '../../Components/Button';
import ConfirmationModal from '../../Components/ConfirmationModal';
import ImageUpload from '../../Components/ImageUpload';
import Breadcrumbs from '../../Components/Breadcrumbs';
import { ArrowLeft } from 'lucide-react';

export default function Edit({ record, templates }) {
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });
    const [showConfirm, setShowConfirm] = useState(false);
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        nama_site: record.nama_site || '',
        tanggal: record.tanggal || '',
        region: record.region || '',
        latitude: record.latitude || '-6.200000',
        longitude: record.longitude || '106.816666',
        no_po: record.no_po || '',
        hasil_json: record.hasil_json || {
            items: {},
            hasil: {},
            catatan: {},
            itemNames: {},
            itemStds: {},
            itemTools: {},
            approval: {
                vendor_company: '',
                vendor_1_role: '',
                vendor_1_name: '',
                cme_company: '',
                cme_1_role: '',
                cme_1_name: '',
            },
        },
        verdict: record.verdict || '',
        verdict_notes: record.verdict_notes || '',
        fotos_item: record.fotos_item || {},
    });

    // Initialize Leaflet map
    useEffect(() => {
        if (typeof window !== 'undefined' && !mapRef.current) {
            const initMap = () => {
                const center = [parseFloat(data.latitude), parseFloat(data.longitude)];
                const map = window.L.map('map-atp-edit-el').setView(center, 14);
                mapRef.current = map;

                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap contributors',
                }).addTo(map);

                const marker = window.L.marker(center, { draggable: true }).addTo(map);
                markerRef.current = marker;

                marker.on('dragend', () => {
                    const pos = marker.getLatLng();
                    setData((prev) => ({
                        ...prev,
                        latitude: pos.lat.toFixed(6),
                        longitude: pos.lng.toFixed(6),
                    }));
                });

                map.on('click', (e) => {
                    marker.setLatLng(e.latlng);
                    setData((prev) => ({
                        ...prev,
                        latitude: e.latlng.lat.toFixed(6),
                        longitude: e.latlng.lng.toFixed(6),
                    }));
                });
            };

            if (window.L) {
                initMap();
                setMapLoaded(true);
            } else {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
                document.head.appendChild(link);

                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
                script.onload = () => {
                    initMap();
                    setMapLoaded(true);
                };
                document.body.appendChild(script);
            }
        }
    }, [record]);

    const getMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const lat = pos.coords.latitude.toFixed(6);
                const lng = pos.coords.longitude.toFixed(6);
                setData((prev) => ({ ...prev, latitude: lat, longitude: lng }));

                if (mapRef.current && markerRef.current) {
                    mapRef.current.setView([lat, lng], 15);
                    markerRef.current.setLatLng([lat, lng]);
                }
            });
        }
    };

    const handleCheckChange = (key, val) => {
        const nextItems = {
            ...data.hasil_json.items,
            [key]: val,
        };
        const nextHasil = { ...data.hasil_json.hasil };
        const nextCatatan = { ...data.hasil_json.catatan };
        const nextFotos = { ...data.fotos_item };

        if (val === 'NA') {
            nextHasil[key] = '';
            nextCatatan[key] = 'Not Available';
            nextFotos[key] = [];
        }

        setData((prev) => ({
            ...prev,
            hasil_json: {
                ...prev.hasil_json,
                items: nextItems,
                hasil: nextHasil,
                catatan: nextCatatan,
            },
            fotos_item: nextFotos,
        }));
    };

    const handleTextChange = (field, key, val) => {
        setData('hasil_json', {
            ...data.hasil_json,
            [field]: {
                ...data.hasil_json[field],
                [key]: val,
            },
        });
    };

    const handleApprovalChange = (field, val) => {
        setData('hasil_json', {
            ...data.hasil_json,
            approval: {
                ...data.hasil_json.approval,
                [field]: val,
            },
        });
    };

    const handleFileChange = async (key, files) => {
        const fileList = Array.from(files);
        const uploadedFiles = [];

        for (const file of fileList) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await axios.post('/api/upload-temp', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedFiles.push({
                    path: response.data.path,
                    url: response.data.url,
                    name: file.name
                });
            } catch (err) {
                const msg = err.response?.data?.message || err.response?.data?.errors?.image?.[0] || 'Gagal mengunggah foto.';
                setAlertModal({
                    isOpen: true,
                    title: 'Validasi Gambar Gagal',
                    message: msg,
                    type: 'danger'
                });
            }
        }

        setData('fotos_item', {
            ...data.fotos_item,
            [key]: [...(data.fotos_item[key] || []), ...uploadedFiles]
        });
    };

    // Calculate checks progress percentage
    const getProgress = () => {
        if (!data.hasil_json?.items) return { pct: 0, total: 0, checked: 0 };
        const keys = Object.keys(data.hasil_json.items);
        const total = keys.length;
        if (total === 0) return { pct: 0, total: 0, checked: 0 };

        const checked = keys.filter(k => data.hasil_json.items[k] !== '').length;
        const pct = Math.round((checked / total) * 100);
        return { pct, total, checked };
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        let hasError = false;
        const newErrors = {};

        if (!data.nama_site) {
            newErrors.nama_site = 'Nama site wajib diisi.';
            hasError = true;
        }
        if (!data.tanggal) {
            newErrors.tanggal = 'Tanggal pemeriksaan wajib diisi.';
            hasError = true;
        }
        if (!data.no_po) {
            newErrors.no_po = 'Nomor PO / SPK wajib diisi.';
            hasError = true;
        }

        const items = data.hasil_json?.items || {};
        const itemNames = data.hasil_json?.itemNames || {};

        Object.entries(itemNames).forEach(([key, name]) => {
            const status = items[key];
            const namaItem = name || key;

            if (!status) {
                newErrors[`hasil_json.items.${key}`] = `Status untuk '${namaItem}' wajib dipilih.`;
                hasError = true;
            } else if (status === 'OK' || status === 'NG') {
                const photos = data.fotos_item[key] || [];
                if (photos.length === 0) {
                    newErrors[`fotos_item.${key}`] = `Foto untuk '${namaItem}' wajib diunggah.`;
                    hasError = true;
                }
            }
        });

        if (hasError) {
            setError(newErrors);
            setAlertModal({
                isOpen: true,
                title: 'Validasi Gagal',
                message: 'Silakan lengkapi semua field checklist dan foto yang wajib diunggah.',
                type: 'danger'
            });
            return;
        }

        setShowConfirm(true);
    };

    const confirmSubmit = () => {
        setShowConfirm(false);
        post(`/atp/${record.id}/edit`);
    };

    const progress = getProgress();
    const app = data.hasil_json?.approval || {};
    const itemNames = data.hasil_json?.itemNames || {};
    const itemStds = data.hasil_json?.itemStds || {};
    const itemTools = data.hasil_json?.itemTools || {};
    const itemVals = data.hasil_json?.items || {};
    const itemHasil = data.hasil_json?.hasil || {};
    const itemCatatan = data.hasil_json?.catatan || {};

    return (
        <>
            <Head title={`Edit ATP - ${record.nama_site}`} />

            <Breadcrumbs items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'ATP Check', href: '/atp' },
                { label: record.nama_site || `ATP #${record.id}`, href: `/atp/${record.id}` },
                { label: 'Edit Laporan' }
            ]} />

            <div className="mb-6 flex items-center gap-3">
                <Link
                    href={`/atp/${record.id}`}
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-black transition shrink-0"
                >
                    <ArrowLeft className="h-4 w-4 stroke-[1.5]" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Edit Laporan ATP
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Sesuaikan checklist, verdict kelayakan, dan foto verifikasi.
                    </p>
                </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm flex items-center gap-4 sticky top-14 z-30">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Progress Checks:</span>
                <div className="flex-grow h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#00ADB5] rounded-full transition-all duration-300"
                        style={{ width: `${progress.pct}%` }}
                    />
                </div>
                <span className="text-sm font-black text-[#00ADB5] font-headlines">{progress.pct}%</span>
                <span className="text-xs text-gray-400">
                    ({progress.checked}/{progress.total} item diperiksa)
                </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. SITE INFO */}
                <Card title="Informasi Site &amp; PO">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Input
                                label="Nama Site"
                                type="text"
                                value={data.nama_site}
                                onChange={(e) => setData('nama_site', e.target.value)}
                                error={errors.nama_site}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Tanggal Pemeriksaan"
                                    type="date"
                                    value={data.tanggal}
                                    onChange={(e) => setData('tanggal', e.target.value)}
                                    error={errors.tanggal}
                                    required
                                />
                                <Input
                                    label="Nomor PO / SPK"
                                    type="text"
                                    value={data.no_po}
                                    onChange={(e) => setData('no_po', e.target.value)}
                                    error={errors.no_po}
                                    required
                                />
                            </div>

                            <Input
                                label="Deskripsi Wilayah / Region"
                                type="text"
                                value={data.region}
                                onChange={(e) => setData('region', e.target.value)}
                                error={errors.region}
                            />

                            <div className="flex gap-2 items-end">
                                <div className="grid grid-cols-2 gap-2 flex-grow">
                                    <Input
                                        label="Latitude"
                                        type="text"
                                        value={data.latitude}
                                        readOnly
                                    />
                                    <Input
                                        label="Longitude"
                                        type="text"
                                        value={data.longitude}
                                        readOnly
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={getMyLocation}
                                    className="h-10 text-[10px]"
                                >
                                    Get GPS
                                </Button>
                            </div>
                        </div>

                        {/* MAP CONTAINER */}
                        <div className="flex flex-col border border-gray-200 rounded-lg overflow-hidden h-[280px] bg-gray-50">
                            <div id="map-atp-edit-el" className="w-full flex-grow z-10" />
                        </div>
                    </div>
                </Card>

                {/* 2. DYNAMIC ATP CHECKLIST */}
                <Card title="Checkpoint Parameter ATP">
                    <div className="space-y-6">
                        {Object.entries(itemNames).map(([key, name]) => {
                            const checkVal = itemVals[key] || '';
                            const hasilVal = itemHasil[key] || '';
                            const catatanVal = itemCatatan[key] || '';
                            return (
                                <div key={key} className="p-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-gray-50/20">
                                    <div className="flex-grow space-y-1">
                                        <span className="font-bold text-sm text-gray-800">{name}</span>
                                        <div className="flex flex-wrap gap-4 text-[10px] text-gray-400">
                                            <span>Standar: <code className="font-mono">{itemStds[key]}</code></span>
                                            <span>Alat: <code className="font-mono">{itemTools[key]}</code></span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex flex-wrap items-center gap-3">
                                            {/* Results OK/NG/NA toggles */}
                                            <div>
                                                <div className="flex border border-gray-200 rounded overflow-hidden">
                                                    {['OK', 'NG', 'NA'].map((st) => (
                                                        <button
                                                            key={st}
                                                            type="button"
                                                            onClick={() => handleCheckChange(key, st)}
                                                            className={`px-3 py-1 text-xs font-bold transition ${checkVal === st
                                                                ? st === 'OK'
                                                                    ? 'bg-emerald-500 text-white'
                                                                    : st === 'NG'
                                                                        ? 'bg-red-500 text-white'
                                                                        : 'bg-amber-500 text-white'
                                                                : 'bg-white text-gray-400 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {st}
                                                        </button>
                                                    ))}
                                                </div>
                                                {errors[`hasil_json.items.${key}`] && (
                                                    <p className="text-red-500 text-[10px] mt-1">{errors[`hasil_json.items.${key}`]}</p>
                                                )}
                                            </div>

                                            <Input
                                                placeholder="Hasil Pengukuran"
                                                className={`text-xs p-1.5 w-32 transition-all ${checkVal === 'NA' ? 'opacity-40 bg-gray-100 cursor-not-allowed select-none' : ''}`}
                                                value={hasilVal}
                                                onChange={(e) => handleTextChange('hasil', key, e.target.value)}
                                                disabled={checkVal === 'NA'}
                                            />

                                            <Input
                                                placeholder="Catatan Audit"
                                                className={`text-xs p-1.5 w-44 transition-all ${checkVal === 'NA' ? 'opacity-40 bg-gray-100 cursor-not-allowed select-none' : ''}`}
                                                value={catatanVal}
                                                onChange={(e) => handleTextChange('catatan', key, e.target.value)}
                                                disabled={checkVal === 'NA'}
                                            />

                                            <div className="w-40">
                                                <div className={`transition-all ${checkVal === 'NA' ? 'opacity-40 pointer-events-none cursor-not-allowed select-none' : ''}`}>
                                                    <ImageUpload
                                                        compact={true}
                                                        multiple={true}
                                                        value={data.fotos_item[key] || []}
                                                        onChange={(files) => setData('fotos_item', {
                                                            ...data.fotos_item,
                                                            [key]: files
                                                        })}
                                                    />
                                                </div>
                                                {errors[`fotos_item.${key}`] && (
                                                    <p className="text-red-500 text-[10px] mt-1">{errors[`fotos_item.${key}`]}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* 3. APPROVAL METADATA */}
                <Card title="Tanda Tangan &amp; Otorisasi">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* VENDOR */}
                        <div className="space-y-3 p-4 border border-gray-150 rounded-lg">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-[#00ADB5]">Pihak Pelaksana (Vendor)</h4>
                            <Input
                                label="Perusahaan Vendor"
                                value={app.vendor_company || ''}
                                onChange={(e) => handleApprovalChange('vendor_company', e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    label="Nama Representative"
                                    value={app.vendor_1_name || ''}
                                    onChange={(e) => handleApprovalChange('vendor_1_name', e.target.value)}
                                />
                                <Input
                                    label="Jabatan"
                                    value={app.vendor_1_role || ''}
                                    onChange={(e) => handleApprovalChange('vendor_1_role', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* CME TIM */}
                        <div className="space-y-3 p-4 border border-gray-150 rounded-lg">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">Tim Evaluasi (CME Team)</h4>
                            <Input
                                label="Perusahaan CME"
                                value={app.cme_company || ''}
                                onChange={(e) => handleApprovalChange('cme_company', e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    label="Nama Representative"
                                    value={app.cme_1_name || ''}
                                    onChange={(e) => handleApprovalChange('cme_1_name', e.target.value)}
                                />
                                <Input
                                    label="Jabatan"
                                    value={app.cme_1_role || ''}
                                    onChange={(e) => handleApprovalChange('cme_1_role', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 4. VERDICT */}
                <Card title="Hasil Verdict Audit">
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium text-xs text-gray-700 mb-2">Verdict Kelayakan</label>
                            <div className="flex gap-2">
                                {['ACCEPT', 'CONDITIONAL', 'REJECT'].map((v) => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setData('verdict', v)}
                                        className={`px-4 py-2 border rounded-md font-bold text-xs uppercase tracking-wider transition ${data.verdict === v
                                            ? v === 'ACCEPT'
                                                ? 'bg-emerald-500 border-transparent text-white'
                                                : v === 'CONDITIONAL'
                                                    ? 'bg-amber-50 border-transparent text-white'
                                                    : 'bg-red-500 border-transparent text-white'
                                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <textarea
                            placeholder="Catatan verdict..."
                            value={data.verdict_notes}
                            onChange={(e) => setData('verdict_notes', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-[#00ADB5] focus:ring focus:ring-[#00ADB5]/20 outline-none min-h-[80px]"
                        />
                    </div>
                </Card>

                <div className="flex gap-4">
                    <Button
                        type="submit"
                        variant="secondary"
                        className="px-8 py-3 text-xs uppercase tracking-wider font-bold"
                        processing={processing}
                    >
                        Simpan Perubahan
                    </Button>
                    <Link
                        href={`/atp/${record.id}`}
                        className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest bg-white hover:bg-gray-50 transition"
                    >
                        Batal
                    </Link>
                </div>
            </form>

            <ConfirmationModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmSubmit}
                title="Konfirmasi Perubahan ATP"
                message="Apakah Anda yakin ingin menyimpan perubahan laporan ATP ini?"
                type="warning"
                confirmText="Ya, Simpan"
            />
        </>
    );
}


Edit.layout = page => <AppLayout children={page} />;
