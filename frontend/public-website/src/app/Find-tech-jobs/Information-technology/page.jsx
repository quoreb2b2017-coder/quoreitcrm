
"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useState } from 'react';

const SenecaServicesPage = () => {
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
      title: 'Cloud Computing & Infrastructure',
      description: 'Our cloud engineers specialize in architecting, migrating, and managing scalable environments on AWS, Azure, and Google Cloud Platform. From hybrid cloud strategies to serverless computing and edge infrastructure, we ensure your IT foundations are resilient and future-ready.',
      image: '/images/cloud.webp',
      alt: 'Quore IT Cloud Engineers architecting scalable infrastructure on AWS and Azure',
      reverse: false
    },
    {
      id: 'data-science',
      title: 'AI & Data Science Consulting',
      description: 'Leverage the power of Big Data, Machine Learning, and Generative AI. Our data specialists help you interrogate complex datasets to find predictive insights, automate workflows, and build sophisticated AI models that drive competitive advantage in the digital economy.',
      image: '/images/it14.png',
      alt: 'Data scientists at Quore IT analyzing big data and machine learning models',
      reverse: true
    },
    {
      id: 'app-mobile',
      title: 'Full-Stack & Mobile Development',
      description: 'We deliver expert talent across the entire development lifecycle. Whether you need React/Next.js experts, Node.js backend specialists, or native iOS/Android developers, we connect you with professionals fluent in modern frameworks and APK intricacies.',
      image: '/images/it15.png',
      alt: 'Full-stack developers building mobile and web applications with Quore IT talent',
      reverse: false
    },
    {
      id: 'agile-training',
      title: 'DevOps & Agile Transformation',
      description: 'Accelerate your deployment pipelines with our DevOps and Agile experts. We help organizations implement CI/CD, containerization (Docker, Kubernetes), and security-first (DevSecOps) cultures, ensuring faster time-to-market and enhanced software reliability.',
      image: '/images/it16.png',
      alt: 'DevOps team implementing CI/CD pipelines and Docker containerization',
      reverse: true
    }
  ];

  const serviceOptions = [
    'DevOps',
    'Cybersecurity',
    'Cloud',
    'Enterprise Resource Planning',
    'Infrastructure Engineering'
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
          subject: 'New Service Inquiry from Website',
          from_name: 'Quore IT Website'
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
        <title>Quore IT Resources - Expert IT Services & Recruitment Solutions</title>
        <meta
          name="description"
          content="From small business to Fortune 100. Quore IT Resources provides expert IT services, government solutions, engineering, and consulting services. Trusted by winning teams nationwide."
        />
        <meta property="og:image" content="/" />
        <meta name="keywords" content="IT services, government services, engineering, consulting, technology solutions, recruitment, DevOps, cybersecurity, cloud solutions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://yourdomain.com/services" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Modal Form with Transparent Background - FIXED */}
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

        {/* Modern Enhanced Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black overflow-hidden pt-16 md:pt-20 lg:pt-16">
          {/* Animated Background Grid */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                animation: 'grid-move 20s linear infinite'
              }}
            />
          </div>

          {/* Main Content Container */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-white space-y-8 text-center lg:text-left"
              >
                {/* Main Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="relative space-y-2 sm:space-y-3">
                    <h1 className="font-extrabold leading-[0.9] sm:leading-[0.85] tracking-tight text-white">
                      <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#00d9a6] via-cyan-400 to-[#00d9a6] animate-gradient-x whitespace-nowrap">
                        Quore IT Recruitment &
                      </span>
                      <span className="block text-3xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-4xl mt-2 sm:mt-3 md:mt-4 text-white font-black">
                        IT Staffing Excellence
                      </span>
                    </h1>

                    {/* Optional: Professional underline accent */}
                    <div className="w-24 sm:w-32 md:w-40 h-1 bg-gradient-to-r from-[#00d9a6] to-cyan-500 rounded-full opacity-80"></div>
                  </div>


                </motion.div>

                {/* Subtitle Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="space-y-6"
                >
                  <div className="text-lg sm:text-xl md:text-xl lg:text-xl text-gray-300 leading-[1.3] max-w-3xl mx-auto lg:mx-0" style={{ wordSpacing: '-2px' }}>
                    <p className="text-justify mb-3">
                      Technology moves fast, and there's no room for error. At Quore IT, we connect businesses with the right professionals across the full IT spectrum from software development and data analytics to AI and emerging technologies.
                    </p>
                    <p className="text-justify">
                      Our recruiters stay ahead of industry trends to understand not just the skills you need, but the impact they drive. With the right talent in place, we help you innovate, adapt, and succeed in a constantly evolving digital landscape.
                    </p>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 pt-6 justify-center lg:justify-start"
                >
                  <a href="https://open-jobs.quoreit.com/" target="_blank" rel="noopener noreferrer">
                    <button
                      className="group relative px-8 py-4 bg-gradient-to-r from-[#00d9a6] to-cyan-500 hover:from-[#00d9a6] hover:to-blue-600 text-white font-semibold rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 text-base"
                    >
                      <span className="relative z-10">Get Started Today</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                    </button>
                  </a>
                </motion.div>
              </motion.div>

              {/* Right Visual Content */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative mt-8 lg:mt-0"
              >
                {/* Background Decorative Elements */}
                <div className="absolute -inset-6 bg-gradient-to-r from-[#00d9a6]/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl animate-pulse" />
                <div className="absolute -inset-8 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 rounded-full blur-3xl" />

                {/* Main Image Container */}
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
                  <motion.div
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <Image
                      src="/images/it-staffing.webp"
                      alt="Professional IT team collaborating"
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover"
                      priority
                    />

                    {/* Image Overlay Effects */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                    {/* Floating Tech Icons */}
                    <motion.div
                      animate={{
                        y: [-10, 10, -10],
                        rotate: [0, 5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute top-4 right-4 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#00d9a6] to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.div>

                    <motion.div
                      animate={{
                        y: [10, -10, 10],
                        rotate: [0, -5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute bottom-4 left-4 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </motion.div>

                    {/* Additional Floating Elements */}
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-1/2 right-3 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
                    />
                  </motion.div>

                  {/* Tech Stack Indicators */}
                  <div className="flex flex-wrap justify-center space-x-2 md:space-x-3 mt-6">
                    {['React', 'Node.js', 'Cloud', 'AI'].map((tech, index) => (
                      <motion.div
                        key={tech}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs md:text-sm text-white font-medium border border-white/20 cursor-pointer mb-2"
                      >
                        {tech}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Custom Styles for Animations */}
        <style jsx>{`
          @keyframes grid-move {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
          
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>

        {/* Information Technology Recruiting Section */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            {/* DevOps Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16 lg:mb-20">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative order-2 lg:order-1"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/images/dev-ops-2.webp"
                    alt="DevOps team collaboration in modern tech environment"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 lg:space-y-8 order-1 lg:order-2"
              >
                <h3 className="text-3xl md:text-4xl lg:text-4xl font-bold text-gray-900 leading-[1.1] mb-5">
                  DevOps
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-4" style={{ wordSpacing: '-1px' }}>
                  We embrace a DevOps culture that blends Agile practices with the latest in software and security. Our approach accelerates collaboration, strengthens IT systems, and drives continuous improvement.
                </p>
                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-6" style={{ wordSpacing: '-1px' }}>
                  By designing, developing, deploying, and operating mission-critical applications with efficiency, we help your teams deliver faster, smarter, and more reliably than ever before.
                </p>
                <a href="https://open-jobs.quoreit.com/" target="_blank" rel="noopener noreferrer">
                  <button
                    className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#c5f82a] to-[#00d9a6] hover:from-[#00d9a6] hover:to-cyan-500 text-white font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 shadow-lg text-sm md:text-base"
                    aria-label="Get started with DevOps services"
                  >
                    GET STARTED
                    <svg className="ml-2 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Cybersecurity & Cloud Sections */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16 lg:space-y-20">
            {/* Cybersecurity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 lg:space-y-8"
              >
                <h3 className="text-3xl md:text-4xl lg:text-4xl font-bold text-gray-900 leading-[1.1] mb-5">
                  Cybersecurity
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-4" style={{ wordSpacing: '-1px' }}>
                  We help organizations stay protected in an ever-evolving threat landscape. From risk assessments and security architecture to intrusion detection and network monitoring, our experts deliver end-to-end protection.
                </p>
                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-6" style={{ wordSpacing: '-1px' }}>
                  We provide the talent and expertise to safeguard your data helping you prevent, detect, and respond to cyber threats quickly and effectively with cutting-edge solutions.
                </p>
                <a href="https://open-jobs.quoreit.com/" target="_blank" rel="noopener noreferrer">
                  <button
                    className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#c5f82a] to-[#00d9a6] hover:from-[#00d9a6] hover:to-cyan-500 text-white font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 shadow-lg text-sm md:text-base"
                    aria-label="Get started with Cybersecurity services"
                  >
                    GET STARTED
                    <svg className="ml-2 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/images/cybersecurity.webp"
                    alt="Cybersecurity professionals monitoring network security"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            </div>

            {/* Cloud */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative order-2 lg:order-1"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/images/Cloud.webp"
                    alt="Cloud infrastructure engineers working in data center"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 lg:space-y-8 order-1 lg:order-2"
              >
                <h3 className="text-3xl md:text-4xl lg:text-4xl font-bold text-gray-900 leading-[1.1] mb-5">
                  Cloud
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-4" style={{ wordSpacing: '-1px' }}>
                  Cloud infrastructures and data migrations are growing more complex every day on-prem, off-prem, edge, or hybrid. At Quore IT, our experts guide you through the choices, ensuring you get the right fit for your business.
                </p>
                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-6" style={{ wordSpacing: '-1px' }}>
                  Whether it's AI, storage, compute, supercomputing, or networking, we help you maximize the value of your IT investments. From building to moving to managing data in the cloud, we deliver the talent and expertise to make it seamless.
                </p>
                <a href="https://open-jobs.quoreit.com/" target="_blank" rel="noopener noreferrer">
                  <button
                    className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#c5f82a] to-[#00d9a6] hover:from-[#00d9a6] hover:to-cyan-500 text-white font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 shadow-lg text-sm md:text-base"
                    aria-label="Get started with Cloud services"
                  >
                    GET STARTED
                    <svg className="ml-2 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Enterprise & Infrastructure Sections */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16 lg:space-y-20">
            {/* Enterprise Resource Planning */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 lg:space-y-8"
              >
                <h3 className="text-3xl md:text-4xl lg:text-4xl font-bold text-gray-900 leading-[1.1] mb-5">
                  Enterprise Resource Planning
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-4" style={{ wordSpacing: '-1px' }}>
                  ERP is the backbone of seamless business operations, enabling organizations to connect and share data across departments. When implemented effectively, it drives efficiency, collaboration, and measurable growth.
                </p>
                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-6" style={{ wordSpacing: '-1px' }}>
                  At Quore IT, we specialize in the development, customization, and deployment of leading ERP platforms including SAP, Oracle, Microsoft, and Salesforce, whether on-premises or in the cloud. Our experts ensure your ERP systems are tailored to support your goals and maximize business impact.
                </p>
                <a href="https://open-jobs.quoreit.com/" target="_blank" rel="noopener noreferrer">
                  <button
                    className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#c5f82a] to-[#00d9a6] hover:from-[#00d9a6] hover:to-cyan-500 text-white font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 shadow-lg text-sm md:text-base"
                    aria-label="Get started with ERP services"
                  >
                    GET STARTED
                    <svg className="ml-2 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/images/ERP.webp"
                    alt="ERP specialists implementing enterprise solutions"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            </div>


          </div>
        </section>

        {/* Engineering Specialties Section */}
        <section className="py-20 lg:py-24 bg-gradient-to-br from-[#00D8A6] to-[#00d9a6]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center px-6 py-3 bg-white/20 rounded-full border border-white/30 backdrop-blur-sm mb-6">
                <span className="text-sm font-medium text-gray-800 uppercase tracking-wide">Industry Expertise</span>
              </div>

              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-8 leading-[1.0]">
                Engineering Specialties &<br />Industry Support
              </h2>
              <p className="text-lg lg:text-xl text-gray-800 max-w-4xl mx-auto leading-[1.3] text-center" style={{ wordSpacing: '-1px' }}>
                We provide crucial support to leading companies across various industries with specialized engineering talent and technical expertise.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Aerospace */}
              <motion.article
                className="bg-white/95 backdrop-blur-sm border border-white/50 rounded-3xl p-8 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">AEROSPACE</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Instrumentation Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Controls Systems</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Design Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Fabrication Support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Mechanical Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Materials Management</span>
                  </li>
                </ul>
              </motion.article>

              {/* Chemical/Petro */}
              <motion.article
                className="bg-white/95 backdrop-blur-sm border border-white/50 rounded-3xl p-8 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">CHEMICAL/PETRO</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Process/Manufacturing Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Chemists/Lab Technician Support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Chemical Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Environmental/Health/Safety Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Nuclear Engineers</span>
                  </li>
                </ul>
              </motion.article>

              {/* Logistics/Automation */}
              <motion.article
                className="bg-white/95 backdrop-blur-sm border border-white/50 rounded-3xl p-8 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 md:col-span-2 lg:col-span-1"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">LOGISTICS/AUTOMATION</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Field Service Engineers & Technicians</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Controls & Mechanical Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Sales Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">IT Service Managers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-sm leading-[1.2]">Project Managers</span>
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
              <a href="https://open-jobs.quoreit.com/" target="_blank" rel="noopener noreferrer">
                <button
                  className="inline-flex items-center px-10 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-gray-300 text-lg transform hover:scale-105 hover:-translate-y-1"
                  aria-label="Get started with engineering specialty services"
                >
                  GET STARTED
                  <svg className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </a>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
};

export default SenecaServicesPage;
