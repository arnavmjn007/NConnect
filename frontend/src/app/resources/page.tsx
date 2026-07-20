"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getResources, getMyResources, getMyResourceRequests, requestResource } from '@/lib/api';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';
import {
    Search, Plus, Package, MapPin, Calendar, CheckCircle,
    AlertTriangle, X, Layers, Car, Monitor,
    Sofa, HeartPulse, Building, Wrench, Tag,
    HandHelping, ArrowRight, Flame, MessageSquare,
    Clock, XCircle, Pencil, Trash2, ImagePlus
} from 'lucide-react';
import SiteFooter from '@/components/ui/SiteFooter';

const CATEGORIES = [
    { label: "All", value: "all", Icon: Layers },
    { label: "Vehicle", value: "Vehicle", Icon: Car },
    { label: "Electronics", value: "Electronics", Icon: Monitor },
    { label: "Furniture", value: "Furniture", Icon: Sofa },
    { label: "Medical", value: "Medical", Icon: HeartPulse },
    { label: "Space", value: "Space", Icon: Building },
    { label: "Equipment", value: "Equipment", Icon: Wrench },
];

const STATUS_STYLE: Record<string, string> = {
    AVAILABLE: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    REQUESTED: "bg-amber-100 text-amber-700 border border-amber-200",
    SHARED: "bg-violet-100 text-violet-700 border border-violet-200",
    UNAVAILABLE: "bg-slate-100 text-slate-500 border border-slate-200",
};

const URGENCY_STYLE: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700 border border-red-200",
    MEDIUM: "bg-amber-100 text-amber-700 border border-amber-200",
    LOW: "bg-slate-100 text-slate-500 border border-slate-200",
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

const MY_REQUEST_STATUS_STYLE: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
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
    resourceType: string;
    urgency: string;
}

interface MyRequest {
    id: string;
    resourceId: string;
    resourceName: string;
    resourceCategory: string;
    status: string;
    createdAt: string;
}

interface IncomingRequest {
    id: string;
    resourceId: string;
    resourceName: string;
    resourceCategory: string;
    requesterId: string;
    requesterName: string;
    requesterUsername: string;
    message: string | null;
    status: string;
    createdAt: string;
}

function ResourceCard({ resource, currentUserId, onRequest, onEdit, onDelete, deleteLoading }: {
    resource: Resource;
    currentUserId?: string;
    onRequest: (r: Resource) => void;
    onEdit: (r: Resource) => void;
    onDelete: (id: string) => void;
    deleteLoading: string | null;
}) {
    const isOwner = currentUserId === resource.ownerId;
    const isOffer = resource.resourceType !== 'REQUEST';
    const isNeed = resource.resourceType === 'REQUEST';

    return (
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
            <div className="h-36 bg-linear-to-br from-slate-100 to-slate-200 relative overflow-hidden shrink-0">
                {resource.imageUrl ? (
                    <Image src={resource.imageUrl} alt={resource.name} fill
                        className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isNeed ? 'bg-orange-50' : 'bg-slate-50'}`}>
                        {isNeed
                            ? <HandHelping size={32} className="text-orange-300" />
                            : <Package size={32} className="text-slate-300" />}
                    </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {isOffer && (
                        <>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[resource.status]}`}>
                                {resource.status}
                            </span>
                            {resource.sharingType && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SHARING_STYLE[resource.sharingType] || "bg-slate-100 text-slate-500"}`}>
                                    {resource.sharingType}
                                </span>
                            )}
                        </>
                    )}
                    {isNeed && resource.urgency && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${URGENCY_STYLE[resource.urgency] || URGENCY_STYLE.LOW}`}>
                            {resource.urgency === 'HIGH' && <Flame size={9} />}
                            {resource.urgency}
                        </span>
                    )}
                </div>
                <div className="absolute bottom-2 left-2 flex gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isNeed ? 'bg-orange-500 text-white' : 'bg-white/80 text-slate-700'}`}>
                        {isNeed ? 'NEEDED' : 'AVAILABLE'}
                    </span>
                    <span className="text-[10px] font-bold bg-white/80 text-slate-700 px-2 py-0.5 rounded-full">
                        {resource.category}
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-2.5 flex flex-col flex-1">
                <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{resource.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                        {resource.ownerName ?? resource.ownerUsername}
                        {resource.ownerVerified && <span className="ml-1 text-blue-500">✓</span>}
                    </p>
                </div>
                {resource.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{resource.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                    {resource.location && (
                        <span className="flex items-center gap-1"><MapPin size={10} />{resource.location}</span>
                    )}
                    {resource.quantity && (
                        <span className="flex items-center gap-1">
                            <Layers size={10} />{isNeed ? `Need: ${resource.quantity}` : `Qty: ${resource.quantity}`}
                        </span>
                    )}
                    {resource.condition && isOffer && (
                        <span className={`font-semibold ${CONDITION_COLOR[resource.condition] || "text-slate-500"}`}>
                            {resource.condition}
                        </span>
                    )}
                </div>
                {isOffer && (resource.availableFrom || resource.availableUntil) && (
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
                            <span key={t} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100">{t}</span>
                        ))}
                    </div>
                )}
                <div className="mt-auto pt-2">
                    {isOwner ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => onEdit(resource)}
                                className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2 rounded-xl text-xs transition-colors"
                            >
                                <Pencil size={11} /> Edit
                            </button>
                            <button
                                onClick={() => onDelete(resource.id)}
                                disabled={deleteLoading === resource.id}
                                className="flex-1 flex items-center justify-center gap-1.5 border border-red-100 hover:bg-red-50 text-red-500 font-bold py-2 rounded-xl text-xs transition-colors disabled:opacity-40"
                            >
                                {deleteLoading === resource.id ? (
                                    <span className="flex items-center gap-1"><Trash2 size={11} /> Deleting...</span>
                                ) : (
                                    <span className="flex items-center gap-1"><Trash2 size={11} /> Delete</span>
                                )}
                            </button>
                        </div>
                    ) : isOffer && resource.status === 'AVAILABLE' ? (
                        <button onClick={() => onRequest(resource)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition-colors">
                            Request Resource
                        </button>
                    ) : isNeed ? (
                        <button onClick={() => onRequest(resource)}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-xs transition-colors">
                            Offer Help
                        </button>
                    ) : (
                        <div className={`text-[11px] text-center font-semibold ${resource.status === 'SHARED' ? 'text-violet-500' : 'text-amber-500'}`}>
                            {resource.status === 'SHARED' ? 'Currently shared' : 'Request pending'}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

function EditResourceModal({ resource, onClose, onUpdated }: {
    resource: Resource;
    onClose: () => void;
    onUpdated: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const isNeed = resource.resourceType === 'REQUEST';
    const [form, setForm] = useState({
        name: resource.name || "",
        description: resource.description || "",
        category: resource.category || "",
        tags: resource.tags?.join(", ") || "",
        location: resource.location || "",
        quantity: resource.quantity?.toString() || "",
        condition: resource.condition || "Good",
        sharingType: resource.sharingType || "BORROW",
        imageUrl: resource.imageUrl || "",
        availableFrom: resource.availableFrom ? resource.availableFrom.slice(0, 10) : "",
        availableUntil: resource.availableUntil ? resource.availableUntil.slice(0, 10) : "",
        urgency: resource.urgency || "MEDIUM",
    });

    const inputCls = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10";

    const handleSubmit = async () => {
        if (!form.name || !form.category) { setError("Name and category are required"); return; }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/resources/${resource.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    resourceType: resource.resourceType,
                    quantity: form.quantity ? parseInt(form.quantity) : null,
                    availableFrom: form.availableFrom || null,
                    availableUntil: form.availableUntil || null,
                    urgency: isNeed ? form.urgency : null,
                    sharingType: !isNeed ? form.sharingType : null,
                    condition: !isNeed ? form.condition : null,
                }),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Failed to update");
            }
            onUpdated();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update resource");
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="font-bold text-slate-900">Edit Resource</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{resource.name}</p>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100">
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${!isNeed ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'}`}>
                        {!isNeed ? <Package size={13} /> : <HandHelping size={13} />}
                        {!isNeed ? 'Resource Offer' : 'Resource Request'}
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                            <AlertTriangle size={14} />{error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Photo</label>
                        <div className="flex items-center gap-3">
                            <div className="h-20 w-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 relative">
                                {form.imageUrl ? (
                                    <Image src={form.imageUrl} alt="Resource" fill className="object-cover" sizes="80px" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImagePlus size={20} className="text-slate-300" />
                                    </div>
                                )}
                            </div>
                            <CldUploadWidget
                                uploadPreset="nconnect_posts"
                                onSuccess={(result) => {
                                    if (
                                        result.event === 'success' &&
                                        typeof result.info === 'object' &&
                                        result.info &&
                                        'secure_url' in result.info
                                    ) {
                                        setForm(p => ({ ...p, imageUrl: (result.info as { secure_url: string }).secure_url }));
                                    }
                                }}
                            >
                                {({ open: openWidget }) => (
                                    <button
                                        type="button"
                                        onClick={() => openWidget()}
                                        className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-xl text-xs font-semibold text-slate-600 transition-all"
                                    >
                                        <ImagePlus size={13} /> {form.imageUrl ? "Change Photo" : "Add Photo"}
                                    </button>
                                )}
                            </CldUploadWidget>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Name *</label>
                            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category *</label>
                            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputCls}>
                                {CATEGORIES.filter(c => c.value !== "all").map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        {!isNeed ? (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sharing Type</label>
                                <select value={form.sharingType} onChange={e => setForm(p => ({ ...p, sharingType: e.target.value }))} className={inputCls}>
                                    <option value="DONATE">Donate</option>
                                    <option value="BORROW">Lend / Borrow</option>
                                    <option value="BOTH">Both</option>
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Urgency</label>
                                <select value={form.urgency} onChange={e => setForm(p => ({ ...p, urgency: e.target.value }))} className={inputCls}>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High — Urgent</option>
                                </select>
                            </div>
                        )}
                        {!isNeed && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Condition</label>
                                <select value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))} className={inputCls}>
                                    <option value="New">New</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quantity</label>
                            <input type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                                className={inputCls} />
                        </div>
                        <div className={!isNeed ? '' : 'sm:col-span-2'}>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
                            <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                className={inputCls} />
                        </div>
                        {!isNeed && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Available From</label>
                                    <input type="date" value={form.availableFrom} onChange={e => setForm(p => ({ ...p, availableFrom: e.target.value }))} className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Available Until</label>
                                    <input type="date" value={form.availableUntil} onChange={e => setForm(p => ({ ...p, availableUntil: e.target.value }))} className={inputCls} />
                                </div>
                            </>
                        )}
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tags</label>
                            <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                                className={inputCls} placeholder="comma-separated" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                rows={3} className={`${inputCls} resize-none`} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose}
                            className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm">
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

function AddResourceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [step, setStep] = useState<'pick' | 'form'>('pick');
    const [resourceType, setResourceType] = useState<'OFFER' | 'REQUEST'>('OFFER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "", description: "", category: "", tags: "",
        location: "", quantity: "", condition: "Good",
        sharingType: "BORROW", imageUrl: "",
        availableFrom: "", availableUntil: "",
        urgency: "MEDIUM",
    });

    const inputCls = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10";

    const handleSubmit = async () => {
        if (!form.name || !form.category) { setError("Name and category are required"); return; }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/resources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    resourceType,
                    quantity: form.quantity ? parseInt(form.quantity) : null,
                    availableFrom: form.availableFrom || null,
                    availableUntil: form.availableUntil || null,
                    urgency: resourceType === 'REQUEST' ? form.urgency : null,
                    sharingType: resourceType === 'OFFER' ? form.sharingType : null,
                    condition: resourceType === 'OFFER' ? form.condition : null,
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
            onCreated();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create resource");
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 className="font-bold text-slate-900">
                        {step === 'pick' ? 'What would you like to create?' : resourceType === 'OFFER' ? 'Resource Offer' : 'Resource Request'}
                    </h2>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100">
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>

                {step === 'pick' ? (
                    <div className="p-5 space-y-3">
                        <p className="text-sm text-slate-500">Choose the type of resource post you want to create.</p>
                        <button onClick={() => { setResourceType('OFFER'); setStep('form'); }}
                            className="w-full flex items-start gap-4 p-4 border-2 border-slate-200 hover:border-indigo-400 rounded-2xl transition-all text-left group">
                            <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-200 transition-colors">
                                <Package size={18} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Resource Offer</p>
                                <p className="text-xs text-slate-500 mt-0.5">I have something to share — laptops, projector, office chairs, space, equipment...</p>
                            </div>
                        </button>
                        <button onClick={() => { setResourceType('REQUEST'); setStep('form'); }}
                            className="w-full flex items-start gap-4 p-4 border-2 border-slate-200 hover:border-orange-400 rounded-2xl transition-all text-left group">
                            <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-200 transition-colors">
                                <HandHelping size={18} className="text-orange-500" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Resource Request</p>
                                <p className="text-xs text-slate-500 mt-0.5">I need something — blankets, volunteers, blood pressure machines, school supplies...</p>
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="p-5 space-y-4">
                        <button onClick={() => setStep('pick')}
                            className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                            ← Change type
                        </button>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${resourceType === 'OFFER' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'}`}>
                            {resourceType === 'OFFER' ? <Package size={13} /> : <HandHelping size={13} />}
                            {resourceType === 'OFFER' ? 'Resource Offer — You have this to share' : 'Resource Request — You need this'}
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                                <AlertTriangle size={14} />{error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Photo {resourceType === 'OFFER' && <span className="text-slate-400 font-normal">(recommended)</span>}
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="h-20 w-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 relative">
                                    {form.imageUrl ? (
                                        <Image src={form.imageUrl} alt="Resource" fill className="object-cover" sizes="80px" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImagePlus size={20} className="text-slate-300" />
                                        </div>
                                    )}
                                </div>
                                <CldUploadWidget
                                    uploadPreset="nconnect_posts"
                                    onSuccess={(result) => {
                                        if (
                                            result.event === 'success' &&
                                            typeof result.info === 'object' &&
                                            result.info &&
                                            'secure_url' in result.info
                                        ) {
                                            setForm(p => ({ ...p, imageUrl: (result.info as { secure_url: string }).secure_url }));
                                        }
                                    }}
                                >
                                    {({ open: openWidget }) => (
                                        <button
                                            type="button"
                                            onClick={() => openWidget()}
                                            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-xl text-xs font-semibold text-slate-600 transition-all"
                                        >
                                            <ImagePlus size={13} /> {form.imageUrl ? "Change Photo" : "Add Photo"}
                                        </button>
                                    )}
                                </CldUploadWidget>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    {resourceType === 'REQUEST' ? 'What do you need? *' : 'Resource Name *'}
                                </label>
                                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    className={inputCls}
                                    placeholder={resourceType === 'REQUEST' ? 'e.g. Need 20 Blankets' : 'e.g. Industrial Projector'} />
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
                            {resourceType === 'OFFER' ? (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sharing Type</label>
                                    <select value={form.sharingType} onChange={e => setForm(p => ({ ...p, sharingType: e.target.value }))} className={inputCls}>
                                        <option value="DONATE">Donate</option>
                                        <option value="BORROW">Lend / Borrow</option>
                                        <option value="BOTH">Both</option>
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Urgency</label>
                                    <select value={form.urgency} onChange={e => setForm(p => ({ ...p, urgency: e.target.value }))} className={inputCls}>
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High — Urgent</option>
                                    </select>
                                </div>
                            )}
                            {resourceType === 'OFFER' && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Condition</label>
                                    <select value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))} className={inputCls}>
                                        <option value="New">New</option>
                                        <option value="Good">Good</option>
                                        <option value="Fair">Fair</option>
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    {resourceType === 'REQUEST' ? 'Quantity Needed' : 'Quantity'}
                                </label>
                                <input type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                                    className={inputCls} placeholder="e.g. 20" />
                            </div>
                            <div className={resourceType === 'OFFER' ? '' : 'sm:col-span-2'}>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
                                <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                    className={inputCls} placeholder="e.g. Kathmandu" />
                            </div>
                            {resourceType === 'OFFER' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Available From</label>
                                        <input type="date" value={form.availableFrom} onChange={e => setForm(p => ({ ...p, availableFrom: e.target.value }))} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Available Until</label>
                                        <input type="date" value={form.availableUntil} onChange={e => setForm(p => ({ ...p, availableUntil: e.target.value }))} className={inputCls} />
                                    </div>
                                </>
                            )}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tags</label>
                                <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                                    className={inputCls} placeholder="Training, Workshop (comma-separated)" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    rows={3} className={`${inputCls} resize-none`}
                                    placeholder={resourceType === 'REQUEST'
                                        ? 'Why do you need this? Any specific requirements?'
                                        : 'Describe the resource, its condition, any usage notes...'} />
                            </div>
                        </div>
                        <button onClick={handleSubmit} disabled={loading}
                            className={`w-full disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-colors ${resourceType === 'REQUEST' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            {loading ? "Posting..." : resourceType === 'REQUEST' ? 'Post Resource Need' : 'Add Resource Offer'}
                        </button>
                    </div>
                )}
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
    const isNeed = resource.resourceType === 'REQUEST';

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
                    <h2 className="font-bold text-slate-900">{isNeed ? 'Offer Help' : 'Request Resource'}</h2>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100">
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                    <p className="font-semibold text-sm text-slate-900">{resource.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {isNeed ? 'Requested by' : 'from'} {resource.ownerName ?? resource.ownerUsername}
                    </p>
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
                        placeholder={isNeed ? "How can you help? What can you offer?" : "Describe how you plan to use this resource..."} />
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading}
                        className={`flex-1 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm ${isNeed ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                        {loading ? "Sending..." : isNeed ? "Offer Help" : "Send Request"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteConfirmModal({ resourceName, onConfirm, onCancel, loading, error }: {
    resourceName: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
    error: string | null;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                        <Trash2 size={18} className="text-red-500" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900">Delete Resource</h2>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-50">{resourceName}</p>
                    </div>
                </div>
                <p className="text-sm text-slate-600">Are you sure? This cannot be undone.</p>
                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                        <AlertTriangle size={14} />{error}
                    </div>
                )}
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-50 disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                        <Trash2 size={13} />
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

type TabType = 'all' | 'offers' | 'my';

export default function ResourcesPage() {
    const { dbUser } = useAuth();
    const [tab, setTab] = useState<TabType>('all');
    const [resources, setResources] = useState<Resource[]>([]);
    const [myResources, setMyResources] = useState<Resource[]>([]);
    const [myRequests, setMyRequests] = useState<MyRequest[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [requestTarget, setRequestTarget] = useState<Resource | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<Resource | null>(null);
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [deleteConfirmName, setDeleteConfirmName] = useState<string>("");
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const resourceTypeParam = tab === 'offers' ? 'OFFER' : undefined;

    const fetchResources = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getResources({
                category: categoryFilter === "all" ? undefined : categoryFilter,
                search: search || undefined,
                resourceType: resourceTypeParam,
            });
            setResources(data);
        } catch { setResources([]); }
        finally { setLoading(false); }
    }, [categoryFilter, search, resourceTypeParam]);

    const fetchSidebarData = useCallback(async () => {
        if (!dbUser) return;
        try {
            const [mine, reqs, incoming] = await Promise.all([
                getMyResources(),
                getMyResourceRequests(),
                fetch('/api/resources/requests').then(r => r.ok ? r.json() : []),
            ]);
            setMyResources(mine);
            setMyRequests(reqs);
            setIncomingRequests(Array.isArray(incoming) ? incoming : []);
        } catch { }
    }, [dbUser]);

    useEffect(() => { fetchResources(); }, [fetchResources]);
    useEffect(() => { fetchSidebarData(); }, [fetchSidebarData]);

    async function handleIncomingAction(requestId: string, approve: boolean) {
        setActionLoading(requestId);
        try {
            const res = await fetch(`/api/resources/requests/${requestId}/respond`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approve }),
            });
            if (res.ok) {
                setIncomingRequests(prev => prev.map(r =>
                    r.id === requestId ? { ...r, status: approve ? 'APPROVED' : 'REJECTED' } : r
                ));
                fetchResources();
            }
        } catch { }
        finally { setActionLoading(null); }
    }

    function dismissIncomingRequest(requestId: string) {
        setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
    }

    function handleDeleteClick(id: string, name: string) {
        setDeleteError(null);
        setDeleteConfirmId(id);
        setDeleteConfirmName(name);
    }

    async function handleDeleteConfirmed() {
        if (!deleteConfirmId) return;
        setDeleteLoading(deleteConfirmId);
        setDeleteError(null);
        try {
            const res = await fetch(`/api/resources/${deleteConfirmId}`, { method: "DELETE" });
            if (res.ok) {
                setResources(prev => prev.filter(r => r.id !== deleteConfirmId));
                setMyResources(prev => prev.filter(r => r.id !== deleteConfirmId));
                setDeleteConfirmId(null);
                setDeleteConfirmName("");
            } else {
                const d = await res.json();
                setDeleteError(d.error || "Failed to delete resource");
            }
        } catch {
            setDeleteError("Failed to delete resource");
        } finally {
            setDeleteLoading(null);
        }
    }

    function handleDeleteCancel() {
        if (deleteLoading) return;
        setDeleteConfirmId(null);
        setDeleteConfirmName("");
        setDeleteError(null);
    }

    const tabs: { key: TabType; label: string }[] = [
        { key: 'all', label: 'All Resources' },
        { key: 'offers', label: 'Resource Offers' },
        { key: 'my', label: 'My Resources' },
    ];

    const displayedResources = tab === 'my'
        ? myResources.filter(r =>
            (categoryFilter === 'all' || r.category === categoryFilter) &&
            (!search || r.name.toLowerCase().includes(search.toLowerCase()))
        )
        : tab === 'offers'
            ? resources.filter(r => r.ownerId !== dbUser?.id)
            : resources;

    const pendingIncoming = incomingRequests.filter(r => r.status === 'PENDING');
    const pastIncoming = incomingRequests.filter(r => r.status !== 'PENDING');

    return (
        <div className="bg-[#EEF3F8] min-h-screen">
            {requestSuccess && (
                <div className="bg-emerald-600 text-white text-sm font-semibold text-center py-2.5 flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> Request sent successfully!
                    <button onClick={() => setRequestSuccess(false)} className="ml-2 opacity-70 hover:opacity-100">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Resources</h1>
                        <p className="text-sm text-slate-500 mt-1">Share what you have. Request what you need.</p>
                    </div>
                    {dbUser && (
                        <button onClick={() => setShowCreate(true)}
                            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors w-full sm:w-auto shrink-0">
                            <Plus size={16} /> Add Resource
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <main className="lg:col-span-8 space-y-4 order-1">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex overflow-x-auto no-scrollbar scrollbar-none whitespace-nowrap">
                            {tabs.map(({ key, label }) => (
                                <button key={key} onClick={() => setTab(key)}
                                    className={`flex-1 min-w-30 py-2.5 px-3 text-xs font-bold transition-all ${tab === key
                                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                        }`}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Search resources..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                            </div>
                            <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                                {CATEGORIES.map(({ label, value, Icon }) => (
                                    <button key={value} onClick={() => setCategoryFilter(value)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 ${categoryFilter === value
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "border-slate-200 text-slate-600 hover:border-indigo-300"
                                            }`}>
                                        <Icon size={11} />{label}
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
                        ) : displayedResources.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {displayedResources.map(r => (
                                    <ResourceCard
                                        key={r.id}
                                        resource={r}
                                        currentUserId={dbUser?.id}
                                        onRequest={setRequestTarget}
                                        onEdit={setEditTarget}
                                        onDelete={(id) => handleDeleteClick(id, r.name)}
                                        deleteLoading={deleteLoading}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200 px-4">
                                <Package size={32} className="mx-auto mb-3 opacity-40" />
                                <p className="font-semibold">No resources found</p>
                                <p className="text-sm mt-1">
                                    {tab === 'my' ? "You haven't added any resources yet." : "Try adjusting your filters"}
                                </p>
                                {tab === 'my' && dbUser && (
                                    <button onClick={() => setShowCreate(true)}
                                        className="mt-4 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors w-full sm:w-auto">
                                        Add Your First Resource
                                    </button>
                                )}
                            </div>
                        )}
                    </main>

                    <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20 self-start order-2 lg:order-2">
                        {dbUser && incomingRequests.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                                <h2 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
                                    <Package size={14} className="text-indigo-500" />
                                    Incoming Requests
                                    {pendingIncoming.length > 0 && (
                                        <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                                            {pendingIncoming.length} pending
                                        </span>
                                    )}
                                </h2>
                                <p className="text-[11px] text-slate-400 mb-3">People requesting your resources</p>

                                <div className="space-y-3">
                                    {pendingIncoming.map(req => (
                                        <div key={req.id} className="bg-slate-50 rounded-xl p-3 space-y-2.5">
                                            <div className="flex items-start gap-2">
                                                <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <Package size={13} className="text-indigo-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 truncate">{req.resourceName}</p>
                                                    <p className="text-[10px] text-slate-400">{req.resourceCategory}</p>
                                                </div>
                                                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                                                    <Clock size={8} /> PENDING
                                                </span>
                                            </div>

                                            <div className="text-[11px] text-slate-600">
                                                <span className="font-semibold text-indigo-600">@{req.requesterUsername}</span>
                                                {req.requesterName && req.requesterName !== req.requesterUsername && (
                                                    <span className="text-slate-400"> ({req.requesterName})</span>
                                                )}
                                            </div>

                                            {req.message && (
                                                <div className="flex items-start gap-1.5">
                                                    <MessageSquare size={10} className="text-slate-400 mt-0.5 shrink-0" />
                                                    <p className="text-[11px] text-slate-500 italic line-clamp-2">&ldquo;{req.message}&rdquo;</p>
                                                </div>
                                            )}

                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => handleIncomingAction(req.id, true)}
                                                    disabled={actionLoading === req.id}
                                                    className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-1.5 rounded-lg text-[11px] transition-colors"
                                                >
                                                    <CheckCircle size={11} />
                                                    {actionLoading === req.id ? '...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleIncomingAction(req.id, false)}
                                                    disabled={actionLoading === req.id}
                                                    className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold py-1.5 rounded-lg text-[11px] transition-colors"
                                                >
                                                    <XCircle size={11} />
                                                    {actionLoading === req.id ? '...' : 'Reject'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {pastIncoming.length > 0 && (
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Past</p>
                                            {pastIncoming.slice(0, 5).map(req => (
                                                <div key={req.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0 group">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-slate-700 truncate">{req.resourceName}</p>
                                                        <p className="text-[10px] text-slate-400">@{req.requesterUsername}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                                            {req.status}
                                                        </span>
                                                        <button
                                                            onClick={() => dismissIncomingRequest(req.id)}
                                                            title="Remove from list"
                                                            className="lg:opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                                                        >
                                                            <X size={11} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <h2 className="font-bold text-sm text-slate-990 mb-4 flex items-center gap-2">
                                <Tag size={14} className="text-indigo-500" /> My Resources
                            </h2>
                            {myResources.filter(r => r.resourceType !== 'REQUEST').length > 0 ? (
                                <div className="space-y-2">
                                    {myResources.filter(r => r.resourceType !== 'REQUEST').slice(0, 3).map(r => (
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
                                <p className="text-xs text-slate-400 text-center py-2">
                                    {dbUser ? "No resources listed yet." : "Sign in to manage resources."}
                                </p>
                            )}
                            {dbUser && (
                                <button onClick={() => setShowCreate(true)}
                                    className="w-full mt-3 border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5">
                                    <Plus size={12} /> Add Resource
                                </button>
                            )}
                        </div>

                        {dbUser && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                                <h2 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                                    <HandHelping size={14} className="text-orange-500" /> My Requests
                                </h2>
                                {myRequests.length > 0 ? (
                                    <div className="space-y-2">
                                        {myRequests.slice(0, 3).map(r => (
                                            <div key={r.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 truncate">{r.resourceName}</p>
                                                    <p className="text-[11px] text-slate-400">{r.resourceCategory}</p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${MY_REQUEST_STATUS_STYLE[r.status] || 'bg-slate-100 text-slate-500'}`}>
                                                    {r.status}
                                                </span>
                                            </div>
                                        ))}
                                        {myRequests.length > 3 && (
                                            <button onClick={() => setTab('my')}
                                                className="w-full text-xs text-indigo-600 font-semibold flex items-center justify-center gap-1 pt-1 hover:underline">
                                                See All <ArrowRight size={11} />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 text-center py-2">No active requests.</p>
                                )}
                            </div>
                        )}

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <h2 className="font-bold text-sm text-slate-900 mb-3">Resource Stats</h2>
                            {[
                                { label: "Total Listed", value: resources.length },
                                { label: "Offers Available", value: resources.filter(r => r.resourceType !== 'REQUEST' && r.status === "AVAILABLE").length },
                                { label: "Active Needs", value: resources.filter(r => r.resourceType === 'REQUEST').length },
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

            {requestTarget && (
                <RequestModal resource={requestTarget} onClose={() => setRequestTarget(null)}
                    onSuccess={() => { setRequestSuccess(true); fetchResources(); fetchSidebarData(); }} />
            )}
            {showCreate && (
                <AddResourceModal onClose={() => setShowCreate(false)}
                    onCreated={() => { fetchResources(); fetchSidebarData(); }} />
            )}
            {editTarget && (
                <EditResourceModal
                    resource={editTarget}
                    onClose={() => setEditTarget(null)}
                    onUpdated={() => { fetchResources(); fetchSidebarData(); setEditTarget(null); }}
                />
            )}
            {deleteConfirmId && (
                <DeleteConfirmModal
                    resourceName={deleteConfirmName}
                    onConfirm={handleDeleteConfirmed}
                    onCancel={handleDeleteCancel}
                    loading={deleteLoading === deleteConfirmId}
                    error={deleteError}
                />
            )}
        </div>
    );
}