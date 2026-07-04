import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmModal from '../components/ui/ConfirmModal';

const DialogContext = createContext();

export function DialogProvider({ children }) {
    const [dialogState, setDialogState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        confirmColor: '#ef4444',
        type: 'confirm', // 'confirm' or 'alert'
        resolve: null
    });

    const showConfirm = useCallback(({ title, message, confirmText, confirmColor }) => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                title,
                message,
                confirmText: confirmText || 'Confirm',
                confirmColor: confirmColor || '#ef4444',
                type: 'confirm',
                resolve
            });
        });
    }, []);

    const showAlert = useCallback(({ title, message, confirmText, confirmColor }) => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                title,
                message,
                confirmText: confirmText || 'OK',
                confirmColor: confirmColor || '#3b82f6', // primary blue
                type: 'alert',
                resolve
            });
        });
    }, []);

    const handleConfirm = () => {
        if (dialogState.resolve) dialogState.resolve(true);
        setDialogState(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        if (dialogState.resolve) dialogState.resolve(false);
        setDialogState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <DialogContext.Provider value={{ confirm: showConfirm, alert: showAlert }}>
            {children}
            <ConfirmModal
                isOpen={dialogState.isOpen}
                title={dialogState.title}
                message={dialogState.message}
                confirmText={dialogState.confirmText}
                confirmColor={dialogState.confirmColor}
                onConfirm={handleConfirm}
                onCancel={dialogState.type === 'confirm' ? handleCancel : null}
            />
        </DialogContext.Provider>
    );
}

export function useDialog() {
    return useContext(DialogContext);
}
