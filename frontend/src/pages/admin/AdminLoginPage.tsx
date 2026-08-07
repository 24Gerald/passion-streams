import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLoader } from 'react-icons/fi';
import { ADMIN_PASSWORD } from '@/shared/constants';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@passionstreams.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await adminLogin(email, password);
      toast.success('Admin access granted');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };
  //sendback the file info at 0
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="PassionStreams Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gradient-blue">Admin Portal</h1>
          <p className="text-gray-400">Sign in with your admin account</p>
        </div>

        <div className="bg-accent-white/50 backdrop-blur-sm rounded-xl p-8 border border-accent-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-background border border-accent-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="admin@passionstreams.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-background border border-accent-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="Admin password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-blue text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Seed password: <span className="text-gray-400">{ADMIN_PASSWORD}</span>
          </p>
          <p className="mt-2 text-center">
            <Link to="/" className="text-primary-blue hover:underline text-sm">
              Back to site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
