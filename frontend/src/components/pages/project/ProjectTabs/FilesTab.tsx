import { useState, useEffect, useRef } from "react";
import { FaTrash, FaDownload, FaUpload, FaTimes, FaCheck } from "react-icons/fa";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../../../context/AuthContext";
import { fetchProjectFiles, createProjectFile, deleteProjectFile, downloadProjectFile } from "../../../../services/projectFilesService";
import { getProjectMembers } from "../../../../services/projectMemberService";
import { ConfirmationDialog } from "../ConfirmationDialog";

interface ProjectFile {
    id: string;
    file_name: string;
    file_path: string;
    mime_type: string;
    size: number;
    uploaded_by_name: string;
    uploaded_by_email: string;
    created_at: string;
}

export const FilesTab = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { authState } = useAuth();
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);

    // Check if user has permission to manage files (owner or admin)
    const canManageFiles = userRole === "owner" || userRole === "admin";

    const loadFiles = async () => {
        try {
            setLoading(true);
            if (projectId && authState.accessToken) {
                const filesData = await fetchProjectFiles(projectId, authState.accessToken);
                setFiles(filesData);
            }
        } catch (err) {
            setError("Failed to load files");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Load project members to determine user role
    const loadMembers = async () => {
        if (!projectId || !authState.accessToken) return;

        try {
            const membersData = await getProjectMembers(projectId, authState.accessToken);
            const [registeredMembers = [], _invitedMembers = []] = membersData;

            // Check if current user is owner or admin
            const currentUserMember = registeredMembers.find(
                (member: any) => member.user_id === authState.user?.id
            );

            if (currentUserMember) {
                if (currentUserMember.role === "admin") {
                    setUserRole("admin");
                } else if (currentUserMember.role === "owner") {
                    setUserRole("owner");
                } else {
                    setUserRole("member");
                }
            }

        } catch (err) {
            console.error("Failed to load members:", err);
        }
    };

    useEffect(() => {
        loadFiles();
        loadMembers();
    }, [projectId, authState.accessToken]);

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
        setSelectedFiles(prev => [...prev, ...newFiles]);
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };


    const handleFileUpload = async () => {
        if (!canManageFiles) {
            toast.error("You don't have permission to upload files");
            return;
        }
        if (selectedFiles.length === 0 || !projectId || !authState.accessToken) return;

        setIsUploading(true);

        // Kick off one upload promise per file
        const uploadPromises = selectedFiles.map(file =>
            createProjectFile(projectId, authState.accessToken!, file, authState.user!.id)
                .then(res => ({ status: "fulfilled" as const, file, value: res }))
                .catch(err => ({ status: "rejected" as const, file, reason: err }))
        );

        // Wait for all of them
        const results = await Promise.all(uploadPromises);

        const successfulUploads: ProjectFile[] = [];
        results.forEach(result => {
            if (result.status === "fulfilled") {
                successfulUploads.push(result.value);
            } else {
                const err = result.reason;
                // Axios‑style error; adjust if you use fetch
                const status = err.response?.status;
                if (status === 413) {
                    toast.error(`“${result.file.name}” is too large (max 10 MB).`);
                } else {
                    toast.error(`Failed to upload “${result.file.name}”.`);
                    console.error(err);
                }
            }
        });

        // Update UI
        if (successfulUploads.length > 0) {
            setFiles(prev => [...successfulUploads, ...prev]);
            toast.success(`${successfulUploads.length} file(s) uploaded successfully!`);
        }

        // Reset
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setIsUploading(false);
    };

    const handleDownloadFile = async (fileId: string) => {
        if (!projectId || !authState.accessToken) return;

        try {
            const blob = await downloadProjectFile(fileId, projectId, authState.accessToken);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = files.find(file => file.id === fileId)?.file_name || 'downloaded-file';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success("File downloaded successfully!");
        } catch (err) {
            toast.error("Failed to download file");
            console.error(err);
        }
    };

    const confirmDeleteFile = (fileId: string) => {
        setFileToDelete(fileId)
        setShowDeleteConfirm(true)
    }

    const handleDeleteFile = async () => {
        if (!canManageFiles || !fileToDelete || !projectId || !authState.accessToken) {
            setShowDeleteConfirm(false);
            return;
        }

        try {
            await deleteProjectFile(projectId, fileToDelete, authState.accessToken);
            setFiles(prevFiles => prevFiles.filter(file => file.id !== fileToDelete));
            toast.success("File deleted successfully!");
        } catch (err) {
            toast.error("Failed to delete file");
            console.error(err);
        } finally {
            setShowDeleteConfirm(false);
            setFileToDelete(null);
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Files</h2>
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Files</h2>
                <div className="text-red-500 dark:text-red-400">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Files</h2>

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
                                MAX. 10MB each
                            </p>
                        </div>
                    </div>

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                        <div className="mt-4 space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Selected files ({selectedFiles.length})
                            </h4>
                            <div className="space-y-2">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded text-sm">
                                                {getFileIcon(file.type)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeSelectedFile(index)}
                                            className="text-gray-400 hover:text-red-500 cursor-pointer dark:hover:text-red-400 p-1"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    onClick={() => setSelectedFiles([])}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200"
                                    disabled={isUploading}
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={handleFileUpload}
                                    disabled={isUploading || selectedFiles.length === 0}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 cursor-pointer dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <span>Uploading...</span>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </>
                                    ) : (
                                        <>
                                            <span>Upload All</span>
                                            <FaCheck />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Files List */}
            <div className="space-y-3">
                {files.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No files uploaded yet
                    </div>
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
                                        onClick={() => confirmDeleteFile(file.id)}
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
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteFile}
                title="Delete File?"
                message="Are you sure you want to delete this file? This action cannot be undone."
                confirmText="Delete"
                confirmColor="red"
            />
        </div>
    );
};