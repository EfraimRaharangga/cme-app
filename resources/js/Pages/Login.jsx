import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import Button from '../Components/Button';
import Input from '../Components/Input';
import PasswordField from '../Components/PasswordField';
import Alert from '../Components/Alert';

export default function Login({ status, message }) {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-body">
            <Head title="Login - Web CME" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-[#00ADB5]/10 text-[#00ADB5] mb-4">
                    <svg
                        className="h-6 w-6 stroke-[1.5]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                        />
                    </svg>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 font-headlines leading-tight">
                    Web CME
                </h2>
                <p className="mt-2 text-sm text-gray-600 font-headlines">
                    Central Monitoring &amp; Evaluation
                </p>
                <div className="mt-3 inline-block bg-[#00ADB5]/10 border border-[#00ADB5]/20 rounded-full px-4 py-1 text-xs font-semibold text-[#00ADB5] uppercase tracking-wider">
                    Sistem Aktif
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 border border-gray-200 sm:rounded-lg sm:px-10 shadow-sm">
                    {/* Display session feedback alert */}
                    {message && (
                        <Alert
                            variant={status === 'error' ? 'error' : status === 'warning' ? 'warning' : 'success'}
                            message={message}
                            className="mb-6"
                        />
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="Username"
                            type="text"
                            name="username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            error={errors.username}
                            placeholder="Masukkan username Anda"
                            required
                            isFocused
                        />

                        <PasswordField
                            label="Password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            placeholder="Masukkan password Anda"
                            required
                        />

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full justify-center py-2.5 font-bold uppercase tracking-wider text-xs"
                                processing={processing}
                            >
                                Masuk ke Dashboard
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 border-t border-gray-150 pt-4 text-center">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} PT. Integrasi Jaringan Ekosistem
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
