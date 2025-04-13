import { Link } from "react-router-dom";
import { useState } from "react";
import { FaUser, FaEnvelope, FaSignInAlt, FaPlus } from "react-icons/fa";
import { DarkModeToggle } from "../utils/DarkModeToggle";
import { useAuth } from "../../context/AuthContext";

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { authState } = useAuth();
    const isAuthenticated = authState.accessToken !== null && authState.user !== null;

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-all duration-300">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="flex items-center text-gray-900 dark:text-white text-2xl font-bold hover:scale-105 transform transition-transform"
                            >
                                <span className="text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-7 h-7"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polygon points="5 3, 19 3, 12 21" />
                                    </svg>
                                </span>
                                <span className="ml-2 hidden sm:inline uppercase tracking-wide">Novo</span>
                            </Link>
                        ) : <Link
                            to="/"
                            className="flex items-center text-gray-900 dark:text-white text-2xl font-bold hover:scale-105 transform transition-transform"
                        >
                            <span className="text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-7 h-7"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polygon points="5 3, 19 3, 12 21" />
                                </svg>
                            </span>
                            <span className="ml-2 hidden sm:inline uppercase tracking-wide">Novo</span>
                        </Link>}
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/new"
                                    className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <FaPlus className="text-indigo-600 dark:text-indigo-200" />
                                    New
                                </Link>
                                <Link
                                    to="/profile"
                                    className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <FaUser className="text-indigo-600 dark:text-indigo-200" />
                                    Profile
                                </Link>
                            </>
                        ) : (
                            <Link
                                to="/contact"
                                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <FaEnvelope className="text-indigo-600 dark:text-indigo-200" />
                                Contact
                            </Link>
                        )}

                        {/* Dark Mode Toggle */}
                        <DarkModeToggle />

                        {!isAuthenticated && (
                            <Link
                                to="/register"
                                className="ml-2 bg-indigo-600 text-white dark:bg-indigo-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors shadow hover:shadow-md flex items-center gap-1"
                            >
                                <FaSignInAlt className="mr-1" />
                                Get Started
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center">
                        <DarkModeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 dark:text-white hover:text-indigo-200 hover:bg-indigo-600 transition-colors"
                        >
                            <span className="sr-only">Open menu</span>
                            {isOpen ? (
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
                <div className="pt-2 pb-3 space-y-1 px-2 bg-indigo-700 dark:bg-[#1E1B47] shadow-lg">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/new"
                                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <FaPlus className="text-indigo-600 dark:text-indigo-200" />
                                New
                            </Link>
                            <Link
                                to="/profile"
                                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-100 dark:hover:bg-indigo-500 flex items-center gap-3"
                                onClick={() => setIsOpen(false)}
                            >
                                <FaUser />
                                Profile
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/contact"
                                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-100 dark:hover:bg-indigo-500 flex items-center gap-3"
                                onClick={() => setIsOpen(false)}
                            >
                                <FaEnvelope />
                                Contact
                            </Link>
                            <Link
                                to="/register"
                                className="block px-3 py-2 rounded-md text-base font-medium bg-white text-indigo-700 dark:bg-indigo-900 dark:text-white hover:bg-gray-100 dark:hover:bg-indigo-700 mt-2 text-center flex items-center justify-center gap-2"
                                onClick={() => setIsOpen(false)}
                            >
                                <FaSignInAlt />
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};
