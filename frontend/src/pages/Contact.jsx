import Reveal from '../components/Reveal';
import { Button, buttonVariants } from '../components/ui';
import { cn } from '../utils/cn';
import { Mail, Phone, MapPin, Briefcase } from 'lucide-react';

const inputCls =
  'w-full rounded-xl h-12 bg-background/60 border border-border px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors';

export default function Contact() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <div className="aura-bg pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <Reveal className="mb-16 text-center">
          <h1 className="font-head text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            CONTACT <span className="text-aurora">US</span>
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-br from-brand-cyan to-brand-teal" />
        </Reveal>

        {/* Main Content Grid */}
        <Reveal className="mb-20 grid items-center gap-12 lg:grid-cols-2">
          {/* Left Side - Image */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl glass shadow-card">
              <img
                src="/src/assets/contact.png"
                alt="Healthcare Team"
                className="h-auto w-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop';
                }}
              />
            </div>
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-brand-cyan/10 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-brand-violet/10 blur-2xl" />
          </div>

          {/* Right Side - Contact Info */}
          <div className="space-y-8">
            {/* Office Section */}
            <div className="rounded-2xl glass p-8 shadow-card">
              <h2 className="mb-6 flex items-center font-head text-2xl font-bold text-foreground">
                <MapPin className="mr-3 h-6 w-6 text-brand-cyan-fg" />
                OUR OFFICE
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="text-lg font-medium text-foreground">HealthSync Medical Center</p>
                <p>Medical College Road</p>
                <p>Thiruvananthapuram, Kerala 695011</p>
                <div className="space-y-2 pt-4">
                  <a
                    href="tel:+914712345678"
                    className="flex items-center text-muted-foreground transition-colors hover:text-brand-cyan-fg"
                  >
                    <Phone className="mr-3 h-5 w-5 text-brand-cyan-fg" />
                    Tel: +91 (471) 234-5678
                  </a>
                  <a
                    href="mailto:contact@healthsync.com"
                    className="flex items-center text-muted-foreground transition-colors hover:text-brand-cyan-fg"
                  >
                    <Mail className="mr-3 h-5 w-5 text-brand-cyan-fg" />
                    Email: contact@healthsync.com
                  </a>
                </div>
              </div>
            </div>

            {/* Careers Section */}
            <div className="rounded-2xl glass border border-brand-cyan/10 p-8 shadow-card">
              <h2 className="mb-4 flex items-center font-head text-2xl font-bold text-foreground">
                <Briefcase className="mr-3 h-6 w-6 text-brand-cyan-fg" />
                CAREERS AT HEALTHSYNC
              </h2>
              <p className="mb-6 text-muted-foreground">
                Learn more about our teams and job openings. Join us in revolutionizing healthcare
                delivery.
              </p>
              <button className={cn(buttonVariants({ variant: 'outline' }))}>Explore Jobs</button>
            </div>
          </div>
        </Reveal>

        {/* Contact Form Section */}
        <Reveal className="mx-auto max-w-4xl">
          <div className="rounded-2xl glass-strong p-8 shadow-card lg:p-12">
            <h2 className="mb-8 text-center font-head text-3xl font-bold tracking-tight text-foreground">
              Send Us a Message
            </h2>
            <form className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Full Name</label>
                  <input type="text" className={inputCls} placeholder="John Doe" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <input type="email" className={inputCls} placeholder="john@example.com" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Phone Number</label>
                <input type="tel" className={inputCls} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Subject</label>
                <input type="text" className={inputCls} placeholder="How can we help you?" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Message</label>
                <textarea
                  rows={5}
                  className="w-full resize-none rounded-xl bg-background/60 border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>
              <div className="text-center">
                <Button type="submit" size="lg" className="bg-gradient-to-br from-brand-cyan to-brand-teal text-white shadow-glow">
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </Reveal>

        {/* Additional Info Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <InfoCard Icon={Phone} title="24/7 Support" text="Round-the-clock assistance for all your healthcare needs" />
          <InfoCard Icon={Mail} title="Email Us" text="Get responses within 24 hours on business days" />
          <InfoCard Icon={MapPin} title="Visit Us" text="Walk-in consultations available Mon-Sat, 9AM-6PM" />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ Icon, title, text }) {
  return (
    <div className="rounded-xl glass p-6 text-center shadow-card transition-shadow hover:shadow-glow">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-cyan/15">
        <Icon className="h-8 w-8 text-brand-cyan-fg" />
      </div>
      <h3 className="mb-2 font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
