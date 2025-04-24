import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheck, FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { verifyEmail as apiVerifyEmail, resendVerificationEmail } from "../../../services/authService";

export const VerifyEmail = () => {
    const location = useLocation();
    const hasVerified = useRef(false);
    const navigate = useNavigate();
    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const tokenParam = query.get("token");

        if (tokenParam && !hasVerified.current) {
            hasVerified.current = true;
            setToken(tokenParam);
            handleVerify(tokenParam);
        }
    }, [location]);

    const handleVerify = async (token: string) => {
        try {
            setLoading(true);
            setError("");
            setSuccess(false);

            await apiVerifyEmail(token);

            setSuccess(true);

            // remove token from URL so effect won’t re-fire
            navigate(window.location.pathname, { replace: true });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Email verification failed";
            console.error(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setError("Email is required");
            return;
        }

        try {
            setResendLoading(true);
            setError("");
            setResendSuccess(false);

            await resendVerificationEmail(email);

            setResendSuccess(true);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to resend verification email";
            console.error(err);
            setError(errorMessage);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Novo</h1>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                        {success ? "Email Verified" : "Verify Your Email"}
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {success ? (
                            "Your email has been verified successfully!"
                        ) : (
                            "Check your email for a verification link"
                        )}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-3 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-sm flex items-center">
                        <FaCheck className="mr-2" />
                        Email verified successfully! You can now log in.
                    </div>
                )}

                {resendSuccess && (
                    <div className="mb-6 p-3 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-sm flex items-center">
                        <FaCheck className="mr-2" />
                        Verification email resent successfully!
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
                    {!success ? (
                        <div className="space-y-6">
                            {!token && (
                                <>
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
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            onClick={handleResend}
                                            disabled={resendLoading}
                                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${resendLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
                                                }`}
                                        >
                                            {resendLoading ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Resending...
                                                </span>
                                            ) : "Resend Verification Email"}
                                        </button>
                                    </div>
                                </>
                            )}

                            {token && loading && (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying your email...
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="mb-6">
                                <button
                                    onClick={() => navigate("/login")}
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                                >
                                    Go to Login
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate("/login")}
                            className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                            <FaArrowLeft className="mr-1" />
                            Back to login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};