import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import Select from '../../Components/Select';
import PasswordField from '../../Components/PasswordField';
import Alert from '../../Components/Alert';
import ConfirmationModal from '../../Components/ConfirmationModal';
import Search, { filterData } from '../../Components/Search';
import Pagination from '../../Components/Pagination';
import Breadcrumbs from '../../Components/Breadcrumbs';

export default function List({ users }) {
    const [editMode, setEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    });

    const { data, setData, post, put, delete: destroy, reset, errors, processing } = useForm({
        username: '',
        password: '',
        role: 'surveyor',
    });

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const filteredUsers = filterData(users, searchQuery);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            post(`/users/${editingUserId}`, {
                onSuccess: () => {
                    cancelEdit();
                }
            });
        } else {
            post('/users', {
                onSuccess: () => {
                    reset();
                }
            });
        }
    };

    const startEdit = (user) => {
        setEditMode(true);
        setEditingUserId(user.id);
        setData({
            username: user.username,
            password: '',
            role: user.role,
        });
    };

    const cancelEdit = () => {
        setEditMode(false);
        setEditingUserId(null);
        reset();
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Hapus Akun Pengguna',
            message: 'Apakah Anda yakin ingin menghapus user ini?',
            type: 'danger',
            onConfirm: () => router.delete(`/users/${id}`)
        });
    };

    const roles = [
        { value: 'admin', label: 'Admin' },
        { value: 'staff_cme', label: 'Staff CME' },
        { value: 'surveyor', label: 'Surveyor ODC' },
        { value: 'vendor', label: 'Vendor' },
        { value: 'visitor', label: 'Visitor' },
        { value: 'atp', label: 'ATP Auditor' },
    ];

    return (
        <>
            <Head title="Kelola Pengguna - Web CME" />

            <Breadcrumbs items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Kelola Pengguna' }
            ]} />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                    Kelola Pengguna
                </h1>
                <p className="text-sm text-gray-500 font-headlines mt-1">
                    Atur akses akun, username, sandi, dan peran hak akses.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form panel */}
                <div>
                    <Card title={editMode ? '✏️ Edit Pengguna' : '👥 Tambah Pengguna'}>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Username"
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                error={errors.username}
                                placeholder="Masukkan username"
                                required
                            />

                            <PasswordField
                                label={editMode ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                placeholder="Masukkan password"
                                required={!editMode}
                            />

                            <Select
                                label="Role Akses"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                error={errors.role}
                                options={roles}
                                placeholder="Pilih Role"
                                required
                            />

                            <div className="flex gap-2 pt-2">
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="flex-grow"
                                    processing={processing}
                                >
                                    {editMode ? 'Update' : 'Simpan'}
                                </Button>
                                {editMode && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={cancelEdit}
                                    >
                                        Batal
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Users tables list */}
                <div className="lg:col-span-2">
                    <Card title="List Akun Terdaftar">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 mb-4">
                            <Search value={searchQuery} onChange={handleSearchChange} />
                        </div>

                        <Table headers={['No', 'Username', 'Peran', 'Dibuat Pada', 'Aksi']}>
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-medium">
                                        Belum ada pengguna terdaftar
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user, idx) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 text-center font-bold text-gray-400">
                                            {(currentPage - 1) * itemsPerPage + idx + 1}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{user.username}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                                    user.role === 'admin'
                                                        ? 'bg-blue-50 text-blue-800 border border-blue-100'
                                                        : user.role === 'staff_cme'
                                                        ? 'bg-sky-50 text-sky-800 border border-sky-100'
                                                        : user.role === 'surveyor'
                                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                                        : user.role === 'vendor'
                                                        ? 'bg-purple-50 text-purple-800 border border-purple-100'
                                                        : 'bg-gray-50 text-gray-700 border border-gray-100'
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-500">{user.created_at}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => startEdit(user)}
                                                    className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-700 rounded-md transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="px-2.5 py-1 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-300 border border-gray-300 text-xs font-semibold text-gray-700 rounded-md transition"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </Table>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredUsers.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </Card>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </>
    );
}

List.layout = page => <AppLayout children={page} />;
