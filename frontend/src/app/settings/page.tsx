"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, deleteAccount } from '@/lib/api';
import { User, MapPin, Briefcase, GraduationCap, Tag, Globe, Heart, Sparkles, Trash2, Check, AlertTriangle } from 'lucide-react';

const SKILLS = ["Frontend Development", "Backend Development", "UI/UX Design", "Teaching", "Fundraising", "Project Management", "Community Outreach", "Social Media", "Event Planning", "Data Analysis", "Medical", "Legal", "Translation"];
const INTERESTS = ["Education", "Environment", "Healthcare", "Women Empowerment", "Children & Youth", "Animals", "Disaster Relief", "Food Security", "Clean Water", "Digital Literacy", "Mental Health", "Human Rights"];
const CAUSES = ["Education Access", "Climate Action", "Poverty Alleviation", "Gender Equality", "Clean Energy", "Zero Hunger", "Quality Healthcare", "Clean Water & Sanitation"];
const LANGUAGES = ["English", "Nepali", "Hindi", "Mandarin", "Spanish", "French", "Arabic", "Portuguese"];

type Section = "profile" | "skills" | "interests" | "causes" | "languages" | "danger";

export default function SettingsPage() {
    const { dbUser, refreshUser } = useAuth();
    const router = useRouter();

    const [activeSection, setActiveSection] = useState<Section>("profile");
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState("");

    const [form, setForm] = useState({
        username: "",
        bio: "",
        location: "",
        occupation: "",
        education: "",
        skills: [] as string[],
        interests: [] as string[],
        causes: [] as string[],
        languages: [] as string[],
    });

    useEffect(() => {
        if (dbUser) {
            setForm({
                username: dbUser.username || "",
                bio: dbUser.bio || "",
                location: dbUser.location || "",
                occupation: dbUser.occupation || "",
                education: "",
                skills: dbUser.skills || [],
                interests: dbUser.interests || [],
                causes: dbUser.causes || [],
                languages: dbUser.languages || [],
            });
        }
    }, [dbUser]);

    const showFeedback = (type: "success" | "error", msg: string) => {
        if (type === "success") { setSuccess(msg); setError(""); }
        else { setError(msg); setSuccess(""); }
        setTimeout(() => { setSuccess(""); setError(""); }, 3000);
    };

    const handleSave = async (fields: Partial<typeof form>) => {
        setSaving(true);
        try {
            await updateProfile(fields);
            await refreshUser();
            showFeedback("success", "Changes saved successfully!");
        } catch (err: unknown) {
            showFeedback("error", err instanceof Error ? err.message : "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const toggleChip = (field: "skills" | "interests" | "causes" | "languages", value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value],
        }));
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== "DELETE") return;
        try {
            await deleteAccount();
            router.push("/auth/logout");
        } catch (err: unknown) {
            showFeedback("error", err instanceof Error ? err.message : "Failed to delete account");
        }
    };

    const navItems: { key: Section; label: string; Icon: React.ElementType }[] = [
        { key: "profile", label: "Profile Info", Icon: User },
        { key: "skills", label: "Skills", Icon: Tag },
        { key: "interests", label: "Interests", Icon: Sparkles },
        { key: "causes", label: "Causes", Icon: Heart },
        { key: "languages", label: "Languages", Icon: Globe },
        { key: "danger", label: "Danger Zone", Icon: Trash2 },
    ];

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
                <h1 className="text-xl font-bold text-slate-900 mb-6">Settings & Privacy</h1>
                {success && (
                    <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-xl">
                        <Check size={15} /> {success}
                    </div>
                )}
                {error && (
                    <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
                        <AlertTriangle size={15} /> {error}
                    </div>
                )}

                <div className="flex gap-6">
                    <aside className="w-52 shrink-0 hidden md:block">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 sticky top-24">
                            {navItems.map(({ key, label, Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveSection(key)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === key
                                        ? key === "danger"
                                            ? "bg-red-50 text-red-600"
                                            : "bg-indigo-50 text-indigo-600"
                                        : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    <Icon size={15} className={activeSection === key ? (key === "danger" ? "text-red-500" : "text-indigo-500") : "text-slate-400"} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    <div className="flex-1 space-y-4">
                        {activeSection === "profile" && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2"><User size={16} /> Profile Information</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username</label>
                                        <input
                                            value={form.username}
                                            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                            placeholder="your_username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            <MapPin size={11} className="inline mr-1" />Location
                                        </label>
                                        <input
                                            value={form.location}
                                            onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                            placeholder="Kathmandu, Nepal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            <Briefcase size={11} className="inline mr-1" />{dbUser?.role === "NGO" ? "Organization Name" : "Occupation"}
                                        </label>
                                        <input
                                            value={form.occupation}
                                            onChange={e => setForm(p => ({ ...p, occupation: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                            placeholder={dbUser?.role === "NGO" ? "Organization name" : "Software Engineer"}
                                        />
                                    </div>
                                    {dbUser?.role !== "NGO" && (
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                <GraduationCap size={11} className="inline mr-1" />Education
                                            </label>
                                            <input
                                                value={form.education}
                                                onChange={e => setForm(p => ({ ...p, education: e.target.value }))}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                                placeholder="BSc Computer Science"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bio</label>
                                    <textarea
                                        value={form.bio}
                                        onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                                        rows={4}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none"
                                        placeholder="Tell the community about yourself..."
                                    />
                                </div>

                                <button
                                    onClick={() => handleSave({ username: form.username, bio: form.bio, location: form.location, occupation: form.occupation, education: form.education })}
                                    disabled={saving}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        )}

                        {activeSection === "skills" && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2"><Tag size={16} /> Skills</h2>
                                <p className="text-sm text-slate-500">Select skills that represent your expertise.</p>
                                <div className="flex flex-wrap gap-2">
                                    {SKILLS.map(skill => {
                                        const active = form.skills.includes(skill);
                                        return (
                                            <button key={skill} onClick={() => toggleChip("skills", skill)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                                                {active && <Check size={11} />}{skill}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button onClick={() => handleSave({ skills: form.skills })} disabled={saving}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors">
                                    {saving ? "Saving..." : "Save Skills"}
                                </button>
                            </div>
                        )}

                        {activeSection === "interests" && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2"><Sparkles size={16} /> Interests</h2>
                                <p className="text-sm text-slate-500">Topics you care about for your personalized feed.</p>
                                <div className="flex flex-wrap gap-2">
                                    {INTERESTS.map(item => {
                                        const active = form.interests.includes(item);
                                        return (
                                            <button key={item} onClick={() => toggleChip("interests", item)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-600 hover:border-emerald-300"}`}>
                                                {active && <Check size={11} />}{item}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button onClick={() => handleSave({ interests: form.interests })} disabled={saving}
                                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors">
                                    {saving ? "Saving..." : "Save Interests"}
                                </button>
                            </div>
                        )}

                        {activeSection === "causes" && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2"><Heart size={16} /> Causes</h2>
                                <p className="text-sm text-slate-500">Causes you actively support and champion.</p>
                                <div className="flex flex-wrap gap-2">
                                    {CAUSES.map(cause => {
                                        const active = form.causes.includes(cause);
                                        return (
                                            <button key={cause} onClick={() => toggleChip("causes", cause)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 text-slate-600 hover:border-violet-300"}`}>
                                                {active && <Check size={11} />}{cause}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button onClick={() => handleSave({ causes: form.causes })} disabled={saving}
                                    className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors">
                                    {saving ? "Saving..." : "Save Causes"}
                                </button>
                            </div>
                        )}

                        {activeSection === "languages" && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2"><Globe size={16} /> Languages</h2>
                                <p className="text-sm text-slate-500">Languages you can communicate in.</p>
                                <div className="flex flex-wrap gap-2">
                                    {LANGUAGES.map(lang => {
                                        const active = form.languages.includes(lang);
                                        return (
                                            <button key={lang} onClick={() => toggleChip("languages", lang)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                                                {active && <Check size={11} />}{lang}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button onClick={() => handleSave({ languages: form.languages })} disabled={saving}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors">
                                    {saving ? "Saving..." : "Save Languages"}
                                </button>
                            </div>
                        )}

                        {activeSection === "danger" && (
                            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 space-y-4">
                                <h2 className="font-bold text-red-600 flex items-center gap-2"><AlertTriangle size={16} /> Danger Zone</h2>
                                <p className="text-sm text-slate-600">Deleting your account is permanent and cannot be undone. All your data, posts, connections, and history will be removed.</p>
                                <div className="bg-red-50 rounded-xl p-4 space-y-3">
                                    <p className="text-sm font-semibold text-red-700">Type <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded">DELETE</span> to confirm:</p>
                                    <input
                                        value={deleteConfirm}
                                        onChange={e => setDeleteConfirm(e.target.value)}
                                        placeholder="Type DELETE to confirm"
                                        className="w-full px-4 py-2.5 border border-red-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10"
                                    />
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleteConfirm !== "DELETE"}
                                        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={14} /> Delete My Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}