"use client";
import React, { useState, useEffect } from 'react';
import {
    Eye, CheckCircle, XCircle,
    FileText, ExternalLink, Search, 
    BadgeCheck
} from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
    PENDING: "bg-amber-400/10 text-amber-400 border border-amber-400/20",
    UNDER_REVIEW: "bg-blue-400/10 text-blue-400 border border-blue-400/20",
    VERIFIED: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20",
    REJECTED: "bg-red-400/10 text-red-400 border border-red-400/20",
};

interface NgoApplication {
    id: string;
    organizationName: string;
    username: string;
    email: string;
    registrationNumber: string;
    websiteUrl: string;
    foundedYear: number;
    documentUrl: string;
    verificationStatus: string;
    submittedAt: string;
    missionStatement: string;
    ngoCategories: string;
    operatingLocations: string;
}

export default function NgoVerificationPage() {
    const [applications, setApplications] = useState<NgoApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selected, setSelected] = useState<NgoApplication | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/ngo-verifications");
            if (res.ok) setApplications(await res.json());
        } catch { setApplications([]); }
        finally { setLoading(false); }
    };

    const handleAction = async (id: string, action: "VERIFIED" | "REJECTED") => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/ngo-verifications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: action }),
            });
            if (res.ok) {
                setSuccess(`NGO ${action === "VERIFIED" ? "approved" : "rejected"} successfully`);
                setSelected(null);
                fetchApplications();
                setTimeout(() => setSuccess(""), 3000);
            }
        } finally { setActionLoading(false); }
    };

    const filtered = applications.filter(a => {
        const matchSearch = a.organizationName?.toLowerCase().includes(search.toLowerCase()) ||
            a.email?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || a.verificationStatus === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-white text-xl font-black">NGO Verification</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Review and manage NGO verification applications</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 px-3 py-1.5 rounded-full">
                        {applications.filter(a => a.verificationStatus === "PENDING" || a.verificationStatus === "UNDER_REVIEW").length} pending
                    </span>
                </div>
            </div>

            {success && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold px-4 py-3 rounded-xl">
                    <CheckCircle size={14} /> {success}
                </div>
            )}

            <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search NGOs..."
                        className="w-full pl-9 pr-4 py-2 bg-[#0D0E14] border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
                </div>
                {["all", "PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED"].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${statusFilter === s ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30" : "border-white/10 text-slate-500 hover:text-slate-200 hover:border-white/20"}`}>
                        {s === "all" ? "All" : s.replace("_", " ")}
                    </button>
                ))}
            </div>

            <div className="bg-[#0D0E14] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5">
                            {["Organization", "Email", "Reg. Number", "Submitted", "Status", "Actions"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b border-white/5">
                                    {[...Array(6)].map((_, j) => (
                                        <td key={j} className="px-4 py-3">
                                            <div className="h-3 bg-white/5 rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-600 text-sm">
                                    No applications found
                                </td>
                            </tr>
                        ) : filtered.map(app => (
                            <tr key={app.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 bg-indigo-600/20 rounded-lg flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0">
                                            {app.organizationName?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <p className="text-slate-200 text-xs font-semibold">{app.organizationName || "—"}</p>
                                            <p className="text-slate-600 text-[10px]">@{app.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-400 text-xs">{app.email}</td>
                                <td className="px-4 py-3 text-slate-400 text-xs font-mono">{app.registrationNumber || "—"}</td>
                                <td className="px-4 py-3 text-slate-500 text-xs">{app.submittedAt || "—"}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[app.verificationStatus] || "bg-slate-500/10 text-slate-400"}`}>
                                        {app.verificationStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => setSelected(app)}
                                            className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                            <Eye size={12} />
                                        </button>
                                        {(app.verificationStatus === "PENDING" || app.verificationStatus === "UNDER_REVIEW") && (
                                            <>
                                                <button onClick={() => handleAction(app.id, "VERIFIED")}
                                                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors">
                                                    <CheckCircle size={12} />
                                                </button>
                                                <button onClick={() => handleAction(app.id, "REJECTED")}
                                                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
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

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)} />
                    <div className="relative bg-[#0D0E14] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
                        <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0D0E14] z-10">
                            <div>
                                <h2 className="text-white font-bold">{selected.organizationName}</h2>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[selected.verificationStatus]}`}>
                                    {selected.verificationStatus}
                                </span>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-lg">✕</button>
                        </div>
                        <div className="p-5 space-y-4">
                            {[
                                { label: "Email", value: selected.email },
                                { label: "Username", value: `@${selected.username}` },
                                { label: "Registration No.", value: selected.registrationNumber || "Not provided" },
                                { label: "Website", value: selected.websiteUrl || "Not provided" },
                                { label: "Founded Year", value: selected.foundedYear?.toString() || "Not provided" },
                                { label: "Categories", value: selected.ngoCategories || "Not provided" },
                                { label: "Operating Locations", value: selected.operatingLocations || "Not provided" },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-slate-500 text-xs">{label}</span>
                                    <span className="text-slate-200 text-xs font-semibold text-right max-w-[60%]">{value}</span>
                                </div>
                            ))}
                            {selected.missionStatement && (
                                <div className="py-2">
                                    <p className="text-slate-500 text-xs mb-1">Mission Statement</p>
                                    <p className="text-slate-300 text-xs leading-relaxed">{selected.missionStatement}</p>
                                </div>
                            )}
                            {selected.documentUrl && (
                                <a href={selected.documentUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white text-xs font-semibold transition-colors">
                                    <FileText size={13} /> View Registration Document <ExternalLink size={11} />
                                </a>
                            )}
                            {(selected.verificationStatus === "PENDING" || selected.verificationStatus === "UNDER_REVIEW") && (
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => handleAction(selected.id, "VERIFIED")} disabled={actionLoading}
                                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                                        <BadgeCheck size={15} /> Approve
                                    </button>
                                    <button onClick={() => handleAction(selected.id, "REJECTED")} disabled={actionLoading}
                                        className="flex-1 flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-bold py-2.5 rounded-xl text-sm transition-colors">
                                        <XCircle size={15} /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}