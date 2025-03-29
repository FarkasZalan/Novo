import { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

export const DarkModeToggle = () => {
    const [darkMode, setDarkMode] = useState<boolean | null>(null); // Start with null to delay render until theme is applied

    useEffect(() => {
        // Check if a theme is already saved in localStorage
        const savedTheme = localStorage.getItem('darkMode');

        // If there's no saved theme, fallback to system's preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let initialMode = false
        // If a saved theme exists, use it, otherwise use the system preference
        if (!savedTheme && !prefersDarkMode) {
            initialMode = false;
        } else if (!savedTheme && prefersDarkMode) {
            initialMode = true;
        } else if (savedTheme === 'true') {
            initialMode = true;
        }

        // Apply the theme to the document element immediately
        if (initialMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Set the state to ensure the button icon and aria-label are correct
        setDarkMode(initialMode);

        // Save preference to localStorage
        localStorage.setItem('darkMode', initialMode.toString());
    }, []);

    const toggleTheme = () => {
        const newMode = !darkMode!;
        setDarkMode(newMode);

        // Apply the new theme to the document element
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Save the new theme preference to localStorage
        localStorage.setItem('darkMode', newMode.toString());
    };

    if (darkMode === null) {
        return null; // Don't render anything until the theme is applied
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-indigo-600 hover:bg-gray-100 dark:text-indigo-200 dark:hover:bg-indigo-500 transition-colors focus:outline-none cursor-pointer"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
            {darkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
        </button>
    );
};
