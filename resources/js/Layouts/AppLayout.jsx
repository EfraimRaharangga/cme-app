import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    User,
    LogOut,
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    ClipboardList,
    Package,
    Users,
    History,
    BookOpen
} from 'lucide-react';
import FlashMessage from '../Components/FlashMessage';
import ConfirmationModal from '../Components/ConfirmationModal';

export default function AppLayout({ children }) {
    const { props } = usePage();
    const { auth } = props;
    const user = auth?.user;

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [openMenus, setOpenMenus] = useState({});
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    });

    // Load initial states from local storage
    useEffect(() => {
        try {
            const savedSidebar = localStorage.getItem('sidebar_open');
            if (savedSidebar !== null) {
                setSidebarOpen(JSON.parse(savedSidebar));
            }
            const savedMenus = localStorage.getItem('sidebar_menus');
            if (savedMenus !== null) {
                setOpenMenus(JSON.parse(savedMenus));
            }
        } catch (e) { }
    }, []);

    // Save states to local storage
    const toggleSidebar = () => {
        const next = !sidebarOpen;
        setSidebarOpen(next);
        try {
            localStorage.setItem('sidebar_open', JSON.stringify(next));
        } catch (e) { }
    };

    const handleLogout = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Konfirmasi Keluar',
            message: 'Apakah Anda yakin ingin keluar dari sistem?',
            type: 'danger',
            onConfirm: () => router.post('/logout')
        });
    };

    const hasRole = (roles) => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    const handleLinkClick = () => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const navItemStyle = "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition duration-150 ease-in-out";
    const activeClass = "bg-primary/10 text-primary font-semibold border-l-4 border-primary";
    const inactiveClass = "text-text/75 hover:bg-gray-100 hover:text-text";

    return (
        <div className="min-h-screen bg-bg flex flex-col font-body">
            <FlashMessage />

            {/* HEADER */}
            <header className="h-14 bg-white border-b border-border text-text flex items-center justify-between px-6 sticky top-0 z-60">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-text transition"
                    >
                        <Menu className="h-5 w-5 stroke-[1.5]" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold tracking-wider font-headlines">
                            CME <span className="text-primary">APP</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user && (
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 border-r border-border pr-4 text-text hover:text-primary transition group"
                        >
                            <User className="h-4 w-4 text-gray-400 group-hover:text-primary transition stroke-[1.5]" />
                            <span className="text-xs font-medium font-headlines">
                                {user.username} <span className="text-gray-400">({user.role})</span>
                            </span>
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 text-xs font-semibold uppercase tracking-wider transition"
                    >
                        <LogOut className="h-3.5 w-3.5 stroke-[1.5]" />
                        Logout
                    </button>
                </div>
            </header>

            <div className="flex flex-grow relative">
                {/* Mobile Sidebar Backdrop Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 top-14 bg-black/40 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* SIDEBAR */}
                <aside
                    className={`sticky top-14 lg:top-14 bottom-0 lg:bottom-auto left-0 z-40 bg-surface border-r border-border text-text transition-all duration-300 flex flex-col lg:h-[calc(100vh-3.5rem)] ${sidebarOpen ? 'w-64 translate-x-0 lg:w-1/5 lg:shrink-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-r-0'
                        }`}
                >
                    <div className="flex-grow py-4 overflow-y-auto px-3 space-y-1">
                        {hasRole(['admin', 'staff_cme']) && (
                            <Link href="/dashboard" onClick={handleLinkClick} className={`${navItemStyle} ${usePage().url === '/dashboard' ? activeClass : inactiveClass}`}>
                                <LayoutDashboard className="h-4 w-4 stroke-[1.5]" />
                                Dashboard CME
                            </Link>
                        )}

                        {hasRole(['admin', 'surveyor', 'staff_cme', 'vendor']) && (
                            <Link href="/survey" onClick={handleLinkClick} className={`${navItemStyle} ${usePage().url.startsWith('/survey') ? activeClass : inactiveClass}`}>
                                <ClipboardList className="h-4 w-4 stroke-[1.5]" />
                                Survey ODC
                            </Link>
                        )}

                        {hasRole(['admin', 'vendor', 'staff_cme']) && (
                            <Link href="/atp" onClick={handleLinkClick} className={`${navItemStyle} ${usePage().url.startsWith('/atp') ? activeClass : inactiveClass}`}>
                                <ClipboardList className="h-4 w-4 stroke-[1.5]" />
                                ATP Check
                            </Link>
                        )}

                        {hasRole(['admin', 'staff_cme', 'vendor']) && (
                            <Link href="/instruction" onClick={handleLinkClick} className={`${navItemStyle} ${usePage().url.startsWith('/instruction') ? activeClass : inactiveClass}`}>
                                <BookOpen className="h-4 w-4 stroke-[1.5]" />
                                Panduan Teknis (SOW)
                            </Link>
                        )}

                        {hasRole(['admin', 'staff_cme']) && (
                            <Link href="/gudang" onClick={handleLinkClick} className={`${navItemStyle} ${usePage().url.startsWith('/gudang') ? activeClass : inactiveClass}`}>
                                <Package className="h-4 w-4 stroke-[1.5]" />
                                Gudang
                            </Link>
                        )}

                        {/* Profile link visible to all authenticated roles, separated by a divider */}
                        <div className="border-t border-border my-2 pt-2">
                            <Link href="/profile" onClick={handleLinkClick} className={`${navItemStyle} ${usePage().url === '/profile' ? activeClass : inactiveClass}`}>
                                <User className="h-4 w-4 stroke-[1.5]" />
                                Profil Saya
                            </Link>
                        </div>

                        {/* Admin specific accounts management */}
                        {hasRole(['admin']) && (
                            <div className="space-y-1">
                                <Link href="/users" onClick={handleLinkClick} className={`${navItemStyle} ${usePage().url === '/users' ? activeClass : inactiveClass}`}>
                                    <Users className="h-4 w-4 stroke-[1.5]" />
                                    Kelola Pengguna
                                </Link>
                                <Link href="/users-logs" onClick={handleLinkClick} className={`${navItemStyle} ${usePage().url === '/users-logs' ? activeClass : inactiveClass}`}>
                                    <History className="h-4 w-4 stroke-[1.5]" />
                                    Log Aktivitas
                                </Link>
                            </div>
                        )}
                    </div>
                </aside>

                {/* CONTENT AREA */}
                <main className={`flex-grow flex flex-col min-w-0 bg-bg transition-all duration-300 ${sidebarOpen ? 'lg:w-4/5' : 'lg:w-full'}`}>
                    <div className="flex-grow p-6 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={usePage().url}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.2 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* FOOTER */}
                    <footer className="h-10 bg-bg border-t border-border flex items-center justify-center text-xs text-text/50 select-none">
                        &copy; {new Date().getFullYear()} PT. Integrasi Jaringan Ekosistem. All rights reserved.
                    </footer>
                </main>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </div>
    );
}
