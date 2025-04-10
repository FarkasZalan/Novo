import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { requestPasswordReset } from "../../../services/authService";

export const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");
            setSuccess(false);

            const response = await requestPasswordReset(email);

            // Check if the response indicates the user is an OAuth user
            if (response.data?.message?.includes("linked to")) {
                setError(response.data.message);
                return;
            }

            setSuccess(true);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Password reset request failed";
            console.error(err);
            setError(errorMessage);
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
                    <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                        {success ? "Check your email" : "Forgot your password?"}
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {success ? (
                            "We've sent a password reset link to your email"
                        ) : (
                            "Enter your email to reset your password"
                        )}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex flex-col items-center text-center">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="ml-2 text-md font-medium text-green-700 dark:text-green-300">
                                    Password reset email sent successfully!
                                </p>
                            </div>
                            <p className="mt-2 text-xm text-green-600 dark:text-green-400">
                                This password reset link will expire in 5 minutes.
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
                    {!success ? (
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="you@example.com"
                                    />
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
                                            Sending...
                                        </span>
                                    ) : "Send Reset Link"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center">
                            <div className="mb-6 text-gray-500 dark:text-gray-400">
                                Didn't receive the email? Check your spam folder or
                                <button
                                    onClick={handleSubmit}
                                    className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                    disabled={loading}
                                >
                                    {loading ? "Resending..." : "click to resend"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate(-1)}
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