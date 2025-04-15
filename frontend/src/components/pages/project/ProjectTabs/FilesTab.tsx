import { FaPaperclip, FaEllipsisV } from "react-icons/fa";

export const FilesTab = () => {
    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Files</h2>

            {/* File Upload */}
            <div className="mb-6">
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors duration-200">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOCX, XLSX, JPG, PNG (MAX. 10MB)</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" />
                    </label>
                </div>
            </div>

            {/* Files List */}
            <div className="space-y-4">
                {[1, 2, 3].map((file) => (
                    <div key={file} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
                                <FaPaperclip className="text-xl" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {['Project_Brief.pdf', 'Design_Mockups.zip', 'User_Research.docx'][file - 1]}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {['2.4 MB', '5.7 MB', '1.2 MB'][file - 1]} · Uploaded by {['John Doe', 'Sarah Johnson', 'Michael Chen'][file - 1]} · {['2 days ago', '1 week ago', '3 weeks ago'][file - 1]}
                                </p>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <FaEllipsisV />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};