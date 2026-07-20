import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiUsers, FiFileText, FiClock } from 'react-icons/fi';
import { adminService, type ModerationPost } from '../../services/adminService';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, pendingPosts: 0 });
  const [pendingPosts, setPendingPosts] = useState<ModerationPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboard, moderation] = await Promise.all([
        adminService.getDashboard(),
        adminService.getModerationQueue(),
      ]);
      setStats(dashboard.stats);
      setPendingPosts(moderation.posts);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (postId: string) => {
    try {
      await adminService.approvePost(postId);
      toast.success('Post approved');
      loadData();
    } catch {
      toast.error('Failed to approve post');
    }
  };

  const handleReject = async (postId: string) => {
    const reason = prompt('Rejection reason (optional):') || 'Does not meet guidelines';
    try {
      await adminService.rejectPost(postId, reason);
      toast.success('Post rejected');
      loadData();
    } catch {
      toast.error('Failed to reject post');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-400 mb-8">Moderate community posts and monitor platform activity.</p>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-accent-white/50 rounded-xl p-6 border border-accent-white">
          <FiUsers className="w-8 h-8 text-primary-blue mb-3" />
          <div className="text-3xl font-bold">{stats.totalUsers}</div>
          <div className="text-gray-400">Total Users</div>
        </div>
        <div className="bg-accent-white/50 rounded-xl p-6 border border-accent-white">
          <FiFileText className="w-8 h-8 text-primary-pink mb-3" />
          <div className="text-3xl font-bold">{stats.totalPosts}</div>
          <div className="text-gray-400">Total Posts</div>
        </div>
        <div className="bg-accent-white/50 rounded-xl p-6 border border-accent-white">
          <FiClock className="w-8 h-8 text-flare-blue mb-3" />
          <div className="text-3xl font-bold">{stats.pendingPosts}</div>
          <div className="text-gray-400">Pending Review</div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Pending Posts</h2>
      {pendingPosts.length === 0 ? (
        <div className="bg-accent-white/50 rounded-xl p-8 border border-accent-white text-center text-gray-400">
          No posts awaiting moderation.
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPosts.map((post) => (
            <div
              key={post.id}
              className="bg-accent-white/50 rounded-xl p-6 border border-accent-white"
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                  <span className="text-xs uppercase tracking-wide text-primary-blue">{post.module}</span>
                  <p className="text-gray-300 mt-2">{post.content}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    By {post.userId?.fullName || 'User'} · {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(post.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30"
                >
                  <FiCheck className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(post.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                >
                  <FiX className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
