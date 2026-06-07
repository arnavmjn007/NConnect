"use client";
import React, { useState } from 'react';
import { Plus, X, Save, CheckCircle } from 'lucide-react';

const DEFAULT_CATEGORIES = ["Education", "Environment", "Healthcare", "Women Empowerment", "Children & Youth", "Disaster Relief", "Food Security", "Clean Water", "Digital Literacy", "Mental Health"];
const DEFAULT_CAUSES = ["Education Access", "Climate Action", "Poverty Alleviation", "Gender Equality", "Clean Energy", "Zero Hunger", "Quality Healthcare", "Clean Water & Sanitation"];

export default function SettingsPage() {
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [causes, setCauses] = useState(DEFAULT_CAUSES);
    const [newCategory, setNewCategory] = useState("");
    const [newCause, setNewCause] = useState("");
    const [success, setSuccess] = useState("");

    const addItem = (list: string[], setList: (v: string[]) => void, value: string, setValue: (v: string) => void) => {
        if (!value.trim() || list.includes(value.trim())) return;
        setList([...list, value.trim()]);
        setValue("");
    };

    const removeItem = (list: string[], setList: (v: string[]) => void, item: string) => {
        setList(list.filter(i => i !== item));
    };

    const handleSave = async () => {
        try {
            await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categories, causes }),
            });
            setSuccess("Settings saved successfully");
            setTimeout(() => setSuccess(""), 3000);
        } catch { }
    };

    const inputCls = "flex-1 px-4 py-2 bg-[#0A0B0F] border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50";

    return (
        <div className="p-6 space-y-6 max-w-3xl">
            <div>
                <h1 className="text-white text-xl font-black">Platform Settings</h1>
                <p className="text-slate-500 text-sm mt-0.5">Manage categories, causes, and platform configuration</p>
            </div>

            {success && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl font-semibold">
                    <CheckCircle size={14} /> {success}
                </div>
            )}

            <div className="bg-[#0D0E14] border border-white/5 rounded-2xl p-5 space-y-4">
                <h2 className="text-white text-sm font-bold">NGO & Project Categories</h2>
                <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                        <span key={c} className="flex items-center gap-1.5 text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 px-3 py-1.5 rounded-full">
                            {c}
                            <button onClick={() => removeItem(categories, setCategories, c)} className="text-slate-500 hover:text-red-400 transition-colors">
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input value={newCategory} onChange={e => setNewCategory(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addItem(categories, setCategories, newCategory, setNewCategory)}
                        className={inputCls} placeholder="Add new category..." />
                    <button onClick={() => addItem(categories, setCategories, newCategory, setNewCategory)}
                        className="h-9 w-9 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white transition-colors">
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            <div className="bg-[#0D0E14] border border-white/5 rounded-2xl p-5 space-y-4">
                <h2 className="text-white text-sm font-bold">Causes & Topics</h2>
                <div className="flex flex-wrap gap-2">
                    {causes.map(c => (
                        <span key={c} className="flex items-center gap-1.5 text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 px-3 py-1.5 rounded-full">
                            {c}
                            <button onClick={() => removeItem(causes, setCauses, c)} className="text-slate-500 hover:text-red-400 transition-colors">
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input value={newCause} onChange={e => setNewCause(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addItem(causes, setCauses, newCause, setNewCause)}
                        className={inputCls} placeholder="Add new cause..." />
                    <button onClick={() => addItem(causes, setCauses, newCause, setNewCause)}
                        className="h-9 w-9 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white transition-colors">
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            <button onClick={handleSave}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors">
                <Save size={14} /> Save All Settings
            </button>
        </div>
    );
}