import React, { useState, useEffect } from 'react';
import api from '../../api';
import { T } from '../../constants/theme';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useDialog } from '../../contexts/DialogContext';

export default function PrivacyTab({ principalType, principalId }) {
    const { confirm, prompt } = useDialog();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/api/privacy/consent/${principalType}/${principalId}`);
            setHistory(res.data);
        } catch (error) {
            toast.error("Failed to fetch privacy history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (principalId) fetchHistory();
    }, [principalId]);

    const logConsent = async () => {
        const purpose = await prompt({
            title: 'Log Consent',
            message: 'Enter consent purpose (e.g. MARKETING, DATA_STORAGE):',
            defaultValue: 'DATA_STORAGE'
        });
        if (!purpose) return;
        try {
            await api.post('/api/privacy/consent', {
                principalType,
                principalId,
                purpose,
                policyVersion: '1.0'
            });
            toast.success("Consent logged");
            fetchHistory();
        } catch (err) {
            toast.error("Failed to log consent");
        }
    };

    const withdrawConsent = async (purpose) => {
        const isConfirmed = await confirm({
            title: 'Withdraw Consent',
            message: `Are you sure you want to withdraw consent for ${purpose}?`
        });
        if (!isConfirmed) return;
        try {
            await api.put('/api/privacy/consent/withdraw', {
                principalType,
                principalId,
                purpose
            });
            toast.success("Consent withdrawn");
            fetchHistory();
        } catch (err) {
            toast.error("Failed to withdraw consent");
        }
    };

    const requestErasure = async () => {
        const isConfirmed = await confirm({
            title: 'Request Data Erasure',
            message: 'Are you sure you want to request data erasure? This must be fulfilled within 90 days.',
            confirmText: 'Request Erasure',
            confirmColor: '#ef4444'
        });
        if (!isConfirmed) return;
        try {
            await api.post('/api/privacy/requests', {
                principalType,
                principalId,
                requestType: 'ERASURE',
                notes: 'Requested from profile'
            });
            toast.success("Erasure request submitted");
        } catch (err) {
            toast.error("Failed to submit request");
        }
    };

    const requestCorrection = async () => {
        const notes = await prompt({
            title: 'Request Correction',
            message: 'What data needs to be corrected? Please provide details:'
        });
        if (!notes) return;
        try {
            await api.post('/api/privacy/requests', {
                principalType,
                principalId,
                requestType: 'CORRECTION',
                notes
            });
            toast.success("Correction request submitted");
        } catch (err) {
            toast.error("Failed to submit request");
        }
    };

    const exportData = async () => {
        const isConfirmed = await confirm({
            title: 'Export Data',
            message: 'Are you sure you want to export your data profile?',
            confirmText: 'Export',
            confirmColor: '#3b82f6'
        });
        if (!isConfirmed) return;
        try {
            const res = await api.get(`/api/privacy/export/${principalType}/${principalId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${principalType}_${principalId}_export.json`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("Data exported successfully");
        } catch (err) {
            toast.error("Failed to export data");
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h4 className="text-sm font-bold" style={{ color: T.textPrimary }}>Consent History</h4>
                <div className="flex flex-wrap gap-2">
                    <button onClick={logConsent} className="px-3 py-1 text-xs font-bold rounded-lg text-white transition-opacity hover:opacity-90 shadow-sm" style={{ background: T.primary }}>
                        Log Consent
                    </button>
                    <button onClick={exportData} className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm">
                        Export Data
                    </button>
                    <button onClick={requestCorrection} className="px-3 py-1 text-xs font-bold rounded-lg bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors shadow-sm">
                        Correct Data
                    </button>
                    <button onClick={requestErasure} className="px-3 py-1 text-xs font-bold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors shadow-sm">
                        Request Erasure
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="text-sm" style={{ color: T.textMuted }}>Loading...</p>
            ) : history.length === 0 ? (
                <p className="text-sm" style={{ color: T.textMuted }}>No consent history found.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {history.map(item => (
                        <div key={item.id} className={`p-3 rounded-lg border text-sm flex justify-between items-center ${item.consentWithdrawnAt ? 'opacity-70 bg-gray-50' : ''}`} style={{ borderColor: T.border, background: item.consentWithdrawnAt ? '#f9fafb' : T.surfaceRaised }}>
                            <div>
                                <p className="font-bold flex items-center gap-2" style={{ color: item.consentWithdrawnAt ? T.textMuted : T.textPrimary }}>
                                    <span className={item.consentWithdrawnAt ? 'line-through' : ''}>{item.purpose}</span>
                                    {item.consentWithdrawnAt && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">WITHDRAWN</span>}
                                    <span className="font-normal text-xs" style={{ color: T.textMuted }}>v{item.policyVersion}</span>
                                </p>
                                <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                                    Granted: {format(new Date(item.consentGivenAt), 'MMM d, yyyy HH:mm')}
                                    {item.consentWithdrawnAt && ` • Withdrawn: ${format(new Date(item.consentWithdrawnAt), 'MMM d, yyyy HH:mm')}`}
                                </p>
                            </div>
                            {!item.consentWithdrawnAt && (
                                <button onClick={() => withdrawConsent(item.purpose)} className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700">
                                    Withdraw
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
