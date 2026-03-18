import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown } from 'lucide-react';

export const AddJobModal = ({ isOpen, onClose, onSubmit, editingJob }) => {
  const formRef = React.useRef(null);
  const isEditMode = !!editingJob;

  React.useEffect(() => {
    if (isEditMode && formRef.current && editingJob) {
      // Map database field names to form field names
      const fieldMapping = {
        'experience_level': 'experience',
        'salary_range': 'salary_range',
        'required_skills': 'required_skills',
        'application_deadline': 'application_deadline',
        'special_instructions': 'special_instructions',
        'title': 'title',
        'description': 'description',
        'location': 'location',
        'type': 'type',
      };

      // Populate form with editing job data
      Object.keys(editingJob).forEach(key => {
        const formFieldName = fieldMapping[key] || key;
        const input = formRef.current.querySelector(`[name="${formFieldName}"]`);
        if (input) {
          let value = editingJob[key] || '';
          
          // Handle date fields - format to YYYY-MM-DD for date input
          if (key === 'application_deadline' && value) {
            try {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                value = date.toISOString().split('T')[0];
              }
            } catch (e) {
              console.error('Error formatting date:', e);
            }
          }
          
          input.value = value;
        }
      });
    } else if (formRef.current) {
      formRef.current.reset();
    }
  }, [isEditMode, editingJob, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          ></motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{isEditMode ? 'Edit Job' : 'Post a New Role'}</h2>
                <p className="text-sm text-slate-500">{isEditMode ? 'Update the job details.' : 'Fill in the details to list a new opportunity.'}</p>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form ref={formRef} id="add-job-form" onSubmit={onSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Job Title</label>
                <input name="title" required type="text" placeholder="e.g. Senior Frontend Engineer" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Job Description</label>
                <textarea name="description" rows={4} placeholder="Describe the role and responsibilities..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Location</label>
                  <input name="location" required type="text" placeholder="e.g. Remote, San Francisco" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Experience Level</label>
                  <div className="relative">
                    <select 
                      name="experience" 
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer appearance-none hover:border-indigo-300 transition-colors"
                    >
                      <option value="">Select experience level</option>
                      <option value="Junior">Junior (1-2 years)</option>
                      <option value="Mid-level">Mid-level (3-5 years)</option>
                      <option value="Senior">Senior (5+ years)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Employment Type</label>
                  <div className="relative">
                    <select 
                      name="type" 
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer appearance-none hover:border-indigo-300 transition-colors"
                    >
                      <option value="">Select employment type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Salary Range</label>
                  <input name="salary_range" type="text" placeholder="e.g. $120k - $150k" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Required Skills</label>
                <input name="required_skills" type="text" placeholder="e.g. React, Tailwind CSS, TypeScript" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Application Deadline</label>
                <input name="application_deadline" type="date" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Special Instructions</label>
                <textarea name="special_instructions" rows={2} placeholder="Any additional notes for applicants..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
              </div>
              <div className="p-6 border-t bg-slate-50 flex items-center justify-end gap-4 -mx-6 -mb-6">
                <button type="button" onClick={onClose} className="px-6 py-2 text-slate-600 font-bold hover:text-slate-800 transition-all">Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  {isEditMode ? 'Update Job' : 'Post Job Listing'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
