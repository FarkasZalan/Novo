import { FaUserMinus, FaTimes, FaUserPlus, FaChevronDown } from "react-icons/fa";
import ProjectMember from "../../../../../types/projectMember";
import { useState } from "react";
import { updateProjectMemberRole, resendProjectInvite } from "../../../../../services/projectMemberService";
import toast from "react-hot-toast";

interface MembersTabProps {
    project: Project;
    members: ProjectMember[];
    membersLoading: boolean;
    membersError: string | null;
    authState: AuthState;
    handleRemoveMember: (memberId: string) => void;
    setShowAddMember: (show: boolean) => void;
}

export const MembersTab = ({
    project,
    members,
    membersLoading,
    membersError,
    authState,
    handleRemoveMember,
    setShowAddMember,
}: MembersTabProps) => {
    // State to track which member's role dropdown is open
    const [openRoleDropdown, setOpenRoleDropdown] = useState<string | null>(null);
    // State to track if a role change is in progress
    const [changingRole, setChangingRole] = useState<string | null>(null);
    // State to track resending invites
    const [resendingInvite, setResendingInvite] = useState<string | null>(null);

    // Find owner details - if owner is current user, use authState, otherwise find from members
    const isCurrentUserOwner = project.owner_id === authState.user?.id;

    // Check if current user is an admin
    const currentUserMember = members.find(m => m.id === authState.user?.id);
    const isCurrentUserAdmin = currentUserMember?.role === 'admin';

    // Check if user has permission to manage members (owner or admin)
    const canManageMembers = isCurrentUserOwner || isCurrentUserAdmin;

    // Find the owner's data from members if it's not the current user
    const ownerData = isCurrentUserOwner
        ? {
            id: authState.user?.id,
            name: authState.user?.name || 'Unknown Owner',
            status: 'active'
        }
        : members.find(m => m.id === project.owner_id) || {
            id: project.owner_id,
            name: 'Project Owner',
            status: 'active'
        };

    // Filter non-owner members
    const nonOwnerMembers = members.filter(member => member.id !== project.owner_id);

    // Handle role change
    const handleRoleChange = async (memberId: string, newRole: string) => {
        if (!authState.user?.id || !authState.accessToken) return;

        setChangingRole(memberId);
        try {
            await updateProjectMemberRole(
                project.id!,
                memberId,
                authState.user.id,
                newRole,
                authState.accessToken
            );

            // Update local state to reflect the change
            members.forEach(member => {
                if (member.id === memberId) {
                    member.role = newRole;
                }
            });

            toast.success(`User role updated to ${newRole}`);
        } catch (error) {
            console.error("Failed to update role:", error);
            toast.error("Failed to update user role");
        } finally {
            setChangingRole(null);
            setOpenRoleDropdown(null);
        }
    };

    // Handle resend invite
    const handleResendInvite = async (memberId: string) => {
        if (!authState.user?.id || !authState.accessToken) return;

        setResendingInvite(memberId);
        try {
            await resendProjectInvite(
                project.id!,
                memberId,
                authState.user.id,
                authState.accessToken
            );
            toast.success("Invitation resent successfully");
        } catch (error) {
            console.error("Failed to resend invitation:", error);
            toast.error("Failed to resend invitation");
        } finally {
            setResendingInvite(null);
        }
    };

    // Toggle role dropdown
    const toggleRoleDropdown = (memberId: string) => {
        if (openRoleDropdown === memberId) {
            setOpenRoleDropdown(null);
        } else {
            setOpenRoleDropdown(memberId);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Team Members

                    <span className="ml-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
                        {members.length} {members.length === 1 ? 'member' : 'members'}
                    </span>
                </h2>
                {canManageMembers && (
                    <button
                        onClick={() => setShowAddMember(true)}
                        className="px-4 py-2 bg-indigo-600 cursor-pointer hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 flex items-center cursor-pointer"
                    >
                        <FaUserPlus className="mr-2" />
                        Add Member
                    </button>
                )}
            </div>

            {/* Loading state */}
            {membersLoading && (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            )}

            {/* Error state */}
            {membersError && (
                <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
                    {membersError}
                </div>
            )}

            {/* Members List */}
            <div className="space-y-4">
                {/* Owner section - always show the owner */}
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                                {ownerData.name ? (
                                    ownerData.name
                                        .split(' ')
                                        .map((n: string) => n[0])
                                        .join('')
                                        .toUpperCase()
                                ) : 'OW'}
                            </div>
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-800"></span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                {ownerData.name} {isCurrentUserOwner ? "(You)" : ""}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Owner</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center">
                        <span className="mr-1">Owner</span>
                    </span>
                </div>

                {/* Current user (if not owner) */}
                {!isCurrentUserOwner && authState.user && (
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                    {authState.user.name ? (
                                        authState.user.name
                                            .split(' ')
                                            .map((n: string) => n[0])
                                            .join('')
                                            .toUpperCase()
                                    ) : 'US'}
                                </div>
                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-800"></span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {authState.user.name} (You)
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {isCurrentUserAdmin ? 'Admin' : 'Member'}
                                </p>
                            </div>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 flex items-center">
                            <span className="mr-1">You</span>
                        </span>
                    </div>
                )}

                {/* Other Members (excluding owner and current user) */}
                {nonOwnerMembers
                    .filter(member => member.id !== authState.user?.id)
                    .map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                        {member?.name ? (
                                            member.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()
                                        ) : 'US'}
                                    </div>
                                    <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${member.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                                        } ring-2 ring-white dark:ring-gray-800`}></span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {member.role === 'admin' ? 'Admin' : 'Member'}
                                    </p>
                                    {member.status === 'pending' && (
                                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                                            Pending Invitation
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Controls for active members */}
                            {canManageMembers && (
                                <div className="flex space-x-3 items-center">
                                    {/* Modern Role selector dropdown */}
                                    {member.status !== 'pending' && (
                                        <div className="relative">
                                            <button
                                                onClick={() => toggleRoleDropdown(member.id)}
                                                disabled={changingRole === member.id}
                                                className={`flex items-center justify-between gap-2 px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${changingRole === member.id
                                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 cursor-pointer'
                                                    }`}
                                            >
                                                {changingRole === member.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="animate-spin h-3 w-3 border-2 border-indigo-500 dark:border-indigo-400 border-b-transparent rounded-full"></div>
                                                        <span>Updating...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="capitalize">{member.role}</span>
                                                        <FaChevronDown className={`h-3 w-3 transition-transform ${openRoleDropdown === member.id ? 'transform rotate-180' : ''
                                                            }`} />
                                                    </>
                                                )}
                                            </button>

                                            {/* Modern Dropdown menu */}
                                            {openRoleDropdown === member.id && (
                                                <div className="absolute right-0 z-20 mt-1 w-40 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => handleRoleChange(member.id, 'member')}
                                                            className={`w-full text-left px-3 py-2 text-sm flex items-center cursor-pointer ${member.role === 'member'
                                                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300'
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                                } transition-colors duration-150`}
                                                        >
                                                            {member.role === 'member' && (
                                                                <span className="w-1 h-4 bg-indigo-600 dark:bg-indigo-400 rounded-full mr-2"></span>
                                                            )}
                                                            Member
                                                        </button>
                                                        <button
                                                            onClick={() => handleRoleChange(member.id, 'admin')}
                                                            className={`w-full text-left px-3 py-2 text-sm flex items-center cursor-pointer ${member.role === 'admin'
                                                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300'
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                                } transition-colors duration-150`}
                                                        >
                                                            {member.role === 'admin' && (
                                                                <span className="w-1 h-4 bg-indigo-600 dark:bg-indigo-400 rounded-full mr-2"></span>
                                                            )}
                                                            Admin
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Remove button */}
                                    {member.status === 'pending' ? (
                                        <div className="flex space-x-2">
                                            <button
                                                className="p-2 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                onClick={() => handleResendInvite(member.id)}
                                                title="Resend invitation"
                                                disabled={resendingInvite === member.id}
                                            >
                                                {resendingInvite === member.id ? (
                                                    <div className="animate-spin h-4 w-4 border-2 border-gray-400 dark:border-gray-200 border-b-transparent rounded-full"></div>
                                                ) : (
                                                    <FaUserPlus className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                className="p-2 text-red-400 cursor-pointer hover:text-red-600 dark:hover:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                                onClick={() => handleRemoveMember(member.id)}
                                                title="Cancel invitation"
                                            >
                                                <FaTimes className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="p-2 text-red-500 cursor-pointer hover:text-red-700 dark:hover:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                            onClick={() => handleRemoveMember(member.id)}
                                            title="Remove member"
                                        >
                                            <FaUserMinus className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
};