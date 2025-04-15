import { FaUserMinus, FaTimes, FaUserPlus } from "react-icons/fa";
import ProjectMember from "../../../../../types/projectMember";

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
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Team Members</h2>
                <button
                    onClick={() => setShowAddMember(true)}
                    className="px-4 py-2 bg-indigo-600 cursor-pointer hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 flex items-center"
                >
                    <FaUserPlus className="mr-2" />
                    Add Member
                </button>
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
                {/* Owner section - only show if the current user is the owner */}
                {project.owner_id === authState.user?.id && (
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                                    {authState.user?.name ? (
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
                                    {authState.user?.name} (You)
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Owner</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center">
                            <span className="mr-1">Owner</span>
                        </span>
                    </div>
                )}

                {/* Other Members */}
                {members.map((member) => (
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
                        {member.status === 'pending' ? (
                            <div className="flex space-x-2">
                                <button
                                    className="p-2 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700"
                                    onClick={() => { }}
                                    title="Resend invitation"
                                >
                                    <FaUserPlus className="w-4 h-4" />
                                </button>
                                <button
                                    className="p-2 text-red-400 cursor-pointer hover:text-red-600 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => {
                                        handleRemoveMember(member.id)
                                    }}
                                    title="Cancel invitation"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                className="p-2 text-red-500 hover:text-red-700 cursor-pointer dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => handleRemoveMember(member.id)}
                                title="Remove member"
                            >
                                <FaUserMinus className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};