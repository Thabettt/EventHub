import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useDeviceDetection from "../../hooks/useDeviceDetection";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import { getAllUsers, updateUserRole, deleteUser } from "../../services/userService";

const UserManagementPage = () => {
  const { currentUser } = useAuth();
  const deviceInfo = useDeviceDetection();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Fetch users using the service
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await getAllUsers();
        setUsers(data.data || []); 
        setIsLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch users");
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteUser(userId);
        setUsers(users.filter((user) => user._id !== userId));
      } catch (err) {
        alert(err.message || "Failed to delete user");
      }
    }
  };
  
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      
      // Update local state and reflect change immediately
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      alert(err.message || "Failed to update user role");
    }
  };

  // Helper to render role badge style
  const getRoleBadgeStyle = (role) => {
    switch(role) {
      case 'System Admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Organizer': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300 relative">
      
      {/* Mobile Header */}
      {(deviceInfo.isMobile || deviceInfo.isTablet) && (
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 sticky top-0 z-40">
           <div className="flex items-center gap-3">
             <Button
              to="/admin/dashboard"
              variant="back"
              size="square"
              className="!bg-gray-100 dark:!bg-white/10 !text-gray-900 dark:!text-white"
             />
            <div>
              <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                User Management
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                {filteredUsers.length} users
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      {deviceInfo.isDesktop && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
               <Button
                to="/admin/dashboard"
                variant="back"
                size="default"
                className="!bg-gray-100 dark:!bg-white/10 !text-gray-900 dark:!text-white hover:!bg-gray-200 dark:hover:!bg-white/20"
               />
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  User Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                  {filteredUsers.length} platform users • {currentUser?.name || "Admin"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

       <div className={`flex-1 ${deviceInfo.isDesktop ? 'p-8' : 'p-4'} overflow-y-auto`}>
        {/* Search and Filters Section */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50 mb-6">
           {deviceInfo.isDesktop && (
             <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                    User Directory
                  </h2>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">👥</span>
                </div>
              </div>
           )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
               {/* Search Bar */}
               <div className="lg:col-span-5">
                 <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-lg">🔍</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); 
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Filter Controls */}
              <div className="lg:col-span-7">
                 <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1); 
                  }}
                   className="w-full lg:w-auto px-4 pr-10 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 12px center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "20px",
                    }}
                >
                  <option value="all">All Roles</option>
                  <option value="Standard User">Standard User</option>
                  <option value="Organizer">Organizer</option>
                  <option value="System Admin">System Admin</option>
                </select>
              </div>
           </div>
        </div>

        {/* Loading / Error States */}
         {isLoading ? (
            <LoadingSpinner
              variant="page"
              size="xl"
              message="Loading Users"
            />
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-6 rounded-3xl shadow-lg">
               <div className="flex items-center">
                <span className="text-3xl mr-4">⚠️</span>
                <div>
                  <h3 className="text-red-800 dark:text-red-200 font-bold text-lg">Error Loading Users</h3>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
             <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-12 text-center shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <span className="text-4xl block mb-4">👥</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Users Found</h3>
              <p className="text-gray-600 dark:text-gray-400">No users match your criteria.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              {deviceInfo.isDesktop ? (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                   <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50/70 dark:bg-gray-900/70">
                        <tr>
                           <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">User Details</th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Role</th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Join Date</th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                       <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                        {currentUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors duration-200 group">
                            <td className="px-8 py-6">
                               <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                   <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {user.name}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                             <td className="px-8 py-6">
                              <div className="relative inline-block">
                                 <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                    className={`text-xs font-bold border-none rounded-xl px-4 py-2 cursor-pointer transition-all appearance-none pr-8 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${getRoleBadgeStyle(user.role)} hover:opacity-80`}
                                      style={{
                                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                      backgroundPosition: "right 8px center",
                                      backgroundRepeat: "no-repeat",
                                      backgroundSize: "12px",
                                    }}
                                  >
                                    <option value="Standard User">Standard User</option>
                                    <option value="Organizer">Organizer</option>
                                     <option value="System Admin">System Admin</option>
                                  </select>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center space-x-2">
                                <span className="text-lg">📅</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <Button
                                onClick={() => handleDeleteUser(user._id)}
                                variant="danger"
                                size="small"
                                className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Mobile Card View */
                <div className="space-y-4">
                  {currentUsers.map((user) => (
                    <div key={user._id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white text-base">
                                {user.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-xs font-bold ${getRoleBadgeStyle(user.role).split(' ')[0]} ${getRoleBadgeStyle(user.role).split(' ')[1]} ${getRoleBadgeStyle(user.role).split(' ')[2] || ''}`}>
                          {user.role}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                           <span>📅</span> Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                           <select 
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                           >
                              <option value="Standard User">User</option>
                              <option value="Organizer">Organizer</option>
                              <option value="System Admin">Admin</option>
                           </select>
                           <button 
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg text-xs font-bold"
                           >
                              Delete
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

               {/* Pagination Controls */}
               {totalPages > 1 && (
                  <div className={`mt-6 flex items-center justify-between ${deviceInfo.isMobile ? 'flex-col gap-4' : ''}`}>
                     <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Showing <span className="font-bold text-gray-900 dark:text-white">{indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)}</span> of <span className="font-bold">{filteredUsers.length}</span>
                     </div>
                     <div className="flex items-center space-x-2">
                        <button
                           onClick={() => paginate(Math.max(1, currentPage - 1))}
                           disabled={currentPage === 1}
                           className="p-2 rounded-xl text-gray-500 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                        >
                           ←
                        </button>
                        <div className="flex gap-1">
                          {[...Array(totalPages)].map((_, i) => (
                             // Show limited page numbers on mobile
                             (deviceInfo.isDesktop || Math.abs(currentPage - (i + 1)) <= 1 || i === 0 || i === totalPages - 1) && (
                               <button
                                  key={i + 1}
                                  onClick={() => paginate(i + 1)}
                                  className={`w-8 h-8 rounded-xl text-sm font-bold transition-all ${
                                     currentPage === i + 1
                                     ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                     : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700"
                                  }`}
                               >
                                  {i + 1}
                               </button>
                             )
                          ))}
                        </div>
                        <button
                           onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                           disabled={currentPage === totalPages}
                           className="p-2 rounded-xl text-gray-500 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                        >
                           →
                        </button>
                     </div>
                  </div>
               )}
            </>
          )}
      </div>
    </div>
  );
};

export default UserManagementPage;
