import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiCalendar, FiMapPin, FiLoader } from 'react-icons/fi';
import { AGE_LIMITS } from '@/shared/constants';
import type { MaritalStatus } from '@/shared/types';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    age: '',
    country: '',
    city: '',
    maritalStatus: 'NOT_IN_RELATIONSHIP' as MaritalStatus,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const age = parseInt(formData.age);
    
    // Age validation
    if (age < AGE_LIMITS.MIN_AGE) {
      toast.error(`You must be at least ${AGE_LIMITS.MIN_AGE} years old to join.`);
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        age,
        location: {
          country: formData.country,
          city: formData.city,
        },
        maritalStatus: formData.maritalStatus,
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
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
          <p className="text-gray-400">Create your account</p>
        </div>

        <div className="bg-accent-white/50 backdrop-blur-sm rounded-xl p-8 border border-accent-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background border border-accent-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background border border-accent-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="you@example.com"
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
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-accent-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">
                  Age
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min={AGE_LIMITS.MIN_AGE}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-accent-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="18"
                  />
                </div>
                {formData.age && parseInt(formData.age) < AGE_LIMITS.MIN_AGE && (
                  <p className="mt-1 text-sm text-primary-pink">
                    You must be at least {AGE_LIMITS.MIN_AGE} years old
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background border border-accent-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="United States"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background border border-accent-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="New York"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-300 mb-2">
                Marital Status
              </label>
              <select
                id="maritalStatus"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-background border border-accent-white rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              >
                <option value="NOT_IN_RELATIONSHIP">Not in a relationship</option>
                <option value="IN_RELATIONSHIP">In a relationship</option>
                <option value="MARRIED">Married</option>
              </select>
              <p className="mt-2 text-sm text-gray-400">
                {formData.maritalStatus === 'MARRIED' && 'You will have access to Passion Couples only.'}
                {formData.maritalStatus === 'IN_RELATIONSHIP' && 'You will have access to Passion Singles only.'}
                {formData.maritalStatus === 'NOT_IN_RELATIONSHIP' && 'You will have access to Passion Singles and Passion Connect (25+).'}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-blue text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-blue hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

