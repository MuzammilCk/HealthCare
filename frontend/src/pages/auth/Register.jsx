import { useEffect, useState } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiMapPin, FiBriefcase } from 'react-icons/fi';
import { AppSelect } from '../../components/ui';
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
  
  const btnBase = "w-full px-4 py-2 rounded-lg font-semibold transition-all duration-300 ease-in-out";
  const btnActive = `bg-primary text-white shadow-md`;
  const btnInactive = `bg-bg-page text-text-secondary hover:bg-slate-200`;

  return (
    <div className="flex flex-col">
      {/* Role Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-bg-page rounded-lg mb-6">
        <button onClick={() => setRole('patient')} className={`${btnBase} ${role === 'patient' ? btnActive : btnInactive}`}>
          I'm a Patient
        </button>
        <button onClick={() => setRole('doctor')} className={`${btnBase} ${role === 'doctor' ? btnActive : btnInactive}`}>
          I'm a Doctor
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && <div className="bg-error/10 border border-error/20 text-error text-sm rounded-lg p-3 text-center">{error}</div>}
        
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input type="text" name="name" value={form.name} onChange={onChange} className="w-full bg-bg-page border border-slate-300/70 rounded-lg h-12 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Full Name" required />
        </div>

        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input type="email" name="email" value={form.email} onChange={onChange} className="w-full bg-bg-page border border-slate-300/70 rounded-lg h-12 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="your@email.com" required />
        </div>
        
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={onChange} className="w-full bg-bg-page border border-slate-300/70 rounded-lg h-12 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Password (min. 6 characters)" required minLength={6} />
          <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary">
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        
        <AppSelect
          label="District"
          placeholder="Select your district"
          value={form.district}
          onChange={(value) => setForm({ ...form, district: value })}
          options={KERALA_DISTRICTS.map(district => ({ value: district, label: district }))}
          icon={FiMapPin}
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
              icon={FiBriefcase}
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
              icon={FiBriefcase}
              required
              searchable
              searchPlaceholder="Search hospitals..."
              loading={hospitals.length === 0}
            />
          </>
        )}

        <button disabled={loading} className="w-full bg-primary text-white font-bold px-4 py-2 rounded-lg h-12 transition-all duration-300 ease-in-out hover:bg-primary-light hover:shadow-lg hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
          {loading ? 'Creating Account…' : 'Create Account'}
        </button>

        <div className="text-sm text-center text-text-secondary">
          Already have an account? <Link to="/auth/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </div>
      </form>
    </div>
  );
}