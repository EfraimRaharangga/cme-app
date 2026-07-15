import React from 'react';

export default function Select({
    className = '',
    label = '',
    error = '',
    options = [],
    placeholder = 'Pilih...',
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="block font-medium text-xs text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <select
                {...props}
                className={
                    `w-full border-border rounded-md shadow-sm text-sm p-2 bg-white focus:border-primary focus:ring focus:ring-primary/20 outline-none transition ` +
                    (error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '') +
                    ` ` +
                    className
                }
            >
                <option value="">{placeholder}</option>
                {options.map((opt, idx) => (
                    <option key={idx} value={opt.value !== undefined ? opt.value : opt}>
                        {opt.label !== undefined ? opt.label : opt}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
