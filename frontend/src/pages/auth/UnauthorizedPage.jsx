import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-16 transition-colors">
      <div className="max-w-md w-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-8 rounded-lg shadow-sm dark:shadow-gray-900/20 text-center">
        <div className="text-yellow-500 dark:text-yellow-400 text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;