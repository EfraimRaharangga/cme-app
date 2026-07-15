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
        <div className="min-h-screen bg-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-body">
            <Head title="Login - Web CME" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <h2 className="text-3xl font-extrabold text-text font-headlines leading-tight">
                    CME App
                </h2>
                <p className="mt-2 text-sm text-text/75 font-headlines">
                    Central Monitoring &amp; Evaluation
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-surface py-8 px-4 border border-border sm:rounded-lg sm:px-10 shadow-sm">
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

                    <div className="mt-6 pt-4 text-center">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} PT. Integrasi Jaringan Ekosistem
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
