import { Link } from "react-router-dom";
import { useState } from "react";

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
            <div className="mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0">
                        <Link
                            to="/"
                            className="text-white text-3xl font-bold hover:text-indigo-200 transition-colors"
                        >
                            Novo
                        </Link>
                    </div>

                    {/* Desktop Navigation - Moved to the right */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/profile"
                            className="text-white hover:text-indigo-200 px-2 py-2 text-xl rounded-md text-sm font-medium transition-colors"
                        >
                            Profile
                        </Link>
                        <Link
                            to="/contact"
                            className="text-white hover:text-indigo-200 px-2 text-xl py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Contact
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-white hover:text-indigo-200 focus:outline-none"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-indigo-700">
                    <Link
                        to="/profile"
                        className="text-white hover:bg-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setIsOpen(false)}
                    >
                        Profile
                    </Link>
                    <Link
                        to="/contact"
                        className="text-white hover:bg-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setIsOpen(false)}
                    >
                        Contact
                    </Link>
                </div>
            </div>
        </nav>
    );
};