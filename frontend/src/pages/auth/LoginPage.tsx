import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLoader, FiCalendar } from 'react-icons/fi';
import { AGE_LIMITS } from '../../../../shared/constants';
import { MaritalStatus } from '@/shared/types';

type LoginMode = 'account' | 'guest';

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(MaritalStatus.NOT_IN_RELATIONSHIP);
  const [isLoading, setIsLoading] = useState(false);
  const { login, setGuestProfile } = useAuthStore();
  const navigate = useNavigate();

  const parsedAge = parseInt(age) || 0;

  const accessMessage = (() => {
    if (maritalStatus === MaritalStatus.MARRIED) {
      return 'You will have access to Passion Couples only.';
    }
    if (maritalStatus === MaritalStatus.IN_RELATIONSHIP) {
      return 'You will have access to Passion Singles only.';
    }
    if (parsedAge >= AGE_LIMITS.PASSION_CONNECT_MIN_AGE) {
      return 'You will have access to Passion Singles and Passion Connect.';
    }
    return 'You will have access to Passion Singles only. Passion Connect unlocks at age 25.';
  })();

  const handleAccountSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (parsedAge < AGE_LIMITS.MIN_AGE) {
      toast.error(`You must be at least ${AGE_LIMITS.MIN_AGE} years old.`);
      return;
    }

    setIsLoading(true);
    setGuestProfile(parsedAge, maritalStatus);
    toast.success('Welcome! Browse modules — sign in for full features.');
    navigate('/dashboard');
    setIsLoading(false);
  };

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
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient-blue">Passion</span>
            <span className="text-gradient-pink">Streams</span>
          </h1>
          <p className="text-gray-400">Sign in to post, chat, and connect</p>
        </div>

        <div className="bg-accent-white/50 backdrop-blur-sm rounded-xl p-8 border border-accent-white">
          <div className="flex mb-6 rounded-lg bg-background p-1">
            <button
              type="button"
              onClick={() => setMode('account')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'account' ? 'bg-primary-blue text-white' : 'text-gray-400'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('guest')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'guest' ? 'bg-primary-blue text-white' : 'text-gray-400'
              }`}
            >
              Guest Browse
            </button>
          </div>

          {mode === 'account' ? (
            <form onSubmit={handleAccountSubmit} className="space-y-6">
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
                    placeholder="sarah@test.com"
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
                    placeholder="password123"
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Test: sarah@test.com / password123
              </p>
            </form>
          ) : (
            <form onSubmit={handleGuestSubmit} className="space-y-6">
              <p className="text-sm text-gray-400">
                Guest mode lets you browse modules only. Sign in for posts, chat, and Connect.
              </p>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">
                  Age
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="age"
                    type="number"
                    min={AGE_LIMITS.MIN_AGE}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background border border-accent-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="Your age"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-300 mb-2">
                  Marital Status
                </label>
                <select
                  id="maritalStatus"
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                  required
                  className="w-full px-4 py-3 bg-background border border-accent-white rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="NOT_IN_RELATIONSHIP">Not in a relationship</option>
                  <option value="IN_RELATIONSHIP">In a relationship</option>
                  <option value="MARRIED">Married</option>
                </select>
                <p className="mt-2 text-sm text-gray-400">{accessMessage}</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-blue text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Continue as Guest</span>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-primary-blue hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
