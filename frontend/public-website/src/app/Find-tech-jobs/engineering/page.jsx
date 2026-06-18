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

  // Updated service options with Infrastructure Engineering
  const serviceOptions = [
    'Automotive',
    'Energy/Utility Staffing',
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
          subject: 'New Engineering Service Inquiry from Website',
          from_name: 'Quore IT Engineering Services'
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
        <title>Engineering Recruitment & Staffing Services – Quore IT</title>
        <meta
          name="description"
          content="Quore IT provides specialized engineering recruitment for automotive, energy, and infrastructure sectors. Connect with top-tier engineers and technical specialists today."
        />
        <meta name="keywords" content="engineering recruitment, automotive staffing, energy staffing, infrastructure engineering talent, Quore IT engineering" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Enhanced Responsive Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl max-h-[95vh] overflow-y-auto relative z-60 mx-auto"
            >
              {/* Modal Header - Responsive */}
              <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Get Started Today</h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl font-semibold w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm sm:text-base text-gray-600">
                  Fill out the form below and our team will contact you within 24 hours.
                </p>
              </div>

              {/* Modal Content - Enhanced Responsive */}
              <div className="p-4 sm:p-6 md:p-8">
                {submitMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 text-sm sm:text-base font-medium ${isSuccess
                      ? 'bg-green-50 text-green-800 border-2 border-green-200'
                      : 'bg-red-50 text-red-800 border-2 border-red-200'
                      }`}
                  >
                    {submitMessage}
                  </motion.div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
                  {/* Name Fields - Responsive Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-[#00d9a6]/20 focus:border-[#00d9a6] outline-none transition-all duration-300 text-sm sm:text-base placeholder-gray-400"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-[#00d9a6]/20 focus:border-[#00d9a6] outline-none transition-all duration-300 text-sm sm:text-base placeholder-gray-400"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-[#00d9a6]/20 focus:border-[#00d9a6] outline-none transition-all duration-300 text-sm sm:text-base placeholder-gray-400"
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-[#00d9a6]/20 focus:border-[#00d9a6] outline-none transition-all duration-300 text-sm sm:text-base placeholder-gray-400"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Service Selection - Updated with Infrastructure Engineering */}
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Choose Service *
                    </label>
                    <div className="relative">
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-[#00d9a6]/20 focus:border-[#00d9a6] outline-none transition-all duration-300 bg-white text-sm sm:text-base appearance-none cursor-pointer"
                      >
                        <option value="">Select a service</option>
                        {serviceOptions.map((service) => (
                          <option key={service} value={service} className="py-2">
                            {service}
                          </option>
                        ))}
                      </select>
                      {/* Custom dropdown arrow */}
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button - Enhanced Responsive */}
                  <div className="pt-2 sm:pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-[#00d9a6] to-[#00d9a6] hover:from-[#00c494] hover:to-[#00c494] text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#00d9a6]/30 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm sm:text-base">Submitting...</span>
                        </div>
                      ) : (
                        'Submit Request'
                      )}
                    </button>
                  </div>
                </form>

                {/* Form Footer */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-500 text-center">
                    By submitting this form, you agree to our privacy policy and terms of service.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Ultra Professional Hero Section - Enhanced Responsive */}
        <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 mt-16 sm:mt-18 md:mt-20 overflow-hidden min-h-screen flex items-center">
          {/* Professional Grid Pattern Background */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px sm:100px sm:100px'
              }}
            />
          </div>

          {/* Subtle Professional Accent Lines */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-60" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60" />

          {/* Sophisticated Background Elements - Responsive */}
          <div className="absolute top-16 sm:top-32 right-10 sm:right-20 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-16 sm:bottom-32 left-10 sm:left-20 w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-gradient-to-tr from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">

              {/* Left Content - Enhanced Responsive Design */}
              <motion.div
                onHoverStart={() => setHoveredSide('left')}
                onHoverEnd={() => setHoveredSide(null)}
                className="text-white space-y-6 sm:space-y-8 lg:space-y-10 cursor-pointer relative order-2 lg:order-1"
                initial={{ opacity: 0, x: -80 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: hoveredSide === 'left' ? 1.02 : hoveredSide === 'right' ? 0.98 : 1
                }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 20,
                  duration: 1.2
                }}
              >
                {/* Enhanced Main Headline - Fully Responsive */}
                <div className="relative space-y-2 sm:space-y-3">
                  <h1 className="font-extrabold leading-[0.9] sm:leading-[0.85] tracking-tight text-white">
                    <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#00d9a6] via-cyan-400 to-[#00d9a6] animate-gradient-x whitespace-nowrap">
                      Engineering Recruitment
                    </span>
                    <span className="block text-3xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-4xl mt-2 sm:mt-3 md:mt-4 text-white font-black">
                      Solutions by Quore IT
                    </span>
                  </h1>

                  {/* Optional: Professional underline accent */}
                  <div className="w-24 sm:w-32 md:w-40 h-1 bg-gradient-to-r from-[#00d9a6] to-cyan-500 rounded-full opacity-80"></div>
                </div>

                {/* Professional Taglines - Enhanced Responsive */}
                <motion.div
                  className="space-y-4 sm:space-y-6 max-w-2xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 1 }}
                >
                  <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
                    <motion.p
                      className="text-base sm:text-lg lg:text-lg text-gray-300 leading-[1.3] sm:leading-[1.2] font-light text-justify"
                      whileHover={{ x: 8, color: "#e5e7eb" }}
                      transition={{ duration: 0.3 }}
                      style={{ fontFamily: "'Inter', sans-serif", wordSpacing: '-1px' }}
                    >
                      High-performing operations demand more than just skill, they require the right talent, at the right time. At Quore IT, we specialize in connecting organizations with engineering professionals who can make an immediate impact. From contract staffing to fully outsourced solutions, our recruitment services are designed to support the full spectrum of engineering skill sets.
                    </motion.p>
                    <motion.p
                      className="text-base sm:text-lg lg:text-lg text-gray-300 leading-[1.3] sm:leading-[1.2] font-light text-justify"
                      whileHover={{ x: 8, color: "#e5e7eb" }}
                      transition={{ duration: 0.3 }}
                      style={{ fontFamily: "'Inter', sans-serif", wordSpacing: '-1px' }}
                    >
                      With deep industry knowledge and a people-first approach, we ensure you gain access to top engineering talent that drives efficiency, innovation, and lasting success.
                    </motion.p>
                  </div>
                </motion.div>

                {/* Professional CTA Section - Enhanced Responsive */}
                <motion.div
                  className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4 sm:pt-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                >
                  <a href="/open-jobs" target="_blank" rel="noopener noreferrer">
                    <button
                      className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#00d9a6] to-cyan-500 hover:from-[#00d9a6] hover:to-blue-600 text-white font-semibold text-base sm:text-lg rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                    >
                      <span className="relative z-10">Get Started Today</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                    </button>
                  </a>
                </motion.div>

                {/* Professional Side Indicator */}
                <motion.div
                  className="absolute -left-4 sm:-left-8 top-1/2 transform -translate-y-1/2 w-1 h-20 sm:h-32 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full"
                  animate={{
                    scaleY: hoveredSide === 'left' ? 1.5 : 1,
                    opacity: hoveredSide === 'left' ? 1 : 0.4
                  }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>

              {/* Right Image - Enhanced Responsive Design */}
              <motion.div
                onHoverStart={() => setHoveredSide('right')}
                onHoverEnd={() => setHoveredSide(null)}
                className="relative group cursor-pointer order-1 lg:order-2"
                initial={{ opacity: 0, x: 80 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: hoveredSide === 'right' ? 1.03 : hoveredSide === 'left' ? 0.98 : 1
                }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 20,
                  duration: 1.2
                }}
              >
                {/* Professional Frame Design - Responsive */}
                <motion.div
                  className="relative transform transition-all duration-700"
                  animate={{
                    rotateY: hoveredSide === 'right' ? -2 : 0,
                    y: hoveredSide === 'right' ? -10 : 0
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {/* Sophisticated Border Frame */}
                  <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-br from-emerald-500/20 via-transparent to-cyan-500/20 rounded-xl sm:rounded-2xl blur-xl" />
                  <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-br from-white/10 to-white/5 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/20" />

                  {/* Main Image Container - Responsive */}
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-2 sm:p-4">
                    {/* Professional Inner Frame */}
                    <div className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-xl">
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        <Image
                          src="/images/engineering-staffing.webp"
                          alt="Professional engineering team collaborating"
                          width={800}
                          height={600}
                          className="w-full h-auto object-cover"
                          priority
                          loading="eager"
                        />
                      </motion.div>

                      {/* Professional Overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"
                        animate={{
                          opacity: hoveredSide === 'right' ? 0.8 : 0.5
                        }}
                        transition={{ duration: 0.4 }}
                      />

                      {/* Professional Badge - Responsive */}
                      <motion.div
                        className="absolute top-3 sm:top-6 right-3 sm:right-6 bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg"
                        animate={{
                          scale: hoveredSide === 'right' ? 1.1 : 1,
                          y: hoveredSide === 'right' ? -5 : 0
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-slate-800 font-semibold text-xs sm:text-sm">Trusted Partner</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Professional Corner Accents - Responsive */}
                    <div className="absolute top-1 sm:top-2 left-1 sm:left-2 w-3 h-3 sm:w-4 sm:h-4 border-l-2 border-t-2 border-emerald-400/60 rounded-tl-lg" />
                    <div className="absolute top-1 sm:top-2 right-1 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 border-r-2 border-t-2 border-cyan-400/60 rounded-tr-lg" />
                    <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 w-3 h-3 sm:w-4 sm:h-4 border-l-2 border-b-2 border-cyan-400/60 rounded-bl-lg" />
                    <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 border-r-2 border-b-2 border-emerald-400/60 rounded-br-lg" />
                  </div>
                </motion.div>

                {/* Professional Side Indicator - Responsive */}
                <motion.div
                  className="absolute -right-4 sm:-right-8 top-1/2 transform -translate-y-1/2 w-1 h-20 sm:h-32 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full"
                  animate={{
                    scaleY: hoveredSide === 'right' ? 1.5 : 1,
                    opacity: hoveredSide === 'right' ? 1 : 0.4
                  }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            </div>
          </div>

          {/* Professional Bottom Accent */}
          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 sm:w-24 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
            animate={{ scaleX: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </section>

        {/* Rest of your existing sections remain the same - just adding proper responsive classes where needed */}
        {/* Engineering Services Section - Enhanced Responsive */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Automotive Section - Enhanced Layout */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center mb-12 sm:mb-16 lg:mb-20"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative order-2 lg:order-1">
                <motion.div
                  className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  transition={{ duration: 0.6 }}
                >
                  <Image
                    src="/images/automotive-hero.webp"
                    alt="Automotive engineer working with robotic manufacturing equipment"
                    width={700}
                    height={500}
                    className="w-full h-auto object-cover"
                    priority
                    loading="eager"
                  />
                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </motion.div>
              </div>

              <motion.div
                className="space-y-4 sm:space-y-6 lg:space-y-8 order-1 lg:order-2"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#00d9a6] to-cyan-500 bg-clip-text text-transparent">
                  Automotive
                </h2>
                <p className="text-base sm:text-lg text-gray-600 leading-[1.3] sm:leading-[1.2] text-justify" style={{ wordSpacing: '-1px' }}>
                  Finding the right talent in the automotive industry can be complex especially when precision and efficiency are critical. We understand the unique demands of this space and bring proven expertise to every engagement. From process and manufacturing engineering to logistics, skilled trades, and automation, we provide a strong network of automotive-focused professionals who keep your projects moving forward without costly setbacks.
                </p>
                <a href="/open-jobs" target="_blank" rel="noopener noreferrer">
                  <button
                    className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#00d9a6] to-cyan-500 hover:from-[#00d9a6] text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
                    aria-label="Get started with Automotive engineering services"
                  >
                    GET STARTED
                    <svg className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </a>
              </motion.div>
            </motion.div>

            {/* Energy/Utility Staffing Section - Enhanced Responsive */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center mb-12 sm:mb-16 lg:mb-20"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="space-y-4 sm:space-y-6 lg:space-y-8"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#00d9a6] to-cyan-500 bg-clip-text text-transparent">
                  Energy/Utility Staffing
                </h2>
                <p className="text-base sm:text-lg text-gray-600 leading-[1.3] sm:leading-[1.2] text-justify" style={{ wordSpacing: '-1px' }}>
                  The energy and utility sector is transforming faster than ever, and Quore IT is evolving right alongside it. We deliver specialized teams of electrical engineers, project managers, technicians, and more, wherever they're needed most. With deep knowledge of established systems and a keen eye on emerging innovations, we help clients navigate both legacy challenges and the industry's rapid changes.
                </p>
                <a href="/open-jobs" target="_blank" rel="noopener noreferrer">
                  <button
                    className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#00d9a6] to-cyan-500 hover:from-[#00d9a6] text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500/50 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
                    aria-label="Get started with Energy/Utility staffing services"
                  >
                    GET STARTED
                    <svg className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </a>
              </motion.div>

              <div className="relative">
                <motion.div
                  className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
                  whileHover={{ scale: 1.05, rotateY: -5 }}
                  transition={{ duration: 0.6 }}
                >
                  <Image
                    src="/images/energy-utility.webp"
                    alt="Energy utility engineers reviewing blueprints"
                    width={700}
                    height={500}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </motion.div>
              </div>
            </motion.div>

            {/* Infrastructure Engineering - Enhanced Responsive */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative order-2 lg:order-1"
              >
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Image
                      src="/images/infra-engineering.webp"
                      alt="Quore IT Infrastructure Engineers monitoring high-availability network systems"
                      width={700}
                      height={500}
                      className="w-full h-auto object-cover transition-transform duration-300"
                      loading="lazy"
                    />
                  </motion.div>
                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4 sm:space-y-6 lg:space-y-8 order-1 lg:order-2"
              >
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#00d9a6] to-cyan-500 bg-clip-text text-transparent">
                  Infrastructure Engineering
                </h3>
                <p className="text-base sm:text-lg text-gray-600 leading-[1.3] sm:leading-[1.2] text-justify mb-3 sm:mb-4" style={{ wordSpacing: '-1px' }}>
                  Infrastructure keeps your business running. So downtime is not an option. Our infrastructure engineers are there 24/7, providing everything from desktop and server support to network engineering.
                </p>
                <p className="text-base sm:text-lg text-gray-600 leading-[1.3] sm:leading-[1.2] text-justify mb-4 sm:mb-6" style={{ wordSpacing: '-1px' }}>
                  Whether you need a single skilled resource or a full team of engineers, Quore IT Resources can deploy proven resources at a moment's notice to ensure your systems remain operational and efficient.
                </p>
                <a href="/open-jobs" target="_blank" rel="noopener noreferrer">
                  <button
                    className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#c5f82a] to-[#00d9a6] hover:from-[#00d9a6] hover:to-cyan-500 text-white font-bold rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/50 transform hover:scale-105 shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
                    aria-label="Get started with Infrastructure Engineering services"
                  >
                    GET STARTED
                    <svg className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Rest of your sections continue with the same structure and responsive enhancements... */}
        {/* Compliance Section - Enhanced Responsive */}
        <motion.section
          className="bg-gradient-to-r from-slate-100 to-gray-100 py-8 sm:py-12 lg:py-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-5xl mx-auto bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/30">
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-[1.3] sm:leading-[1.2] text-justify" style={{ wordSpacing: '-1px' }}>
                When working with the government and their agencies, Quore IT Staffing assures that all
                employees are fully compliant with state and federal regulations, including{' '}
                <Link
                  href="https://www.section508.gov/manage/laws-and-policies/"
                  className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-4 transition-all duration-300 hover:decoration-4 font-semibold"
                  aria-label="Learn more about Section 508 compliance"
                >
                  Section 508 of the Rehabilitation Act
                </Link>
                {' '}which requires Federal agencies to make their electronic and information
                technology accessible to people with disabilities.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Engineering Specialties Section - Enhanced Responsive */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#00D9A6] to-[#00d9a6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 rounded-full border border-white/30 backdrop-blur-sm mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-medium text-gray-800 uppercase tracking-wide">Industry Expertise</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-[1.1] sm:leading-[1.0]">
                Engineering Specialties &<br className="hidden sm:block" />
                <span className="block sm:inline">Industry Support</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-800 max-w-4xl mx-auto leading-[1.3] sm:leading-[1.2] text-justify px-4 sm:px-0" style={{ wordSpacing: '-1px' }}>
                We provide crucial support to leading companies across various industries with specialized engineering talent and technical expertise.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {/* Aerospace - Enhanced Responsive */}
              <motion.article
                className="bg-white/95 backdrop-blur-sm border border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">AEROSPACE</h3>
                </div>
                <ul className="space-y-2 sm:space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Instrumentation Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Controls Systems</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Design Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Fabrication Support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Mechanical Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Materials Management</span>
                  </li>
                </ul>
              </motion.article>

              {/* Chemical/Petro - Enhanced Responsive */}
              <motion.article
                className="bg-white/95 backdrop-blur-sm border border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">CHEMICAL/PETRO</h3>
                </div>
                <ul className="space-y-2 sm:space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Process/Manufacturing Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Chemists/Lab Technician Support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Chemical Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Environmental/Health/Safety Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Nuclear Engineers</span>
                  </li>
                </ul>
              </motion.article>

              {/* Logistics/Automation - Enhanced Responsive */}
              <motion.article
                className="bg-white/95 backdrop-blur-sm border border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 sm:col-span-2 lg:col-span-1"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">LOGISTICS/AUTOMATION</h3>
                </div>
                <ul className="space-y-2 sm:space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Field Service Engineers & Technicians</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Controls & Mechanical Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Sales Engineers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">IT Service Managers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm leading-[1.2] sm:leading-[1.0]">Project Managers</span>
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
                  className="inline-flex items-center px-8 sm:px-10 py-3 sm:py-4 bg-gray-900 text-white font-semibold text-base sm:text-lg rounded-xl hover:bg-gray-800 hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-gray-300 transform hover:scale-105 hover:-translate-y-1 w-full sm:w-auto justify-center"
                  aria-label="Get started with engineering specialty services"
                >
                  GET STARTED
                  <svg className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
