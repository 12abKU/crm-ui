import React, { useState, useEffect } from 'react';
import api from '../../api';
import { T } from '../../constants/theme';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function PrivacyTab({ principalType, principalId }) {
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
        const purpose = prompt("Enter consent purpose (e.g. MARKETING, DATA_STORAGE):", "DATA_STORAGE");
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
        if (!window.confirm(`Withdraw consent for ${purpose}?`)) return;
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
        if (!window.confirm("Are you sure you want to request data erasure? This must be fulfilled within 90 days.")) return;
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

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold" style={{ color: T.textPrimary }}>Consent History</h4>
                <div className="flex gap-2">
                    <button onClick={logConsent} className="px-3 py-1 text-xs font-bold rounded-lg text-white" style={{ background: T.primary }}>
                        Log Consent
                    </button>
                    <button onClick={requestErasure} className="px-3 py-1 text-xs font-bold rounded-lg bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 transition">
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
                        <div key={item.id} className="p-3 rounded-lg border text-sm flex justify-between items-center" style={{ borderColor: T.border, background: T.surfaceRaised }}>
                            <div>
                                <p className="font-bold" style={{ color: T.textPrimary }}>{item.purpose} <span className="font-normal text-xs ml-2" style={{ color: T.textMuted }}>v{item.policyVersion}</span></p>
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
