import { Link } from "react-router-dom";
import { TypeAnimation } from 'react-type-animation';
import {
    FaTasks,
    FaProjectDiagram,
    FaUsers,
    FaUserPlus,
    FaRocket,
    FaTags,
    FaComments,
    FaChartLine
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
                            Novo helps teams manage projects, track tasks, and collaborate effectively - all in one powerful platform.
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

            {/* Features Section - Enhanced for logged-in users */}
            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200 mb-4">
                            {isAuthenticated ? "Your Work Management Hub" : "Powerful Project Management"}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            {isAuthenticated
                                ? "Everything you need to organize and track your team's work"
                                : "Complete solution for managing projects, tasks, and team collaboration"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl hover:shadow-lg transition-shadow hover:transform hover:-translate-y-1">
                            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-500 rounded-lg flex items-center justify-center mb-6">
                                <FaProjectDiagram className="text-indigo-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                {isAuthenticated ? "Your Projects" : "Projects & Milestones"}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                {isAuthenticated
                                    ? "Organize work into projects with milestones and track progress"
                                    : "Create projects with milestones to structure your work and track progress"}
                            </p>
                            {isAuthenticated && (
                                <Link
                                    to="/projects"
                                    className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                                >
                                    View Projects →
                                </Link>
                            )}
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl hover:shadow-lg transition-shadow hover:transform hover:-translate-y-1">
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                                <FaTasks className="text-blue-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                {isAuthenticated ? "Task Management" : "Advanced Tasks"}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                {isAuthenticated
                                    ? "Create, assign, and track tasks and subtasks with labels, due dates, and comments"
                                    : "Detailed task system with assignments, labels, due dates, and discussions"}
                            </p>
                            {isAuthenticated && (
                                <Link
                                    to="/tasks"
                                    className="mt-4 inline-block text-blue-600 dark:text-blue-400 font-medium hover:underline"
                                >
                                    View Tasks →
                                </Link>
                            )}
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl hover:shadow-lg transition-shadow hover:transform hover:-translate-y-1">
                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                                <FaUsers className="text-purple-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                {isAuthenticated ? "Team Collaboration" : "Team Features"}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                {isAuthenticated
                                    ? "Invite team members (free up to 5) and collaborate in real-time"
                                    : "Free plan includes 5 team members per project, with premium for unlimited"}
                            </p>
                            {isAuthenticated && (
                                <Link
                                    to="/team"
                                    className="mt-4 inline-block text-purple-600 dark:text-purple-400 font-medium hover:underline"
                                >
                                    Manage Team →
                                </Link>
                            )}
                        </div>

                        {/* Additional feature boxes */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl hover:shadow-lg transition-shadow hover:transform hover:-translate-y-1">
                            <div className="w-14 h-14 bg-green-100 dark:bg-green-600 rounded-lg flex items-center justify-center mb-6">
                                <FaTags className="text-green-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                Labels & Categorization
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Organize tasks with customizable labels and categories for better workflow management.
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl hover:shadow-lg transition-shadow hover:transform hover:-translate-y-1">
                            <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-600 rounded-lg flex items-center justify-center mb-6">
                                <FaComments className="text-yellow-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                Task Discussions
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Comment directly on tasks to discuss details, share updates, and resolve issues.
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl hover:shadow-lg transition-shadow hover:transform hover:-translate-y-1">
                            <div className="w-14 h-14 bg-red-100 dark:bg-red-600 rounded-lg flex items-center justify-center mb-6">
                                <FaChartLine className="text-red-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                Premium Benefits
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Upgrade for unlimited team members, custom project branding, and priority support.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Different for logged-in users */}
            <section className="py-16 bg-indigo-600 text-white dark:bg-indigo-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6 dark:text-indigo-200">
                        {isAuthenticated ? "Ready to collaborate with your team?" : "Ready to streamline your workflow?"}
                    </h2>
                    <p className="text-lg text-indigo-100 dark:text-indigo-200 max-w-2xl mx-auto mb-8">
                        {isAuthenticated
                            ? "Manage your projects efficiently with your team members."
                            : "Join teams who are already managing their work more effectively with Novo."}
                    </p>
                    <Link
                        to={isAuthenticated ? "/projects/new" : "/register"}
                        className="dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white inline-block px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
                    >
                        {isAuthenticated ? "Create New Project" : "Get Started for Free"}
                    </Link>
                    {!isAuthenticated && (
                        <p className="mt-4 text-indigo-200 dark:text-indigo-300">
                            Free plan includes up to 5 team members per project
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
};