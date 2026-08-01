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
        type: 'confirm', // 'confirm', 'alert', or 'prompt'
        defaultValue: '',
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
                defaultValue: '',
                resolve
            });
        });
    }, []);

    const showPrompt = useCallback(({ title, message, defaultValue = '', confirmText = 'Submit', confirmColor = '#3b82f6' }) => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                title,
                message,
                confirmText,
                confirmColor,
                type: 'prompt',
                defaultValue,
                resolve
            });
        });
    }, []);

    const handleConfirm = (value) => {
        if (dialogState.resolve) {
            if (dialogState.type === 'prompt') {
                dialogState.resolve(value);
            } else {
                dialogState.resolve(true);
            }
        }
        setDialogState(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        if (dialogState.resolve) {
            if (dialogState.type === 'prompt') {
                dialogState.resolve(null);
            } else {
                dialogState.resolve(false);
            }
        }
        setDialogState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <DialogContext.Provider value={{ confirm: showConfirm, alert: showAlert, prompt: showPrompt }}>
            {children}
            <ConfirmModal
                isOpen={dialogState.isOpen}
                title={dialogState.title}
                message={dialogState.message}
                confirmText={dialogState.confirmText}
                confirmColor={dialogState.confirmColor}
                type={dialogState.type}
                defaultValue={dialogState.defaultValue}
                onConfirm={handleConfirm}
                onCancel={(dialogState.type === 'confirm' || dialogState.type === 'prompt') ? handleCancel : null}
            />
        </DialogContext.Provider>
    );
}

export function useDialog() {
    return useContext(DialogContext);
}
