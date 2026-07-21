import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AmbientBackdrop from '../../three/AmbientBackdrop';
import ThemeToggle from '../ThemeToggle';
import { cn } from '../../utils/cn';

const content = {
  patient: {
    title: 'Your Health, Your Way',
    subtitle: 'Book appointments, manage prescriptions, and take control of your well-being with ease.',
    accent: 'from-brand-cyan to-brand-teal',
  },
  doctor: {
    title: 'Empowering Clinicians',
    subtitle: 'Streamline appointments, manage patient care, and focus on what matters most.',
    accent: 'from-brand-violet to-brand-cyan',
  },
};

export default function ModernAuthLayout() {
  const [role, setRole] = useState('patient');
  const { pathname } = useLocation();
  const isLogin = pathname.includes('login');
  const { title, subtitle, accent } = content[role];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 transition-colors duration-300">
      {/* 3D ambient stage */}
      <AmbientBackdrop className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="aura-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="fixed right-6 top-4 z-50">
        <ThemeToggle />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-3xl glass-strong shadow-glow lg:grid-cols-2"
      >
        {/* Left brand / role panel */}
        <div
          className={cn(
            'relative hidden flex-col justify-between overflow-hidden p-9 text-foreground lg:flex',
            'bg-gradient-to-br',
            accent
          )}
          style={{ mixBlendMode: 'normal' }}
        >
          <div className="pointer-events-none absolute inset-0 bg-white/10" aria-hidden="true" />
          <div className="relative z-10">
            <Link to="/" className="font-head text-2xl font-extrabold text-white drop-shadow">
              HealthSync
            </Link>
            <h2 className="mt-10 font-head text-3xl font-bold text-white">{title}</h2>
            <p className="mt-3 max-w-xs text-sm text-white/85">{subtitle}</p>
          </div>

          {/* Role segmented toggle */}
          <div className="relative z-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">
              I am a
            </p>
            <div className="flex rounded-xl bg-black/20 p-1">
              {['patient', 'doctor'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    'flex-1 rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all',
                    role === r ? 'bg-white text-brand-ink shadow' : 'text-white/80 hover:text-white'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <div className="mb-7 text-center">
            <Link to="/" className="font-head text-3xl font-extrabold text-foreground">
              Health<span className="text-aurora">Sync</span>
            </Link>
            <h1 className="mt-4 font-head text-2xl font-bold text-foreground">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isLogin
                ? 'Sign in to continue your journey.'
                : 'Join our community of patients and clinicians.'}
            </p>
          </div>

          <Outlet context={{ role, setRole }} />
        </div>
      </motion.main>
    </div>
  );
}
