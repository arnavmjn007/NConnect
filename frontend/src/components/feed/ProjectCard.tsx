import React from 'react';
import Image from 'next/image';
import {
    MapPin, Calendar, Users, BookmarkPlus,
    AlertTriangle, Heart, BadgeCheck, Clock, Flame
} from 'lucide-react';

export type ProjectResponse = {
    id: string;
    title: string;
    description: string | null;
    category: string;
    ngoId: string;
    ngoName: string | null;
    ngoUsername: string | null;
    ngoVerified: boolean;
    location: string | null;
    duration: string | null;
    volunteerSlots: number | null;
    volunteersJoined: number | null;
    goalAmount: number | null;
    raisedAmount: number | null;
    donorCount: number | null;
    requiredSkills: string[];
    tags: string[];
    priorityLevel: string;
    startDate: string | null;
    endDate: string | null;
    imageUrl: string | null;
    status: string;
};

const PRIORITY_COLOR: Record<string, string> = {
    URGENT: "bg-red-500 text-white",
    HIGH: "bg-orange-500 text-white",
    NORMAL: "",
    LOW: "",
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

function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
    const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
    return (
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
                className="bg-linear-to-r from-indigo-600 to-blue-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

interface ProjectCardProps {
    project: ProjectResponse;
    onDonate?: (project: ProjectResponse) => void;
}

export default function ProjectCard({ project, onDonate }: ProjectCardProps) {
    const gradient = CATEGORY_GRADIENT[project.category] || CATEGORY_GRADIENT.default;
    const raised = project.raisedAmount ?? 0;
    const goal = project.goalAmount ?? 0;
    const pct = goal > 0 ? Math.round((raised / goal) * 100) : 0;
    const spotsLeft = project.volunteerSlots != null && project.volunteersJoined != null
        ? project.volunteerSlots - project.volunteersJoined
        : null;
    const isUrgent = project.priorityLevel === 'URGENT';
    const isHigh = project.priorityLevel === 'HIGH';

    const dateRange = [project.startDate, project.endDate]
        .filter(Boolean)
        .map(d => new Date(d!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
        .join(' – ');

    return (
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group cursor-pointer">
            <div className={`h-32 bg-linear-to-br ${gradient} relative flex items-end p-4`}>
                {project.imageUrl && (
                    <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover opacity-30"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                )}
                {(isUrgent || isHigh) && (
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${PRIORITY_COLOR[project.priorityLevel]}`}>
                        {isUrgent ? <Flame size={10} /> : <AlertTriangle size={10} />}
                        {project.priorityLevel}
                    </span>
                )}
                <button className="absolute top-3 left-3 p-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all">
                    <BookmarkPlus size={14} />
                </button>
                <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 relative z-10">
                    {project.title}
                </h3>
            </div>

            <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {(project.ngoName || 'N').charAt(0)}
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate flex items-center gap-1">
                        {project.ngoName || project.ngoUsername || 'Unknown NGO'}
                        {project.ngoVerified && <BadgeCheck size={13} className="text-indigo-500 shrink-0" />}
                    </p>
                </div>

                {project.requiredSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {project.requiredSkills.slice(0, 3).map(s => (
                            <span key={s} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                {s}
                            </span>
                        ))}
                    </div>
                )}

                <div className="space-y-1">
                    {project.location && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <MapPin size={11} />{project.location}
                        </div>
                    )}
                    {dateRange && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Calendar size={11} />{dateRange}
                        </div>
                    )}
                    {project.duration && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Clock size={11} />{project.duration}
                        </div>
                    )}
                    {spotsLeft !== null && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Users size={11} />
                            {spotsLeft > 0 ? `${spotsLeft} volunteer spots left` : 'All spots filled'}
                        </div>
                    )}
                </div>

                {goal > 0 && (
                    <div>
                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                            <span className="text-slate-700">NPR {raised.toLocaleString()} raised</span>
                            <span className="text-indigo-600">{pct}%</span>
                        </div>
                        <ProgressBar raised={raised} goal={goal} />
                        <p className="text-[10px] text-slate-400 mt-1">
                            of NPR {goal.toLocaleString()} goal · {project.donorCount ?? 0} donors
                        </p>
                    </div>
                )}

                <div className="flex gap-2 pt-1">
                    {goal > 0 && (
                        <button
                            onClick={() => onDonate?.(project)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 text-xs font-bold py-2 rounded-xl transition-colors"
                        >
                            <Heart size={12} /> Donate
                        </button>
                    )}
                    <button className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-indigo-700 transition-colors">
                        Volunteer
                    </button>
                </div>
            </div>
        </article>
    );
}