import React from 'react';
import { Search, Copy, Check, ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const CopyButton = ({ jobId }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/apply/${jobId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all flex items-center gap-1.5 group/copy relative"
      title="Copy application link"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
      <span className="sr-only">Copy Link</span>
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap">
          Copied!
        </span>
      )}
    </button>
  );
};

export const JobTable = ({ jobs, onApply, onEdit, onDelete }) => {
  const [sortConfig, setSortConfig] = React.useState({ key: 'title', direction: 'asc' });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

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
      <ArrowUp className="w-3.5 h-3.5 ml-1 text-indigo-600" /> : 
      <ArrowDown className="w-3.5 h-3.5 ml-1 text-indigo-600" />;
  };

  const processedJobs = React.useMemo(() => {
    let result = [...jobs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(query) ||
        (job.location && job.location.toLowerCase().includes(query))
      );
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [jobs, sortConfig, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(processedJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJobs = processedJobs.slice(startIndex, endIndex);

  // Reset to page 1 when search or items per page changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by job title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('title')}>
                <div className={cn("flex items-center", sortConfig.key === 'title' ? "text-indigo-600" : "text-slate-500")}>
                  Job Title {getSortIcon('title')}
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('location')}>
                <div className={cn("flex items-center", sortConfig.key === 'location' ? "text-indigo-600" : "text-slate-500")}>
                  Location {getSortIcon('location')}
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('type')}>
                <div className={cn("flex items-center", sortConfig.key === 'type' ? "text-indigo-600" : "text-slate-500")}>
                  Type {getSortIcon('type')}
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                <div className={cn("flex items-center", sortConfig.key === 'status' ? "text-indigo-600" : "text-slate-500")}>
                  Status {getSortIcon('status')}
                </div>
              </th>
              <th className="px-6 py-4">Link</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedJobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <button 
                    onClick={() => onApply(job)}
                    className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                  >
                    {job.title}
                  </button>
                </td>
                <td className="px-6 py-5 text-slate-500 text-sm">{job.location}</td>
                <td className="px-6 py-5 text-slate-500 text-sm">{job.type}</td>
                <td className="px-6 py-5">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-full uppercase">
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onApply(job)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1 group/link"
                    >
                      Visit
                      <span className="group-hover/link:translate-x-0.5 transition-transform">→</span>
                    </button>
                    <CopyButton jobId={job.id} />
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onEdit && onEdit(job)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Edit Job"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (onDelete && confirm('Are you sure you want to delete this job?')) {
                          onDelete(job.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t flex items-center justify-between text-sm text-slate-500">
        <div className="flex items-center gap-4">
          <span>Showing {startIndex + 1}-{Math.min(endIndex, processedJobs.length)} of {processedJobs.length} jobs</span>
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
  );
};
