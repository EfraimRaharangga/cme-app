import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Input from '../../Components/Input';
import Button from '../../Components/Button';
import Alert from '../../Components/Alert';
import ConfirmationModal from '../../Components/ConfirmationModal';
import ImageUpload from '../../Components/ImageUpload';

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

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
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

        setData('photos', {
            ...data.photos,
            [key]: [...(data.photos[key] || []), ...uploadedFiles]
        });
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
        if (!data.tanggal_survey) {
            newErrors.tanggal_survey = 'Tanggal survey wajib diisi.';
            hasError = true;
        }
        if (!data.nama_surveyor) {
            newErrors.nama_surveyor = 'Nama surveyor wajib diisi.';
            hasError = true;
        }

        Object.entries(data.items).forEach(([key, state]) => {
            const namaItem = state.nama || key;
            if (!state.status) {
                newErrors[`items.${key}.status`] = `Status untuk item '${namaItem}' wajib dipilih (OK/NG).`;
                hasError = true;
            }
            if (state.type === 'select' && !state.kondisi) {
                newErrors[`items.${key}.kondisi`] = `Pilihan nilai untuk item '${namaItem}' wajib dipilih.`;
                hasError = true;
            }
            const itemPhotos = data.photos[key] || [];
            if (itemPhotos.length === 0) {
                newErrors[`photos.${key}`] = `Foto untuk item '${namaItem}' wajib diunggah.`;
                hasError = true;
            }
        });

        if (hasError) {
            setError(newErrors);
            setAlertModal({
                isOpen: true,
                title: 'Validasi Gagal',
                message: 'Silakan lengkapi semua field checklist, pilihan dropdown, dan foto yang wajib diisi.',
                type: 'danger'
            });
            return;
        }

        post('/survey/baru');
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
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. INFORMASI SITE */}
                <Card title="Informasi Site &amp; Koordinat">
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
                                    Get GPS
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
                    <Card key={kat} title={kat}>
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
                                            <div>
                                                <div className="flex border border-gray-200 rounded overflow-hidden w-fit mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleItemChange(key, 'status', 'checked')}
                                                        className={`px-3 py-1 text-xs font-bold transition ${state.status === 'checked'
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'bg-white text-gray-400 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        OK
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleItemChange(key, 'status', 'cross')}
                                                        className={`px-3 py-1 text-xs font-bold transition ${state.status === 'cross'
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-white text-gray-400 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        NG
                                                    </button>
                                                </div>
                                                {errors[`items.${key}.status`] && (
                                                    <p className="text-red-500 text-[10px] mt-1">{errors[`items.${key}.status`]}</p>
                                                )}
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
                                                    {errors[`items.${key}.kondisi`] && (
                                                        <p className="text-red-500 text-[10px] mt-1">{errors[`items.${key}.kondisi`]}</p>
                                                    )}
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
                                                <ImageUpload
                                                    compact={true}
                                                    multiple={true}
                                                    value={data.photos[key] || []}
                                                    onChange={(files) => setData('photos', {
                                                        ...data.photos,
                                                        [key]: files
                                                    })}
                                                />
                                                {errors[`photos.${key}`] && (
                                                    <p className="text-red-500 text-[10px] mt-1">{errors[`photos.${key}`]}</p>
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
                <Card title="Catatan Tambahan">
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
