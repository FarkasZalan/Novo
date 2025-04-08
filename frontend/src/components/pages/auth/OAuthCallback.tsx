import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuthState } = useAuth();

    useEffect(() => {
        const processOAuth = async () => {
            try {
                // Extract all user data from the URL
                const token = searchParams.get("token");
                const userId = searchParams.get("userId");
                const email = searchParams.get("email");
                const name = searchParams.get("name");
                const isPremium = searchParams.get("isPremium") === 'true';
                const createdAt = searchParams.get("createdAt");
                const provider = searchParams.get("provider");

                if (!token || !userId || !email) {
                    throw new Error("Authentication failed - missing credentials");
                }

                // Update the auth state with complete user data
                setAuthState({
                    user: {
                        id: userId,
                        email: email,
                        name: name || 'User',
                        is_premium: isPremium,
                        provider: provider,
                        created_at: createdAt || new Date().toISOString()
                    },
                    accessToken: token
                });

                // Redirect to home page on success
                navigate("/");
            } catch (err) {
                console.error("OAuth callback error:", err);
                navigate("/login", { state: { error: "OAuth authentication failed" } });
            }
        };

        processOAuth();
    }, [searchParams, navigate, setAuthState]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Authenticating...
                    </h1>
                    <div className="mt-4 flex justify-center">
                        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};