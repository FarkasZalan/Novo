import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Use setTimeout to ensure it runs after the DOM update
        const timer = setTimeout(() => {
            window.scrollTo({
                top: 0
            });
        }, 0);

        return () => clearTimeout(timer);
    }, [pathname]);

    return null;
};