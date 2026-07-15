import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import Alert from './Alert';

export default function FlashMessage() {
    const { props } = usePage();
    const { flash } = props;
    const [visible, setVisible] = useState(false);
    const [type, setType] = useState('info');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (flash?.success) {
            setType('success');
            setMessage(flash.success);
            setVisible(true);
        } else if (flash?.error) {
            setType('error');
            setMessage(flash.error);
            setVisible(true);
        } else if (flash?.warning) {
            setType('warning');
            setMessage(flash.warning);
            setVisible(true);
        }
    }, [flash]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    return (
        <AnimatePresence>
            {visible && message && (
                <motion.div
                    className="fixed top-16 right-4 z-50 max-w-xs sm:max-w-sm w-[calc(100%-2rem)] sm:w-80"
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <Alert variant={type} message={message} className="shadow-lg border-opacity-70 bg-white" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
