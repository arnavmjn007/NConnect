"use client";
import React, { useState, useEffect } from 'react';
import { Search, Eye, Flag, Archive, CheckCircle } from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
    ACTIVE: "bg-emerald-400/10 text-emerald-400",
    COMPLETED: "bg-blue-400/10 text-blue-400",
    PAUSED: "bg-amber-400/10 text-amber-400",
    CANCELLED: "bg-red-400/10 text-red-400",
};

const PRIORITY_STYLE: Record<string, string> = {
    URGENT: "text-red-400",
    HIGH: "text-orange-400",
    NORMAL: "text-slate-500",
    LOW: "text-blue-400",
};

interface Project {
    id: string;
    title: string;
    ngoName: string;
    category: string;
    status: string;
    priorityLevel: string;
    goalAmount: number;
    raisedAmount: number;
    volunteerSlots: number;
    location: string;
    createdAt: string;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [success, setSuccess] = useState("");

    useEffect(() => { fetchProjects(); }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/projects");
            if (res.ok) setProjects(await res.json());
        } catch { setProjects([]); }
        finally { setLoading(false); }
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/admin/projects/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) { setSuccess(`Project ${status.toLowerCase()}`); fetchProjects(); setTimeout(() => setSuccess(""), 3000); }
        } catch { }
    };

    const filtered = projects.filter(p => {
        const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.ngoName?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-white text-xl font-black">Project Monitoring</h1>
                    <p className="text-slate-500 text-sm mt-0.5">{projects.length} total projects</p>
                </div>
            </div>

            {success && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl font-semibold">
                    <CheckCircle size={14} /> {success}
                </div>
            )}

            <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
                        className="w-full pl-9 pr-4 py-2 bg-[#0D0E14] border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
                </div>
                {["all", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"].map(s => (
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
                            {["Project", "NGO", "Category", "Priority", "Funding", "Status", "Actions"].map(h => (
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
                            <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-600 text-sm">No projects found</td></tr>
                        ) : filtered.map(p => (
                            <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="text-slate-200 text-xs font-semibold truncate max-w-45">{p.title}</p>
                                </td>
                                <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-30">{p.ngoName}</td>
                                <td className="px-4 py-3 text-slate-500 text-xs">{p.category}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold ${PRIORITY_STYLE[p.priorityLevel] || "text-slate-500"}`}>
                                        {p.priorityLevel}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {p.goalAmount ? (
                                        <div>
                                            <p className="text-slate-200 text-xs font-semibold">
                                                NPR {p.raisedAmount?.toLocaleString() || 0}
                                            </p>
                                            <p className="text-slate-600 text-[10px]">
                                                of {p.goalAmount?.toLocaleString()}
                                            </p>
                                        </div>
                                    ) : <span className="text-slate-600 text-xs">No goal</span>}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status] || "bg-slate-500/10 text-slate-400"}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <button className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                            <Eye size={12} />
                                        </button>
                                        <button onClick={() => handleStatusChange(p.id, "PAUSED")}
                                            className="h-7 w-7 flex items-center justify-center rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors">
                                            <Flag size={12} />
                                        </button>
                                        <button onClick={() => handleStatusChange(p.id, "CANCELLED")}
                                            className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                                            <Archive size={12} />
                                        </button>
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