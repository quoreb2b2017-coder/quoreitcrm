'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Shield, Eye, Lock, Users, FileText, Phone, Mail, MapPin, Calendar, Check, ArrowUp } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      
      // Update active section based on scroll position
      const sections = ['information', 'access', 'security', 'rights', 'children', 'updates'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 150;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const tableOfContents = [
    { id: 'information', title: 'Information We Collect', icon: FileText },
    { id: 'access', title: 'Your Access & Control', icon: Eye },
    { id: 'security', title: 'Security Measures', icon: Lock },
    { id: 'rights', title: 'Your Rights', icon: Users },
    { id: 'children', title: 'Children\'s Privacy', icon: Shield },
    { id: 'updates', title: 'Policy Updates', icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header Hero Section */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00d8a6]/10 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#00d8a6] to-emerald-400 rounded-2xl mb-6 shadow-2xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your privacy is our priority. Learn how Quore IT LLC protects and manages your personal information with complete transparency and care.
            </p>
            <div className="mt-8 flex items-center justify-center text-sm text-gray-400">
              <Calendar className="w-4 h-4 mr-2" />
              Last Updated: September 25, 2025
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 mb-12 lg:mb-0">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-[#00d8a6]" />
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  {tableOfContents.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left flex items-center p-3 rounded-xl transition-all duration-200 ${
                          activeSection === item.id
                            ? 'bg-gradient-to-r from-[#00d8a6] to-emerald-400 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-[#00d8a6]/5 hover:text-[#00d8a6]'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        <span className="text-sm font-medium">{item.title}</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Company Info Card */}
              <div className="mt-6 bg-gradient-to-br from-[#00d8a6]/5 to-emerald-50 rounded-2xl p-6 border border-[#00d8a6]/10">
                <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-[#00d8a6] mr-2 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Quore IT LLC</div>
                      <div className="text-gray-600">539 W Commerce St #2577<br />Dallas, TX 75208</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-[#00d8a6] mr-2" />
                    <a href="mailto:contactus@quoreit.com" className="text-[#00d8a6] hover:text-emerald-600 transition-colors">
                      contactus@quoreit.com
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-[#00d8a6] mr-2" />
                    <a href="tel:332-231-0404" className="text-[#00d8a6] hover:text-emerald-600 transition-colors">
                      332-231-0404
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Introduction */}
              <div className="p-8 border-b border-gray-100">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    At <span className="font-semibold text-[#00d8a6]">Quore IT LLC</span> ("Quore IT," "we," "us," or "our"), we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our services. By accessing our website or engaging with our services, you acknowledge that you have read and understood this Privacy Policy.
                  </p>
                </div>
              </div>

              {/* Section 1: Information We Collect */}
              <section id="information" className="p-8 border-b border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#00d8a6] to-emerald-400 rounded-xl mr-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
                </div>

                <div className="space-y-8">
                  {/* Personal Information */}
                  <div className="bg-gradient-to-r from-[#00d8a6]/5 to-emerald-50 rounded-xl p-6 border border-[#00d8a6]/10">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="w-5 h-5 text-[#00d8a6] mr-2" />
                      1.1 Personal Information
                    </h3>
                    <div className="space-y-4 text-gray-700">
                      <p>We may collect personal details that you voluntarily provide to us, such as your name, email address, phone number, or other contact information.</p>
                      
                      <div className="bg-white rounded-lg p-4 border border-[#00d8a6]/20">
                        <div className="flex items-start">
                          <Check className="w-5 h-5 text-[#00d8a6] mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">Data Ownership & Usage</p>
                            <p className="text-gray-600 mt-1">Quore IT is the sole owner of the information collected on this site. We only access information that you choose to share with us through email, forms, or direct communication. We do not sell or rent this information to anyone.</p>
                          </div>
                        </div>
                      </div>

                      <p>We use your information strictly to respond to your inquiries and the reasons for which you contacted us. We will not share your personal information with any third party outside of our organization.</p>
                      <p>In addition, we may use your information to inform you in the future about opportunities, services, or products that may be relevant to you. Any updates to this Privacy Policy will be reflected directly on this webpage.</p>
                    </div>
                  </div>

                  {/* Log Data and Cookies */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Eye className="w-5 h-5 text-[#00d8a6] mr-2" />
                      1.2 Log Data and Cookies
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <p className="text-gray-700 mb-4">When you visit our website, we automatically collect certain information such as:</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <ul className="space-y-2">
                          <li className="flex items-center text-gray-600">
                            <div className="w-2 h-2 bg-[#00d8a6] rounded-full mr-3"></div>
                            IP address
                          </li>
                          <li className="flex items-center text-gray-600">
                            <div className="w-2 h-2 bg-[#00d8a6] rounded-full mr-3"></div>
                            Browser type
                          </li>
                          <li className="flex items-center text-gray-600">
                            <div className="w-2 h-2 bg-[#00d8a6] rounded-full mr-3"></div>
                            Operating system
                          </li>
                        </ul>
                        <ul className="space-y-2">
                          <li className="flex items-center text-gray-600">
                            <div className="w-2 h-2 bg-[#00d8a6] rounded-full mr-3"></div>
                            Referring URLs
                          </li>
                          <li className="flex items-center text-gray-600">
                            <div className="w-2 h-2 bg-[#00d8a6] rounded-full mr-3"></div>
                            Pages viewed
                          </li>
                          <li className="flex items-center text-gray-600">
                            <div className="w-2 h-2 bg-[#00d8a6] rounded-full mr-3"></div>
                            Visit timestamps
                          </li>
                        </ul>
                      </div>
                      <p className="text-gray-700 mt-4">We may also use cookies and similar technologies to improve your browsing experience, understand usage patterns, and tailor our content to your preferences.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Your Access to and Control Over Information */}
              <section id="access" className="p-8 border-b border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#00d8a6] to-emerald-400 rounded-xl mr-4">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Access to and Control Over Information</h2>
                </div>

                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <p className="text-gray-700 mb-4">You may opt out of any future communications from us at any time. Please note that by opting out, you may no longer receive updates on new opportunities, services, or products.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">At any time, you may:</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        'Request to see what information we have about you, if any',
                        'Ask us to correct or update your information',
                        'Request that we delete your information from our records',
                        'Share any concerns about how we are using your data'
                      ].map((item, index) => (
                        <div key={index} className="flex items-start bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <Check className="w-5 h-5 text-[#00d8a6] mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#00d8a6]/5 rounded-xl p-6 border border-[#00d8a6]/10">
                    <p className="text-gray-700">To exercise these rights, you can contact us via the email address or phone number listed on our website. Once we receive your request, it will be routed to the appropriate manager to ensure it is handled promptly and in accordance with this policy.</p>
                  </div>
                </div>
              </section>

              {/* Section 3: Security */}
              <section id="security" className="p-8 border-b border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#00d8a6] to-emerald-400 rounded-xl mr-4">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Security</h2>
                </div>

                <div className="space-y-6">
                  <p className="text-gray-700 text-lg">We take data protection seriously. Access to personal information is limited only to employees who need it to perform their job functions (for example, billing or customer service).</p>
                  
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-start">
                      <Shield className="w-6 h-6 text-red-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Secure Environment</h4>
                        <p className="text-gray-700">The systems and servers where personal information is stored are maintained in a secure environment to protect against unauthorized access.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Your Rights */}
              <section id="rights" className="p-8 border-b border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#00d8a6] to-emerald-400 rounded-xl mr-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
                </div>

                <div className="bg-[#00d8a6]/5 rounded-xl p-6 border border-[#00d8a6]/10">
                  <p className="text-gray-700 text-lg mb-4">You have the right to access, update, correct, or delete your personal information at any time.</p>
                  <p className="text-gray-700">To exercise these rights, please reach out to us using the contact details provided below. We aim to respond to all requests within a reasonable timeframe.</p>
                </div>
              </section>

              {/* Section 5: Children's Privacy */}
              <section id="children" className="p-8 border-b border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#00d8a6] to-emerald-400 rounded-xl mr-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Children's Privacy</h2>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700 text-lg">Our website and services are not intended for individuals under the age of 18. We do not knowingly collect personal data from children.</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <p className="text-gray-700">If you believe a child has provided us with personal information, please contact us immediately, and we will take steps to delete that information from our systems.</p>
                  </div>
                </div>
              </section>

              {/* Section 6: Updates to This Privacy Policy */}
              <section id="updates" className="p-8">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#00d8a6] to-emerald-400 rounded-xl mr-4">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Updates to This Privacy Policy</h2>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700 text-lg">We may update this Privacy Policy periodically. Any changes will take effect immediately upon posting the revised policy on our website.</p>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <p className="text-gray-700">We encourage you to review this page regularly to stay informed of any updates. Continued use of our website or services after changes are posted indicates your acceptance of those changes.</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Contact Section */}
            <div className="mt-12 bg-gradient-to-r from-[#00d8a6] to-emerald-400 rounded-2xl text-white overflow-hidden shadow-2xl">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Mail className="w-6 h-6 mr-3" />
                  Contact Us
                </h2>
                <p className="text-white/90 mb-6 text-lg">
                  If you have questions or concerns about this Privacy Policy or how we handle your personal information, please contact us at:
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <MapPin className="w-5 h-5 mb-2" />
                    <div className="text-sm">
                      <div className="font-semibold">Address</div>
                      <div className="text-white/80">539 W Commerce St #2577<br />Dallas, TX 75208</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <Mail className="w-5 h-5 mb-2" />
                    <div className="text-sm">
                      <div className="font-semibold">Email</div>
                      <a href="mailto:contactus@quoreit.com" className="text-white/80 hover:text-white transition-colors">
                        contactus@quoreit.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <Phone className="w-5 h-5 mb-2" />
                    <div className="text-sm">
                      <div className="font-semibold">Phone</div>
                      <a href="tel:332-231-0404" className="text-white/80 hover:text-white transition-colors">
                        332-231-0404
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default PrivacyPolicyPage;
