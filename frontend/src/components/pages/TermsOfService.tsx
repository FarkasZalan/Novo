import { Link } from "react-router-dom";

export const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <Link to="/" className="inline-block">
                        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Novo</h1>
                    </Link>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 md:p-12">
                    <div className="prose dark:prose-invert max-w-none">
                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                By accessing or using the Novo Task Manager ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Description of Service</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Novo Task Manager is a project management and collaboration tool that allows users to organize tasks, manage projects, and collaborate with team members.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. User Accounts</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                To use certain features of the Service, you must register for an account. You agree to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                <li>Provide accurate, current, and complete information</li>
                                <li>Maintain the security of your password and accept all risks of unauthorized access</li>
                                <li>Notify us immediately if you discover or suspect any security breaches</li>
                                <li>Be responsible for all activities that occur under your account</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. User Responsibilities</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                You agree not to use the Service to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                <li>Upload or share any content that is unlawful, harmful, or infringes on intellectual property rights</li>
                                <li>Transmit any viruses, malware, or other harmful code</li>
                                <li>Attempt to gain unauthorized access to the Service or its related systems</li>
                                <li>Use the Service for any illegal or unauthorized purpose</li>
                                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Intellectual Property</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                The Service and its original content, features, and functionality are owned by Novo and are protected by international copyright, trademark, and other intellectual property laws.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                You retain ownership of any content you upload to the Service, but you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content for the purpose of providing the Service.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Payment and Subscription Terms</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                If you choose a paid subscription plan:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                <li>You agree to pay all applicable fees</li>
                                <li>Fees are non-refundable except as required by law</li>
                                <li>We may change the fees with 30 days notice</li>
                                <li>Your subscription will automatically renew unless canceled</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Termination</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including if you breach these Terms.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                Upon termination, your right to use the Service will immediately cease. All provisions of these Terms which should survive termination will survive.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Disclaimer of Warranties</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Limitation of Liability</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                In no event shall Novo, nor its directors, employees, or agents, be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the Service.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Governing Law</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                These Terms shall be governed by and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Changes to Terms</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We reserve the right to modify these Terms at any time. We will provide notice of any changes by posting the new Terms on this page and updating the "Effective Date."
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                Your continued use of the Service after any changes constitutes your acceptance of the new Terms.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Contact Information</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                If you have any questions about these Terms, please contact us at <a href="mailto:farkaszalan2001@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">farkaszalan2001@gmail.com</a>.
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