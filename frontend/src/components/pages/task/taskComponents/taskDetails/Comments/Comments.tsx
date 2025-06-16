import React, { useState, useEffect } from 'react';
import { FaComment, FaTrash, FaPaperPlane, FaEdit, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../../../../../hooks/useAuth';
import { createComment, getAllCommentsForTask, deleteComment, updateComment } from '../../../../../../services/commentService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmationDialog } from '../../../../project/ConfirmationDialog';
import { CommentLogsComponent } from './CommentLog';

interface CommentProps {
    projectId: string;
    taskId: string;
    canManageTasks: boolean;
    compactMode?: boolean;
    listCompactMode?: boolean;
    project: Project | null;
}

export const CommentComponent: React.FC<CommentProps> = ({ projectId, taskId, canManageTasks, compactMode, listCompactMode, project }) => {
    const { authState } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editedComment, setEditedComment] = useState('');
    const [showTaskDeleteConfirm, setShowTaskDeleteConfirm] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setLoading(true);
                if (projectId && taskId && authState.accessToken) {
                    const commentsData = await getAllCommentsForTask(projectId, taskId, authState.accessToken);
                    setComments(commentsData);
                }
            } catch (err) {
                setError('Failed to load comments');
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [projectId, taskId, authState.accessToken]);

    useEffect(() => {
        if (editingCommentId && textareaRef.current) {
            const textarea = textareaRef.current;
            textarea.focus();
            // Set cursor to end on edit
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
    }, [editingCommentId]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (project?.read_only) {
            toast.error('This project is read-only. You cannot write comments.');
            return;
        }
        setLoading(true);
        if (!newComment.trim()) return;

        try {
            if (projectId && taskId && authState.accessToken && authState.user?.id) {
                const createdComment: Comment = await createComment(
                    newComment,
                    taskId,
                    projectId,
                    authState.user.id,
                    authState.accessToken
                );

                setComments(prev => [
                    {
                        ...createdComment,
                        author_name: authState.user?.name || '',
                        author_email: authState.user?.email || ''
                    },
                    ...prev
                ]);

                setNewComment('');
                toast.success('Comment added successfully');
            }
        } catch (err) {
            toast.error('Failed to add comment');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateComment = async (commentId: string) => {
        setLoading(true);
        if (!editedComment.trim()) return;

        try {
            if (projectId && taskId && authState.accessToken) {
                await updateComment(editedComment, commentId, projectId, taskId, authState.accessToken);

                setComments(prev => prev.map(comment =>
                    comment.id === commentId
                        ? { ...comment, comment: editedComment }
                        : comment
                ));

                setEditingCommentId(null);
                setEditedComment('');
                toast.success('Comment updated successfully');
            }
        } catch (err) {
            toast.error('Failed to update comment');
        } finally {
            setLoading(false);
        }
    };

    const handleStartEdit = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditedComment(comment.comment);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditedComment('');
    };

    const handleShowDeleteConfirm = (commentId: string) => {
        setShowTaskDeleteConfirm(true);
        setCommentToDelete(commentId);
    };

    const handleDeleteComment = async () => {
        try {
            setLoading(true);
            if (projectId && taskId && authState.accessToken) {
                await deleteComment(projectId, taskId, commentToDelete!, authState.accessToken);
                setComments(prev => prev.filter(comment => comment.id !== commentToDelete!));
                toast.success('Comment deleted successfully');
            }
        } catch (err) {
            toast.error('Failed to delete comment');
        } finally {
            setLoading(false);
            setShowTaskDeleteConfirm(false);
            setCommentToDelete(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getUserInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const isCurrentUserComment = (comment: Comment) => {
        return comment.author_id === authState.user?.id;
    };

    if (compactMode) {
        if (comments.length === 0) return null;
        return (
            <span className="inline-flex items-center text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full">
                <FaComment className="mr-1 h-3 w-3" />
                {comments.length}
            </span>
        );
    }

    if (listCompactMode) {
        return (
            comments.length > 0 ? (
                <div className="flex items-center gap-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                        <FaComment className="mr-1" />
                        {comments.length}
                    </span>
                </div>
            ) : (
                <span className="text-gray-400 dark:text-gray-500">—</span>
            )
        );
    }

    if (loading) {
        return (
            <div className="mt-8">
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
                    <FaComment className="mr-2" />
                    <h3 className="font-medium">Comments</h3>
                    <div className="ml-2 w-6 h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full animate-pulse"></div>
                </div>

                {/* Comment Form Skeleton */}
                <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"></div>
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="h-20 w-full rounded-lg bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"></div>
                            <div className="flex justify-end">
                                <div className="h-9 w-24 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments List Skeleton */}
                <div className="space-y-6">
                    {[...Array(2)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                            className="flex gap-3"
                        >
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"></div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between">
                                    <div className="h-4 w-32 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"></div>
                                    <div className="h-4 w-16 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-3 w-full rounded-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"></div>
                                    <div className="h-3 w-5/6 rounded-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"></div>
                                    <div className="h-3 w-3/4 rounded-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"></div>
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"></div>
                                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"></div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-8">
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
                    <FaComment className="mr-2" />
                    <h3 className="font-medium">Comments</h3>
                </div>
                <div className="text-red-500 dark:text-red-400">{error}</div>
            </div>
        );
    }

    return (
        <div className="mt-6 sm:mt-8">
            {/* Discussion Header */}
            <div className="flex items-center text-gray-800 dark:text-gray-200 mb-4 sm:mb-6">
                <FaComment className="mr-2 sm:mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold">Discussion</h3>
                {comments.length > 0 && (
                    <span className="ml-2 sm:ml-3 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                        {comments.length}
                    </span>
                )}
            </div>

            {/* Comment Form */}
            <motion.form
                onSubmit={handleSubmitComment}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 sm:mb-8 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
                <div className="flex gap-2 sm:gap-3">
                    <div className="flex-shrink-0">
                        {authState.user?.avatar_url ? (
                            <img
                                src={authState.user.avatar_url}
                                alt="User avatar"
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                            />
                        ) : (
                            <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-medium text-xs sm:text-sm 
                            ${authState.user?.id
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                            >
                                {getUserInitials(authState.user?.name || authState.user?.email.split('@')[0] || 'U')}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-2">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            rows={2}
                            aria-label="Write a comment"
                            maxLength={500}
                        />
                        <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {newComment.length > 0 && `${newComment.length}/500`}
                            </div>
                            <button
                                type="submit"
                                disabled={!newComment.trim() || project?.read_only}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-700 cursor-pointer dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm hover:shadow-md disabled:shadow-none text-sm sm:text-base"
                            >
                                <FaPaperPlane className="mr-1 sm:mr-2" />
                                <span>Post</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.form>

            {/* Comments List */}
            <div className="space-y-3 sm:space-y-4">
                {comments.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-4 sm:py-6 text-sm sm:text-base text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                        No comments yet. Be the first to comment!
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        {comments.map((comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className={`flex gap-2 sm:gap-3 group ${isCurrentUserComment(comment) ? 'comment-current-user' : ''}`}
                            >
                                <div className="flex-shrink-0">
                                    <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-medium text-xs sm:text-sm 
                                    ${isCurrentUserComment(comment)
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-indigo-100 dark:bg-gray-700 text-indigo-600 dark:text-gray-300'
                                        }`}
                                    >
                                        {getUserInitials(comment.author_name || comment.author_email.split('@')[0])}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`p-3 sm:p-4 rounded-lg relative 
                                    ${isCurrentUserComment(comment)
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800'
                                            : 'bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0 mb-1">
                                            <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                                                <span className={`font-medium text-sm sm:text-base 
                                                ${isCurrentUserComment(comment)
                                                        ? 'text-indigo-700 dark:text-indigo-300'
                                                        : 'text-gray-900 dark:text-gray-100'
                                                    }`}
                                                >
                                                    {comment.author_name || comment.author_email.split('@')[0]}
                                                    {isCurrentUserComment(comment) && (
                                                        <span className="ml-1 sm:ml-2 text-xs bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.5 rounded-full">
                                                            You
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDate(comment.created_at)}
                                                </span>
                                            </div>
                                            {(canManageTasks && !project?.read_only || isCurrentUserComment(comment) && !project?.read_only) && (
                                                <div className={`flex gap-1 ${isCurrentUserComment(comment) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                                                    {isCurrentUserComment(comment) && (
                                                        <button
                                                            onClick={() => editingCommentId === comment.id ? handleCancelEdit() : handleStartEdit(comment)}
                                                            className={`p-1 rounded-full cursor-pointer ${isCurrentUserComment(comment)
                                                                ? 'text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-800/50'
                                                                : 'text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400'
                                                                }`}
                                                            title={editingCommentId === comment.id ? "Cancel edit" : "Edit comment"}
                                                        >
                                                            {editingCommentId === comment.id ? <FaTimes size={14} /> : <FaEdit size={14} />}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleShowDeleteConfirm(comment.id)}
                                                        className={`p-1 rounded-full cursor-pointer ${isCurrentUserComment(comment)
                                                            ? 'text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-800/50'
                                                            : 'text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                                                            }`}
                                                        title="Delete comment"
                                                    >
                                                        <FaTrash className="text-xs sm:text-sm" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {editingCommentId === comment.id ? (
                                            <div className="mt-2">
                                                <textarea
                                                    ref={textareaRef}
                                                    value={editedComment}
                                                    onChange={(e) => setEditedComment(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm sm:text-base bg-white text-gray-900 dark:text-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 resize-none"
                                                    rows={3}
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="px-2 py-1 sm:px-3 sm:py-1 text-sm text-gray-700 cursor-pointer dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateComment(comment.id)}
                                                        disabled={!editedComment.trim()}
                                                        className="px-2 py-1 sm:px-3 sm:py-1 text-sm bg-indigo-600 cursor-pointer hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Update
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className={`text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-line ${isCurrentUserComment(comment) ? 'font-medium' : ''}`}>
                                                {comment.comment}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-1 sm:mt-2 ml-0 sm:ml-12">
                                        <CommentLogsComponent
                                            projectId={projectId}
                                            taskId={taskId}
                                            commentId={comment.id}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showTaskDeleteConfirm}
                onClose={() => setShowTaskDeleteConfirm(false)}
                onConfirm={handleDeleteComment}
                title="Delete Comment?"
                message="Are you sure you want to delete this comment? This action cannot be undone."
                confirmText="Delete"
                confirmColor="red"
            />
        </div>
    );
};