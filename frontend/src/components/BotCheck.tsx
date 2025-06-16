import React, { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

interface BotCheckProps {
    siteKey: string;
    onVerified: () => void;
}

export const BotCheck: React.FC<BotCheckProps> = ({ siteKey, onVerified }) => {
    const [loading, setLoading] = useState(false);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const handleChange = async (token: string | null) => {
        if (!token) return;
        setLoading(true);

        try {
            // Small delay for UX
            await new Promise((resolve) => setTimeout(resolve, 800));
            onVerified();
        } catch (err) {
            recaptchaRef.current?.reset();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center transform transition-all duration-300 hover:shadow-2xl">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        Security Check
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Please verify you're human to continue
                    </p>
                </div>

                {/* The reCAPTCHA widget itself */}
                <div className="flex justify-center mb-6">
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={siteKey}
                        onChange={handleChange}
                    />
                </div>

                {/* Loading indicator */}
                {loading && (
                    <div className="mt-2 mb-4">
                        <div className="inline-flex items-center space-x-2 text-blue-500">
                            <svg
                                className="animate-spin h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <span>Verifying...</span>
                        </div>
                    </div>
                )}

                <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                    <p>This helps us prevent automated spam and abuse.</p>
                    <p className="mt-1">Your data is always protected.</p>
                </div>
            </div>
        </div>
    );
};