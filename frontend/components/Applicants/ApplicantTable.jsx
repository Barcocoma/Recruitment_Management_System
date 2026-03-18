import React from 'react';
import { Search, Filter, FileText, MoreVertical, ArrowUpDown, ArrowUp, ArrowDown, Eye, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { AIScoreModal } from './AIScoreModal';
import { ViewApplicantModal } from './ViewApplicantModal';

export const ApplicantTable = ({ applicants, filter, onRefresh, aiScoreThreshold = 70 }) => {
  const [sortConfig, setSortConfig] = React.useState({ key: 'dateApplied', direction: 'desc' });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [positionFilter, setPositionFilter] = React.useState('All Positions');
  const [showMenu, setShowMenu] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [selectedApplicant, setSelectedApplicant] = React.useState(null);
  const [scoreDetails, setScoreDetails] = React.useState(null);
  const [showScoreModal, setShowScoreModal] = React.useState(false);
  const [loadingDetails, setLoadingDetails] = React.useState(false);
  const [viewApplicant, setViewApplicant] = React.useState(null);
  const [showViewModal, setShowViewModal] = React.useState(false);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this applicant?')) {
      try {
        await api.deleteApplicant(id);
        if (onRefresh) onRefresh();
      } catch (error) {
        alert('Failed to delete applicant: ' + error.message);
      }
    }
  };

  const handleScoreClick = async (applicant) => {
    setSelectedApplicant(applicant);
    setLoadingDetails(true);
    setShowScoreModal(true);
    
    try {
      // Fetch applicant details with score breakdown
      const details = await api.getApplicant(applicant.id);
      setScoreDetails({
        breakdown: details.ai_score_breakdown,
        analysis: details.resume_analysis
      });
    } catch (error) {
      console.error('Failed to load score details:', error);
      setScoreDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="w-3.5 h-3.5 ml-1 text-blue-600" /> : 
      <ArrowDown className="w-3.5 h-3.5 ml-1 text-blue-600" />;
  };

  const uniquePositions = React.useMemo(() => {
    const positions = new Set(applicants.map(a => a.job_title || a.jobTitle).filter(Boolean));
    return ['All Positions', ...Array.from(positions)];
  }, [applicants]);

  const processedApplicants = React.useMemo(() => {
    console.log('🔍 ApplicantTable filtering:', {
      filter,
      applicantsCount: applicants.length,
      applicants: applicants
    });
    
    let result = applicants.filter(a => {
      if (filter === 'new') {
        // "New Applicants" filter: Backend already filtered by created_at >= 24_hours_ago
        // So we just show all applicants returned from backend (no need to filter again)
        return true;
      }
      if (filter === 'shortlisted') {
        // "AI Shortlisted" filter shows:
        // 1) AI score >= threshold (normal qualified)
        // 2) Qualified / Highly Qualified / Shortlisted statuses
        // 3) Needs Review BUT has any AI score > 0 (meaning: low score but has some skills / analysis)
        const aiScore = a.ai_score !== undefined ? a.ai_score : (a.aiScore !== undefined ? a.aiScore : 0);
        const isQualifiedStatus = ['Qualified', 'Highly Qualified', 'Shortlisted'].includes(a.status);
        const isNeedsReviewWithAI = a.status === 'Needs Review' && aiScore > 0;
        return aiScore >= aiScoreThreshold || isQualifiedStatus || isNeedsReviewWithAI;
      }
      if (filter === 'total') {
        // "Total Applicants" filter shows ALL applicants (no status filter)
        return true;
      }
      // Default: show all applicants
      return true;
    });

    // Position filter
    if (positionFilter !== 'All Positions') {
      result = result.filter(a => (a.job_title || a.jobTitle) === positionFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        (a.name || '').toLowerCase().includes(query) ||
        (a.email || '').toLowerCase().includes(query) ||
        ((a.job_title || a.jobTitle) || '').toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Map camelCase to snake_case
        const keyMap = {
          'name': 'name',
          'jobTitle': 'job_title',
          'dateApplied': 'date_applied',
          'aiScore': 'ai_score',
          'status': 'status'
        };
        const dbKey = keyMap[sortConfig.key] || sortConfig.key;
        let aValue = a[dbKey] || a[sortConfig.key];
        let bValue = b[dbKey] || b[sortConfig.key];
        
        if (sortConfig.key === 'dateApplied' || sortConfig.key === 'date_applied') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    console.log('🔍 Filtered result:', {
      resultCount: result.length,
      result: result
    });
    
    return result;
  }, [applicants, filter, sortConfig, searchQuery, positionFilter, aiScoreThreshold]);

  // Pagination
  const totalPages = Math.ceil(processedApplicants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApplicants = processedApplicants.slice(startIndex, endIndex);
  
  console.log('📄 Pagination:', {
    totalPages,
    startIndex,
    endIndex,
    paginatedApplicantsCount: paginatedApplicants.length,
    paginatedApplicants: paginatedApplicants
  });

  // Reset to page 1 when filters or items per page change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, positionFilter, searchQuery, itemsPerPage]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name, email, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Filter by Job Position</span>
            <select 
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm font-medium outline-none"
            >
              {uniquePositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
        </div>
        <button 
          onClick={() => {
            setSearchQuery('');
            setPositionFilter('All Positions');
          }}
          className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"
        >
          <Filter className="w-4 h-4" />
          Clear Filters
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                  <div className={cn("flex items-center", sortConfig.key === 'name' ? "text-blue-600" : "text-slate-500")}>
                    Applicant Name {getSortIcon('name')}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('jobTitle')}>
                  <div className={cn("flex items-center", sortConfig.key === 'jobTitle' ? "text-blue-600" : "text-slate-500")}>
                    Job Position {getSortIcon('jobTitle')}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('dateApplied')}>
                  <div className={cn("flex items-center", sortConfig.key === 'dateApplied' ? "text-blue-600" : "text-slate-500")}>
                    Date Applied {getSortIcon('dateApplied')}
                  </div>
                </th>
                <th className="px-6 py-4">Resume</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('aiScore')}>
                  <div className={cn("flex items-center", sortConfig.key === 'aiScore' ? "text-blue-600" : "text-slate-500")}>
                    AI Score (%) {getSortIcon('aiScore')}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className={cn("flex items-center", sortConfig.key === 'status' ? "text-blue-600" : "text-slate-500")}>
                    Status {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedApplicants.map((applicant) => (
                <tr key={applicant.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {applicant.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{applicant.name}</div>
                        <div className="text-xs text-slate-400">{applicant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-sm font-medium">{applicant.job_title || applicant.jobTitle}</td>
                  <td className="px-6 py-5 text-slate-500 text-sm">
                    {(() => {
                      const dateStr = applicant.date_applied || applicant.dateApplied;
                      if (!dateStr) return 'N/A';
                      try {
                        const date = new Date(dateStr);
                        return date.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        });
                      } catch {
                        return dateStr;
                      }
                    })()}
                  </td>
                  <td className="px-6 py-5">
                    {applicant.resume_path ? (
                      <button
                        onClick={() => {
                          const resumeUrl = api.getResumeUrl(applicant.resume_path);
                          if (resumeUrl) {
                            window.open(resumeUrl, '_blank');
                          }
                        }}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">{applicant.resume_name || 'resume.pdf'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">No resume</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => handleScoreClick(applicant)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer hover:scale-105 transition-transform",
                        (applicant.ai_score || applicant.aiScore || 0) >= 90 ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : 
                        (applicant.ai_score || applicant.aiScore || 0) >= aiScoreThreshold ? "bg-blue-50 text-blue-600 hover:bg-blue-100" :
                        "bg-amber-50 text-amber-600 hover:bg-amber-100"
                      )}
                      title="Click to see score breakdown"
                    >
                      {applicant.ai_score || applicant.aiScore || 0}%
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        applicant.status === 'Highly Qualified' || applicant.status === 'Hired' ? "bg-emerald-500" : 
                        applicant.status === 'Qualified' || applicant.status === 'Shortlisted' ? "bg-blue-500" :
                        applicant.status === 'Needs Review' ? "bg-amber-500" :
                        applicant.status === 'Not Qualified' || applicant.status === 'Rejected' ? "bg-red-500" :
                        applicant.status === 'Pending Analysis' ? "bg-slate-400" :
                        "bg-slate-400"
                      )}></div>
                      <span className="text-sm font-medium text-slate-700">{applicant.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="relative">
                      <button 
                        onClick={() => setShowMenu(showMenu === applicant.id ? null : applicant.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {showMenu === applicant.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                          <button
                            onClick={() => {
                              setViewApplicant(applicant);
                              setShowViewModal(true);
                              setShowMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => {
                              handleDelete(applicant.id);
                              setShowMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <span>Showing {startIndex + 1}-{Math.min(endIndex, processedApplicants.length)} of {processedApplicants.length} applicants</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
                <option value={30}>30</option>
                <option value={35}>35</option>
                <option value={40}>40</option>
                <option value={45}>45</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-bold transition-all",
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 hover:bg-slate-50"
                )}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Applicant Modal */}
      <ViewApplicantModal
        applicant={viewApplicant}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewApplicant(null);
        }}
      />

      {/* AI Score Modal */}
      <AIScoreModal
        isOpen={showScoreModal}
        onClose={() => {
          setShowScoreModal(false);
          setSelectedApplicant(null);
          setScoreDetails(null);
        }}
        applicant={selectedApplicant}
        scoreBreakdown={scoreDetails?.breakdown}
        resumeAnalysis={scoreDetails?.analysis}
      />
    </div>
  );
};
