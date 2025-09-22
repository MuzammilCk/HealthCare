import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
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
        <input name="name" value={form.name} onChange={onChange} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm mb-1">Password</label>
        <input type="password" name="password" value={form.password} onChange={onChange} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm mb-1">Role</label>
        <select name="role" value={form.role} onChange={onChange} className="w-full border rounded px-3 py-2">
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
      </div>
      <button disabled={loading} className="w-full bg-blue-600 text-white px-4 py-2 rounded">{loading ? 'Creating…' : 'Create Account'}</button>
      <div className="text-sm text-center">
        Already have an account? <Link to="/auth/login" className="text-blue-600">Sign In</Link>
      </div>
    </form>
  );
}
