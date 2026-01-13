import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register({ username, password, firstName, lastName });
    setLoading(false);
    if (result.success) {
      toast.success('Account created — you are now logged in');
      navigate('/');
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-gray-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Register a new account to shop</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="input-field" />
            <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className="input-field" />
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="input-field" />
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="input-field" />
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating...' : 'Create account'}</button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-primary-600 font-semibold">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default Register;