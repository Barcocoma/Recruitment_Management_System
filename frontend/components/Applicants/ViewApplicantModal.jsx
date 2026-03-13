import React from 'react';
import { X, User, Mail, Phone, Briefcase, Calendar, FileText, MessageSquare } from 'lucide-react';
import { api } from '../../lib/api';

export const ViewApplicantModal = ({ applicant, isOpen, onClose }) => {
  if (!isOpen || !applicant) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Applicant Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Full Name</div>
                  <div className="text-sm font-medium text-slate-900">{applicant.name || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Email Address</div>
                  <div className="text-sm font-medium text-slate-900">{applicant.email || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Phone Number</div>
                  <div className="text-sm font-medium text-slate-900">{applicant.phone || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Date Applied</div>
                  <div className="text-sm font-medium text-slate-900">
                    {formatDate(applicant.date_applied || applicant.dateApplied)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Job Information</h3>
            
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Job Position</div>
                <div className="text-sm font-medium text-slate-900">{applicant.job_title || applicant.jobTitle || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Application Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Application Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    applicant.status === 'Ready to Hire' || applicant.status === 'Hired' ? 'bg-emerald-500' : 
                    applicant.status === 'Shortlisted' || applicant.status === 'AI Shortlisted' ? 'bg-blue-500' :
                    applicant.status === 'Under Review' ? 'bg-amber-500' :
                    applicant.status === 'Rejected' ? 'bg-red-500' :
                    'bg-slate-400'
                  }`}></div>
                  <span className="text-sm font-medium text-slate-900">{applicant.status || 'N/A'}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">AI Score</div>
                <div className="text-sm font-medium text-slate-900">
                  {applicant.ai_score !== undefined ? applicant.ai_score : (applicant.aiScore !== undefined ? applicant.aiScore : 0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Resume */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Resume</h3>
            
            {applicant.resume_path || applicant.resumePath ? (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">
                    {applicant.resume_name || applicant.resumeName || 'resume.pdf'}
                  </div>
                  <div className="text-xs text-slate-500">Click to view resume</div>
                </div>
                <a
                  href={api.getResumeUrl(applicant.resume_path || applicant.resumePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View Resume
                </a>
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic">No resume uploaded</div>
            )}
          </div>

          {/* Cover Letter */}
          {applicant.cover_letter || applicant.coverLetter ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Cover Letter</h3>
              
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">
                      {applicant.cover_letter || applicant.coverLetter}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Application ID</div>
                <div className="text-sm font-mono text-slate-600">{applicant.id || 'N/A'}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Created At</div>
                <div className="text-sm text-slate-600">{formatDate(applicant.created_at || applicant.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

