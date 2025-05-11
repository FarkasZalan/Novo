import React, { useState, useEffect } from 'react';
import { FaComment, FaTrash, FaPaperPlane, FaUserCircle, FaEdit, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../../../hooks/useAuth';
import { createComment, getAllCommentsForTask, deleteComment, updateComment } from '../../../../services/commentService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface CommentProps {
    projectId: string;
    taskId: string;
    canManageTasks: boolean;
}

export const CommentComponent: React.FC<CommentProps> = ({ projectId, taskId, canManageTasks }) => {
    const { authState } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editedComment, setEditedComment] = useState('');

    useEffect(() => {
        const fetchComments = async () => {
            try {
                if (projectId && taskId && authState.accessToken) {
                    const commentsData = await getAllCommentsForTask(projectId, taskId, authState.accessToken);
                    setComments(commentsData);
                }
            } catch (err) {
                setError('Failed to load comments');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [projectId, taskId, authState.accessToken]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
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

                console.log(createdComment);

                setComments(prev => [
                    {
                        ...createdComment
                    },
                    ...prev
                ]);

                setNewComment('');
                toast.success('Comment added successfully');
            }
        } catch (err) {
            toast.error('Failed to add comment');
            console.error(err);
        }
    };

    const handleUpdateComment = async (commentId: string) => {
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
            console.error(err);
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

    const handleDeleteComment = async (commentId: string) => {
        try {
            if (projectId && taskId && authState.accessToken) {
                await deleteComment(projectId, taskId, commentId, authState.accessToken);
                setComments(prev => prev.filter(comment => comment.id !== commentId));
                toast.success('Comment deleted successfully');
            }
        } catch (err) {
            toast.error('Failed to delete comment');
            console.error(err);
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

    if (loading) {
        return (
            <div className="mt-8">
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
                    <FaComment className="mr-2" />
                    <h3 className="font-medium">Comments</h3>
                    <div className="ml-2 w-6 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                            <div className="flex-1">
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        </div>
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
        <div className="mt-8">
            <div className="flex items-center text-gray-800 dark:text-gray-200 mb-6">
                <FaComment className="mr-3 text-indigo-500" />
                <h3 className="text-lg font-semibold">Discussion</h3>
                {comments.length > 0 && (
                    <span className="ml-3 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2.5 py-1 rounded-full">
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
                className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        {authState.user?.avatar_url ? (
                            <img
                                src={authState.user.avatar_url}
                                alt="User avatar"
                                className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                            />
                        ) : (



                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-medium text-sm mr-3 ${authState.user?.id
                                ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                                : 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300'
                                }`}>
                                {getUserInitials(authState.user?.name || authState.user?.email.split('@')[0] || 'U')}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-2">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 resize-none transition-all duration-200"
                            rows={3}
                            aria-label="Write a comment"
                        />
                        <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {newComment.length > 0 && `${newComment.length}/500`}
                            </div>
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm hover:shadow-md disabled:shadow-none"
                            >
                                <FaPaperPlane className="mr-2" />
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </motion.form>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg">
                        No comments yet. Be the first to comment!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                            <div className="flex-shrink-0">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-medium text-sm mr-3 ${comment.author_id === authState.user?.id
                                    ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                                    : 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300'
                                    }`}>
                                    {getUserInitials(comment.author_name || comment.author_email.split('@')[0])}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg relative">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {comment.author_name || comment.author_email.split('@')[0]}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                {formatDate(comment.created_at)}
                                            </span>
                                        </div>
                                        {(canManageTasks || comment.author_id === authState.user?.id) && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                {comment.author_id === authState.user?.id && (
                                                    <button
                                                        onClick={() => editingCommentId === comment.id ? handleCancelEdit() : handleStartEdit(comment)}
                                                        className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 p-1"
                                                        title={editingCommentId === comment.id ? "Cancel edit" : "Edit comment"}
                                                    >
                                                        {editingCommentId === comment.id ? <FaTimes /> : <FaEdit />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1"
                                                    title="Delete comment"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {editingCommentId === comment.id ? (
                                        <div className="mt-2">
                                            <textarea
                                                value={editedComment}
                                                onChange={(e) => setEditedComment(e.target.value)}
                                                className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 resize-none"
                                                rows={3}
                                            />
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateComment(comment.id)}
                                                    disabled={!editedComment.trim()}
                                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                            {comment.comment}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};