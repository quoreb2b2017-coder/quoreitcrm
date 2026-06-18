'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// Custom SVG Icons Component
const Icons = {
  Cookie: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 2a8 8 0 108 8 8 8 0 00-8-8zm2 3a1 1 0 11-2 0 1 1 0 012 0zm-3 2a1 1 0 11-2 0 1 1 0 012 0zm-1 3a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
  ),
  Shield: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Globe: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  Settings: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Eye: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  CheckCircle: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ExclamationTriangle: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  DocumentText: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  UserGroup: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
};

const CookiesLegalPage = () => {
  const [activeTab, setActiveTab] = useState('cookies');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cookieConsent, setCookieConsent] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tabs = [
    { id: 'cookies', label: 'Cookies Policy', icon: <Icons.Cookie className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy Rights', icon: <Icons.Shield className="w-5 h-5" /> },
    { id: 'legal', label: 'Legal Notice', icon: <Icons.DocumentText className="w-5 h-5" /> }
  ];

  const cookieTypes = [
    {
      title: 'Essential Cookies',
      icon: <Icons.Shield className="w-6 h-6" />,
      color: 'from-red-500 to-red-600',
      description: 'Required for basic site functionality, security, and authentication.',
      status: 'Always Active'
    },
    {
      title: 'Performance Cookies',
      icon: <Icons.Eye className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      description: 'Collect anonymous data on site usage to help us improve performance.',
      status: 'Optional'
    },
    {
      title: 'Functional Cookies',
      icon: <Icons.Settings className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      description: 'Remember your preferences and settings for a tailored experience.',
      status: 'Optional'
    },
    {
      title: 'Analytics & Marketing Cookies',
      icon: <Icons.Globe className="w-6 h-6" />,
      color: 'from-[#00d8a6] to-[#00b894]',
      description: 'Track user behavior, measure campaign effectiveness, and deliver relevant ads.',
      status: 'Optional'
    }
  ];

  const privacyRights = [
    {
      title: 'Access & Portability',
      description: 'Request a copy of the personal data we hold about you.',
      icon: <Icons.DocumentText className="w-5 h-5" />
    },
    {
      title: 'Correction & Updates',
      description: 'Ask us to correct inaccurate or incomplete information.',
      icon: <Icons.Settings className="w-5 h-5" />
    },
    {
      title: 'Deletion (Right to be Forgotten)',
      description: 'Request that we erase your data when it\'s no longer needed.',
      icon: <Icons.ExclamationTriangle className="w-5 h-5" />
    },
    {
      title: 'Withdraw Consent',
      description: 'Opt out of marketing emails, cookies, or other consent-based processing at any time.',
      icon: <Icons.Shield className="w-5 h-5" />
    },
    {
      title: 'Opt-Out of Sale/Sharing (CCPA Users)',
      description: 'Ask us not to sell or share your personal data.',
      icon: <Icons.UserGroup className="w-5 h-5" />
    },
    {
      title: 'Data Restriction',
      description: 'Limit how we use or process your information.',
      icon: <Icons.Eye className="w-5 h-5" />
    }
  ];

  return (
    <>
      <Head>
        <title>Cookies & Legal Notice | Quore IT LLC</title>
        <meta name="description" content="Learn about our cookies policy, privacy rights, and legal compliance at Quore IT LLC." />
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
        <section className="relative bg-gradient-to-br from-[#00d8a6] via-[#00b894] to-[#009a80] text-white overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute top-40 right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            </div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <Icons.Cookie className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Icons.Shield className="w-3 h-3 text-yellow-800" />
                  </div>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Cookies & Legal Notice
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
                Your privacy matters to us. Learn how <span className="font-semibold">Quore IT LLC</span> uses cookies 
                and protects your data in compliance with global privacy regulations.
              </p>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 py-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-[#00d8a6] text-white shadow-lg shadow-[#00d8a6]/25'
                      : 'text-gray-600 hover:text-[#00d8a6] hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          
          {/* Cookies Policy Tab */}
          {activeTab === 'cookies' && (
            <div className="space-y-8">
              
              {/* Introduction Card */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#00d8a6] to-[#00b894] p-8 text-white">
                  <h2 className="text-3xl font-bold mb-4">Cookies Policy</h2>
                  <p className="text-white/90 text-lg">
                    Quore IT LLC ("we," "our," or "us") uses cookies and similar technologies to enhance user experience, 
                    analyze site performance, and support marketing campaigns.
                  </p>
                </div>
                <div className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Icons.Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">What Are Cookies?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Cookies are small text files stored on your device when you visit a website. They enable us to 
                        recognize your device, remember your preferences, and deliver a more personalized browsing experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cookie Types Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {cookieTypes.map((cookie, index) => (
                  <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-2">
                    <div className={`h-2 bg-gradient-to-r ${cookie.color}`}></div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl bg-gradient-to-r ${cookie.color} text-white`}>
                            {cookie.icon}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{cookie.title}</h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          cookie.status === 'Always Active' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {cookie.status}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{cookie.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Managing Cookies */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl border-l-4 border-[#00d8a6] p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#00d8a6] rounded-full flex items-center justify-center">
                    <Icons.Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Icons.CheckCircle className="w-5 h-5 text-[#00d8a6] mt-1 flex-shrink-0" />
                        <p className="text-gray-700">You can adjust your browser settings to accept, block, or delete cookies.</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Icons.CheckCircle className="w-5 h-5 text-[#00d8a6] mt-1 flex-shrink-0" />
                        <p className="text-gray-700">Our site may provide a cookie banner where you can accept or manage consent choices.</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Icons.ExclamationTriangle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <p className="text-gray-700">If you disable cookies, some parts of the website may not function properly.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Rights Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-8">
              
              {/* Privacy Rights Header */}
              <div className="text-center bg-white rounded-3xl shadow-xl p-12">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#00d8a6] to-[#00b894] rounded-full flex items-center justify-center">
                    <Icons.Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Privacy Rights at a Glance</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  At Quore IT LLC, we respect your privacy and comply with global data protection laws. 
                  Depending on where you live, you may have the following rights:
                </p>
              </div>

              {/* Rights Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {privacyRights.map((right, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#00d8a6] to-[#00b894] rounded-full flex items-center justify-center">
                        {right.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{right.title}</h3>
                        <p className="text-gray-600 text-sm">{right.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-[#00d8a6]">
                      <Icons.CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Available</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compliance Sections */}
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* GDPR */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                    <h3 className="text-lg font-semibold">GDPR (EU/EEA Users)</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <p className="text-gray-700 text-sm">You have the right to access, correct, delete, or restrict the processing of your personal data.</p>
                    <p className="text-gray-700 text-sm">You may withdraw consent for cookies or marketing communications at any time.</p>
                    <p className="text-gray-700 text-sm">We process data only with a lawful basis (consent, contract, legal obligation, or legitimate interest).</p>
                  </div>
                </div>

                {/* CCPA */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                    <h3 className="text-lg font-semibold">CCPA (California Users)</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <p className="text-gray-700 text-sm">You have the right to know what personal information we collect and how we use it.</p>
                    <p className="text-gray-700 text-sm">You may request that we delete your data, subject to applicable exceptions.</p>
                    <p className="text-gray-700 text-sm">You have the right to opt out of the sale or sharing of your personal information.</p>
                    <p className="text-gray-700 text-sm">We will not discriminate against you for exercising your CCPA rights.</p>
                  </div>
                </div>

                {/* DPDP Act India */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
                    <h3 className="text-lg font-semibold">DPDP Act, 2023 (India)</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <p className="text-gray-700 text-sm">We collect and process personal data lawfully, with notice and consent where required.</p>
                    <p className="text-gray-700 text-sm">Individuals have the right to request correction, erasure, or access to their data.</p>
                    <p className="text-gray-700 text-sm">Sensitive personal data (if any) is handled with enhanced safeguards.</p>
                    <p className="text-gray-700 text-sm">Data is retained only as long as necessary to fulfill the purpose for which it was collected.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legal Notice Tab */}
          {activeTab === 'legal' && (
            <div className="space-y-8">
              
              {/* Legal Disclaimer Header */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 text-white">
                  <h2 className="text-3xl font-bold mb-4">Legal Disclaimer</h2>
                  <p className="text-white/90 text-lg">
                    Important legal information regarding the use of our website and services.
                  </p>
                </div>
              </div>

              {/* Legal Items */}
              <div className="grid gap-6">
                
                {/* Information Accuracy */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <Icons.ExclamationTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Information Accuracy</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Content on this website is for general information only. While we strive for accuracy, 
                        Quore IT LLC does not guarantee completeness or suitability.
                      </p>
                    </div>
                  </div>
                </div>

                {/* No Liability */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                      <Icons.Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">No Liability</h3>
                      <p className="text-gray-700 leading-relaxed">
                        We are not liable for any direct, indirect, or consequential damages from your use of this website.
                      </p>
                    </div>
                  </div>
                </div>

                {/* External Links */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Icons.Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">External Links</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Our site may link to third-party websites. We are not responsible for their content, policies, or practices.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Intellectual Property */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Icons.DocumentText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Intellectual Property</h3>
                      <p className="text-gray-700 leading-relaxed">
                        All site content including text, graphics, logos, and trademarks belongs to or is licensed by Quore IT LLC. 
                        Unauthorized use is prohibited.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Jurisdiction */}
                <div className="bg-gradient-to-r from-[#00d8a6]/10 to-[#00b894]/10 rounded-2xl border-2 border-[#00d8a6]/30 p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#00d8a6] to-[#00b894] rounded-full flex items-center justify-center">
                      <Icons.Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Jurisdiction</h3>
                      <p className="text-gray-700 leading-relaxed">
                        These terms are governed by and construed under the laws of India. 
                        For international clients, applicable local data protection laws shall also apply.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact CTA */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl text-white p-12 text-center mt-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-[#00d8a6] rounded-full">
                <Icons.UserGroup className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-4">Need Help with Privacy or Legal Questions?</h3>
            <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
              Our team is here to help you understand your rights and how we protect your data.
            </p>
            <a
              href="mailto:contactus@quoreit.com"
              className="inline-flex items-center px-8 py-4 bg-[#00d8a6] text-white font-semibold rounded-full hover:bg-[#00b894] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Icons.DocumentText className="w-5 h-5 mr-2" />
              Contact Our Legal Team
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiesLegalPage;
