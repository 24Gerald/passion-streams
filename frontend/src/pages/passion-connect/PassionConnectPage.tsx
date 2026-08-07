import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AGE_LIMITS } from '@/shared/constants';
import ModuleNavigation from '../../components/common/ModuleNavigation';
import ProfilePage from './ProfilePage';
import DiscoverPage from './DiscoverPage';
import ConnectionsPage from './ConnectionsPage';
import ChatPage from './ChatPage';

export default function PassionConnectPage() {
  const { user } = useAuthStore();
  
  if (!user || user.age < AGE_LIMITS.PASSION_CONNECT_MIN_AGE) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
        <p className="text-gray-400">
          Passion Connect is available for users aged {AGE_LIMITS.PASSION_CONNECT_MIN_AGE} and above.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ModuleNavigation module="connect" />
      <Routes>
        <Route index element={<Navigate to="discover" replace />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="connections" element={<ConnectionsPage />} />
        <Route path="chat/:chatId" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

