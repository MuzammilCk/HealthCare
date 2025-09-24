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
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </span>
        <input name="name" value={form.name} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12 pl-10" placeholder="Full Name"/>
      </div>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </span>
        <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12 pl-10" placeholder="Email"/>
      </div>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </span>
        <input type="password" name="password" value={form.password} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12 pl-10" placeholder="Password"/>
      </div>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM5 9a1 1 0 00-1 1v6a1 1 0 102 0v-6a1 1 0 00-1-1zm10-1a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 011-1zM9 9a1 1 0 00-1 1v6a1 1 0 102 0v-6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </span>
        <select name="role" value={form.role} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12 pl-10 appearance-none">
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
      </div>
      
      {/* Conditionally render specialization dropdown */}
      {form.role === 'doctor' && (
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 2a1 1 0 00-1 1v1H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H8V3a1 1 0 00-1-1zm3 11a1 1 0 10-2 0v2a1 1 0 102 0v-2zm3-3a1 1 0 10-2 0v5a1 1 0 102 0V10z" clipRule="evenodd" />
            </svg>
          </span>
          <select name="specializationId" value={form.specializationId} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12 pl-10 appearance-none">
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