import React from 'react';
import { MapPin, Calendar, DollarSign, Users, BookmarkPlus, AlertTriangle } from 'lucide-react';

type Project = {
    id: number;
    title: string;
    ngo: string;
    verified: boolean;
    location: string;
    dateRange: string;
    raised: number;
    goal: number;
    donors: number;
    volunteers: number;
    category: string;
    urgent: boolean;
    color: string;
};

function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
    const pct = Math.min((raised / goal) * 100, 100);
    return (
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
                className="bg-linear-to-r from-indigo-600 to-blue-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

export default function ProjectCard({ project }: { project: Project }) {
    const pct = Math.round((project.raised / project.goal) * 100);

    return (
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group cursor-pointer">
            <div className={`h-32 bg-linear-to-br ${project.color} relative flex items-end p-4`}>
                {project.urgent && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle size={10} /> Urgent
                    </span>
                )}
                <button className="absolute top-3 left-3 p-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all">
                    <BookmarkPlus size={14} />
                </button>
                <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{project.title}</h3>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {project.ngo.charAt(0)}
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate flex items-center gap-1">
                        {project.ngo}
                        {project.verified && <span className="text-[#0A66C2] text-xs">✓</span>}
                    </p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400"><MapPin size={11} />{project.location}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400"><Calendar size={11} />{project.dateRange}</div>
                </div>
                <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                        <span className="text-slate-700">${project.raised.toLocaleString()} raised</span>
                        <span className="text-indigo-600">{pct}%</span>
                    </div>
                    <ProgressBar raised={project.raised} goal={project.goal} />
                    <p className="text-[10px] text-slate-400 mt-1">of ${project.goal.toLocaleString()} goal</p>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <DollarSign size={11} className="text-indigo-500" />
                        <span><strong className="text-slate-700">{project.donors}</strong> donors</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Users size={11} className="text-emerald-500" />
                        <span><strong className="text-slate-700">{project.volunteers}</strong> volunteers</span>
                    </div>
                </div>
                <div className="flex gap-2 pt-1">
                    <button className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-indigo-700 transition-colors">
                        Donate Now
                    </button>
                    <button className="flex-1 border border-indigo-600 text-indigo-600 text-xs font-bold py-2 rounded-xl hover:bg-indigo-50 transition-colors">
                        Volunteer
                    </button>
                </div>
            </div>
        </article>
    );
}