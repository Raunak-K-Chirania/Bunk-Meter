import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiShield, FiSearch, FiTrash2, FiCalendar, FiBook, FiCheckCircle 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ConfirmModal } from '../components/common/Modal';
import { toast } from '../components/common/Toast';
import { adminAPI } from '../utils/api';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [confirmAdminUser, setConfirmAdminUser] = useState(null);
  const [deleteUserObj, setDeleteUserObj] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAdmin = async () => {
    if (!confirmAdminUser) return;
    setModalLoading(true);
    try {
      await adminAPI.toggleAdmin(confirmAdminUser._id);
      toast.success(`Updated role for ${confirmAdminUser.name}!`);
      setConfirmAdminUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update admin status');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserObj) return;
    setModalLoading(true);
    try {
      await adminAPI.deleteUser(deleteUserObj._id);
      toast.success(`Successfully deleted user ${deleteUserObj.name}! 🗑️`);
      setDeleteUserObj(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setModalLoading(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter(
    (u) =>
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.isAdmin).length;
  const activeUsers = users.filter((u) => u.subjectCount > 0).length;
  const totalSubjects = users.reduce((acc, u) => acc + (u.subjectCount || 0), 0);
  const avgSubjects = totalUsers ? (totalSubjects / totalUsers).toFixed(1) : 0;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <FiShield className="text-indigo-500" />
              Admin Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage users registered on the platform and monitor activity.</p>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          {
            title: 'Total Users',
            value: totalUsers,
            icon: FiUsers,
            color: '#6366f1',
            sub: 'Registered accounts',
          },
          {
            title: 'Admin Accounts',
            value: adminCount,
            icon: FiShield,
            color: '#10b981',
            sub: 'System administrators',
          },
          {
            title: 'Active Students',
            value: activeUsers,
            icon: FiBook,
            color: '#06b6d4',
            sub: 'Users tracking attendance',
          },
          {
            title: 'Avg Subjects/User',
            value: avgSubjects,
            icon: FiCheckCircle,
            color: '#f59e0b',
            sub: 'Active tracking details',
          },
        ].map(({ title, value, icon: Icon, color, sub }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass-card rounded-2xl p-5 relative overflow-hidden group border border-white/5"
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: color }} />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <span className="text-xs text-slate-500 font-medium px-2.5 py-1 rounded-full bg-white/5">{sub}</span>
            </div>
            <p className="text-slate-400 text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-white">Platform Users</h2>
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm">Fetching registered users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FiUsers className="mx-auto mb-3" size={40} />
            <p className="text-sm">No users found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4">User</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Subjects Tracked</th>
                  <th className="py-4 px-4">Joined Date</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredUsers.map((userObj) => (
                    <motion.tr
                      key={userObj._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-slate-300 hover:bg-white/5 transition-colors"
                    >
                      {/* User Avatar + Email */}
                      <td className="py-4 px-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {userObj.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate">{userObj.name}</p>
                          <p className="text-slate-500 text-xs truncate">{userObj.email}</p>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        {userObj.isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/5">
                            <FiShield size={12} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
                            Student
                          </span>
                        )}
                      </td>

                      {/* Subjects Count */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <FiBook size={14} className="text-slate-500" />
                          <span className="font-semibold text-white">{userObj.subjectCount || 0}</span>
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 text-slate-400 text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <FiCalendar size={14} className="text-slate-500" />
                          {new Date(userObj.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {userObj._id !== currentUser?._id ? (
                            <>
                              <button
                                onClick={() => setConfirmAdminUser(userObj)}
                                className={`p-2 rounded-lg transition-colors border ${
                                  userObj.isAdmin 
                                    ? 'text-amber-400 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-300' 
                                    : 'text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10 hover:text-indigo-300'
                                }`}
                                title={userObj.isAdmin ? 'Demote to Student' : 'Promote to Admin'}
                              >
                                <FiShield size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteUserObj(userObj)}
                                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-red-500/20"
                                title="Delete User"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-500 italic px-2">Current Session</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={!!confirmAdminUser}
        onClose={() => setConfirmAdminUser(null)}
        onConfirm={handleToggleAdmin}
        title={confirmAdminUser?.isAdmin ? 'Demote Admin' : 'Promote to Admin'}
        message={
          confirmAdminUser?.isAdmin
            ? `Are you sure you want to remove admin privileges from ${confirmAdminUser?.name}? They will lose access to administrative functions.`
            : `Are you sure you want to grant administrative privileges to ${confirmAdminUser?.name}? They will have full access to platform configuration and user data.`
        }
        isLoading={modalLoading}
      />

      <ConfirmModal
        isOpen={!!deleteUserObj}
        onClose={() => setDeleteUserObj(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={`WARNING: Are you sure you want to permanently delete the account for ${deleteUserObj?.name} (${deleteUserObj?.email})? This action CANNOT be undone, and all their attendance data, logs, and tracked subjects will be deleted forever.`}
        isLoading={modalLoading}
      />
    </DashboardLayout>
  );
};

export default AdminUsers;
