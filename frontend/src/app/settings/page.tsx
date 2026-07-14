"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, deleteAccount } from '@/lib/api';
import {
    User, MapPin, Briefcase, GraduationCap, Tag, Globe,
    Heart, Sparkles, Trash2, Check, AlertTriangle, Shield,
    Building2, FileText, Target, ExternalLink
} from 'lucide-react';

const SKILLS = ["Frontend Development", "Backend Development", "UI/UX Design", "Teaching", "Fundraising", "Project Management", "Community Outreach", "Social Media", "Event Planning", "Data Analysis", "Medical", "Legal", "Translation"];
const INTERESTS = ["Education", "Environment", "Healthcare", "Women Empowerment", "Children & Youth", "Animals", "Disaster Relief", "Food Security", "Clean Water", "Digital Literacy", "Mental Health", "Human Rights"];
const CAUSES = ["Education Access", "Climate Action", "Poverty Alleviation", "Gender Equality", "Clean Energy", "Zero Hunger", "Quality Healthcare", "Clean Water & Sanitation"];
const LANGUAGES = ["English", "Nepali", "Hindi", "Mandarin", "Spanish", "French", "Arabic", "Portuguese"];
const NGO_CATEGORIES = ["Education", "Environment", "Healthcare", "Women Empowerment", "Children & Youth", "Animal Welfare", "Disaster Relief", "Food Security", "Clean Water", "Digital Literacy", "Mental Health", "Human Rights", "Community Development", "Arts & Culture"];

type UserSection = "profile" | "skills" | "interests" | "causes" | "languages" | "danger";
type NgoSection = "organization" | "mission" | "causes" | "languages" | "verification" | "danger";
type Section = UserSection | NgoSection;

export default function SettingsPage() {
    const { dbUser, refreshUser } = useAuth();
    const router = useRouter();

    const isNgo = dbUser?.role === "NGO";

    const [activeSection, setActiveSection] = useState<Section>(isNgo ? "organization" : "profile");
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

        organizationName: "",
        missionStatement: "",
        ngoCategories: "",
        operatingLocations: "",
    });

    useEffect(() => {
        if (dbUser) {
            setForm({
                username: dbUser.username || "",
                bio: dbUser.bio || "",
                location: dbUser.location || "",
                occupation: dbUser.occupation || "",
                education: dbUser.education || "",
                skills: dbUser.skills || [],
                interests: dbUser.interests || [],
                causes: dbUser.causes || [],
                languages: dbUser.languages || [],
                organizationName: dbUser.organizationName || "",
                missionStatement: dbUser.missionStatement || "",
                ngoCategories: dbUser.ngoCategories || "",
                operatingLocations: dbUser.operatingLocations || "",
            });
        }
    }, [dbUser]);
    useEffect(() => {
        if (isNgo) setActiveSection("organization");
        else setActiveSection("profile");
    }, [isNgo]);

    const showFeedback = (type: "success" | "error", msg: string) => {
        if (type === "success") { setSuccess(msg); setError(""); }
        else { setError(msg); setSuccess(""); }
        setTimeout(() => { setSuccess(""); setError(""); }, 3000);
    };

    const handleSave = async (fields: object) => {
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

    const toggleNgoCategory = (value: string) => {
        const current = form.ngoCategories ? form.ngoCategories.split(",").map(s => s.trim()).filter(Boolean) : [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        setForm(prev => ({ ...prev, ngoCategories: updated.join(", ") }));
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

    const userNavItems: { key: UserSection; label: string; Icon: React.ElementType }[] = [
        { key: "profile", label: "Profile Info", Icon: User },
        { key: "skills", label: "Skills", Icon: Tag },
        { key: "interests", label: "Interests", Icon: Sparkles },
        { key: "causes", label: "Causes", Icon: Heart },
        { key: "languages", label: "Languages", Icon: Globe },
        { key: "danger", label: "Danger Zone", Icon: Trash2 },
    ];

    const ngoNavItems: { key: NgoSection; label: string; Icon: React.ElementType }[] = [
        { key: "organization", label: "Organization", Icon: Building2 },
        { key: "mission", label: "Mission & Focus", Icon: Target },
        { key: "causes", label: "Causes", Icon: Heart },
        { key: "languages", label: "Languages", Icon: Globe },
        { key: "verification", label: "Verification", Icon: Shield },
        { key: "danger", label: "Danger Zone", Icon: Trash2 },
    ];

    const navItems = isNgo ? ngoNavItems : userNavItems;
    const activeSections = isNgo
        ? ["organization", "mission", "causes", "languages", "verification", "danger"]
        : ["profile", "skills", "interests", "causes", "languages", "danger"];

    const verificationStatusColor = {
        PENDING: "text-slate-500 bg-slate-50 border-slate-200",
        UNDER_REVIEW: "text-amber-600 bg-amber-50 border-amber-200",
        VERIFIED: "text-emerald-600 bg-emerald-50 border-emerald-200",
        REJECTED: "text-red-600 bg-red-50 border-red-200",
    };

    const ngoCategories = form.ngoCategories
        ? form.ngoCategories.split(",").map(s => s.trim()).filter(Boolean)
        : [];

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
                <h1 className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6">Settings & Privacy</h1>

                {success && (
                    <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs md:text-sm font-semibold px-3 md:px-4 py-2.5 md:py-3 rounded-xl">
                        <Check size={15} /> {success}
                    </div>
                )}
                {error && (
                    <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs md:text-sm font-semibold px-3 md:px-4 py-2.5 md:py-3 rounded-xl">
                        <AlertTriangle size={15} /> {error}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
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
                                    <Icon
                                        size={15}
                                        className={activeSection === key
                                            ? key === "danger" ? "text-red-500" : "text-indigo-500"
                                            : "text-slate-400"}
                                    />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </aside>
                    <div className="md:hidden w-full mb-1">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
                            {navItems.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveSection(key)}
                                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeSection === key
                                        ? key === "danger"
                                            ? "bg-red-600 text-white border-red-600"
                                            : "bg-indigo-600 text-white border-indigo-600"
                                        : "border-slate-200 bg-white text-slate-600"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        {!isNgo && activeSection === "profile" && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 space-y-4 md:space-y-5">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base">
                                    <User size={16} /> Profile Information
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username</label>
                                        <input
                                            value={form.username}
                                            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                            className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
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
                                            className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                            placeholder="Kathmandu, Nepal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            <Briefcase size={11} className="inline mr-1" />Occupation
                                        </label>
                                        <input
                                            value={form.occupation}
                                            onChange={e => setForm(p => ({ ...p, occupation: e.target.value }))}
                                            className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                            placeholder="Software Engineer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            <GraduationCap size={11} className="inline mr-1" />Education
                                        </label>
                                        <input
                                            value={form.education}
                                            onChange={e => setForm(p => ({ ...p, education: e.target.value }))}
                                            className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                            placeholder="BSc Computer Science"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bio</label>
                                    <textarea
                                        value={form.bio}
                                        onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                                        rows={4}
                                        className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none"
                                        placeholder="Tell the community about yourself..."
                                    />
                                </div>
                                <button
                                    onClick={() => handleSave({ username: form.username, bio: form.bio, location: form.location, occupation: form.occupation, education: form.education })}
                                    disabled={saving}
                                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2 md:py-2.5 px-6 rounded-xl text-sm transition-colors"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        )}

                        {!isNgo && activeSection === "skills" && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 space-y-4">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base"><Tag size={16} /> Skills</h2>
                                <p className="text-xs md:text-sm text-slate-500">Select skills that represent your expertise.</p>
                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {SKILLS.map(skill => {
                                        const active = form.skills.includes(skill);
                                        return (
                                            <button key={skill} onClick={() => toggleChip("skills", skill)}
                                                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"}`}>
                                                {active && <Check size={11} />}{skill}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button onClick={() => handleSave({ skills: form.skills })} disabled={saving}
                                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2 md:py-2.5 px-6 rounded-xl text-sm transition-colors">
                                    {saving ? "Saving..." : "Save Skills"}
                                </button>
                            </div>
                        )}

                        {!isNgo && activeSection === "interests" && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 space-y-4">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base"><Sparkles size={16} /> Interests</h2>
                                <p className="text-xs md:text-sm text-slate-500">Topics you care about for your personalized feed.</p>
                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {INTERESTS.map(item => {
                                        const active = form.interests.includes(item);
                                        return (
                                            <button key={item} onClick={() => toggleChip("interests", item)}
                                                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"}`}>
                                                {active && <Check size={11} />}{item}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button onClick={() => handleSave({ interests: form.interests })} disabled={saving}
                                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-2 md:py-2.5 px-6 rounded-xl text-sm transition-colors">
                                    {saving ? "Saving..." : "Save Interests"}
                                </button>
                            </div>
                        )}

                        {isNgo && activeSection === "organization" && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 space-y-4 md:space-y-5">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base">
                                    <Building2 size={16} /> Organization Details
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username</label>
                                        <input
                                            value={form.username}
                                            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                            className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                            placeholder="org_username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            <Building2 size={11} className="inline mr-1" />Organization Name
                                        </label>
                                        <input
                                            value={form.organizationName}
                                            onChange={e => setForm(p => ({ ...p, organizationName: e.target.value }))}
                                            className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                            placeholder="Hope Foundation Nepal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            <MapPin size={11} className="inline mr-1" />Headquarter Location
                                        </label>
                                        <input
                                            value={form.location}
                                            onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                            className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                            placeholder="Kathmandu, Nepal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            <Globe size={11} className="inline mr-1" />Operating Locations
                                        </label>
                                        <input
                                            value={form.operatingLocations}
                                            onChange={e => setForm(p => ({ ...p, operatingLocations: e.target.value }))}
                                            className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                            placeholder="Kathmandu, Pokhara, Chitwan"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSave({
                                        username: form.username,
                                        location: form.location,
                                        organizationName: form.organizationName,
                                        operatingLocations: form.operatingLocations,
                                    })}
                                    disabled={saving}
                                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2 md:py-2.5 px-6 rounded-xl text-sm transition-colors"
                                >
                                    {saving ? "Saving..." : "Save Organization Details"}
                                </button>
                            </div>
                        )}

                        {isNgo && activeSection === "mission" && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 space-y-4 md:space-y-5">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base">
                                    <Target size={16} /> Mission & Focus Areas
                                </h2>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        <FileText size={11} className="inline mr-1" />Mission Statement
                                    </label>
                                    <textarea
                                        value={form.missionStatement}
                                        onChange={e => setForm(p => ({ ...p, missionStatement: e.target.value }))}
                                        rows={5}
                                        className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none"
                                        placeholder="Describe your organization's mission and goals..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-2">NGO Categories</label>
                                    <p className="text-xs text-slate-500 mb-3">Select all areas your organization works in.</p>
                                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                                        {NGO_CATEGORIES.map(cat => {
                                            const active = ngoCategories.includes(cat);
                                            return (
                                                <button key={cat} onClick={() => toggleNgoCategory(cat)}
                                                    className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"}`}>
                                                    {active && <Check size={11} />}{cat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSave({
                                        missionStatement: form.missionStatement,
                                        ngoCategories: form.ngoCategories,
                                    })}
                                    disabled={saving}
                                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2 md:py-2.5 px-6 rounded-xl text-sm transition-colors"
                                >
                                    {saving ? "Saving..." : "Save Mission & Focus"}
                                </button>
                            </div>
                        )}

                        {isNgo && activeSection === "verification" && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 space-y-4 md:space-y-5">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base">
                                    <Shield size={16} /> Verification Status
                                </h2>

                                <div className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${verificationStatusColor[dbUser?.verificationStatus ?? "PENDING"]}`}>
                                    <Shield size={20} className="shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold">
                                            {dbUser?.verificationStatus === "VERIFIED" && "Your organization is verified ✓"}
                                            {dbUser?.verificationStatus === "UNDER_REVIEW" && "Verification under review"}
                                            {dbUser?.verificationStatus === "PENDING" && "Not yet submitted for verification"}
                                            {dbUser?.verificationStatus === "REJECTED" && "Verification was rejected"}
                                        </p>
                                        <p className="text-xs mt-0.5 opacity-80">
                                            {dbUser?.verificationStatus === "VERIFIED" && "You have a verified badge on NConnect."}
                                            {dbUser?.verificationStatus === "UNDER_REVIEW" && "Our team is reviewing your submission. This takes 2-3 business days."}
                                            {dbUser?.verificationStatus === "PENDING" && "Submit verification to get a blue tick badge and higher visibility."}
                                            {dbUser?.verificationStatus === "REJECTED" && "Please re-submit with correct documents."}
                                        </p>
                                    </div>
                                </div>

                                {(dbUser?.verificationStatus === "PENDING" || dbUser?.verificationStatus === "REJECTED") && (
                                    <button
                                        onClick={() => router.push("/verification")}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 md:py-2.5 px-6 rounded-xl text-sm transition-colors"
                                    >
                                        <ExternalLink size={14} />
                                        {dbUser?.verificationStatus === "REJECTED" ? "Re-submit Verification" : "Start Verification"}
                                    </button>
                                )}

                                {dbUser?.verificationStatus === "VERIFIED" && (
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs text-slate-600">
                                        <p><span className="font-semibold">Registration No:</span> {dbUser?.verificationStatus ?? "—"}</p>
                                        <p><span className="font-semibold">Verified since:</span> visible on your profile</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSections.includes(activeSection) && activeSection === "causes" && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 space-y-4">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base"><Heart size={16} /> Causes</h2>
                                <p className="text-xs md:text-sm text-slate-500">
                                    {isNgo ? "Causes your organization actively champions." : "Causes you actively support and champion."}
                                </p>
                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {CAUSES.map(cause => {
                                        const active = form.causes.includes(cause);
                                        return (
                                            <button key={cause} onClick={() => toggleChip("causes", cause)}
                                                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"}`}>
                                                {active && <Check size={11} />}{cause}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button onClick={() => handleSave({ causes: form.causes })} disabled={saving}
                                    className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold py-2 md:py-2.5 px-6 rounded-xl text-sm transition-colors">
                                    {saving ? "Saving..." : "Save Causes"}
                                </button>
                            </div>
                        )}

                        {activeSections.includes(activeSection) && activeSection === "languages" && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 space-y-4">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base"><Globe size={16} /> Languages</h2>
                                <p className="text-xs md:text-sm text-slate-500">
                                    {isNgo ? "Languages your organization operates in." : "Languages you can communicate in."}
                                </p>
                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {LANGUAGES.map(lang => {
                                        const active = form.languages.includes(lang);
                                        return (
                                            <button key={lang} onClick={() => toggleChip("languages", lang)}
                                                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"}`}>
                                                {active && <Check size={11} />}{lang}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button onClick={() => handleSave({ languages: form.languages })} disabled={saving}
                                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2 md:py-2.5 px-6 rounded-xl text-sm transition-colors">
                                    {saving ? "Saving..." : "Save Languages"}
                                </button>
                            </div>
                        )}

                        {activeSection === "danger" && (
                            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-4 md:p-6 space-y-4">
                                <h2 className="font-bold text-red-600 flex items-center gap-2 text-sm md:text-base"><AlertTriangle size={16} /> Danger Zone</h2>
                                <p className="text-xs md:text-sm text-slate-600">
                                    Deleting your account is permanent and cannot be undone. All your data, posts, connections, and history will be removed.
                                </p>
                                <div className="bg-red-50 rounded-xl p-4 space-y-3">
                                    <p className="text-xs md:text-sm font-semibold text-red-700">
                                        Type <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded">DELETE</span> to confirm:
                                    </p>
                                    <input
                                        value={deleteConfirm}
                                        onChange={e => setDeleteConfirm(e.target.value)}
                                        placeholder="Type DELETE to confirm"
                                        className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-red-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10"
                                    />
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleteConfirm !== "DELETE"}
                                        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2 md:py-2.5 px-6 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
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