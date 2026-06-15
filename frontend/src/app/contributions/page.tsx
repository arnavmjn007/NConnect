"use client";
import React, { useState, useEffect } from 'react';
import { Heart, Package, Users, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Donation {
    id: string;
    purpose: string;
    amount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
}

interface VolunteerApp {
    id: string;
    projectId: string;
    projectTitle: string;
    projectCategory: string;
    ngoName: string | null;
    status: string;
    createdAt: string;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
    ACCEPTED: <CheckCircle size={13} className="text-emerald-500" />,
    PENDING: <Clock size={13} className="text-amber-500" />,
    REJECTED: <XCircle size={13} className="text-red-500" />,
    COMPLETED: <CheckCircle size={13} className="text-emerald-500" />,
};

const STATUS_COLOR: Record<string, string> = {
    ACCEPTED: "text-emerald-600 bg-emerald-50 border-emerald-200",
    PENDING: "text-amber-600 bg-amber-50 border-amber-200",
    REJECTED: "text-red-600 bg-red-50 border-red-200",
    COMPLETED: "text-emerald-600 bg-emerald-50 border-emerald-200",
};

export default function ContributionsPage() {
    useAuth();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [volunteerApps, setVolunteerApps] = useState<VolunteerApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'donations' | 'volunteer' | 'resources'>('donations');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [donRes, volRes] = await Promise.all([
                    fetch('/api/user/my-donations'),
                    fetch('/api/volunteer/my'),
                ]);
                if (donRes.ok) setDonations(await donRes.json());
                if (volRes.ok) setVolunteerApps(await volRes.json());
            } catch { /* silent */ }
            finally { setLoading(false); }
        };
        loadData();
    }, []);

    const totalDonated = donations
        .filter(d => d.status === 'COMPLETED' && d.purpose?.startsWith('project_donation'))
        .reduce((s, d) => s + d.amount, 0);

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
                <h1 className="text-xl font-bold text-slate-900">My Contributions</h1>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Donated", value: `NPR ${totalDonated.toLocaleString()}`, Icon: DollarSign, color: "text-rose-600" },
                        { label: "Applications", value: volunteerApps.length, Icon: Users, color: "text-indigo-600" },
                        { label: "Accepted", value: volunteerApps.filter(a => a.status === 'ACCEPTED').length, Icon: CheckCircle, color: "text-emerald-600" },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
                            <s.Icon size={18} className={`${s.color} mx-auto mb-1.5`} />
                            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex overflow-hidden">
                    {[
                        { key: 'donations' as const, label: 'Money Donations', Icon: DollarSign },
                        { key: 'volunteer' as const, label: 'Volunteer Activities', Icon: Users },
                        { key: 'resources' as const, label: 'Resource Donations', Icon: Package },
                    ].map(({ key, label, Icon }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-all border-b-2 ${activeTab === key
                                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}>
                            <Icon size={13} />{label}
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className="flex justify-center py-10">
                        <div className="h-7 w-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!loading && activeTab === 'donations' && (
                    <div className="space-y-3">
                        {donations.filter(d => d.purpose?.startsWith('project_donation')).length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                                <Heart size={32} className="mx-auto mb-3 text-slate-300" />
                                <p className="text-slate-500 font-semibold">No donations yet</p>
                                <p className="text-slate-400 text-sm mt-1">Your project donations will appear here</p>
                            </div>
                        ) : donations
                            .filter(d => d.purpose?.startsWith('project_donation'))
                            .map(d => (
                                <div key={d.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                                            <Heart size={16} className="text-rose-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                NPR {d.amount.toLocaleString()}
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {d.paymentMethod} · {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLOR[d.status] || 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                                        {d.status}
                                    </span>
                                </div>
                            ))}
                    </div>
                )}

                {!loading && activeTab === 'volunteer' && (
                    <div className="space-y-3">
                        {volunteerApps.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                                <Users size={32} className="mx-auto mb-3 text-slate-300" />
                                <p className="text-slate-500 font-semibold">No applications yet</p>
                                <p className="text-slate-400 text-sm mt-1">Apply for volunteer positions on the Projects page</p>
                            </div>
                        ) : volunteerApps.map(app => (
                            <div key={app.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                                            <Users size={16} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{app.projectTitle}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {app.ngoName} · {app.projectCategory}
                                            </p>
                                            <p className="text-[11px] text-slate-300 mt-0.5">
                                                Applied {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_COLOR[app.status] || 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                                        {STATUS_ICON[app.status]}
                                        {app.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && activeTab === 'resources' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                        <Package size={32} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-slate-500 font-semibold">Resource tracking coming soon</p>
                        <p className="text-slate-400 text-sm mt-1">Resources you donate will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}