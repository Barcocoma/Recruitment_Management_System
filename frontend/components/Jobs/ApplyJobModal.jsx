import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Briefcase, MapPin, Clock, CheckCircle2, UserCircle, Upload, Send, CheckCircle } from 'lucide-react';

export const ApplyJobModal = ({ job, onClose, onSubmit, isStandalone = false }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(e);
      setIsSubmitted(true);
      // Reset form after 2 seconds
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.reset();
        }
        setIsSubmitted(false);
      }, 2000);
    } catch (error) {
      // Error is already handled in parent
    }
  };

  // Standalone view (for public application links)
  if (isStandalone) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[calc(100vh-8rem)]">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (formRef.current) {
                formRef.current.reset();
              }
              setIsSubmitted(false);
            }}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-slate-600 shadow-sm"
            title="Clear Form"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Panel: Job Info */}
          <div className="w-full md:w-2/5 bg-slate-50 p-8 flex flex-col overflow-y-auto">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Briefcase className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-lg">CareerPortal</span>
            </div>

            <div className="space-y-6">
              <div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {job.type}
                </span>
                <h2 className="text-3xl font-bold text-slate-900 mt-4 leading-tight">{job.title}</h2>
                <div className="flex items-center gap-4 text-slate-500 text-sm mt-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Remote Friendly
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900">The Role</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {job.description || "Join our core product team to lead the design of our next-generation enterprise platform. You'll work closely with engineers and product managers to craft seamless experiences."}
                </p>
              </div>

              {job.required_skills && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900">Required Skills</h3>
                  <p className="text-slate-600 text-sm">{job.required_skills}</p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-8">
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <img src="https://picsum.photos/seed/office/400/225" alt="Office" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent flex items-end p-4">
                  <p className="text-white text-xs font-medium italic">"Building the future of digital collaboration."</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="flex-1 p-6 md:p-10 bg-white overflow-y-auto flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Submit Application</h2>
              <p className="text-slate-500 text-sm">Please provide your details and resume to apply.</p>
            </div>

            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-8 mb-6 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Application Submitted Successfully!</h3>
                <p className="text-slate-600 text-sm mb-2 text-center px-4">Thank you for your interest. We'll review your application and get back to you soon.</p>
                <p className="text-slate-400 text-xs">You can submit another application below...</p>
              </div>
            ) : null}
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input required name="name" type="text" placeholder="John Doe" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input required name="email" type="email" placeholder="john@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                  <input required name="phone" type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Upload Resume <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-indigo-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Drag and drop your resume here</p>
                  <p className="text-xs text-slate-400 mt-1">Supported formats: .pdf, .docx only (Max 5MB)</p>
                  <input 
                    type="file" 
                    name="resume" 
                    accept=".pdf,.docx" 
                    required
                    className="mt-4 px-6 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-indigo-600 shadow-sm hover:shadow-md transition-all cursor-pointer" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Cover Letter (Optional)</label>
                <textarea name="cover_letter" rows={4} placeholder="Tell us why you're a great fit..." className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
              </div>

              <div className="mt-auto pt-4">
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
                  Submit Application
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Regular modal view (for authenticated users)
  return (
    <AnimatePresence>
      {job && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          ></motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-slate-600 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Panel: Job Info */}
            <div className="w-full md:w-2/5 bg-slate-50 p-8 flex flex-col overflow-y-auto max-h-[90vh]">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="text-white w-4 h-4" />
                </div>
                <span className="font-bold text-lg">CareerPortal</span>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {job.type}
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900 mt-4 leading-tight">{job.title}</h2>
                  <div className="flex items-center gap-4 text-slate-500 text-sm mt-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Remote Friendly
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900">The Role</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {job.description || "Join our core product team to lead the design of our next-generation enterprise platform. You'll work closely with engineers and product managers to craft seamless experiences."}
                  </p>
                </div>

                {job.required_skills && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900">Required Skills</h3>
                    <p className="text-slate-600 text-sm">{job.required_skills}</p>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-8">
                <div className="relative rounded-2xl overflow-hidden aspect-video">
                  <img src="https://picsum.photos/seed/office/400/225" alt="Office" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent flex items-end p-4">
                    <p className="text-white text-xs font-medium italic">"Building the future of digital collaboration."</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Form */}
            <div className="flex-1 p-6 md:p-10 bg-white overflow-y-auto max-h-[90vh] flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Submit Application</h2>
                <p className="text-slate-500 text-sm">Please provide your details and resume to apply.</p>
              </div>

              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-8 mb-6 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Application Submitted Successfully!</h3>
                  <p className="text-slate-600 text-sm mb-2 text-center px-4">Thank you for your interest. We'll review your application and get back to you soon.</p>
                  <p className="text-slate-400 text-xs">You can submit another application below...</p>
                </div>
              ) : null}
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input required name="name" type="text" placeholder="John Doe" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <input required name="email" type="email" placeholder="john@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                    <input required name="phone" type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Upload Resume <span className="text-red-500">*</span></label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Drag and drop your resume here</p>
                    <p className="text-xs text-slate-400 mt-1">Supported formats: .pdf, .docx only (Max 5MB)</p>
                    <input 
                      type="file" 
                      name="resume" 
                      accept=".pdf,.docx" 
                      required
                      className="mt-4 px-6 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-indigo-600 shadow-sm hover:shadow-md transition-all cursor-pointer" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Cover Letter (Optional)</label>
                  <textarea name="cover_letter" rows={4} placeholder="Tell us why you're a great fit..." className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
                </div>

                <div className="mt-auto pt-4">
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
                    Submit Application
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
