import { Link } from "react-router-dom";

export const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <Link to="/" className="inline-block">
                        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Novo</h1>
                    </Link>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 md:p-12">
                    <div className="prose dark:prose-invert max-w-none">
                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Introduction</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Welcome to Novo Task Manager ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Information We Collect</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We may collect the following types of information when you use our services:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                <li><strong>Personal Information:</strong> Name, email address, and contact details when you register</li>
                                <li><strong>Usage Data:</strong> Information about how you interact with our platform</li>
                                <li><strong>Device Information:</strong> IP address, browser type, and operating system</li>
                                <li><strong>Cookies:</strong> We use cookies to enhance your experience (you can manage preferences)</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We use the collected information for various purposes:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                <li>To provide and maintain our service</li>
                                <li>To notify you about changes to our service</li>
                                <li>To allow you to participate in interactive features</li>
                                <li>To provide customer support</li>
                                <li>To gather analysis or valuable information for improvement</li>
                                <li>To monitor usage of our service</li>
                                <li>To detect, prevent, and address technical issues</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Data Sharing and Disclosure</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We may share your information in the following situations:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                <li><strong>Service Providers:</strong> With third-party vendors who perform services for us</li>
                                <li><strong>Business Transfers:</strong> In connection with any merger or sale of company assets</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                            </ul>
                            <p className="text-gray-600 dark:text-gray-300">
                                We do not sell your personal information to third parties.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Data Security</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We implement appropriate technical and organizational measures to protect your personal data. However, no internet transmission or electronic storage is 100% secure, so we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Your Data Protection Rights</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Depending on your location, you may have certain rights regarding your personal information:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                <li>The right to access, update, or delete your information</li>
                                <li>The right to rectification if your information is inaccurate</li>
                                <li>The right to object to our processing of your data</li>
                                <li>The right to request restriction of processing</li>
                                <li>The right to data portability</li>
                                <li>The right to withdraw consent</li>
                            </ul>
                            <p className="text-gray-600 dark:text-gray-300">
                                To exercise these rights, please contact us at <a href="mailto:farkaszalan2001@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">farkaszalan2001@gmail.com</a>.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Children's Privacy</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will delete it immediately.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Changes to This Policy</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Contact Us</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:farkaszalan2001@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">farkaszalan2001@gmail.com</a>.
                            </p>
                        </section>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};