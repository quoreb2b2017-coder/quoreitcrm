'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// Custom SVG Icons Component
const Icons = {
  ChevronDown: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  ChevronUp: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ),
  Scale: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  Envelope: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
};

const TermsOfUse = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <>
      <Head>
        <title>Terms of Use | Quore IT LLC</title>
        <meta name="description" content="Terms of Use for Quore IT LLC website and services." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#00d8a6] to-[#00b894] transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00d8a6]/20 to-transparent"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-[#00d8a6] rounded-full shadow-lg">
                  <Icons.Scale className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Terms of Use</h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Welcome to <span className="text-[#00d8a6] font-semibold">Quore IT LLC</span>. 
                By accessing or using our website, services, or content, you agree to be bound by these Terms of Use ("Terms"). Please read them carefully.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          
          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <p className="text-gray-700 text-lg leading-relaxed">
              If you do not agree to these Terms, you should not use our website or services.
            </p>
          </div>

          {/* Terms Sections */}
          <div className="space-y-6">
            
            {/* Section 1 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('section1')}
                className="w-full p-8 text-left focus:outline-none focus:ring-2 focus:ring-[#00d8a6]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">1. Use of Website and Services</h2>
                  {expandedSections['section1'] ? (
                    <Icons.ChevronUp className="w-6 h-6 text-[#00d8a6]" />
                  ) : (
                    <Icons.ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSections['section1'] && (
                <div className="px-8 pb-8">
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <p className="text-gray-700 leading-relaxed">You may use our website and services solely for lawful purposes and in compliance with these Terms.</p>
                    <p className="text-gray-700 leading-relaxed">You agree not to misuse our website, attempt to gain unauthorized access, or engage in any activity that could disrupt or damage our systems.</p>
                    <p className="text-gray-700 leading-relaxed">Any content provided on this website is for informational purposes only and should not be considered professional advice.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('section2')}
                className="w-full p-8 text-left focus:outline-none focus:ring-2 focus:ring-[#00d8a6]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">2. Intellectual Property</h2>
                  {expandedSections['section2'] ? (
                    <Icons.ChevronUp className="w-6 h-6 text-[#00d8a6]" />
                  ) : (
                    <Icons.ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSections['section2'] && (
                <div className="px-8 pb-8">
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <p className="text-gray-700 leading-relaxed">All content on this website—including text, graphics, logos, images, and software—is the property of Quore IT LLC or its licensors and is protected by intellectual property laws.</p>
                    <p className="text-gray-700 leading-relaxed">You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent.</p>
                    <p className="text-gray-700 leading-relaxed">You are granted a limited, non-exclusive, non-transferable license to access and use the website for personal or business informational purposes only.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('section3')}
                className="w-full p-8 text-left focus:outline-none focus:ring-2 focus:ring-[#00d8a6]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">3. User Contributions</h2>
                  {expandedSections['section3'] ? (
                    <Icons.ChevronUp className="w-6 h-6 text-[#00d8a6]" />
                  ) : (
                    <Icons.ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSections['section3'] && (
                <div className="px-8 pb-8">
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <p className="text-gray-700 leading-relaxed">If you submit information, materials, or feedback to Quore IT (for example, through a form, job application, or email), you grant us the right to use that information for business purposes, consistent with our Privacy Policy.</p>
                    <p className="text-gray-700 leading-relaxed">You are responsible for ensuring that any content you provide is accurate, lawful, and does not infringe the rights of third parties.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('section4')}
                className="w-full p-8 text-left focus:outline-none focus:ring-2 focus:ring-[#00d8a6]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">4. Career and Job Application Services</h2>
                  {expandedSections['section4'] ? (
                    <Icons.ChevronUp className="w-6 h-6 text-[#00d8a6]" />
                  ) : (
                    <Icons.ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSections['section4'] && (
                <div className="px-8 pb-8">
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <p className="text-gray-700 leading-relaxed">Quore IT may provide job listings, career resources, and online application tools through this website.</p>
                    <p className="text-gray-700 leading-relaxed">By submitting your resume, application, or other job-related information, you authorize Quore IT to use, process, store, and share your information for recruitment and placement purposes.</p>
                    <p className="text-gray-700 leading-relaxed">We may share your application details with our clients and partners in connection with potential job opportunities, in accordance with our <span className="text-[#00d8a6] font-medium">Privacy Policy</span>.</p>
                    <p className="text-gray-700 leading-relaxed">Quore IT does not guarantee job placement or continued employment for candidates using our career services.</p>
                    <p className="text-gray-700 leading-relaxed">You are responsible for ensuring the accuracy of all information you submit. False, misleading, or incomplete applications may result in rejection or termination of employment opportunities.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 5 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('section5')}
                className="w-full p-8 text-left focus:outline-none focus:ring-2 focus:ring-[#00d8a6]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">5. Privacy</h2>
                  {expandedSections['section5'] ? (
                    <Icons.ChevronUp className="w-6 h-6 text-[#00d8a6]" />
                  ) : (
                    <Icons.ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSections['section5'] && (
                <div className="px-8 pb-8">
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-gray-700 leading-relaxed">Your use of our website and services is also governed by our <span className="text-[#00d8a6] font-medium">Privacy Policy</span>. Please review it to understand how we collect, use, and safeguard your information.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 6 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('section6')}
                className="w-full p-8 text-left focus:outline-none focus:ring-2 focus:ring-[#00d8a6]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">6. Disclaimer of Warranties</h2>
                  {expandedSections['section6'] ? (
                    <Icons.ChevronUp className="w-6 h-6 text-[#00d8a6]" />
                  ) : (
                    <Icons.ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSections['section6'] && (
                <div className="px-8 pb-8">
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <p className="text-gray-700 leading-relaxed">The website and its content are provided on an "as-is" and "as-available" basis.</p>
                    <p className="text-gray-700 leading-relaxed">Quore IT makes no warranties, express or implied, regarding the accuracy, reliability, or availability of the website or its content.</p>
                    <p className="text-gray-700 leading-relaxed">We disclaim all warranties of merchantability, fitness for a particular purpose, and non-infringement to the maximum extent permitted by law.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 7 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('section7')}
                className="w-full p-8 text-left focus:outline-none focus:ring-2 focus:ring-[#00d8a6]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">7. Limitation of Liability</h2>
                  {expandedSections['section7'] ? (
                    <Icons.ChevronUp className="w-6 h-6 text-[#00d8a6]" />
                  ) : (
                    <Icons.ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSections['section7'] && (
                <div className="px-8 pb-8">
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <p className="text-gray-700 leading-relaxed">To the fullest extent permitted by law, Quore IT shall not be liable for any damages arising out of or related to your use of the website or services, including but not limited to direct, indirect, incidental, consequential, or punitive damages.</p>
                    <p className="text-gray-700 leading-relaxed">This includes damages resulting from errors, interruptions, loss of data, or unauthorized access.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 8 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('section8')}
                className="w-full p-8 text-left focus:outline-none focus:ring-2 focus:ring-[#00d8a6]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">8. Third-Party Links</h2>
                  {expandedSections['section8'] ? (
                    <Icons.ChevronUp className="w-6 h-6 text-[#00d8a6]" />
                  ) : (
                    <Icons.ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSections['section8'] && (
                <div className="px-8 pb-8">
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <p className="text-gray-700 leading-relaxed">Our website may contain links to third-party websites or services for your convenience.</p>
                    <p className="text-gray-700 leading-relaxed">Quore IT does not endorse and is not responsible for the content, policies, or practices of any third-party sites. Accessing them is at your own risk.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 9 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('section9')}
                className="w-full p-8 text-left focus:outline-none focus:ring-2 focus:ring-[#00d8a6]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">9. Changes to Terms</h2>
                  {expandedSections['section9'] ? (
                    <Icons.ChevronUp className="w-6 h-6 text-[#00d8a6]" />
                  ) : (
                    <Icons.ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSections['section9'] && (
                <div className="px-8 pb-8">
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <p className="text-gray-700 leading-relaxed">Quore IT may update these Terms of Use from time to time. Updates will be effective immediately upon posting on this page.</p>
                    <p className="text-gray-700 leading-relaxed">Continued use of our website after changes are posted constitutes your acceptance of the revised Terms.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 10 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('section10')}
                className="w-full p-8 text-left focus:outline-none focus:ring-2 focus:ring-[#00d8a6]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">10. Governing Law</h2>
                  {expandedSections['section10'] ? (
                    <Icons.ChevronUp className="w-6 h-6 text-[#00d8a6]" />
                  ) : (
                    <Icons.ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSections['section10'] && (
                <div className="px-8 pb-8">
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <p className="text-gray-700 leading-relaxed">These Terms shall be governed by and construed in accordance with the laws of the Commonwealth of Virginia, without regard to conflict of law principles.</p>
                    <p className="text-gray-700 leading-relaxed">Any disputes arising from your use of the website or services shall be subject to the exclusive jurisdiction of the state and federal courts located in Virginia.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 11 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('section11')}
                className="w-full p-8 text-left focus:outline-none focus:ring-2 focus:ring-[#00d8a6]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">11. Contact Us</h2>
                  {expandedSections['section11'] ? (
                    <Icons.ChevronUp className="w-6 h-6 text-[#00d8a6]" />
                  ) : (
                    <Icons.ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSections['section11'] && (
                <div className="px-8 pb-8">
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-gray-700 leading-relaxed">
                      If you have any questions about these Terms of Use, please contact us:{' '}
                      <a href="mailto:contactus@quoreit.com" className="text-[#00d8a6] hover:text-[#00b894] font-medium">
                        contactus@quoreit.com
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Candidate Disclaimer */}
            <div className="bg-gradient-to-r from-[#00d8a6]/10 to-[#00b894]/10 rounded-2xl border-2 border-[#00d8a6]/30 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Candidate Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                By submitting your application, resume, or any related information to Quore IT LLC ("Quore IT"), you acknowledge and agree to the following:
              </p>
              
              <div className="space-y-4">
                <div className="bg-white/70 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Use of Information:</h3>
                  <p className="text-gray-700">Your information may be collected, stored, processed, and shared with Quore IT clients and partners strictly for recruitment and placement purposes.</p>
                </div>
                
                <div className="bg-white/70 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">No Employment Guarantee:</h3>
                  <p className="text-gray-700">Submitting an application or resume does not guarantee a job offer, interview, or continued employment.</p>
                </div>
                
                <div className="bg-white/70 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Accuracy of Information:</h3>
                  <p className="text-gray-700">You are responsible for ensuring all information you provide is accurate, complete, and not misleading. False or incomplete information may result in rejection of your application.</p>
                </div>
                
                <div className="bg-white/70 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Privacy:</h3>
                  <p className="text-gray-700">Your data will be handled in accordance with our <span className="text-[#00d8a6] font-medium">Privacy Policy</span>. Quore IT will not sell or rent your personal information to third parties.</p>
                </div>
                
                <div className="bg-white/70 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Withdrawal of Consent:</h3>
                  <p className="text-gray-700">
                    You may request at any time that we stop using your information by contacting us at{' '}
                    <a href="mailto:contactus@quoreit.com" className="text-[#00d8a6] hover:text-[#00b894] font-medium">
                      contactus@quoreit.com
                    </a>
                    . However, this may affect our ability to consider you for opportunities.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-white p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-[#00d8a6] rounded-full">
                  <Icons.Envelope className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Questions About These Terms?</h3>
              <p className="text-gray-300 mb-6">
                If you have any questions about these Terms of Use, please don't hesitate to contact us.
              </p>
              <a
                href="mailto:contactus@quoreit.com"
                className="inline-flex items-center px-8 py-3 bg-[#00d8a6] text-white font-semibold rounded-full hover:bg-[#00b894] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Icons.Envelope className="w-5 h-5 mr-2" />
                contactus@quoreit.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfUse;
