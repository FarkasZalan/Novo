import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaGoogle, FaGithub, FaInfoCircle } from "react-icons/fa";
import { initiateGithubLogin, initiateGoogleLogin, login, resendVerificationEmail } from "../../../services/authService";
import { useAuth } from "../../../hooks/useAuth";

export const Login = () => {
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState("");
    const navigate = useNavigate();
    const { setAuthState } = useAuth();
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if the device is iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod|macintosh/.test(userAgent);
        setIsIOS(isIOSDevice);
    }, []);

    const handleGoogleLogin = () => {
        if (!isIOS) {
            initiateGoogleLogin();
        }
    };

    const handleGithubLogin = () => {
        if (!isIOS) {
            initiateGithubLogin();
        }
    };

    useEffect(() => {
        if (location.state?.registeredEmail) {
            setFormData(prev => ({
                ...prev,
                email: location.state.registeredEmail
            }));
        }
    }, [location.state]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleResendVerification = async () => {
        try {
            setResendLoading(true);

            if (!formData.email) {
                setError("Please enter your email address first");
                setResendLoading(false);
                return;
            }

            await resendVerificationEmail(formData.email);
            setError(""); // Clear error after successful resend
            setResendSuccess("Verification email resent. Please check your inbox.");
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to resend verification email";
            setError(errorMessage);
            setResendSuccess("");
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");
            setResendSuccess("");

            const { data } = await login(
                formData.email,
                formData.password
            );

            setAuthState({
                user: data.user,
                accessToken: data.accessToken
            });

            setTimeout(() => {
                navigate("/dashboard");
            }, 100);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Login failed";
            console.error(err);
            setError(
                errorMessage.includes("Invalid email")
                    ? "Invalid email or password"
                    : errorMessage.includes("Invalid password")
                        ? "Invalid email or password"
                        : errorMessage
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Novo</h1>
                    </Link>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex flex-col items-center text-center">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="ml-2 text-md font-medium text-red-700 dark:text-red-300">
                                    {error}
                                </p>
                            </div>

                            {error.includes("verify your email") && (
                                <div className="mt-4 w-full flex justify-center">
                                    <button
                                        onClick={handleResendVerification}
                                        disabled={resendLoading}
                                        className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 cursor-pointer ${resendLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                                    >
                                        {resendLoading ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending...
                                            </>
                                        ) : (
                                            "Resend Verification Email"
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {resendSuccess && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex flex-col items-center text-center">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="ml-2 text-md font-medium text-green-700 dark:text-green-300">
                                    {resendSuccess}
                                </p>
                            </div>
                            <p className="mt-2 text-xm text-green-600 dark:text-green-400">
                                This verification email will expire in 5 minutes.
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex items-center justify-end mt-2">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : "Sign in"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        {isIOS ? (
                            <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                                <div className="flex items-start">
                                    <FaInfoCircle className="mt-1 mr-3 flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
                                    <div>
                                        <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                                            Heads up, Apple user!
                                        </h4>
                                        <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">
                                            We'd love to offer Google and GitHub login, but Apple devices sometimes
                                            make this tricky. No worries though! You can still sign in with your
                                            email or try from another device if you prefer social login.
                                        </p>
                                        <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                                            We're working on making this smoother for you in the future!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                                >
                                    <FaGoogle className="h-5 w-5" />
                                    <span className="ml-2">Google</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleGithubLogin}
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                                >
                                    <FaGithub className="h-5 w-5 text-gray-800 dark:text-gray-200" />
                                    <span className="ml-2">GitHub</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};