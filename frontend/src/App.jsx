import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { INITIAL_JOBS, INITIAL_APPLICANTS } from './data';

// Consolidated Components
import { Header, Footer } from './components/Layout';
import { Register, Login } from './components/Auth';
import { JobTable, AddJobModal, ApplyJobModal } from './components/Jobs';
import { ApplicantStats, ApplicantTable } from './components/Applicants';
import { ProfileView } from './components/Profile';

export default function App() {
  const [authState, setAuthState] = useState('register');
  const [activeTab, setActiveTab] = useState('job-list');
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [applicants, setApplicants] = useState(INITIAL_APPLICANTS);
  const [applicantFilter, setApplicantFilter] = useState('total');
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [applyingJob, setApplyingJob] = useState(null);

  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/apply/')) {
      const jobId = path.split('/apply/')[1];
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        setApplyingJob(job);
      }
    }
  }, [jobs]);

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthState('authenticated');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setAuthState('authenticated');
  };

  const addJob = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newJob = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.get('title'),
      department: formData.get('department'),
      location: formData.get('location'),
      type: formData.get('type'),
      status: 'Active',
    };
    setJobs([newJob, ...jobs]);
    setShowAddJobModal(false);
  };

  const submitApplication = (e) => {
    e.preventDefault();
    setApplyingJob(null);
    alert('Application submitted successfully!');
  };

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
                onClick={() => setShowAddJobModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Plus className="w-5 h-5" />
                Add Job
              </button>
            </div>
            <JobTable jobs={jobs} onApply={setApplyingJob} />
          </div>
        ) : activeTab === 'applicants' ? (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Applicant Management</h1>
              <p className="text-slate-500">Optimize your hiring pipeline with AI-driven insights and real-time tracking.</p>
            </div>
            <ApplicantStats filter={applicantFilter} setFilter={setApplicantFilter} />
            <ApplicantTable applicants={applicants} filter={applicantFilter} />
          </div>
        ) : (
          <ProfileView onSignOut={() => setAuthState('login')} />
        )}
      </main>

      <Footer />

      <AddJobModal 
        isOpen={showAddJobModal} 
        onClose={() => setShowAddJobModal(false)} 
        onSubmit={addJob} 
      />

      <ApplyJobModal 
        job={applyingJob} 
        onClose={() => setApplyingJob(null)} 
        onSubmit={submitApplication} 
      />
    </div>
  );
}

