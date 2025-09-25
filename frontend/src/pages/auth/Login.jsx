import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(`/${user.role}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </span>
        <input type="email" name="email" value={form.email} onChange={onChange} className="w-full bg-white/70 border border-slate-300/70 rounded-lg px-3 py-2 h-12 pl-10 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="your@email.com" />
      </div>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </span>
        <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={onChange} className="w-full bg-white/70 border border-slate-300/70 rounded-lg px-3 py-2 h-12 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Password"/>
        <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary">
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.02-2.76 2.98-5.02 5.41-6.37"/><path d="M1 1l22 22"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.58 5.51A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.06 11.06 0 0 1-4.06 5.06"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8 11-8Z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      </div>
      <button disabled={loading} className="w-full bg-primary text-white font-bold px-4 py-2 rounded-lg h-11 transition-all duration-300 ease-in-out hover:bg-primary-light hover:shadow-lg hover:-translate-y-px disabled:opacity-50 disabled:hover:translate-y-0">{loading ? 'Signing in…' : 'Sign In'}</button>
      <div className="text-sm text-center text-text-secondary">
        No account? <Link to="/auth/register" className="font-medium text-primary hover:underline">Register</Link>
      </div>
    </form>
  );
}