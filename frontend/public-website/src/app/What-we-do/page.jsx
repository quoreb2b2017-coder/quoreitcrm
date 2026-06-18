'use client';
import React, { useState, useEffect, useRef } from 'react';
import Head from "next/head";
import { seededInt } from '@/utils/deterministicRandom';

const WhatWeDo = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [hoveredService, setHoveredService] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [counters, setCounters] = useState({ clients: 0, placements: 0, countries: 0, years: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const heroRef = useRef(null);
  const statsRef = useRef(null);

  // Optimized scroll handler with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target === statsRef.current && !hasAnimated) {
          animateCounters();
          setHasAnimated(true);
        }
      });
    };

    // Intersection Observer for stats animation
    const observer = new IntersectionObserver(handleIntersection, { threshold: 0.5 });
    if (statsRef.current) observer.observe(statsRef.current);

    window.addEventListener('scroll', handleScroll, { passive: true });
    setIsVisible(true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observer) observer.disconnect();
    };
  }, [hasAnimated]);

  // Animate counters
  const animateCounters = () => {
    const targets = { clients: 500, placements: 10000, countries: 30, years: 25 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    Object.keys(targets).forEach(key => {
      let current = 0;
      const increment = targets[key] / steps;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= targets[key]) {
          current = targets[key];
          clearInterval(timer);
        }
        setCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, stepDuration);
    });
  };

  const smoothScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const locations = [
    { name: 'Belgium', code: 'BE', speciality: 'FinTech Solutions' },
    { name: 'Canada', code: 'CA', speciality: 'AI & Machine Learning' },
    { name: 'Germany', code: 'DE', speciality: 'Engineering Excellence' },
    { name: 'Ireland', code: 'IE', speciality: 'Cloud Computing' },
    { name: 'Netherlands', code: 'NL', speciality: 'DevOps & Infrastructure' },
    { name: 'Poland', code: 'PL', speciality: 'Software Development' },
    { name: 'USA', code: 'US', speciality: 'Full Stack Development' },
    { name: 'United Kingdom', code: 'GB', speciality: 'Cybersecurity' }
  ];

  const services = [
    {
      title: 'Permanent Recruitment',
      description: 'Connect with exceptional full-time technology professionals who will drive your organization forward with dedication and expertise.',
      icon: 'users',
      features: ['Executive Search', 'Mid-Level Hiring', 'Graduate Programs']
    },
    {
      title: 'Contract Solutions',
      description: 'Access skilled contract professionals for project-based technology needs, providing flexibility without compromising on quality.',
      icon: 'lightning',
      features: ['Project Teams', 'Interim Solutions', 'Specialist Skills']
    },
    {
      title: 'Workforce Solutions',
      description: 'Transform your talent strategy with comprehensive workforce management and strategic consulting tailored to your business goals.',
      icon: 'target',
      features: ['RPO Services', 'Managed Services', 'Consulting']
    }
  ];

  const testimonials = [
    {
      quote: "Quore IT didn't just fill positions – they transformed our entire hiring approach. Their understanding of our technical needs and company culture resulted in hires who truly fit our team.",
      author: "Sarah Johnson",
      position: "Chief Technology Officer",
      company: "TechCorp Industries"
    },
    {
      quote: "Working with Quore IT felt like having an extension of our internal team. The quality of candidates and the speed of delivery consistently exceeded what we thought was possible.",
      author: "Michael Chen",
      position: "VP of Engineering",
      company: "InnovateTech Solutions"
    },
    {
      quote: "From 50 to 500 engineers – Quore IT's workforce solutions made our rapid scaling seamless. They understood our vision and helped us build a team that could execute it.",
      author: "Emma Davis",
      position: "Head of Talent Acquisition",
      company: "GlobalScale Enterprises"
    }
  ];

  // Icon component for different icons
  const Icon = ({ name, className = "w-6 h-6" }) => {
    const icons = {
      users: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      lightning: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      target: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      search: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      globe: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      scale: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1" />
        </svg>
      ),
      rocket: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      code: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      brain: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      shield: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      cog: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      palette: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
      credit: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      academic: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
      handshake: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      star: (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
    };
    
    return icons[name] || icons.target;
  };

  return (
    <>
     <Head>
        <title>What We Do – Quore IT Services & Workforce Solutions</title>
        <meta name="description" content="Explore Quore IT’s service offerings: permanent recruitment, contract solutions, RPO & managed workforce solutions tailored to your technology talent needs." />
        <meta property="og:title" content="What We Do – Quore IT Services & Workforce Solutions" />
        <meta property="og:description" content="Explore Quore IT’s service offerings: permanent recruitment, contract solutions, RPO & managed workforce solutions tailored to your technology talent needs." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      {/* Enhanced Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent"></div>
          
          {/* Animated Grid */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '100px 100px',
              transform: `translateY(${scrollY * 0.1}px)`
            }}
          ></div>
          
          {/* Professional Accent Elements */}
          <div className="absolute top-20 left-20 w-64 h-1 bg-gradient-to-r from-green-400 to-transparent opacity-30"></div>
          <div className="absolute bottom-20 right-20 w-64 h-1 bg-gradient-to-l from-green-400 to-transparent opacity-30"></div>
        </div>

        {/* Hero Content */}
        <div className={`relative z-10 text-center px-6 lg:px-8 max-w-6xl mx-auto transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="space-y-12">
            <div className="space-y-8">
              {/* Main Heading with improved spacing */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light text-white leading-tight">
                What We{" "}
                <span className="text-transparent bg-gradient-to-r from-green-400 via-blue-400 to-indigo-400 bg-clip-text font-bold">
                  Deliver
                </span>
              </h1>
            </div>
            
            {/* Subtitle with better spacing */}
            <p className="text-xl sm:text-2xl lg:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Connecting exceptional technology talent with forward-thinking organizations across the globe through strategic recruitment and innovative workforce solutions.
            </p>
            
            {/* CTA Buttons with improved spacing */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <a href="/open-jobs" target="_blank" rel="noopener noreferrer">
                <button 
                  className="group px-10 py-5 bg-green-400 text-slate-900 font-semibold rounded-lg hover:bg-green-300 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center text-lg"
                >
                  <span>GET STARTED</span>
                  <svg className="ml-3 w-6 h-6 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </a>
              
              <button 
                onClick={() => smoothScrollTo('about-section')}
                className="px-10 py-5 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm text-lg"
              >
                Learn More
              </button>
            </div>
          </div>
          
          {/* Enhanced Scroll Indicator */}
          <div className={`absolute bottom-12 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="animate-bounce">
              <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

     

      {/* About Section with improved content spacing */}
      <section id="about-section" className="bg-slate-50 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className={`transform transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}>
              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center">
                    <div className="w-12 h-0.5 bg-green-400 mr-4"></div>
                    <span className="text-green-600 font-semibold text-sm tracking-wider uppercase">About Quore IT</span>
                  </div>
                  
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                    Technology Recruitment{" "}
                    <span className="text-green-600">Excellence</span>
                  </h2>
                </div>
                
                <div className="space-y-8 text-lg text-slate-600 leading-relaxed">
                  <p>
                    We partner with organizations across <span className="font-semibold text-slate-900">more than 30 countries</span> to identify and recruit highly experienced technology professionals for both permanent and contract positions.
                  </p>
                  
                  <p>
                    Our comprehensive <span className="font-semibold text-green-600">Recruitment Solutions</span> business delivers tailored services that empower companies to build and manage their technology teams more effectively in today's competitive landscape.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
                  <div className="group p-8 rounded-xl border border-slate-200 hover:border-green-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                      <Icon name="globe" className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-3 text-lg">Global Presence</h3>
                    <p className="text-slate-600 leading-relaxed">Strategic locations worldwide to serve your talent needs locally with global expertise.</p>
                  </div>
                  
                  <div className="group p-8 rounded-xl border border-slate-200 hover:border-green-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                      <Icon name="target" className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-3 text-lg">Proven Results</h3>
                    <p className="text-slate-600 leading-relaxed">Outstanding track record of successful placements and lasting partnerships with clients.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Visual Element */}
            <div className={`transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl transform rotate-3"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 p-12 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-8 w-full max-w-sm">
                      {[...Array(9)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`aspect-square rounded-lg flex items-center justify-center ${
                            i === 4 ? 'bg-green-400' : i === 1 ? 'bg-blue-400' : i === 7 ? 'bg-indigo-400' : 'bg-slate-200'
                          } animate-pulse`}
                          style={{ animationDelay: `${i * 200}ms` }}
                        >
                          {i === 4 && <Icon name="target" className="w-6 h-6 text-white" />}
                          {i === 1 && <Icon name="users" className="w-6 h-6 text-white" />}
                          {i === 7 && <Icon name="globe" className="w-6 h-6 text-white" />}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="px-12 py-10 bg-slate-50">
                    <div className="space-y-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-4 bg-green-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section with improved spacing */}
      <section id="services-section" className="bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center mb-6">
              <div className="w-12 h-0.5 bg-green-400 mr-4"></div>
              <span className="text-green-600 font-semibold text-sm tracking-wider uppercase">Our Services</span>
              <div className="w-12 h-0.5 bg-green-400 ml-4"></div>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8">
              Comprehensive Solutions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From permanent placements to flexible workforce solutions, we deliver tailored services that meet your unique technology talent requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {services.map((service, index) => (
              <div
                key={index}
                className={`group p-10 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  hoveredService === index 
                    ? 'border-green-200 shadow-xl bg-green-50 transform -translate-y-2' 
                    : 'border-slate-200 hover:border-green-200 hover:shadow-lg bg-white'
                }`}
                onMouseEnter={() => setHoveredService(index)}
                onMouseLeave={() => setHoveredService(null)}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-8 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    hoveredService === index ? 'bg-green-200' : 'bg-green-100'
                  }`}>
                    <Icon name={service.icon} className={`w-8 h-8 transition-colors duration-300 ${
                      hoveredService === index ? 'text-green-700' : 'text-green-600'
                    }`} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">{service.title}</h3>
                  <p className="text-slate-600 mb-8 leading-relaxed text-lg">{service.description}</p>
                  
                  <div className="space-y-4 mb-8">
                    {service.features.map((feature, i) => (
                      <div key={i} className="flex items-center justify-center text-slate-500">
                        <svg className={`w-4 h-4 mr-3 ${hoveredService === index ? 'text-green-500' : 'text-slate-400'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <button className={`px-8 py-4 rounded-lg font-semibold transition-all duration-300 ${
                    hoveredService === index 
                      ? 'bg-green-400 text-white shadow-lg' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}>
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section with improved spacing */}
      <section className="bg-slate-900 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center mb-6">
              <div className="w-12 h-0.5 bg-green-400 mr-4"></div>
              <span className="text-green-400 font-semibold text-sm tracking-wider uppercase">Our Process</span>
              <div className="w-12 h-0.5 bg-green-400 ml-4"></div>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8">
              How We Work
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Our proven methodology ensures we deliver the right talent solutions for your organization's success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { step: "01", title: "Understand", description: "We analyze your requirements, company culture, and technical needs in detail", icon: "search" },
              { step: "02", title: "Source", description: "Leverage our global network to identify and attract top-tier talent", icon: "globe" },
              { step: "03", title: "Evaluate", description: "Conduct rigorous assessment of technical skills and cultural fit", icon: "scale" },
              { step: "04", title: "Deliver", description: "Present qualified candidates and support seamless integration", icon: "rocket" }
            ].map((process, index) => (
              <div key={index} className="group text-center">
                <div className="relative mb-10">
                  <div className="w-20 h-20 bg-green-400/10 border-2 border-green-400/30 rounded-full flex items-center justify-center mx-auto group-hover:bg-green-400/20 group-hover:border-green-400/50 transition-all duration-300">
                    <Icon name={process.icon} className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                    <span className="text-slate-900 font-bold text-sm">{process.step}</span>
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-10 -right-8 w-16 h-0.5 bg-green-400/30"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-6 group-hover:text-green-400 transition-colors">{process.title}</h3>
                <p className="text-slate-400 leading-relaxed">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Focus Section with better spacing */}
      <section className="bg-slate-50 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center mb-6">
              <div className="w-12 h-0.5 bg-green-400 mr-4"></div>
              <span className="text-green-600 font-semibold text-sm tracking-wider uppercase">Industry Expertise</span>
              <div className="w-12 h-0.5 bg-green-400 ml-4"></div>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8">
              Technology Sectors We Serve
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Our specialized teams have deep expertise across all major technology domains and emerging fields
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                title: "Software Development", 
                skills: ["Full-Stack Development", "Mobile Applications", "DevOps Engineering", "Cloud Architecture"], 
                icon: "code", 
                gradient: "from-blue-400 to-blue-600",
                bgColor: "bg-blue-50",
                borderColor: "border-blue-200"
              },
              { 
                title: "Data & AI", 
                skills: ["Data Science", "Machine Learning", "AI Engineering", "Big Data Analytics"], 
                icon: "brain", 
                gradient: "from-purple-400 to-purple-600",
                bgColor: "bg-purple-50",
                borderColor: "border-purple-200"
              },
              { 
                title: "Cybersecurity", 
                skills: ["Security Engineering", "Penetration Testing", "Compliance Management", "Risk Assessment"], 
                icon: "shield", 
                gradient: "from-red-400 to-red-600",
                bgColor: "bg-red-50",
                borderColor: "border-red-200"
              },
              { 
                title: "Infrastructure", 
                skills: ["Cloud Engineering", "Site Reliability", "Network Architecture", "Platform Engineering"], 
                icon: "cog", 
                gradient: "from-green-400 to-green-600",
                bgColor: "bg-green-50",
                borderColor: "border-green-200"
              },
              { 
                title: "Product & Design", 
                skills: ["Product Management", "UX/UI Design", "Product Marketing", "Design Systems"], 
                icon: "palette", 
                gradient: "from-indigo-400 to-indigo-600",
                bgColor: "bg-indigo-50",
                borderColor: "border-indigo-200"
              },
              { 
                title: "Financial Technology", 
                skills: ["Blockchain Development", "Trading Systems", "RegTech Solutions", "Payment Platforms"], 
                icon: "credit", 
                gradient: "from-yellow-400 to-yellow-600",
                bgColor: "bg-yellow-50",
                borderColor: "border-yellow-200"
              }
            ].map((sector, index) => (
              <div key={index} className={`group bg-white p-10 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${sector.borderColor} hover:${sector.borderColor}`}>
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${sector.gradient} flex items-center justify-center`}>
                    <Icon name={sector.icon} className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{sector.title}</h3>
                </div>
                <div className="space-y-4 mb-8">
                  {sector.skills.map((skill, i) => (
                    <div key={i} className="flex items-center text-slate-600">
                      <div className={`w-2 h-2 rounded-full mr-4 flex-shrink-0 bg-gradient-to-r ${sector.gradient}`}></div>
                      {skill}
                    </div>
                  ))}
                </div>
                <div className={`p-4 rounded-xl ${sector.bgColor} group-hover:${sector.bgColor} transition-all duration-300`}>
                  <p className="text-xs text-slate-500 text-center font-medium">
                    {seededInt(index + 1, 50, 99)}+ Active Placements
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section with improved spacing */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center mb-6">
              <div className="w-12 h-0.5 bg-green-400 mr-4"></div>
              <span className="text-green-600 font-semibold text-sm tracking-wider uppercase">Why Choose Us</span>
              <div className="w-12 h-0.5 bg-green-400 ml-4"></div>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8">
              Your Success is Our Mission
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              {[
                {
                  title: "Deep Industry Knowledge",
                  description: "Our consultants are technology professionals who understand the nuances of each role and the rapidly evolving tech landscape.",
                  icon: "academic",
                  stat: "15+ Years Average Experience"
                },
                {
                  title: "Global Network, Local Expertise",
                  description: "With teams in 30+ countries, we combine worldwide reach with deep local market knowledge and cultural understanding.",
                  icon: "globe",
                  stat: "30+ Global Offices"
                },
                {
                  title: "Quality Over Quantity",
                  description: "We focus on finding the perfect fit, not just filling positions. Our thorough vetting process ensures long-term success for both parties.",
                  icon: "star",
                  stat: "95% Retention Rate"
                },
                {
                  title: "Partnership Approach",
                  description: "We become an extension of your team, understanding your culture, goals, and long-term vision for sustainable growth and success.",
                  icon: "handshake",
                  stat: "85% Repeat Clients"
                }
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-8 group">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                    <Icon name={benefit.icon} className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-green-700 transition-colors">{benefit.title}</h3>
                    <p className="text-slate-600 mb-4 leading-relaxed text-lg">{benefit.description}</p>
                    <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {benefit.stat}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl transform rotate-6"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-10">
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Success Metrics</h3>
                  <p className="text-slate-600">Proven track record of excellence</p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center p-6 bg-green-50 rounded-xl">
                    <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                    <div className="text-sm text-slate-600">Client Satisfaction</div>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600 mb-2">72hrs</div>
                    <div className="text-sm text-slate-600">Average Response Time</div>
                  </div>
                  <div className="text-center p-6 bg-indigo-50 rounded-xl">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">3x</div>
                    <div className="text-sm text-slate-600">Faster Hiring</div>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                    <div className="text-sm text-slate-600">Global Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section with improved spacing */}
      <section id="locations-section" className="bg-slate-50 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center mb-6">
              <div className="w-12 h-0.5 bg-green-400 mr-4"></div>
              <span className="text-green-600 font-semibold text-sm tracking-wider uppercase">Global Network</span>
              <div className="w-12 h-0.5 bg-green-400 ml-4"></div>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8">
              Our Worldwide Presence
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Connect with our specialized recruitment teams across key technology markets globally
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Location Grid */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-slate-900 mb-10">Select Your Market</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {locations.map((location, index) => (
                  <div
                    key={location.name}
                    className={`group relative p-8 rounded-xl cursor-pointer transition-all duration-300 border ${
                      hoveredLocation === location.name 
                        ? 'bg-green-50 border-green-200 shadow-lg transform -translate-y-1' 
                        : 'bg-white border-slate-200 hover:border-green-200 hover:shadow-md'
                    }`}
                    onMouseEnter={() => setHoveredLocation(location.name)}
                    onMouseLeave={() => setHoveredLocation(null)}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <Icon name="globe" className={`w-6 h-6 transition-colors ${
                          hoveredLocation === location.name ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="font-semibold text-slate-900 mb-2 group-hover:text-green-900 transition-colors">
                        {location.name}
                      </div>
                      <div className={`text-sm ${
                        hoveredLocation === location.name ? 'text-green-600' : 'text-slate-500'
                      } transition-colors`}>
                        {location.speciality}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Links */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-10">Our Brands</h3>
              
              <div className="space-y-8">
                <a href="#" className="group block p-8 bg-white rounded-xl border border-slate-200 hover:border-green-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xl mb-4 group-hover:text-green-900">Quore IT Resources</h4>
                      <p className="text-slate-600 mb-6 leading-relaxed">Specialized technology recruitment and comprehensive talent acquisition solutions</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Executive Search</span>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">Contract</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-green-600 transform transition-all duration-300 group-hover:translate-x-1 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </a>
                
                <a href="#" className="group block p-8 bg-white rounded-xl border border-slate-200 hover:border-green-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xl mb-4 group-hover:text-green-900">Workforce Solutions</h4>
                      <p className="text-slate-600 mb-6 leading-relaxed">Comprehensive workforce management and strategic consulting services for modern businesses</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">RPO</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Consulting</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-green-600 transform transition-all duration-300 group-hover:translate-x-1 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section with improved spacing */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center mb-6">
              <div className="w-12 h-0.5 bg-green-400 mr-4"></div>
              <span className="text-green-600 font-semibold text-sm tracking-wider uppercase">Client Success</span>
              <div className="w-12 h-0.5 bg-green-400 ml-4"></div>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-50 p-10 rounded-2xl relative hover:shadow-lg transition-all duration-300 group">
                <svg className="absolute top-8 left-8 w-8 h-8 text-green-400 opacity-50 group-hover:opacity-70 transition-opacity" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"/>
                </svg>
                <div className="pt-10">
                  <p className="text-slate-700 text-lg mb-8 italic leading-relaxed">"{testimonial.quote}"</p>
                  <div className="border-t border-slate-200 pt-6">
                    <div className="font-semibold text-slate-900 text-lg">{testimonial.author}</div>
                    <div className="text-slate-600 mb-1">{testimonial.position}</div>
                    <div className="text-green-600 font-medium">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with improved spacing */}
      <section className="relative bg-slate-900 py-24 lg:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-slate-900 to-blue-900/20"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-400/5 via-transparent to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-green-400/5 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-400/5 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-indigo-400/5 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center px-6 lg:px-8">
          <div className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="space-y-16">
              <div className="space-y-8">
                <div className="inline-flex items-center px-8 py-4 rounded-full bg-green-400/10 border border-green-400/20 backdrop-blur-sm">
                  <Icon name="rocket" className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-green-400 text-sm font-semibold tracking-wide">READY TO GET STARTED?</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  Let's Build Your
                  <span className="block text-transparent bg-gradient-to-r from-green-400 via-blue-400 to-indigo-400 bg-clip-text">
                    Dream Team
                  </span>
                </h2>
              </div>
              
              <p className="text-xl sm:text-2xl lg:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Connect with our expert consultants to discuss your technology recruitment needs and discover how we can help you scale your organization effectively.
              </p>

              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-8">
                <button className="group px-12 py-6 bg-green-400 text-slate-900 font-bold rounded-xl hover:bg-green-300 transition-all duration-300 shadow-2xl hover:shadow-green-400/25 transform hover:-translate-y-2 flex items-center text-xl">
                  <span>START YOUR SEARCH</span>
                  <svg className="ml-4 w-6 h-6 transform transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                
                <button className="px-12 py-6 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm text-xl">
                  Schedule Consultation
                </button>
              </div>
              
              {/* Enhanced Contact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-16 max-w-5xl mx-auto">
                <a href="mailto:info@quoreit.com" className="group flex flex-col items-center p-10 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-green-400/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-green-400/30 group-hover:scale-110 transition-all duration-300">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-white text-lg mb-4">Email Us</h4>
                  <p className="text-slate-400 text-center leading-relaxed">Get detailed information about our services and how we can help your organization</p>
                </a>
                
                <a href="tel:+1234567890" className="group flex flex-col items-center p-10 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-blue-400/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-400/30 group-hover:scale-110 transition-all duration-300">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-white text-lg mb-4">Call Us</h4>
                  <p className="text-slate-400 text-center leading-relaxed">Speak directly with our recruitment experts for immediate assistance and guidance</p>
                </a>
                
                <button 
                  onClick={() => smoothScrollTo('locations-section')} 
                  className="group flex flex-col items-center p-10 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="w-16 h-16 bg-indigo-400/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-400/30 group-hover:scale-110 transition-all duration-300">
                    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-white text-lg mb-4">Visit Us</h4>
                  <p className="text-slate-400 text-center leading-relaxed">Find our offices worldwide and connect with local recruitment specialists</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    


     
    </>
  );
};

export default WhatWeDo;
