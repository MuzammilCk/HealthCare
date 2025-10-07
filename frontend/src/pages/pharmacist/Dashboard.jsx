import { useEffect, useState } from 'react';
import { FiClipboard, FiRefreshCw } from 'react-icons/fi';
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

const statusColors = {
  'New': 'bg-blue-100 text-blue-800 border-blue-200',
  'Pending Fulfillment': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Filled': 'bg-green-100 text-green-800 border-green-200',
  'Partially Filled': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Cancelled': 'bg-red-100 text-red-800 border-red-200',
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary-dark mb-2">Pharmacist Dashboard</h1>
          <p className="text-gray-600 dark:text-text-secondary-dark">Manage and fulfill prescriptions</p>
        </div>
        <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
          <FiRefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <ModernTableContainer title="Incoming Prescriptions" subtitle={`${list.length} to review`}>
        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading...</div>
        ) : list.length === 0 ? (
          <EmptyState icon={<FiClipboard className="w-8 h-8 text-gray-400" />} title="No prescriptions" description="You're all caught up!" />
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
                      <div className="font-medium">{p.patientId?.name}</div>
                    </div>
                  </ModernTableCell>
                  <ModernTableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={p.doctorId?.name || 'Doctor'} size="sm" />
                      <div className="font-medium">{p.doctorId?.name}</div>
                    </div>
                  </ModernTableCell>
                  <ModernTableCell>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[p.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                      {p.status}
                    </span>
                  </ModernTableCell>
                  <ModernTableCell>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateStatus(p._id, 'Pending Fulfillment')} className="px-3 py-1 text-xs rounded-md bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-200">Mark Pending</button>
                      <button onClick={() => updateStatus(p._id, 'Filled')} className="px-3 py-1 text-xs rounded-md bg-green-100 hover:bg-green-200 text-green-800 border border-green-200">Mark Filled</button>
                      <button onClick={() => updateStatus(p._id, 'Partially Filled')} className="px-3 py-1 text-xs rounded-md bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border border-indigo-200">Partial</button>
                      <button onClick={() => updateStatus(p._id, 'Cancelled')} className="px-3 py-1 text-xs rounded-md bg-red-100 hover:bg-red-200 text-red-800 border border-red-200">Cancel</button>
                    </div>
                  </ModernTableCell>
                </ModernTableRow>
              ))}
            </tbody>
          </table>
        )}
      </ModernTableContainer>
    </div>
  );
}


