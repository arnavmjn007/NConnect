"use client";
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getProjects, getMyProjects, getProjectRecommendations, getVolunteerRecommendations, getUsersByIds, type BasicUser } from '@/lib/api';
import { startConversation } from '@/lib/feedApi';
import Image from 'next/image';
import {
    Search, TrendingUp, Droplets, GraduationCap,
    Heart, Leaf, Utensils, AlertTriangle, MapPin, Clock,
    Users, Target, BadgeCheck, Flame, Plus, X, CheckCircle, Sparkles,
    Pencil, FolderOpen, MessageSquare,
} from 'lucide-react';
import DonationModal from '@/components/payment/DonationModal';
import SiteFooter from '@/components/ui/SiteFooter';

const CATEGORIES = [
    { label: "All Projects", value: "all", Icon: null },
    { label: "Water & Sanitation", value: "Water & Sanitation", Icon: Droplets },
    { label: "Education", value: "Education", Icon: GraduationCap },
    { label: "Healthcare", value: "Healthcare", Icon: Heart },
    { label: "Environment", value: "Environment", Icon: Leaf },
    { label: "Food Security", value: "Food Security", Icon: Utensils },
    { label: "Emergency Relief", value: "Emergency Relief", Icon: AlertTriangle },
];

const PRIORITY_COLOR: Record<string, string> = {
    URGENT: "bg-red-100 text-red-700 border border-red-200",
    HIGH: "bg-orange-100 text-orange-700 border border-orange-200",
    NORMAL: "bg-slate-100 text-slate-600 border border-slate-200",
    LOW: "bg-blue-50 text-blue-600 border border-blue-200",
};

const CATEGORY_GRADIENT: Record<string, string> = {
    "Water & Sanitation": "from-blue-600 to-cyan-500",
    "Education": "from-violet-600 to-purple-500",
    "Healthcare": "from-rose-600 to-pink-500",
    "Environment": "from-emerald-600 to-green-500",
    "Food Security": "from-orange-600 to-amber-500",
    "Emergency Relief": "from-red-700 to-rose-600",
    "default": "from-indigo-600 to-blue-500",
};

interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    ngoId: string;
    ngoName: string;
    ngoUsername: string;
    ngoVerified: boolean;
    location: string;
    duration: string;
    volunteerSlots: number;
    volunteersJoined: number;
    goalAmount: number;
    raisedAmount: number;
    donorCount: number;
    requiredSkills: string[];
    tags: string[];
    priorityLevel: string;
    beneficiaryGroup: string;
    startDate: string;
    endDate: string;
    imageUrl: string;
    status: string;
}

interface VolunteerApplication {
    id: string;
    applicantId: string;
    applicantName: string;
    applicantUsername: string;
    applicantImage: string | null;
    applicantAuth0Id: string;
    message: string;
    status: string;
    createdAt: string;
}

interface SuggestedVolunteer {
    userId: string;
    score: number;
}


function VolunteerApplicationsModal({
    project,
    onClose,
}: {
    project: Project;
    onClose: () => void;
}) {
    const router = useRouter();
    const [applications, setApplications] = useState<VolunteerApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [suggested, setSuggested] = useState<SuggestedVolunteer[]>([]);
    const [suggestedProfiles, setSuggestedProfiles] = useState<Record<string, BasicUser>>({});
    const [suggestedLoading, setSuggestedLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const res = await fetch(`/api/volunteer/${project.id}/applications`);
                if (res.ok && !cancelled) setApplications(await res.json());
            } catch { /* silent */ }
            finally { if (!cancelled) setLoading(false); }
        }
        load();
        return () => { cancelled = true; };
    }, [project.id]);

    useEffect(() => {
        let cancelled = false;
        async function loadSuggested() {
            try {
                const data = await getVolunteerRecommendations(project.id);
                const top = data.slice(0, 5);
                if (cancelled) return;
                setSuggested(top);
                if (top.length > 0) {
                    const profiles = await getUsersByIds(top.map(s => s.userId));
                    if (cancelled) return;
                    const map: Record<string, BasicUser> = {};
                    profiles.forEach(p => { map[p.id] = p; });
                    setSuggestedProfiles(map);
                }
            } catch { /* silent — AI service may be offline */ }
            finally { if (!cancelled) setSuggestedLoading(false); }
        }
        loadSuggested();
        return () => { cancelled = true; };
    }, [project.id]);

    async function respond(applicationId: string, action: 'ACCEPTED' | 'REJECTED', applicantAuth0Id: string) {
        setActionLoading(applicationId);
        try {
            const res = await fetch(`/api/volunteer/applications/${applicationId}/respond`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            if (res.ok) {
                setApplications(prev => prev.map(a =>
                    a.id === applicationId ? { ...a, status: action } : a
                ));
                if (action === 'ACCEPTED' && applicantAuth0Id) {
                    try {
                        await startConversation(applicantAuth0Id);
                    } catch { /* silent — conversation may already exist */ }
                }
            }
        } catch { /* silent */ }
        finally { setActionLoading(null); }
    }

    function handleChatWithVolunteer(auth0Id: string) {
        onClose();
        router.push(`/messages?with=${encodeURIComponent(auth0Id)}`);
    }

    const pending = applications.filter(a => a.status === 'PENDING');
    const decided = applications.filter(a => a.status !== 'PENDING');

    const statusStyle: Record<string, string> = {
        ACCEPTED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        REJECTED: "bg-red-50 text-red-600 border border-red-200",
        PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="font-bold text-slate-900">Volunteer List</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{project.title}</p>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100">
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {!suggestedLoading && suggested.length > 0 && (
                        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 space-y-2">
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                                <Sparkles size={11} /> AI Suggested Volunteers (Not Yet Applied)
                            </p>
                            <div className="space-y-1.5">
                                {suggested.map(s => {
                                    const profile = suggestedProfiles[s.userId];
                                    const name = profile?.fullName || profile?.username || `User ${s.userId.slice(0, 8)}…`;
                                    return (
                                        <div key={s.userId} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-indigo-100">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {profile?.profileImageUrl ? (
                                                        <Image src={profile.profileImageUrl} alt={name} width={28} height={28} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-indigo-700 font-bold text-[11px]">
                                                            {name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 truncate">{name}</p>
                                                    {profile?.username && (
                                                        <p className="text-[10px] text-slate-400 truncate">@{profile.username}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-[11px] font-bold text-indigo-600 shrink-0">
                                                {s.score}% match
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse bg-slate-50 rounded-xl p-4 h-20" />
                            ))}
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-10">
                            <Users size={32} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-slate-500 font-semibold">No applications yet</p>
                            <p className="text-slate-400 text-xs mt-1">Applications will appear here when volunteers apply</p>
                        </div>
                    ) : (
                        <>
                            {pending.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Pending Review ({pending.length})
                                    </p>
                                    {pending.map(app => (
                                        <div key={app.id} className="bg-slate-50 rounded-xl p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {app.applicantImage ? (
                                                        <Image src={app.applicantImage} alt={app.applicantName} width={40} height={40} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-indigo-700 font-bold text-sm">
                                                            {(app.applicantName || '?').charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900">{app.applicantName}</p>
                                                    <p className="text-[11px] text-slate-400">@{app.applicantUsername}</p>
                                                    {app.message && (
                                                        <p className="text-xs text-slate-600 mt-1.5 italic">&ldquo;{app.message}&rdquo;</p>
                                                    )}
                                                    <p className="text-[10px] text-slate-400 mt-1">
                                                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => respond(app.id, 'ACCEPTED', app.applicantAuth0Id)}
                                                    disabled={actionLoading === app.id}
                                                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                                                >
                                                    <CheckCircle size={12} />
                                                    {actionLoading === app.id ? 'Processing...' : 'Accept'}
                                                </button>
                                                <button
                                                    onClick={() => respond(app.id, 'REJECTED', app.applicantAuth0Id)}
                                                    disabled={actionLoading === app.id}
                                                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold py-2 rounded-xl text-xs transition-colors"
                                                >
                                                    <X size={12} />
                                                    {actionLoading === app.id ? 'Processing...' : 'Reject'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {decided.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Decided ({decided.length})
                                    </p>
                                    {decided.map(app => (
                                        <div key={app.id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                                    <span className="text-indigo-700 font-bold text-xs">
                                                        {(app.applicantName || '?').charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{app.applicantName}</p>
                                                    <p className="text-[11px] text-slate-400">@{app.applicantUsername}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[app.status] || 'bg-slate-100 text-slate-500'}`}>
                                                    {app.status}
                                                </span>
                                                {/* Bug 4 fix: chat icon on accepted rows */}
                                                {app.status === 'ACCEPTED' && app.applicantAuth0Id && (
                                                    <button
                                                        onClick={() => handleChatWithVolunteer(app.applicantAuth0Id)}
                                                        title="Message this volunteer"
                                                        className="h-7 w-7 flex items-center justify-center rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 transition-colors"
                                                    >
                                                        <MessageSquare size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function VolunteerButton({ projectId }: { projectId: string }) {
    const { user } = useAuth();
    const [applied, setApplied] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState("");
    const [checkDone, setCheckDone] = useState(false);

    useEffect(() => {
        if (!user) { setCheckDone(true); return; }
        fetch(`/api/volunteer/${projectId}`)
            .then(r => r.ok ? r.json() : { applied: false })
            .then(d => {
                setApplied(d.applied);
                setStatus(d.status || null);
            })
            .catch(() => { })
            .finally(() => setCheckDone(true));
    }, [projectId, user]);

    const handleApply = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/volunteer/${projectId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            const data = await res.json();
            if (res.ok) {
                setApplied(true);
                setStatus("PENDING");
                setShowModal(false);
            } else {
                alert(data.error || "Failed to apply");
            }
        } catch { alert("Failed to apply"); }
        finally { setLoading(false); }
    };

    if (!checkDone) return (
        <div className="flex-1 h-8 bg-slate-100 rounded-xl animate-pulse" />
    );

    if (applied && status) {
        const statusStyle: Record<string, string> = {
            PENDING: "bg-amber-50 border-amber-200 text-amber-700",
            ACCEPTED: "bg-emerald-50 border-emerald-200 text-emerald-700",
            REJECTED: "bg-red-50 border-red-200 text-red-600",
        };
        return (
            <div className={`flex-1 flex items-center justify-center gap-1.5 border font-bold py-2 rounded-xl text-xs ${statusStyle[status] || "bg-slate-50 border-slate-200 text-slate-500"}`}>
                <CheckCircle size={12} />
                {status === "PENDING" ? "Applied" : status === "ACCEPTED" ? "Accepted!" : "Not Selected"}
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => user ? setShowModal(true) : alert("Please sign in to volunteer")}
                className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition-colors"
            >
                <Users size={12} /> Volunteer
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-slate-900">Apply as Volunteer</h2>
                            <button onClick={() => setShowModal(false)} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100">
                                <X size={16} className="text-slate-400" />
                            </button>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Why do you want to volunteer? <span className="text-slate-400">(optional)</span>
                            </label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={4}
                                placeholder="Share your motivation and relevant skills..."
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm">
                                Cancel
                            </button>
                            <button onClick={handleApply} disabled={loading}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm">
                                {loading ? "Submitting..." : "Submit Application"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function EditProjectModal({
    project,
    onClose,
    onUpdated,
}: {
    project: Project;
    onClose: () => void;
    onUpdated: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        title: project.title || "",
        description: project.description || "",
        category: project.category || "",
        requiredSkills: Array.isArray(project.requiredSkills)
            ? project.requiredSkills.join(", ")
            : (project.requiredSkills || ""),
        tags: Array.isArray(project.tags)
            ? project.tags.join(", ")
            : (project.tags || ""),
        location: project.location || "",
        duration: project.duration || "",
        beneficiaryGroup: project.beneficiaryGroup || "",
        volunteerSlots: project.volunteerSlots?.toString() || "",
        priorityLevel: project.priorityLevel || "NORMAL",
        goalAmount: project.goalAmount?.toString() || "",
        startDate: project.startDate ? project.startDate.slice(0, 10) : "",
        endDate: project.endDate ? project.endDate.slice(0, 10) : "",
    });

    const handleSubmit = async () => {
        if (!form.title || !form.category) { setError("Title and category are required"); return; }
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    volunteerSlots: form.volunteerSlots ? parseInt(form.volunteerSlots) : null,
                    goalAmount: form.goalAmount ? parseInt(form.goalAmount) : null,
                    startDate: form.startDate || null,
                    endDate: form.endDate || null,
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to update"); }
            onUpdated();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update project");
        } finally { setLoading(false); }
    };

    const inputCls = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="font-bold text-slate-900">Edit Project</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{project.title}</p>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100">
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                            <AlertTriangle size={14} />{error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project Title *</label>
                            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                className={inputCls} placeholder="e.g. Clean Water Initiative" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category *</label>
                            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputCls}>
                                <option value="">Select category</option>
                                {CATEGORIES.filter(c => c.value !== "all").map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Priority Level</label>
                            <select value={form.priorityLevel} onChange={e => setForm(p => ({ ...p, priorityLevel: e.target.value }))} className={inputCls}>
                                <option value="LOW">Low</option>
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
                            <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                className={inputCls} placeholder="e.g. Kathmandu, Nepal" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Duration</label>
                            <input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                                className={inputCls} placeholder="e.g. 3 months" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Volunteer Slots</label>
                            <input type="number" value={form.volunteerSlots} onChange={e => setForm(p => ({ ...p, volunteerSlots: e.target.value }))}
                                className={inputCls} placeholder="e.g. 20" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Goal Amount (NPR)</label>
                            <input type="number" value={form.goalAmount} onChange={e => setForm(p => ({ ...p, goalAmount: e.target.value }))}
                                className={inputCls} placeholder="e.g. 500000" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Start Date</label>
                            <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">End Date</label>
                            <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Beneficiary Group</label>
                            <input value={form.beneficiaryGroup} onChange={e => setForm(p => ({ ...p, beneficiaryGroup: e.target.value }))}
                                className={inputCls} placeholder="e.g. Children, Women" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Required Skills</label>
                            <input value={form.requiredSkills} onChange={e => setForm(p => ({ ...p, requiredSkills: e.target.value }))}
                                className={inputCls} placeholder="Teaching, Medical (comma-separated)" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tags</label>
                            <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                                className={inputCls} placeholder="Education, Youth (comma-separated)" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                rows={4} className={`${inputCls} resize-none`}
                                placeholder="Describe your project's goals and impact..." />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose}
                            className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={loading}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProjectCard({
    project,
    currentUserNgoId,
    matchScore,
    onDonate,
    onManageVolunteers,
    onEdit,
}: {
    project: Project;
    currentUserNgoId?: string | null;
    matchScore?: number;
    onDonate: (p: Project) => void;
    onManageVolunteers: (p: Project) => void;
    onEdit: (p: Project) => void;
}) {
    const isOwner = currentUserNgoId === project.ngoId;
    const raised = project.raisedAmount || 0;
    const goal = project.goalAmount || 0;
    const goalReached = goal > 0 && raised >= goal;
    const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
    const gradient = CATEGORY_GRADIENT[project.category] || CATEGORY_GRADIENT.default;
    const spotsLeft = project.volunteerSlots
        ? project.volunteerSlots - (project.volunteersJoined || 0)
        : null;

    return (
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer">
            <div className={`h-28 bg-linear-to-br ${gradient} relative overflow-hidden`}>
                {project.imageUrl && (
                    <Image src={project.imageUrl} alt={project.title} fill
                        className="object-cover opacity-40" sizes="(max-width: 768px) 100vw, 33vw" />
                )}
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            {project.priorityLevel && project.priorityLevel !== "NORMAL" && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${PRIORITY_COLOR[project.priorityLevel]}`}>
                                    {project.priorityLevel === "URGENT" && <Flame size={9} />}
                                    {project.priorityLevel}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5">
                            {isOwner && (
                                <button
                                    onClick={e => { e.stopPropagation(); onEdit(project); }}
                                    title="Edit project"
                                    className="flex items-center justify-center h-6 w-6 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-lg transition-colors"
                                >
                                    <Pencil size={11} className="text-white" />
                                </button>
                            )}
                            <span className="text-[10px] font-bold text-white/80 bg-black/20 px-2 py-0.5 rounded-full">
                                {project.category}
                            </span>
                        </div>
                    </div>
                    {project.location && (
                        <div className="flex items-center gap-1 text-[11px] text-white/90">
                            <MapPin size={10} />{project.location}
                        </div>
                    )}
                </div>
                {matchScore !== undefined && (
                    <span className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-bold text-white bg-indigo-600/90 px-2 py-1 rounded-full">
                        <Sparkles size={10} /> {matchScore}% match
                    </span>
                )}
            </div>

            <div className="p-4 space-y-3">
                <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700">
                        {project.ngoName?.charAt(0) || "N"}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">{project.ngoName}</span>
                    {project.ngoVerified && <BadgeCheck size={12} className="text-indigo-500" />}
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
                    {project.title}
                </h3>

                {project.requiredSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {project.requiredSkills.slice(0, 3).map(s => (
                            <span key={s} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                {s}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    {project.duration && (
                        <span className="flex items-center gap-1"><Clock size={10} />{project.duration}</span>
                    )}
                    {spotsLeft !== null && (
                        <span className="flex items-center gap-1">
                            <Users size={10} />
                            {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
                        </span>
                    )}
                </div>

                {goal > 0 && (
                    <div>
                        <div className="h-1.5 rounded-full overflow-hidden bg-slate-100">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${goalReached ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] mt-1">
                            <span className="font-semibold text-slate-700">
                                NPR {raised.toLocaleString()}
                            </span>
                            {goalReached ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                    <CheckCircle size={10} /> Goal Achieved
                                </span>
                            ) : (
                                <span className="text-slate-400">
                                    of NPR {goal.toLocaleString()} · {project.donorCount || 0} donors
                                </span>
                            )}
                        </div>
                        {goalReached && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                of NPR {goal.toLocaleString()} · {project.donorCount || 0} donors
                            </p>
                        )}
                    </div>
                )}

                <div className="flex gap-2 pt-1">
                    {goal > 0 && (
                        <button
                            onClick={() => onDonate(project)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2 rounded-xl text-xs transition-colors border border-rose-100"
                        >
                            <Heart size={12} /> Donate
                        </button>
                    )}
                    {isOwner ? (
                        <button
                            onClick={() => onManageVolunteers(project)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 rounded-xl text-xs transition-colors border border-indigo-100"
                        >
                            <Users size={12} /> Volunteer List
                        </button>
                    ) : (
                        <VolunteerButton projectId={project.id} />
                    )}
                </div>
            </div>
        </article>
    );
}

function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        title: "", description: "", category: "", requiredSkills: "",
        tags: "", location: "", duration: "", beneficiaryGroup: "",
        volunteerSlots: "", priorityLevel: "NORMAL", goalAmount: "",
        startDate: "", endDate: "",
    });

    const handleSubmit = async () => {
        if (!form.title || !form.category) { setError("Title and category are required"); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    volunteerSlots: form.volunteerSlots ? parseInt(form.volunteerSlots) : null,
                    goalAmount: form.goalAmount ? parseInt(form.goalAmount) : null,
                    startDate: form.startDate || null,
                    endDate: form.endDate || null,
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
            onCreated();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create project");
        } finally { setLoading(false); }
    };

    const inputCls = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 className="font-bold text-slate-900">Create New Project</h2>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100">
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                            <AlertTriangle size={14} />{error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project Title *</label>
                            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                className={inputCls} placeholder="e.g. Clean Water Initiative" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category *</label>
                            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputCls}>
                                <option value="">Select category</option>
                                {CATEGORIES.filter(c => c.value !== "all").map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Priority Level</label>
                            <select value={form.priorityLevel} onChange={e => setForm(p => ({ ...p, priorityLevel: e.target.value }))} className={inputCls}>
                                <option value="LOW">Low</option>
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
                            <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                className={inputCls} placeholder="e.g. Kathmandu, Nepal" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Duration</label>
                            <input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                                className={inputCls} placeholder="e.g. 3 months" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Volunteer Slots</label>
                            <input type="number" value={form.volunteerSlots} onChange={e => setForm(p => ({ ...p, volunteerSlots: e.target.value }))}
                                className={inputCls} placeholder="e.g. 20" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Goal Amount (NPR)</label>
                            <input type="number" value={form.goalAmount} onChange={e => setForm(p => ({ ...p, goalAmount: e.target.value }))}
                                className={inputCls} placeholder="e.g. 500000" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Start Date</label>
                            <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">End Date</label>
                            <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Beneficiary Group</label>
                            <input value={form.beneficiaryGroup} onChange={e => setForm(p => ({ ...p, beneficiaryGroup: e.target.value }))}
                                className={inputCls} placeholder="e.g. Children, Women" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Required Skills</label>
                            <input value={form.requiredSkills} onChange={e => setForm(p => ({ ...p, requiredSkills: e.target.value }))}
                                className={inputCls} placeholder="Teaching, Medical (comma-separated)" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tags</label>
                            <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                                className={inputCls} placeholder="Education, Youth (comma-separated)" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                rows={4} className={`${inputCls} resize-none`}
                                placeholder="Describe your project's goals and impact..." />
                        </div>
                    </div>
                    <button onClick={handleSubmit} disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                        {loading ? "Creating..." : "Create Project"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ProjectsContent() {
    const { dbUser } = useAuth();
    const searchParams = useSearchParams();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [donateProject, setDonateProject] = useState<Project | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [donationSuccess, setDonationSuccess] = useState(false);
    const [volunteersProject, setVolunteersProject] = useState<Project | null>(null);
    const [editProject, setEditProject] = useState<Project | null>(null);
    const [matchScores, setMatchScores] = useState<Record<string, number>>({});
    const [showRecommended, setShowRecommended] = useState(false);
    const [showMyProjects, setShowMyProjects] = useState(false);

    const isNgo = dbUser?.role === "NGO";

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const data = (showMyProjects && isNgo)
                ? (await getMyProjects()).filter((p: Project) => p.status !== 'CANCELLED')
                : await getProjects({
                    category: activeCategory === "all" ? undefined : activeCategory,
                    search: searchQuery || undefined,
                });
            setProjects(data);
        } catch { setProjects([]); }
        finally { setLoading(false); }
    }, [activeCategory, searchQuery, showMyProjects, isNgo]);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    useEffect(() => {
        if (showMyProjects) {
            setActiveCategory("all");
            setSearchQuery("");
        }
    }, [showMyProjects]);

    useEffect(() => {
        if (!dbUser || dbUser.role !== "USER") return;
        let cancelled = false;
        getProjectRecommendations()
            .then(data => {
                if (cancelled) return;
                const map: Record<string, number> = {};
                data.forEach(d => { map[d.projectId] = d.matchScore; });
                setMatchScores(map);
            })
            .catch(() => { });
        return () => { cancelled = true; };
    }, [dbUser]);

    useEffect(() => {
        const donation = searchParams.get("donation");
        const oid = searchParams.get("oid");
        const refId = searchParams.get("refId");

        if (donation === "success" && oid) {
            const storedAmt = sessionStorage.getItem("esewa_amt") || "0";
            const storedPid = sessionStorage.getItem("esewa_pid") || oid;
            const storedProjectId = sessionStorage.getItem("esewa_project_id");

            fetch("/api/payment/esewa/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amt: storedAmt,
                    rid: refId || oid,
                    pid: storedPid,
                    scd: process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE || "EPAYTEST",
                }),
            })
                .then(r => r.json())
                .then(async data => {
                    if (data.verified) {
                        if (storedProjectId) {
                            await fetch("/api/donations/confirm", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    projectId: storedProjectId,
                                    amount: parseInt(storedAmt),
                                    paymentRef: refId || oid,
                                    paymentMethod: "ESEWA",
                                }),
                            });
                        }
                        setDonationSuccess(true);
                        if (storedProjectId) {
                            setProjects(prev => prev.map(p =>
                                p.id === storedProjectId
                                    ? { ...p, raisedAmount: p.raisedAmount + parseInt(storedAmt), donorCount: p.donorCount + 1 }
                                    : p
                            ));
                        }
                        sessionStorage.removeItem("esewa_pid");
                        sessionStorage.removeItem("esewa_amt");
                        sessionStorage.removeItem("esewa_purpose");
                        sessionStorage.removeItem("esewa_project_id");
                    }
                })
                .catch(() => { });
        } else if (donation === "success" && !oid) {
            setDonationSuccess(true);
        }
    }, [searchParams]);

    const handleDonated = useCallback((projectId: string, amount: number) => {
        setProjects(prev => prev.map(p =>
            p.id === projectId
                ? { ...p, raisedAmount: (p.raisedAmount || 0) + amount, donorCount: (p.donorCount || 0) + 1 }
                : p
        ));
        setDonationSuccess(true);
        setDonateProject(null);
    }, []);

    const displayedProjects = showRecommended
        ? [...projects]
            .filter(p => (matchScores[p.id] ?? 0) > 0)
            .sort((a, b) => (matchScores[b.id] ?? 0) - (matchScores[a.id] ?? 0))
        : projects;

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            {donationSuccess && (
                <div className="bg-emerald-600 text-white text-sm font-semibold text-center py-2.5 flex items-center justify-center gap-2">
                    <Heart size={14} /> Thank you for your donation!
                    <button onClick={() => setDonationSuccess(false)} className="ml-2 opacity-70 hover:opacity-100">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <aside className="hidden md:flex md:flex-col md:col-span-3 sticky top-20 self-start space-y-4 max-h-[calc(100vh-5rem)]">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2 pb-2">Categories</p>
                            {CATEGORIES.map(({ label, value, Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => {
                                        setActiveCategory(value);
                                        if (showMyProjects) setShowMyProjects(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-left ${activeCategory === value && !showMyProjects ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-600 hover:bg-slate-50"}`}
                                >
                                    {Icon
                                        ? <Icon size={15} className={activeCategory === value && !showMyProjects ? "text-indigo-600" : "text-slate-400"} />
                                        : <div className="w-3.5" />}
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp size={14} className="text-indigo-600" />
                                <h3 className="text-sm font-bold text-slate-800">Stats</h3>
                            </div>
                            {[
                                { label: "Active Projects", value: projects.length.toString() },
                                { label: "Total Raised", value: `NPR ${projects.reduce((s, p) => s + (p.raisedAmount || 0), 0).toLocaleString()}` },
                                { label: "Volunteer Slots", value: projects.reduce((s, p) => s + (p.volunteerSlots || 0), 0).toLocaleString() },
                            ].map(s => (
                                <div key={s.label} className="flex justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                                    <span className="text-slate-500">{s.label}</span>
                                    <span className="font-bold text-slate-800">{s.value}</span>
                                </div>
                            ))}
                        </div>

                        <SiteFooter />
                    </aside>

                    <main className="col-span-1 md:col-span-9 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Projects</h1>
                                <p className="text-sm text-slate-500">
                                    {loading
                                        ? "Loading..."
                                        : showMyProjects
                                            ? `${displayedProjects.length} of your project${displayedProjects.length !== 1 ? "s" : ""}`
                                            : `${displayedProjects.length} project${displayedProjects.length !== 1 ? "s" : ""} found`}
                                </p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {isNgo && (
                                    <button
                                        onClick={() => setShowMyProjects(p => !p)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${showMyProjects
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                            }`}
                                    >
                                        <FolderOpen size={13} /> {showMyProjects ? 'Back' : 'My Projects'}
                                    </button>
                                )}
                                {dbUser?.role === "USER" && Object.keys(matchScores).length > 0 && (
                                    <button
                                        onClick={() => setShowRecommended(p => !p)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${showRecommended
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                            }`}
                                    >
                                        <Sparkles size={13} /> Recommended for You
                                    </button>
                                )}
                                {!showMyProjects && (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input type="text" placeholder="Search projects..."
                                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                            className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                                    </div>
                                )}
                                {isNgo && (
                                    <button onClick={() => setShowCreate(true)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors">
                                        <Plus size={14} /> New
                                    </button>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
                                        <div className="h-28 bg-slate-200" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                                            <div className="h-4 bg-slate-200 rounded w-3/4" />
                                            <div className="h-3 bg-slate-200 rounded w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : displayedProjects.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {displayedProjects.map(p => (
                                    <ProjectCard
                                        key={p.id}
                                        project={p}
                                        currentUserNgoId={dbUser?.id}
                                        matchScore={showRecommended ? matchScores[p.id] : undefined}
                                        onDonate={setDonateProject}
                                        onManageVolunteers={setVolunteersProject}
                                        onEdit={setEditProject}
                                    />
                                ))}
                            </div>
                        ) : showMyProjects ? (
                            <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200">
                                <FolderOpen size={32} className="mx-auto mb-3 opacity-40" />
                                <p className="font-semibold">No projects yet</p>
                                <p className="text-sm mt-1">Create your first project to get started</p>
                            </div>
                        ) : showRecommended ? (
                            <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200">
                                <Sparkles size={32} className="mx-auto mb-3 opacity-40" />
                                <p className="font-semibold">No strong matches yet</p>
                                <p className="text-sm mt-1">Add more skills and interests to your profile for better recommendations</p>
                            </div>
                        ) : (
                            <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200">
                                <Target size={32} className="mx-auto mb-3 opacity-40" />
                                <p className="font-semibold">No projects found</p>
                                <p className="text-sm mt-1">Try a different category or search term</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {donateProject && (
                <DonationModal
                    project={{ id: donateProject.id, title: donateProject.title, ngoName: donateProject.ngoName }}
                    onClose={() => setDonateProject(null)}
                    onDonated={(amount) => handleDonated(donateProject.id, amount)}
                />
            )}
            {showCreate && (
                <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={fetchProjects} />
            )}
            {volunteersProject && (
                <VolunteerApplicationsModal
                    project={volunteersProject}
                    onClose={() => setVolunteersProject(null)}
                />
            )}

            {editProject && (
                <EditProjectModal
                    project={editProject}
                    onClose={() => setEditProject(null)}
                    onUpdated={() => {
                        setEditProject(null);
                        fetchProjects();
                    }}
                />
            )}
        </div>
    );
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#EEF3F8] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
            </div>
        }>
            <ProjectsContent />
        </Suspense>
    );
}