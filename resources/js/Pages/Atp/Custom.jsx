import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Input from '../../Components/Input';
import Button from '../../Components/Button';

export default function Custom({ defaultTemplate, templates }) {
    const [templateTitle, setTemplateTitle] = useState('');

    const handleSaveTemplate = (e) => {
        e.preventDefault();
        if (!templateTitle) {
            alert('Judul template harus diisi!');
            return;
        }

        router.post('/atp/custom', {
            title: templateTitle,
            data_json: defaultTemplate,
        });
    };

    const handleDeleteTemplate = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus template ATP ini?')) {
            router.delete(`/atp/custom/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Kustomisasi ATP - Web CME" />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Kustomisasi Checklist ATP
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Atur parameter checklist, standard alat ukur, dan simpan sebagai template default.
                    </p>
                </div>
                <Link
                    href="/atp"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition"
                >
                    &larr; Laporan
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor preview */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="🔧 Pratinjau Checklist ATP">
                        <div className="space-y-4">
                            {defaultTemplate.map((item, idx) => {
                                if (item.ty === 'sec') {
                                    return (
                                        <div key={idx} className="bg-gray-900 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded">
                                            {item.tx}
                                        </div>
                                    );
                                }
                                if (item.ty === 'sub') {
                                    return (
                                        <div key={idx} className="bg-[#00ADB5]/10 text-[#00ADB5] px-3 py-1 text-xs font-bold uppercase tracking-wider">
                                            {item.tx}
                                        </div>
                                    );
                                }
                                if (item.ty === 'it') {
                                    return (
                                        <div key={item._id} className="p-3 bg-gray-50 rounded border border-gray-100 flex justify-between items-center text-xs">
                                            <div className="font-bold text-gray-800">{item.d[0]}</div>
                                            <div className="text-[10px] text-gray-400">
                                                Std: {item.d[1]} &bull; Alat: {item.d[2]}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </Card>
                </div>

                {/* Templates manager */}
                <div className="space-y-6">
                    <Card title="💾 Simpan Template">
                        <form onSubmit={handleSaveTemplate} className="space-y-4">
                            <Input
                                label="Judul Template"
                                type="text"
                                placeholder="Masukkan nama template baru"
                                value={templateTitle}
                                onChange={(e) => setTemplateTitle(e.target.value)}
                                required
                            />
                            <Button
                                type="submit"
                                variant="secondary"
                                className="w-full"
                            >
                                Simpan Template
                            </Button>
                        </form>
                    </Card>

                    <Card title="📁 Template Tersimpan">
                        {templates.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">Belum ada template kustom.</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {templates.map((t) => (
                                    <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                                        <div className="font-bold text-gray-800">{t.title}</div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/atp/baru?template_id=${t.id}`}
                                                className="text-[#00ADB5] hover:underline font-semibold"
                                            >
                                                Gunakan
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteTemplate(t.id)}
                                                className="text-red-500 hover:underline font-semibold"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
