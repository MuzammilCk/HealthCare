import Reveal from '../components/Reveal';
import { CheckCircle, Users, Heart, Sparkles } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <div className="aura-bg pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="mb-16 text-center">
          <h1 className="font-head text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            ABOUT <span className="text-aurora">US</span>
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-br from-brand-cyan to-brand-teal" />
        </Reveal>

        {/* Main Content Section */}
        <Reveal className="mb-20 grid items-center gap-12 lg:grid-cols-2">
          {/* Left Side - Image */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl glass shadow-card">
              <img
                src="/src/assets/about.png"
                alt="Healthcare Professionals"
                className="h-auto w-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop';
                }}
              />
            </div>
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-brand-cyan/10 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-brand-violet/10 blur-2xl" />
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Welcome to <span className="font-bold text-foreground">HealthSync</span>, your trusted
              partner in managing your healthcare needs conveniently and efficiently. At HealthSync, we
              understand the challenges individuals face when it comes to scheduling doctor appointments
              and managing their health records.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              HealthSync is committed to excellence in healthcare technology. We continuously strive to
              enhance our platform, integrating the latest advancements to improve user experience and
              deliver superior services. Whether you're booking your first appointment or managing
              ongoing care, HealthSync is here to support you every step of the way.
            </p>

            {/* Vision Section */}
            <div className="mt-8 rounded-2xl glass border border-brand-cyan/10 p-6 shadow-card">
              <h3 className="mb-3 flex items-center font-head text-2xl font-bold text-foreground">
                <Heart className="mr-3 h-6 w-6 text-brand-cyan-fg" />
                Our Vision
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                Our vision at HealthSync is to create a seamless healthcare experience for every user. We
                aim to bridge the gap between patients and healthcare providers, making it easier for you
                to access the care you need, when you need it.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Why Choose Us Section */}
        <Reveal className="mb-16">
          <h2 className="mb-12 text-center font-head text-4xl font-bold tracking-tight text-foreground">
            WHY CHOOSE US
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              Icon={CheckCircle}
              title="Efficiency"
              text="Streamlined appointment scheduling that fits into your busy lifestyle."
            />
            <FeatureCard
              Icon={Users}
              title="Convenience"
              text="Access to a network of trusted healthcare professionals in your area."
            />
            <FeatureCard
              Icon={Heart}
              title="Personalization"
              text="Tailored recommendations and reminders to help you stay on top of your health."
            />
          </div>
        </Reveal>

        {/* Stats Section */}
        <Reveal className="relative overflow-hidden rounded-3xl glass-strong p-12 text-center shadow-glow">
          <div className="aura-bg pointer-events-none absolute inset-0 opacity-80" aria-hidden="true" />
          <div className="relative z-10 grid gap-8 text-center md:grid-cols-4">
            <Stat value="500+" label="Verified Doctors" />
            <Stat value="10K+" label="Happy Patients" />
            <Stat value="50+" label="Partner Hospitals" />
            <Stat value="24/7" label="Support Available" />
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function FeatureCard({ Icon, title, text }) {
  return (
    <div className="group rounded-2xl glass p-8 shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-glow">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-cyan/15 transition-colors duration-300 group-hover:bg-gradient-to-br group-hover:from-brand-cyan group-hover:to-brand-teal">
        <Icon className="h-8 w-8 text-brand-cyan-fg transition-colors duration-300 group-hover:text-white" />
      </div>
      <h3 className="mb-4 font-head text-2xl font-bold text-foreground transition-colors duration-300">
        {title}:
      </h3>
      <p className="leading-relaxed text-muted-foreground transition-colors duration-300">{text}</p>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="font-head text-5xl font-bold text-aurora">{value}</div>
      <div className="mt-2 text-sm font-medium text-muted-foreground">{label}</div>
    </div>
  );
}
