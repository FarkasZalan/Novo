import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchOAuthState } from "../../../services/authService";
import { FaSpinner } from "react-icons/fa";
import { useAuth } from "../../../hooks/useAuth";

// Recive the OAuth state data from the backend and update the auth state and redirect to the home page
export const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuthState } = useAuth();

    useEffect(() => {
        const processOAuth = async () => {
            try {
                // Extract state token from the URL
                const stateToken = searchParams.get("state");

                if (!stateToken) {
                    throw new Error("Authentication failed - missing state token");
                }

                // Fetch the OAuth state data from the backend
                const response = await fetchOAuthState(stateToken);

                if (!response.data || !response.data.accessToken || !response.data.user) {
                    throw new Error("Authentication failed - invalid response data");
                }

                // Update the auth state with the data from the backend
                setAuthState({
                    user: response.data.user,
                    accessToken: response.data.accessToken
                });

                // Redirect to dashboard page on success
                setTimeout(() => {
                    navigate("/dashboard");
                    console.log("Redirecting to dashboard...");
                }, 100);
            } catch (err) {
                navigate("/login", { state: { error: "OAuth authentication failed" } });
            }
        };

        processOAuth();
    }, [searchParams, navigate, setAuthState]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Novo</h1>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Completing Authentication</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Please wait while we verify your credentials...
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                <FaSpinner className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                            </div>
                            <div className="absolute -inset-2 rounded-full border-2 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Almost there!
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                You'll be redirected automatically once verification is complete.
                            </p>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                                className="bg-indigo-600 dark:bg-indigo-400 h-2.5 rounded-full animate-pulse"
                                style={{ width: "75%" }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Having trouble?{" "}
                        <button
                            onClick={() => navigate("/login")}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                            Try again
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};