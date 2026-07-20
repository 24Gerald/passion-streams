import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiX, FiUser, FiAward, FiTrendingUp } from 'react-icons/fi';
import { connectService } from '../../services/connectService';
// import { useAuthStore } from '../../store/authStore';
import type { PassionConnectProfile } from '@/shared/types';
import toast from 'react-hot-toast';

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<PassionConnectProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);
  // const { user } = useAuthStore();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const data = await connectService.discover();
      setProfiles(data);
      setCurrentIndex(0);
    } catch (error: any) {
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action: 'like' | 'pass') => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    setDirection(action === 'like' ? 1 : -1);

    try {
      const targetUserId =
        typeof currentProfile.userId === 'object'
          ? (currentProfile.userId as { id?: string }).id
          : currentProfile.userId;

      if (!targetUserId) {
        toast.error('Invalid profile');
        return;
      }

      const result = await connectService.swipe(targetUserId, action);
      
      if (result.connected) {
        toast.success('It\'s a match! 🎉');
      }

      // Move to next profile
      if (currentIndex < profiles.length - 1) {
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setDirection(0);
        }, 300);
      } else {
        toast.error('No more profiles! Check back later.');
      }
    } catch (error: any) {
      toast.error('Failed to swipe');
      setDirection(0);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-pink"></div>
      </div>
    );
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent-white/50 backdrop-blur-sm rounded-xl p-12 border border-accent-white"
        >
          <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No More Profiles</h2>
          <p className="text-gray-400 mb-6">
            You've seen all available profiles. Check back later for new matches!
          </p>
          <button
            onClick={fetchProfiles}
            className="px-6 py-3 bg-gradient-pink text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-pink/50 transition-all"
          >
            Refresh
          </button>
        </motion.div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  // const growthPercentage = user?.growthPercentage || 0;
  const profileGrowthPercentage = 0; // Would come from profile owner's data

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold mb-2 text-gradient-pink">Discover</h1>
        <p className="text-gray-400">Swipe through profiles based on your growth tier</p>
        <div className="mt-4 text-sm text-gray-400">
          {currentIndex + 1} of {profiles.length} profiles
        </div>
      </motion.div>

      {/* Profile Card */}
      <div className="relative h-[600px] mb-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentProfile.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 bg-accent-white/50 backdrop-blur-sm rounded-2xl p-8 border border-accent-white overflow-hidden"
          >
            {/* Photos Carousel */}
            {currentProfile.photos && currentProfile.photos.length > 0 ? (
              <div className="relative h-80 rounded-xl overflow-hidden mb-6">
                <img
                  src={currentProfile.photos[0]}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                {currentProfile.photos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {currentProfile.photos.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-white' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-80 rounded-xl bg-primary-pink/20 flex items-center justify-center mb-6">
                <FiUser className="w-32 h-32 text-primary-pink/40" />
              </div>
            )}

            {/* Profile Info */}
            <div className="space-y-4">
              {/* Growth Tier */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-pink/20 to-primary-blue/20 rounded-lg border border-accent-white">
                <div className="flex items-center space-x-2">
                  <FiTrendingUp className="w-5 h-5 text-primary-blue" />
                  <span className="text-sm font-medium">Growth Tier</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gradient-pink">Tier 2</div>
                  <div className="text-xs text-gray-400">{profileGrowthPercentage}% Complete</div>
                </div>
              </div>

              {/* Bio */}
              {currentProfile.bio && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">About</h3>
                  <p className="text-gray-300 leading-relaxed">{currentProfile.bio}</p>
                </div>
              )}

              {/* Interests */}
              {currentProfile.interests && currentProfile.interests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-blue/20 text-primary-blue rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* What They Seek */}
              {currentProfile.whatYouSeek && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Looking For</h3>
                  <p className="text-gray-300 leading-relaxed">{currentProfile.whatYouSeek}</p>
                </div>
              )}

              {/* Testimonial */}
              {currentProfile.testimonial && (
                <div className="p-4 bg-primary-blue/10 rounded-lg border border-primary-blue/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiAward className="w-4 h-4 text-primary-blue" />
                    <span className="text-sm font-medium text-primary-blue">Testimonial</span>
                  </div>
                  <p className="text-sm text-gray-300 italic">"{currentProfile.testimonial}"</p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('pass')}
          className="w-16 h-16 rounded-full bg-accent-white/50 border-2 border-gray-400 flex items-center justify-center hover:bg-accent-white hover:border-primary-blue transition-all"
        >
          <FiX className="w-8 h-8 text-gray-400" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('like')}
          className="w-20 h-20 rounded-full bg-gradient-pink flex items-center justify-center shadow-lg shadow-primary-pink/50 hover:shadow-xl hover:shadow-primary-pink/50 transition-all"
        >
          <FiHeart className="w-10 h-10 text-white" />
        </motion.button>
      </div>
    </div>
  );
}
