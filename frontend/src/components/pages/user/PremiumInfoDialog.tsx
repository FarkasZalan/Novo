import { FaCopy, FaCheck, FaCreditCard, FaTimes, FaExternalLinkAlt, FaHandPointer } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from "react";

interface PremiumInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onContinue: () => void;
}

export const PremiumInfoDialog = ({
    isOpen,
    onClose,
    onContinue,
}: PremiumInfoDialogProps) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText("4000003480000005");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200/80 dark:border-gray-700/50"
            >
                {/* Header */}
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FaCreditCard className="text-indigo-600 dark:text-indigo-400" />
                                Test Payment Card
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm">
                                Use this test card or{' '}
                                <a
                                    href="https://docs.stripe.com/testing"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 cursor-pointer dark:text-indigo-400 hover:underline inline-flex items-center"
                                >
                                    view all test cards
                                    <FaExternalLinkAlt className="ml-1 h-3 w-3" />
                                </a>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                        >
                            <FaTimes className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                    </div>
                </div>

                {/* Credit Card */}
                <div className="px-4 sm:px-6 pb-1">
                    <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-4 sm:p-5 text-white h-40 sm:h-48 shadow-lg border border-white/10 overflow-hidden">
                        {/* Card Chip */}
                        <div className="absolute top-4 sm:top-5 left-4 sm:left-5 bg-yellow-400/20 w-8 h-6 sm:w-10 sm:h-8 rounded-md flex items-center justify-center">
                            <div className="w-6 h-4 sm:w-8 sm:h-6 bg-yellow-400/30 rounded-sm border border-yellow-300/50"></div>
                        </div>

                        {/* Card Branding */}
                        <div className="absolute top-4 sm:top-5 right-4 sm:right-5">
                            <div className="bg-white/20 rounded-full p-1 sm:p-1.5 backdrop-blur-sm">
                                <FaCreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                        </div>

                        {/* Card Number with Improved Copy Interaction */}
                        <div className="absolute top-12 sm:top-15 left-4 sm:left-5 right-4 sm:right-5">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs opacity-80">Card number</span>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-1 text-xs hover:bg-white/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded transition-colors group"
                                >
                                    {copied ? (
                                        <span className="text-green-300 flex items-center">
                                            <FaCheck className="mr-1" /> Copied
                                        </span>
                                    ) : (
                                        <>
                                            <FaHandPointer className="text-white/60 group-hover:text-white/90 transition-colors" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <div
                                onClick={copyToClipboard}
                                className="font-mono text-lg sm:text-xl tracking-wider bg-white/10 hover:bg-white/15 transition-colors rounded px-2 sm:px-3 py-1.5 sm:py-2 flex justify-between items-center cursor-pointer"
                            >
                                <span className="text-sm sm:text-base lg:text-lg xl:text-xl">4000 0034 8000 0005</span>
                                <FaCopy className="opacity-60 hover:opacity-90 transition-opacity h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                        </div>

                        {/* Card Details */}
                        <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-4 sm:right-5 flex justify-between text-xs sm:text-sm">
                            <div>
                                <span className="text-xs opacity-80 block">Cardholder</span>
                                <span>Test User</span>
                            </div>
                            <div>
                                <span className="text-xs opacity-80 block">Expires</span>
                                <span>12/34</span>
                            </div>
                            <div>
                                <span className="text-xs opacity-80 block">CVC</span>
                                <span>123</span>
                            </div>
                        </div>

                        {/* Glossy Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/5 rounded-full transform translate-x-16 sm:translate-x-20 -translate-y-16 sm:-translate-y-20"></div>
                            <div className="absolute bottom-0 left-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/5 rounded-full transform -translate-x-16 sm:-translate-x-20 translate-y-16 sm:translate-y-20"></div>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4 sm:p-6 pt-2 sm:pt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <p className="mb-2">💡 This is a test environment. No real charges will be made.</p>
                    <p>Use any future expiration date and random 3-digit CVC.</p>
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-2 sm:gap-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        className="px-3 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onContinue();
                        }}
                        className="px-3 sm:px-4 py-1.5 sm:py-2.5 bg-indigo-600 cursor-pointer hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        Continue to Checkout
                    </button>
                </div>
            </motion.div>
        </div>
    );
};