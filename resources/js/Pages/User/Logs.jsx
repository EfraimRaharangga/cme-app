import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import Table from '../../Components/Table';

export default function Logs({ logs }) {
    return (
        <>
            <Head title="Log Aktivitas - Web CME" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                    Log Aktivitas Login
                </h1>
                <p className="text-sm text-gray-500 font-headlines mt-1">
                    Audit log riwayat masuk sistem beserta deteksi perangkat dan IP address.
                </p>
            </div>

            <Card title="Riwayat Akses Terbaru">
                <Table headers={['Waktu', 'Username', 'Status', 'IP Address', 'Browser', 'OS', 'Perangkat']}>
                    {logs.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                                Belum ada log aktivitas login
                            </td>
                        </tr>
                    ) : (
                        logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 text-center text-gray-500">{log.created_at}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">{log.username}</td>
                                <td className="px-6 py-4 text-center">
                                    <span
                                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                            log.status === 'success'
                                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                                : log.status === 'failed'
                                                ? 'bg-rose-50 text-rose-800 border border-rose-100'
                                                : 'bg-gray-50 text-gray-600 border border-gray-100'
                                        }`}
                                    >
                                        {log.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-mono text-xs text-gray-600">{log.ip_address}</td>
                                <td className="px-6 py-4 text-center text-gray-700">{log.browser}</td>
                                <td className="px-6 py-4 text-center text-gray-700">{log.os}</td>
                                <td className="px-6 py-4 text-center">
                                    <span
                                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                            log.device === 'Mobile'
                                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                        }`}
                                    >
                                        {log.device}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </Table>
            </Card>
        </>
    );
}


Logs.layout = page => <AppLayout children={page} />;
