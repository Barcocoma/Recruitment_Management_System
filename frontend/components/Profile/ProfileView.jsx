import React from 'react';
import { motion } from 'motion/react';
import { LogOut, Mail, Building2, ShieldCheck } from 'lucide-react';

export const ProfileView = ({ onSignOut }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Company Profile</h1>
          <p className="text-slate-500">Manage your organization's public and private information.</p>
        </div>
        <button 
          onClick={onSignOut}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4 relative overflow-hidden">
              <img src="https://picsum.photos/seed/user/200/200" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] py-1 font-bold">CHANGE</button>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Joshua Barcoma</h2>
            <p className="text-indigo-600 font-semibold text-sm">HR Director</p>
            <div className="mt-6 w-full pt-6 border-t space-y-4">
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Mail className="w-4 h-4" />
                barcomajoshua87@gmail.com
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Building2 className="w-4 h-4" />
                SprintHR Inc.
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-bold">Premium Plan</span>
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed mb-4">You have access to all AI features and unlimited job postings.</p>
            <button className="w-full py-2 bg-white text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors">
              Manage Subscription
            </button>
          </div>
        </div>

        {/* Settings Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Company Name</label>
                <input type="text" defaultValue="SprintHR Inc." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Industry</label>
                <input type="text" defaultValue="Technology" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Company Website</label>
                <input type="text" defaultValue="https://sprinthr.io" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Headquarters</label>
                <input type="text" defaultValue="San Francisco, CA" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="mt-8 pt-8 border-t flex justify-end">
              <button className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Security</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                </div>
                <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-slate-900">Password</p>
                  <p className="text-xs text-slate-500">Last changed 3 months ago.</p>
                </div>
                <button className="text-indigo-600 font-bold text-sm">Update</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
