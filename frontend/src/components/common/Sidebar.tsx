import {
  FiBook,
  FiDollarSign,
  FiHeart,
  FiHome,
  FiUsers
} from 'react-icons/fi';
import { NavLink, useLocation } from 'react-router-dom';
import { MODULE_ACCESS_RULES } from '@/shared/constants';
import { useAuthStore } from '../../store/authStore';

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();
  
  if (!user) return null;

  // Determine allowed modules based on marital status
  const allowedModules = MODULE_ACCESS_RULES[user.maritalStatus] || [];
  const hasSinglesAccess = allowedModules.includes('PASSION_SINGLES');
  const hasConnectAccess = allowedModules.includes('PASSION_CONNECT');
  const hasCouplesAccess = allowedModules.includes('PASSION_COUPLES');

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: FiHome,
      show: true,
    },
    {
      name: 'Passion Singles',
      path: '/passion-singles',
      icon: FiUsers,
      show: hasSinglesAccess,
    },
    {
      name: 'Passion Connect',
      path: '/passion-connect',
      icon: FiHeart,
      show: hasConnectAccess && user.age >= 25,
    },
    {
      name: 'Passion Couples',
      path: '/passion-couples',
      icon: FiBook,
      show: hasCouplesAccess,
    },
    {
      name: 'Partnership',
      path: '/partnership',
      icon: FiDollarSign,
      show: true,
    },
  ].filter(item => item.show);

  return (
    <aside className="w-64 bg-background border-r border-accent-white min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                ${isActive 
                  ? 'bg-primary-blue/20 text-primary-blue border-l-4 border-primary-blue' 
                  : 'text-gray-300 hover:bg-accent-white hover:text-primary-blue'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

