import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useDeviceDetection from "../../hooks/useDeviceDetection";
import Button from "../../components/common/Button";

const OrganizerSettingsPage = () => {
    const { currentUser } = useAuth();
    const deviceInfo = useDeviceDetection();
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300 relative p-6">
            <div className="max-w-7xl mx-auto">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            Settings
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">
                            Manage your organizer profile and preferences
                        </p>
                    </div>
                     <Link to="/organizer/dashboard">
                        <Button
                            variant="outline"
                        >
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-12 shadow-xl border border-gray-200/50 dark:border-gray-700/50 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-white text-4xl">⚙️</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                        Settings Coming Soon
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                        We are building a comprehensive settings panel to help you manage your organization details, viewing preferences, and notification settings.
                    </p>
                     <Button
                        to="/organizer/dashboard"
                        variant="primary"
                        size="lg"
                    >
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrganizerSettingsPage;
