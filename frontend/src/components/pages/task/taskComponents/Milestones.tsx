import React from 'react';
import { FaFlag, FaRocket } from 'react-icons/fa';

export const Milestones: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-700/50 p-8 text-center transition-all duration-200 hover:shadow-xl">
        <div className="inline-flex justify-center items-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/10 rounded-full mb-6">
            <FaFlag className="text-3xl text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Milestones Coming Soon</h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
            Track important project milestones to measure your progress with beautiful visual indicators and automated progress tracking.
        </p>
        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center mx-auto">
            <FaRocket className="mr-2" /> Notify Me
        </button>
    </div>
);