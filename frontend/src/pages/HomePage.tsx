import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiArrowRight, FiHeart, FiUsers, FiBook } from 'react-icons/fi';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/10 via-transparent to-primary-pink/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="PassionStreams Logo" 
                className="h-24 w-24 md:h-32 md:w-32 object-contain"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient-blue">Passion</span>
              <span className="text-gradient-pink">Streams</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Intentional relationship growth, faith-based mentorship, and godly matchmaking
            </p>
            {!isAuthenticated && (
              <div className="flex justify-center space-x-4">
                <Link
                  to="/login"
                  className="px-8 py-4 bg-gradient-blue text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-blue/50 transition-all flex items-center space-x-2"
                >
                  <span>Get Started</span>
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                {/* <Link
                  to="/signup"
                  className="px-8 py-4 bg-gradient-blue text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-blue/50 transition-all flex items-center space-x-2"
                >
                  <span>Get Started</span>
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-transparent border-2 border-primary-blue text-primary-blue rounded-lg font-semibold hover:bg-primary-blue/10 transition-all"
                >
                  Sign In
                </Link> */}
              </div>
            )}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-blue text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-blue/50 transition-all"
              >
                <span>Go to Dashboard</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Three Core Modules
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-accent-white/50 backdrop-blur-sm rounded-xl p-8 border border-accent-white">
            <FiUsers className="w-12 h-12 text-primary-blue mb-4" />
            <h3 className="text-2xl font-bold mb-4">Passion Singles</h3>
            <p className="text-gray-300">
              Pre-marital growth and preparation. Training library, courses, and a supportive community.
            </p>
          </div>
          <div className="bg-accent-white/50 backdrop-blur-sm rounded-xl p-8 border border-accent-white">
            <FiHeart className="w-12 h-12 text-primary-pink mb-4" />
            <h3 className="text-2xl font-bold mb-4">Passion Connect</h3>
            <p className="text-gray-300">
              Guided godly matchmaking for those 25+ who have completed their growth journey.
            </p>
          </div>
          <div className="bg-accent-white/50 backdrop-blur-sm rounded-xl p-8 border border-accent-white">
            <FiBook className="w-12 h-12 text-flare-blue mb-4" />
            <h3 className="text-2xl font-bold mb-4">Passion Couples</h3>
            <p className="text-gray-300">
              Marriage enhancement, healing, and restoration through content and counseling.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-primary-blue/20 to-primary-pink/20 rounded-2xl p-12 text-center border border-accent-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join a community committed to intentional, faith-based relationships
          </p>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-blue text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-blue/50 transition-all"
            >
              <span>Get Started</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
            {/* <Link
              to="/signup"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-blue text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-blue/50 transition-all"
            >
              <span>Create Account</span>
              <FiArrowRight className="w-5 h-5" />
            </Link> */}
          )}
        </div>
      </section>
    </div>
  );
}

