import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      await axios.post('${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/register', { 
        name, 
        email, 
        password,
        role: 'USER' // Defaults to normal user
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans">
      <div className="px-8 py-8 mt-4 text-left bg-white shadow-xl rounded-xl w-full max-w-md border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg flex items-center justify-center text-white font-bold text-2xl">
            F
          </div>
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-center text-slate-800 mb-2">Create an Account</h3>
        <p className="text-center text-slate-500 mb-6 text-sm">Join the FactoryPro System</p>
        
        {success ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center border border-green-200">
            Account created successfully! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="name">Full Name</label>
                <input type="text" placeholder="John Doe"
                  className="w-full px-4 py-2 mt-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-shadow"
                  value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
                <input type="email" placeholder="john@factory.com"
                  className="w-full px-4 py-2 mt-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-shadow"
                  value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input type="password" placeholder="Create a strong password"
                  className="w-full px-4 py-2 mt-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-shadow"
                  value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} minLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                <input type="password" placeholder="Confirm your password"
                  className="w-full px-4 py-2 mt-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-shadow"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading} minLength={6} />
              </div>
              
              {error && <p className="text-rose-500 text-sm font-medium mt-3 text-center bg-rose-50 p-2 rounded">{error}</p>}
              
              <div className="pt-2">
                <button disabled={isLoading} className={`w-full px-6 py-3 text-white font-medium rounded-lg shadow-md transition-colors ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-slate-600">
              Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline">Login here</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
