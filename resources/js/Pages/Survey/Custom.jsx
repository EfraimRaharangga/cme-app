import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Input from '../../Components/Input';
import Button from '../../Components/Button';

export default function Custom({ defaultCategories, templates }) {
    const [categories, setCategories] = useState(defaultCategories);
    const [templateTitle, setTemplateTitle] = useState('');

    const handleSaveTemplate = (e) => {
        e.preventDefault();
        if (!templateTitle) {
            alert('Judul template harus diisi!');
            return;
        }

        router.post('/survey/custom', {
            title: templateTitle,
            kategori_json: categories,
        });
    };

    const handleDeleteTemplate = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus template ini?')) {
            router.delete(`/survey/custom/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Kustomisasi Laporan - Web CME" />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Kustomisasi Checklist Survey
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines mt-1">
                        Atur check list parameter, kategori, dan simpan sebagai template default.
                    </p>
                </div>
                <Link
                    href="/survey"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition"
                >
                    &larr; Laporan
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customizer editor */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="🔧 Editor Parameter Checklist">
                        <div className="space-y-6">
                            {Object.entries(categories).map(([catName, list]) => (
                                <div key={catName} className="p-4 border border-gray-155 rounded-lg">
                                    <h4 className="font-bold text-sm text-[#00ADB5] uppercase tracking-wider mb-3">
                                        📁 {catName}
                                    </h4>
                                    <div className="space-y-3">
                                        {list.map((item, idx) => (
                                            <div key={idx} className="flex gap-2 items-center bg-gray-55 p-2 rounded border border-gray-100">
                                                <span className="text-[10px] font-mono font-bold bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                                                    {item[0]}
                                                </span>
                                                <span className="text-xs font-semibold text-gray-800 flex-grow">
                                                    {item[1]}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold text-gray-400">
                                                    {item[2]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
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
                                                href={`/survey/baru?template_id=${t.id}`}
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
