import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import VideoBackground from '../VideoBackground';

// Import GIFs from the public directory
import patientGif from '/patient.gif';
import doctorGif from '/doctor.gif';

const content = {
  patient: {
    gif: patientGif,
    title: "Your Health, Your Way",
    subtitle: "Book appointments, manage prescriptions, and take control of your well-being with ease."
  },
  doctor: {
    gif: doctorGif,
    title: "Empowering Medical Professionals",
    subtitle: "Streamline your appointments, manage patient care, and focus on what matters most."
  }
};

export default function ModernAuthLayout() {
  const [role, setRole] = useState('patient'); // Default to patient view
  const { pathname } = useLocation();
  const isLogin = pathname.includes('login');

  const { gif, title, subtitle } = content[role];

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page p-4 relative z-10">
      <VideoBackground />
      <main className="w-full max-w-4xl bg-white rounded-2xl shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-2 animate-fade-in">
        {/* Left Decorative Panel */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary to-secondary text-white text-center">
          <img src={gif} alt={`${role} illustration`} className="w-48 h-48 mb-6 object-contain" />
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-sm opacity-90">{subtitle}</p>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 flex flex-col justify-center">
          <div className="mb-6 text-center">
            <Link to="/" className="text-3xl font-bold text-primary">HealthSync</Link>
            <h1 className="text-2xl font-bold text-text-primary mt-4">{isLogin ? "Welcome Back!" : "Create Your Account"}</h1>
            <p className="text-text-secondary">{isLogin ? "Sign in to continue your journey." : "Join our community of patients and doctors."}</p>
          </div>
          {/* Outlet provides the role and setRole function to the Login/Register components */}
          <Outlet context={{ role, setRole }} />
        </div>
      </main>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}