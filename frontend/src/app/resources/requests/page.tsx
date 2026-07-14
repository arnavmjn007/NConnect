"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, Package, MessageSquare, AlertCircle } from 'lucide-react';

interface ResourceRequest {
    id: string;
    resourceId: string;
    resourceName: string;
    resourceCategory: string;
    requesterId: string;
    requesterName: string;
    requesterUsername: string;
    message: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
    createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 border border-amber-200",
    APPROVED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    REJECTED: "bg-red-100 text-red-700 border border-red-200",
};

export default function ResourceRequestsPage() {
    const [requests, setRequests] = useState<ResourceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchRequests = useCallback(async (showSkeleton = true) => {
        if (showSkeleton) setLoading(true);
        try {
            const res = await fetch('/api/resources/requests');
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (err) {
            console.error("Failed to fetch requests:", err);
        } finally {
            if (showSkeleton) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests(true);
    }, [fetchRequests]);

    useEffect(() => {
        if (!notification) return;
        const timer = setTimeout(() => setNotification(null), 4000);
        return () => clearTimeout(timer);
    }, [notification]);

    const handleAction = async (requestId: string, approve: boolean) => {
        const nextStatus = approve ? 'APPROVED' : 'REJECTED';
        setActionLoading(requestId);

        const previousRequests = [...requests];

        setRequests(prev =>
            prev.map(req => req.id === requestId ? { ...req, status: nextStatus } : req)
        );

        try {
            const res = await fetch(`/api/resources/requests/${requestId}/respond`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approve }),
            });

            if (res.ok) {
                setNotification({
                    message: approve ? "Request approved successfully!" : "Request rejected.",
                    type: 'success'
                });
                fetchRequests(false);
            } else {
                throw new Error("Server responded with an error status.");
            }
        } catch (error) {
            console.error(error);
            setRequests(previousRequests);
            setNotification({
                message: "Failed to update request status. Please try again.",
                type: 'error'
            });
        } finally {
            setActionLoading(null);
        }
    };

    const pending = requests.filter(r => r.status === 'PENDING');
    const past = requests.filter(r => r.status !== 'PENDING');

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Resource Requests</h1>
                        <p className="text-sm text-slate-500 mt-0.5">People requesting to borrow your resources</p>
                    </div>
                    {pending.length > 0 && (
                        <span className="text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full transition-all">
                            {pending.length} pending
                        </span>
                    )}
                </div>

                {notification && (
                    <div className={`flex items-center gap-2 border text-sm font-semibold px-4 py-3 rounded-xl transition-all animate-fadeIn ${notification.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        {notification.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                        {notification.message}
                    </div>
                )}

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                                <div className="h-3 bg-slate-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {pending.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                                    Pending Review
                                </p>
                                {pending.map(req => (
                                    <div key={req.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                                                    <Package size={16} className="text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{req.resourceName}</p>
                                                    <p className="text-[11px] text-slate-400">{req.resourceCategory}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${STATUS_STYLE[req.status]}`}>
                                                <Clock size={9} />
                                                {req.status}
                                            </span>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-3">
                                            <p className="text-xs font-semibold text-slate-700 mb-0.5">
                                                Requested by: <span className="text-indigo-600">@{req.requesterUsername}</span>
                                                {req.requesterName && req.requesterName !== req.requesterUsername && (
                                                    <span className="text-slate-500"> ({req.requesterName})</span>
                                                )}
                                            </p>
                                            {req.message && (
                                                <div className="flex items-start gap-1.5 mt-2">
                                                    <MessageSquare size={12} className="text-slate-400 mt-0.5 shrink-0" />
                                                    <p className="text-xs text-slate-600 italic">&ldquo;{req.message}&rdquo;</p>
                                                </div>
                                            )}
                                            <p className="text-[10px] text-slate-400 mt-2">
                                                {req.createdAt ? new Date(req.createdAt).toLocaleString() : ''}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAction(req.id, true)}
                                                disabled={actionLoading !== null}
                                                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                                            >
                                                <CheckCircle size={13} />
                                                {actionLoading === req.id ? 'Processing...' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleAction(req.id, false)}
                                                disabled={actionLoading !== null}
                                                className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 disabled:opacity-40 font-bold py-2 rounded-xl text-xs transition-colors"
                                            >
                                                <XCircle size={13} />
                                                {actionLoading === req.id ? 'Processing...' : 'Reject'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {past.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                                    Past Requests
                                </p>
                                {past.map(req => (
                                    <div key={req.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-3 animate-fadeIn">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                                <Package size={14} className="text-slate-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{req.resourceName}</p>
                                                <p className="text-[11px] text-slate-400">by @{req.requesterUsername}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[req.status] || 'bg-slate-100 text-slate-500'}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {requests.length === 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                <Package size={32} className="mx-auto mb-3 text-slate-300" />
                                <p className="text-slate-500 font-semibold">No requests yet</p>
                                <p className="text-slate-400 text-sm mt-1">When someone requests your resources, they will appear here</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}