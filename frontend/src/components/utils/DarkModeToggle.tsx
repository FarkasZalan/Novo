import { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

export const DarkModeToggle = () => {
    const [darkMode, setDarkMode] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if a theme is already saved in localStorage
        const savedTheme = localStorage.getItem('darkMode');
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let initialMode = false;

        if (!savedTheme && !prefersDarkMode) {
            initialMode = false;
        } else if (!savedTheme && prefersDarkMode) {
            initialMode = true;
        } else if (savedTheme === 'true') {
            initialMode = true;
        }

        // Apply theme to document and meta tag
        applyTheme(initialMode);
        setDarkMode(initialMode);
        localStorage.setItem('darkMode', initialMode.toString());
    }, []);

    const applyTheme = (isDark: boolean) => {
        // Apply to HTML class
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Update theme-color meta tag
        const themeColor = isDark ? '#111827' : '#ffffff'; // Match your navbar colors
        let metaThemeColor = document.querySelector("meta[name=theme-color]");

        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.setAttribute('name', 'theme-color');
            document.head.appendChild(metaThemeColor);
        }

        metaThemeColor.setAttribute('content', themeColor);

        // For iOS
        let appleMeta = document.querySelector("meta[name=apple-mobile-web-app-status-bar-style]");
        if (!appleMeta) {
            appleMeta = document.createElement('meta');
            appleMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
            document.head.appendChild(appleMeta);
        }
        appleMeta.setAttribute('content', isDark ? 'black' : 'default');
    };

    const toggleTheme = () => {
        const newMode = !darkMode!;
        setDarkMode(newMode);
        applyTheme(newMode);
        localStorage.setItem('darkMode', newMode.toString());
    };

    if (darkMode === null) {
        return null;
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