"use client";
import React, { useState, useEffect } from 'react';
import { Search, Eye, Ban, UserCheck} from 'lucide-react';

const ROLE_STYLE: Record<string, string> = {
    USER: "bg-blue-400/10 text-blue-400",
    NGO: "bg-indigo-400/10 text-indigo-400",
    ADMIN: "bg-rose-400/10 text-rose-400",
};

interface User {
    id: string;
    fullName: string;
    username: string;
    email: string;
    role: string;
    onboardingComplete: boolean;
    verified: boolean;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [success, setSuccess] = useState("");

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) setUsers(await res.json());
        } catch { setUsers([]); }
        finally { setLoading(false); }
    };

    const handleSuspend = async (id: string, suspend: boolean) => {
        try {
            const res = await fetch(`/api/admin/users/${id}/suspend`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ suspended: suspend }),
            });
            if (res.ok) {
                setSuccess(`User ${suspend ? "suspended" : "reactivated"} successfully`);
                fetchUsers();
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch { }
    };

    const filtered = users.filter(u => {
        const matchSearch = u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.username?.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === "all" || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    return (
        <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-white text-xl font-black">User Management</h1>
                    <p className="text-slate-500 text-sm mt-0.5">{users.length} total users on platform</p>
                </div>
            </div>

            {success && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl font-semibold">
                    <UserCheck size={14} /> {success}
                </div>
            )}

            <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full pl-9 pr-4 py-2 bg-[#0D0E14] border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
                </div>
                {["all", "USER", "NGO", "ADMIN"].map(r => (
                    <button key={r} onClick={() => setRoleFilter(r)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${roleFilter === r ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30" : "border-white/10 text-slate-500 hover:text-slate-200"}`}>
                        {r === "all" ? "All" : r}
                    </button>
                ))}
            </div>

            <div className="bg-[#0D0E14] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5">
                            {["User", "Email", "Role", "Onboarded", "Joined", "Actions"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(8)].map((_, i) => (
                                <tr key={i} className="border-b border-white/5">
                                    {[...Array(6)].map((_, j) => (
                                        <td key={j} className="px-4 py-3"><div className="h-3 bg-white/5 rounded animate-pulse" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-600 text-sm">No users found</td></tr>
                        ) : filtered.map(user => (
                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 bg-slate-700 rounded-full flex items-center justify-center text-[10px] font-black text-slate-300 shrink-0">
                                            {user.fullName?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <p className="text-slate-200 text-xs font-semibold">{user.fullName || "—"}</p>
                                            <p className="text-slate-600 text-[10px]">@{user.username || "no username"}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-400 text-xs">{user.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_STYLE[user.role] || "bg-slate-500/10 text-slate-400"}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold ${user.onboardingComplete ? "text-emerald-400" : "text-slate-600"}`}>
                                        {user.onboardingComplete ? "Yes" : "No"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500 text-xs">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <button className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                            <Eye size={12} />
                                        </button>
                                        <button onClick={() => handleSuspend(user.id, true)}
                                            className="h-7 w-7 flex items-center justify-center rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 transition-colors">
                                            <Ban size={12} />
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