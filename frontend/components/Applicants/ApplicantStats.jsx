import React from 'react';
import { Users, Plus, BrainCircuit, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ApplicantStats = ({ filter, setFilter, stats = { total: 0, new: 0, shortlisted: 0 } }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <button 
        onClick={() => setFilter('total')}
        className={cn(
          "p-6 rounded-2xl border transition-all text-left flex flex-col justify-between h-44 relative overflow-hidden group",
          filter === 'total' ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white border-slate-100 hover:border-blue-200"
        )}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="flex justify-between items-start relative z-10">
          <span className={cn("font-semibold text-sm", filter === 'total' ? "text-blue-100" : "text-slate-500")}>Total Applicants</span>
          <div className={cn("p-2 rounded-lg", filter === 'total' ? "bg-white/20" : "bg-slate-50")}>
            <Users className={cn("w-5 h-5", filter === 'total' ? "text-white" : "text-slate-400")} />
          </div>
        </div>
        <div className="relative z-10">
          <div className={cn("text-4xl font-bold mb-1", filter === 'total' ? "text-white" : "text-slate-900")}>{stats.total || 0}</div>
          <div className={cn("flex items-center gap-1 text-sm font-medium", filter === 'total' ? "text-blue-100" : "text-emerald-500")}>
            <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
            +12.5% <span className={cn("ml-1", filter === 'total' ? "text-blue-200" : "text-slate-400")}>vs last month</span>
          </div>
        </div>
      </button>

      <button 
        onClick={() => setFilter('new')}
        className={cn(
          "p-6 rounded-2xl border transition-all text-left flex flex-col justify-between h-44 relative overflow-hidden group",
          filter === 'new' ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white border-slate-100 hover:border-blue-200"
        )}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="flex justify-between items-start relative z-10">
          <span className={cn("font-semibold text-sm", filter === 'new' ? "text-blue-100" : "text-slate-500")}>New Applicants</span>
          <div className={cn("p-2 rounded-lg", filter === 'new' ? "bg-white/20" : "bg-slate-50")}>
            <Plus className={cn("w-5 h-5", filter === 'new' ? "text-white" : "text-slate-400")} />
          </div>
        </div>
        <div className="relative z-10">
          <div className={cn("text-4xl font-bold mb-1", filter === 'new' ? "text-white" : "text-slate-900")}>{stats.new || 0}</div>
          <div className={cn("flex items-center gap-1 text-sm font-medium", filter === 'new' ? "text-blue-100" : "text-emerald-500")}>
            <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
            +5.2% <span className={cn("ml-1", filter === 'new' ? "text-blue-200" : "text-slate-400")}>since Monday</span>
          </div>
        </div>
      </button>

      <button 
        onClick={() => setFilter('shortlisted')}
        className={cn(
          "p-6 rounded-2xl border transition-all text-left flex flex-col justify-between h-44 relative overflow-hidden group",
          filter === 'shortlisted' ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white border-slate-100 hover:border-blue-200"
        )}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="flex justify-between items-start relative z-10">
          <span className={cn("font-semibold text-sm", filter === 'shortlisted' ? "text-blue-100" : "text-slate-500")}>AI Shortlisted</span>
          <div className={cn("p-2 rounded-lg", filter === 'shortlisted' ? "bg-white/20" : "bg-slate-50")}>
            <BrainCircuit className={cn("w-5 h-5", filter === 'shortlisted' ? "text-white" : "text-slate-400")} />
          </div>
        </div>
        <div className="relative z-10">
          <div className={cn("text-4xl font-bold mb-1", filter === 'shortlisted' ? "text-white" : "text-slate-900")}>
            {stats.ai_shortlisted !== undefined ? stats.ai_shortlisted : (stats.shortlisted || 0)}
          </div>
          <div className={cn("flex items-center gap-1 text-sm font-medium", filter === 'shortlisted' ? "text-blue-100" : "text-blue-500")}>
            <CheckCircle2 className="w-4 h-4" />
            High Priority <span className={cn("ml-1", filter === 'shortlisted' ? "text-blue-200" : "text-slate-400")}>Requires review</span>
          </div>
        </div>
      </button>
    </div>
  );
};
