import { Link } from "react-router-dom";

export const Footer = () => {
    return (
        <footer className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 py-12 transition-colors duration-300">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <Link to="/" className="text-gray-800 dark:text-white text-2xl font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            Novo
                        </Link>
                        <p className="mt-2 text-sm">The modern task management solution</p>
                    </div>
                    <div className="flex space-x-6">
                        <Link
                            to="/about"
                            className="hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            to="/contact"
                            className="hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Contact
                        </Link>
                        <Link
                            to="/privacy"
                            className="hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            to="/terms"
                            className="hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Terms
                        </Link>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-sm text-center">
                    © {new Date().getFullYear()} Novo Task Manager. All rights reserved.
                </div>
            </div>
        </footer>
    )
}