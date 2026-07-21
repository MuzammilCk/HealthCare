import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Package, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import {
  ModernTableContainer,
  ModernTableHeader,
  ModernTableRow,
  ModernTableCell,
  DateTimeDisplay,
  Avatar,
  EmptyState,
} from '../../components/ui';
import { StatCard } from '../../components/ui';
import { Button, buttonVariants } from '../../components/ui';
import Reveal from '../../components/Reveal';
import { cn } from '../../utils/cn';

const statusStyles = {
  New: 'bg-brand-cyan/15 text-brand-cyan-fg border-brand-cyan/20',
  'Pending Fulfillment': 'bg-amber-400/15 text-amber-500 border-amber-400/20',
  Filled: 'bg-success/15 text-success-fg border-success/20',
  'Partially Filled': 'bg-brand-violet/15 text-brand-violet border-brand-violet/20',
  Cancelled: 'bg-error/15 text-error-fg border-error/20',
};

export default function PharmacistDashboard() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/pharmacy/prescriptions`, {
        params: { status: 'New,Pending Fulfillment' }
      });
      setList(res.data?.data || []);
    } catch (e) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const counts = useMemo(() => {
    const c = { New: 0, 'Pending Fulfillment': 0, Filled: 0 };
    for (const p of list) {
      if (p.status in c) c[p.status] += 1;
    }
    return c;
  }, [list]);

  const columns = [
    { label: 'Date Issued' },
    { label: 'Patient' },
    { label: 'Doctor' },
    { label: 'Status' },
    { label: 'Actions' },
  ];

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/pharmacy/prescriptions/${id}/status`, { status });
      toast.success(`Updated to ${status}`);
      fetchData();
    } catch (e) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-8 bg-background text-foreground">
      {/* Header + actions */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-head text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Pharmacist <span className="text-aurora">Dashboard</span>
          </h1>
          <p className="text-lg font-medium text-muted-foreground">
            Manage and fulfill prescriptions
          </p>
        </div>
        <Button variant="glass" onClick={fetchData}>
          <RefreshCw className="h-5 w-5" />
          Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="New"
          value={counts.New}
          accent="#22d3ee"
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          title="Pending"
          value={counts['Pending Fulfillment']}
          accent="#f59e0b"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Filled"
          value={counts.Filled}
          accent="#22c55e"
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatCard
          title="To Review"
          value={list.length}
          accent="#8b5cf6"
          icon={<Package className="h-5 w-5" />}
        />
      </div>

      <Reveal>
        <ModernTableContainer title="Incoming Prescriptions" subtitle={`${list.length} to review`}>
          {loading ? (
            <div className="py-16 text-center text-muted-foreground">Loading...</div>
          ) : list.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-8 w-8 text-muted-foreground" />}
              title="No prescriptions"
              description="You're all caught up!"
            />
          ) : (
            <table className="min-w-full">
              <ModernTableHeader columns={columns} />
              <tbody>
                {list.map((p, idx) => (
                  <ModernTableRow key={p._id} isEven={idx % 2 === 0}>
                    <ModernTableCell>
                      <DateTimeDisplay date={p.dateIssued} format="date-only" />
                    </ModernTableCell>
                    <ModernTableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={p.patientId?.name || 'Patient'} size="sm" />
                        <div className="font-medium text-foreground">{p.patientId?.name}</div>
                      </div>
                    </ModernTableCell>
                    <ModernTableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={p.doctorId?.name || 'Doctor'} size="sm" />
                        <div className="font-medium text-foreground">{p.doctorId?.name}</div>
                      </div>
                    </ModernTableCell>
                    <ModernTableCell>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
                          statusStyles[p.status] || 'bg-foreground/5 text-muted-foreground border-border'
                        )}
                      >
                        {p.status}
                      </span>
                    </ModernTableCell>
                    <ModernTableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStatus(p._id, 'Pending Fulfillment')}
                          className="rounded-md border border-amber-400/20 bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-500 transition-colors hover:bg-amber-400/25"
                        >
                          Mark Pending
                        </button>
                        <button
                          onClick={() => updateStatus(p._id, 'Filled')}
                          className="rounded-md border border-success/20 bg-success/15 px-3 py-1 text-xs font-semibold text-success-fg transition-colors hover:bg-success/25"
                        >
                          Mark Filled
                        </button>
                        <button
                          onClick={() => updateStatus(p._id, 'Partially Filled')}
                          className="rounded-md border border-brand-violet/20 bg-brand-violet/15 px-3 py-1 text-xs font-semibold text-brand-violet transition-colors hover:bg-brand-violet/25"
                        >
                          Partial
                        </button>
                        <button
                          onClick={() => updateStatus(p._id, 'Cancelled')}
                          className="rounded-md border border-error/20 bg-error/15 px-3 py-1 text-xs font-semibold text-error-fg transition-colors hover:bg-error/25"
                        >
                          Cancel
                        </button>
                      </div>
                    </ModernTableCell>
                  </ModernTableRow>
                ))}
              </tbody>
            </table>
          )}
        </ModernTableContainer>
      </Reveal>
    </div>
  );
}
