import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, Users, LayoutDashboard } from 'lucide-react';

export const Register = ({ onRegister, setAuthState }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB]">
      <header className="h-16 border-b bg-white flex items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">HR System</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-slate-600 font-medium">Help</button>
          <button 
            onClick={() => setAuthState('login')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Login
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-white rounded-2xl shadow-xl shadow-indigo-100/50 p-10 border border-slate-100"
        >
          <h1 className="text-3xl font-bold mb-2">Register Your Company</h1>
          <p className="text-slate-500 mb-8">Get started with our unified HR platform today.</p>

          <form onSubmit={onRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Company Name</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  required
                  name="company_name"
                  type="text" 
                  placeholder="Enter your company name"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Business Email</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  required
                  name="email"
                  type="email" 
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Company Type</label>
              <select name="company_type" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white">
                <option value="">Select industry type</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <input 
                required
                name="password"
                type="password" 
                placeholder="Create a strong password"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-slate-500">
                I agree to the <span className="text-indigo-600 font-medium cursor-pointer">Terms of Service</span> and <span className="text-indigo-600 font-medium cursor-pointer">Privacy Policy</span>.
              </span>
            </div>

            <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]">
              Register Company
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500">
            Already have an account? <button onClick={() => setAuthState('login')} className="text-indigo-600 font-bold">Log in</button>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export const Login = ({ onLogin, setAuthState }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border border-slate-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <LayoutDashboard className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold">SprintHR</h1>
          <p className="text-slate-500 font-medium">Welcome Back</p>
          <p className="text-xs text-slate-400">Manage your workforce with ease</p>
        </div>

        <form onSubmit={onLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <input 
              required
              name="email"
              type="email" 
              placeholder="name@company.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <button type="button" className="text-xs text-blue-600 font-medium">Forgot Password?</button>
            </div>
            <input 
              required
              name="password"
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
            <span className="text-sm text-slate-500">Keep me logged in</span>
          </div>

          <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
            Log In
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500">
          Don't have an account? <button onClick={() => setAuthState('register')} className="text-blue-600 font-bold hover:text-blue-700">Sign up</button>
        </p>
      </motion.div>
    </div>
  );
};

