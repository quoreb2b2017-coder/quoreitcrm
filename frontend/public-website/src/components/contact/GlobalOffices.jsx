'use client';
import React from 'react';
import { motion } from 'framer-motion';

const GlobalOffices = ({ officesRef }) => {
    return (
        <section ref={officesRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
            {/* Background Decorative */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            <div className="max-w-7xl mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-teal-600 font-semibold tracking-wide uppercase text-sm">Worldwide Network</span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-2 mb-6">
                        Our Global Offices
                    </h2>
                    <p className="text-xl text-gray-500 max-w-3xl mx-auto font-light">
                        Strategically located to provide round-the-clock support and global expertise.
                    </p>
                </motion.div>

                {/* Feature Image */}
                <motion.div
                    className="relative rounded-3xl overflow-hidden mb-20 shadow-2xl h-[400px]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: 'url("/images/london_office.jpg")'
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 p-8 sm:p-12 text-white max-w-2xl">
                        <h3 className="text-3xl font-bold mb-2">Modern Workspaces</h3>
                        <p className="text-lg text-gray-300">Designed for collaboration and innovation, our offices reflect our commitment to excellence.</p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* US Office */}
                    <OfficeCard
                        country="US Headquarters"
                        flag="🇺🇸"
                        title="Our main operations center"
                        address={<>539 W Commerce St #2577<br />Dallas, TX 75208</>}
                        phone="+1 332-231-0404"
                        email="contactus@quoreit.com"
                        hours="Mon-Fri: 9:00 AM - 6:00 PM (PST)"
                        color="teal"
                        delay={0}
                    />

                    {/* India Office */}
                    <OfficeCard
                        country="India Office"
                        flag="🇮🇳"
                        title="Strategic development center"
                        address={<>Omicron commerz, 8th floor Office 804<br />Z lane, Koregaon Park Annex<br />Mundhwa, Pune, MH 411028</>}
                        phone="+1 332-231-0404"
                        email="contactus@quoreit.com"
                        hours="Mon-Fri: 9:30 AM - 6:30 PM (IST)"
                        color="blue"
                        delay={0.2}
                    />
                </div>

                {/* Stats */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-100 pt-16">
                    <StatItem number="24/7" label="Global Support" />
                    <StatItem number="2" label="Strategic Locations" />
                    <StatItem number="100+" label="Team Members" />
                    <StatItem number="98%" label="Client Retention" />
                </div>
            </div>
        </section>
    );
};

const OfficeCard = ({ country, flag, title, address, phone, email, hours, color, delay }) => {
    const isTeal = color === 'teal';
    const bgClass = isTeal ? 'bg-teal-50/50' : 'bg-blue-50/50';
    const borderClass = isTeal ? 'border-teal-100' : 'border-blue-100';
    const iconBg = isTeal ? 'bg-teal-500' : 'bg-blue-500';
    const textHover = isTeal ? 'hover:text-teal-600' : 'hover:text-blue-600';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay }}
            className={`rounded-3xl p-8 sm:p-10 ${bgClass} border ${borderClass} hover:shadow-xl transition-all duration-300`}
        >
            <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl">{flag}</span>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">{country}</h3>
                    <p className="text-gray-500">{title}</p>
                </div>
            </div>

            <div className="h-px w-full bg-gray-200 my-8"></div>

            <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${iconBg} text-white shrink-0 mt-1`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">Visit Us</p>
                        <p className="text-gray-600 leading-relaxed mt-1">{address}</p>
                    </div>
                </div>

                {/* Contact */}
                <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${iconBg} text-white shrink-0 mt-1`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">Get in Touch</p>
                        <p className="mt-1"><a href={`tel:${phone}`} className={`text-gray-600 font-medium ${textHover} transition-colors`}>{phone}</a></p>
                        <p><a href={`mailto:${email}`} className={`text-gray-600 font-medium ${textHover} transition-colors`}>{email}</a></p>
                    </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${iconBg} text-white shrink-0 mt-1`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">Business Hours</p>
                        <p className="text-gray-600 leading-relaxed mt-1">{hours}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const StatItem = ({ number, label }) => (
    <div className="text-center">
        <h4 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{number}</h4>
        <p className="text-gray-500 font-medium">{label}</p>
    </div>
);

export default GlobalOffices;
