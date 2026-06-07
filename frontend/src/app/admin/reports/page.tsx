"use client";
import React, { useState, useEffect } from 'react';
import { Flag, Search, CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';

interface Report {
    id: string;
    reporterEmail: string;
    targetType: string;
    targetId: string;
    reason: string;
    description: string;
    status: string;
    createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
    OPEN: "bg-amber-400/10 text-amber-400 border border-amber-400/20",
    RESOLVED: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20",
    DISMISSED: "bg-slate-400/10 text-slate-400 border border-slate-400/20",
    IN_REVIEW: "bg-blue-400/10 text-blue-400 border border-blue-400/20",
};

const TYPE_COLOR: Record<string, string> = {
    USER: "text-blue-400 bg-blue-400/10",
    PROJECT: "text-violet-400 bg-violet-400/10",
    RESOURCE: "text-cyan-400 bg-cyan-400/10",
    POST: "text-rose-400 bg-rose-400/10",
};

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [success, setSuccess] = useState("");

    useEffect(() => { fetchReports(); }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/reports");
            if (res.ok) setReports(await res.json());
            else setReports([]);
        } catch { setReports([]); }
        finally { setLoading(false); }
    };

    const handleAction = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/admin/reports/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                setSuccess(`Report marked as ${status.toLowerCase()}`);
                fetchReports();
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch { }
    };

    const filtered = reports.filter(r => {
        const matchSearch = r.reporterEmail?.toLowerCase().includes(search.toLowerCase()) ||
            r.reason?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || r.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-white text-xl font-black">Reports & Moderation</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Review and resolve platform reports</p>
                </div>
                <span className="text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 px-3 py-1.5 rounded-full">
                    {reports.filter(r => r.status === "OPEN").length} open
                </span>
            </div>

            {success && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl font-semibold">
                    <CheckCircle size={14} /> {success}
                </div>
            )}

            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: "Total Reports", value: reports.length, Icon: Flag, color: "text-white" },
                    { label: "Open", value: reports.filter(r => r.status === "OPEN").length, Icon: AlertTriangle, color: "text-amber-400" },
                    { label: "In Review", value: reports.filter(r => r.status === "IN_REVIEW").length, Icon: Clock, color: "text-blue-400" },
                    { label: "Resolved", value: reports.filter(r => r.status === "RESOLVED").length, Icon: CheckCircle, color: "text-emerald-400" },
                ].map(({ label, value, Icon, color }) => (
                    <div key={label} className="bg-[#0D0E14] border border-white/5 rounded-2xl p-4">
                        <Icon size={14} className={`${color} mb-2`} />
                        <p className={`text-2xl font-black ${color}`}>{value}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search reports..."
                        className="w-full pl-9 pr-4 py-2 bg-[#0D0E14] border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
                </div>
                {["all", "OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${statusFilter === s ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30" : "border-white/10 text-slate-500 hover:text-slate-200"}`}>
                        {s === "all" ? "All" : s.replace("_", " ")}
                    </button>
                ))}
            </div>

            <div className="bg-[#0D0E14] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5">
                            {["Reporter", "Type", "Reason", "Description", "Status", "Date", "Actions"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b border-white/5">
                                    {[...Array(7)].map((_, j) => (
                                        <td key={j} className="px-4 py-3"><div className="h-3 bg-white/5 rounded animate-pulse" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-16 text-center">
                                    <Flag size={24} className="text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-600 text-sm font-semibold">
                                        {reports.length === 0 ? "No reports submitted yet" : "No reports match your filters"}
                                    </p>
                                    <p className="text-slate-700 text-xs mt-1">
                                        Reports will appear here once users submit them
                                    </p>
                                </td>
                            </tr>
                        ) : filtered.map(r => (
                            <tr key={r.id} className="border-b border-white/5 hover:bg-white/2">
                                <td className="px-4 py-3 text-slate-400 text-xs">{r.reporterEmail}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[r.targetType] || "bg-slate-500/10 text-slate-400"}`}>
                                        {r.targetType}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-300 text-xs font-semibold">{r.reason}</td>
                                <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-45">{r.description || "—"}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[r.status] || "bg-slate-500/10 text-slate-400"}`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-600 text-xs">
                                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        {r.status === "OPEN" && (
                                            <button onClick={() => handleAction(r.id, "IN_REVIEW")}
                                                className="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                                                title="Mark In Review">
                                                <Clock size={12} />
                                            </button>
                                        )}
                                        {(r.status === "OPEN" || r.status === "IN_REVIEW") && (
                                            <>
                                                <button onClick={() => handleAction(r.id, "RESOLVED")}
                                                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                                                    title="Resolve">
                                                    <CheckCircle size={12} />
                                                </button>
                                                <button onClick={() => handleAction(r.id, "DISMISSED")}
                                                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 transition-colors"
                                                    title="Dismiss">
                                                    <XCircle size={12} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}