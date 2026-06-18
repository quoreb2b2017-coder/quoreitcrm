
"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useState } from 'react';

const AerospaceStaffingPage = () => {
  const [hoveredSide, setHoveredSide] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
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

  React.useEffect(() => {
    setIsLoaded(true);
  }, []);

  const services = [

    {
      id: 'data-science',
      title: 'Aerospace Engineers',
      description: 'At Quore IT, we specialize in recruiting top aerospace engineering talent to meet the complex demands of the industry. Our team understands the specialized skill sets required whether it is structural design, propulsion, avionics, systems integration, or compliance with rigorous industry standards. By combining deep industry knowledge with a people first approach, we identify and connect you with professionals who not only excel technically but also align with your organizational mission.',
      image: '/images/aerospace-eng.webp',
      alt: 'Aerospace engineers working on structural design',
      reverse: true
    },
    {
      id: 'app-mobile',
      title: 'Avionics Specialist Engineers',
      description: 'Avionics engineers are essential to keeping aircraft safe, efficient, and mission-ready. At Quore IT, we help aerospace organizations find the right specialists to make that possible. From system integration and software development to hardware testing and compliance, our recruiters understand the technical precision this field demands. But we do not just match skills we focus on people, ensuring every placement fits seamlessly into your mission and team culture. Whether you need contract support for urgent projects or permanent hires for long-term success, we deliver experts who bring both innovation and reliability. With Quore IT, you gain the talent and partnership needed to keep your aerospace systems advanced and always soaring forward.',
      image: '/images/avionics-engg.webp',
      alt: 'Avionics engineers testing aircraft systems',
      reverse: false
    }
  ];

  const serviceOptions = [
    'Aerospace Staffing',
    'Aerospace Engineers',
    'Avionics Specialist Engineers'
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
          subject: 'New Aerospace Service Inquiry from Website',
          from_name: 'Quore IT Aerospace Services'
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
        <title>Aerospace Staffing & Engineering Recruitment – Quore IT</title>
        <meta
          name="description"
          content="Quore IT specializes in aerospace staffing, connecting top-tier aerospace engineers and avionics specialists with leading industry organizations. Precision talent for a safer future."
        />
        <meta name="keywords" content="aerospace staffing, aerospace recruitment, avionics engineers, aerospace engineering talent, Quore IT aerospace" />
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

        {/* Enhanced Hero Section */}
        <section className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            {/* Gradient Orbs */}
            <motion.div
              className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-[#00d9a6]/20 to-[#00d9a6]/20 rounded-full blur-3xl"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-l from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl"
              animate={{
                x: [0, -80, 0],
                y: [0, 60, 0],
                scale: [1, 0.8, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Floating Geometric Elements */}
            <motion.div
              className="absolute top-1/3 right-1/4 w-4 h-4 bg-[#00d9a6] rounded-full opacity-60"
              animate={{
                y: [-10, 10, -10],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-1/3 left-1/4 w-6 h-6 border-2 border-[#00d9a6] rotate-45 opacity-40"
              animate={{
                rotate: [45, 225, 45],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20h20v20H20V20zm-20 0h20v20H0V20z'/%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 min-h-screen flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">

              {/* Left Content - Enhanced */}
              <motion.div
                onHoverStart={() => setHoveredSide('left')}
                onHoverEnd={() => setHoveredSide(null)}
                className="text-white space-y-6 cursor-pointer relative z-10"
                initial={{ opacity: 0, x: -50 }}
                animate={{
                  opacity: isLoaded ? 1 : 0,
                  x: isLoaded ? 0 : -50,
                  scale: hoveredSide === 'left' ? 1.02 : hoveredSide === 'right' ? 0.98 : 1
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  scale: { duration: 0.3 }
                }}
              >
                {/* Main Headline with Enhanced Typography */}
                <motion.div
                  className="space-y-4"
                  animate={{
                    x: hoveredSide === 'right' ? -30 : 0,
                    opacity: hoveredSide === 'right' ? 0.8 : 1
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <motion.h1
                    className="text-4xl sm:text-5xl lg:text-5xl xl:text-5xl font-bold leading-[1.0] tracking-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    <span className="block bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                      Quore IT Aerospace Staffing
                    </span>
                  </motion.h1>
                </motion.div>

                {/* Enhanced Description */}
                <motion.div
                  className="space-y-5 text-lg lg:text-lg leading-[1.2]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <div className="space-y-4">
                    <motion.p
                      className="text-gray-200 font-medium text-justify"
                      whileHover={{ x: 5, color: "#f8fafc" }}
                      transition={{ duration: 0.2 }}
                      style={{ wordSpacing: '-1px' }}
                    >
                      In aerospace, precision and innovation are everything and the talent behind it is just as critical. Quore IT helps leading aerospace organizations recruit the specialists they need, from aerospace engineers and avionics experts to project managers, technicians, and support staff. We understand the complexities of legacy programs while staying aligned with the latest advancements in aerospace technology, ensuring our clients always have the right expertise to keep projects soaring.
                    </motion.p>
                  </div>

                  {/* Feature Highlights */}
                  <motion.div
                    className="grid grid-cols-2 gap-4 mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                  >
                    {[
                      {
                        icon: (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        ),
                        text: "Fortune 100 Trusted"
                      },
                      {
                        icon: (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        ),
                        text: "Rapid Deployment"
                      },
                      {
                        icon: (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
                          </svg>
                        ),
                        text: "Precision Resourcing"
                      },
                      {
                        icon: (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        ),
                        text: "Innovation Focused"
                      }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-xl bg-white/8 border border-white/15 backdrop-blur-sm hover:bg-white/12 transition-all duration-300"
                        whileHover={{
                          scale: 1.05,
                          backgroundColor: "rgba(255,255,255,0.15)",
                          borderColor: "rgba(255,255,255,0.25)"
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="text-emerald-400 flex-shrink-0">
                          {item.icon}
                        </div>
                        <span className="text-sm font-semibold text-gray-200 leading-[1.0]">{item.text}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Enhanced CTA Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                >
                  <a href="/open-jobs" target="_blank" rel="noopener noreferrer">
                    <motion.button
                      className="group relative px-8 py-4 bg-gradient-to-r from-[#00d9a6] to-[#00d9a6] text-white font-bold rounded-full text-lg shadow-xl overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Get Started Today
                        <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                    </motion.button>
                  </a>
                </motion.div>
              </motion.div>

              {/* Right Image - Enhanced */}
              <motion.div
                onHoverStart={() => setHoveredSide('right')}
                onHoverEnd={() => setHoveredSide(null)}
                className="relative group cursor-pointer lg:justify-self-end"
                initial={{ opacity: 0, x: 50 }}
                animate={{
                  opacity: isLoaded ? 1 : 0,
                  x: isLoaded ? 0 : 50,
                  scale: hoveredSide === 'right' ? 1.05 : hoveredSide === 'left' ? 0.95 : 1
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: 0.2,
                  scale: { duration: 0.3 }
                }}
              >
                <motion.div
                  animate={{
                    x: hoveredSide === 'left' ? 30 : 0,
                    opacity: hoveredSide === 'left' ? 0.8 : 1
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {/* Enhanced Background Decorations */}
                  <motion.div
                    className="absolute -top-8 -right-8 w-80 h-80 bg-gradient-to-br from-[#00d9a6]/30 to-[#00d9a6]/30 rounded-full opacity-30 blur-2xl"
                    animate={{
                      scale: hoveredSide === 'right' ? 1.3 : 1,
                      rotate: hoveredSide === 'right' ? 180 : 0
                    }}
                    transition={{ duration: 0.8 }}
                  />

                  {/* Main Image Container */}
                  <motion.div
                    className="relative transform transition-all duration-500 z-10"
                    animate={{
                      scale: hoveredSide === 'right' ? 1.08 : 1.02,
                      rotate: hoveredSide === 'right' ? -1 : 0,
                      y: hoveredSide === 'right' ? -5 : 0
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    {/* Enhanced Glassmorphism Frame */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl"
                      animate={{
                        borderColor: hoveredSide === 'right' ? 'rgba(0,217,166,0.4)' : 'rgba(255,255,255,0.2)',
                        boxShadow: hoveredSide === 'right'
                          ? '0 25px 50px -12px rgba(0,217,166,0.25)'
                          : '0 25px 50px -12px rgba(0,0,0,0.25)'
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Image Wrapper */}
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-white/10 via-gray-50/5 to-gray-100/10 p-4 backdrop-blur-sm">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-[#00d9a6]/10 via-transparent to-[#00d9a6]/10 rounded-3xl"
                        animate={{
                          opacity: hoveredSide === 'right' ? 0.8 : 0.4
                        }}
                        transition={{ duration: 0.3 }}
                      />

                      <div className="relative rounded-2xl overflow-hidden shadow-xl">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Image
                            src="/images/aerospace-staffing.webp"
                            alt="Quore IT Aerospace specialists collaborating on mission-critical projects"
                            width={600}
                            height={400}
                            className="w-full h-auto object-cover transition-transform duration-700"
                            priority
                            loading="eager"
                          />
                        </motion.div>

                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
                          animate={{
                            opacity: hoveredSide === 'right' ? 0.6 : 0.3
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>

                      {/* Enhanced Corner Decorations */}
                      <motion.div
                        className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-r from-[#00d9a6] to-[#00d9a6] rounded-full shadow-lg"
                        animate={{
                          scale: hoveredSide === 'right' ? 1.5 : 1,
                          rotate: hoveredSide === 'right' ? 360 : 0
                        }}
                        transition={{ duration: 0.6 }}
                      />
                      <motion.div
                        className="absolute bottom-2 left-2 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg"
                        animate={{
                          scale: hoveredSide === 'right' ? 1.3 : 1,
                          rotate: hoveredSide === 'right' ? -360 : 0
                        }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                      />
                    </div>

                    {/* Enhanced Floating Elements */}
                    <motion.div
                      className="absolute -top-4 left-1/4 w-8 h-8 bg-gradient-to-r from-[#00d9a6] to-[#00d9a6] rounded-full opacity-80 shadow-lg"
                      animate={{
                        y: hoveredSide === 'right' ? [-5, 5, -5] : [0],
                        scale: hoveredSide === 'right' ? 1.2 : 1
                      }}
                      transition={{
                        duration: hoveredSide === 'right' ? 2 : 0.5,
                        repeat: hoveredSide === 'right' ? Infinity : 0,
                        repeatType: "reverse"
                      }}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 sm:py-16 lg:py-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-14 sm:space-y-16 lg:space-y-18">
              {services.map((service, index) => (
                <motion.article
                  key={service.id}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-14 items-center ${service.reverse ? 'lg:grid-flow-col-dense' : ''
                    }`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  {/* Image Container */}
                  <div className={`relative ${service.reverse ? 'lg:col-start-2' : ''}`}>
                    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
                      <Image
                        src={service.image}
                        alt={service.alt}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                        priority={index < 2}
                        quality={85}
                      />
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className={`${service.reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                    <div className="p-6 sm:p-8 lg:p-8 h-full flex flex-col justify-center">
                      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 leading-[1.0]">
                        {service.title}
                      </h2>
                      <p className="text-base sm:text-lg lg:text-lg text-gray-700 leading-[1.2] mb-6 sm:mb-7 text-justify" style={{ wordSpacing: '-1px' }}>
                        {service.description}
                      </p>
                      <div className="mt-auto">
                        <a href="/open-jobs" target="_blank" rel="noopener noreferrer">
                          <button
                            className="inline-flex items-center bg-gradient-to-r from-[#00d9a6] to-[#00d9a6] hover:from-[#00d9a6] hover:to-[#00d9a6] text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50"
                            aria-label={`Learn more about ${service.title} services`}
                          >
                            GET STARTED
                            <svg
                              className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Engineering Specialties Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-br from-[#00d9a6] to-[#00d9a6]">
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
    </>
  );
};

export default AerospaceStaffingPage;
