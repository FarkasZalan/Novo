import { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

export const DarkModeToggle = () => {
    const [darkMode, setDarkMode] = useState<boolean | null>(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('darkMode');
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let initialMode = savedTheme === null ? prefersDarkMode : savedTheme === 'true';

        applyTheme(initialMode);
        setDarkMode(initialMode);
        localStorage.setItem('darkMode', initialMode.toString());
    }, []);

    const applyTheme = (isDark: boolean) => {
        const html = document.documentElement;

        if (isDark) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }

        // Update theme-color for Android Chrome and similar
        const metaThemeColor = document.querySelector("meta[name=theme-color]");
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', isDark ? '#111827' : '#ffffff');
        }

        // Update iOS Safari status bar
        const appleStatusBar = document.querySelector("meta[name=apple-mobile-web-app-status-bar-style]");
        if (appleStatusBar) {
            appleStatusBar.setAttribute('content', isDark ? 'black' : 'default');
        }
    };

    const toggleTheme = () => {
        const newMode = !darkMode!;
        setDarkMode(newMode);
        applyTheme(newMode);
        localStorage.setItem('darkMode', newMode.toString());
    };

    if (darkMode === null) return null;

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
