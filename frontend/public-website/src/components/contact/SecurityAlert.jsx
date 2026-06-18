'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const SecurityAlert = () => {
    return (
        <div className="h-full flex flex-col">
            <motion.div
                className="bg-red-50 rounded-[2rem] p-8 md:p-10 border border-red-100 shadow-xl relative overflow-hidden flex-1 flex flex-col"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                {/* Background Icon */}
                <div className="absolute -right-8 -bottom-8 opacity-[0.03] pointer-events-none">
                    <span className="text-[12rem]">⚠️</span>
                </div>

                <div className="relative z-10 flex flex-col gap-8 flex-1">
                    <div className="flex items-center gap-5">
                        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 text-white shadow-lg shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Security Alert
                        </h2>
                    </div>

                    <div className="space-y-6 text-gray-700">
                        <div>
                            <h3 className="font-bold text-lg mb-3 text-gray-900">Phishing Scam Warning</h3>
                            <p className="leading-relaxed text-base text-gray-600">
                                <strong className="text-red-600">Important Notice:</strong> We are aware that individuals impersonating our consultants have been contacting people via WhatsApp, SMS, and Telegram about fake job opportunities.
                            </p>
                        </div>

                        <p className="text-base text-gray-600">
                            These messages are <strong className="text-gray-900">phishing scams</strong>. We currently do not recruit via these platforms without prior official contact.
                        </p>

                        <div className="bg-white/80 rounded-2xl p-6 border border-red-100/50 backdrop-blur-sm shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center text-sm uppercase tracking-wider">
                                <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                How to Stay Protected
                            </h4>
                            <ul className="space-y-3 text-sm font-medium ml-1 text-gray-600">
                                <li className="flex items-start">
                                    <span className="mr-3 text-red-500 mt-0.5">●</span>
                                    Verify all job opportunities on our official website.
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-3 text-red-500 mt-0.5">●</span>
                                    Do not share personal or financial information via chat apps.
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-3 text-red-500 mt-0.5">●</span>
                                    Report suspicious activity to contactus@quoreit.com.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Expanded Image area to fill remaining height */}
                    <div className="mt-auto pt-8 flex-1 min-h-[250px] relative">
                        <div className="absolute inset-x-0 bottom-0 top-6 rounded-2xl overflow-hidden shadow-md">
                            <Image
                                src="/images/contactfooter.jpg"
                                alt="Cyber Security Warning"
                                fill
                                className="object-cover transition-transform duration-700 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent z-10"></div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SecurityAlert;
