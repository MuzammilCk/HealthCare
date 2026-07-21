import { useState } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button, buttonVariants } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { role, setRole } = useOutletContext();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    setError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password, role);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full rounded-xl h-12 bg-background/60 border border-border pl-11 pr-11 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors';

  return (
    <div className="flex flex-col">
      {/* Role switcher */}
      <div className="mx-auto mb-6 grid w-full max-w-xs grid-cols-2 gap-1 rounded-xl bg-foreground/5 p-1">
        {['patient', 'doctor'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all',
              role === r
                ? 'bg-gradient-to-br from-brand-cyan to-brand-teal text-white shadow-glow'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            I'm a {r}
          </button>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl glass p-6 shadow-card dark:shadow-card-dark"
      >
        {error && (
          <div className="rounded-lg border border-error/20 bg-error/10 p-3 text-center text-sm text-error-fg">
            {error}
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className={inputCls}
            placeholder="you@email.com"
            aria-label="Email"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={onChange}
            className={inputCls}
            placeholder="Password"
            aria-label="Password"
            required
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          No account?{' '}
          <Link
            to="/auth/register"
            className={cn(buttonVariants({ variant: 'link' }), 'px-0')}
          >
            Register here
          </Link>
        </div>
      </form>
    </div>
  );
}
