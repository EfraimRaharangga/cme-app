import React from 'react';

export default function Card({
    className = '',
    title = '',
    headerActions = null,
    children,
    ...props
}) {
    return (
        <div
            {...props}
            className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${className}`}
        >
            {(title || headerActions) && (
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    {title && <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{title}</h3>}
                    {headerActions && <div>{headerActions}</div>}
                </div>
            )}
            <div className="px-6 py-4">
                {children}
            </div>
        </div>
    );
}
