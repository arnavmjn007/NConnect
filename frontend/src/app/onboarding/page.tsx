"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, ArrowLeft, Check, User, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { submitUserOnboarding, submitNgoOnboarding } from '@/lib/api';

const SKILLS = ["Frontend Development", "Backend Development", "UI/UX Design", "Teaching", "Fundraising", "Project Management", "Community Outreach", "Social Media", "Event Planning", "Data Analysis", "Medical", "Legal", "Translation"];
const INTERESTS = ["Education", "Environment", "Healthcare", "Women Empowerment", "Children & Youth", "Animals", "Disaster Relief", "Food Security", "Clean Water", "Digital Literacy", "Mental Health", "Human Rights"];
const CAUSES = ["Education Access", "Climate Action", "Poverty Alleviation", "Gender Equality", "Clean Energy", "Zero Hunger", "Quality Healthcare", "Clean Water & Sanitation"];
const LANGUAGES = ["English", "Nepali", "Hindi", "Mandarin", "Spanish", "French", "Arabic", "Portuguese"];
const NGO_CATEGORIES = ["Healthcare", "Education", "Environment", "Disaster Relief", "Food Security", "Women Empowerment", "Children & Youth", "Clean Water", "Human Rights", "Digital Literacy"];

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [role, setRole] = useState<"USER" | "NGO">("USER");

    const [userForm, setUserForm] = useState({
        username: "", bio: "", location: "", occupation: "", education: "",
        skills: [] as string[], interests: [] as string[],
        causes: [] as string[], languages: [] as string[],
    });

    const [ngoForm, setNgoForm] = useState({
        username: "", organizationName: "", missionStatement: "",
        location: "", ngoCategories: [] as string[], operatingLocations: "",
        causes: [] as string[], languages: [] as string[],
    });

    useEffect(() => {
        if (user && !userForm.username) {
            const def = (user.nickname || user.email?.split('@')[0] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
            setUserForm(p => ({ ...p, username: def }));
            setNgoForm(p => ({ ...p, username: def }));
        }
    }, [user, userForm.username]);

    const toggleUser = (field: "skills" | "interests" | "causes" | "languages", value: string) => {
        setUserForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value],
        }));
    };

    const toggleNgo = (field: "ngoCategories" | "causes" | "languages", value: string) => {
        setNgoForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value],
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            if (role === "USER") {
                await submitUserOnboarding(userForm);
            } else {
                await submitNgoOnboarding({
                    ...ngoForm,
                    ngoCategories: ngoForm.ngoCategories.join(","),
                });
            }
            router.push('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const canProceedStep1 = role === "USER"
        ? userForm.username.trim().length >= 3
        : ngoForm.username.trim().length >= 3 && ngoForm.organizationName.trim().length > 0;

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
                                    <p className="text-sm text-slate-500 mt-1">Tell us who you are on NConnect.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-2">Account Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { value: "USER" as const, Icon: User, title: "Individual", desc: "Volunteer, professional, or enthusiast." },
                                            { value: "NGO" as const, Icon: Building2, title: "NGO / Organization", desc: "Non-profit, community group, or social enterprise." },
                                        ].map(({ value, Icon, title, desc }) => (
                                            <button key={value} type="button" onClick={() => setRole(value)}
                                                className={`p-4 rounded-xl border-2 text-left flex flex-col gap-2 transition-all ${role === value ? 'border-indigo-600 bg-indigo-50/40' : 'border-slate-200 hover:border-slate-300'}`}>
                                                <Icon size={20} className={role === value ? 'text-indigo-600' : 'text-slate-400'} />
                                                <div>
                                                    <p className="text-xs font-bold">{title}</p>
                                                    <p className="text-[11px] opacity-80 mt-0.5">{desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username</label>
                                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
                                        <span className="px-3 py-2.5 bg-slate-50 text-slate-400 text-sm border-r border-slate-200">nconnect.com/</span>
                                        <input type="text" placeholder="username"
                                            value={role === "USER" ? userForm.username : ngoForm.username}
                                            onChange={e => {
                                                const v = e.target.value;
                                                if (role === "USER") setUserForm(p => ({ ...p, username: v }));
                                                else setNgoForm(p => ({ ...p, username: v }));
                                            }}
                                            className="flex-1 px-3 py-2.5 text-sm text-slate-700 focus:outline-none" />
                                    </div>
                                </div>

                                {role === "USER" && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bio</label>
                                            <textarea placeholder="I am passionate about making an impact..."
                                                value={userForm.bio}
                                                onChange={e => setUserForm(p => ({ ...p, bio: e.target.value }))}
                                                rows={3}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
                                                <input type="text" placeholder="Kathmandu, Nepal"
                                                    value={userForm.location}
                                                    onChange={e => setUserForm(p => ({ ...p, location: e.target.value }))}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Occupation</label>
                                                <input type="text" placeholder="Student / Engineer"
                                                    value={userForm.occupation}
                                                    onChange={e => setUserForm(p => ({ ...p, occupation: e.target.value }))}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Education</label>
                                                <input type="text" placeholder="BSc Computer Science, TU"
                                                    value={userForm.education}
                                                    onChange={e => setUserForm(p => ({ ...p, education: e.target.value }))}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {role === "NGO" && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Organization Name <span className="text-red-500">*</span></label>
                                            <input type="text" placeholder="e.g. Red Cross Foundation"
                                                value={ngoForm.organizationName}
                                                onChange={e => setNgoForm(p => ({ ...p, organizationName: e.target.value }))}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mission Statement</label>
                                            <textarea placeholder="Describe your organization's core mission..."
                                                value={ngoForm.missionStatement}
                                                onChange={e => setNgoForm(p => ({ ...p, missionStatement: e.target.value }))}
                                                rows={3}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
                                                <input type="text" placeholder="Kathmandu, Nepal"
                                                    value={ngoForm.location}
                                                    onChange={e => setNgoForm(p => ({ ...p, location: e.target.value }))}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Operating Locations</label>
                                                <input type="text" placeholder="Kathmandu, Pokhara"
                                                    value={ngoForm.operatingLocations}
                                                    onChange={e => setNgoForm(p => ({ ...p, operatingLocations: e.target.value }))}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">
                                        {role === "NGO" ? "NGO Categories & Languages" : "Skills & Languages"}
                                    </h1>
                                    <p className="text-sm text-slate-500 mt-1">Powers our matchmaking and discovery filters.</p>
                                </div>

                                {role === "USER" ? (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700 mb-2">Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {SKILLS.map(skill => {
                                                const active = userForm.skills.includes(skill);
                                                return (
                                                    <button key={skill} type="button" onClick={() => toggleUser("skills", skill)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                                                        {active && <Check size={11} />}{skill}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700 mb-2">NGO Categories</p>
                                        <div className="flex flex-wrap gap-2">
                                            {NGO_CATEGORIES.map(cat => {
                                                const active = ngoForm.ngoCategories.includes(cat);
                                                return (
                                                    <button key={cat} type="button" onClick={() => toggleNgo("ngoCategories", cat)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                                                        {active && <Check size={11} />}{cat}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs font-semibold text-slate-700 mb-2">Languages</p>
                                    <div className="flex flex-wrap gap-2">
                                        {LANGUAGES.map(lang => {
                                            const active = role === "USER"
                                                ? userForm.languages.includes(lang)
                                                : ngoForm.languages.includes(lang);
                                            return (
                                                <button key={lang} type="button"
                                                    onClick={() => role === "USER" ? toggleUser("languages", lang) : toggleNgo("languages", lang)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                                                    {active && <Check size={11} />}{lang}
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
                                    <p className="text-sm text-slate-500 mt-1">Personalizes your feed and connection recommendations.</p>
                                </div>

                                {role === "USER" && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700 mb-2">Interests</p>
                                        <div className="flex flex-wrap gap-2">
                                            {INTERESTS.map(item => {
                                                const active = userForm.interests.includes(item);
                                                return (
                                                    <button key={item} type="button" onClick={() => toggleUser("interests", item)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-600 hover:border-emerald-300"}`}>
                                                        {active && <Check size={11} />}{item}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs font-semibold text-slate-700 mb-2">Causes you support</p>
                                    <div className="flex flex-wrap gap-2">
                                        {CAUSES.map(cause => {
                                            const active = role === "USER"
                                                ? userForm.causes.includes(cause)
                                                : ngoForm.causes.includes(cause);
                                            return (
                                                <button key={cause} type="button"
                                                    onClick={() => role === "USER" ? toggleUser("causes", cause) : toggleNgo("causes", cause)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 text-slate-600 hover:border-violet-300"}`}>
                                                    {active && <Check size={11} />}{cause}
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
                                <button type="button" onClick={() => setStep(s => (s - 1) as Step)}
                                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                                    <ArrowLeft size={15} /> Back
                                </button>
                            ) : <div />}

                            {step < 3 ? (
                                <button type="button" onClick={() => setStep(s => (s + 1) as Step)}
                                    disabled={step === 1 && !canProceedStep1}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors">
                                    Continue <ArrowRight size={15} />
                                </button>
                            ) : (
                                <button type="button" onClick={handleSubmit} disabled={loading}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors">
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