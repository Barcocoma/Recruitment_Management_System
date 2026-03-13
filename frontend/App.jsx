import React, { useState, useEffect } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { api } from './lib/api';

// Components
import { Header, Footer } from './components/Layout';
import { Register } from './components/Auth';
import { Login } from './components/Auth';
import { JobTable, AddJobModal, ApplyJobModal } from './components/Jobs';
import { ApplicantStats, ApplicantTable } from './components/Applicants';
import { ProfileView } from './components/Profile';
import { SettingsView } from './components/Settings';

export default function App() {
  // Check if user is authenticated from localStorage
  const getInitialAuthState = () => {
    const savedAuth = localStorage.getItem('authState');
    const user = localStorage.getItem('user');
    
    // If authState says authenticated but no user data, reset to login
    if (savedAuth === 'authenticated' && !user) {
      localStorage.removeItem('authState');
      return 'login';
    }
    
    return savedAuth || 'login';
  };

  const [authState, setAuthState] = useState(getInitialAuthState);
  
  // Get initial tab from URL hash or default to 'job-list'
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#applicants' || hash === '#/applicants') {
        return 'applicants';
      }
      if (hash === '#profile' || hash === '#/profile') {
        return 'profile';
      }
      if (hash === '#settings' || hash === '#/settings') {
        return 'settings';
      }
      if (hash === '#job-list' || hash === '#/job-list') {
        return 'job-list';
      }
    }
    return 'job-list';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isPublicView, setIsPublicView] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [applicantFilter, setApplicantFilter] = useState('total');
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [applyingJob, setApplyingJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, new: 0, shortlisted: 0 });
  const [aiScoreThreshold, setAiScoreThreshold] = useState(70);
  const [isPublicApplyView, setIsPublicApplyView] = useState(false);

  // Check URL on mount for public apply link
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/apply/')) {
      const jobId = path.split('/apply/')[1];
      setIsPublicApplyView(true);
      // Fetch job and show application form directly
      api.getJob(jobId).then(job => {
        if (job) {
          setApplyingJob(job);
        } else {
          alert('Job not found');
          window.location.href = '/';
        }
      }).catch(() => {
        alert('Failed to load job details');
        window.location.href = '/';
      });
    }
  }, []);

  // Update URL hash when tab changes
  useEffect(() => {
    if (authState === 'authenticated' && !isPublicView && !isPublicApplyView) {
      const hashMap = {
        'job-list': '#job-list',
        'applicants': '#applicants',
        'profile': '#profile',
        'settings': '#settings'
      };
      const newHash = hashMap[activeTab] || '#job-list';
      if (window.location.hash !== newHash) {
        window.location.hash = newHash;
      }
    }
  }, [activeTab, authState, isPublicView, isPublicApplyView]);

  // Listen for hash changes (back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#applicants' || hash === '#/applicants') {
        setActiveTab('applicants');
      } else if (hash === '#profile' || hash === '#/profile') {
        setActiveTab('profile');
      } else if (hash === '#settings' || hash === '#/settings') {
        setActiveTab('settings');
      } else if (hash === '#job-list' || hash === '#/job-list' || hash === '' || hash === '#') {
        setActiveTab('job-list');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (authState === 'authenticated') {
      // Verify user is still in localStorage
      const user = localStorage.getItem('user');
      if (!user) {
        console.warn('⚠️ User data missing, redirecting to login');
        setAuthState('login');
        localStorage.removeItem('authState');
        return;
      }
      localStorage.setItem('authState', 'authenticated');
    } else if (authState === 'login' || authState === 'register') {
      // Clear all user data when logging out
      localStorage.removeItem('authState');
      localStorage.removeItem('user');
      setJobs([]);
      setApplicants([]);
      setStats({ total: 0, new: 0, shortlisted: 0 });
    }
  }, [authState]);

  const loadData = async (filter = applicantFilter) => {
    try {
      setLoading(true);
      const [jobsData, applicantsData, statsData, settingsData] = await Promise.all([
        api.getJobs(),
        api.getApplicants(filter), // Pass filter parameter
        api.getApplicantStats(),
        api.getSettings().catch(() => ({ ai_score_threshold: 70 })) // Default to 70 if settings fail
      ]);
      console.log('📊 Loaded data:', {
        jobs: jobsData.length,
        applicants: applicantsData.length,
        stats: statsData,
        filter: filter
      });
      console.log('📊 Applicants data:', applicantsData);
      
      setJobs(jobsData);
      setApplicants(applicantsData);
      setStats(statsData);
      setAiScoreThreshold(settingsData.ai_score_threshold || 70);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (authState === 'authenticated') {
      loadData();
    }
  }, [authState]);

  // Reload applicants when filter changes
  useEffect(() => {
    if (authState === 'authenticated') {
      loadData(applicantFilter);
    }
  }, [applicantFilter]);

  const handleSettingsUpdate = () => {
    // Reload settings and stats when settings are updated
    loadData();
  };

  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      // Clear old user data before login
      localStorage.removeItem('user');
      localStorage.removeItem('authState');
      
      const result = await api.login({
        email: formData.get('email'),
        password: formData.get('password')
      });
      
      // Verify user data was stored
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('Failed to store user session');
      }
      
      setAuthState('authenticated');
      localStorage.setItem('authState', 'authenticated');
      
      // Reload data for the new user
      await loadData();
    } catch (error) {
      alert(error.message);
      // Clear any partial data on error
      localStorage.removeItem('user');
      localStorage.removeItem('authState');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await api.register({
        company_name: formData.get('company_name'),
        email: formData.get('email'),
        password: formData.get('password'),
        company_type: formData.get('company_type')
      });
      alert('Registered successfully! Please login with your account.');
      setAuthState('login');
    } catch (error) {
      alert(error.message);
    }
  };

  // Job Handlers
  const addJob = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const jobData = {
        title: formData.get('title'),
        department: '',
        location: formData.get('location'),
        type: formData.get('type'),
        status: 'Active',
        description: formData.get('description') || '',
        experience_level: formData.get('experience') || '',
        salary_range: formData.get('salary_range') || '',
        required_skills: formData.get('required_skills') || '',
        application_deadline: formData.get('application_deadline') || null,
        special_instructions: formData.get('special_instructions') || ''
      };

      if (editingJob) {
        await api.updateJob(editingJob.id, jobData);
      } else {
        await api.createJob(jobData);
      }
      
      await loadData();
      setShowAddJobModal(false);
      setEditingJob(null);
    } catch (error) {
      alert('Failed to save job: ' + error.message);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowAddJobModal(true);
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await api.deleteJob(jobId);
      await loadData();
    } catch (error) {
      alert('Failed to delete job: ' + error.message);
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      let resumeName = '';
      let resumePath = '';
      
      // Handle file upload
      const resumeFile = formData.get('resume');
      if (resumeFile && resumeFile.size > 0) {
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        const fileExtension = resumeFile.name.split('.').pop().toLowerCase();
        
        if (!['pdf', 'docx', 'doc'].includes(fileExtension)) {
          alert('Only PDF and DOCX files are allowed');
          return;
        }
        
        // Upload file
        const uploadResult = await api.uploadResume(resumeFile);
        resumeName = uploadResult.filename;
        resumePath = uploadResult.file_path;
      }
      
      await api.createApplicant({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        job_id: applyingJob.id,
        job_title: applyingJob.title,
        resume_name: resumeName,
        resume_path: resumePath,
        cover_letter: formData.get('cover_letter') || ''
      });
      
      // If it's a public apply view, keep the form open and let the modal handle success message
      if (isPublicApplyView) {
        // Don't close the modal, just let it show success and reset
        return;
      }
      
      // For authenticated users, close the modal and reload data
      setApplyingJob(null);
      await loadData();
      alert('Application submitted successfully!');
    } catch (error) {
      alert('Failed to submit application: ' + error.message);
    }
  };

  const handleCloseJobModal = () => {
    setShowAddJobModal(false);
    setEditingJob(null);
  };

  // Public apply view (from direct link)
  if (isPublicApplyView) {
    return (
      <div className="min-h-screen bg-[#F8F9FB]">
        <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <Plus className="text-white w-6 h-6 rotate-45" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">SprintHR <span className="text-indigo-600">Careers</span></span>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-5rem)]">
          {applyingJob ? (
            <ApplyJobModal 
              job={applyingJob} 
              isStandalone={true}
              onClose={() => {
                // Don't navigate away, just reset form
              }} 
              onSubmit={submitApplication} 
            />
          ) : (
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">Application Submitted Successfully!</h1>
              <p className="text-slate-600 mb-8">Thank you for your interest. We'll review your application and get back to you soon.</p>
              <button
                onClick={() => {
                  setIsPublicApplyView(false);
                  setIsPublicView(true);
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
              >
                View More Jobs
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  if (isPublicView) {
    return (
      <div className="min-h-screen bg-[#F8F9FB]">
        <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <Plus className="text-white w-6 h-6 rotate-45" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">SprintHR <span className="text-indigo-600">Careers</span></span>
            </div>
            <button 
              onClick={() => setIsPublicView(false)}
              className="px-4 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
              Back to Admin Dashboard
            </button>
          </div>
        </header>
        <main className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto py-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Find your next dream job</h1>
            <p className="text-slate-500 text-lg">Join our mission to revolutionize HR technology. We're looking for passionate individuals to help us build the future.</p>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading jobs...</div>
          ) : (
            <JobTable 
              jobs={jobs.filter(j => j.status === 'Active')} 
              onApply={setApplyingJob}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
            />
          )}
        </main>
        <Footer />
        <ApplyJobModal 
          job={applyingJob} 
          onClose={() => setApplyingJob(null)} 
          onSubmit={submitApplication} 
        />
      </div>
    );
  }

  if (authState === 'register') {
    return <Register onRegister={handleRegister} setAuthState={setAuthState} />;
  }

  if (authState === 'login') {
    return <Login onLogin={handleLogin} setAuthState={setAuthState} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="p-8 max-w-7xl mx-auto">
        {activeTab === 'job-list' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Job List</h1>
                <p className="text-slate-500">Manage and track your open positions</p>
              </div>
              <button 
                onClick={() => {
                  setEditingJob(null);
                  setShowAddJobModal(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Plus className="w-5 h-5" />
                Add Job
              </button>
            </div>
            {loading ? (
              <div className="text-center py-12">Loading jobs...</div>
            ) : (
              <JobTable 
                jobs={jobs} 
                onApply={setApplyingJob}
                onEdit={handleEditJob}
                onDelete={handleDeleteJob}
              />
            )}
          </div>
        ) : activeTab === 'applicants' ? (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Applicant Management</h1>
              <p className="text-slate-500">Optimize your hiring pipeline with AI-driven insights and real-time tracking.</p>
            </div>
            <ApplicantStats 
              filter={applicantFilter} 
              setFilter={setApplicantFilter}
              stats={stats}
            />
            {loading ? (
              <div className="text-center py-12">Loading applicants...</div>
            ) : (
              <ApplicantTable 
                applicants={applicants} 
                filter={applicantFilter}
                onRefresh={loadData}
                aiScoreThreshold={aiScoreThreshold}
              />
            )}
          </div>
        ) : activeTab === 'settings' ? (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
              <p className="text-slate-500">Configure your recruitment system preferences.</p>
            </div>
            <SettingsView onSettingsUpdate={handleSettingsUpdate} />
          </div>
        ) : (
          <ProfileView onSignOut={() => {
            // Clear all user data on logout
            localStorage.removeItem('authState');
            localStorage.removeItem('user');
            setAuthState('login');
            // Clear state
            setJobs([]);
            setApplicants([]);
            setStats({ total: 0, new: 0, shortlisted: 0 });
          }} />
        )}
      </main>

      <Footer />

      <AddJobModal 
        isOpen={showAddJobModal} 
        onClose={handleCloseJobModal}
        onSubmit={addJob}
        editingJob={editingJob}
      />

      <ApplyJobModal 
        job={applyingJob} 
        onClose={() => setApplyingJob(null)} 
        onSubmit={submitApplication} 
      />
    </div>
  );
}
