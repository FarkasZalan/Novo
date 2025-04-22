import { useState, useRef, useEffect } from "react";
import { FaUserPlus, FaExclamationTriangle, FaSearch, FaTimes, FaPlus, FaUser } from "react-icons/fa";
import { fetchAllRegisteredUsers } from "../../../../../services/userService";
import { addMembersToProject, getProjectMembers } from "../../../../../services/projectMemberService";
import { useAuth } from "../../../../../context/AuthContext";

interface User {
    id: string;
    name: string;
    email: string;
    is_registered: boolean;
}

interface SelectedUser extends User {
    role: "member" | "admin";
}

interface AddMemberModalProps {
    project: Project;
    onClose: () => void;
    onInvite: () => void;
}

export const AddMemberDialog = ({ project, onClose, onInvite }: AddMemberModalProps) => {
    const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
    const [manualEmail, setManualEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [potentialMembers, setPotentialMembers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    // New state: hold the IDs of users already in the project
    const [projectMemberIds, setProjectMemberIds] = useState<string[]>([]); // for active project members
    const [projectMemberEmails, setProjectMemberEmails] = useState<string[]>([]); // for pending project members
    const { authState } = useAuth();

    const modalRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const emailAlreadyInProject = projectMemberEmails.includes(manualEmail);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // Load registered users
    useEffect(() => {
        const loadUsers = async () => {
            try {
                setIsLoading(true);
                const users = await fetchAllRegisteredUsers();
                setPotentialMembers(users.map((user: any) => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    is_registered: true
                })));
            } catch (err) {
                console.error("Failed to load users:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadUsers();
    }, []);

    // Fetch project members and store their IDs for quick lookup
    useEffect(() => {
        const loadProjectMembers = async () => {
            try {
                const membersResponse = await getProjectMembers(project.id!, authState.accessToken!);
                // Assuming membersResponse is structured as: [ registeredMembersArray, invitedMembersArray ]
                const registeredMembers = membersResponse[0];
                const invitedMembers = membersResponse[1];

                // Extract IDs from registered members (from the nested user object)
                const registeredIds = registeredMembers.map((member: any) => member.user.id);
                setProjectMemberIds(registeredIds);

                // Extract emails from invited (pending) members
                const invitedEmails = invitedMembers.map((member: any) => member.email);
                setProjectMemberEmails(invitedEmails);
            } catch (error) {
                console.error("Error fetching project members:", error);
            }
        };
        loadProjectMembers();
    }, [project, authState]);

    const handleSubmit = async () => {
        const allEmails = selectedUsers.map(user => user.email);
        const roles = selectedUsers.map(user => user.role);
        const registeredStatus = selectedUsers.map(user => user.is_registered);

        if (manualEmail) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualEmail)) {
                setError("Please enter a valid email address");
                return;
            }
            allEmails.push(manualEmail);
            roles.push("member"); // manual users default to member
            registeredStatus.push(false);
        }

        if (allEmails.length === 0) {
            setError("Please select at least one user to invite");
            return;
        }

        setError(null);
        setIsSubmitting(true); // Start loading

        try {
            await addMembersToProject(
                project.id!,
                selectedUsers.map(user => ({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                })),
                authState.accessToken!,
                authState.user!.id
            );
            onInvite();
            onClose();
        } catch (error) {
            console.error("Failed to add members:", error);
            setError("Failed to send invitations. Please try again.");
        } finally {
            setIsSubmitting(false); // End loading
        }
    };

    const handleSelectUser = (user: User) => {
        // Prevent adding if the user is already in the project (either registered or invited)
        if (projectMemberIds.includes(user.id)) {
            return;
        }
        if (!selectedUsers.some(selected => selected.id === user.id)) {
            setSelectedUsers([...selectedUsers, { ...user, role: "member" }]);
        }
        resetSearch();
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
    };

    const handleAddManualEmail = () => {
        if (!manualEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualEmail)) {
            setError("Please enter a valid email address");
            return;
        }

        if (selectedUsers.some(user => user.email === manualEmail)) {
            setError("This email is already selected");
            return;
        }

        setSelectedUsers([...selectedUsers, {
            id: '',
            name: manualEmail.split('@')[0],
            email: manualEmail,
            is_registered: false,
            role: "member"
        }]);
        resetSearch();
    };

    const resetSearch = () => {
        setSearchQuery("");
        setManualEmail("");
        setShowSearchResults(false);
        searchInputRef.current?.focus();
    };

    // Filter potential members based on search while excluding those already selected.
    const filteredUsers = potentialMembers.filter(user =>
        !selectedUsers.some(selected => selected.id === user.id) &&
        (searchQuery || manualEmail) &&
        (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const hasValidEmail = manualEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualEmail);
    const showEmailOption = hasValidEmail && !selectedUsers.some(u => u.email === manualEmail);

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 px-2 sm:px-4 py-4 overflow-y-auto">
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-xl sm:max-w-2xl mx-auto"
            >
                {/* Header */}
                <div className="px-4 py-4 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Add Team Members</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Invite members to collaborate on {project.name}
                    </p>
                </div>

                {/* Main Content */}
                <div className="px-4 py-4 sm:px-6 sm:py-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg flex items-center">
                            <FaExclamationTriangle className="mr-2" />
                            {error}
                        </div>
                    )}

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedUsers.map(user => (
                                <div key={user.id} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full pl-3 pr-2 py-1 flex items-center text-sm">
                                    <span className="flex items-center">
                                        <span className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-medium text-xs mr-2">
                                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </span>
                                        {user.email}
                                    </span>
                                    {/* Editable role badge with pencil icon */}
                                    <select
                                        value={user.role}
                                        onChange={(e) =>
                                            setSelectedUsers(prev =>
                                                prev.map(u =>
                                                    u.id === user.id ? { ...u, role: e.target.value as "member" | "admin" } : u
                                                )
                                            )
                                        }
                                        className="ml-2 text-xs px-2 py-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                                    >
                                        <option value="member" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">Member</option>
                                        <option value="admin" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">Admin</option>
                                    </select>
                                    {/* Badge for unregistered users */}
                                    {!user.is_registered && (
                                        <span className="ml-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-1 rounded">
                                            Invite
                                        </span>
                                    )}
                                    <button
                                        onClick={() => handleRemoveUser(user.id)}
                                        className="ml-1 h-5 w-5 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 flex items-center justify-center"
                                    >
                                        <FaTimes size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Search Input */}
                    <div className="relative mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Search Users or Enter Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery || manualEmail}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setManualEmail(value);
                                    setSearchQuery(value);
                                    setShowSearchResults(true);
                                    setError(null);
                                }}
                                onFocus={() => setShowSearchResults(true)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Search users or enter email address"
                            />

                            <button
                                onClick={resetSearch}
                                className="absolute inset-y-0 right-0 pr-3 cursor-pointer flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                <FaTimes />
                            </button>

                        </div>

                        {/* Search Results */}
                        {showSearchResults && (searchQuery || manualEmail) && (
                            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-50 overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-4 text-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                                    </div>
                                ) : filteredUsers.length > 0 ? (
                                    <ul className="py-1">
                                        {filteredUsers.map(user => {
                                            const alreadyRegistered = projectMemberIds.includes(user.id);
                                            const alreadyPending = !user.is_registered && projectMemberEmails.includes(user.email);
                                            const alreadyInProject = alreadyRegistered || alreadyPending;

                                            return (
                                                <li
                                                    key={user.id || user.email}
                                                    className={`px-4 py-2 flex items-center ${alreadyInProject
                                                        ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                                                        : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                                        }`}
                                                    onClick={() => {
                                                        if (!alreadyInProject) {
                                                            handleSelectUser(user);
                                                        }
                                                    }}
                                                >
                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-medium text-sm mr-3">
                                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium dark:text-white">{user.name}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                                    </div>
                                                    {alreadyInProject ? (
                                                        <span className="text-xs bg-gray-200 dark:bg-gray-500 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                                                            Already in project
                                                        </span>
                                                    ) : user.is_registered ? (
                                                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                                            Registered
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                                                            Unregistered
                                                        </span>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <div className="p-6 text-center">
                                        {showEmailOption ? (
                                            <div className="flex flex-col items-center">
                                                <div className="mb-3 rounded-full bg-indigo-50 dark:bg-indigo-900/30 p-2">
                                                    <FaUser className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded mb-3 w-full">
                                                    <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">{manualEmail}</p>
                                                </div>
                                                <button
                                                    onClick={handleAddManualEmail}
                                                    disabled={emailAlreadyInProject}
                                                    className="w-full py-2 px-4 cursor-pointer bg-indigo-600 text-white rounded transition-colors flex items-center justify-center space-x-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <FaPlus className="h-3 w-3" />
                                                    <span>
                                                        {emailAlreadyInProject ? "Already in project" : "Add User"}
                                                    </span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center py-2">
                                                <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-3 mb-3">
                                                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 font-medium">No users found</p>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-4 sm:px-6 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                    <div className="text-sm text-gray-500 dark:text-gray-300 self-center text-center sm:text-left">
                        {selectedUsers.length > 0 && `${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''} selected`}
                    </div>
                    <div className="flex justify-center sm:justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 cursor-pointer dark:border-gray-600 rounded-lg dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={selectedUsers.length === 0 && !manualEmail || isSubmitting}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 cursor-pointer dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-gray-100 text-white rounded-lg font-medium flex items-center disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <FaUserPlus className="mr-2" />
                                    Send Invitation{selectedUsers.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
