'use client';
import React from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

const ContactHero = ({ scrollToForm, scrollToOffices }) => {
    const { scrollY } = useScroll();

    // Parallax effects
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gray-900">
            {/* Background Image with Parallax */}
            <motion.div
                style={{ y: y1 }}
                className="absolute inset-0 z-0"
            >
                <div className="absolute inset-0">
                    <Image
                        src="/images/jobs_hero.jpg"
                        alt="Contact Background"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                {/* Advanced Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/60 to-gray-900"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent"></div>
            </motion.div>

            {/* Floating Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px]"
                    style={{ background: 'radial-gradient(circle, rgba(0, 217, 166, 0.2) 0%, transparent 70%)', y: y2 }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px]"
                    style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)', y: y1 }}
                />
            </div>

            <div className="relative z-10 text-center w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-8"
                >
                    <div className="inline-block relative">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
                            className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-teal-400 to-blue-500"
                        />
                        <span className="text-teal-400 font-semibold tracking-widest uppercase text-sm md:text-base mb-4 block">
                            Get in Touch
                        </span>
                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-2">
                            Let's Start a
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-500 pb-2">
                                Conversation
                            </span>
                        </h1>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light"
                    >
                        Connect with our global team across the US and India to transform your digital landscape.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <motion.button
                            onClick={scrollToForm}
                            className="group relative px-8 py-4 bg-teal-500 text-white font-semibold rounded-full overflow-hidden shadow-lg shadow-teal-500/30 transition-all duration-300 hover:shadow-teal-500/50 hover:-translate-y-1 w-full sm:w-auto"
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            <span className="relative flex items-center justify-center gap-2">
                                Start a Project
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </span>
                        </motion.button>

                        <motion.button
                            onClick={scrollToOffices}
                            className="group px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-semibold rounded-full transition-all duration-300 hover:bg-white/10 hover:border-white/20 w-full sm:w-auto"
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="flex items-center justify-center gap-2">
                                View Locations
                                <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>


        </section>
    );
};

export default ContactHero;
