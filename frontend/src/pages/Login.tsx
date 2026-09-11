import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/...`,
  // your existing request body
);   
      console.log("LOGIN RESPONSE:", response);
      console.log("LOGIN DATA:", response.data);  
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
      window.location.reload(); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
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
        <h3 className="text-2xl font-bold tracking-tight text-center text-slate-800 mb-2">Welcome Back</h3>
        <p className="text-center text-slate-500 mb-6 text-sm">Sign in to FactoryPro System</p>
        <form onSubmit={handleLogin}>
          <div className="mt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
              <input type="email" placeholder="you@example.com"
                className="w-full px-4 py-2 mt-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-shadow"
                value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="mt-4 relative">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input type={showPassword ? "text" : "password"} placeholder="Enter your password"
                className="w-full px-4 py-2 mt-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-shadow pr-16"
                value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pt-6 pr-4 flex items-center text-indigo-600 font-medium text-sm hover:text-indigo-800 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {error && <p className="text-rose-500 text-sm font-medium mt-3 text-center bg-rose-50 p-2 rounded">{error}</p>}
            <div className="mt-6">
              <button disabled={isLoading} className={`w-full px-6 py-3 text-white font-medium rounded-lg shadow-md transition-colors ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {isLoading ? 'Authenticating...' : 'Login'}
              </button>
            </div>
            <div className="mt-6 text-center text-sm text-slate-600">
              Don't have an account? <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline">Create Account</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
