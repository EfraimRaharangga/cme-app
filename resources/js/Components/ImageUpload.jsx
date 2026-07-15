import React, { useState, useRef, useId } from 'react';
import axios from 'axios';
import { UploadCloud, X, Loader2, ZoomIn } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import Modal from './Modal';

export default function ImageUpload({
    value = [], // Array of { path, url, name }
    onChange, // Callback: (files) => void
    multiple = false,
    compact = false,
    uploadUrl = '/api/upload-temp'
}) {
    const uniqueId = useId();
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setLoading(true);
        const uploadedFiles = [...value];

        for (const file of files) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await axios.post(uploadUrl, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                const fileData = {
                    path: response.data.path,
                    url: response.data.url,
                    name: file.name
                };
                if (multiple) {
                    uploadedFiles.push(fileData);
                } else {
                    uploadedFiles[0] = fileData;
                }
            } catch (err) {
                const msg = err.response?.data?.message || err.response?.data?.errors?.image?.[0] || 'Upload gagal';
                alert(msg);
            }
        }

        onChange(uploadedFiles);
        setLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const confirmDelete = (idx) => {
        setDeleteIndex(idx);
    };

    const handleDelete = () => {
        if (deleteIndex === null) return;
        const nextFiles = [...value];
        nextFiles.splice(deleteIndex, 1);
        onChange(nextFiles);
        setDeleteIndex(null);
    };

    // Render Compact Style for Tables/Checklists
    if (compact) {
        return (
            <div className="space-y-2">
                {/* Previews */}
                {value.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {value.map((img, idx) => (
                            <div key={idx} className="relative w-12 h-12 rounded border border-gray-200 overflow-hidden bg-white shadow-sm group">
                                <img src={img.url} className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewImage(img.url)} alt="Preview" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Trigger / Spinner */}
                {(!multiple && value.length > 0) ? null : (
                    <div className="relative">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple={multiple}
                            accept="image/*"
                            className="hidden"
                            id={`file-upload-compact-${uniqueId}`}
                        />
                        {loading ? (
                            <div className="flex items-center gap-1.5 py-1 px-2 border border-gray-200 rounded bg-gray-50 text-[10px] text-gray-500 font-semibold">
                                <Loader2 className="w-3 h-3 animate-spin text-[#00ADB5]" />
                                Mengunggah...
                            </div>
                        ) : (
                            <label
                                htmlFor={`file-upload-compact-${uniqueId}`}
                                className="inline-flex items-center gap-1 py-1 px-2 border border-dashed border-[#00ADB5] hover:bg-[#00ADB5]/5 rounded text-[10px] text-[#00ADB5] font-semibold cursor-pointer transition"
                            >
                                <UploadCloud className="w-3.5 h-3.5" />
                                {value.length > 0 ? 'Tambah Foto' : 'Unggah Foto'}
                            </label>
                        )}
                    </div>
                )}

                {/* Detail View Modal */}
                <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} size="max-w-xl">
                    <div className="relative p-1">
                        <img src={previewImage} className="w-full h-auto rounded" alt="Large Preview" />
                    </div>
                </Modal>

                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={deleteIndex !== null}
                    onClose={() => setDeleteIndex(null)}
                    onConfirm={handleDelete}
                    title="Hapus Foto"
                    message="Apakah Anda yakin ingin menghapus foto ini?"
                    type="danger"
                />
            </div>
        );
    }

    // Render Large Dropzone Style
    return (
        <div className="w-full">
            {/* Show Previews if uploaded */}
            {value.length > 0 ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {value.map((img, idx) => (
                            <div key={idx} className="relative aspect-video rounded-lg border border-gray-200 overflow-hidden bg-white shadow group">
                                <img src={img.url} className="w-full h-full object-cover" alt="Preview" />
                                <div className="absolute inset-0 bg-[#1A1A1A]/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewImage(img.url)}
                                        className="p-1.5 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => confirmDelete(idx)}
                                        className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {multiple && (
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                multiple={true}
                                accept="image/*"
                                className="hidden"
                                id={`file-upload-large-${uniqueId}`}
                            />
                            {loading ? (
                                <button type="button" disabled className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 font-bold bg-gray-50">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#00ADB5]" />
                                    Memproses...
                                </button>
                            ) : (
                                <label
                                    htmlFor={`file-upload-large-${uniqueId}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-[#00ADB5] hover:bg-[#00ADB5]/5 rounded-lg text-sm text-[#00ADB5] font-bold cursor-pointer transition"
                                >
                                    <UploadCloud className="w-4 h-4" />
                                    Tambah Foto Lainnya
                                </label>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                /* Initial Dropzone */
                <div className="flex items-center justify-center w-full">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple={multiple}
                        accept="image/*"
                        className="hidden"
                        id={`file-upload-large-${uniqueId}`}
                    />
                    <label
                        htmlFor={`file-upload-large-${uniqueId}`}
                        className="flex flex-col items-center justify-center w-full h-64 bg-white hover:bg-gray-50 border border-dashed border-gray-300 hover:border-[#00ADB5] rounded-xl cursor-pointer transition group"
                    >
                        {loading ? (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <Loader2 className="w-8 h-8 animate-spin text-[#00ADB5] mb-2" />
                                <p className="text-sm font-semibold">Mengunggah file...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-[#00ADB5] mb-3 transition" />
                                <p className="mb-2 text-sm text-gray-600">
                                    <span className="font-semibold text-[#00ADB5]">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-400">
                                    PNG, JPG, JPEG or WEBP (MAX. 2MB)
                                </p>
                            </div>
                        )}
                    </label>
                </div>
            )}

            {/* Detail View Modal */}
            <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} size="max-w-3xl">
                <div className="relative p-1">
                    <img src={previewImage} className="w-full h-auto rounded" alt="Large Preview" />
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteIndex !== null}
                onClose={() => setDeleteIndex(null)}
                onConfirm={handleDelete}
                title="Hapus Foto"
                message="Apakah Anda yakin ingin menghapus foto ini?"
                type="danger"
            />
        </div>
    );
}
