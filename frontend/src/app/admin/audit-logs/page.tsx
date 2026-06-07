"use client";
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface AuditLog {
    id: string;
    adminEmail: string;
    action: string;
    targetType: string;
    targetId: string;
    details: string;
    createdAt: string;
}

const ACTION_COLOR: Record<string, string> = {
    APPROVE: "text-emerald-400",
    REJECT: "text-red-400",
    SUSPEND: "text-orange-400",
    DELETE: "text-red-400",
    UPDATE: "text-blue-400",
    ANNOUNCE: "text-indigo-400",
    FLAG: "text-amber-400",
};

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/admin/audit-logs")
            .then(r => r.ok ? r.json() : [])
            .then(setLogs)
            .catch(() => setLogs([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = logs.filter(l =>
        l.action?.toLowerCase().includes(search.toLowerCase()) ||
        l.adminEmail?.toLowerCase().includes(search.toLowerCase()) ||
        l.targetType?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-5">
            <div>
                <h1 className="text-white text-xl font-black">Audit Logs</h1>
                <p className="text-slate-500 text-sm mt-0.5">Complete record of all admin actions</p>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
                    className="w-full pl-9 pr-4 py-2 bg-[#0D0E14] border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
            </div>

            <div className="bg-[#0D0E14] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5">
                            {["Admin", "Action", "Target", "Details", "Time"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(8)].map((_, i) => (
                                <tr key={i} className="border-b border-white/5">
                                    {[...Array(5)].map((_, j) => (
                                        <td key={j} className="px-4 py-3"><div className="h-3 bg-white/5 rounded animate-pulse" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-600 text-sm">No audit logs yet</td></tr>
                        ) : filtered.map(log => (
                            <tr key={log.id} className="border-b border-white/5 hover:bg-white/2">
                                <td className="px-4 py-3 text-slate-400 text-xs">{log.adminEmail}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-bold ${ACTION_COLOR[log.action] || "text-slate-400"}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded">
                                        {log.targetType}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-50">{log.details || "—"}</td>
                                <td className="px-4 py-3 text-slate-600 text-xs">
                                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}