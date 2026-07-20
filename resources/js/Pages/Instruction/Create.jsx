import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Input from '../../Components/Input';
import Button from '../../Components/Button';
import ImageUpload from '../../Components/ImageUpload';
import { Plus, Trash2, ArrowLeft, PlusCircle } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        items: [
            {
                parameter_name: '',
                specification: '',
                sow: [],
                images: []
            }
        ]
    });

    const handleAddItem = () => {
        setData('items', [
            {
                parameter_name: '',
                specification: '',
                sow: [],
                images: []
            },
            ...data.items
        ]);
    };

    const handleRemoveItem = (idx) => {
        if (data.items.length === 1) return;
        const next = [...data.items];
        next.splice(idx, 1);
        setData('items', next);
    };

    const handleItemChange = (idx, field, val) => {
        const next = [...data.items];
        next[idx][field] = val;
        setData('items', next);
    };

    // SOW input key down handler
    const handleSowKeyDown = (e, itemIdx) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.target.value.trim();
            if (val) {
                const next = [...data.items];
                next[itemIdx].sow.push(val);
                setData('items', next);
                e.target.value = '';
            }
        }
    };

    const handleRemoveSowItem = (itemIdx, sowIdx) => {
        const next = [...data.items];
        next[itemIdx].sow.splice(sowIdx, 1);
        setData('items', next);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/instruction/baru');
    };

    return (
        <>
            <Head title="Buat Panduan Teknis Baru - Web CME" />

            <div className="mb-6 flex items-center gap-3">
                <Link
                    href="/instruction"
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-black transition"
                >
                    <ArrowLeft className="h-4 w-4 stroke-[1.5]" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                        Buat Panduan Teknis Baru
                    </h1>
                    <p className="text-sm text-gray-500 font-headlines">
                        Tambah pedoman baru beserta spesifikasi kriteria dan scope of work (SOW) lapangan.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                {/* 1. Header Information */}
                <Card title="Informasi Panduan">
                    <div className="space-y-4">
                        <Input
                            label="Judul Panduan"
                            placeholder="Contoh: ODC 1 Phase, Shelter CME, dll."
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            error={errors.title}
                            required
                        />

                        <div>
                            <label className="block font-medium text-xs text-gray-700 mb-1">
                                Deskripsi Panduan
                            </label>
                            <textarea
                                placeholder="Masukkan ringkasan atau deskripsi panduan teknis..."
                                className={`w-full border-border rounded-md shadow-sm text-sm p-2 focus:border-primary focus:ring focus:ring-primary/20 outline-none transition min-h-[80px] bg-white ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                                    }`}
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                required
                            />
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* 2. Instruction Items List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-md font-bold text-gray-900 font-headlines">
                            Item Checklist &amp; Parameter Panduan
                        </h2>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition uppercase tracking-wider"
                        >
                            <PlusCircle className="h-4.5 w-4.5 stroke-[1.5]" />
                            Tambah Parameter
                        </button>
                    </div>

                    {errors.items && (
                        <p className="text-red-500 text-xs">{errors.items}</p>
                    )}

                    {data.items.map((item, itemIdx) => (
                        <Card
                            key={itemIdx}
                            title={item.parameter_name ? `Parameter: ${item.parameter_name}` : `Parameter Baru`}
                            className="relative group"
                            headerActions={
                                data.items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(itemIdx)}
                                        className="text-red-500 hover:text-red-700 transition"
                                        title="Hapus Parameter Ini"
                                    >
                                        <Trash2 className="h-4 w-4 stroke-[1.5]" />
                                    </button>
                                )
                            }
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <Input
                                        label="Nama Parameter / Material"
                                        placeholder="Contoh: Dimensi Pondasi, Limit Grounding Site"
                                        value={item.parameter_name}
                                        onChange={e => handleItemChange(itemIdx, 'parameter_name', e.target.value)}
                                        error={errors[`items.${itemIdx}.parameter_name`]}
                                        required
                                    />

                                    <div>
                                        <label className="block font-medium text-xs text-gray-700 mb-1">
                                            Kriteria Spesifikasi Kelayakan
                                        </label>
                                        <textarea
                                            placeholder="Contoh: Panjang 3m, Lebar 2m, Tinggi 50cm"
                                            className={`w-full border-border rounded-md shadow-sm text-sm p-2 focus:border-primary focus:ring focus:ring-primary/20 outline-none transition min-h-[80px] bg-white ${errors[`items.${itemIdx}.specification`] ? 'border-red-500' : ''
                                                }`}
                                            value={item.specification}
                                            onChange={e => handleItemChange(itemIdx, 'specification', e.target.value)}
                                            required
                                        />
                                        {errors[`items.${itemIdx}.specification`] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors[`items.${itemIdx}.specification`]}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* SOW Bullet-Point Addition */}
                                    <div>
                                        <label className="block font-medium text-xs text-gray-700 mb-1">
                                            Langkah SOW (Tekan 'Enter' untuk menambahkan)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ketik langkah lalu tekan Enter..."
                                            className="w-full border-border rounded-md shadow-sm text-sm p-2 focus:border-primary focus:ring focus:ring-primary/20 outline-none transition bg-white"
                                            onKeyDown={e => handleSowKeyDown(e, itemIdx)}
                                        />
                                        {errors[`items.${itemIdx}.sow`] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors[`items.${itemIdx}.sow`]}
                                            </p>
                                        )}

                                        {/* Render Bullet Point Preview */}
                                        <ul className="mt-3 space-y-1.5 pl-2">
                                            {item.sow.map((step, sIdx) => (
                                                <li key={sIdx} className="flex justify-between items-center text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                                                    <span className="font-medium">{sIdx + 1}. {step}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSowItem(itemIdx, sIdx)}
                                                        className="text-red-500 hover:text-red-750 transition ml-2 font-bold"
                                                    >
                                                        &times;
                                                    </button>
                                                </li>
                                            ))}
                                            {item.sow.length === 0 && (
                                                <p className="text-gray-400 text-[10px] italic">SOW kosong. Silakan ketik langkah di atas.</p>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Live multi-image upload */}
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">
                                            Gambar Blueprint / Ilustrasi
                                        </label>
                                        <ImageUpload
                                            compact={true}
                                            multiple={true}
                                            value={item.images}
                                            onChange={files => handleItemChange(itemIdx, 'images', files)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Submit Action */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Link href="/instruction">
                        <Button variant="outline" className="px-6 py-2.5">
                            Batal
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        className="px-6 py-2.5"
                        processing={processing}
                    >
                        Simpan Panduan
                    </Button>
                </div>
            </form>
        </>
    );
}

Create.layout = page => <AppLayout children={page} />;
