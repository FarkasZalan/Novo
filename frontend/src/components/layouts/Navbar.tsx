import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { FaUser, FaEnvelope, FaSignInAlt, FaPlus, FaHome } from "react-icons/fa";
import { DarkModeToggle } from "../utils/DarkModeToggle";
import { useAuth } from "../../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { authState } = useAuth();
    const location = useLocation();
    const isAuthenticated = authState.accessToken !== null && authState.user !== null;

    // Define routes where we want to show Dashboard instead of New
    const showDashboardRoutes = ['/home', '/privacy', '/about', '/contact', '/terms'];
    const shouldShowDashboard = showDashboardRoutes.includes(location.pathname);

    // Animation variants
    const mobileMenuVariants = {
        hidden: {
            opacity: 0,
            y: -50,
            transition: {
                duration: 0.2,
                ease: "easeInOut"
            }
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.2,
                ease: "easeInOut",
                staggerChildren: 0.05,
                when: "beforeChildren"
            }
        }
    };

    // Menu items now animate from top instead of left
    const menuItemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="flex items-center text-gray-900 dark:text-white text-2xl font-bold hover:scale-105 transform transition-transform duration-200"
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
                            className="flex items-center text-gray-900 dark:text-white text-2xl font-bold hover:scale-105 transform transition-transform duration-200"
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
                                {shouldShowDashboard ? (
                                    <Link
                                        to="/dashboard"
                                        className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <FaHome className="text-indigo-600 dark:text-indigo-200" />
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        to="/new"
                                        className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <FaPlus className="text-indigo-600 dark:text-indigo-200" />
                                        New
                                    </Link>
                                )}
                                <Link
                                    to="/profile"
                                    className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                                >
                                    <FaUser className="text-indigo-600 dark:text-indigo-200" />
                                    Profile
                                </Link>
                            </>
                        ) : (
                            <Link
                                to="/contact"
                                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
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
                                className="ml-2 bg-indigo-600 text-white dark:bg-indigo-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors duration-200 shadow hover:shadow-md flex items-center gap-1"
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
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 dark:text-white hover:text-indigo-200 hover:bg-indigo-600 transition-colors duration-200"
                            aria-expanded={isOpen}
                        >
                            <span className="sr-only">Open menu</span>
                            {isOpen ? (
                                <motion.svg
                                    className="h-8 w-8"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: 180 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </motion.svg>
                            ) : (
                                <motion.svg
                                    className="h-8 w-8"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    initial={{ rotate: 180 }}
                                    animate={{ rotate: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </motion.svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="md:hidden absolute w-full left-0 bg-indigo-700 dark:bg-[#1E1B47] shadow-lg"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={mobileMenuVariants}
                        style={{
                            top: '4rem', // Height of your navbar (h-16 = 4rem)
                            zIndex: 40 // Just below the navbar z-index
                        }}
                    >
                        <div className="pt-2 pb-3 space-y-1 px-2">
                            {isAuthenticated ? (
                                <>
                                    {shouldShowDashboard ? (
                                        <motion.div variants={menuItemVariants}>
                                            <Link
                                                to="/dashboard"
                                                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-100 dark:hover:bg-indigo-500 flex items-center gap-3 transition-colors duration-200"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <FaHome />
                                                Dashboard
                                            </Link>
                                        </motion.div>
                                    ) : (
                                        <motion.div variants={menuItemVariants}>
                                            <Link
                                                to="/new"
                                                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-100 dark:hover:bg-indigo-500 flex items-center gap-3 transition-colors duration-200"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <FaPlus />
                                                New
                                            </Link>
                                        </motion.div>
                                    )}
                                    <motion.div variants={menuItemVariants}>
                                        <Link
                                            to="/profile"
                                            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-100 dark:hover:bg-indigo-500 flex items-center gap-3 transition-colors duration-200"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <FaUser />
                                            Profile
                                        </Link>
                                    </motion.div>
                                </>
                            ) : (
                                <>
                                    <motion.div variants={menuItemVariants}>
                                        <Link
                                            to="/contact"
                                            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-100 dark:hover:bg-indigo-500 flex items-center gap-3 transition-colors duration-200"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <FaEnvelope />
                                            Contact
                                        </Link>
                                    </motion.div>
                                    <motion.div variants={menuItemVariants}>
                                        <Link
                                            to="/register"
                                            className="block px-3 py-2 rounded-md text-base font-medium bg-white text-indigo-700 dark:bg-indigo-900 dark:text-white hover:bg-gray-100 dark:hover:bg-indigo-700 mt-2 text-center flex items-center justify-center gap-2 transition-colors duration-200"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <FaSignInAlt />
                                            Get Started
                                        </Link>
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};