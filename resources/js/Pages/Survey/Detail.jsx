import React, { useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';

export default function Detail({ survey }) {
    const mapRef = useRef(null);

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Checklists reports detail */}
                <div className="lg:col-span-2 space-y-6">
                    {Object.entries(groupedItems).map(([category, items]) => (
                        <Card key={category} title={`📋 ${category}`}>
                            <Table headers={['No', 'Nama Checkpoint', 'Status', 'Catatan Kondisi']}>
                                {items.map((it) => (
                                    <tr key={it.id} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 font-mono font-bold text-xs text-center text-gray-400">
                                            {it.nomor_item}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-gray-900">{it.nama_item}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-block px-2.5 py-0.5 rounded text-xs font-black ${
                                                    it.status_check === 'checked'
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
                                    </tr>
                                ))}
                            </Table>
                        </Card>
                    ))}
                </div>

                {/* Info and location widget */}
                <div className="space-y-6">
                    <Card title="📍 Informasi Lokasi">
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
                                <div className="pt-2">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Peta Koordinat</p>
                                    <div
                                        id="map-detail-el"
                                        className="h-[200px] w-full border border-gray-200 rounded-lg overflow-hidden z-10"
                                    />
                                    <div className="mt-2 text-center">
                                        <code className="text-xs bg-gray-100 px-2.5 py-0.5 rounded text-gray-500 font-mono">
                                            {survey.latitude}, {survey.longitude}
                                        </code>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {survey.catatan_tambahan && (
                        <Card title="📝 Catatan Tambahan">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {survey.catatan_tambahan}
                            </p>
                        </Card>
                    )}

                    {/* PHOTO ATTACHMENTS */}
                    {survey.photos.length > 0 && (
                        <Card title="📸 Galeri Foto Lapangan">
                            <div className="grid grid-cols-2 gap-3">
                                {survey.photos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50 hover:shadow-sm transition"
                                    >
                                        <img
                                            src={`/uploads/photos/${photo.file_path}`}
                                            alt="Survey Check"
                                            className="w-full h-32 object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=85';
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


Detail.layout = page => <AppLayout children={page} />;
