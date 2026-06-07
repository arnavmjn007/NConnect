"use client";
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Search } from 'lucide-react';

interface PaymentRecord {
    id: string;
    userEmail: string;
    paymentMethod: string;
    paymentRef: string;
    amount: number;
    purpose: string;
    status: string;
    createdAt: string;
}

export default function DonationsPage() {
    const [records, setRecords] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/admin/donations")
            .then(r => r.ok ? r.json() : [])
            .then(setRecords)
            .catch(() => setRecords([]))
            .finally(() => setLoading(false));
    }, []);

    const totalNpr = records.reduce((s, r) => s + (r.amount || 0), 0);
    const filtered = records.filter(r =>
        r.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
        r.paymentRef?.toLowerCase().includes(search.toLowerCase()) ||
        r.purpose?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-5">
            <div>
                <h1 className="text-white text-xl font-black">Donation Monitoring</h1>
                <p className="text-slate-500 text-sm mt-0.5">All payment records across the platform</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Collected", value: `NPR ${totalNpr.toLocaleString()}`, Icon: DollarSign, color: "text-emerald-400" },
                    { label: "Total Transactions", value: records.length.toString(), Icon: TrendingUp, color: "text-blue-400" },
                    { label: "Completed", value: records.filter(r => r.status === "COMPLETED").length.toString(), Icon: DollarSign, color: "text-indigo-400" },
                ].map(({ label, value, Icon, color }) => (
                    <div key={label} className="bg-[#0D0E14] border border-white/5 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Icon size={14} className={color} />
                            <span className="text-slate-500 text-xs">{label}</span>
                        </div>
                        <p className="text-white text-xl font-black">{value}</p>
                    </div>
                ))}
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search donations..."
                    className="w-full pl-9 pr-4 py-2 bg-[#0D0E14] border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
            </div>

            <div className="bg-[#0D0E14] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5">
                            {["User", "Method", "Amount", "Purpose", "Ref", "Status", "Date"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <tr key={i} className="border-b border-white/5">
                                    {[...Array(7)].map((_, j) => (
                                        <td key={j} className="px-4 py-3"><div className="h-3 bg-white/5 rounded animate-pulse" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-600 text-sm">No payment records found</td></tr>
                        ) : filtered.map(r => (
                            <tr key={r.id} className="border-b border-white/5 hover:bg-white/2">
                                <td className="px-4 py-3 text-slate-300 text-xs">{r.userEmail}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.paymentMethod === "STRIPE" ? "bg-indigo-400/10 text-indigo-400" : "bg-emerald-400/10 text-emerald-400"}`}>
                                        {r.paymentMethod}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-200 text-xs font-bold">NPR {r.amount?.toLocaleString()}</td>
                                <td className="px-4 py-3 text-slate-500 text-xs capitalize">{r.purpose?.replace(/_/g, " ")}</td>
                                <td className="px-4 py-3 text-slate-600 text-[10px] font-mono truncate max-w-25">{r.paymentRef}</td>
                                <td className="px-4 py-3">
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{r.status}</span>
                                </td>
                                <td className="px-4 py-3 text-slate-500 text-xs">
                                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}