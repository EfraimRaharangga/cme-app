import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertCircle, HelpCircle, CheckCircle, Info } from 'lucide-react';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi',
    message = '',
    type = 'info', // 'info', 'warning', 'danger', 'success'
    confirmText = 'Ya',
    cancelText = 'Batal'
}) {
    const icons = {
        info: <Info className="h-6 w-6 text-[#00ADB5] stroke-[1.5]" />,
        warning: <AlertCircle className="h-6 w-6 text-amber-500 stroke-[1.5]" />,
        danger: <AlertCircle className="h-6 w-6 text-red-600 stroke-[1.5]" />,
        success: <CheckCircle className="h-6 w-6 text-emerald-500 stroke-[1.5]" />
    };

    const colors = {
        info: 'border-t-4 border-[#00ADB5]',
        warning: 'border-t-4 border-amber-500',
        danger: 'border-t-4 border-red-600',
        success: 'border-t-4 border-emerald-500'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="max-w-md">
            <div className={`space-y-4 pt-2`}>
                <div className="flex gap-4 items-start">
                    <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
                        {icons[type]}
                    </div>
                    <div className="space-y-1 flex-grow">
                        <h3 className="text-base font-bold text-gray-900 font-headlines">{title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-body">{message}</p>
                    </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                    {onConfirm ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                {cancelText}
                            </Button>
                            <Button
                                type="button"
                                variant={type === 'danger' ? 'danger' : 'secondary'}
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                            >
                                {confirmText}
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="button"
                            variant="primary"
                            onClick={onClose}
                        >
                            Tutup
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
