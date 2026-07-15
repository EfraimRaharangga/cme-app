import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
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

export default function AppLayout({ children }) {
    const { props } = usePage();
    const { auth } = props;
    const user = auth?.user;

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [openMenus, setOpenMenus] = useState({});

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
        } catch (e) {}
    }, []);

    // Save states to local storage
    const toggleSidebar = () => {
        const next = !sidebarOpen;
        setSidebarOpen(next);
        try {
            localStorage.setItem('sidebar_open', JSON.stringify(next));
        } catch (e) {}
    };

    const toggleMenu = (name) => {
        const next = { ...openMenus, [name]: !openMenus[name] };
        setOpenMenus(next);
        try {
            localStorage.setItem('sidebar_menus', JSON.stringify(next));
        } catch (e) {}
    };

    const handleLogout = () => {
        if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
            router.post('/logout');
        }
    };

    const hasRole = (roles) => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    const navItemStyle = "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition duration-150 ease-in-out";
    const activeClass = "bg-[#00ADB5]/15 text-[#00ADB5] font-semibold border-l-4 border-[#00ADB5]";
    const inactiveClass = "text-gray-400 hover:bg-gray-800/50 hover:text-white";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-body">
            <FlashMessage />

            {/* HEADER */}
            <header className="h-14 bg-[#1A1A1A] border-b border-gray-800 text-white flex items-center justify-between px-6 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition"
                    >
                        <Menu className="h-5 w-5 stroke-[1.5]" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-wider font-headlines">
                            CME <span className="text-[#00ADB5]">SYSTEM</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user && (
                        <div className="flex items-center gap-2 border-r border-gray-800 pr-4">
                            <User className="h-4 w-4 text-gray-400 stroke-[1.5]" />
                            <span className="text-xs text-gray-300 font-medium font-headlines">
                                {user.username} <span className="text-gray-500">({user.role})</span>
                            </span>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:text-red-300 border border-red-900/30 text-xs font-semibold uppercase tracking-wider transition"
                    >
                        <LogOut className="h-3.5 w-3.5 stroke-[1.5]" />
                        Logout
                    </button>
                </div>
            </header>

            <div className="flex flex-grow relative">
                {/* SIDEBAR */}
                <aside
                    className={`bg-[#1A1A1A] text-white border-r border-gray-800 transition-all duration-300 flex flex-col z-35 ${
                        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-r-0'
                    }`}
                >
                    <div className="flex-grow py-4 overflow-y-auto px-3 space-y-1">
                        {/* Dashboard links based on role */}
                        {hasRole(['admin', 'staff_cme']) && (
                            <Link href="/cme-dashboard" className={`${navItemStyle} ${usePage().url === '/cme-dashboard' ? activeClass : inactiveClass}`}>
                                <LayoutDashboard className="h-4 w-4 stroke-[1.5]" />
                                Dashboard CME
                            </Link>
                        )}

                        {hasRole(['admin', 'surveyor', 'staff_cme', 'vendor']) && (
                            <div>
                                <button
                                    onClick={() => toggleMenu('survey')}
                                    className={`w-full flex items-center justify-between ${navItemStyle} ${inactiveClass}`}
                                >
                                    <span className="flex items-center gap-3">
                                        <ClipboardList className="h-4 w-4 stroke-[1.5]" />
                                        Survey ODC
                                    </span>
                                    {openMenus['survey'] ? (
                                        <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                                    )}
                                </button>
                                {openMenus['survey'] && (
                                    <div className="pl-6 pr-2 py-1 space-y-1">
                                        <Link href="/dashboard" className={`block px-3 py-2 rounded-md text-xs transition ${usePage().url === '/dashboard' ? 'text-[#00ADB5] font-medium' : 'text-gray-400 hover:text-white'}`}>
                                            • Dashboard Survey
                                        </Link>
                                        <Link href="/survey/baru" className={`block px-3 py-2 rounded-md text-xs transition ${usePage().url === '/survey/baru' ? 'text-[#00ADB5] font-medium' : 'text-gray-400 hover:text-white'}`}>
                                            • Survey Baru
                                        </Link>
                                        <Link href="/survey" className={`block px-3 py-2 rounded-md text-xs transition ${usePage().url === '/survey' ? 'text-[#00ADB5] font-medium' : 'text-gray-400 hover:text-white'}`}>
                                            • Riwayat Survey
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {hasRole(['admin', 'vendor', 'staff_cme']) && (
                            <div>
                                <button
                                    onClick={() => toggleMenu('atp')}
                                    className={`w-full flex items-center justify-between ${navItemStyle} ${inactiveClass}`}
                                >
                                    <span className="flex items-center gap-3">
                                        <ClipboardList className="h-4 w-4 stroke-[1.5]" />
                                        ATP Check
                                    </span>
                                    {openMenus['atp'] ? (
                                        <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                                    )}
                                </button>
                                {openMenus['atp'] && (
                                    <div className="pl-6 pr-2 py-1 space-y-1">
                                        <Link href="/atp-dashboard" className={`block px-3 py-2 rounded-md text-xs transition ${usePage().url === '/atp-dashboard' ? 'text-[#00ADB5] font-medium' : 'text-gray-400 hover:text-white'}`}>
                                            • Dashboard ATP
                                        </Link>
                                        <Link href="/atp/baru" className={`block px-3 py-2 rounded-md text-xs transition ${usePage().url === '/atp/baru' ? 'text-[#00ADB5] font-medium' : 'text-gray-400 hover:text-white'}`}>
                                            • ATP Baru
                                        </Link>
                                        <Link href="/atp" className={`block px-3 py-2 rounded-md text-xs transition ${usePage().url === '/atp' ? 'text-[#00ADB5] font-medium' : 'text-gray-400 hover:text-white'}`}>
                                            • Riwayat ATP
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {hasRole(['admin', 'staff_cme', 'vendor']) && (
                            <Link href="/instruction" className={`${navItemStyle} ${usePage().url.startsWith('/instruction') ? activeClass : inactiveClass}`}>
                                <BookOpen className="h-4 w-4 stroke-[1.5]" />
                                Panduan Teknis (SOW)
                            </Link>
                        )}

                        {hasRole(['admin', 'staff_cme']) && (
                            <div>
                                <button
                                    onClick={() => toggleMenu('gudang')}
                                    className={`w-full flex items-center justify-between ${navItemStyle} ${inactiveClass}`}
                                >
                                    <span className="flex items-center gap-3">
                                        <Package className="h-4 w-4 stroke-[1.5]" />
                                        Gudang
                                    </span>
                                    {openMenus['gudang'] ? (
                                        <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                                    )}
                                </button>
                                {openMenus['gudang'] && (
                                    <div className="pl-6 pr-2 py-1 space-y-1">
                                        <Link href="/gudang" className={`block px-3 py-2 rounded-md text-xs transition ${usePage().url === '/gudang' ? 'text-[#00ADB5] font-medium' : 'text-gray-400 hover:text-white'}`}>
                                            • Stok Barang
                                        </Link>
                                        <Link href="/gudang/masuk-history" className={`block px-3 py-2 rounded-md text-xs transition ${usePage().url === '/gudang/masuk-history' ? 'text-[#00ADB5] font-medium' : 'text-gray-400 hover:text-white'}`}>
                                            • Barang Masuk
                                        </Link>
                                        <Link href="/gudang/keluar-history" className={`block px-3 py-2 rounded-md text-xs transition ${usePage().url === '/gudang/keluar-history' ? 'text-[#00ADB5] font-medium' : 'text-gray-400 hover:text-white'}`}>
                                            • Barang Keluar
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Admin specific accounts management */}
                        {hasRole(['admin']) && (
                            <div className="pt-4 mt-4 border-t border-gray-800/50 space-y-1">
                                <Link href="/users" className={`${navItemStyle} ${usePage().url === '/users' ? activeClass : inactiveClass}`}>
                                    <Users className="h-4 w-4 stroke-[1.5]" />
                                    Kelola Pengguna
                                </Link>
                                <Link href="/users-logs" className={`${navItemStyle} ${usePage().url === '/users-logs' ? activeClass : inactiveClass}`}>
                                    <History className="h-4 w-4 stroke-[1.5]" />
                                    Log Aktivitas
                                </Link>
                            </div>
                        )}
                    </div>
                </aside>

                {/* CONTENT AREA */}
                <main className="flex-grow flex flex-col min-w-0 bg-white">
                    <div className="flex-grow p-6">
                        {children}
                    </div>

                    {/* FOOTER */}
                    <footer className="h-10 bg-white border-t border-gray-100 flex items-center justify-center text-xs text-gray-500 select-none">
                        &copy; {new Date().getFullYear()} PT. Integrasi Jaringan Ekosistem. All rights reserved.
                    </footer>
                </main>
            </div>
        </div>
    );
}
