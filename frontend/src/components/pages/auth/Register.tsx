import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaGithub, FaInfoCircle } from "react-icons/fa";
import { initiateGithubLogin, initiateGoogleLogin, register } from "../../../services/authService";
import { fetchAllRegisteredUsers } from "../../../services/userService";

export const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [registeredSuccessfully, setRegisteredSuccessfully] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [isIOS, setIsIOS] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the device is iOS so don't let use oauth buttons
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod|macintosh/.test(userAgent);
        setIsIOS(isIOSDevice);
    }, []);

    const handleGoogleSignup = () => {
        if (!isIOS) {
            initiateGoogleLogin();
        }
    };

    const handleGithubSignup = () => {
        if (!isIOS) {
            initiateGithubLogin();
        }
    };

    const validateField = (name: string, value: string) => {
        let error = "";

        switch (name) {
            case "name":
                if (!value.trim()) error = "Name is required";
                else if (value.length < 2) error = "Name must be at least 2 characters";
                break;
            case "email":
                if (!value.trim()) error = "Email is required";
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
                break;
            case "password":
                if (!value.trim()) error = "Password is required";
                else if (value.length < 6) error = "Password must be at least 6 characters";
                break;
            case "confirmPassword":
                if (!value.trim()) error = "Please confirm your password";
                else if (value !== formData.password) error = "Passwords don't match";
                break;
        }

        return error;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validate the field
        const error = validateField(name, value);
        setFieldErrors(prev => ({
            ...prev,
            [name]: error
        }));

        if (error) setError("");
    };

    const validateForm = () => {
        let valid = true;
        const newFieldErrors = { ...fieldErrors };

        // Validate all fields
        for (const [name, value] of Object.entries(formData)) {
            const error = validateField(name, value);
            newFieldErrors[name as keyof typeof newFieldErrors] = error;
            if (error) valid = false;
        }

        setFieldErrors(newFieldErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setError("Please fix the errors in the form");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const registeredUsers = await fetchAllRegisteredUsers();
            if (registeredUsers.some((user: RegisteredUser) => user.email === formData.email)) {
                setError("Email already exists");
                return;
            }

            await register(
                formData.name,
                formData.email,
                formData.password
            );

            // Clear form and show success message
            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: ""
            });

            setRegisteredSuccessfully(true);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Registration failed";
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
                    {!registeredSuccessfully && (
                        <>
                            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                Already have an account?{" "}
                                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-md">
                        {error}
                    </div>
                )}

                {registeredSuccessfully ? (
                    <div className="mb-6 p-6 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-lg shadow-lg text-center">
                        <div className="flex justify-center mb-4">
                            <svg className="h-12 w-12 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Almost There!</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                            We've sent a verification link to the given email address.
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            Please check your email and click the link to verify your account.
                        </p>
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800/50 mb-4">
                            <p className="text-yellow-700 dark:text-yellow-300 text-sm flex items-center justify-center">
                                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                                </svg>
                                The verification link will expire in 5 minutes
                            </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                            <p className="text-blue-700 dark:text-blue-300 text-sm flex items-center justify-center">
                                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                                </svg>
                                Can't find it? Check your spam folder!
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/login", { state: { registeredEmail: formData.email } })}
                            className="mt-2 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            Take me to login
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-3 py-3 border ${fieldErrors.name ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"} rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                                        placeholder="John Carter"
                                    />
                                </div>
                                {fieldErrors.name && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {fieldErrors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                                        className={`block w-full pl-10 pr-3 py-3 border ${fieldErrors.email ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"} rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {fieldErrors.email && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {fieldErrors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-3 py-3 border ${fieldErrors.password ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"} rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {fieldErrors.password && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {fieldErrors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Confirm Password
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
                                        className={`block w-full pl-10 pr-3 py-3 border ${fieldErrors.confirmPassword ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"} rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {fieldErrors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {fieldErrors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                    I agree to the{" "}
                                    <Link to="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                        Privacy Policy
                                    </Link>
                                </label>
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
                                            Creating account...
                                        </span>
                                    ) : "Create Account"}
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
                                                We'd love to offer Google and GitHub sign up, but Apple devices sometimes
                                                make this tricky. No worries though! You can still create an account with
                                                your email or try from another device if you prefer social login.
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
                                        onClick={handleGoogleSignup}
                                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                                    >
                                        <FaGoogle className="h-5 w-5" />
                                        <span className="ml-2">Google</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleGithubSignup}
                                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                                    >
                                        <FaGithub className="h-5 w-5 text-gray-800 dark:text-gray-200" />
                                        <span className="ml-2">GitHub</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};