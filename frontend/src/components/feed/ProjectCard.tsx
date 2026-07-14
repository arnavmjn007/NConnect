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
    URGENT: "bg-red-500 text-white shadow-xs",
    HIGH: "bg-orange-500 text-white shadow-xs",
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
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
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
        <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col h-full w-full">
            <div className={`h-32 sm:h-36 bg-linear-to-br ${gradient} relative flex items-end p-3 sm:p-4 overflow-hidden shrink-0`}>
                {project.imageUrl && (
                    <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                )}

                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                {(isUrgent || isHigh) && (
                    <span className={`absolute top-2.5 sm:top-3 right-2.5 sm:right-3 text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 z-10 backdrop-blur-xs ${PRIORITY_COLOR[project.priorityLevel]}`}>
                        {isUrgent ? <Flame size={11} className="animate-pulse" /> : <AlertTriangle size={11} />}
                        {project.priorityLevel}
                    </span>
                )}
                <button className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 p-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-white transition-all z-10 shadow-xs">
                    <BookmarkPlus size={14} />
                </button>
                <h3 className="text-white font-bold text-xs sm:text-sm leading-snug line-clamp-2 relative z-10 drop-shadow-sm pr-2">
                    {project.title}
                </h3>
            </div>

            <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between space-y-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 bg-slate-100 border border-slate-200/60 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 shadow-2xs">
                            {(project.ngoName || 'N').charAt(0)}
                        </div>
                        <p className="text-xs font-bold text-slate-700 truncate flex items-center gap-1 min-w-0">
                            {project.ngoName || project.ngoUsername || 'Unknown NGO'}
                            {project.ngoVerified && <BadgeCheck size={13} className="text-indigo-500 shrink-0" />}
                        </p>
                    </div>

                    {project.requiredSkills?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {project.requiredSkills.slice(0, 3).map(s => (
                                <span key={s} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200/40 px-2 py-0.5 rounded-md font-medium">
                                    {s}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="space-y-1.5 pt-0.5">
                        {project.location && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium min-w-0">
                                <MapPin size={12} className="text-slate-400 shrink-0" />
                                <span className="truncate">{project.location}</span>
                            </div>
                        )}
                        {dateRange && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium min-w-0">
                                <Calendar size={12} className="text-slate-400 shrink-0" />
                                <span className="truncate">{dateRange}</span>
                            </div>
                        )}
                        {project.duration && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium min-w-0">
                                <Clock size={12} className="text-slate-400 shrink-0" />
                                <span className="truncate">{project.duration}</span>
                            </div>
                        )}
                        {spotsLeft !== null && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                <Users size={12} className="text-slate-400 shrink-0" />
                                {spotsLeft > 0 ? (
                                    <span className="text-emerald-600 font-semibold">{spotsLeft} spots left</span>
                                ) : (
                                    <span className="text-slate-400">All spots filled</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                    {goal > 0 && (
                        <div>
                            <div className="flex flex-wrap justify-between gap-x-2 gap-y-1 text-[11px] font-bold mb-1.5">
                                <span className="text-slate-800">NPR {raised.toLocaleString()} raised</span>
                                <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-sm">{pct}%</span>
                            </div>
                            <ProgressBar raised={raised} goal={goal} />
                            <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                                of NPR {goal.toLocaleString()} goal · {project.donorCount ?? 0} donors
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col xs:flex-row gap-2">
                        {goal > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDonate?.(project);
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/60 text-rose-600 text-xs font-bold py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                            >
                                <Heart size={13} className="fill-rose-600/10" /> Donate
                            </button>
                        )}
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs hover:shadow-sm cursor-pointer"
                        >
                            Volunteer
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}