"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getResources, getMyResources, requestResource } from '@/lib/api';
import Image from 'next/image';
import {
    Search, Plus, Package, MapPin, Calendar, CheckCircle,
    AlertTriangle, X, Layers, Car, Monitor,
    Sofa, HeartPulse, Building, Wrench, Tag
} from 'lucide-react';
import SiteFooter from '@/components/ui/SiteFooter';

const CATEGORIES = [
    { label: "All Types", value: "all", Icon: Layers },
    { label: "Vehicle", value: "Vehicle", Icon: Car },
    { label: "Electronics", value: "Electronics", Icon: Monitor },
    { label: "Furniture", value: "Furniture", Icon: Sofa },
    { label: "Medical", value: "Medical", Icon: HeartPulse },
    { label: "Space", value: "Space", Icon: Building },
    { label: "Equipment", value: "Equipment", Icon: Wrench },
];

const STATUS_OPTIONS = ["all", "AVAILABLE", "REQUESTED", "SHARED"];

const STATUS_STYLE: Record<string, string> = {
    AVAILABLE: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    REQUESTED: "bg-amber-100 text-amber-700 border border-amber-200",
    SHARED: "bg-violet-100 text-violet-700 border border-violet-200",
    UNAVAILABLE: "bg-slate-100 text-slate-500 border border-slate-200",
};

const SHARING_STYLE: Record<string, string> = {
    BORROW: "bg-blue-50 text-blue-600",
    DONATE: "bg-rose-50 text-rose-600",
    BOTH: "bg-purple-50 text-purple-600",
};

const CONDITION_COLOR: Record<string, string> = {
    New: "text-emerald-600",
    Good: "text-blue-600",
    Fair: "text-amber-600",
};

interface Resource {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    location: string;
    quantity: number;
    condition: string;
    sharingType: string;
    imageUrl: string;
    availableFrom: string;
    availableUntil: string;
    status: string;
    ownerName: string;
    ownerUsername: string;
    ownerVerified: boolean;
    ownerId: string;
    createdAt: string;
}

function ResourceCard({ resource, currentUserId, onRequest }: {
    resource: Resource;
    currentUserId?: string;
    onRequest: (r: Resource) => void;
}) {
    const isOwner = currentUserId === resource.ownerId;

    return (
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="h-36 bg-linear-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                {resource.imageUrl ? (
                    <Image
                        src={resource.imageUrl}
                        alt={resource.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-slate-300" />
                    </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[resource.status]}`}>
                        {resource.status}
                    </span>
                    {resource.sharingType && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SHARING_STYLE[resource.sharingType] || "bg-slate-100 text-slate-500"}`}>
                            {resource.sharingType}
                        </span>
                    )}
                </div>
                <div className="absolute bottom-2 left-2">
                    <span className="text-[10px] font-bold bg-white/80 text-slate-700 px-2 py-0.5 rounded-full">
                        {resource.category}
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-2.5">
                <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{resource.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{resource.ownerName}</p>
                </div>

                {resource.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{resource.description}</p>
                )}

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                    {resource.location && (
                        <span className="flex items-center gap-1"><MapPin size={10} />{resource.location}</span>
                    )}
                    {resource.quantity && (
                        <span className="flex items-center gap-1"><Layers size={10} />Qty: {resource.quantity}</span>
                    )}
                    {resource.condition && (
                        <span className={`font-semibold ${CONDITION_COLOR[resource.condition] || "text-slate-500"}`}>
                            {resource.condition}
                        </span>
                    )}
                </div>

                {(resource.availableFrom || resource.availableUntil) && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Calendar size={10} />
                        {resource.availableFrom && new Date(resource.availableFrom).toLocaleDateString()}
                        {resource.availableFrom && resource.availableUntil && " — "}
                        {resource.availableUntil && new Date(resource.availableUntil).toLocaleDateString()}
                    </div>
                )}

                {resource.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map(t => (
                            <span key={t} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100">
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                {!isOwner && resource.status === "AVAILABLE" && (
                    <button onClick={() => onRequest(resource)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition-colors mt-1">
                        Request Resource
                    </button>
                )}
                {isOwner && (
                    <div className="text-[11px] text-slate-400 text-center pt-1 font-medium">Your resource</div>
                )}
                {!isOwner && resource.status !== "AVAILABLE" && (
                    <div className={`text-[11px] text-center pt-1 font-semibold ${resource.status === "SHARED" ? "text-violet-500" : "text-amber-500"}`}>
                        {resource.status === "SHARED" ? "Currently shared" : "Request pending"}
                    </div>
                )}
            </div>
        </article>
    );
}

function CreateResourceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "", description: "", category: "", tags: "",
        location: "", quantity: "", condition: "Good",
        sharingType: "BORROW", imageUrl: "",
        availableFrom: "", availableUntil: "",
    });

    const handleSubmit = async () => {
        if (!form.name || !form.category) { setError("Name and category are required"); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/resources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    quantity: form.quantity ? parseInt(form.quantity) : null,
                    availableFrom: form.availableFrom || null,
                    availableUntil: form.availableUntil || null,
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
            onCreated();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create resource");
        } finally { setLoading(false); }
    };

    const inputCls = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 className="font-bold text-slate-900">Add Resource</h2>
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
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Resource Name *</label>
                            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className={inputCls} placeholder="e.g. Industrial Projector" />
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
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sharing Type</label>
                            <select value={form.sharingType} onChange={e => setForm(p => ({ ...p, sharingType: e.target.value }))} className={inputCls}>
                                <option value="BORROW">Borrow</option>
                                <option value="DONATE">Donate</option>
                                <option value="BOTH">Both</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Condition</label>
                            <select value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))} className={inputCls}>
                                <option value="New">New</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quantity</label>
                            <input type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                                className={inputCls} placeholder="e.g. 2" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
                            <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                className={inputCls} placeholder="e.g. Kathmandu" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Available From</label>
                            <input type="date" value={form.availableFrom} onChange={e => setForm(p => ({ ...p, availableFrom: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Available Until</label>
                            <input type="date" value={form.availableUntil} onChange={e => setForm(p => ({ ...p, availableUntil: e.target.value }))} className={inputCls} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tags</label>
                            <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                                className={inputCls} placeholder="Training, Workshop (comma-separated)" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                rows={3} className={`${inputCls} resize-none`} placeholder="Describe the resource..." />
                        </div>
                    </div>
                    <button onClick={handleSubmit} disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm">
                        {loading ? "Adding..." : "Add Resource"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function RequestModal({ resource, onClose, onSuccess }: {
    resource: Resource; onClose: () => void; onSuccess: () => void;
}) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await requestResource(resource.id, message);
            onSuccess();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Request failed");
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-slate-900">Request Resource</h2>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100">
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                    <p className="font-semibold text-sm text-slate-900">{resource.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">from {resource.ownerName}</p>
                </div>
                {error && (
                    <div className="flex items-center gap-2 text-red-500 text-xs">
                        <AlertTriangle size={13} />{error}
                    </div>
                )}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message (optional)</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)}
                        rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none"
                        placeholder="Describe how you plan to use this resource..." />
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose}
                        className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm">
                        {loading ? "Sending..." : "Send Request"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ResourcesPage() {
    const { dbUser } = useAuth();
    const [resources, setResources] = useState<Resource[]>([]);
    const [myResources, setMyResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [requestResource_, setRequestResource] = useState<Resource | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);

    const fetchResources = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getResources({
                category: categoryFilter === "all" ? undefined : categoryFilter,
                status: statusFilter === "all" ? undefined : statusFilter,
                search: search || undefined,
            });
            setResources(data);
        } catch { setResources([]); }
        finally { setLoading(false); }
    }, [categoryFilter, statusFilter, search]);

    const fetchMyResources = useCallback(async () => {
        if (!dbUser) return;
        try { setMyResources(await getMyResources()); }
        catch { setMyResources([]); }
    }, [dbUser]);

    useEffect(() => { fetchResources(); }, [fetchResources]);
    useEffect(() => { fetchMyResources(); }, [fetchMyResources]);

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            {requestSuccess && (
                <div className="bg-emerald-600 text-white text-sm font-semibold text-center py-2.5 flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> Resource request sent successfully!
                    <button onClick={() => setRequestSuccess(false)} className="ml-2 opacity-70 hover:opacity-100">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Shared Resources</h1>
                        <p className="text-sm text-slate-500 mt-1">Discover and share resources with the NConnect community</p>
                    </div>
                    {dbUser && (
                        <button onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shrink-0">
                            <Plus size={16} /> Add Resource
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <main className="lg:col-span-8 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Search resources..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(({ label, value, Icon }) => (
                                    <button key={value} onClick={() => setCategoryFilter(value)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${categoryFilter === value ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                                        <Icon size={11} />{label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                {STATUS_OPTIONS.map(s => (
                                    <button key={s} onClick={() => setStatusFilter(s)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${statusFilter === s ? "bg-slate-800 text-white border-slate-800" : "border-slate-200 text-slate-500 hover:border-slate-400"}`}>
                                        {s === "all" ? "All Status" : s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                                        <div className="h-36 bg-slate-200" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-slate-200 rounded w-3/4" />
                                            <div className="h-3 bg-slate-200 rounded w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : resources.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {resources.map(r => (
                                    <ResourceCard
                                        key={r.id}
                                        resource={r}
                                        currentUserId={dbUser?.id}
                                        onRequest={setRequestResource}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200">
                                <Package size={32} className="mx-auto mb-3 opacity-40" />
                                <p className="font-semibold">No resources found</p>
                                <p className="text-sm mt-1">Try adjusting your filters</p>
                            </div>
                        )}
                    </main>

                    <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20 self-start">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <h2 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                                <Tag size={14} className="text-indigo-500" /> My Resources
                            </h2>
                            {myResources.length > 0 ? (
                                <div className="space-y-3">
                                    {myResources.slice(0, 4).map(r => (
                                        <div key={r.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{r.name}</p>
                                                <p className="text-[11px] text-slate-400">{r.category}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[r.status]}`}>
                                                {r.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-3">
                                    {dbUser ? "You haven't added any resources yet." : "Sign in to manage your resources."}
                                </p>
                            )}
                            {dbUser && (
                                <button onClick={() => setShowCreate(true)}
                                    className="w-full mt-3 border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5">
                                    <Plus size={12} /> Add New Resource
                                </button>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <h2 className="font-bold text-sm text-slate-900 mb-3">Resource Stats</h2>
                            {[
                                { label: "Total Listed", value: resources.length },
                                { label: "Available", value: resources.filter(r => r.status === "AVAILABLE").length },
                                { label: "Currently Shared", value: resources.filter(r => r.status === "SHARED").length },
                            ].map(s => (
                                <div key={s.label} className="flex justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                                    <span className="text-slate-500">{s.label}</span>
                                    <span className="font-bold text-slate-800">{s.value}</span>
                                </div>
                            ))}
                        </div>

                        <SiteFooter />
                    </aside>
                </div>
            </div>

            {requestResource_ && (
                <RequestModal
                    resource={requestResource_}
                    onClose={() => setRequestResource(null)}
                    onSuccess={() => { setRequestSuccess(true); fetchResources(); fetchMyResources(); }}
                />
            )}
            {showCreate && (
                <CreateResourceModal
                    onClose={() => setShowCreate(false)}
                    onCreated={() => { fetchResources(); fetchMyResources(); }}
                />
            )}
        </div>
    );
}