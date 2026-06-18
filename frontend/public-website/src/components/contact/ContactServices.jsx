'use client';
import React from 'react';
import { motion } from 'framer-motion';

const ContactServices = ({ scrollToForm }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    const cardVariants = {
        hidden: { y: 50, opacity: 0, scale: 0.95 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.6, ease: "easeOut" }
        },
        hover: {
            y: -10,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    const services = [
        {
            title: "Career Opportunities",
            description: "Unlock thousands of premier tech positions worldwide with our expert guidance and industry connections.",
            features: ["Remote & On-site roles", "Competitive salaries", "Career progression"],
            icon: (
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                </svg>
            )
        },
        {
            title: "Enterprise Solutions",
            description: "Strategic talent acquisition and workforce solutions designed to scale your business globally.",
            features: ["Talent acquisition", "Workforce planning", "Global scaling"],
            icon: (
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            title: "Global Presence",
            description: "Comprehensive coverage across US and India with strategic time-zone advantage for maximum reach.",
            features: ["24/7 support coverage", "Local expertise", "Cultural understanding"],
            icon: (
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    return (
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-100 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    className="text-center mb-20"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="inline-block">
                        <span className="px-4 py-2 rounded-full bg-teal-50 text-teal-600 text-sm font-semibold tracking-wide border border-teal-100 mb-6 block">
                            Our Services
                        </span>
                    </motion.div>

                    <motion.h2
                        className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
                        variants={itemVariants}
                    >
                        How Can We Help?
                    </motion.h2>

                    <motion.p
                        className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                        variants={itemVariants}
                    >
                        Discover personalized solutions tailored to your unique needs across our US and India offices.
                    </motion.p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            whileHover="hover"
                            className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 border border-gray-100"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 via-teal-500/0 to-teal-500/0 group-hover:from-teal-50/50 group-hover:via-teal-50/30 group-hover:to-transparent rounded-3xl transition-all duration-500" />

                            <motion.div
                                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-8 shadow-lg shadow-teal-500/30"
                                whileHover={{ rotate: 5, scale: 1.1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {service.icon}
                            </motion.div>

                            <div className="relative">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-teal-600 transition-colors duration-300">
                                    {service.title}
                                </h3>

                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    {service.description}
                                </p>

                                <ul className="space-y-3">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-gray-600 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-3" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Hover Line */}
                            <motion.div
                                className="absolute bottom-0 left-8 right-8 h-1 bg-teal-500 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 rounded-full"
                            />
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    className="text-center mt-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <motion.button
                        onClick={scrollToForm}
                        className="px-10 py-5 bg-gray-900 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Start Your Journey Today
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
};

export default ContactServices;
