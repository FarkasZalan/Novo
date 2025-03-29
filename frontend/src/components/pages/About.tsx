import { Link } from "react-router-dom";
import { FaLaptopCode, FaGraduationCap, FaTasks, FaLightbulb } from "react-icons/fa";

export const About = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <Link to="/" className="inline-block">
                        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Nova</h1>
                    </Link>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">About Nova Task Manager</h2>
                    <p className="mt-4 text-lg text-indigo-600 dark:text-indigo-400 font-medium">
                        Organize. Collaborate. Achieve.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-6 mx-auto">
                            <FaTasks className="text-indigo-600 dark:text-indigo-300 text-2xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-4">About Nova</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Nova is a sleek, intuitive task manager born from my passion for building tools that make life more organized.
                            Designed to help individuals and small teams stay on top of their projects, Nova combines simplicity with powerful
                            features to transform how you manage your work.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 mt-4">
                            What makes Nova special is its clean interface and focus on what matters most - getting things done without
                            unnecessary complexity. It's the task manager I always wanted for my own projects, now shared with you.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-6 mx-auto">
                            <FaLaptopCode className="text-indigo-600 dark:text-indigo-300 text-2xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-4">About Me</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Hello! I'm Zalán Farkas a passionate software developer who recently graduated with a Computer Science BSc from SZTE
                            in January 2025. I build projects like Nova to sharpen my skills and create tools I find useful in my own life.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 mt-4">
                            When I'm not coding, you'll find me exploring new technologies, contributing to open source projects, or
                            brainstorming my next creation. Nova represents my journey from student to developer - a project built with
                            both textbook knowledge and real-world curiosity.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 mb-16">
                    <h3 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-8">Why I Built Nova</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4 mx-auto">
                                <FaGraduationCap className="text-indigo-600 dark:text-indigo-300 text-xl" />
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Learning Platform</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Nova was my canvas to apply academic knowledge to a real-world application, blending theory with practice.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4 mx-auto">
                                <FaLightbulb className="text-indigo-600 dark:text-indigo-300 text-xl" />
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Problem Solving</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                I wanted a task manager that worked exactly how I think - simple yet powerful, without feature bloat.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4 mx-auto">
                                <FaTasks className="text-indigo-600 dark:text-indigo-300 text-xl" />
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Personal Need</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Every developer needs good tools. I built what I needed, then realized others might find it useful too.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">The Future of Nova</h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
                        Nova is constantly evolving. As I grow as a developer, so will Nova - with new features, better performance,
                        and an even smoother experience. This is just the beginning of the journey!
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Try Nova Today
                    </Link>
                </div>
            </div>
        </div>
    );
};