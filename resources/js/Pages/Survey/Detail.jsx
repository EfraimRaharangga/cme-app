import React, { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Modal from '../../Components/Modal';

export default function Detail({ survey }) {
    const mapRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Initialize map coordinates view
    useEffect(() => {
        if (typeof window !== 'undefined' && survey.latitude && survey.longitude) {
            const initMap = () => {
                const lat = parseFloat(survey.latitude);
                const lng = parseFloat(survey.longitude);
                const center = [lat, lng];

                const map = window.L.map('map-detail-el').setView(center, 14);
                mapRef.current = map;

                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap contributors',
                }).addTo(map);

                window.L.marker(center).addTo(map)
                    .bindPopup(`<b>${survey.nama_site}</b><br/>Survey ODC Coordinates.`)
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
    }, [survey]);

    // Group items by category
    const groupedItems = {};
    survey.items.forEach((item) => {
        if (!groupedItems[item.kategori]) {
            groupedItems[item.kategori] = [];
        }
        groupedItems[item.kategori].push(item);
    });

    return (
        <>
            <Head title={`Survey ${survey.nama_site} - Web CME`} />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Detail Survey ODC
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Laporan teknis site {survey.nama_site} terdaftar.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href={`/survey/${survey.id}/edit`}
                        className="inline-flex items-center px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
                    >
                        Edit
                    </Link>
                    <Link
                        href={`/survey/${survey.id}/print`}
                        className="inline-flex items-center px-4 py-2 bg-[#00ADB5] hover:bg-[#008f96] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
                    >
                        Cetak (A4)
                    </Link>
                    <Link
                        href="/survey"
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition"
                    >
                        &larr; Riwayat
                    </Link>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. INFORMASI LOKASI (Moved above the checklists) */}
                <Card title="Informasi Lokasi">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Tanggal Survey</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{survey.tanggal_survey}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Nama Surveyor</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{survey.nama_surveyor}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase">Lokasi / Alamat</p>
                                <p className="text-sm font-bold text-gray-900 mt-0.5">{survey.lokasi || '-'}</p>
                            </div>

                            {survey.latitude && (
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Peta Koordinat</p>
                                    <code className="text-xs bg-gray-100 px-2.5 py-0.5 rounded text-gray-500 font-mono inline-block mt-1">
                                        {survey.latitude}, {survey.longitude}
                                    </code>
                                </div>
                            )}
                        </div>

                        {survey.latitude && (
                            <div className="h-[200px] w-full border border-gray-200 rounded-lg overflow-hidden z-10">
                                <div id="map-detail-el" className="h-full w-full" />
                            </div>
                        )}
                    </div>
                </Card>

                {/* 2. CHECKLIST REPORT DETAIL */}
                <div className="space-y-6">
                    {Object.entries(groupedItems).map(([category, items]) => (
                        <Card key={category} title={category}>
                            <Table headers={['No', 'Nama Checkpoint', 'Status', 'Catatan Kondisi', 'Dokumentasi']}>
                                {items.map((it) => {
                                    const itemPhotos = survey.photos.filter(p => p.item_id === it.id);
                                    return (
                                        <tr key={it.id} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-mono font-bold text-xs text-center text-gray-400">
                                                {it.nomor_item}
                                            </td>
                                            <td className="px-4 py-3 font-bold text-gray-900">{it.nama_item}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={`inline-block px-2.5 py-0.5 rounded text-xs font-black ${it.status_check === 'checked'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : it.status_check === 'cross'
                                                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                            : 'bg-gray-50 text-gray-400'
                                                        }`}
                                                >
                                                    {it.status_check === 'checked' ? 'OK' : it.status_check === 'cross' ? 'NG' : '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 whitespace-pre-wrap">
                                                {it.kondisi_nilai || '-'}
                                                {it.catatan && (
                                                    <div className="text-[10px] text-gray-400 mt-1 italic">
                                                        Catatan: {it.catatan}
                                                    </div>
                                                )}
                                            </td>
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
                                                                alt={it.nama_item}
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
                                })}
                            </Table>
                        </Card>
                    ))}

                    {survey.catatan_tambahan && (
                        <Card title="📝 Catatan Tambahan">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {survey.catatan_tambahan}
                            </p>
                        </Card>
                    )}
                </div>
            </div>

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
        </>
    );
}


Detail.layout = page => <AppLayout children={page} />;
