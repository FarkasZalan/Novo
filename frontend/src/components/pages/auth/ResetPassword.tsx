import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaLock, FaCheck, FaArrowLeft, FaEnvelope } from "react-icons/fa";
import { resetPassword, verifyResetPasswordToken } from "../../../services/authService";

export const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isOAuthUser, setIsOAuthUser] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);

    useEffect(() => {
        // Check if token exists
        if (!token) {
            setError("Invalid or missing reset token");
            return;
        }

        // Verify the token and get the email
        const verifyToken = async () => {
            try {
                setLoading(true);
                const response = await verifyResetPasswordToken(token);

                if (response.data?.email) {
                    setFormData(prev => ({
                        ...prev,
                        email: response.data.email
                    }));
                    setEmailVerified(true);
                }
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || "Token verification failed";
                console.error(err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!token) {
            setError("Invalid or missing reset token");
            return;
        }

        if (!emailVerified) {
            setError("Please verify your email first");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (formData.newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess(false);

            const response = await resetPassword(formData.email, token, formData.newPassword);

            // Check if the user is an OAuth user
            if (response.data?.message?.includes("linked to")) {
                setIsOAuthUser(true);
                setError(response.data.message);
                return;
            }

            setSuccess(true);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Password reset failed";
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
                        {success ? "Password Reset Successful" : "Reset Your Password"}
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {success ? (
                            "Your password has been reset successfully"
                        ) : (
                            "Enter your new password"
                        )}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-md">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-3 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-md flex items-center">
                        <FaCheck className="mr-2" />
                        Password reset successful! You can now log in with your new password.
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
                    {!success && !isOAuthUser ? (
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
                                        disabled={true}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 opacity-70 cursor-not-allowed"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="newPassword"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="••••••••"
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
                                            Resetting...
                                        </span>
                                    ) : "Reset Password"}
                                </button>
                            </div>
                        </form>
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