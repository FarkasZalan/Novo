import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createTask, deleteTask, fetchAllTasksForProject, fetchTask, updateTask } from '../../../../services/taskService';
import { FaCalendarAlt, FaArrowLeft, FaSave, FaTimes, FaTrash, FaExclamationTriangle, FaFlag, FaPlus, FaSearch, FaTag } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { ConfirmationDialog } from '../../project/ConfirmationDialog';
import { useAuth } from '../../../../hooks/useAuth';
import { TaskFiles } from '../taskComponents/TaskFiles';
import { uploadTaskFile } from '../../../../services/fileService';
import { TaskAssignments } from '../taskComponents/assignments/TaskAssignments';
import ProjectMember from '../../../../types/projectMember';
import { addAssignmentForUsers } from '../../../../services/assignmentService';
import { addMilestoneToTask, createMilestone, deleteMilestoneFromTask, getAllMilestonesForProject } from '../../../../services/milestonesService';
import { createLabel, getAllLabelForProject } from '../../../../services/labelService';
import { SubtaskList } from '../taskComponents/subtasks/SubtaskList';

export const TaskForm: React.FC<{ isEdit: boolean }> = ({ isEdit }) => {
    const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
    const [statusParam] = useSearchParams();
    const { authState } = useAuth();
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const taskStatus = statusParam.get('status') || 'not-started';

    // for file upload
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const [hasOversizedFiles, setHasOversizedFiles] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: 'low' as 'low' | 'medium' | 'high',
        status: taskStatus as 'not-started' | 'in-progress' | 'blocked' | 'completed',
        completed: false,
        subtasks: [],
        parentTaskId: ''
    });

    const [fieldErrors, setFieldErrors] = useState({
        title: ""
    });

    const [isLoading, setLoading] = useState(false);
    const [isInitialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // files states
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // assignments
    const [pendingUsers, setPendingUsers] = useState<ProjectMember[]>([]);

    // Milestone states
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
    const [milestoneSearchTerm, setMilestoneSearchTerm] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Label states
    const [labels, setLabels] = useState<Label[]>([]);
    const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);
    const [labelSearchTerm, setLabelSearchTerm] = useState('');
    const [showLabelSearchResults, setShowLabelSearchResults] = useState(false);
    const labelSearchRef = useRef<HTMLDivElement>(null);

    // for subtask status confirm
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState<'not-started' | 'in-progress' | 'blocked' | 'completed'>('not-started');


    // Load milestones and task data
    useEffect(() => {
        const loadData = async () => {
            try {
                setInitialLoading(true);
                setError(null);

                // Load milestones and labels in parallel
                const [loadedMilestones, loadedLabels] = await Promise.all([
                    getAllMilestonesForProject(projectId!, authState.accessToken!),
                    getAllLabelForProject(projectId!, authState.accessToken!)
                ]);

                setMilestones(loadedMilestones);
                setLabels(loadedLabels);

                if (isEdit && taskId) {
                    // Load task data
                    const tasks = await fetchAllTasksForProject(projectId!, authState.accessToken!, "priority", "asc");
                    const task = tasks.find((t: any) => t.id === taskId);

                    if (task) {
                        setFormData({
                            title: task.title,
                            description: task.description || '',
                            dueDate: task.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : '',
                            priority: task.priority || 'low',
                            status: task.status || 'not-started',
                            completed: task.status === 'completed',
                            subtasks: task.subtasks,
                            parentTaskId: task.parent_task_id
                        });

                        // Set milestone if exists
                        if (task.milestone_id) {
                            const milestone = loadedMilestones.find((m: Milestone) => m.id === task.milestone_id);
                            if (milestone) {
                                setSelectedMilestone(milestone);
                            }
                        }

                        // Set labels if exist
                        setSelectedLabels(task.labels || []);
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load data');
            } finally {
                setInitialLoading(false);
            }
        };

        if (projectId) {
            loadData();
        }
    }, [isEdit, projectId, taskId, authState.accessToken]);

    const validateField = (name: string, value: string) => {
        let error = "";

        switch (name) {
            case "title":
                if (!value.trim()) error = "Title is required";
                else if (value.length < 2) error = "Title must be at least 2 characters";
                break;
            // add validation for other fields if needed
        }

        return error;
    };

    // Filter milestones based on search term
    const filteredMilestones = milestones.filter((milestone: Milestone) =>
        milestone.name.toLowerCase().includes(milestoneSearchTerm.toLowerCase())
    );

    // click outside search results milestone
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCreateMilestone = async () => {
        if (!milestoneSearchTerm.trim()) { // trim() to remove leading/trailing spaces
            return;
        }

        try {
            setLoading(true);
            const newMilestone = await createMilestone(
                projectId!,
                authState.accessToken!,
                milestoneSearchTerm.trim(),
                '', // Empty description
                '', // Empty color
            );

            setMilestones([...milestones, newMilestone]);
            setSelectedMilestone(newMilestone);
            setMilestoneSearchTerm('');
            toast.success(`Milestone "${milestoneSearchTerm.trim()}" created`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to create milestone');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setError("Please fix the errors in the form");
            return;
        }
        try {
            setLoading(true);
            setError(null);

            const { title, description, dueDate, priority, status } = formData;

            let resultTask;
            if (isEdit && taskId) {
                resultTask = await updateTask(
                    taskId,
                    projectId!,
                    authState.accessToken!,
                    title,
                    description,
                    dueDate ? new Date(dueDate) : undefined,
                    priority,
                    status,
                    selectedLabels
                );

                // Handle assignments
                if (pendingUsers.length > 0) {
                    await handleAddAssignments(resultTask.id);
                }

                // Handle file uploads
                if (selectedFiles.length > 0) {
                    await handleFileUpload(resultTask.id);
                }

                // Handle milestone assignment if selected
                if (selectedMilestone) {
                    await addMilestoneToTask(
                        selectedMilestone.id,
                        projectId!,
                        [resultTask.id],
                        authState.accessToken!
                    );
                } else if (!selectedMilestone && resultTask.milestone_id) {
                    await deleteMilestoneFromTask(
                        resultTask.milestone_id,
                        projectId!,
                        resultTask.id,
                        authState.accessToken!)
                }
                toast.success('Task updated successfully');
            } else {
                resultTask = await createTask(
                    projectId!,
                    authState.accessToken!,
                    title,
                    description,
                    dueDate ? new Date(dueDate) : undefined,
                    priority,
                    status,
                    selectedLabels
                );

                // Handle assignments
                if (pendingUsers.length > 0) {
                    await handleAddAssignments(resultTask.id);
                }

                // Handle file uploads
                if (selectedFiles.length > 0) {
                    await handleFileUpload(resultTask.id);
                }

                // Handle milestone assignment if selected
                if (selectedMilestone) {
                    await addMilestoneToTask(
                        selectedMilestone.id,
                        projectId!,
                        [resultTask.id],
                        authState.accessToken!
                    );
                }
                toast.success('Task created successfully');
            }
            navigate(-1);
        } catch (err) {
            console.error(err);
            setError('Failed to save task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAssignments = async (taskId: string) => {
        try {
            await addAssignmentForUsers(projectId!, taskId, pendingUsers, authState.accessToken!);
        } catch (err) {
            console.error(err);
        }
    }

    const handleFileUpload = async (taskId: string) => {
        if (hasOversizedFiles) {
            toast.error("Cannot upload - some files exceed size limit");
            return;
        }
        // Filter out files that are too large
        const validFiles = selectedFiles.filter(file => file.size <= MAX_FILE_SIZE);

        if (validFiles.length === 0 || !projectId || !taskId || !authState.accessToken) {
            if (selectedFiles.some(file => file.size > MAX_FILE_SIZE)) {
                toast.error("Some files exceed the 10MB limit and cannot be uploaded");
            }
            return;
        }

        setLoading(true);

        // Kick off one upload promise per file
        const uploadPromises = validFiles.map(file =>
            uploadTaskFile(projectId, taskId, authState.accessToken!, file, authState.user!.id)
                .then(res => ({ status: "fulfilled" as const, file, value: res }))
                .catch(err => ({ status: "rejected" as const, file, reason: err }))
        );

        // Wait for all of them
        const results = await Promise.all(uploadPromises);

        const successfulUploads: File[] = [];
        results.forEach(result => {
            if (result.status === "fulfilled") {
                successfulUploads.push(result.value);
            } else {
                const err = result.reason;
                const status = err.response?.status;
                if (status === 413) {
                    toast.error(`“${result.file.name}” is too large (max 10 MB).`);
                } else {
                    toast.error(`Failed to upload “${result.file.name}”.`);
                    console.error(err);
                }
            }
        });

        // Reset
        setSelectedFiles([]);
        setLoading(false);
    };

    useEffect(() => {
        const oversized = selectedFiles.some(file => file.size > MAX_FILE_SIZE);
        setHasOversizedFiles(oversized);

        if (oversized) {
            toast.error("Some files exceed the 10MB limit", {
                id: 'oversized-files-warning',
                duration: 4000
            });
        }
    }, [selectedFiles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Special validation for dueDate
        if (name === 'dueDate' && value) {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to compare dates only

            if (selectedDate < today) {
                return;
            }
        }

        if (name === 'status') {
            const newStatus = value as 'not-started' | 'in-progress' | 'blocked' | 'completed';

            // Check if changing to completed with incomplete subtasks
            if (newStatus === 'completed' && formData.subtasks?.length > 0) {
                const incompleteSubtasks = formData.subtasks.filter((subtask: any) => subtask.status !== 'completed');

                if (incompleteSubtasks.length > 0) {
                    setPendingStatusChange(newStatus);
                    setShowStatusConfirm(true);
                    return; // Don't update status yet
                }
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        const error = validateField(name, value);
        setFieldErrors(prev => ({
            ...prev,
            [name]: error
        }));

        if (error) setError("");
    };

    const handleConfirmStatusChange = () => {
        setFormData(prev => ({
            ...prev,
            status: pendingStatusChange
        }));
        setShowStatusConfirm(false);
    };

    const handleDeleteTask = async () => {
        if (!taskId) return;
        try {
            setLoading(true);
            await deleteTask(taskId, projectId!, authState.accessToken!);
            navigate(`/projects/${projectId}/tasks`, { replace: true });
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete task');
        } finally {
            setLoading(false);
        }
    };


    const validateForm = () => {
        let valid = true;
        const newFieldErrors = { ...fieldErrors };

        // Validate required fields
        const titleError = validateField('title', formData.title);
        newFieldErrors.title = titleError;
        if (titleError) valid = false;

        setFieldErrors(newFieldErrors);
        return valid;
    };

    // Filter labels based on search term
    const filteredLabels = labels.filter(label =>
        label.name.toLowerCase().includes(labelSearchTerm.toLowerCase()) &&
        !selectedLabels.some(selected => selected.id === label.id)
    );

    // Generate a random color that's not already used
    const getRandomUnusedColor = (): string => {
        // Modern, accessible color palette that works in both light/dark modes
        const DEFAULT_COLORS = [
            // WARNING COLORS (3) - bugs/urgent
            '#E06C5E', // Alert coral (high visibility)
            '#D95C4A', // Danger rust (strong contrast)
            '#C74E3D', // Critical red (serious issues)

            // GREENS (3) - success/completed
            '#5CA271', // Healthy green
            '#6BB38A', // Fresh mint
            '#5DAA90', // Calm teal

            // BLUES (3) - info/technical
            '#4E8FD9', // Trusted blue
            '#5A9AE6', // Friendly azure
            '#3D88B0', // Stable steel

            // PURPLES (3) - features/enhancements
            '#8D74C9', // Creative lavender
            '#A066A0', // Innovative plum
            '#B584AD', // Soft berry

            // NEUTRALS (4) - in-progress/notes
            '#D9AE67', // Active mustard
            '#C0B18D', // Natural khaki
            '#B0A79D', // Warm gray
            '#9196A1'  // Cool gray
        ];

        // Get all colors currently in use
        const usedColors = new Set(labels.map(label => label.color));

        // Find first default color not in use
        const availableColor = DEFAULT_COLORS.find(color => !usedColors.has(color));
        if (availableColor) return availableColor;

        // If all colors are used, generate a random one with good contrast
        const randomHue = Math.floor(Math.random() * 360);
        const randomSaturation = 70 + Math.floor(Math.random() * 25); // 70-100%
        const randomLightness = 40 + Math.floor(Math.random() * 15); // 40-70%

        return `hsl(${randomHue}, ${randomSaturation}%, ${randomLightness}%)`;
    };

    const handleCreateLabel = async () => {
        if (!labelSearchTerm.trim()) return;

        try {
            setLoading(true);
            const newLabel = await createLabel(
                projectId!,
                authState.accessToken!,
                labelSearchTerm.trim(),
                '', // Empty description
                getRandomUnusedColor() // Auto-select a unique color
            );

            setLabels([...labels, newLabel]);
            setSelectedLabels([...selectedLabels, newLabel]);
            setLabelSearchTerm('');
            toast.success(`Label "${labelSearchTerm.trim()}" created`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to create label');
        } finally {
            setLoading(false);
        }
    };

    // Click outside label search results
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (labelSearchRef.current && !labelSearchRef.current.contains(event.target as Node)) {
                setShowLabelSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    if (isInitialLoading) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            </div>
        );
    }


    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 mr-4 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                    <FaArrowLeft />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {isEdit ? 'Edit Task' : 'Create New Task'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-700/50 p-6 transition-all duration-200">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="title">
                            Task Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border ${fieldErrors.title ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors`}
                            placeholder="Enter task title"
                            required
                        />
                        {fieldErrors.title && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {fieldErrors.title}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200"
                            placeholder="Enter task description"
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="dueDate">
                                Due Date
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaCalendarAlt className="text-gray-400 dark:text-gray-500" />
                                </div>
                                <input
                                    id="dueDate"
                                    name="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    min={getTodayDateString()} // This prevents selecting past dates
                                    className="w-full pl-10 cursor-pointer pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="priority">
                                Priority
                            </label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-4 cursor-pointer py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        {!isLoading && !formData.parentTaskId && isEdit && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="status">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full cursor-pointer px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                                >
                                    <option value="not-started">Not Started</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Milestone Selection */}
                    <div className="space-y-2" ref={searchRef}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Milestone
                        </label>

                        {/* If this is a subtask */}
                        {formData.parentTaskId ? (
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                {selectedMilestone ? (
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="p-2 rounded-lg shadow-inner"
                                            style={{
                                                backgroundColor: `${selectedMilestone.color}30`,
                                            }}
                                        >
                                            <FaFlag
                                                className="text-sm"
                                                style={{ color: selectedMilestone.color }}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                Inherited from parent task
                                            </p>
                                            <span
                                                className="font-medium"
                                                style={{ color: selectedMilestone.color }}
                                            >
                                                {selectedMilestone.name}
                                            </span>
                                            {selectedMilestone.due_date && (
                                                <span className="block text-xs text-gray-500 dark:text-gray-300 mt-0.5">
                                                    Due {new Date(selectedMilestone.due_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No milestone assigned to parent task
                                    </p>
                                )}
                            </div>
                        ) : (
                            /* Regular task milestone selector */
                            <>
                                {selectedMilestone ? (
                                    <div
                                        className="flex items-center justify-between rounded-lg px-4 py-3 border transition-all duration-200 shadow-sm"
                                        style={{
                                            backgroundColor: `${selectedMilestone.color}20`,
                                            borderColor: `${selectedMilestone.color}40`,
                                        }}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="p-2 rounded-lg shadow-inner"
                                                style={{
                                                    backgroundColor: `${selectedMilestone.color}30`,
                                                }}
                                            >
                                                <FaFlag
                                                    className="text-sm"
                                                    style={{ color: selectedMilestone.color }}
                                                />
                                            </div>
                                            <div>
                                                <span
                                                    className="font-medium"
                                                    style={{ color: selectedMilestone.color }}
                                                >
                                                    {selectedMilestone.name}
                                                </span>
                                                {selectedMilestone.due_date && (
                                                    <span className="block text-xs text-gray-500 dark:text-gray-300 mt-0.5">
                                                        Due {new Date(selectedMilestone.due_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedMilestone(null)}
                                            className="p-1.5 -mr-1 cursor-pointer rounded-lg hover:bg-opacity-30 transition-colors"
                                            style={{
                                                color: selectedMilestone.color,
                                                backgroundColor: `${selectedMilestone.color}20`
                                            }}
                                            aria-label="Remove milestone"
                                        >
                                            <FaTimes className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                                                placeholder="Search or create milestone..."
                                                value={milestoneSearchTerm}
                                                onChange={(e) => {
                                                    setMilestoneSearchTerm(e.target.value);
                                                    setShowSearchResults(true);
                                                }}
                                                onFocus={() => setShowSearchResults(true)}
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaSearch className="text-gray-400 dark:text-gray-500 text-sm" />
                                            </div>

                                            {milestoneSearchTerm && (
                                                <button
                                                    onClick={() => {
                                                        setMilestoneSearchTerm('');
                                                        setShowSearchResults(false);
                                                    }}
                                                    className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>

                                        {showSearchResults && (
                                            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                                                {filteredMilestones.length > 0 ? (
                                                    <>
                                                        <ul className="py-1">
                                                            {filteredMilestones.map(milestone => (
                                                                <li
                                                                    key={milestone.id}
                                                                    className="px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                                    onClick={() => {
                                                                        setSelectedMilestone(milestone);
                                                                        setMilestoneSearchTerm('');
                                                                        setShowSearchResults(false);
                                                                    }}
                                                                >
                                                                    <div className="flex items-center space-x-3">
                                                                        <div
                                                                            className="flex-shrink-0 p-1 rounded-lg"
                                                                            style={{
                                                                                backgroundColor: `${milestone.color}20`
                                                                            }}
                                                                        >
                                                                            <FaFlag
                                                                                className="text-sm"
                                                                                style={{ color: milestone.color }}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <p
                                                                                className="text-sm font-medium"
                                                                                style={{ color: milestone.color }}
                                                                            >
                                                                                {milestone.name}
                                                                            </p>
                                                                            {milestone.due_date && (
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                                    Due {new Date(milestone.due_date).toLocaleDateString()}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {milestoneSearchTerm && !milestones.some(m => m.name.toLowerCase() === milestoneSearchTerm.toLowerCase()) && (
                                                            <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={handleCreateMilestone}
                                                                    className="w-full cursor-pointer flex items-center justify-between px-2 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors"
                                                                >
                                                                    <span>Create "{milestoneSearchTerm}"</span>
                                                                    <FaPlus className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="p-4 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <div className="mb-3 rounded-lg bg-gray-100 dark:bg-gray-700 p-2">
                                                                <FaPlus className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                            </div>
                                                            <p className="text-gray-700 dark:text-gray-300 font-medium text-sm mb-2">
                                                                No milestones found
                                                            </p>
                                                            {milestoneSearchTerm && (
                                                                <button
                                                                    type="button"
                                                                    onClick={handleCreateMilestone}
                                                                    className="w-full cursor-pointer py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors text-sm"
                                                                >
                                                                    Create "{milestoneSearchTerm}"
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Labels Selection */}
                    <div className="space-y-2" ref={labelSearchRef}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Labels
                        </label>

                        {/* Selected labels display */}
                        {selectedLabels.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedLabels.map(label => {
                                    // Calculate text color based on label color brightness
                                    const hexColor = label.color.startsWith('#') ? label.color : `#${label.color}`;
                                    const r = parseInt(hexColor.slice(1, 3), 16);
                                    const g = parseInt(hexColor.slice(3, 5), 16);
                                    const b = parseInt(hexColor.slice(5, 7), 16);
                                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                                    const textColor = brightness > 150 ? 'text-gray-900' : 'text-white';

                                    return (
                                        <div
                                            key={label.id}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md ${textColor}`}
                                            style={{
                                                backgroundColor: hexColor,
                                                border: `1px solid ${hexColor}80`
                                            }}
                                        >
                                            {label.name}
                                            <button
                                                type="button"
                                                onClick={() => setSelectedLabels(selectedLabels.filter(l => l.id !== label.id))}
                                                className={`${textColor} opacity-80 cursor-pointer hover:opacity-100 transition-opacity`}
                                            >
                                                <FaTimes className="h-3 w-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Label search and selection */}
                        <div className="relative">
                            <div className="relative">
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                                    placeholder="Search or create label..."
                                    value={labelSearchTerm}
                                    onChange={(e) => {
                                        setLabelSearchTerm(e.target.value);
                                        setShowLabelSearchResults(true);
                                    }}
                                    onFocus={() => setShowLabelSearchResults(true)}
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400 dark:text-gray-500 text-sm" />
                                </div>

                                {/* Clear search button */}
                                {labelSearchTerm && (
                                    <button
                                        type='button'
                                        onClick={() => {
                                            setLabelSearchTerm('');
                                            setShowLabelSearchResults(false);
                                        }}
                                        className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {showLabelSearchResults && (
                                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                                    {filteredLabels.length > 0 ? (
                                        <>
                                            <ul className="py-1">
                                                {filteredLabels.map(label => {
                                                    const hexColor = label.color.startsWith('#') ? label.color : `#${label.color}`;

                                                    return (
                                                        <li
                                                            key={label.id}
                                                            className="px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                            onClick={() => {
                                                                setSelectedLabels([...selectedLabels, label]);
                                                                setLabelSearchTerm('');
                                                                setShowLabelSearchResults(false);
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {/* Color swatch */}
                                                                <div
                                                                    className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600 flex-shrink-0"
                                                                    style={{ backgroundColor: hexColor }}
                                                                />

                                                                {/* Label name and description */}
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                        {label.name}
                                                                    </p>
                                                                    {label.description && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                            {label.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                            {labelSearchTerm && !labels.some(l => l.name.toLowerCase() === labelSearchTerm.toLowerCase()) && (
                                                <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleCreateLabel}
                                                        className="w-full cursor-pointer flex items-center justify-between px-2 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors"
                                                    >
                                                        <span>Create "{labelSearchTerm}"</span>
                                                        <FaPlus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="p-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="mb-3 rounded-lg bg-gray-100 dark:bg-gray-700 p-2">
                                                    <FaTag className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 font-medium text-sm mb-2">
                                                    {labels.length > 0 ? 'No matching labels' : 'No labels found'}
                                                </p>
                                                {labelSearchTerm && (
                                                    <button
                                                        type="button"
                                                        onClick={handleCreateLabel}
                                                        className="w-full cursor-pointer py-2 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded transition-colors text-sm"
                                                    >
                                                        Create "{labelSearchTerm}"
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assignees */}
                    <div>
                        <TaskAssignments
                            isOpenForm={true}
                            pendingUsers={pendingUsers}
                            setPendingUsers={setPendingUsers}
                            compactMode={false} />
                    </div>

                    {/* Files */}
                    <div>
                        <TaskFiles
                            displayNoFileIfEmpty={isEdit}
                            canManageFiles={true}
                            selectedFiles={selectedFiles}
                            setSelectedFiles={setSelectedFiles}
                            project={null}
                        />
                    </div>

                    {isEdit && (
                        <SubtaskList
                            subtasks={formData.subtasks || []}
                            parentTaskId={taskId!}
                            onSubtaskUpdated={async () => {
                                // Refetch task data to update subtasks
                                const updatedTask = await fetchTask(taskId!, projectId!, authState.accessToken!);
                                setFormData(prev => ({
                                    ...prev,
                                    subtasks: updatedTask.subtasks || []
                                }));
                            }}
                            canManageTasks={true}
                            projectId={projectId!}
                            isParentTask={!formData.parentTaskId}
                            openFromEdit={true}
                            project={null}
                        />
                    )}
                </div>

                {error && (
                    <div className="mb-6 mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-2 sm:gap-2 justify-end sm:space-x-4">
                    <button type="button" onClick={() => navigate(-1)} className="px-4 cursor-pointer py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center">
                        <FaTimes className="mr-2" /> Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || hasOversizedFiles}
                        className={`px-6 py-2 rounded-lg font-medium shadow-sm flex items-center justify-center ${isLoading || hasOversizedFiles ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                            } ${hasOversizedFiles ?
                                'bg-gray-500 dark:bg-gray-600 text-white' :
                                'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white'
                            }`}
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : hasOversizedFiles ? (
                            <>
                                <FaExclamationTriangle className="mr-2 text-yellow-300" />
                                Remove oversized files to continue
                            </>
                        ) : (
                            <>
                                <FaSave className="mr-2" />
                                {isEdit ? 'Update Task' : 'Create Task'}
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Danger Zone Section */}
            {isEdit && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-red-200 dark:border-red-900/50 mt-8">
                    <div className="px-6 py-4 bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-900/50">
                        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 flex items-center">
                            <FaExclamationTriangle className="mr-2" /> Danger Zone
                        </h2>
                    </div>
                    <div className="px-6 py-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="mb-4 md:mb-0">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">Delete this task</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">This will permanently delete the task. This action cannot be undone.</p>
                            </div>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 cursor-pointer dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg font-medium flex items-center transition-colors"
                                disabled={isLoading}
                            >
                                <FaTrash className="mr-2" /> Delete Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog for Delete */}
            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => {
                    handleDeleteTask();
                    toast.success('Task deleted successfully!');
                }}
                title="Delete Task?"
                message="Are you sure you want to delete this task? This action cannot be undone."
                confirmText="Delete Task"
                confirmColor="red"
            />

            {/* Confirmation Dialog for completed status if there are incomplete subtasks */}
            <ConfirmationDialog
                isOpen={showStatusConfirm}
                onClose={() => setShowStatusConfirm(false)}
                onConfirm={handleConfirmStatusChange}
                title="Incomplete Subtasks"
                message="This task has incomplete subtasks. Are you sure you want to mark it as completed?"
                confirmText="Mark as Completed"
                confirmColor="indigo"
            />
        </div>
    );
};
