import React from 'react';

export default function Button({
    type = 'button',
    className = '',
    processing = false,
    variant = 'primary',
    children,
    ...props
}) {
    const baseStyle = "inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-md font-semibold text-xs uppercase tracking-widest transition ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[#1A1A1A] border-transparent text-white hover:bg-black active:bg-black focus:ring-[#1A1A1A]",
        secondary: "bg-[#00ADB5] border-transparent text-white hover:bg-[#008f96] active:bg-[#008f96] focus:ring-[#00ADB5]",
        outline: "bg-white border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#00ADB5]/5 hover:text-[#00ADB5] hover:border-[#00ADB5] focus:ring-[#00ADB5]",
        danger: "bg-red-600 border-transparent text-white hover:bg-red-700 active:bg-red-700 focus:ring-red-600",
    };

    return (
        <button
            {...props}
            type={type}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            disabled={processing || props.disabled}
        >
            {processing && (
                <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </button>
    );
}
