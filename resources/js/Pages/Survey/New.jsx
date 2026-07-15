import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Input from '../../Components/Input';
import Button from '../../Components/Button';
import Alert from '../../Components/Alert';
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
        tanggal_survey: new Date().toISOString().split('T')[0],
        nama_surveyor: '',
        lokasi: '',
        latitude: '-6.200000',
        longitude: '106.816666',
        catatan_tambahan: '',
        items: {}, // Form item checkpoints
        photos: {}, // Photos files array mapped by template item key
    });

    // Flatten default template categories to construct initial checklist state
    useEffect(() => {
        const initialItems = {};
        Object.entries(defaultTemplate).forEach(([kat, list]) => {
            list.forEach((item, idx) => {
                const key = `${kat}_${idx}`;
                initialItems[key] = {
                    kategori: kat,
                    nomor: item[0],
                    nama: item[1],
                    type: item[2],
                    options: item[3],
                    status: '',
                    kondisi: '',
                    catatan: '',
                };
            });
        });
        setData('items', initialItems);
    }, [defaultTemplate]);

    // Initialize Leaflet map
    useEffect(() => {
        if (typeof window !== 'undefined' && !mapRef.current) {
            // Check if Leaflet CSS & JS are available
            const initMap = () => {
                const center = [parseFloat(data.latitude), parseFloat(data.longitude)];
                const map = window.L.map('map-el').setView(center, 13);
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

            // Dynamic load leaflet if not ready
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

    // Get current device coordinates via HTML5 Geolocation API
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

    const handleItemChange = (key, field, val) => {
        setData('items', {
            ...data.items,
            [key]: {
                ...data.items[key],
                [field]: val,
            },
        });
    };

    const handleFileChange = (key, files) => {
        setData('photos', {
            ...data.photos,
            [key]: Array.from(files),
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert files & data to FormData for posting files
        const formData = new FormData();
        formData.append('nama_site', data.nama_site);
        formData.append('tanggal_survey', data.tanggal_survey);
        formData.append('nama_surveyor', data.nama_surveyor);
        formData.append('lokasi', data.lokasi);
        formData.append('latitude', data.latitude);
        formData.append('longitude', data.longitude);
        formData.append('catatan_tambahan', data.catatan_tambahan);

        Object.entries(data.items).forEach(([key, item]) => {
            formData.append(`items[${key}][kategori]`, item.kategori);
            formData.append(`items[${key}][nomor]`, item.nomor);
            formData.append(`items[${key}][nama]`, item.nama);
            formData.append(`items[${key}][status]`, item.status);
            formData.append(`items[${key}][kondisi]`, item.kondisi);
            formData.append(`items[${key}][catatan]`, item.catatan);
        });

        Object.entries(data.photos).forEach(([key, fileList]) => {
            fileList.forEach((file, idx) => {
                formData.append(`photos[${key}][${idx}]`, file);
            });
        });

        post('/survey/baru', {
            data: formData,
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Survey Baru - Web CME" />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Survey ODC Baru
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Input site checklist, koordinat lokasi, dan foto manual instruksi.
                    </p>
                </div>
                <Link
                    href="/survey"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition"
                >
                    &larr; Riwayat
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. INFORMASI SITE */}
                <Card title="📍 Informasi Site &amp; Koordinat">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Input
                                label="Nama Site"
                                type="text"
                                placeholder="Masukkan nama site/lokasi"
                                value={data.nama_site}
                                onChange={(e) => setData('nama_site', e.target.value)}
                                error={errors.nama_site}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Tanggal Survey"
                                    type="date"
                                    value={data.tanggal_survey}
                                    onChange={(e) => setData('tanggal_survey', e.target.value)}
                                    error={errors.tanggal_survey}
                                    required
                                />
                                <Input
                                    label="Nama Surveyor"
                                    type="text"
                                    placeholder="Nama penanggung jawab"
                                    value={data.nama_surveyor}
                                    onChange={(e) => setData('nama_surveyor', e.target.value)}
                                    error={errors.nama_surveyor}
                                    required
                                />
                            </div>

                            <Input
                                label="Alamat / Deskripsi Lokasi"
                                type="text"
                                placeholder="Alamat lengkap lokasi site"
                                value={data.lokasi}
                                onChange={(e) => setData('lokasi', e.target.value)}
                                error={errors.lokasi}
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
                            <div id="map-el" className="w-full flex-grow z-10" />
                        </div>
                    </div>
                </Card>

                {/* 2. DYNAMIC CHECKLIST MODULE */}
                {Object.entries(defaultTemplate).map(([kat, list]) => (
                    <Card key={kat} title={`📋 ${kat}`}>
                        <div className="space-y-6">
                            {list.map((item, idx) => {
                                const key = `${kat}_${idx}`;
                                const state = data.items[key] || {};
                                return (
                                    <div key={key} className="p-4 border border-gray-100 rounded-lg bg-gray-50/50 flex flex-col md:flex-row md:items-start gap-4">
                                        <div className="flex-grow space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-gray-800 text-white font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">
                                                    {item[0]}
                                                </span>
                                                <span className="font-semibold text-sm text-gray-800">
                                                    {item[1]}
                                                </span>
                                            </div>

                                            {/* Checklist check controls depending on type */}
                                            <div className="flex items-center gap-4 mt-2">
                                                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                                                    <input
                                                        type="radio"
                                                        name={`status_${key}`}
                                                        checked={state.status === 'checked'}
                                                        onChange={() => handleItemChange(key, 'status', 'checked')}
                                                        className="text-[#00ADB5] focus:ring-[#00ADB5]"
                                                    />
                                                    OK / Sesuai
                                                </label>
                                                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                                                    <input
                                                        type="radio"
                                                        name={`status_${key}`}
                                                        checked={state.status === 'cross'}
                                                        onChange={() => handleItemChange(key, 'status', 'cross')}
                                                        className="text-[#00ADB5] focus:ring-[#00ADB5]"
                                                    />
                                                    NG / Perlu Perbaikan
                                                </label>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-80 space-y-3">
                                            {item[2] === 'select' ? (
                                                <div className="w-full">
                                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Pilihan Nilai</label>
                                                    <select
                                                        value={state.kondisi || ''}
                                                        onChange={(e) => handleItemChange(key, 'kondisi', e.target.value)}
                                                        className="w-full border-gray-300 rounded-md text-xs p-1.5 bg-white focus:border-[#00ADB5] focus:ring focus:ring-[#00ADB5]/20 outline-none"
                                                    >
                                                        <option value="">Pilih...</option>
                                                        {item[3].map((opt, oIdx) => (
                                                            <option key={oIdx} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <Input
                                                    label="Catatan Kondisi"
                                                    placeholder="Kondisi riil lapangan"
                                                    className="text-xs p-1.5"
                                                    value={state.kondisi || ''}
                                                    onChange={(e) => handleItemChange(key, 'kondisi', e.target.value)}
                                                />
                                            )}

                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">
                                                    Unggah Foto
                                                </label>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(key, e.target.files)}
                                                    className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition"
                                                />
                                                {data.photos[key] && (
                                                    <p className="text-[10px] text-[#00ADB5] font-semibold mt-1">
                                                        {data.photos[key].length} foto dipilih
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ))}

                {/* 3. ADDITIONAL REMARKS */}
                <Card title="📝 Catatan Tambahan">
                    <textarea
                        placeholder="Catatan tambahan hasil pemeriksaan lapangan..."
                        value={data.catatan_tambahan}
                        onChange={(e) => setData('catatan_tambahan', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-[#00ADB5] focus:ring focus:ring-[#00ADB5]/20 outline-none min-h-[100px]"
                    />
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
                        href="/survey"
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
