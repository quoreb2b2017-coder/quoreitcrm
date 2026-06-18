'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// Custom SVG Icons Component
const Icons = {
  Shield: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Ban: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  Eye: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Users: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  CheckCircle: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Search: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  AcademicCap: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7a2 2 0 01-1.4-1.4L9.4 18.4a1 1 0 00-.7-.4H7.4a1 1 0 01-.7-.3L6 17V5l1.4-1.4a1 1 0 01.7-.3h1.3a1 1 0 00.7-.4L12 2l1.2 1.3a1 1 0 00.7.4h1.3a1 1 0 01.7.3L18 5v12l-.7.7a1 1 0 01-.7.3h-1.3a1 1 0 00-.7.4L12 21v-7z" />
    </svg>
  ),
  SpeakerPhone: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10v18H6V4z" />
    </svg>
  ),
  ClipboardCheck: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Heart: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
};

const ModernSlaveryPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const principles = [
    {
      title: 'Zero Tolerance',
      description: 'We do not tolerate slavery, bonded labor, child labor, or human trafficking in any form.',
      icon: <Icons.Ban className="w-6 h-6" />
    },
    {
      title: 'Ethical Sourcing',
      description: 'We work only with partners, suppliers, and contractors who share our commitment to ethical and lawful practices.',
      icon: <Icons.Users className="w-6 h-6" />
    },
    {
      title: 'Transparency',
      description: 'We are committed to being transparent about the steps we take to prevent modern slavery and will regularly review our policies and processes.',
      icon: <Icons.Eye className="w-6 h-6" />
    },
    {
      title: 'Accountability',
      description: 'All employees, partners, and vendors are expected to comply with our Code of Conduct and Modern Slavery Policy.',
      icon: <Icons.Shield className="w-6 h-6" />
    }
  ];

  const actions = [
    {
      title: 'Supplier Due Diligence',
      description: 'Conduct background checks and compliance reviews before onboarding vendors or data partners.',
      icon: <Icons.Search className="w-6 h-6" />
    },
    {
      title: 'Employee Awareness',
      description: 'Provide training to staff to recognize and report risks related to modern slavery.',
      icon: <Icons.AcademicCap className="w-6 h-6" />
    },
    {
      title: 'Whistleblowing Mechanism',
      description: 'Maintain safe and confidential reporting channels for concerns related to exploitation or unethical practices.',
      icon: <Icons.SpeakerPhone className="w-6 h-6" />
    },
    {
      title: 'Regular Audits',
      description: 'Review our operations and supply chain to ensure alignment with international labor standards.',
      icon: <Icons.ClipboardCheck className="w-6 h-6" />
    }
  ];

  return (
    <>
      <Head>
        <title>Modern Slavery: Our Ethical Commitment | Quore IT LLC</title>
        <meta name="description" content="Learn about Quore IT LLC's commitment to preventing modern slavery and human trafficking in our operations and supply chains." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#00d8a6] to-[#00b894] transition-all duration-300 "
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="min-h-screen bg-gray-50">
        
        {/* Header Section */}
        <section className="relative bg-white border-b border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#00d8a6] to-[#00b894] rounded-2xl flex items-center justify-center shadow-lg">
                  <Icons.Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 max-w-4xl mx-auto leading-tight">
                Modern Slavery: Our Ethical Commitment
              </h1>
              <div className="w-24 h-1 bg-[#00d8a6] mx-auto mb-6"></div>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                At Quore IT LLC, we are committed to conducting business with integrity, transparency, and respect for human rights.
              </p>
            </div>
          </div>
        </section>

        {/* Introduction Statement */}
        <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xl md:text-2xl text-white leading-relaxed">
              We recognize that modern slavery, human trafficking, and forced labor remain global challenges, and we take a{' '}
              <span className="text-[#00d8a6] font-semibold">zero-tolerance approach</span>{' '}
              toward any form of exploitation within our operations or supply chains.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Our Principles Section */}
          <section className="py-20">
            <div 
              id="principles" 
              data-animate
              className={`transition-all duration-1000 ${
                isVisible.principles ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Principles</h2>
                <div className="w-20 h-1 bg-[#00d8a6] mx-auto"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {principles.map((principle, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#00d8a6] to-[#00b894] rounded-xl flex items-center justify-center text-white">
                        {principle.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{principle.title}</h3>
                        <p className="text-gray-700 leading-relaxed">{principle.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Our Actions Section */}
          <section className="py-20 bg-gradient-to-r from-gray-50 to-white rounded-3xl mb-20">
            <div 
              id="actions" 
              data-animate
              className={`px-8 lg:px-12 transition-all duration-1000 ${
                isVisible.actions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Actions</h2>
                <div className="w-20 h-1 bg-[#00d8a6] mx-auto"></div>
              </div>

              <div className="space-y-8">
                {actions.map((action, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-xl shadow-md border border-gray-100 p-6 lg:p-8 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-r from-[#00d8a6] to-[#00b894] rounded-2xl flex items-center justify-center text-white shadow-lg">
                          {action.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{action.title}</h3>
                        <p className="text-gray-700 leading-relaxed text-lg">{action.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Our Commitment Section */}
          <section className="py-20">
            <div 
              id="commitment" 
              data-animate
              className={`transition-all duration-1000 ${
                isVisible.commitment ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="bg-gradient-to-r from-[#00d8a6] to-[#00b894] rounded-3xl text-white p-12 lg:p-16 text-center">
                <div className="flex justify-center mb-8">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Icons.Heart className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-8">Our Commitment</h2>
                
                <div className="max-w-4xl mx-auto space-y-6">
                  <p className="text-xl md:text-2xl leading-relaxed opacity-95">
                    We are dedicated to building a responsible and sustainable business that respects the dignity and rights of all individuals.
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed opacity-90">
                    By working closely with our employees, clients, and partners, we strive to ensure that modern slavery has no place in our business or industry.
                  </p>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                    <Icons.CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Ethical Business Practices</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                    <Icons.Shield className="w-5 h-5" />
                    <span className="font-medium">Zero Tolerance Policy</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                    <Icons.Eye className="w-5 h-5" />
                    <span className="font-medium">Full Transparency</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Call to Action Footer */}
        <section className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#00d8a6] rounded-full flex items-center justify-center">
                <Icons.SpeakerPhone className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Report Concerns Confidentially</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              If you have concerns about modern slavery or unethical practices, we encourage you to speak up through our confidential reporting channels.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="mailto:ethics@quoreit.com" 
                className="inline-flex items-center px-8 py-3 bg-[#00d8a6] text-white font-semibold rounded-full hover:bg-[#00b894] transition-all duration-300 shadow-lg"
              >
                <Icons.Shield className="w-5 h-5 mr-2" />
                ethics@quoreit.com
              </a>
              <div className="inline-flex items-center px-8 py-3 bg-gray-800 text-gray-300 font-semibold rounded-full border border-gray-700">
                <Icons.CheckCircle className="w-5 h-5 mr-2 text-[#00d8a6]" />
                100% Confidential
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ModernSlaveryPage;
