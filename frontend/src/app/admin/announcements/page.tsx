"use client";
import React, { useState } from 'react';
import { Send, Users, ShieldCheck, Globe, CheckCircle, AlertTriangle } from 'lucide-react';

const AUDIENCES = [
    { value: "ALL", label: "All Users", Icon: Globe },
    { value: "USERS", label: "Regular Users Only", Icon: Users },
    { value: "NGOS", label: "NGOs Only", Icon: ShieldCheck },
];

const TYPES = ["ANNOUNCEMENT", "MAINTENANCE", "POLICY_UPDATE", "VERIFICATION_UPDATE"];

export default function AnnouncementsPage() {
    const [form, setForm] = useState({ title: "", message: "", audience: "ALL", type: "ANNOUNCEMENT" });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleSend = async () => {
        if (!form.title || !form.message) { setError("Title and message are required"); return; }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setSuccess("Announcement sent successfully!");
                setForm({ title: "", message: "", audience: "ALL", type: "ANNOUNCEMENT" });
                setTimeout(() => setSuccess(""), 4000);
            } else {
                const d = await res.json();
                setError(d.error || "Failed to send announcement");
            }
        } catch { setError("Failed to send announcement"); }
        finally { setLoading(false); }
    };

    const inputCls = "w-full px-4 py-2.5 bg-[#0A0B0F] border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50";

    return (
        <div className="p-6 space-y-5 max-w-2xl">
            <div>
                <h1 className="text-white text-xl font-black">Announcements</h1>
                <p className="text-slate-500 text-sm mt-0.5">Send platform-wide notifications and announcements</p>
            </div>

            {success && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl font-semibold">
                    <CheckCircle size={14} /> {success}
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl font-semibold">
                    <AlertTriangle size={14} /> {error}
                </div>
            )}

            <div className="bg-[#0D0E14] border border-white/5 rounded-2xl p-6 space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target Audience</label>
                    <div className="grid grid-cols-3 gap-3">
                        {AUDIENCES.map(({ value, label, Icon }) => (
                            <button key={value} onClick={() => setForm(p => ({ ...p, audience: value }))}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.audience === value ? "border-indigo-500/50 bg-indigo-600/10 text-indigo-400" : "border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"}`}>
                                <Icon size={16} />
                                <span className="text-xs font-semibold text-center">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Announcement Type</label>
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className={inputCls}>
                        {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Title</label>
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        className={inputCls} placeholder="e.g. Platform Maintenance Scheduled" />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Message</label>
                    <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        rows={5} className={`${inputCls} resize-none`}
                        placeholder="Write your announcement message here..." />
                </div>

                <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                    <p className="text-slate-500 text-xs font-semibold mb-1">Preview</p>
                    <p className="text-white text-sm font-bold">{form.title || "Announcement title"}</p>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{form.message || "Your message will appear here..."}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">{form.type}</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">→ {form.audience}</span>
                    </div>
                </div>

                <button onClick={handleSend} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                    <Send size={14} />
                    {loading ? "Sending..." : "Send Announcement"}
                </button>
            </div>
        </div>
    );
}