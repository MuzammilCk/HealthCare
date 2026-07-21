import { useEffect, useState } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { User, Mail, Lock, Eye, EyeOff, MapPin, Briefcase } from 'lucide-react';
import { AppSelect } from '../../components/ui';
import { Button, buttonVariants } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { KERALA_DISTRICTS } from '../../constants';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { role, setRole } = useOutletContext(); // Get context from layout
  const [loading, setLoading] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: role || 'patient',
    district: '',
    specializationId: '',
    hospitalId: ''
  });

  // Sync the form's role with the role from the layout context
  useEffect(() => {
    setForm(f => ({ ...f, role }));
  }, [role]);

  // Fetch specializations and hospitals for the dropdown
  useEffect(() => {
    (async () => {
      try {
        const [specRes, hospRes] = await Promise.all([
          api.get('/specializations'),
          api.get('/admin/hospitals/public')
        ]);
        setSpecializations(specRes.data.data || []);
        setHospitals(hospRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("Could not load required data. Please try again later.");
      }
    })();
  }, []);

  const onChange = (e) => {
    setError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.role === 'doctor' && !form.specializationId) {
      return setError('Please select a specialization.');
    }
    if (form.role === 'doctor' && !form.hospitalId) {
      return setError('Please select a hospital.');
    }
    if (!form.district) {
      return setError('Please select your district.');
    }
    setLoading(true);
    setError('');
    try {
      const user = await register(form);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. The email might already be in use.');
    } finally {
      setLoading(false);
    }
  };
  
  const inputCls =
    'w-full rounded-xl h-12 bg-background/60 border border-border pl-11 pr-11 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors';

  return (
    <div className="flex flex-col">
      {/* Role Switcher */}
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

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl glass p-6 shadow-card dark:shadow-card-dark">
        {error && (
          <div className="rounded-lg border border-error/20 bg-error/10 p-3 text-center text-sm text-error-fg">
            {error}
          </div>
        )}

        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" name="name" value={form.name} onChange={onChange} className={inputCls} placeholder="Full Name" required />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="email" name="email" value={form.email} onChange={onChange} className={inputCls} placeholder="your@email.com" required />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={onChange} className={cn(inputCls, 'pr-11')} placeholder="Password (min. 6 characters)" required minLength={6} />
          <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground">
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <AppSelect
          label="District"
          placeholder="Select your district"
          value={form.district}
          onChange={(value) => setForm({ ...form, district: value })}
          options={KERALA_DISTRICTS.map(district => ({ value: district, label: district }))}
          icon={MapPin}
          required
          searchable
          searchPlaceholder="Search districts..."
        />

        {role === 'doctor' && (
          <>
            <AppSelect
              label="Specialization"
              placeholder="Select your specialization"
              value={form.specializationId}
              onChange={(value) => setForm({ ...form, specializationId: value })}
              options={specializations.map(spec => ({ value: spec._id, label: spec.name }))}
              icon={Briefcase}
              required
              searchable
              searchPlaceholder="Search specializations..."
              loading={specializations.length === 0}
            />
            <AppSelect
              label="Hospital"
              placeholder="Select your hospital"
              value={form.hospitalId}
              onChange={(value) => setForm({ ...form, hospitalId: value })}
              options={hospitals
                .filter(h => !form.district || h.district === form.district)
                .map(hosp => ({ 
                  value: hosp._id, 
                  label: `${hosp.name} - ${hosp.district}` 
                }))}
              icon={Briefcase}
              required
              searchable
              searchPlaceholder="Search hospitals..."
              loading={hospitals.length === 0}
            />
          </>
        )}

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Creating Account…' : 'Create Account'}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className={cn(buttonVariants({ variant: 'link' }), 'px-0')}
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}