import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import Modal from '../../Components/Modal';

export default function Detail({ record }) {
    const mapRef = useRef(null);
    const [showBalForm, setShowBalForm] = useState(false);
    const [showBastpForm, setShowBastpForm] = useState(false);

    // Initial forms states for BAL
    const balForm = useForm({
        project: record.bal?.project || '',
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
    });

    // Initial forms states for BASTP
    const bastpForm = useForm({
        p1_nama: record.bastp?.p1_nama || record.hasil_json?.approval?.vendor_1_name || '',
        p1_alamat: record.bastp?.p1_alamat || '',
        p2_nama: record.bastp?.p2_nama || record.hasil_json?.approval?.cme_1_name || '',
        p2_jabatan: record.bastp?.p2_jabatan || record.hasil_json?.approval?.cme_1_role || '',
        p2_alamat: record.bastp?.p2_alamat || '',
        pekerjaan: record.bastp?.pekerjaan || '',
        mengetahui1: record.bastp?.mengetahui1 || '',
        mengetahui2: record.bastp?.mengetahui2 || '',
        photos: record.bastp?.photos || '',
    });

    // Initialize Map coords
    useEffect(() => {
        if (typeof window !== 'undefined' && record.latitude && record.longitude) {
            const initMap = () => {
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
    }, [record]);

    const handleSaveBal = (e) => {
        e.preventDefault();
        balForm.post(`/atp/${record.id}/bal`, {
            onSuccess: () => setShowBalForm(false)
        });
    };

    const handleSaveBastp = (e) => {
        e.preventDefault();
        bastpForm.post(`/atp/${record.id}/bastp`, {
            onSuccess: () => setShowBastpForm(false)
        });
    };

    const app = record.hasil_json?.approval || {};
    const itemNames = record.hasil_json?.itemNames || {};
    const itemStds = record.hasil_json?.itemStds || {};
    const itemTools = record.hasil_json?.itemTools || {};
    const itemVals = record.hasil_json?.items || {};
    const itemHasil = record.hasil_json?.hasil || {};
    const itemCatatan = record.hasil_json?.catatan || {};

    return (
        <>
            <Head title={`ATP Detail ${record.nama_site} - Web CME`} />

            <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Detail ATP Check
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Informasi site {record.nama_site} &bull; No. PO: {record.no_po}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href={`/atp/${record.id}/edit`}
                        className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold uppercase rounded-lg transition"
                    >
                        Edit
                    </Link>
                    <Link
                        href={`/atp/${record.id}/print`}
                        className="px-3.5 py-2 bg-[#00ADB5] hover:bg-[#008f96] text-white text-xs font-bold uppercase rounded-lg transition"
                    >
                        Cetak ATP
                    </Link>
                    <Link
                        href="/atp"
                        className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition"
                    >
                        &larr; Riwayat
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Checklists table */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="📋 Checkpoint Parameter ATP">
                        <Table headers={['Nama Parameter', 'Standard', 'Hasil', 'Status', 'Catatan']}>
                            {Object.entries(itemNames).map(([key, name]) => (
                                <tr key={key} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-bold text-gray-900">
                                        {name}
                                        <div className="text-[10px] text-gray-400 mt-0.5">Alat: {itemTools[key]}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center text-xs text-gray-500">{itemStds[key]}</td>
                                    <td className="px-4 py-3 text-center font-semibold text-gray-700">{itemHasil[key] || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                                itemVals[key] === 'OK'
                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                    : itemVals[key] === 'NG'
                                                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                            }`}
                                        >
                                            {itemVals[key] || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">{itemCatatan[key] || '-'}</td>
                                </tr>
                            ))}
                        </Table>
                    </Card>

                    {/* PHOTOS */}
                    {record.photos.length > 0 && (
                        <Card title="📸 Foto Lampangan Verifikasi ATP">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {record.photos.map((photo) => {
                                    const pName = itemNames[photo.item_id] || 'Checkpoint ' + photo.item_id;
                                    return (
                                        <div key={photo.id} className="border border-gray-150 rounded-lg overflow-hidden bg-gray-50 hover:shadow-sm transition">
                                            <img
                                                src={photo.file_url}
                                                alt={pName}
                                                className="w-full h-36 object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=85';
                                                }}
                                            />
                                            <div className="p-2 border-t border-gray-100 bg-white">
                                                <p className="text-[10px] font-semibold text-gray-900 truncate">{pName}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar details */}
                <div className="space-y-6">
                    <Card title="📍 Detail Site">
                        <div className="space-y-3.5 text-xs text-gray-700">
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
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Peta Lokasi</p>
                                    <div
                                        id="map-atp-detail"
                                        className="h-[180px] w-full border border-gray-200 rounded-lg overflow-hidden z-10"
                                    />
                                    <div className="mt-2 text-center">
                                        <code className="text-xs bg-gray-100 text-gray-500 font-mono px-2 py-0.5 rounded">
                                            {record.latitude}, {record.longitude}
                                        </code>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Verdict */}
                    <Card title="📊 Verdict Keputusan">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-gray-400 uppercase">Status Kelayakan</span>
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                        record.verdict === 'ACCEPT'
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
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
                                    <p className="font-bold text-gray-700 mb-1">Catatan Verdict:</p>
                                    {record.verdict_notes}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Tim Evaluator */}
                    <Card title="✍️ Pihak Otorisasi">
                        <div className="space-y-3.5 text-xs text-gray-700">
                            <div>
                                <p className="font-bold text-[#00ADB5] mb-1">Pihak Pelaksana (Vendor)</p>
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

                    {/* BAL / BASTP REPORT SHORTCUTS */}
                    <Card title="📄 Berita Acara &amp; Handover">
                        <div className="space-y-3">
                            {/* BAL */}
                            <div className="border border-gray-100 p-3 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-800">Berita Acara Lapangan (BAL)</p>
                                    <p className="text-[10px] text-gray-400">{record.bal ? 'Selesai dibuat' : 'Belum dibuat'}</p>
                                </div>
                                <div className="flex gap-1.5">
                                    {record.bal ? (
                                        <>
                                            <Link href={`/atp/${record.id}/bal`} className="text-[#00ADB5] hover:underline text-xs font-semibold">Cetak</Link>
                                            <button onClick={() => setShowBalForm(true)} className="text-gray-500 hover:underline text-xs font-semibold">Edit</button>
                                        </>
                                    ) : (
                                        <button onClick={() => setShowBalForm(true)} className="text-[#00ADB5] hover:underline text-xs font-semibold">+ Buat</button>
                                    )}
                                </div>
                            </div>

                            {/* BASTP */}
                            <div className="border border-gray-100 p-3 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-800">BASTP / Handover</p>
                                    <p className="text-[10px] text-gray-400">{record.bastp ? 'Selesai dibuat' : 'Belum dibuat'}</p>
                                </div>
                                <div className="flex gap-1.5">
                                    {record.bastp ? (
                                        <>
                                            <Link href={`/atp/${record.id}/bastp`} className="text-[#00ADB5] hover:underline text-xs font-semibold">Cetak</Link>
                                            <button onClick={() => setShowBastpForm(true)} className="text-gray-500 hover:underline text-xs font-semibold">Edit</button>
                                        </>
                                    ) : (
                                        <button onClick={() => setShowBastpForm(true)} className="text-[#00ADB5] hover:underline text-xs font-semibold">+ Buat</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* BAL DIALOG MODAL */}
            <Modal isOpen={showBalForm} onClose={() => setShowBalForm(false)} title="Buat / Edit Berita Acara Lapangan (BAL)" size="max-w-2xl">
                <form onSubmit={handleSaveBal} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Nama Project" value={balForm.data.project} onChange={(e) => balForm.setData('project', e.target.value)} required />
                        <Input label="Nomor PO" value={balForm.data.no_po} onChange={(e) => balForm.setData('no_po', e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Mulai Tanggal" type="date" value={balForm.data.tanggal_mulai} onChange={(e) => balForm.setData('tanggal_mulai', e.target.value)} required />
                        <Input label="Selesai Tanggal" type="date" value={balForm.data.tanggal} onChange={(e) => balForm.setData('tanggal', e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Lokasi / Site" value={balForm.data.lokasi} onChange={(e) => balForm.setData('lokasi', e.target.value)} required />
                        <Input label="Hasil Rekomendasi" value={balForm.data.hasil} onChange={(e) => balForm.setData('hasil', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                        <div>
                            <h4 className="font-bold text-[#00ADB5] uppercase tracking-wider mb-2">Pihak I (Pelaksana)</h4>
                            <Input label="Nama Perusahaan" value={balForm.data.pihak1} onChange={(e) => balForm.setData('pihak1', e.target.value)} required />
                            <Input label="Nama Representative" value={balForm.data.nama1} onChange={(e) => balForm.setData('nama1', e.target.value)} required className="mt-2" />
                            <Input label="Jabatan Representative" value={balForm.data.jabatan1} onChange={(e) => balForm.setData('jabatan1', e.target.value)} required className="mt-2" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-2">Pihak II (Pengawas)</h4>
                            <Input label="Nama Perusahaan" value={balForm.data.pihak2} onChange={(e) => balForm.setData('pihak2', e.target.value)} required />
                            <Input label="Nama Representative" value={balForm.data.nama2} onChange={(e) => balForm.setData('nama2', e.target.value)} required className="mt-2" />
                            <Input label="Jabatan Representative" value={balForm.data.jabatan2} onChange={(e) => balForm.setData('jabatan2', e.target.value)} required className="mt-2" />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end border-t pt-3">
                        <Button type="submit" variant="secondary" processing={balForm.processing}>Simpan BAL</Button>
                        <Button type="button" variant="outline" onClick={() => setShowBalForm(false)}>Batal</Button>
                    </div>
                </form>
            </Modal>

            {/* BASTP DIALOG MODAL */}
            <Modal isOpen={showBastpForm} onClose={() => setShowBastpForm(false)} title="Buat / Edit BASTP (BA Serah Terima Pekerjaan)" size="max-w-2xl">
                <form onSubmit={handleSaveBastp} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Nama Pihak I (Pelaksana)" value={bastpForm.data.p1_nama} onChange={(e) => bastpForm.setData('p1_nama', e.target.value)} required />
                        <Input label="Alamat Pihak I" value={bastpForm.data.p1_alamat} onChange={(e) => bastpForm.setData('p1_alamat', e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Nama Pihak II (Pemberi Kerja)" value={bastpForm.data.p2_nama} onChange={(e) => bastpForm.setData('p2_nama', e.target.value)} required />
                        <Input label="Jabatan Pihak II" value={bastpForm.data.p2_jabatan} onChange={(e) => bastpForm.setData('p2_jabatan', e.target.value)} required />
                    </div>
                    <div className="space-y-3">
                        <Input label="Alamat Pihak II" value={bastpForm.data.p2_alamat} onChange={(e) => bastpForm.setData('p2_alamat', e.target.value)} required />
                        <Input label="Nama Pekerjaan (BASTP)" value={bastpForm.data.pekerjaan} onChange={(e) => bastpForm.setData('pekerjaan', e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                        <Input label="Mengetahui Pihak I (Nama/Jabatan)" value={bastpForm.data.mengetahui1} onChange={(e) => bastpForm.setData('mengetahui1', e.target.value)} placeholder="Nama Pemeriksa I" />
                        <Input label="Mengetahui Pihak II (Nama/Jabatan)" value={bastpForm.data.mengetahui2} onChange={(e) => bastpForm.setData('mengetahui2', e.target.value)} placeholder="Nama Pemeriksa II" />
                    </div>
                    <div className="flex gap-2 justify-end border-t pt-3">
                        <Button type="submit" variant="secondary" processing={bastpForm.processing}>Simpan BASTP</Button>
                        <Button type="button" variant="outline" onClick={() => setShowBastpForm(false)}>Batal</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}


Detail.layout = page => <AppLayout children={page} />;
