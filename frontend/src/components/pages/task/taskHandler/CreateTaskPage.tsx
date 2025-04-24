import React from 'react';
import { TaskForm } from './TaskForm';

export const CreateTaskPage: React.FC = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200  py-8 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
            <TaskForm isEdit={false} />
        </div>
    </div>
);