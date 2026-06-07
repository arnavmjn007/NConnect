"use client";
import React, { useState, useEffect } from 'react';
import { Search, Package, Trash2, CheckCircle } from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
    AVAILABLE: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20",
    REQUESTED: "bg-amber-400/10 text-amber-400 border border-amber-400/20",
    SHARED: "bg-violet-400/10 text-violet-400 border border-violet-400/20",
    UNAVAILABLE: "bg-slate-400/10 text-slate-400 border border-slate-400/20",
};

interface Resource {
    id: string;
    name: string;
    category: string;
    ownerName: string;
    location: string;
    status: string;
    sharingType: string;
    quantity: number;
    condition: string;
    createdAt: string;
}

export default function AdminResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [success, setSuccess] = useState("");

    useEffect(() => { fetchResources(); }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/resources");
            if (res.ok) setResources(await res.json());
        } catch { setResources([]); }
        finally { setLoading(false); }
    };

    const handleRemove = async (id: string) => {
        if (!confirm("Remove this resource listing?")) return;
        try {
            const res = await fetch(`/api/admin/resources/${id}`, { method: "DELETE" });
            if (res.ok) {
                setSuccess("Resource removed");
                fetchResources();
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch { }
    };

    const filtered = resources.filter(r => {
        const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) ||
            r.ownerName?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || r.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="p-6 space-y-5">
            <div>
                <h1 className="text-white text-xl font-black">Resource Oversight</h1>
                <p className="text-slate-500 text-sm mt-0.5">Monitor and manage all platform resources</p>
            </div>

            {success && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl font-semibold">
                    <CheckCircle size={14} /> {success}
                </div>
            )}

            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: "Total", value: resources.length, color: "text-white" },
                    { label: "Available", value: resources.filter(r => r.status === "AVAILABLE").length, color: "text-emerald-400" },
                    { label: "Requested", value: resources.filter(r => r.status === "REQUESTED").length, color: "text-amber-400" },
                    { label: "Shared", value: resources.filter(r => r.status === "SHARED").length, color: "text-violet-400" },
                ].map(s => (
                    <div key={s.label} className="bg-[#0D0E14] border border-white/5 rounded-2xl p-4">
                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search resources..."
                        className="w-full pl-9 pr-4 py-2 bg-[#0D0E14] border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
                </div>
                {["all", "AVAILABLE", "REQUESTED", "SHARED"].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${statusFilter === s ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30" : "border-white/10 text-slate-500 hover:text-slate-200"}`}>
                        {s === "all" ? "All" : s}
                    </button>
                ))}
            </div>

            <div className="bg-[#0D0E14] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5">
                            {["Resource", "Owner", "Category", "Qty", "Condition", "Sharing", "Status", "Actions"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <tr key={i} className="border-b border-white/5">
                                    {[...Array(8)].map((_, j) => (
                                        <td key={j} className="px-4 py-3"><div className="h-3 bg-white/5 rounded animate-pulse" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-600 text-sm">
                                {resources.length === 0 ? "No resources listed yet" : "No resources match your filters"}
                            </td></tr>
                        ) : filtered.map(r => (
                            <tr key={r.id} className="border-b border-white/5 hover:bg-white/2">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 bg-cyan-600/20 rounded-lg flex items-center justify-center shrink-0">
                                            <Package size={12} className="text-cyan-400" />
                                        </div>
                                        <p className="text-slate-200 text-xs font-semibold truncate max-w-35">{r.name}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-400 text-xs">{r.ownerName}</td>
                                <td className="px-4 py-3 text-slate-500 text-xs">{r.category}</td>
                                <td className="px-4 py-3 text-slate-400 text-xs">{r.quantity || "—"}</td>
                                <td className="px-4 py-3 text-slate-400 text-xs">{r.condition || "—"}</td>
                                <td className="px-4 py-3">
                                    <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
                                        {r.sharingType || "—"}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[r.status] || "bg-slate-500/10 text-slate-400"}`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => handleRemove(r.id)}
                                        className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                                        <Trash2 size={12} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}