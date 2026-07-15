import React from 'react';

export default function Table({
    headers = [],
    className = '',
    children,
    ...props
}) {
    return (
        <div className={`overflow-x-auto w-full border border-gray-200 rounded-lg ${className}`}>
            <table {...props} className="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead className="bg-[#1A1A1A] text-white">
                    <tr>
                        {headers.map((head, idx) => (
                            <th
                                key={idx}
                                scope="col"
                                className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center"
                            >
                                {head}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {children}
                </tbody>
            </table>
        </div>
    );
}
