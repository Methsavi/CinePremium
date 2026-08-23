import { useState, useEffect } from "react";
import { getRegisteredUsers, deleteUser } from "../../../services/userApi";
import { User } from "../../../types/auth";
import { useNotification } from "../../../context/NotificationContext";
import { Search, Edit2, Trash2, RefreshCw, Users, ShieldAlert } from "lucide-react";

function RegisteredUsers() {
  const { addNotification } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getRegisteredUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;

    try {
      setDeletingId(id);
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      addNotification({ message: 'Deleted Successfully', type: 'delete' });
    } catch (err) {
      addNotification({ message: 'Action Failed', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Registered Users</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Manage customer and administrator access permissions</p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-red-500/50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-red-500" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Card Container with sleek minimized radius */}
      <div className="bg-[#0d0d10] border border-white/10 rounded-xl overflow-hidden shadow-md">
        {/* Search Bar inside card header */}
        <div className="p-5 pb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border border-white/15 text-white placeholder:text-zinc-500 text-xs sm:text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
            <span className="text-xs">Loading registered users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-2">
            <Users className="w-10 h-10 text-zinc-700" />
            <p className="text-sm font-medium text-zinc-300">No users found</p>
            <p className="text-xs text-zinc-500">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-t border-b border-white/10 text-xs font-semibold text-zinc-400">
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Joined</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user, idx) => {
                  const avatarLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                  const formattedDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US')
                    : '5/23/2026';

                  const avatarColors = [
                    'bg-red-600', 'bg-zinc-700', 'bg-red-700', 'bg-zinc-800', 'bg-red-800'
                  ];
                  const avatarBg = avatarColors[idx % avatarColors.length];

                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* User Avatar + Name + Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
                            {avatarLetter}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">{user.name}</div>
                            <div className="text-xs text-zinc-400">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-300 font-medium capitalize">
                        {user.role || 'User'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-emerald-400">
                          Active
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => addNotification({ message: 'Edit mode for user', type: 'info' })}
                            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={deletingId === user.id}
                            className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisteredUsers;