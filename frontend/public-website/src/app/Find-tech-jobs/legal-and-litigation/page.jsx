"use client";
import React from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useState } from 'react';

const LegalAndLitigationPage = () => {
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

    // Reusing the same service options for now, but these could be updated if needed
    const serviceOptions = [
        'Litigation Support',
        'Attorney Placement',
        'Legal Operations',
        'Paralegal Support',
        'General Legal Staffing'
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
                    subject: 'New Legal Service Inquiry from Website',
                    from_name: 'Quore IT Legal Division'
                })
            });

            const result = await response.json();

            if (result.success) {
                setIsSuccess(true);
                setSubmitMessage('Thank you for your submission! Our legal recruiting team will reach out to you within 24 hours.');
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
                <title>Legal & Litigation Staffing Solutions – Quore IT</title>
                <meta
                    name="description"
                    content="Quore IT Legal connects law firms and corporate legal departments with top-tier legal talent, specialized in litigation support, attorney placement, and legal operations."
                />
                <meta name="keywords" content="legal staffing, litigation support, attorney recruitment, paralegal services, legal operations talent, Quore IT legal" />
            </Head>

            <main className="min-h-screen bg-gray-50">
                {/* Modal Form */}
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

                {/* Hero Section */}
                <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black overflow-hidden pt-16 md:pt-20 lg:pt-16">
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

                    <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="text-white space-y-8 text-center lg:text-left"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="relative space-y-2 sm:space-y-3">
                                        <h1 className="font-extrabold leading-[0.9] sm:leading-[0.85] tracking-tight text-white">
                                            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#00d9a6] via-cyan-400 to-[#00d9a6] animate-gradient-x whitespace-nowrap">
                                                Legal & Litigation
                                            </span>
                                            <span className="block text-3xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-4xl mt-2 sm:mt-3 md:mt-4 text-white font-black">
                                                Staffing by Quore IT
                                            </span>
                                        </h1>

                                        <div className="w-24 sm:w-32 md:w-40 h-1 bg-gradient-to-r from-[#00d9a6] to-cyan-500 rounded-full opacity-80"></div>
                                    </div>

                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                    className="space-y-6"
                                >
                                    <div className="text-lg sm:text-xl md:text-xl lg:text-xl text-gray-300 leading-[1.3] max-w-3xl mx-auto lg:mx-0" style={{ wordSpacing: '-2px' }}>
                                        <p className="text-justify mb-3">
                                            The legal landscape is complex and constantly evolving. Quore IT connects law firms and corporate legal departments with top-tier talent, from high-stakes litigation support to strategic general counsel placements.
                                        </p>
                                        <p className="text-justify">
                                            Whether you need specialized attorneys, efficient paralegals, or expert legal operations professionals, we understand the nuances of the legal industry and deliver professionals who drive success.
                                        </p>
                                    </div>
                                </motion.div>

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
                                            <span className="relative z-10">Find Legal Talent</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                                        </button>
                                    </a>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="relative mt-8 lg:mt-0"
                            >
                                <div className="absolute -inset-6 bg-gradient-to-r from-[#00d9a6]/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl animate-pulse" />
                                <div className="absolute -inset-8 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 rounded-full blur-3xl" />

                                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
                                    <motion.div
                                        whileHover={{ scale: 1.02, rotate: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative rounded-2xl overflow-hidden shadow-2xl"
                                    >
                                        <Image
                                            src="/images/legal/legal_hero.png"
                                            alt="Professional legal team in a modern law office"
                                            width={600}
                                            height={400}
                                            className="w-full h-auto object-cover"
                                            priority
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                                        <motion.div
                                            animate={{
                                                y: [-10, 10, -10],
                                                rotate: [0, 5, 0]
                                            }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="absolute top-4 right-4 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#00d9a6] to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                            </svg>
                                        </motion.div>
                                    </motion.div>

                                    <div className="flex flex-wrap justify-center space-x-2 md:space-x-3 mt-6">
                                        {['Litigation', 'Corporate', 'eDiscovery', 'Compliance'].map((tag, index) => (
                                            <motion.div
                                                key={tag}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 1 + index * 0.1 }}
                                                whileHover={{ scale: 1.05 }}
                                                className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs md:text-sm text-white font-medium border border-white/20 cursor-pointer mb-2"
                                            >
                                                {tag}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <style jsx>{`
          @keyframes grid-move {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
        `}</style>

                {/* Litigation Support Section */}
                <section className="py-16 lg:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16 lg:mb-20">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="relative order-2 lg:order-1"
                            >
                                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                                    <Image
                                        src="/images/legal/litigation_support.png"
                                        alt="Quore IT Litigation Support - Tech-driven legal professionals managing complex case data"
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
                                    Litigation Support
                                </h3>
                                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-4" style={{ wordSpacing: '-1px' }}>
                                    Modern litigation requires more than just legal argument; it demands mastery of data. Our litigation support specialists are experts in eDiscovery, digital forensics, and trial technology.
                                </p>
                                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-6" style={{ wordSpacing: '-1px' }}>
                                    We provide the technical edge your team needs to manage complex cases efficiently, ensuring every piece of evidence is organized, analyzed, and ready for the courtroom.
                                </p>
                                <a href="https://open-jobs.quoreit.com/" target="_blank" rel="noopener noreferrer">
                                    <button
                                        className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#c5f82a] to-[#00d9a6] hover:from-[#00d9a6] hover:to-cyan-500 text-white font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 shadow-lg text-sm md:text-base"
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

                {/* Attorney Placement & Legal Ops */}
                <section className="py-16 lg:py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16 lg:space-y-20">
                        {/* Attorney Placement */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-6 lg:space-y-8"
                            >
                                <h3 className="text-3xl md:text-4xl lg:text-4xl font-bold text-gray-900 leading-[1.1] mb-5">
                                    Attorney Placement
                                </h3>
                                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-4" style={{ wordSpacing: '-1px' }}>
                                    Finding the right attorney is about more than just qualifications; it's about fit. We specialize in placing associates, partners, and general counsel who align with your firm's culture and your company's strategic goals.
                                </p>
                                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-6" style={{ wordSpacing: '-1px' }}>
                                    Our deep network and discreet approach ensure you have access to top legal talent, whether you're expanding a practice group or building an in-house legal department.
                                </p>
                                <a href="https://open-jobs.quoreit.com/" target="_blank" rel="noopener noreferrer">
                                    <button
                                        className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#c5f82a] to-[#00d9a6] hover:from-[#00d9a6] hover:to-cyan-500 text-white font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 shadow-lg text-sm md:text-base"
                                    >
                                        FIND ATTORNEYS
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
                                        src="/images/legal/attorney_placement.png"
                                        alt="Senior attorneys shaking hands"
                                        width={600}
                                        height={400}
                                        className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                            </motion.div>
                        </div>

                        {/* Legal Operations */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="relative order-2 lg:order-1"
                            >
                                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                                    <Image
                                        src="/images/legal/legal_operations.png"
                                        alt="Busy modern legal department with team collaborating"
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
                                    Legal Operations
                                </h3>
                                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-4" style={{ wordSpacing: '-1px' }}>
                                    Efficiency is the key to a profitable legal practice. Our Legal Ops professionals streamline workflows, manage vendor relationships, and implement technology solutions that reduce costs and improve outcomes.
                                </p>
                                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-6" style={{ wordSpacing: '-1px' }}>
                                    From contract lifecycle management to spend analysis, we provide the operational expertise that allows your attorneys to focus on practicing law.
                                </p>
                                <a href="https://open-jobs.quoreit.com/" target="_blank" rel="noopener noreferrer">
                                    <button
                                        className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#c5f82a] to-[#00d9a6] hover:from-[#00d9a6] hover:to-cyan-500 text-white font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 shadow-lg text-sm md:text-base"
                                    >
                                        OPTIMIZE NOW
                                        <svg className="ml-2 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </a>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Paralegal Support Section */}
                <section className="py-16 lg:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-6 lg:space-y-8"
                            >
                                <h3 className="text-3xl md:text-4xl lg:text-4xl font-bold text-gray-900 leading-[1.1] mb-5">
                                    Paralegal Support
                                </h3>
                                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-4" style={{ wordSpacing: '-1px' }}>
                                    The backbone of any successful legal team. We recruit highly skilled paralegals and legal assistants with expertise in specific practice areas, ensuring you have the support needed to handle increased caseloads with confidence.
                                </p>
                                <p className="text-base md:text-lg text-gray-600 leading-[1.3] text-justify mb-6" style={{ wordSpacing: '-1px' }}>
                                    Whether for temporary project support or permanent placement, our candidates come vetted, experienced, and ready to hit the ground running.
                                </p>
                                <a href="https://open-jobs.quoreit.com/" target="_blank" rel="noopener noreferrer">
                                    <button
                                        className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#c5f82a] to-[#00d9a6] hover:from-[#00d9a6] hover:to-cyan-500 text-white font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 shadow-lg text-sm md:text-base"
                                    >
                                        GET SUPPORT
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
                                        src="/images/legal/paralegal_support.png"
                                        alt="Quore IT Paralegal Support - Experienced legal assistants for high-volume practice support"
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

            </main>
        </>
    );
};

export default LegalAndLitigationPage;
