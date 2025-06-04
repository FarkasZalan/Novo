import React, { useState, useEffect, useRef } from "react";
import { FaTrash, FaDownload, FaUpload, FaPaperclip } from "react-icons/fa";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { fetcTaskFiles, downloadTaskFile, deletetaskFile } from "../../../../services/fileService";
import { useAuth } from "../../../../hooks/useAuth";
import { ConfirmationDialog } from "../../project/ConfirmationDialog";


interface TaskFilesProps {
    displayNoFileIfEmpty?: boolean;
    canManageFiles: boolean;
    selectedFiles?: File[];
    setSelectedFiles?: React.Dispatch<React.SetStateAction<File[]>>;
    project: Project | null
}

export const TaskFiles: React.FC<TaskFilesProps> = React.memo(({ canManageFiles, displayNoFileIfEmpty, selectedFiles, setSelectedFiles, project }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const { taskId } = useParams<{ taskId: string }>();
    const { authState } = useAuth();
    const [files, setFiles] = useState<TaskFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const [showTaskDeleteConfirm, setShowTaskDeleteConfirm] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    const loadFiles = async () => {
        try {
            setLoading(true);
            if (projectId && taskId && authState.accessToken) {
                const filesData = await fetcTaskFiles(projectId, taskId, authState.accessToken);
                setFiles(filesData);
            }
        } catch (err) {
            setError("Failed to load files");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, [projectId, taskId, authState.accessToken]);

    // Enhanced drag and drop handlers
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set dragging state if we're dragging files
        if (e.dataTransfer.types.includes('Files')) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Only update state if leaving the drop zone
        if (dropZoneRef.current &&
            !dropZoneRef.current.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Continue to show drag state if we're dragging files
        if (e.dataTransfer.types.includes('Files')) {
            e.dataTransfer.dropEffect = 'copy';
            setIsDragging(true);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelection(e.target.files);
        }
    };

    const handleFileSelection = (files: FileList) => {
        const newFiles = Array.from(files);
        setSelectedFiles?.(prev => [...prev, ...newFiles]);
    };

    // for selected file list duplication
    const getDisplayFileName = (fileName: string, allFiles: File[], currentIndex: number) => {
        // Count how many times this filename appears in the entire array
        const totalCount = allFiles.filter(f => f.name === fileName).length;

        // If there's only one occurrence, return the original name
        if (totalCount <= 1) {
            return fileName;
        }

        // Count how many times this filename appears before the current file
        const countBefore = allFiles.slice(0, currentIndex).filter(f => f.name === fileName).length;

        // Get the file extension
        const lastDotIndex = fileName.lastIndexOf('.');

        if (lastDotIndex === -1) {
            return `${fileName} (${countBefore + 1})`;
        }

        const nameWithoutExt = fileName.substring(0, lastDotIndex);
        const extension = fileName.substring(lastDotIndex);
        return `${nameWithoutExt} (${countBefore + 1})${extension}`;
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles?.(prev => {
            const newFiles = [...prev];
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleDownloadFile = async (fileId: string) => {
        if (!projectId || !taskId || !authState.accessToken) return;

        if (project?.read_only) {
            toast.error("You can't download files from a read-only project");
            return;
        }

        try {
            const blob = await downloadTaskFile(fileId, projectId, taskId, authState.accessToken);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // get the file name
            const fileName = files.find(file => file.id === fileId)?.file_name || 'downloaded-file';
            a.download = fileName;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Clean up the object URL after a short delay to ensure download starts
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);

            toast.success(`Download started for "${fileName}"`);
        } catch (err) {
            toast.error("Failed to download file");
            console.error(err);
        }
    };

    const confirmDeleteFile = (fileId: string) => {
        setFileToDelete(fileId)
        setShowTaskDeleteConfirm(true)
    }

    const handleDeleteFile = async () => {
        try {
            setLoading(true);
            await deletetaskFile(projectId!, taskId!, fileToDelete!, authState.accessToken!);
            setFiles(prevFiles => prevFiles.filter(file => file.id !== fileToDelete));
            toast.success("File deleted successfully!");
            setLoading(false);
        } catch (err) {
            toast.error("Failed to delete file");
            setLoading(false);
            console.error(err);
        } finally {
            setShowTaskDeleteConfirm(false);
            setFileToDelete(null);
            setLoading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (isNaN(diff)) return "unknown time";
        if (diff < 60) return `${diff} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    const getFileIcon = (mimeType: string) => {
        const type = mimeType.split('/')[0];
        switch (type) {
            case 'image':
                return '🖼️';
            case 'video':
                return '🎬';
            case 'audio':
                return '🎵';
            case 'application':
                return '📄';
            case 'text':
                return '📝';
            default:
                return '📁';
        }
    };

    const getCleanFileExtension = (mimeType: string) => {
        // Common MIME type to extension mapping
        const mimeToExtension: Record<string, string> = {
            'application/vnd.oasis.opendocument.text': 'odt',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/msword': 'doc',
            'application/pdf': 'pdf',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.ms-powerpoint': 'ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            'text/plain': 'txt',
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/svg+xml': 'svg',
            'video/mp4': 'mp4',
            'audio/mpeg': 'mp3',
            'application/zip': 'zip',
            'application/x-rar-compressed': 'rar',
            'application/x-7z-compressed': '7z',
            'text/csv': 'csv',
            'application/json': 'json',
            'application/javascript': 'js',
            'text/html': 'html',
            'text/css': 'css',
            'text/xml': 'xml',
            'application/octet-stream': 'BIN',
            'application/vnd.oasis.opendocument.text-template': 'odt',
            'application/vnd.oasis.opendocument.text-web': 'odt',
            'application/vnd.oasis.opendocument.spreadsheet': 'ods',
            'application/vnd.oasis.opendocument.presentation': 'odp',
            'application/vnd.oasis.opendocument.chart': 'odc',
            'application/vnd.oasis.opendocument.graphics': 'odg',
            'application/vnd.oasis.opendocument.image': 'odi',
            'application/vnd.oasis.opendocument.formula': 'odf',
            'application/vnd.oasis.opendocument.database': 'odb',
            'application/vnd.oasis.opendocument.text-master': 'odm',
            'application/vnd.oasis.opendocument.presentation-template': 'otp',
            'application/vnd.oasis.opendocument.spreadsheet-template': 'ots',
        };

        // Check if we have a direct mapping
        const lowerMimeType = mimeType.toLowerCase();
        if (mimeToExtension[lowerMimeType]) {
            return mimeToExtension[lowerMimeType].toUpperCase();
        }

        // Try to extract from the MIME type if no direct mapping
        const parts = mimeType.split('/');
        if (parts.length === 2) {
            const subtype = parts[1];

            // Handle complex subtypes (like vnd.*)
            if (subtype.startsWith('vnd.')) {
                // Try to find the last meaningful part
                const segments = subtype.split('.');
                // Look for common patterns
                if (segments.includes('opendocument')) {
                    return segments[segments.length - 1].toUpperCase();
                }
                if (segments.includes('openxmlformats')) {
                    return segments[segments.length - 1].replace('document', '').toUpperCase();
                }
                const lastPart = segments.pop() || '';
                if (lastPart) {
                    return lastPart.toUpperCase();
                }
            }

            // For other types, just take the subtype
            return subtype.toUpperCase();
        }

        // Fallback to FILE if we can't determine
        return 'FILE';
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
                    <FaPaperclip className="mr-2" />
                    <h3 className="font-medium">Files</h3>
                </div>
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
                    <FaPaperclip className="mr-2" />
                    <h3 className="font-medium">Files</h3>
                </div>
                <div className="text-red-500 dark:text-red-400">{error}</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-700/50">
                    <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading" />
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
                <FaPaperclip className="mr-2" />
                <h3 className="font-medium">Files</h3>
                {files.length > 0 && (
                    <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
                        {files.length} {files.length === 1 ? 'attachment' : 'attachments'}
                    </span>
                )}
            </div>

            {/* Enhanced File Upload Dropzone - Only show if user has permission */}
            {canManageFiles && (
                <div className="mb-6">
                    <div
                        ref={dropZoneRef}
                        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${isDragging
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                            }`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <div className="text-center">
                            <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                                <FaUpload className="text-indigo-600 dark:text-indigo-300 text-xl" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                                {isDragging ? 'Drop files here' : 'Upload files'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Drag & drop files here, or click to browse
                            </p>
                            <button
                                type="button"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 cursor-pointer dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Select Files
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileInputChange}
                                multiple
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                MAX. 10MB per file
                            </p>
                        </div>
                    </div>

                    {/* Selected Files Preview */}
                    {selectedFiles && selectedFiles.length > 0 && (
                        <div className="mt-4 space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Selected files ({selectedFiles.length})
                            </h4>
                            <div className="space-y-2">
                                {selectedFiles.map((file, index) => {
                                    const isTooLarge = file.size > MAX_FILE_SIZE;
                                    const displayName = getDisplayFileName(file.name, selectedFiles, index);

                                    return (
                                        <div
                                            key={index}
                                            className={`flex items-center justify-between p-3 rounded-lg border ${isTooLarge
                                                ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                                                : 'bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-8 h-8 flex items-center justify-center rounded text-sm ${isTooLarge
                                                    ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                                    : 'bg-white dark:bg-gray-600'
                                                    }`}>
                                                    {getFileIcon(file.type)}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium truncate max-w-xs ${isTooLarge
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-gray-900 dark:text-gray-100'
                                                        }`}>
                                                        {displayName}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs ${isTooLarge
                                                            ? 'text-red-500 dark:text-red-400'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                            }`}>
                                                            {formatFileSize(file.size)}
                                                        </span>
                                                        {isTooLarge && (
                                                            <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-full">
                                                                Exceeds 10MB limit
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    removeSelectedFile(index);
                                                }}
                                                className={`p-2 rounded-full cursor-pointer ${isTooLarge
                                                    ? 'text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20'
                                                    : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-500 dark:hover:text-red-400'
                                                    } transition-colors`}
                                                title="Remove file"
                                            >
                                                <FaTrash className="text-sm" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    onClick={() => setSelectedFiles?.([])}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Files List */}
            <div className="space-y-3">
                {files.length === 0 ? (
                    // No files uploaded
                    displayNoFileIfEmpty && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/70 dark:bg-gray-700/60 p-4 rounded-lg backdrop-blur-sm">
                            No files uploaded yet
                        </div>
                    )
                ) : (
                    files.map((file) => (
                        <div key={file.id} className="group flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                            <div className="flex items-center space-x-4 min-w-0">
                                <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
                                    {getFileIcon(file.mime_type)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate hover:underline cursor-pointer hover:text-indigo-500 dark:hover:text-indigo-400 transition"
                                        onClick={() => handleDownloadFile(file.id)}>
                                        {file.file_name}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        <span>{formatFileSize(Number(file.size))}</span>
                                        <span>•</span>
                                        <span>{getCleanFileExtension(file.mime_type)}</span>
                                        <span>•</span>
                                        <span>Uploaded by <span className="font-bold">{file.uploaded_by_name || file.uploaded_by_email}</span></span>
                                        <span>•</span>
                                        <span>{formatDate(file.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleDownloadFile(file.id)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 cursor-pointer dark:hover:text-indigo-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                    title="Download"
                                >
                                    <FaDownload />
                                </button>
                                {canManageFiles && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            confirmDeleteFile(file.id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600 cursor-pointer dark:hover:text-red-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showTaskDeleteConfirm}
                onClose={() => setShowTaskDeleteConfirm(false)}
                onConfirm={handleDeleteFile}
                title="Delete File?"
                message="Are you sure you want to delete this file? This action cannot be undone."
                confirmText="Delete"
                confirmColor="red"
            />
        </div>
    );
});