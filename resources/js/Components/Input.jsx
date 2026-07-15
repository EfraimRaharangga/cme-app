import React, { useEffect, useRef } from 'react';

export default function Input({
    type = 'text',
    className = '',
    isFocused = false,
    label = '',
    error = '',
    ...props
}) {
    const inputRef = useRef();

    useEffect(() => {
        if (isFocused) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    return (
        <div className="w-full">
            {label && (
                <label className="block font-medium text-xs text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input
                {...props}
                type={type}
                ref={inputRef}
                className={
                    `w-full border-border rounded-md shadow-sm text-sm p-2 focus:border-primary focus:ring focus:ring-primary/20 outline-none transition ` +
                    (error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '') +
                    ` ` +
                    className
                }
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
