"use client";

import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Home, ChevronRight, ArrowRight, Star, Users, Award, Globe, Shield, Target, CheckCircle, Heart } from 'lucide-react';

const services = [
  {
    title: 'Aerospace Staffing Solutions',
    description:
      'In the specialized fields of aerospace and defense, precision and innovation are paramount. Quore IT connects leading organizations with mission-critical talent, including aerospace engineers, avionics specialists, project managers, and systems technicians. Our recruitment expertise covers both legacy programs and future-ready space technologies, ensuring your team has the technical depth to reach new heights.',
    image: '/images/aerospace-staffing.webp',
    link: 'Find-tech-jobs/aerospace-staffing',
    icon: <Users className="w-6 h-6" />,
  },
  {
    title: 'IT Recruitment & Talent',
    description:
      'The digital landscape evolves at lightning speed. Quore IT specializes in the full IT spectrum—from full-stack software development and cloud architecture to AI and cybersecurity. Our technical recruiters stay ahead of industry trends like DevOps and data science to match you with professionals who don\'t just fill roles but drive digital transformation and sustainable growth.',
    image: '/images/it-staffing.webp',
    link: 'Find-tech-jobs/Information-technology',
    icon: <Globe className="w-6 h-6" />,
  },
  {
    title: 'Engineering Staffing Services',
    description:
      'Our engineering recruitment extends beyond technical proficiency. We source specialists across mechanical, electrical, and structural engineering who understand the convergence of physical and digital systems. Whether it’s Industry 4.0, smart manufacturing, or critical infrastructure, Quore IT provides the engineered talent your mission requires.',
    image: '/images/engineering-staffing.webp',
    link: 'Find-tech-jobs/engineering',
    icon: <Star className="w-6 h-6" />,
  },
  {
    title: 'Government & Compliance Staffing',
    description:
      'Navigating regulated environments requires a partner who understands public sector nuances. Quore IT provides compliant, high-security staffing solutions for government services. We manage the complexities of clearance, regulatory adherence, and public sector procurement to deliver reliable talent for mission-critical civic projects.',
    image: '/images/government-services-staffing.webp',
    link: 'Find-tech-jobs/government-services',
    icon: <Award className="w-6 h-6" />,
  },
  {
    title: 'Legal & Litigation Staffing',
    description:
      'Quore IT Legal connects law firms and corporate legal departments with top-tier talent. We specialize in litigation support, attorney placement, and legal operations, delivering professionals who understand the nuances of the legal industry.',
    image: '/images/legal/legal_hero.png',
    link: 'Find-tech-jobs/legal-and-litigation',
    icon: <Shield className="w-6 h-6" />,
  },
];

const topLogos = [
  'carmax.png',
  'dominion.png',
  'geico.png',
  'honda.png',
  'kemper.png',
  'mercedes.png',
  'motion.png',
  'southern.png',
  'truist.png',
  'sca.png',
  'accenture.png',
];

const bottomLogos = [
  'sca.png',
  'accenture.png',
  'southern.png',
  'truist.png',
  'carmax.png',
  'dominion.png',
  'geico.png',
  'honda.png',
  'kemper.png',
  'mercedes.png',
  'motion.png',
];

const industries = [
  { name: 'AUTOMOTIVE', image: 'automotive.png', color: 'from-blue-500 to-blue-600' },
  { name: 'FINANCIAL', image: 'financial-services.png', color: 'from-green-500 to-green-600' },
  { name: 'GOVERNMENT', image: 'government.png', color: 'from-red-500 to-red-600' },
  { name: 'HEALTHCARE', image: 'healthcare.png', color: 'from-purple-500 to-purple-600' },
  { name: 'RETAIL', image: 'retail.png', color: 'from-orange-500 to-orange-600' },
  { name: 'UTILITIES', image: 'utilities.png', color: 'from-yellow-500 to-yellow-600' },
  { name: 'MANUFACTURING', image: 'manufacturing.png', color: 'from-indigo-500 to-indigo-600' },
];

const cards = [
  {
    id: 'card1',
    image: '/images/card1.webp',
    title: 'Egyptian HVN.TV – Beware of entity unlawfully trying associate with us',
    link: '/News-and-events/cards/card1',
    category: 'Security Alert',
    date: 'Aug 8, 2025'
  },
  {
    id: 'card2',
    image: '/images/card2.webp',
    title: "Quore IT Resources CEO, Bev White shortlisted for Computer Weekly's 50 Most Influential Women in UK Tech",
    link: 'https://www.harveynash.com/news/bev-white-shortlisted-computer-weekly-influential-women',
    category: 'Awards',
    date: 'Aug 5, 2025'
  },
  {
    id: 'card3',
    image: '/images/card3.webp',
    title: 'Where are all the technologists? Talent shortages and what to do about them?',
    link: 'https://www.harveynash.com/news/where-are-the-technologists',
    category: 'Industry Insights',
    date: 'Aug 3, 2025'
  },
  {
    id: 'card4',
    image: '/images/card4.webp',
    title: 'Rachel Watts joins Harvey Nash Group as Global Marketing Director',
    link: 'https://www.harveynash.com/news/rachel-watts-marketing-director',
    category: 'Team News',
    date: 'Aug 1, 2025'
  },
  {
    id: 'card5',
    image: '/images/card5.webp',
    title: 'Harvey Nash Group pledge to use renewable energy by 2023',
    link: 'https://www.harveynash.com/news/renewable-energy-net-zero',
    category: 'Sustainability',
    date: 'Jul 30, 2025'
  },
  {
    id: 'card6',
    image: '/images/card6.webp',
    title: 'Harvey Nash appoints cyber expert as Global CISO',
    link: 'https://www.harveynash.com/news/global-ciso-cyber-expert',
    category: 'Leadership',
    date: 'Jul 28, 2025'
  },
  {
    id: 'card7',
    image: '/images/card7.webp',
    title: 'Harvey Nash wins prestigious Best Company to Work for Award',
    link: 'https://www.harveynash.com/news/harvey-nash-best-company-award',
    category: 'Awards',
    date: 'Jul 25, 2025'
  },
  {
    id: 'card8',
    image: '/images/card8.webp',
    title: 'Global tech threatened as skills crisis reaches high',
    link: 'https://www.harveynash.com/news/global-tech-skills-crisis',
    category: 'Industry Insights',
    date: 'Jul 22, 2025'
  },
  {
    id: 'card9',
    image: '/images/card9.webp',
    title: 'National Coming Out Day',
    link: 'https://www.harveynash.com/news/national-coming-out-day',
    category: 'Company Culture',
    date: 'Jul 20, 2025'
  },
];

// Enhanced animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const bounceIn = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
};

const isExternal = (url) => url.startsWith('http');

const Firstpage = () => {
  return (
    <>

      {/* Hero Section */}
      <motion.section
        className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ marginTop: '80px' }}
      >
        {/* Background Image with better styling */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/images/hero.webp"
              alt="Modern IT professionals working together"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80"></div>
        </motion.div>



        {/* Content */}
        <div className="relative z-10 text-center max-w-7xl mx-auto px-6 py-20 flex-grow flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="text-4xl sm:text-4xl md:text-6xl lg:text-5xl font-bold tracking-normal mb-6 leading-tight text-center">
              <span className="bg-gradient-to-r from-[#00D8A6] to-[#00d8a6] bg-clip-text text-transparent">
                Leading IT Staffing &
              </span>
              <span className="text-white"> Tech Recruitment Solutions.</span>
            </h1>


          </motion.div>
        </div>

        {/* Buttons at the bottom */}
        <div className="relative z-10 pb-20 px-6">
          <p
            className="text-xl md:text-2xl lg:text-2xl font-medium text-center text-gray-200 max-w-4xl mx-auto mb-12 leading-relaxed tracking-tight"
            style={{ wordSpacing: "0.05em", marginTop: '-20px' }}
          >
            <span className="text-white ">
              From startups to enterprises,
            </span>{" "}
            we connect businesses with{" "}
            <span className="text-white ">
              skilled IT professionals
            </span>{" "}
            who deliver results you can trust.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {/* <Link href="/Contact-us">     
        <motion.button       
          className="w-60 h-16 bg-gradient-to-r from-[#00D8A6] to-[#00d9a6] text-black font-bold text-lg rounded-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center"       
          whileHover={{ scale: 1.05, y: -2 }}       
          whileTap={{ scale: 0.95 }}     
        >       
          GET STARTED TODAY     
        </motion.button>   
      </Link>     */}

            <a href="https://open-jobs.quoreit.com/" target="_blank" rel="noopener noreferrer">
              <motion.button
                className="w-60 h-16 border-2 border-[#00D8A6] text-[#00D8A6] font-bold text-lg rounded-lg hover:bg-[#00D8A6] hover:text-black transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                GET STARTED TODAY
              </motion.button>
            </a>
          </div>
        </div>
      </motion.section>
      {/* The Quore Advantage Section */}
      {/* The Quore Advantage Section */}
      <section className="py-24 px-4 md:px-12 lg:px-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-20"
            variants={bounceIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >

            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              <span className="block bg-gradient-to-r from-[#00D8A6] to-[#00d9a6] bg-clip-text text-transparent">
                The Quore IT Advantage
              </span>
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-semibold">
              We believe building the right team goes beyond matching skills to job descriptions. Our approach is designed to ensure every hire adds real value to your business while fitting seamlessly into your culture.
            </p>
          </motion.div>

          {/* Advantage Cards */}
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Understanding Your Needs */}
            <motion.div
              className="bg-white border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
              variants={scaleUp}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-blue-600 transition-colors duration-300">
                Understanding Your Needs
              </h3>

              <p className="text-gray-600 text-center leading-relaxed">
                We begin with listening. By engaging closely with your leadership and HR teams, we identify not just the technical requirements of a role, but also the values, goals, and culture that define your organization.
              </p>
            </motion.div>

            {/* Access to Trusted Talent Network */}
            <motion.div
              className="bg-white border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
              variants={scaleUp}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-green-600 transition-colors duration-300">
                Access to a Trusted Talent Network
              </h3>

              <p className="text-gray-600 text-center leading-relaxed">
                With over a decade of experience in staffing and recruitment, our founders have built strong connections with top IT professionals. This network allows us to source candidates who are not only technically proficient but also dependable and adaptable.
              </p>
            </motion.div>

            {/* Rigorous Screening & Vetting */}
            <motion.div
              className="bg-white border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
              variants={scaleUp}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-purple-600 transition-colors duration-300">
                Rigorous Screening & Vetting
              </h3>

              <p className="text-gray-600 text-center leading-relaxed">
                Every candidate undergoes a thorough evaluation process, from technical assessments to cultural fit checks. This ensures that the professionals we recommend are ready to deliver impact from day one.
              </p>
            </motion.div>

            {/* Flexible Staffing Solutions */}
            <motion.div
              className="bg-white border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
              variants={scaleUp}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-orange-600 transition-colors duration-300">
                Flexible Staffing Solutions
              </h3>

              <p className="text-gray-600 text-center leading-relaxed">
                Whether you're a startup in need of agile, versatile talent or an enterprise requiring specialized skills at scale, we tailor our solutions (contract, permanent, or project-based) to align with your business objectives.
              </p>
            </motion.div>

            {/* Partnership Beyond Hiring - Now Same Size */}
            <motion.div
              className="bg-white border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
              variants={scaleUp}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-red-600 transition-colors duration-300">
                Partnership Beyond Hiring
              </h3>

              <p className="text-gray-600 text-center leading-relaxed">
                We view staffing as more than a transaction - it's a partnership. By staying connected beyond placement, we ensure long-term success for both clients and candidates, creating teams that can grow and thrive together.
              </p>
            </motion.div>

            {/* Proven Results */}
            <motion.div
              className="bg-white border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
              variants={scaleUp}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-indigo-600 transition-colors duration-300">
                Proven Results
              </h3>

              <p className="text-gray-600 text-center leading-relaxed">
                Our track record speaks for itself. We consistently deliver high-quality placements that drive business growth and contribute to long-term organizational success across diverse industries.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* Our Commitment Section */}
      <section className="py-4 px-4 md:px-12 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">


            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">

              <span className="block bg-gradient-to-r from-[#00D8A6] to-[#00d9a6] bg-clip-text text-transparent">
                Our Commitment
              </span>
            </h2>

            <p className="text-xl text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto front-semibold">
              We are committed to more than just filling roles, we are committed to building lasting partnerships that drive real business impact.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Quality Over Quantity Card */}
            <motion.div
              variants={slideInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-6 mx-auto">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Quality Over Quantity</h3>
              <p className="text-gray-600 text-center">Every candidate we recommend is carefully vetted to ensure the highest standards of technical expertise, reliability, and cultural alignment.</p>
            </motion.div>

            {/* Transparency & Trust Card */}
            <motion.div
              variants={slideInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Transparency & Trust</h3>
              <p className="text-gray-600 text-center">We believe in open communication and complete honesty throughout the staffing process, so our clients always know what to expect.</p>
            </motion.div>

            {/* Tailored Solutions Card */}
            <motion.div
              variants={slideInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mb-6 mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Tailored Solutions</h3>
              <p className="text-gray-600 text-center">No two businesses are the same. Whether you're a fast-growing startup or an established enterprise, we design staffing solutions that match your unique needs.</p>
            </motion.div>

            {/* Long-Term Value Card */}
            <motion.div
              variants={slideInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mb-6 mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Long-Term Value</h3>
              <p className="text-gray-600 text-center">Our role doesn't end with placement. We stay invested in the success of both our clients and candidates to ensure strong, lasting outcomes.</p>
            </motion.div>
          </div>


        </div>
      </section>

      {/* CENTER TEXT */}
      {/* Enhanced Logo Slider Section  scroll*/}
      {/* <motion.section 
  className="relative bg-gradient-to-br from-[#00D8A6] via-[#00d9a6] to-[#1a73e8] text-white py-24 overflow-hidden"
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
>

  <motion.div 
    className="absolute top-20 left-16 w-40 h-40 bg-white/15 rounded-full blur-3xl"
    animate={{ 
      scale: [1, 1.2, 1],
      opacity: [0.15, 0.25, 0.15]
    }}
    transition={{ 
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
  <motion.div 
    className="absolute bottom-16 right-20 w-56 h-56 bg-white/10 rounded-full blur-3xl"
    animate={{ 
      scale: [1.2, 1, 1.2],
      opacity: [0.1, 0.2, 0.1]
    }}
    transition={{ 
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 1
    }}
  />
  <motion.div 
    className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/8 rounded-full blur-2xl"
    animate={{ 
      x: [0, 100, 0],
      y: [0, -50, 0]
    }}
    transition={{ 
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />

  
  <motion.div 
    className="relative z-20 max-w-4xl mx-auto text-center px-6 mb-16 bg-white/10 backdrop-blur-md rounded-2xl py-10 text-lg"
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
  >
    <motion.h3 
      className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent"
      whileInView={{ 
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
      }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      Trusted by Industry Leaders
    </motion.h3>
    <p className="text-white/80 text-lg max-w-2xl mx-auto">
      Join hundreds of companies that trust our workforce solutions
    </p>
  </motion.div>


  <div className="overflow-hidden mb-12 relative">
    <motion.div 
      className="flex gap-6 whitespace-nowrap"
      style={{ width: 'max-content' }}
      animate={{
        x: [0, -2000]
      }}
      transition={{
        duration: 30,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop"
      }}
      whileHover={{
        animationPlayState: "paused"
      }}
    >
      {Array.from({ length: 6 }).map((_, groupIndex) =>
        topLogos.map((logo, idx) => (
          <motion.div
            key={`top-${groupIndex}-${idx}`}
            className="flex-shrink-0 bg-white/15 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 w-36 h-24 flex items-center justify-center cursor-pointer"
            whileHover={{ 
              scale: 1.05,
              y: -5,
              backgroundColor: "rgba(255, 255, 255, 0.25)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0.8 }}
            whileInView={{ opacity: 1 }}
          >
            <Image
              src={`/images/${logo}`}
              alt={`Partner Logo`}
              width={120}
              height={60}
              className="max-h-14 w-auto object-contain filter brightness-0 invert transition-all duration-300"
            />
          </motion.div>
        ))
      )}
    </motion.div>
  </div>

 

  

  
</motion.section> */}


      {/* Industries Section */}
      <motion.section
        className="bg-gray-50 py-24 px-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-20" variants={bounceIn}>

            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#00D8A6] to-[#00d9a6] text-transparent bg-clip-text mb-8">
              Industries Served
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide specialized solutions across diverse industries with deep domain expertise
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6"
            variants={staggerContainer}
          >
            {industries.map((industry, index) => (
              <motion.div
                key={industry.name}
                className="group cursor-pointer"
                variants={scaleUp}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:border-gray-200 text-center min-h-[140px] flex flex-col items-center justify-center">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${industry.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Image
                      src={`/images/${industry.image}`}
                      alt={industry.name}
                      width={32}
                      height={32}
                      className="filter brightness-0 invert"
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide group-hover:text-green-600 transition-colors duration-300 leading-tight">
                    {industry.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Services Section */}

      {/* Ultra-Modern Responsive Services Section - White Background */}
      <motion.section
        className="relative bg-white py-20 md:py-32 px-4 md:px-8 lg:px-16 overflow-hidden"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Geometric Pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#c5f82a]/5 to-[#00d9a6]/3 rounded-full blur-3xl transform translate-x-48 -translate-y-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-500/3 to-purple-500/5 rounded-full blur-3xl transform -translate-x-48 translate-y-48"></div>

          {/* Subtle Grid */}
          <div className="absolute inset-0 opacity-[0.02] bg-gradient-to-r from-gray-900 to-gray-600" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Enhanced Premium Header */}
          <motion.div className="text-center mb-20 md:mb-28" variants={bounceIn}>


            {/* Decorative Element */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-[#00D8A6] to-transparent rounded-full opacity-60 blur-sm"></div>
            </div>

            <motion.h2
              className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 mb-10 leading-[0.85] tracking-tighter relative inline-block"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="relative z-10">Our</span>
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#00D8A6] via-[#00f5c4] to-[#00D8A6] animate-gradient-x ml-4 md:ml-6">Services</span>
              {/* Subtle Text Shadow/Glow */}
              <span className="absolute -inset-1 bg-gradient-to-r from-[#00D8A6]/20 to-[#00d9a6]/20 blur-2xl opacity-50 -z-10 rounded-full"></span>
            </motion.h2>

            <motion.div
              className="relative max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <p className="text-lg md:text-xl lg:text-2xl text-slate-600 font-light leading-relaxed tracking-wide">
                Comprehensive solutions tailored to meet your unique business challenges
                and drive <span className="text-[#00D8A6] font-medium">exceptional results</span> through innovation.
              </p>

              {/* Decorative side lines */}
              <div className="absolute top-1/2 -left-8 md:-left-16 w-12 md:w-24 h-px bg-gradient-to-r from-transparent to-[#00D8A6]/30"></div>
              <div className="absolute top-1/2 -right-8 md:-right-16 w-12 md:w-24 h-px bg-gradient-to-l from-transparent to-[#00D8A6]/30"></div>
            </motion.div>
          </motion.div>

          {/* Enhanced Services Grid */}
          <div className="grid gap-8 md:gap-10 lg:gap-12 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                className={`group relative h-[500px] rounded-[2rem] overflow-hidden shadow-xl transition-all duration-700 hover:shadow-2xl hover:shadow-[#00D8A6]/20 border border-gray-200/20 ${idx === 4 ? 'md:col-span-2 md:max-w-2xl md:mx-auto w-full' : ''}`}
                variants={scaleUp}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
              >
                <Link href={service.link.startsWith('/') ? service.link : `/${service.link}`} className="block h-full w-full">
                  {/* Background Image with Parallax-like Zoom */}
                  <div className="absolute inset-0 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={`Quore IT ${service.title} - Professional Staffing Services`}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110 will-change-transform"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Cinematic Overlay - Reduced Opacity */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700"></div>
                  </div>

                  {/* Glass Overlay Content - More Compact */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                    <div className="relative z-10 p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden group-hover:bg-white/10 transition-colors duration-500">

                      {/* Animated Shine Effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                      {/* Icon & Title */}
                      <div className="mb-2">
                        <div className="w-12 h-12 bg-[#00D8A6]/10 rounded-xl flex items-center justify-center mb-3 text-[#00D8A6] border border-[#00D8A6]/20 group-hover:scale-110 transition-transform duration-500">
                          {React.cloneElement(service.icon, { className: "w-6 h-6" })}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                          {service.title}
                        </h3>
                        <div className="h-1 w-12 bg-[#00D8A6] rounded-full transform origin-left transition-all duration-500 group-hover:w-full"></div>
                      </div>

                      {/* Description - Accordion Effect (Always visible on mobile, hover on desktop) */}
                      <div className="grid grid-rows-[1fr] sm:grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500">
                        <div className="overflow-hidden">
                          <p className="text-slate-300 text-sm leading-relaxed mb-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pt-2">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      {/* Action Link */}
                      <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/10">
                        <span className="text-xs font-bold text-[#00D8A6] tracking-wider uppercase">Explore Solution</span>
                        <div className="w-8 h-8 rounded-full bg-[#00D8A6] flex items-center justify-center text-slate-900 transform -rotate-45 group-hover:rotate-0 transition-transform duration-500">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </motion.section>

      {/* Contact Section */}
      <motion.section
        className="relative min-h-[85vh] flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: "url('/images/key.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        {/* Enhanced gradient overlay with better blending */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-gray-900/70 to-black/75"></div>

        {/* Subtle animated overlay for depth */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-transparent via-black/20 to-transparent"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        ></motion.div>

        <div className="relative z-10 text-center max-w-7xl mx-auto px-6 py-12">
          <motion.div
            variants={bounceIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h1 className="text-5xl md:text-5xl lg:text-6xl font-black mb-10 leading-[0.9] tracking-tight">
              <motion.span
                className="block"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                How can we help
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-[#00D8A6] via-[#00f5c4] to-[#00D8A6] bg-clip-text text-transparent relative"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                transform your business?
                {/* Subtle glow effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-[#00D8A6]/20 to-[#00f5c4]/20 blur-lg -z-10"></span>
              </motion.span>
            </h1>
          </motion.div>

          {/* Enhanced description */}
          <motion.p
            className="text-xl md:text-2xl lg:text-2xl mb-16 max-w-5xl mx-auto leading-relaxed text-gray-100 font-light"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            Ready to take your technology initiatives to the{" "}
            <span className="text-[#00D8A6] font-medium">next level</span>?
            Let's discuss how our expertise can drive your success.
          </motion.p>

          {/* Enhanced button section */}
          <motion.div
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <a href="https://open-jobs.quoreit.com/" target="_blank" rel="noopener noreferrer">
              <motion.button
                className="group relative w-72 h-20 border-2 border-[#00D8A6] text-[#00D8A6] font-bold text-lg rounded-2xl hover:bg-[#00D8A6] hover:text-black transition-all duration-500 flex items-center justify-center backdrop-blur-lg bg-white/5 shadow-2xl overflow-hidden"
                whileHover={{
                  scale: 1.08,
                  y: -4,
                  boxShadow: "0 20px 40px rgba(0, 216, 166, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                variants={scaleUp}
              >
                {/* Button background animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#00D8A6]/0 to-[#00D8A6]/0 group-hover:from-[#00D8A6] group-hover:to-[#00f5c4]"
                  transition={{ duration: 0.5 }}
                ></motion.div>

                <span className="relative z-10 flex items-center gap-3">
                  GET STARTED TODAY
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                </span>

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
                  transition={{ duration: 0.6 }}
                ></motion.div>
              </motion.button>
            </a>

            {/* Additional CTA button */}

          </motion.div>

        </div>

        {/* Floating particles for extra visual appeal */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#00D8A6]/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.section>

    </>
  );
};

export default Firstpage;