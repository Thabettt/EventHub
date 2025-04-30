import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  const { currentUser, token, login, logout, register, loading, error } = context;
  
  return {
    currentUser,
    token, // Added token to the returned values
    login,
    logout,
    register,
    loading,
    error
  };
};

export default useAuth;