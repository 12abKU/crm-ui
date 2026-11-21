import React, { useState, useEffect } from 'react';
import api from '../api';
import { T } from '../constants/theme';
import { toast } from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import { useDialog } from '../contexts/DialogContext';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import PageHeroBanner from '../components/ui/PageHeroBanner';

export default function PrivacyCompliance() {
    const { confirm, prompt } = useDialog();
    const [requests, setRequests] = useState([]);
    const [breaches, setBreaches] = useState([]);
    const [recycledItems, setRecycledItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('requests');

    const fetchRequests = async () => {
        try {
            const res = await api.get('/api/privacy/requests');
            setRequests(res.data);
            try {
                const bRes = await api.get('/api/privacy/breaches');
                setBreaches(bRes.data);
            } catch (e) {
                console.warn(e);
            }
            try {
                const rRes = await api.get('/api/privacy/recycle-bin');
                setRecycledItems(rRes.data);
            } catch (e) {
                console.warn(e);
            }
        } catch (error) {
            toast.error("Failed to fetch data requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const logBreach = async () => {
        const desc = await prompt({
            title: 'Log Breach',
            message: 'Enter breach description:'
        });
        if (!desc) return;
        const severity = await prompt({
            title: 'Severity',
            message: 'Enter severity (LOW/MEDIUM/HIGH/CRITICAL):',
            defaultValue: 'HIGH'
        });
        if (!severity) return;
        try {
            await api.post('/api/privacy/breaches', { description: desc, severity, status: 'OPEN' });
            toast.success("Breach logged successfully");
            fetchRequests();
        } catch (error) {
            toast.error("Failed to log breach");
        }
    };

    const fulfillRequest = async (id) => {
        const isConfirmed = await confirm({
            title: 'Fulfill Request',
            message: 'Are you sure you want to fulfill this request?',
            confirmText: 'Fulfill',
            confirmColor: T.primary
        });
        if (!isConfirmed) return;
        try {
            await api.put(`/api/privacy/requests/${id}/complete`);
            toast.success("Request fulfilled successfully!");
            fetchRequests();
        } catch (error) {
            toast.error("Failed to fulfill request");
        }
    };

    const restoreItem = async (type, id) => {
        const isConfirmed = await confirm({
            title: 'Restore Item',
            message: `Are you sure you want to restore this ${type.toLowerCase()}?`,
            confirmText: 'Restore',
            confirmColor: T.primary
        });
        if (!isConfirmed) return;
        try {
            await api.put(`/api/privacy/recycle-bin/restore`, { type, id });
            toast.success("Item restored successfully!");
            fetchRequests();
        } catch (error) {
            toast.error("Failed to restore item");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="min-h-screen" style={{ background: 'var(--crm-bg)' }}>
            <TopBar />
            <main className="p-4 sm:p-8 flex flex-col">
                <PageHeroBanner
                    icon="privacy_tip"
                    title="Privacy & Compliance (DPDP)"
                    subtitle="Manage Data Principal requests, audit data breaches, and review retention lifecycle"
                    actions={
                        <button
                            onClick={logBreach}
                            className="crm-btn-primary whitespace-nowrap shrink-0"
                            style={{ background: '#EF4444' }}
                        >
                            <span className="material-symbols-outlined text-[18px]">warning</span>
                            Log Security Breach
                        </button>
                    }
                />

                <div className="flex gap-2 mb-5 p-1 rounded-2xl border w-fit"
                    style={{ background: T.surface, borderColor: T.border }}>
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                            activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}>
                        Data Requests ({requests.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('breaches')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                            activeTab === 'breaches' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}>
                        Data Breaches ({breaches.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('recycle')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                            activeTab === 'recycle' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}>
                        Recycle Bin ({recycledItems.length})
                    </button>
                </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col" style={{ borderColor: T.border, backgroundColor: T.surface }}>
                {activeTab === 'requests' ? (
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
                                                    <Link 
                                                        to={`/${req.principalType.toLowerCase()}s/${req.principalId}`}
                                                        className="font-bold text-blue-600 hover:underline"
                                                    >
                                                        {req.principalName || `${req.principalType} #${req.principalId}`}
                                                    </Link>
                                                    <div className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>
                                                        {req.principalType} #{req.principalId}
                                                    </div>
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
                ) : activeTab === 'breaches' ? (
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: T.border, backgroundColor: T.sidebarHover }}>
                            <h3 className="text-sm font-semibold" style={{ color: T.textPrimary }}>Security Incidents</h3>
                            <button onClick={logBreach} className="px-3 py-1.5 text-xs font-bold rounded-lg text-white shadow-sm" style={{ backgroundColor: '#EF4444' }}>
                                Log New Breach
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b" style={{ borderColor: T.border, backgroundColor: T.surfaceRaised }}>
                                    <tr>
                                        <th className="px-6 py-3 font-semibold" style={{ color: T.textMuted }}>Date</th>
                                        <th className="px-6 py-3 font-semibold" style={{ color: T.textMuted }}>Description</th>
                                        <th className="px-6 py-3 font-semibold" style={{ color: T.textMuted }}>Severity</th>
                                        <th className="px-6 py-3 font-semibold" style={{ color: T.textMuted }}>Board Notified</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {breaches.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center" style={{ color: T.textMuted }}>No breaches logged. System is secure.</td>
                                        </tr>
                                    ) : (
                                        breaches.map(b => (
                                            <tr key={b.id} className="border-b last:border-b-0 hover:bg-gray-50/50" style={{ borderColor: T.border }}>
                                                <td className="px-6 py-4">{format(new Date(b.breachDate), 'MMM d, yyyy')}</td>
                                                <td className="px-6 py-4">{b.description}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${b.severity === 'CRITICAL' || b.severity === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                                        {b.severity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{b.reportedToBoard ? 'Yes' : 'No'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'recycle' ? (
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: T.border, backgroundColor: T.sidebarHover }}>
                            <div>
                                <h3 className="text-sm font-semibold" style={{ color: T.textPrimary }}>Recycle Bin</h3>
                                <p className="text-xs mt-1" style={{ color: T.textMuted }}>Soft-deleted items will remain here until they are permanently purged (default 2 years).</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b" style={{ borderColor: T.border, backgroundColor: T.surfaceRaised }}>
                                    <tr>
                                        <th className="px-6 py-3 font-semibold" style={{ color: T.textMuted }}>Type</th>
                                        <th className="px-6 py-3 font-semibold" style={{ color: T.textMuted }}>Name / Title</th>
                                        <th className="px-6 py-3 font-semibold" style={{ color: T.textMuted }}>Deleted At</th>
                                        <th className="px-6 py-3 font-semibold text-right" style={{ color: T.textMuted }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recycledItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center" style={{ color: T.textMuted }}>Recycle bin is empty.</td>
                                        </tr>
                                    ) : (
                                        recycledItems.map(item => (
                                            <tr key={`${item.type}-${item.id}`} className="border-b last:border-b-0 hover:bg-gray-50/50" style={{ borderColor: T.border }}>
                                                <td className="px-6 py-4 font-medium" style={{ color: T.textPrimary }}>
                                                    {item.type}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-blue-600">
                                                    {item.name} <span className="text-xs text-gray-400">#{item.id}</span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {item.deletedAt ? format(new Date(item.deletedAt), 'MMM d, yyyy HH:mm') : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => restoreItem(item.type, item.id)}
                                                        className="px-3 py-1.5 text-xs font-medium rounded-lg text-white"
                                                        style={{ backgroundColor: T.primary }}>
                                                        Restore
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : null}
            </div>
            </main>
        </div>
    );
}
