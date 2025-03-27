import { Link } from "react-router-dom";
import { useState } from "react";
import { FaUser, FaEnvelope, FaPlus, FaTasks } from "react-icons/fa";

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-indigo-700 shadow-lg sticky top-0 z-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand - More distinctive */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link
                            to="/"
                            className="text-white text-2xl font-bold hover:text-indigo-200 transition-colors flex items-center"
                        >
                            <span className="bg-white text-indigo-700 rounded-lg px-2 py-1 mr-2 flex items-center justify-center">
                                <FaTasks className="mr-1" />
                            </span>
                            <span className="hidden sm:inline">Novo</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            to="/projects"
                            className="text-white hover:bg-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <FaPlus className="text-indigo-200" />
                            New Project
                        </Link>
                        <Link
                            to="/profile"
                            className="text-white hover:bg-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <FaUser className="text-indigo-200" />
                            Profile
                        </Link>
                        <Link
                            to="/contact"
                            className="text-white hover:bg-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <FaEnvelope className="text-indigo-200" />
                            Contact
                        </Link>
                        <Link
                            to="/register"
                            className="ml-2 bg-white text-indigo-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors shadow hover:shadow-md flex items-center gap-1"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-indigo-200 hover:bg-indigo-600 focus:outline-none transition-colors"
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
                <div className="pt-2 pb-3 space-y-1 px-2 bg-indigo-800 shadow-lg">
                    <Link
                        to="/projects"
                        className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-700 transition-colors flex items-center gap-3"
                        onClick={() => setIsOpen(false)}
                    >
                        <FaPlus />
                        New Project
                    </Link>
                    <Link
                        to="/profile"
                        className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-700 transition-colors flex items-center gap-3"
                        onClick={() => setIsOpen(false)}
                    >
                        <FaUser />
                        Profile
                    </Link>
                    <Link
                        to="/contact"
                        className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-700 transition-colors flex items-center gap-3"
                        onClick={() => setIsOpen(false)}
                    >
                        <FaEnvelope />
                        Contact
                    </Link>
                    <Link
                        to="/register"
                        className="block px-3 py-2 rounded-md text-base font-medium bg-white text-indigo-700 hover:bg-gray-100 transition-colors mt-2 text-center flex items-center justify-center gap-2"
                        onClick={() => setIsOpen(false)}
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
};