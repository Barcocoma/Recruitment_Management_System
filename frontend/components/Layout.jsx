import React from 'react';
import { LayoutDashboard, Bell, UserCircle, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header className="h-16 bg-white border-b px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl">sprintHR</span>
        </div>
        
        <nav className="flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('job-list')}
            className={cn(
              "h-16 px-1 border-b-2 transition-all font-medium text-sm",
              activeTab === 'job-list' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            Job List
          </button>
          <button 
            onClick={() => setActiveTab('applicants')}
            className={cn(
              "h-16 px-1 border-b-2 transition-all font-medium text-sm",
              activeTab === 'applicants' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            Applicants
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "h-16 px-1 border-b-2 transition-all font-medium text-sm",
              activeTab === 'settings' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            Settings
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-slate-600">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-6 border-l">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
            <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" referrerPolicy="no-referrer" />
          </div>
          <button onClick={() => setActiveTab('profile')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <UserCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="mt-12 border-t py-8 px-8 max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-400 font-medium">
      <div className="flex items-center gap-6">
        <button className="hover:text-slate-600">Privacy Policy</button>
        <button className="hover:text-slate-600">Terms of Service</button>
        <button className="hover:text-slate-600">Help Center</button>
      </div>
      <div>© 2024 sprintHR. All rights reserved.</div>
    </footer>
  );
};

