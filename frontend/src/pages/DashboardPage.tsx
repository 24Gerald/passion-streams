import { FiArrowRight, FiBook, FiHeart, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AGE_LIMITS, MODULE_ACCESS_RULES } from '@/shared/constants';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const allowedModules = MODULE_ACCESS_RULES[user.maritalStatus] || [];
  const hasSinglesAccess = allowedModules.includes('PASSION_SINGLES');
  const hasConnectAccess = allowedModules.includes('PASSION_CONNECT') && user.age >= AGE_LIMITS.PASSION_CONNECT_MIN_AGE;
  const hasCouplesAccess = allowedModules.includes('PASSION_COUPLES');

  const modules = [
    {
      name: 'Passion Singles',
      description: 'Pre-marital growth and preparation',
      path: '/passion-singles',
      icon: FiUsers,
      color: 'primary-blue',
      show: hasSinglesAccess,
    },
    {
      name: 'Passion Connect',
      description: 'Guided godly matchmaking (25+)',
      path: '/passion-connect',
      icon: FiHeart,
      color: 'primary-pink',
      show: hasConnectAccess,
      disabled: user.age < AGE_LIMITS.PASSION_CONNECT_MIN_AGE,
      disabledReason: 'Must be 25+ to access Passion Connect',
    },
    {
      name: 'Passion Couples',
      description: 'Marriage enhancement and restoration',
      path: '/passion-couples',
      icon: FiBook,
      color: 'flare-blue',
      show: hasCouplesAccess,
    },
  ].filter(m => m.show || m.disabled);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user.fullName}!
        </h1>
        <p className="text-gray-400">
          Choose a module to continue your journey
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          const isDisabled = module.disabled;

          return (
            <div
              key={module.path}
              className={`
                relative bg-accent-white/50 backdrop-blur-sm rounded-xl p-6 border border-accent-white
                ${isDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:border-primary-blue hover:shadow-lg hover:shadow-primary-blue/20 cursor-pointer transition-all'
                }
              `}
              onClick={() => !isDisabled && navigate(module.path)}
            >
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center mb-4
                ${module.color === 'primary-blue' ? 'bg-primary-blue/20' : ''}
                ${module.color === 'primary-pink' ? 'bg-primary-pink/20' : ''}
                ${module.color === 'flare-blue' ? 'bg-flare-blue/20' : ''}
              `}>
                <Icon className={`
                  w-6 h-6
                  ${module.color === 'primary-blue' ? 'text-primary-blue' : ''}
                  ${module.color === 'primary-pink' ? 'text-primary-pink' : ''}
                  ${module.color === 'flare-blue' ? 'text-flare-blue' : ''}
                `} />
              </div>
              <h2 className="text-2xl font-bold mb-2">{module.name}</h2>
              <p className="text-gray-400 mb-4">{module.description}</p>
              
              {isDisabled ? (
                <p className="text-sm text-primary-pink">{module.disabledReason}</p>
              ) : (
                <div className="flex items-center text-primary-blue">
                  <span className="text-sm font-medium">Enter Module</span>
                  <FiArrowRight className="w-4 h-4 ml-2" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Stats or Recent Activity can be added here */}
    </div>
  );
}

