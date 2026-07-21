import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { DashboardStatsSkeleton } from '../../components/ui/SkeletonLoader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';
import Reveal from '../../components/Reveal';
import {
  ShieldCheck,
  Stethoscope,
  Layers,
  Clock,
  Users,
  Activity,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingKyc: 0,
    totalDoctors: 0,
    totalSpecializations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch KYC requests
        const kycRes = await api.get('/admin/kyc-requests');
        const pendingKyc = kycRes?.data?.data?.length || 0;

        // Fetch doctors
        const doctorsRes = await api.get('/admin/doctors');
        const totalDoctors = doctorsRes?.data?.data?.length || 0;

        setStats({
          pendingKyc,
          totalDoctors,
          totalSpecializations: 0 // You can add this API call if needed
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'KYC Requests',
      description: 'Review and approve doctor verification requests',
      icon: ShieldCheck,
      link: '/admin/kyc-requests',
      badge: stats.pendingKyc > 0 ? stats.pendingKyc : null,
      urgent: stats.pendingKyc > 0,
      accent: 'from-brand-cyan to-brand-teal'
    },
    {
      title: 'Manage Doctors',
      description: 'View and manage registered doctors',
      icon: Stethoscope,
      link: '/admin/doctors',
      badge: stats.totalDoctors > 0 ? stats.totalDoctors : null,
      accent: 'from-brand-violet to-brand-indigo'
    },
    {
      title: 'Specializations',
      description: 'Manage medical specializations',
      icon: Layers,
      link: '/admin/specializations',
      accent: 'from-brand-teal to-brand-cyan'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8 bg-background text-foreground">
        <div>
          <h1 className="mb-2 font-head text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your healthcare platform efficiently</p>
        </div>
        <DashboardStatsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-background text-foreground">
      <Reveal>
        <div>
          <h1 className="mb-2 font-head text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your healthcare platform efficiently</p>
        </div>
      </Reveal>

      {/* Stats Overview */}
      <Reveal className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-cyan/15 text-brand-cyan-fg shadow-glow">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending KYC</p>
            <p className="font-head text-3xl font-bold text-foreground">{stats.pendingKyc}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-violet/15 text-brand-violet shadow-glow">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Doctors</p>
            <p className="font-head text-3xl font-bold text-foreground">{stats.totalDoctors}</p>
          </div>
        </Card>

        <Card className="flex items-center justify-between gap-4 p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Platform Status</p>
            <p className="mt-1 font-head text-3xl font-bold text-foreground">Active</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-success to-brand-teal text-white shadow-glow">
            <Activity className="h-6 w-6" />
          </div>
        </Card>
      </Reveal>

      {/* Quick Actions */}
      <Reveal className="space-y-4">
        <h2 className="font-head text-2xl font-bold tracking-tight text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.link}
                className={cn(
                  'group relative block overflow-hidden rounded-2xl glass p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow',
                  action.urgent && 'ring-2 ring-brand-cyan/40'
                )}
              >
                {action.badge && (
                  <span className="absolute right-4 top-4 flex h-7 min-w-7 items-center justify-center rounded-full bg-foreground/10 px-2 text-xs font-bold text-foreground">
                    {action.badge}
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-glow', action.accent)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-head text-lg font-semibold text-foreground">{action.title}</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{action.description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-cyan-fg">
                  <span>Go to {action.title}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </Reveal>

      {/* System Overview */}
      <Reveal>
        <Card className="p-6">
          <h2 className="mb-4 font-head text-xl font-semibold text-foreground">System Overview</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Platform Status</span>
              <Badge variant="success">Operational</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Database Connection</span>
              <Badge variant="success">Connected</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
