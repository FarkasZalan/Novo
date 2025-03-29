import { FaLinkedin, FaGithub, FaEnvelope, FaGlobe } from "react-icons/fa";

export const Contact = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 p-6">
            <div className="max-w-lg w-full bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Feel free to reach out through any of the platforms below:</p>

                <div className="flex flex-col gap-4">
                    <a href="https://www.linkedin.com/in/zalanfarkas/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 text-lg text-gray-900 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        <FaLinkedin className="text-2xl" /> LinkedIn
                    </a>

                    <a href="https://github.com/FarkasZalan" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 text-lg text-gray-900 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        <FaGithub className="text-2xl" /> GitHub
                    </a>

                    <a href="mailto:farkaszalan2001@gmail.com" className="flex items-center justify-center gap-3 text-lg text-gray-900 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        <FaEnvelope className="text-2xl" /> Email Me
                    </a>

                    <a href="https://www.zalan-farkas.xyz/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 text-lg text-gray-900 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        <FaGlobe className="text-2xl" /> Visit My Website
                    </a>
                </div>
            </div>
        </div>
    );
};
