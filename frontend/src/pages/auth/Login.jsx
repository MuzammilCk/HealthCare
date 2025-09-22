import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

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
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12" placeholder="your@email.com" />
      </div>
      <div>
        <label className="block text-sm mb-1">Password</label>
        <input type="password" name="password" value={form.password} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12" />
      </div>
      <button disabled={loading} className="w-full bg-primary text-white px-4 py-2 rounded-lg h-11">{loading ? 'Signing in…' : 'Sign In'}</button>
      <div className="text-sm text-center">
        No account? <Link to="/auth/register" className="text-primary">Register</Link>
      </div>
    </form>
  );
}