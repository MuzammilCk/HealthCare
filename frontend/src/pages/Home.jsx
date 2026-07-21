import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../contexts/AuthContext';
import { AuroraScene } from '../three';
import AuroraText from '../components/magicui/AuroraText';
import { BentoGrid, BentoCard } from '../components/magicui/BentoGrid';
import AnimatedGridPattern from '../components/magicui/AnimatedGridPattern';
import AnimatedBeam from '../components/magicui/AnimatedBeam';
import { Button, buttonVariants } from '../components/ui/Button';
import Reveal from '../components/Reveal';
import {
  Activity,
  CalendarDays,
  Pill,
  ShieldCheck,
  BellRing,
  LineChart,
  Stethoscope,
  ArrowRight,
  HeartPulse,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const heroRef = useRef(null);
  const step1 = useRef(null);
  const step2 = useRef(null);
  const step3 = useRef(null);
  const flowRef = useRef(null);

  // GSAP hero entrance — orchestrated, staggered, reduced-motion aware.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-hero]', {
        opacity: 0,
        y: 34,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.12,
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* ===================== HERO ===================== */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center justify-center px-6 py-24"
      >
        {/* 3D stage */}
        <AuroraScene className="pointer-events-none absolute inset-0 h-full w-full" />

        {/* texture overlays */}
        <div className="aura-bg pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <AnimatedGridPattern className="pointer-events-none absolute inset-0 opacity-60" numSquares={36} />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background"
          aria-hidden="true"
        />

        {/* hero content */}
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div data-hero className="mb-6 flex justify-center">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-foreground shadow-card">
              <Sparkles className="h-4 w-4 text-brand-cyan-fg" />
              Trusted healthcare, reimagined in 3D
            </span>
          </div>

          <h1 data-hero className="font-head text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <AuroraText className="text-aurora">HealthSync</AuroraText>
          </h1>

          <p
            data-hero
            className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground sm:text-xl"
          >
            Your health, rendered in real time. Book, monitor, and manage every
            appointment, prescription, and record from one calm, premium space.
          </p>

          <div data-hero className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {!user && (
              <>
                <Link to="/auth/login" className={buttonVariants({ size: 'lg' })}>
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className={buttonVariants({ variant: 'glass', size: 'lg' })}
                >
                  Create account
                </Link>
              </>
            )}
            {user && (
              <Link to={`/${user.role}`} className={buttonVariants({ size: 'lg' })}>
                Go to dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div data-hero className="mt-10 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {['#22d3ee', '#2dd4bf', '#6366f1', '#8b5cf6'].map((c, i) => (
                <span
                  key={i}
                  className="h-7 w-7 rounded-full border-2 border-background"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span>Trusted by 12,000+ patients & 800+ clinicians</span>
          </div>
        </div>

        {/* floating glass chips for depth */}
        <FloatingChip className="left-[8%] top-[22%]" label="Heart rate" value="72 bpm" />
        <FloatingChip className="right-[9%] top-[30%]" label="Next visit" value="Dr. Rao" />
        <FloatingChip className="bottom-[16%] left-[14%]" label="Refills" value="2 due" />
      </section>

      {/* ===================== TRUST STRIP ===================== */}
      <Reveal className="mx-auto max-w-6xl px-6">
        <div className="glass flex flex-wrap items-center justify-center gap-3 rounded-3xl px-6 py-5 text-sm shadow-card">
          <span className="font-semibold text-foreground">One platform for</span>
          {['Patients', 'Doctors', 'Clinics', 'Pharmacists', 'Admins'].map((r) => (
            <span
              key={r}
              className="rounded-full bg-foreground/5 px-3 py-1 font-medium text-muted-foreground"
            >
              {r}
            </span>
          ))}
        </div>
      </Reveal>

      {/* ===================== FEATURES (BENTO) ===================== */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-cyan-fg">
            Everything in one place
          </p>
          <h2 className="mt-3 font-head text-3xl font-bold text-foreground sm:text-4xl">
            A complete care command center
          </h2>
          <p className="mt-3 text-muted-foreground">
            Premium, calm, and secure — designed so the technology disappears and
            the care shines through.
          </p>
        </Reveal>

        <Reveal className="mt-12">
          <BentoGrid>
            <BentoCard
              name="AI Symptom Checker"
              Icon={Activity}
              description="Describe how you feel and get instant, private, triage-grade guidance before you book."
              href="/patient/symptom-checker"
              cta="Check symptoms"
              className="lg:col-span-2"
              background={<Blob className="from-brand-cyan/30 to-brand-teal/10" />}
            />
            <BentoCard
              name="Book in seconds"
              Icon={CalendarDays}
              description="Real-time slots with the right specialist, no phone tag."
              href="/patient/book-appointment"
              cta="Book now"
              background={<Blob className="from-brand-violet/25 to-brand-cyan/10" />}
            />
            <BentoCard
              name="Smart Prescriptions"
              Icon={Pill}
              description="Refill, track, and share — your meds, beautifully organized."
              href="/patient/prescriptions"
              cta="View prescriptions"
              background={<Blob className="from-brand-teal/25 to-brand-cyan/10" />}
            />
            <BentoCard
              name="Verified & secure"
              Icon={ShieldCheck}
              description="KYC-verified clinicians and end-to-end protected records."
              href="/about"
              cta="Our standards"
              background={<Blob className="from-brand-cyan/20 to-brand-violet/10" />}
            />
            <BentoCard
              name="Live updates"
              Icon={BellRing}
              description="Timely reminders and results push straight to you."
              href="/patient/appointments"
              cta="See updates"
              className="lg:col-span-2"
              background={<Blob className="from-brand-violet/20 to-brand-teal/10" />}
            />
            <BentoCard
              name="Health insights"
              Icon={LineChart}
              description="Watch trends in your vitals and care over time."
              href="/patient"
              cta="Open dashboard"
              background={<Blob className="from-brand-cyan/25 to-brand-teal/10" />}
            />
          </BentoGrid>
        </Reveal>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-head text-3xl font-bold text-foreground sm:text-4xl">
            From sign-up to better health
          </h2>
        </Reveal>

        <Reveal className="relative mt-14">
          <div
            ref={flowRef}
            className="relative grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            <FlowStep ref={step1} n="01" Icon={Stethoscope} title="Create your account" text="A 30-second setup with verified identity and your first profile." />
            <FlowStep ref={step2} n="02" Icon={HeartPulse} title="Match with a doctor" text="We connect you to the right specialist by need, language, and availability." />
            <FlowStep ref={step3} n="03" Icon={ShieldCheck} title="Manage care in one place" text="Appointments, prescriptions, and records — calm and in sync." />

            <AnimatedBeam containerRef={flowRef} fromRef={step1} toRef={step2} curvature={80} duration={4} className="hidden md:block" />
            <AnimatedBeam containerRef={flowRef} fromRef={step2} toRef={step3} curvature={80} duration={4} delay={1.5} className="hidden md:block" />
          </div>
        </Reveal>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat value="12k+" label="Patients served" />
          <Stat value="98.9%" label="Uptime" />
          <Stat value="4.9/5" label="Satisfaction" />
          <Stat value="800+" label="Clinicians" />
        </Reveal>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="mx-auto max-w-6xl px-6 pb-28 pt-8">
        <Reveal>
          <div className="ring-grad relative overflow-hidden rounded-3xl glass-strong px-8 py-16 text-center shadow-glow">
            <div className="aura-bg pointer-events-none absolute inset-0 opacity-80" aria-hidden="true" />
            <div className="relative z-10">
              <h2 className="mx-auto max-w-2xl font-head text-3xl font-bold text-foreground sm:text-4xl">
                Ready to take control of your health?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Join thousands who made their care calmer, clearer, and fully in
                their hands.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to={user ? `/${user.role}` : '/auth/register'} className={buttonVariants({ size: 'lg' })}>
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/about" className={buttonVariants({ variant: 'glass', size: 'lg' })}>
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border/60 py-10 text-center text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <span className="font-head font-bold text-foreground">HealthSync</span>
          <span>© {new Date().getFullYear()} — Premium healthcare, reimagined.</span>
        </div>
      </footer>
    </div>
  );
}

/* ---------- small presentational helpers ---------- */
function FloatingChip({ className = '', label, value }) {
  return (
    <div
      className={`glass absolute hidden animate-float rounded-2xl px-4 py-3 text-left shadow-card sm:block ${className}`}
    >
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-head text-base font-bold text-foreground">{value}</p>
    </div>
  );
}

function Blob({ className = '' }) {
  return (
    <div className={`absolute -right-10 -top-10 h-44 w-44 rounded-full bg-gradient-to-br blur-3xl ${className}`} />
  );
}

const FlowStep = ({ ref, n, Icon, title, text }) => (
  <div className="glass relative rounded-2xl p-7 text-center shadow-card">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-teal text-white shadow-glow">
      <Icon className="h-7 w-7" />
    </div>
    <span className="font-head text-sm font-bold text-brand-cyan-fg">{n}</span>
    <h3 className="mt-1 font-head text-lg font-bold text-foreground">{title}</h3>
    <p className="mt-2 text-sm text-muted-foreground">{text}</p>
  </div>
);

function Stat({ value, label }) {
  return (
    <div className="glass rounded-2xl px-6 py-7 text-center shadow-card">
      <p className="font-head text-4xl font-extrabold text-aurora">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
