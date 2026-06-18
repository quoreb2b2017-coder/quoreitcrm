
"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useState } from 'react';

const GovernmentServicesPage = () => {
  const [hoveredSide, setHoveredSide] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    service: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const services = [
    {
      id: 'cloud-consulting',
      title: 'Cloud Consulting',
      description: 'Whether an organization is looking to build, move or store their data, Seneca\'s cloud engineers are well versed in the development of cloud infrastructures and data migrations.',
      image: '/images/it13.png',
      alt: 'Team of professionals collaborating on cloud computing solutions',
      reverse: false
    },
    {
      id: 'data-science',
      title: 'Data Science Consulting',
      description: 'Our teams are fluent in Machine Learning, Artificial Intelligence, and Deep Learning technologies to meet your most pressing analytics needs. We\'ll partner with you to interrogate your data and find crucial business insights.',
      image: '/images/it14.png',
      alt: 'Data science team analyzing information on tablets and devices',
      reverse: true
    },
    {
      id: 'app-mobile',
      title: 'App/Mobile Development',
      description: 'We\'re fluent in the intricacies of all major mobile OS platforms as well as the latest dev tools and APKs. This means you can leverage the unique features of any mobile device or OS to your advantage.',
      image: '/images/it15.png',
      alt: 'Development team working on mobile applications',
      reverse: false
    },
    {
      id: 'agile-training',
      title: 'Agile Training',
      description: 'Our engineers help organizations Design, Develop, Deploy and Operate mission critical IT systems through organizational collaboration and continuous enhancements to IT systems and applications.',
      image: '/images/it16.png',
      alt: 'Team members participating in agile training and collaboration',
      reverse: true
    }
  ];

  const serviceOptions = [
    'Defense & Intelligence',
    'Federal Civilian, Homeland, & Justice',
    'Federal Health',
    'State, Local & Education'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: '2c1b7668-e873-404a-9759-f85af53e550b',
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          subject: 'New Government Service Inquiry from Website',
          from_name: 'Quore IT Government Services'
        })
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        setSubmitMessage('Thank you for your submission! Our team will reach out to you within 24 hours.');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          service: ''
        });
        setTimeout(() => {
          setShowModal(false);
          setSubmitMessage('');
          setIsSuccess(false);
        }, 3000);
      } else {
        setIsSuccess(false);
        setSubmitMessage('Something went wrong. Please try again later.');
      }
    } catch (error) {
      setIsSuccess(false);
      setSubmitMessage('Network error. Please try again later.');
    }

    setIsSubmitting(false);
  };

  const openModal = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSubmitMessage('');
    setIsSuccess(false);
  };

  return (
    <>
      <Head>
        <title>Government IT Staffing & Compliance Solutions – Quore IT</title>
        <meta
          name="description"
          content="Quore IT provides compliant, high-security IT staffing for government agencies. Specialized in defense, health, and federal civilian sectors with Section 508 adherence."
        />
        <meta name="keywords" content="government IT staffing, defense recruitment, federal health IT, compliance staffing, Section 508 IT, Quore IT government services" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Modal Form with Semi-transparent Background */}
        {showModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative z-60"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Get Started Today</h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-semibold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    ×
                  </button>
                </div>

                {submitMessage && (
                  <div className={`p-3 rounded-lg mb-4 text-sm ${isSuccess ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    {submitMessage}
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d9a6] focus:border-transparent outline-none transition-all duration-300 text-sm"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d9a6] focus:border-transparent outline-none transition-all duration-300 text-sm"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d9a6] focus:border-transparent outline-none transition-all duration-300 text-sm"
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d9a6] focus:border-transparent outline-none transition-all duration-300 text-sm"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Choose Service *
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d9a6] focus:border-transparent outline-none transition-all duration-300 bg-white text-sm"
                    >
                      <option value="">Select a service</option>
                      {serviceOptions.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#00d9a6] to-cyan-500 hover:from-[#00d9a6] hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-sm"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Enhanced Professional Hero Section */}
        <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 overflow-hidden">
          {/* Refined Background Elements */}
          <div className="absolute inset-0">
            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 217, 166, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 166, 0.08) 1px, transparent 1px)`,
                  backgroundSize: '60px 60px',
                }}
              />
            </div>

            {/* Professional Geometric Shapes */}
            <div className="absolute top-32 left-16 w-80 h-80 bg-gradient-to-r from-[#00d9a6]/5 to-[#00D9A6]/5 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-20 w-96 h-96 bg-gradient-to-l from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 left-1/3 w-64 h-64 bg-gradient-to-tr from-emerald-400/4 to-teal-400/4 rounded-full blur-2xl"></div>

            {/* Elegant Lines */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00d9a6]/20 to-transparent"></div>
              <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00D9A6]/15 to-transparent"></div>
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center min-h-[70vh]">

              {/* Refined Left Content */}
              <motion.div
                className="lg:col-span-6 text-white space-y-8"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Main Heading with Professional Typography */}
                <h1 className="text-4xl sm:text-5xl lg:text-4xl xl:text-4xl font-bold leading-[1.0] tracking-tight">
                  Quore IT{' '}
                  <span className="relative inline-block">
                    <span className="text-transparent bg-clip-text bg-white">
                      Government Solutions
                    </span>
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#00d9a6] to-[#00D9A6] rounded-full transform scale-x-0 animate-scale-x"></div>
                  </span>
                </h1>

                {/* Enhanced Professional Description */}
                <motion.div
                  className="space-y-6 text-lg lg:text-xl max-w-2xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <div className="relative pl-6 border-l-4 border-gradient-to-b from-[#00d9a6] to-[#00D9A6]">
                    <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#00d9a6] to-[#00D9A6] rounded-full"></div>
                    <p className="font-semibold text-gray-200 leading-[1.2]">
                      Navigating compliance with ease - trusted IT staffing for government projects.
                    </p>
                  </div>

                  <p className="text-gray-300 leading-[1.2] text-justify font-light" style={{ wordSpacing: '' }}>
                    At Quore IT, we recognize that staffing for government services comes with unique challenges strict regulations, compliance requirements, and high expectations for reliability. Our team is equipped to navigate these complexities seamlessly, helping you build trusted IT teams quickly and efficiently. With a people-first approach and proven expertise, we deliver talent that empowers government projects to succeed.
                  </p>
                </motion.div>

                {/* Professional CTA Button */}
                <motion.div
                  className="pt-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <a href="/open-jobs" target="_blank" rel="noopener noreferrer">
                    <button
                      className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#00d9a6] to-[#00D9A6] text-gray-900 font-semibold rounded-xl hover:shadow-2xl hover:shadow-[#00d9a6]/20 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
                    >
                      <span className="relative z-10 text-lg">Get Started Today</span>
                      <svg className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </a>
                </motion.div>
              </motion.div>

              {/* Professional Right Image Section */}
              <motion.div
                className="lg:col-span-6 relative"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Elegant Background Decorations */}
                <div className="absolute -inset-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00d9a6]/8 to-[#00D9A6]/8 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"></div>
                </div>

                {/* Professional Image Container */}
                <motion.div
                  className="relative group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {/* Glass Morphism Container */}
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-6 backdrop-blur-xl border border-white/20 shadow-2xl">
                    {/* Subtle Inner Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00d9a6]/5 via-transparent to-[#00D9A6]/5 rounded-3xl"></div>

                    {/* Main Image */}
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent z-10"></div>
                      <Image
                        src="/images/government-services-staffing.webp"
                        alt="Professional government services team collaborating"
                        width={700}
                        height={500}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                        loading="eager"
                      />
                    </div>

                    {/* Professional UI Elements */}
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-[#00d9a6] to-[#00D9A6] rounded-2xl p-4 shadow-xl">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-gray-900 font-semibold text-xs">Live Support</span>
                      </div>
                    </div>

                    <div className="absolute -bottom-4 -left-4 bg-white/95 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white shadow-lg"></div>
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full border-2 border-white shadow-lg"></div>
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-2 border-white shadow-lg"></div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-900">Expert Team</div>
                          <div className="text-xs text-gray-600">Ready to Help</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subtle Decorative Elements */}
                  <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-[#00d9a6] to-[#00D9A6] rounded-full opacity-60 animate-pulse"></div>
                  <div className="absolute -bottom-3 -right-3 w-4 h-4 bg-gradient-to-br from-[#00D9A6] to-[#00d9a6] rounded-full opacity-40"></div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Government Services Section - Enhanced */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Defense & Intel Section - Enhanced */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative order-2 lg:order-1">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10"></div>
                  <Image
                    src="/images/defense-and-intelligence.webp"
                    alt="Quore IT Defense & Intelligence recruitment - Specialized talent for secure government projects"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="space-y-6 order-1 lg:order-2">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-[1.0]">Defense & Intelligence</h3>
                <p className="text-lg text-gray-600 leading-[1.2] text-justify" style={{ wordSpacing: '-1px' }}>
                  We support defense and intelligence organizations with end-to-end technology expertise and skilled talent. Our capabilities span Enterprise IT, full-spectrum Software engineering, ERP platforms (SAP and Oracle), Systems Engineering and Administration, Application Development, Data Analytics, Cloud Computing, and Cybersecurity. We deliver the right professionals to strengthen mission readiness and ensure secure, efficient operations.
                </p>
                <a href="/open-jobs" target="_blank" rel="noopener noreferrer">
                  <button
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00D9A6] to-[#00d9a6] text-gray-900 font-semibold rounded-xl hover:shadow-xl hover:shadow-green-200 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-green-200 transform hover:scale-105 hover:-translate-y-1"
                    aria-label="Get started with Defense & Intel services"
                  >
                    GET STARTED
                    <svg className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </a>
              </div>
            </motion.div>

            {/* Federal Civilian, Homeland, & Justice Section - Enhanced */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-[1.0]">
                  Federal Civilian, Homeland, & Justice
                </h3>
                <p className="text-lg text-gray-600 leading-[1.2] text-justify" style={{ wordSpacing: '-1px' }}>
                  We bring proven expertise in supporting the IT and workforce needs of large government organizations. We partner with federal civilian agencies, homeland security, and justice departments to deliver a wide range of tailored solutions. From Data Analysis and Cybersecurity to Application Development, Project Management, ETL Engineering, and Quality Assurance. We provide skilled professionals who help government initiatives run efficiently, securely, and with measurable impact.
                </p>
                <a href="/open-jobs" target="_blank" rel="noopener noreferrer">
                  <button
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00D9A6] to-[#00d9a6] text-gray-900 font-semibold rounded-xl hover:shadow-xl hover:shadow-green-200 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-green-200 transform hover:scale-105 hover:-translate-y-1"
                    aria-label="Get started with Federal Civilian, Homeland & Justice services"
                  >
                    GET STARTED
                    <svg className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </a>
              </div>

              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10"></div>
                  <Image
                    src="/images/federal-homeland-just.webp"
                    alt="Federal civilian employees working on homeland security and justice projects"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>

            {/* Federal Health Section - Enhanced */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative order-2 lg:order-1">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10"></div>
                  <Image
                    src="/images/fed-health.webp"
                    alt="Healthcare professional working with advanced medical technology"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="space-y-6 order-1 lg:order-2">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-[1.0]">Federal Health</h3>
                <p className="text-lg text-gray-600 leading-[1.2] text-justify" style={{ wordSpacing: '-1px' }}>
                  We provide support, planning, implementation, transitioning, operating and maintenance expertise to keep health initiatives running smoothly. From maintaining CMS applications to providing support Cloud Computing Services for Infrastructure as a Service (IaaS) and scalable Cloud based Platform as a Service (PaaS) applications.
                </p>
                <a href="/open-jobs" target="_blank" rel="noopener noreferrer">
                  <button
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00D9A6] to-[#00d9a6] text-gray-900 font-semibold rounded-xl hover:shadow-xl hover:shadow-green-200 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-green-200 transform hover:scale-105 hover:-translate-y-1"
                    aria-label="Get started with Federal Health services"
                  >
                    GET STARTED
                    <svg className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </a>
              </div>
            </motion.div>

            {/* State, Local & Education Section - Enhanced */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-12"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-[1.0]">
                  State, Local & Education
                </h3>
                <p className="text-lg text-gray-600 leading-[1.2] text-justify" style={{ wordSpacing: '-1px' }}>
                  State and local governments, as well as educational institutions, face constantly evolving challenges that demand agility and innovation. Quore IT partners with SLED organizations to strengthen their capabilities through scalable talent solutions and specialized expertise. From Project and Program Management to Cybersecurity, Data science, Application Development, and beyond. We provide the skilled professionals needed to drive efficiency, security, and long-term impact.
                </p>
                <a href="/open-jobs" target="_blank" rel="noopener noreferrer">
                  <button
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00D9A6] to-[#00d9a6] text-gray-900 font-semibold rounded-xl hover:shadow-xl hover:shadow-green-200 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-green-200 transform hover:scale-105 hover:-translate-y-1"
                    aria-label="Get started with State, Local & Education services"
                  >
                    GET STARTED
                    <svg className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </a>
              </div>

              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10"></div>
                  <Image
                    src="/images/state-local-ed.webp"
                    alt="State and local government officials collaborating"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Compliance Section - Enhanced */}
        <section className="bg-gradient-to-r from-gray-50 to-slate-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center max-w-6xl mx-auto bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <p className="text-lg text-gray-700 leading-[1.2] text-justify" style={{ wordSpacing: '-1px' }}>
                When working with the government and their agencies, Quore IT Resources assures that all
                employees are fully compliant with state and federal regulations, including{' '}
                <Link
                  href="https://www.section508.gov/manage/laws-and-policies/"
                  className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 transition-colors duration-200 font-medium"
                  aria-label="Learn more about Section 508 compliance"
                >
                  Section 508 of the Rehabilitation Act
                </Link>
                {' '}which requires Federal agencies to make their electronic and information
                technology accessible to people with disabilities.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Engineering Specialties Section - Enhanced */}
        <section className="py-16 lg:py-20 bg-gradient-to-br from-[#00D9A6] to-[#00d9a6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full border border-white/30 backdrop-blur-sm mb-6">
                <span className="text-sm font-medium text-gray-800 uppercase tracking-wide">Industry Expertise</span>
              </div>

              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6 leading-[1.0]">
                Engineering Specialties &<br />Industry Support
              </h2>
              <p className="text-xl text-gray-800 max-w-4xl mx-auto leading-[1.2] text-justify" style={{ wordSpacing: '-1px' }}>
                We provide crucial support to leading companies across various industries with specialized engineering talent and technical expertise.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Aerospace - Enhanced */}
              <motion.article
                className="bg-white/95 backdrop-blur-sm border border-white/50 rounded-3xl p-6 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">AEROSPACE</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Instrumentation Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Controls Systems</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Design Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Fabrication Support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Mechanical Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Materials Management</span>
                  </li>
                </ul>
              </motion.article>

              {/* Chemical/Petro - Enhanced */}
              <motion.article
                className="bg-white/95 backdrop-blur-sm border border-white/50 rounded-3xl p-6 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">CHEMICAL/PETRO</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Process/Manufacturing Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Chemists/Lab Technician Support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Chemical Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Environmental/Health/Safety Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Nuclear Engineers</span>
                  </li>
                </ul>
              </motion.article>

              {/* Logistics/Automation - Enhanced */}
              <motion.article
                className="bg-white/95 backdrop-blur-sm border border-white/50 rounded-3xl p-6 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 md:col-span-2 lg:col-span-1"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">LOGISTICS/AUTOMATION</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Field Service Engineers & Technicians</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Controls & Mechanical Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Sales Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">IT Service Managers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.0]">Project Managers</span>
                  </li>
                </ul>
              </motion.article>
            </div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <a href="/open-jobs" target="_blank" rel="noopener noreferrer">
                <button
                  className="inline-flex items-center px-10 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-gray-300 text-lg transform hover:scale-105 hover:-translate-y-1"
                  aria-label="Get started with engineering specialty services"
                >
                  GET STARTED
                  <svg className="ml-3 w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <style jsx>{`
        @keyframes scale-x {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        
        .animate-scale-x {
          animation: scale-x 0.8s ease-out 0.5s forwards;
        }
      `}</style>
    </>
  );
};

export default GovernmentServicesPage;
