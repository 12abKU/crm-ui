import React, { useState, useEffect } from 'react';
import api from '../api';
import { T } from '../constants/theme';
import { toast } from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';

export default function PrivacyCompliance() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/api/privacy/requests');
            setRequests(res.data);
        } catch (error) {
            toast.error("Failed to fetch data requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fulfillRequest = async (id) => {
        try {
            await api.put(`/api/privacy/requests/${id}/complete`);
            toast.success("Request fulfilled successfully!");
            fetchRequests();
        } catch (error) {
            toast.error("Failed to fulfill request");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="p-8 h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-2" style={{ color: T.textPrimary }}>Privacy & Compliance</h1>
            <p className="mb-6 text-sm" style={{ color: T.textMuted }}>
                Manage Data Principal requests (Access, Correction, Erasure) according to DPDP regulations.
            </p>

            <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col" style={{ borderColor: T.border, backgroundColor: T.surface }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b" style={{ borderColor: T.border, backgroundColor: T.sidebarHover }}>
                            <tr>
                                <th className="px-6 py-3 font-semibold" style={{ color: T.textMuted }}>Type</th>
                                <th className="px-6 py-3 font-semibold" style={{ color: T.textMuted }}>Principal</th>
                                <th className="px-6 py-3 font-semibold" style={{ color: T.textMuted }}>Status</th>
                                <th className="px-6 py-3 font-semibold" style={{ color: T.textMuted }}>SLA / Deadline</th>
                                <th className="px-6 py-3 font-semibold text-right" style={{ color: T.textMuted }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center" style={{ color: T.textMuted }}>No pending privacy requests.</td>
                                </tr>
                            ) : (
                                requests.map(req => {
                                    const daysLeft = differenceInDays(new Date(req.slaDeadline), new Date());
                                    const isUrgent = daysLeft < 15;
                                    return (
                                        <tr key={req.id} className="border-b last:border-b-0 hover:bg-gray-50/50" style={{ borderColor: T.border }}>
                                            <td className="px-6 py-4 font-medium" style={{ color: T.textPrimary }}>
                                                {req.requestType}
                                            </td>
                                            <td className="px-6 py-4" style={{ color: T.textPrimary }}>
                                                {req.principalType} #{req.principalId}
                                                <div className="text-xs mt-1" style={{ color: T.textMuted }}>{req.notes}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`font-medium ${isUrgent ? 'text-red-600' : 'text-green-600'}`}>
                                                    {daysLeft} days left
                                                </div>
                                                <div className="text-xs mt-1" style={{ color: T.textMuted }}>
                                                    Requested: {format(new Date(req.requestedAt), 'MMM d, yyyy')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => fulfillRequest(req.id)}
                                                    className="px-3 py-1.5 text-sm font-medium rounded-lg text-white"
                                                    style={{ backgroundColor: T.primary }}>
                                                    Fulfill
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
