import { useEffect, useMemo, useState } from 'react';
import { FiActivity, FiAlertTriangle, FiCalendar, FiCpu, FiDownload, FiSearch, FiUser, FiX } from 'react-icons/fi';
import api from '../../services/api';

export default function SymptomHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState({});

  const fetchLogs = async (p = page, l = limit) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/ai/check-symptoms/admin?page=${p}&limit=${l}`);
      if (res.data?.success) {
        setLogs(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
        setPage(res.data.pagination?.page || p);
        setLimit(res.data.pagination?.limit || l);
      } else {
        setError(res.data?.message || 'Failed to load logs');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) =>
      (l.input?.symptoms || '').toLowerCase().includes(q) ||
      (l.error || '').toLowerCase().includes(q) ||
      String(l.userId || '').toLowerCase().includes(q)
    );
  }, [logs, query]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const exportCsv = () => {
    const headers = ['createdAt','userId','symptoms','age','sex','conditions','error'];
    const rows = filtered.map(l => [
      new Date(l.createdAt).toISOString(),
      l.userId,
      (l.input?.symptoms || '').replace(/\n/g, ' '),
      l.input?.age || '',
      l.input?.sex || '',
      l.resultSummary?.potentialConditionsCount ?? '',
      (l.error || '').replace(/\n/g, ' ')
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `symptom-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
          <FiActivity className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-text-primary-dark">Symptom Checker History</h1>
          <p className="text-gray-600 dark:text-text-secondary-dark">Admin-only. Explore recent usage with search, details, and export.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-bg-card-dark rounded-2xl shadow-xl dark:shadow-card-dark border border-slate-200/60 dark:border-dark-border p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-text-secondary-dark">
            <span>Total:</span>
            <span className="font-medium text-gray-900 dark:text-text-primary-dark">{total}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search symptoms, user, error..."
                className="pl-9 pr-8 py-2 w-72 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-sm"
              />
              {query && (
                <button className="absolute right-2 top-2.5 text-gray-400" onClick={() => setQuery('')}>
                  <FiX />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Per page</label>
              <select
                className="border rounded px-2 py-2 bg-white dark:bg-dark-surface dark:border-dark-border text-sm"
                value={limit}
                onChange={(e) => {
                  const newLimit = parseInt(e.target.value) || 20;
                  setLimit(newLimit);
                  fetchLogs(1, newLimit);
                }}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <button
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-dark-surface"
              onClick={exportCsv}
            >
              <FiDownload className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        {/* Card list */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(loading ? Array.from({ length: 6 }) : filtered).map((log, idx) => (
            <div key={log?._id || idx} className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-text-secondary-dark">
                        <FiCalendar className="w-3.5 h-3.5" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                          {String((log.userId?.name || log.userId || 'U')).slice(0,1).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-text-primary-dark" title={typeof log.userId === 'object' ? (log.userId?.email || '') : String(log.userId)}>
                          {typeof log.userId === 'object' ? (log.userId?.name || log.userId?._id) : String(log.userId)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${log.error ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {log.error ? 'Invalid' : 'Success'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm">
                    <div className="text-gray-500 dark:text-text-secondary-dark">Symptoms</div>
                    <div className="font-medium text-gray-900 dark:text-text-primary-dark line-clamp-2" title={log.input?.symptoms}>{log.input?.symptoms}</div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      <FiUser className="w-3.5 h-3.5" /> {log.input?.age} / {log.input?.sex}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <FiCpu className="w-3.5 h-3.5" /> {log.resultSummary?.potentialConditionsCount ?? 0} conditions
                    </span>
                  </div>

                  {log.error && (
                    <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
                      <FiAlertTriangle className="inline mr-1" /> {log.error}
                    </div>
                  )}

                  {log.resultSummary?.firstAidSuggestion && (
                    <div className="mt-3 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded p-2">
                      <span className="font-medium">First aid:</span> {log.resultSummary.firstAidSuggestion}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => setExpanded((s) => ({ ...s, [log._id]: !s[log._id] }))}
                    >
                      {expanded[log._id] ? 'Hide details' : 'View JSON details'}
                    </button>
                    <button
                      className="text-sm text-gray-600 hover:underline"
                      onClick={() => navigator.clipboard.writeText(String(typeof log.userId === 'object' ? (log.userId?._id || '') : (log.userId || '')))}
                    >
                      Copy User ID
                    </button>
                  </div>

                  {expanded[log._id] && (
                    <pre className="mt-3 text-xs bg-black/90 text-green-200 p-3 rounded overflow-auto max-h-64">
{JSON.stringify(log.response ?? { message: 'No response captured' }, null, 2)}
                    </pre>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <button
            className="px-3 py-2 border rounded-lg disabled:opacity-50"
            onClick={() => fetchLogs(Math.max(1, page - 1), limit)}
            disabled={loading || page <= 1}
          >
            Prev
          </button>
          <div className="text-sm">Page {page} / {totalPages}</div>
          <button
            className="px-3 py-2 border rounded-lg disabled:opacity-50"
            onClick={() => fetchLogs(Math.min(totalPages, page + 1), limit)}
            disabled={loading || page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}


