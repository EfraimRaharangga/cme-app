import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordField({
    className = '',
    label = '',
    error = '',
    ...props
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="w-full">
            {label && (
                <label className="block font-medium text-xs text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    {...props}
                    type={visible ? 'text' : 'password'}
                    className={
                        `w-full border-gray-300 rounded-md shadow-sm text-sm p-2 pr-10 focus:border-[#00ADB5] focus:ring focus:ring-[#00ADB5]/20 outline-none transition ` +
                        (error ? 'border-red-500 focus:border-red-500' : '') +
                        ` ` +
                        className
                    }
                />
                <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#00ADB5]"
                >
                    {visible ? (
                        <EyeOff className="h-4 w-4 stroke-[1.5]" />
                    ) : (
                        <Eye className="h-4 w-4 stroke-[1.5]" />
                    )}
                </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
