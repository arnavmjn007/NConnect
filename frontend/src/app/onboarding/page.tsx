"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, ArrowLeft, Check, User, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { submitOnboarding } from '@/lib/api';

const SKILLS = ["Frontend Development", "Backend Development", "UI/UX Design", "Teaching", "Fundraising", "Project Management", "Community Outreach", "Social Media", "Event Planning", "Data Analysis", "Medical", "Legal", "Translation"];
const INTERESTS = ["Education", "Environment", "Healthcare", "Women Empowerment", "Children & Youth", "Animals", "Disaster Relief", "Food Security", "Clean Water", "Digital Literacy", "Mental Health", "Human Rights"];
const CAUSES = ["Education Access", "Climate Action", "Poverty Alleviation", "Gender Equality", "Clean Energy", "Zero Hunger", "Quality Healthcare", "Clean Water & Sanitation"];
const LANGUAGES = ["English", "Nepali", "Hindi", "Mandarin", "Spanish", "French", "Arabic", "Portuguese"];

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        username: "",
        role: "USER",
        bio: "",
        location: "",
        occupation: "",
        skills: [] as string[],
        interests: [] as string[],
        causes: [] as string[],
        languages: [] as string[],
    });

    useEffect(() => {
        if (user && !form.username) {
            const defaultUsername = user.nickname || user.email?.split('@')[0] || "";
            setForm(prev => ({ ...prev, username: defaultUsername.toLowerCase().replace(/[^a-z0-9]/g, "") }));
        }
    }, [user, form.username]);

    const toggle = (field: "skills" | "interests" | "causes" | "languages", value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value],
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            await submitOnboarding(form);
            router.push('/');
        } catch {
            setError("Something went wrong saving your profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#EEF3F8] flex flex-col">
            <nav className="bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between">
                <Image src="/Logo.png" alt="NConnect" width={80} height={80} className="object-contain" />
                <span className="text-xs text-slate-400 font-medium">Step {step} of 3</span>
            </nav>

            <div className="h-1 bg-slate-200">
                <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
            </div>

            <div className="flex-1 flex items-start justify-center px-4 py-10">
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

                        {step === 1 && (
                            <div className="space-y-5">
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">Set up your profile</h1>
                                    <p className="text-sm text-slate-500 mt-1">This is how others will find and recognize you on NConnect.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-2">Account Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setForm(p => ({ ...p, role: "USER" }))}
                                            className={`p-4 rounded-xl border-2 text-left flex flex-col gap-2 transition-all ${form.role === 'USER' ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                        >
                                            <User size={20} className={form.role === 'USER' ? 'text-indigo-600' : 'text-slate-400'} />
                                            <div>
                                                <p className="text-xs font-bold">Individual</p>
                                                <p className="text-[11px] opacity-80 mt-0.5">Volunteer, professional, or enthusiast.</p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setForm(p => ({ ...p, role: "NGO" }))}
                                            className={`p-4 rounded-xl border-2 text-left flex flex-col gap-2 transition-all ${form.role === 'NGO' ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                        >
                                            <Building2 size={20} className={form.role === 'NGO' ? 'text-indigo-600' : 'text-slate-400'} />
                                            <div>
                                                <p className="text-xs font-bold">NGO / Organization</p>
                                                <p className="text-[11px] opacity-80 mt-0.5">Non-profit, community group, or social enterprise.</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Username <span className="text-slate-400 font-normal">(your public profile URL)</span>
                                    </label>
                                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
                                        <span className="px-3 py-2.5 bg-slate-50 text-slate-400 text-sm border-r border-slate-200">
                                            nconnect.com/
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="username"
                                            value={form.username}
                                            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                            className="flex-1 px-3 py-2.5 text-sm text-slate-700 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bio</label>
                                    <textarea
                                        placeholder={form.role === "NGO" ? "Describe your organization's core mission..." : "I am passionate about making an impact in education..."}
                                        value={form.bio}
                                        onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
                                        <input
                                            type="text"
                                            placeholder="Kathmandu, Nepal"
                                            value={form.location}
                                            onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            {form.role === "NGO" ? "Organization Name" : "Occupation"}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={form.role === "NGO" ? "e.g., Red Cross Foundation" : "Student / Engineer"}
                                            value={form.occupation}
                                            onChange={e => setForm(p => ({ ...p, occupation: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">{form.role === "NGO" ? "Required Skills & Languages" : "Your skills & languages"}</h1>
                                    <p className="text-sm text-slate-500 mt-1">This powers our matchmaking discovery filters.</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-slate-700 mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {SKILLS.map(skill => {
                                            const active = form.skills.includes(skill);
                                            return (
                                                <button
                                                    key={skill}
                                                    type="button"
                                                    onClick={() => toggle("skills", skill)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}
                                                >
                                                    {active && <Check size={11} />}
                                                    {skill}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-slate-700 mb-2">Languages</p>
                                    <div className="flex flex-wrap gap-2">
                                        {LANGUAGES.map(lang => {
                                            const active = form.languages.includes(lang);
                                            return (
                                                <button
                                                    key={lang}
                                                    type="button"
                                                    onClick={() => toggle("languages", lang)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}
                                                >
                                                    {active && <Check size={11} />}
                                                    {lang}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">What causes matter to you?</h1>
                                    <p className="text-sm text-slate-500 mt-1">Personalizes feed parameters and connection recommendations.</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-slate-700 mb-2">Interests</p>
                                    <div className="flex flex-wrap gap-2">
                                        {INTERESTS.map(item => {
                                            const active = form.interests.includes(item);
                                            return (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    onClick={() => toggle("interests", item)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-600 hover:border-emerald-300"}`}
                                                >
                                                    {active && <Check size={11} />}
                                                    {item}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-slate-700 mb-2">Causes you support</p>
                                    <div className="flex flex-wrap gap-2">
                                        {CAUSES.map(cause => {
                                            const active = form.causes.includes(cause);
                                            return (
                                                <button
                                                    key={cause}
                                                    type="button"
                                                    onClick={() => toggle("causes", cause)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 text-slate-600 hover:border-violet-300"}`}
                                                >
                                                    {active && <Check size={11} />}
                                                    {cause}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                            </div>
                        )}

                        <div className="flex justify-between mt-8">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(s => (s - 1) as Step)}
                                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    <ArrowLeft size={15} /> Back
                                </button>
                            ) : <div />}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(s => (s + 1) as Step)}
                                    disabled={step === 1 && !form.username.trim()}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors"
                                >
                                    Continue <ArrowRight size={15} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors"
                                >
                                    {loading ? "Saving..." : "Finish Setup"}
                                    {!loading && <ArrowRight size={15} />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}