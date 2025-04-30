import React from 'react';
import OrganizerSidebar from '../../components/layout/OrganizerSidebar';
const AnalyticsPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <OrganizerSidebar />
      <div className="flex-grow p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Events Management</h1>
        <p>Events list page content will go here.</p>
      </div>
    </div>
  );
};

export default AnalyticsPage;