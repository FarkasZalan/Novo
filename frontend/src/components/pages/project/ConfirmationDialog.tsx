import { FaExclamationTriangle } from "react-icons/fa";

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: "red" | "indigo" | "green"; // Add more colors as needed
}

export const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmColor = "red",
}: ConfirmationDialogProps) => {
    if (!isOpen) return null;

    const colorClasses = {
        red: "bg-red-600 hover:bg-red-700",
        indigo: "bg-indigo-600 hover:bg-indigo-700",
        green: "bg-green-600 hover:bg-green-700",
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 px-2 sm:px-4 py-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                {/* Icon at the top - centered */}
                <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                        <FaExclamationTriangle className="h-6 w-6" />
                    </div>
                </div>

                {/* Title and message - centered text */}
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {message}
                    </p>
                </div>

                {/* Buttons - centered and full width on mobile */}
                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-6 py-2 text-white cursor-pointer rounded-lg transition-colors ${colorClasses[confirmColor]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};