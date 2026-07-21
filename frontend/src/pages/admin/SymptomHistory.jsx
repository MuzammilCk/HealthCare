import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Calendar, Cpu, Download, Search, User, X } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import Reveal from '../../components/Reveal';

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
    const headers = ['createdAt', 'userId', 'symptoms', 'age', 'sex', 'conditions', 'error'];
    const rows = filtered.map(l => [
      new Date(l.createdAt).toISOString(),
      l.userId,
      (l.input?.symptoms || '').replace(/\n/g, ' '),
      l.input?.age || '',
      l.input?.sex || '',
      l.resultSummary?.potentialConditionsCount ?? '',
      (l.error || '').replace(/\n/g, ' ')
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `symptom-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 bg-background text-foreground">
      <Reveal className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-cyan/15">
          <Activity className="w-6 h-6 text-brand-cyan-fg" />
        </div>
        <div>
          <h1 className="font-head text-2xl font-semibold tracking-tight text-foreground">Symptom Checker History</h1>
          <p className="text-muted-foreground">Admin-only. Explore recent usage with search, details, and export.</p>
        </div>
      </Reveal>

      <Reveal className="rounded-2xl glass border border-border p-4 shadow-card">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Total:</span>
            <span className="font-medium text-foreground">{total}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search symptoms, user, error..."
                className="w-72 rounded-lg border border-border bg-background/60 py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan"
              />
              {query && (
                <button className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground" onClick={() => setQuery('')} aria-label="Clear search">
                  <X />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Per page</label>
              <select
                className="rounded-lg border border-border bg-background/60 px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30"
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
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-3 text-sm text-error-fg">{error}</div>
        )}

        {/* Card list */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(loading ? Array.from({ length: 6 }) : filtered).map((log, idx) => (
            <div key={log?._id || idx} className="rounded-xl border border-border bg-card p-4 shadow-card">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-1/2 rounded bg-foreground/10" />
                  <div className="h-3 w-2/3 rounded bg-foreground/10" />
                  <div className="h-16 rounded bg-foreground/10" />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-cyan/15 text-xs font-semibold text-brand-cyan-fg">
                          {String((log.userId?.name || log.userId || 'U')).slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground" title={typeof log.userId === 'object' ? (log.userId?.email || '') : String(log.userId)}>
                          {typeof log.userId === 'object' ? (log.userId?.name || log.userId?._id) : String(log.userId)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn('inline-flex items-center rounded border px-2 py-0.5 text-xs', log.error ? 'border-error/20 bg-error/15 text-error-fg' : 'border-success/20 bg-success/15 text-success-fg')}>
                        {log.error ? 'Invalid' : 'Success'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm">
                    <div className="text-muted-foreground">Symptoms</div>
                    <div className="line-clamp-2 font-medium text-foreground" title={log.input?.symptoms}>{log.input?.symptoms}</div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2 py-1 text-muted-foreground">
                      <User className="w-3.5 h-3.5" /> {log.input?.age} / {log.input?.sex}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-brand-cyan/20 bg-brand-cyan/15 px-2 py-1 text-brand-cyan-fg">
                      <Cpu className="w-3.5 h-3.5" /> {log.resultSummary?.potentialConditionsCount ?? 0} conditions
                    </span>
                  </div>

                  {log.error && (
                    <div className="mt-3 rounded border border-error/20 bg-error/10 p-2 text-xs text-error-fg">
                      <AlertTriangle className="mr-1 inline" /> {log.error}
                    </div>
                  )}

                  {log.resultSummary?.firstAidSuggestion && (
                    <div className="mt-3 rounded border border-border bg-foreground/5 p-2 text-xs text-muted-foreground">
                      <span className="font-medium">First aid:</span> {log.resultSummary.firstAidSuggestion}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      className="text-sm text-brand-cyan-fg hover:underline"
                      onClick={() => setExpanded((s) => ({ ...s, [log._id]: !s[log._id] }))}
                    >
                      {expanded[log._id] ? 'Hide details' : 'View JSON details'}
                    </button>
                    <button
                      className="text-sm text-muted-foreground hover:underline"
                      onClick={() => navigator.clipboard.writeText(String(typeof log.userId === 'object' ? (log.userId?._id || '') : (log.userId || '')))}
                    >
                      Copy User ID
                    </button>
                  </div>

                  {expanded[log._id] && (
                    <pre className="mt-3 max-h-64 overflow-auto rounded bg-black/90 p-3 text-xs text-green-200">
{JSON.stringify(log.response ?? { message: 'No response captured' }, null, 2)}
                    </pre>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <button
            className="rounded-lg border border-border px-3 py-2 text-foreground transition-colors hover:bg-foreground/5 disabled:opacity-50"
            onClick={() => fetchLogs(Math.max(1, page - 1), limit)}
            disabled={loading || page <= 1}
          >
            Prev
          </button>
          <div className="text-sm text-muted-foreground">Page {page} / {totalPages}</div>
          <button
            className="rounded-lg border border-border px-3 py-2 text-foreground transition-colors hover:bg-foreground/5 disabled:opacity-50"
            onClick={() => fetchLogs(Math.min(totalPages, page + 1), limit)}
            disabled={loading || page >= totalPages}
          >
            Next
          </button>
        </div>
      </Reveal>
    </div>
  );
}
