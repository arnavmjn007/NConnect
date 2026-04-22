import React from 'react';
import { Droplets, Utensils, GraduationCap, TrendingUp } from 'lucide-react';

const ProgressBar = ({ raised, goal }: { raised: number; goal: number }) => {
    const pct = Math.min((raised / goal) * 100, 100);
    return (
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
                className="bg-linear-to-r from-[#0A66C2] to-[#0073b1] h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
};

const ngos = [
    { name: "Water for All", followers: "12.5K", Icon: Droplets, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Food Relief Network", followers: "8.2K", Icon: Utensils, color: "text-orange-500", bg: "bg-orange-50" },
    { name: "Education Alliance", followers: "15.3K", Icon: GraduationCap, color: "text-violet-500", bg: "bg-violet-50" },
    { name: "Health Access Initiative", followers: "9.8K", Icon: Droplets, color: "text-emerald-500", bg: "bg-emerald-50" },
];

const projects = [
    { title: "Clean Water Initiative", raised: 45000, goal: 50000 },
    { title: "School Supplies Drive", raised: 12000, goal: 20000 },
    { title: "Emergency Relief Fund", raised: 78000, goal: 100000 },
];

export default function RightBar() {
    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-sm text-slate-900 tracking-tight">Suggested NGOs</h2>
                    <span className="text-[10px] text-black font-semibold cursor-pointer hover:underline">See all</span>
                </div>

                <div className="space-y-3">
                    {ngos.map((ngo) => (
                        <div key={ngo.name} className="flex items-center justify-between gap-2 group">
                            <div className="flex items-center gap-3">
                                <div className={`h-9 w-9 ${ngo.bg} rounded-xl flex items-center justify-center shrink-0`}>
                                    <ngo.Icon className={ngo.color} size={18} />
                                </div>
                                <div>
                                    <h3 className="text-[13px] font-bold text-slate-800 leading-tight cursor-pointer transition-colors">
                                        {ngo.name}
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{ngo.followers} followers</p>
                                </div>
                            </div>
                            <button className="shrink-0 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all">
                                + Follow
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={14} className="text-indigo-600" />
                    <h2 className="font-bold text-sm text-slate-900">Trending Projects</h2>
                </div>

                <div className="space-y-5">
                    {projects.map((p) => {
                        const pct = Math.round((p.raised / p.goal) * 100);
                        return (
                            <div key={p.title} className="group cursor-pointer">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-[13px] font-bold text-slate-800 transition-colors leading-tight">
                                        {p.title}
                                    </h3>
                                    <span className="text-[10px] font-bold text-indigo-600 bg-[#EEF3F8] px-1.5 py-0.5 rounded-md shrink-0">
                                        {pct}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-1">
                                    <span>${p.raised.toLocaleString()} raised</span>
                                    <span>of ${p.goal.toLocaleString()}</span>
                                </div>
                                <ProgressBar raised={p.raised} goal={p.goal} />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="px-2 pb-4">
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
                    {['About', 'Accessibility', 'Help Center', 'Privacy & Terms'].map(link => (
                        <span key={link} className="text-[10px] text-slate-400 hover:text-[#0A66C2] cursor-pointer transition-colors">
                            {link}
                        </span>
                    ))}
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                    <span className="bg-linear-to-br from-[#0A66C2] to-[#0073b1] text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">N</span>
                    <p className="text-[11px] text-slate-400 font-medium">NConnect Corp © 2026</p>
                </div>
            </div>
        </div>
    );
}