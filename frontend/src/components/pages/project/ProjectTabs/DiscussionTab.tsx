import { FaRegComment, FaPaperclip } from "react-icons/fa";

interface DiscussionsTabProps {
    authState: AuthState;
}

export const DiscussionsTab = ({ authState }: DiscussionsTabProps) => {
    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Discussions</h2>

            {/* New Discussion */}
            <div className="mb-6">
                <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                            {authState.user?.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .toUpperCase()}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <form>
                            <div>
                                <label htmlFor="comment" className="sr-only">Comment</label>
                                <textarea
                                    id="comment"
                                    name="comment"
                                    rows={3}
                                    className="shadow-sm py-2 px-4 block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                    placeholder="Start a discussion..."
                                    defaultValue={''}
                                />
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        className="p-2 text-gray-400 cursor-pointer hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <FaPaperclip className="h-5 w-5" />
                                        <span className="sr-only">Attach file</span>
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex items-center cursor-pointer px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <FaRegComment className="mr-2" />
                                    Comment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Discussion List */}
            <div className="space-y-6">
                {[1, 2].map((discussion) => (
                    <div key={discussion} className="flex space-x-3">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                {['JD', 'SJ'][discussion - 1]}
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {['John Doe', 'Sarah Johnson'][discussion - 1]}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {['2 hours ago', '1 day ago'][discussion - 1]}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                    {discussion === 1
                                        ? "I've completed the initial design mockups for the homepage. Let me know what you think!"
                                        : "The API endpoints for the user dashboard are now ready for frontend integration."}
                                </p>
                                <div className="mt-3 flex items-center space-x-3">
                                    <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                        Reply
                                    </button>
                                    <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                        Like
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};