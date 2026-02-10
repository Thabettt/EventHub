import React, { useState } from 'react';

const PasswordChangeModal = ({ isOpen, onClose, onSubmit }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords({
      ...passwords,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
    
    // Clear API error when user makes changes
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate current password
    if (!passwords.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    // Validate new password
    if (!passwords.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    } else if (passwords.newPassword === passwords.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    // Password complexity check
    const hasUpperCase = /[A-Z]/.test(passwords.newPassword);
    const hasNumber = /\d/.test(passwords.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwords.newPassword);
    
    if (passwords.newPassword && !hasUpperCase) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (passwords.newPassword && !hasNumber) {
      newErrors.newPassword = 'Password must contain at least one number';
    } else if (passwords.newPassword && !hasSpecialChar) {
      newErrors.newPassword = 'Password must contain at least one special character';
    }
    
    // Validate confirm password
    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous API errors
    setApiError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await onSubmit(passwords.currentPassword, passwords.newPassword);
      onClose();
      // Reset form
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Modal error handling password change:', error);
      
      // Extract specific error type
      const errorMsg = error.message || 'An unexpected error occurred';
      
      // Set the API error to display at the top of the form
      setApiError(errorMsg);
      
      // Field-specific errors
      if (errorMsg.toLowerCase().includes('current password')) {
        setErrors({
          ...errors,
          currentPassword: 'Current password is incorrect'
        });
      } else if (errorMsg.toLowerCase().includes('requirements') || 
                 errorMsg.toLowerCase().includes('uppercase') ||
                 errorMsg.toLowerCase().includes('number') ||
                 errorMsg.toLowerCase().includes('special character')) {
        setErrors({
          ...errors,
          newPassword: errorMsg
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#15151a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-white">Change Password</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {apiError && (
          <div className="mx-6 mt-6 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
            <p className="text-sm text-red-200">{apiError}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="currentPassword" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Current Password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={handleChange}
              className={`w-full bg-black/20 text-white px-4 py-3 border ${errors.currentPassword ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'} rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-gray-600`}
              placeholder="••••••••"
            />
            {errors.currentPassword && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.currentPassword}</p>}
          </div>
          
          <div>
            <label htmlFor="newPassword" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={handleChange}
              className={`w-full bg-black/20 text-white px-4 py-3 border ${errors.newPassword ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'} rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-gray-600`}
              placeholder="••••••••"
            />
            {errors.newPassword && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.newPassword}</p>}
            <p className="mt-2 text-[10px] text-gray-500 leading-tight">
              Must be 6+ chars with uppercase, number & special char.
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={handleChange}
              className={`w-full bg-black/20 text-white px-4 py-3 border ${errors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'} rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-gray-600`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.confirmPassword}</p>}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-400 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:text-white focus:outline-none transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 text-sm font-bold text-white bg-indigo-600 border border-transparent rounded-xl shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeModal;