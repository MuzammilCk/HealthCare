import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', specializationId: '' });
  const [loading, setLoading] = useState(false);
  const [specializations, setSpecializations] = useState([]);

  // Fetch specializations when the component mounts
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/specializations');
        setSpecializations(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch specializations", err);
      }
    })();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.role === 'doctor' && !form.specializationId) {
      return alert('Please select a specialization.');
    }
    setLoading(true);
    try {
      const user = await register(form);
      navigate(`/${user.role}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Full Name</label>
        <input name="name" value={form.name} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12" />
      </div>
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12" />
      </div>
      <div>
        <label className="block text-sm mb-1">Password</label>
        <input type="password" name="password" value={form.password} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12" />
      </div>
      <div>
        <label className="block text-sm mb-1">Role</label>
        <select name="role" value={form.role} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12">
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
      </div>
      
      {/* Conditionally render specialization dropdown */}
      {form.role === 'doctor' && (
        <div>
          <label className="block text-sm mb-1">Specialization</label>
          <select name="specializationId" value={form.specializationId} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12">
            <option value="">Select your specialization</option>
            {specializations.map(spec => (
              <option key={spec._id} value={spec._id}>{spec.name}</option>
            ))}
          </select>
        </div>
      )}

      <button disabled={loading} className="w-full bg-primary text-white px-4 py-2 rounded-lg h-11">{loading ? 'Creating…' : 'Create Account'}</button>
      <div className="text-sm text-center">
        Already have an account? <Link to="/auth/login" className="text-primary">Sign In</Link>
      </div>
    </form>
  );
}