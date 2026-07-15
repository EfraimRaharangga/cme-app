import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Input from '../../Components/Input';
import Button from '../../Components/Button';
import ConfirmationModal from '../../Components/ConfirmationModal';

export default function New({ defaultTemplate, templates }) {
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const { data, setData, post, processing, errors } = useForm({
        nama_site: '',
        tanggal: new Date().toISOString().split('T')[0],
        region: '',
        latitude: '-6.200000',
        longitude: '106.816666',
        no_po: '',
        hasil_json: {
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
        verdict: '',
        verdict_notes: '',
        fotos_item: {}, // File uploads mapped by item key
    });

    // Populate checklist details on template loads
    useEffect(() => {
        const initialItems = {};
        const initialHasil = {};
        const initialCatatan = {};
        const itemNames = {};
        const itemStds = {};
        const itemTools = {};

        defaultTemplate.forEach((item) => {
            if (item.ty === 'it') {
                const key = item._id;
                initialItems[key] = '';
                initialHasil[key] = '';
                initialCatatan[key] = '';
                itemNames[key] = item.d[0];
                itemStds[key] = item.d[1];
                itemTools[key] = item.d[2];
            }
        });

        setData('hasil_json', {
            items: initialItems,
            hasil: initialHasil,
            catatan: initialCatatan,
            itemNames,
            itemStds,
            itemTools,
            approval: {
                vendor_company: '',
                vendor_1_role: '',
                vendor_1_name: '',
                cme_company: '',
                cme_1_role: '',
                cme_1_name: '',
            },
        });
    }, [defaultTemplate]);

    // Initialize Leaflet map
    useEffect(() => {
        if (typeof window !== 'undefined' && !mapRef.current) {
            const initMap = () => {
                const center = [parseFloat(data.latitude), parseFloat(data.longitude)];
                const map = window.L.map('map-atp-el').setView(center, 13);
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
    }, []);

    const getMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude.toFixed(6);
                    const lng = pos.coords.longitude.toFixed(6);
                    setData((prev) => ({ ...prev, latitude: lat, longitude: lng }));

                    if (mapRef.current && markerRef.current) {
                        mapRef.current.setView([lat, lng], 15);
                        markerRef.current.setLatLng([lat, lng]);
                    }
                },
                (err) => {
                    setAlertModal({
                        isOpen: true,
                        title: 'Error Geolocation',
                        message: 'Gagal mengambil lokasi: ' + err.message,
                        type: 'danger'
                    });
                }
            );
        } else {
            setAlertModal({
                isOpen: true,
                title: 'Tidak Didukung',
                message: 'Browser Anda tidak mendukung Geolocation.',
                type: 'warning'
            });
        }
    };

    const handleCheckChange = (key, val) => {
        setData('hasil_json', {
            ...data.hasil_json,
            items: {
                ...data.hasil_json.items,
                [key]: val,
            },
        });
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

    const handleFileChange = (key, files) => {
        setData('fotos_item', {
            ...data.fotos_item,
            [key]: Array.from(files),
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

        const formData = new FormData();
        formData.append('nama_site', data.nama_site);
        formData.append('tanggal', data.tanggal);
        formData.append('region', data.region);
        formData.append('latitude', data.latitude);
        formData.append('longitude', data.longitude);
        formData.append('no_po', data.no_po);
        formData.append('verdict', data.verdict);
        formData.append('verdict_notes', data.verdict_notes);
        formData.append('hasil_json', JSON.stringify(data.hasil_json));

        Object.entries(data.fotos_item).forEach(([key, fileList]) => {
            fileList.forEach((file, idx) => {
                formData.append(`fotos_item[${key}][${idx}]`, file);
            });
        });

        post('/atp/baru', {
            data: formData,
            forceFormData: true,
        });
    };

    const progress = getProgress();

    return (
        <>
            <Head title="ATP Baru - Web CME" />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Acceptance Test Procedure (ATP) Baru
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Input site checklist, verdict kelayakan, dan foto verifikasi.
                    </p>
                </div>
                <Link
                    href="/atp"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition"
                >
                    &larr; Riwayat
                </Link>
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
                {/* 1. SITE DETAILS */}
                <Card title="📍 Informasi Site &amp; PO">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Input
                                label="Nama Site"
                                type="text"
                                placeholder="Masukkan nama site"
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
                                    placeholder="Masukkan nomor PO"
                                    value={data.no_po}
                                    onChange={(e) => setData('no_po', e.target.value)}
                                    error={errors.no_po}
                                    required
                                />
                            </div>

                            <Input
                                label="Deskripsi Wilayah / Region"
                                type="text"
                                placeholder="Masukkan Region"
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
                                    📍 Get GPS
                                </Button>
                            </div>
                        </div>

                        {/* LEAFLET CONTAINER */}
                        <div className="flex flex-col border border-gray-200 rounded-lg overflow-hidden h-[280px] bg-gray-50">
                            <div id="map-atp-el" className="w-full flex-grow z-10" />
                        </div>
                    </div>
                </Card>

                {/* 2. DYNAMIC ATP CHECKLIST */}
                <Card title="📋 Checkpoint Parameter ATP">
                    <div className="space-y-6">
                        {defaultTemplate.map((item, idx) => {
                            if (item.ty === 'sec') {
                                return (
                                    <div key={idx} className="bg-gray-900 text-white px-4 py-2 rounded-t font-black text-xs uppercase tracking-wider mt-4">
                                        {item.tx}
                                    </div>
                                );
                            }
                            if (item.ty === 'sub') {
                                return (
                                    <div key={idx} className="bg-[#00ADB5]/10 text-[#00ADB5] px-4 py-1.5 font-bold text-xs uppercase tracking-wider">
                                        {item.tx}
                                    </div>
                                );
                            }
                            if (item.ty === 'it') {
                                const key = item._id;
                                const checkVal = data.hasil_json?.items?.[key] ?? '';
                                const hasilVal = data.hasil_json?.hasil?.[key] ?? '';
                                const catatanVal = data.hasil_json?.catatan?.[key] ?? '';
                                return (
                                    <div key={key} className="p-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-gray-50/20">
                                        <div className="flex-grow space-y-1">
                                            <span className="font-bold text-sm text-gray-800">{item.d[0]}</span>
                                            <div className="flex flex-wrap gap-4 text-[10px] text-gray-400">
                                                <span>Standar: <code className="font-mono">{item.d[1]}</code></span>
                                                <span>Alat: <code className="font-mono">{item.d[2]}</code></span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            {/* Results OK/NG/NA toggles */}
                                            <div className="flex border border-gray-200 rounded overflow-hidden">
                                                {['OK', 'NG', 'NA'].map((st) => (
                                                    <button
                                                        key={st}
                                                        type="button"
                                                        onClick={() => handleCheckChange(key, st)}
                                                        className={`px-3 py-1 text-xs font-bold transition ${
                                                            checkVal === st
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

                                            <Input
                                                placeholder="Hasil Pengukuran"
                                                className="text-xs p-1.5 w-32"
                                                value={hasilVal}
                                                onChange={(e) => handleTextChange('hasil', key, e.target.value)}
                                            />

                                            <Input
                                                placeholder="Catatan Audit"
                                                className="text-xs p-1.5 w-44"
                                                value={catatanVal}
                                                onChange={(e) => handleTextChange('catatan', key, e.target.value)}
                                            />

                                            <div className="w-40">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(key, e.target.files)}
                                                    className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-1.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </Card>

                {/* 3. SIGNATURE APPROVAL METADATA */}
                <Card title="✍️ Tanda Tangan &amp; Otorisasi">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* VENDOR */}
                        <div className="space-y-3 p-4 border border-gray-150 rounded-lg">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-[#00ADB5]">Pihak Pelaksana (Vendor)</h4>
                            <Input
                                label="Perusahaan Vendor"
                                value={data.hasil_json.approval.vendor_company || ''}
                                onChange={(e) => handleApprovalChange('vendor_company', e.target.value)}
                                placeholder="PT. Pelaksana Pekerjaan"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    label="Nama Representative"
                                    value={data.hasil_json.approval.vendor_1_name || ''}
                                    onChange={(e) => handleApprovalChange('vendor_1_name', e.target.value)}
                                    placeholder="Nama perwakilan"
                                />
                                <Input
                                    label="Jabatan"
                                    value={data.hasil_json.approval.vendor_1_role || ''}
                                    onChange={(e) => handleApprovalChange('vendor_1_role', e.target.value)}
                                    placeholder="CME Inspector"
                                />
                            </div>
                        </div>

                        {/* CME TIM */}
                        <div className="space-y-3 p-4 border border-gray-150 rounded-lg">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">Tim Evaluasi (CME Team)</h4>
                            <Input
                                label="Perusahaan CME"
                                value={data.hasil_json.approval.cme_company || ''}
                                onChange={(e) => handleApprovalChange('cme_company', e.target.value)}
                                placeholder="PT. Integrasi Jaringan Ekosistem"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    label="Nama Representative"
                                    value={data.hasil_json.approval.cme_1_name || ''}
                                    onChange={(e) => handleApprovalChange('cme_1_name', e.target.value)}
                                    placeholder="Nama evaluator"
                                />
                                <Input
                                    label="Jabatan"
                                    value={data.hasil_json.approval.cme_1_role || ''}
                                    onChange={(e) => handleApprovalChange('cme_1_role', e.target.value)}
                                    placeholder="CME Auditor"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 4. VERDICT AUDIT */}
                <Card title="📊 Hasil Verdict Audit">
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium text-xs text-gray-700 mb-2">Verdict Kelayakan</label>
                            <div className="flex gap-2">
                                {['ACCEPT', 'CONDITIONAL', 'REJECT'].map((v) => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setData('verdict', v)}
                                        className={`px-4 py-2 border rounded-md font-bold text-xs uppercase tracking-wider transition ${
                                            data.verdict === v
                                                ? v === 'ACCEPT'
                                                    ? 'bg-emerald-500 border-transparent text-white'
                                                    : v === 'CONDITIONAL'
                                                    ? 'bg-amber-500 border-transparent text-white'
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
                            placeholder="Catatan atau syarat verdict kelayakan..."
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
                        Simpan Laporan
                    </Button>
                    <Link
                        href="/atp"
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
        </>
    );
}


New.layout = page => <AppLayout children={page} />;
