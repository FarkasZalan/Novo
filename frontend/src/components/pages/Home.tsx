import { Link } from "react-router-dom";
import { TypeAnimation } from 'react-type-animation';
import {
    FaTasks,
    FaProjectDiagram,
    FaUserPlus,
    FaRocket,
    FaTags,
    FaCheck,
    FaFileAlt,
    FaHistory,
    FaUserShield,
    FaBell,
    FaCrown,
    FaEnvelope,
    FaUserFriends
} from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export const Home = () => {
    const [currentWord, setCurrentWord] = useState('');
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="relative z-10 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                            <span className="block mb-2">Manage Your Work with <span className="text-indigo-600">Novo</span></span>
                            <span className={currentWord === 'Collaborate.' ? 'text-indigo-600' : ''}>
                                <TypeAnimation
                                    sequence={[
                                        () => setCurrentWord('Organize.'),
                                        'Organize',
                                        4000,
                                        () => setCurrentWord('Collaborate.'),
                                        'Collaborate',
                                        4000,
                                        () => setCurrentWord('Achieve.'),
                                        'Achieve',
                                        4000
                                    ]}
                                    wrapper="span"
                                    speed={30}
                                    repeat={Infinity}
                                    style={{
                                        display: 'inline-block',
                                        opacity: 1,
                                        transition: 'opacity 0.5s ease-in-out'
                                    }}
                                />
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-200 max-w-3xl mx-auto mb-10">
                            Novo helps teams manage projects, track tasks, and collaborate effectively with role-based access control.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <FaRocket className="text-lg" />
                                        Go to Dashboard
                                    </Link>
                                    <Link
                                        to="/projects/new"
                                        className="px-8 py-3 border border-indigo-600 text-indigo-600 dark:text-indigo-300 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors shadow hover:shadow-md"
                                    >
                                        Create Project
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/register"
                                        className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <FaUserPlus className="text-lg" />
                                        Get Started For Free
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="px-8 py-3 border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow hover:shadow-md"
                                    >
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200 mb-4">
                            {isAuthenticated ? "Your Work Management Hub" : "Core Features"}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            {isAuthenticated
                                ? "Everything you need to organize and track your team's work"
                                : "Powerful features designed for effective team collaboration"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Projects Feature */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]">
                            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-500 rounded-lg flex items-center justify-center mb-6">
                                <FaProjectDiagram className="text-indigo-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                Project Management
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Organize work into projects with milestones and visual progress tracking.
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex items-center">
                                    <FaCheck className="mr-2 text-indigo-500" />
                                    Create unlimited projects
                                </li>
                                <li className="flex items-center">
                                    <FaCheck className="mr-2 text-indigo-500" />
                                    Set and track milestones
                                </li>
                            </ul>
                        </div>

                        {/* Task Board */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]">
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                                <FaTasks className="text-blue-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                Task Board
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Visual task management with drag-and-drop functionality and role-based access.
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex items-center">
                                    <FaCheck className="mr-2 text-blue-500" />
                                    Kanban-style boards
                                </li>
                                <li className="flex items-center">
                                    <FaCheck className="mr-2 text-blue-500" />
                                    Owner/Admin/Member roles
                                </li>
                            </ul>
                        </div>

                        {/* Team & Roles */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]">
                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                                <FaUserShield className="text-purple-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                Team & Roles
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Granular permission system with Owner, Admin, and Member roles.
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex items-center">
                                    <FaCheck className="mr-2 text-purple-500" />
                                    Free for up to 5 members
                                </li>
                                <li className="flex items-center">
                                    <FaCheck className="mr-2 text-purple-500" />
                                    Role-based access control
                                </li>
                            </ul>
                        </div>

                        {/* Activity Tracking */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]">
                            <div className="w-14 h-14 bg-teal-100 dark:bg-teal-600 rounded-lg flex items-center justify-center mb-6">
                                <FaHistory className="text-teal-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                Activity Tracking
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Complete audit trail of all changes across your projects.
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex items-center">
                                    <FaCheck className="mr-2 text-teal-500" />
                                    See who changed what
                                </li>
                                <li className="flex items-center">
                                    <FaCheck className="mr-2 text-teal-500" />
                                    Timestamped history
                                </li>
                            </ul>
                        </div>

                        {/* Labels & Categories */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]">
                            <div className="w-14 h-14 bg-green-100 dark:bg-green-600 rounded-lg flex items-center justify-center mb-6">
                                <FaTags className="text-green-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                Labels & Categories
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Organize tasks with customizable labels and filtering options.
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex items-center">
                                    <FaCheck className="mr-2 text-green-500" />
                                    Color-coded labels
                                </li>
                                <li className="flex items-center">
                                    <FaCheck className="mr-2 text-green-500" />
                                    Custom categories
                                </li>
                            </ul>
                        </div>

                        {/* File Management */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]">
                            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                                <FaFileAlt className="text-orange-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                File Management
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Attach and organize files directly with your projects and tasks.
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex items-center">
                                    <FaCheck className="mr-2 text-orange-500" />
                                    File attachments
                                </li>
                                <li className="flex items-center">
                                    <FaCheck className="mr-2 text-orange-500" />
                                    Document previews
                                </li>
                            </ul>
                        </div>

                        {/* Premium Feature 1 - Unlimited Members */}
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-8 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] border-2 border-yellow-200 dark:border-yellow-600">
                            <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-600 rounded-lg flex items-center justify-center mb-6">
                                <FaUserFriends className="text-yellow-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                Unlimited Team Members
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Remove the 5-member limit and collaborate with your entire team.
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex items-center">
                                    <FaCrown className="mr-2 text-yellow-500" />
                                    No restrictions on team size
                                </li>
                                <li className="flex items-center">
                                    <FaCrown className="mr-2 text-yellow-500" />
                                    Scale with your organization
                                </li>
                            </ul>
                        </div>

                        {/* Premium Feature 2 - Due Date Reminders */}
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-8 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] border-2 border-yellow-200 dark:border-yellow-600">
                            <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-600 rounded-lg flex items-center justify-center mb-6">
                                <FaBell className="text-yellow-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                Due Date Reminders
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Automatic email reminders for upcoming deadlines.
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex items-center">
                                    <FaCrown className="mr-2 text-yellow-500" />
                                    Tasks due today/tomorrow
                                </li>
                                <li className="flex items-center">
                                    <FaCrown className="mr-2 text-yellow-500" />
                                    Milestone reminders
                                </li>
                            </ul>
                        </div>

                        {/* Premium Feature 3 - Comment Notifications */}
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-8 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] border-2 border-yellow-200 dark:border-yellow-600">
                            <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-600 rounded-lg flex items-center justify-center mb-6">
                                <FaEnvelope className="text-yellow-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                Comment Notifications
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Stay updated with email alerts for new task comments.
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex items-center">
                                    <FaCrown className="mr-2 text-yellow-500" />
                                    Instant notifications
                                </li>
                                <li className="flex items-center">
                                    <FaCrown className="mr-2 text-yellow-500" />
                                    Only for assigned members
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-indigo-600 text-white dark:bg-indigo-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6 dark:text-indigo-200">
                        {isAuthenticated ? "Ready to collaborate with your team?" : "Ready to get started?"}
                    </h2>
                    <p className="text-lg text-indigo-100 dark:text-indigo-200 max-w-2xl mx-auto mb-8">
                        {isAuthenticated
                            ? "Leverage the full power of role-based task management for your team."
                            : "Join teams who are already managing their work more effectively."}
                    </p>
                    <Link
                        to={isAuthenticated ? "/new" : "/register"}
                        className="dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white inline-block px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
                    >
                        {isAuthenticated ? "Create New Project" : "Get Started for Free"}
                    </Link>
                </div>
            </section>
        </div>
    );
};