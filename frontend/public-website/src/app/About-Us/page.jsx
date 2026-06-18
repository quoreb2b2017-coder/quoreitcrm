'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { ChevronRight, Users, Target, Shield, Zap, CheckCircle, ArrowRight, Award, TrendingUp, Globe, Star, PlayCircle } from 'lucide-react';

const AboutPage = () => {
  const [isVisible, setIsVisible] = useState({});
  const [activeCard, setActiveCard] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const advantages = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Understanding Your Needs",
      description: "We begin with listening. By engaging closely with your leadership and HR teams, we identify not just the technical requirements of a role, but also the values, goals, and culture that define your organization. Our comprehensive discovery process ensures perfect alignment between your business objectives and talent acquisition strategy.",
      image: "/images/women6.webp",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Access to a Trusted Talent Network",
      description: "With over a decade of experience in staffing and recruitment, our founders have built strong connections with top IT professionals. This network allows us to source candidates who are not only technically proficient but also dependable and adaptable. Our extensive database includes professionals across all technology domains and experience levels.",
      image: "/images/women1.webp",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Rigorous Screening & Vetting",
      description: "Every candidate undergoes a thorough evaluation process, from technical assessments to cultural fit checks. This ensures that the professionals we recommend are ready to deliver impact from day one. Our multi-stage vetting process includes technical interviews, reference checks, and personality assessments.",
      image: "/images/women2.webp",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Flexible Staffing Solutions",
      description: "Whether you're a startup in need of agile, versatile talent or an enterprise requiring specialized skills at scale, we tailor our solutions (contract, permanent, or project-based) to align with your business objectives. Our flexible engagement models adapt to your changing needs and market conditions.",
      image: "/images/women3.webp",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Partnership Beyond Hiring",
      description: "We view staffing as more than a transaction - it's a partnership. By staying connected beyond placement, we ensure long-term success for both clients and candidates, creating teams that can grow and thrive together. Our ongoing support includes performance monitoring and career development guidance.",
      image: "/images/women4.webp",
      gradient: "from-cyan-500 to-blue-600"
    }
  ];

  const testimonials = [
    {
      quote: "QUORE IT transformed our hiring process. Their understanding of our culture and technical needs resulted in perfect matches every time.",
      author: "Sarah Johnson",
      position: "CTO, TechStart Inc.",
      image: "/images/testimonial1.jpg",
      rating: 5
    },
    {
      quote: "The quality of candidates and the speed of delivery exceeded our expectations. QUORE IT is our go-to staffing partner.",
      author: "Michael Chen",
      position: "VP Engineering, DataFlow Systems",
      image: "/images/testimonial2.jpg",
      rating: 5
    },
    {
      quote: "Their rigorous vetting process saved us countless hours. Every candidate was technically sound and culturally aligned.",
      author: "Emily Rodriguez",
      position: "HR Director, CloudTech Solutions",
      image: "/images/testimonial3.jpg",
      rating: 5
    }
  ];



  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>About Quore IT – Our Mission, Vision & IT Staffing Excellence</title>
        <meta
          name="description"
          content="Learn about Quore IT, a premier IT staffing partner founded on a decade of recruitment excellence. Discover our mission to bridge the gap between top talent and leading enterprises."
        />
        <meta name="keywords" content="about Quore IT, IT staffing agency mission, recruitment experts, tech talent partners, Quore IT history" />
      </Head>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-800/70 z-10"></div>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-[#00d9a6] rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-background.jpg"
            alt="Technology professionals collaborating"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>

        <div className="relative z-20 container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div
                id="hero-content"
                className={`transform transition-all duration-1000 ${isVisible['hero-content'] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
              >
                <h1 className="text-4xl lg:text-5xl font-bold mb-2  py-12">
                  Empowering Success with
                  <span className="block text-transparent bg-gradient-to-r from-[#00d9a6] to-green-400 bg-clip-text animate-pulse">
                    Quore IT Staffing
                  </span>
                </h1>
                <p className="text-xl lg:text-2xl mb-8 text-gray-300 ">
                  Skilled, reliable, and ready to deliver exceptional results for your technology initiatives
                </p>
                <p className="text-lg lg:text-xl mb-10 ltext-gray-400">
                  At QUORE IT Staffing, we help startups and enterprises build high-impact teams by connecting them with the right professionals at the right time. Our expertise spans across all technology domains and organizational levels.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-gradient-to-r from-[#00d9a6] to-green-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-[#00c496] hover:to-green-400 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-[#00d9a6]/25 transform hover:-translate-y-1">
                    <span>Explore Our Services</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                </div>
              </div>

              <div
                id="hero-image"
                className={`transform transition-all duration-1000 delay-300 ${isVisible['hero-image'] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
              >
                <div className="relative">
                  <Image
                    src="/images/pic2.webp"
                    alt="Quore IT expert team collaborating on talent acquisition strategies"
                    width={600}
                    height={400}
                    className="rounded-2xl shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-[#00d9a6] text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>95% Success Rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Company Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div
              id="overview"
              className={`grid lg:grid-cols-2 gap-16 items-center transform transition-all duration-1000 delay-200 ${isVisible['overview'] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
            >
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-8 leading-tight">
                  Connecting Expertise with
                  <span className="text-[#00d9a6]"> Opportunity</span>
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#00d9a6] to-green-400 mb-8"></div>

                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                  <p>
                    At QUORE IT, we specialize in connecting businesses with the right technology talent to drive innovation and growth. As a trusted IT staffing partner, we understand that success in today's digital landscape depends on having skilled professionals who can deliver results from day one.
                  </p>
                  <p>
                    Our team combines deep industry expertise with a consultative approach to deliver staffing solutions tailored to your unique needs, whether it's short-term project support, long-term placements, or building entire technology teams.
                  </p>
                  <p>
                    We go beyond resumes. By leveraging a rigorous vetting process and a strong talent network, QUORE IT ensures every candidate we present is not only technically proficient but also aligned with your company culture and business goals.
                  </p>
                </div>

                <div className="mt-8 flex items-center space-x-6">
                  <div className="flex items-center space-x-2 text-[#00d9a6] font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    <span>Certified Professionals</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[#00d9a6] font-semibold">
                    <Globe className="w-5 h-5" />
                    <span>Global Network</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <Image
                  src="/images/pic1.webp"
                  alt="Modern office environment with technology professionals"
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-xl"
                />
                <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-[#00d9a6]/20">
                  <div className="flex items-center space-x-2 text-[#00d9a6] font-semibold">
                    <div className="w-2 h-2 bg-[#00d9a6] rounded-full animate-pulse"></div>
                    <span>Live Talent Matching</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div
              id="about-section"
              className={`transform transition-all duration-1000 delay-300 ${isVisible['about-section'] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                  About QUORE IT
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#00d9a6] to-green-400 mx-auto mb-6"></div>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Founded on vision, built on experience, and driven by results
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                  <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 h-full border border-[#00d9a6]/10 hover:border-[#00d9a6]/30">
                    <div className="text-[#00d9a6] mb-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-[#00d9a6] to-green-400 rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <span className="text-2xl font-bold text-white">2025</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Founded in July 2025</h3>
                    <p className="text-gray-600 leading-relaxed">
                      QUORE IT Staffing was built on a simple vision: "to bridge the gap between businesses and the right technology talent in a fast-evolving digital world".
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                  <div className="flex items-start space-x-6 p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#00d9a6]/20">
                    <div className="w-6 h-6 bg-gradient-to-r from-[#00d9a6] to-green-400 rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 mb-3">Decade of Experience</h4>
                      <p className="text-gray-600 leading-relaxed">
                        Our founders bring with them over a decade of experience in staffing and recruitment, having successfully fulfilled critical hiring requirements for enterprise organizations and leading technology giants across the industry. This extensive experience forms the foundation of our expert approach to talent acquisition.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6 p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#00d9a6]/20">
                    <div className="w-6 h-6 bg-gradient-to-r from-[#00d9a6] to-green-400 rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 mb-3">Beyond Resume Matching</h4>
                      <p className="text-gray-600 leading-relaxed">
                        We go beyond matching resumes to job descriptions. We focus on aligning skilled professionals with the culture, vision, and long-term goals of the organizations we partner with. Our holistic approach ensures sustainable placements that benefit both clients and candidates.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6 p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#00d9a6]/20">
                    <div className="w-6 h-6 bg-gradient-to-r from-[#00d9a6] to-green-400 rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 mb-3">Trust & Transparency</h4>
                      <p className="text-gray-600 leading-relaxed">
                        Trust, transparency, and results are at the heart of our approach. Backed by years of proven experience, we are committed to helping clients accelerate growth while empowering talent with the right opportunities. Every interaction is built on integrity and mutual respect.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The QUORE Advantage */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div
              id="advantage-header"
              className={`text-center mb-16 transform transition-all duration-1000 delay-400 ${isVisible['advantage-header'] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                The QUORE Advantage
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#00d9a6] to-green-400 mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                We believe building the right team goes beyond matching skills to job descriptions. Our approach is designed to ensure every hire adds real value to your business while fitting seamlessly into your culture and contributing to long-term success.
              </p>
            </div>

            <div className="space-y-12">
              {advantages.map((advantage, index) => (
                <div
                  key={index}
                  id={`advantage-${index}`}
                  className={`transform transition-all duration-1000 ${isVisible[`advantage-${index}`]
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-8 opacity-0'
                    }`}
                  style={{ transitionDelay: `${500 + index * 100}ms` }}
                  onMouseEnter={() => setActiveCard(index)}
                >
                  <div className={`bg-gradient-to-r ${activeCard === index
                      ? 'from-[#00d9a6]/10 to-green-50 shadow-2xl transform scale-105'
                      : 'from-gray-50 to-green-50/30 hover:shadow-xl hover:scale-102'
                    } rounded-3xl p-8 transition-all duration-500 group cursor-pointer border border-gray-100 hover:border-[#00d9a6]/20`}>
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      <div className={`order-2 ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                        <div className="flex items-start space-x-6">
                          <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-r ${activeCard === index ? advantage.gradient : 'from-gray-600 to-gray-700'
                            } rounded-2xl flex items-center justify-center text-white transition-all duration-300 shadow-lg`}>
                            {advantage.icon}
                          </div>

                          <div className="flex-grow">
                            <h3 className={`text-2xl lg:text-3xl font-bold mb-4 transition-colors duration-300 ${activeCard === index ? 'text-[#00d9a6]' : 'text-gray-800 group-hover:text-[#00d9a6]'
                              }`}>
                              {advantage.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-lg mb-6">
                              {advantage.description}
                            </p>
                            <div className={`inline-flex items-center space-x-2 font-semibold transition-all duration-300 ${activeCard === index
                                ? 'text-[#00d9a6] transform translate-x-2'
                                : 'text-gray-500 hover:text-[#00d9a6]'
                              }`}>
                              <span>Learn more</span>
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={`order-1 ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                        <div className="relative">
                          <Image
                            src={advantage.image}
                            alt={advantage.title}
                            width={500}
                            height={300}
                            className="rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#00d9a6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* Mission Statement */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/mission-background.jpg"
            alt="Team collaboration background"
            fill
            className="object-cover opacity-10"
          />
        </div>

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-[#00d9a6] rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div
              id="mission"
              className={`transform transition-all duration-1000 delay-600 ${isVisible['mission'] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
            >
              <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
                We Don't Just Fill Positions,
                <span className="block text-transparent bg-gradient-to-r from-[#00d9a6] to-green-400 bg-clip-text mt-4">
                  We Build Partnerships
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed mb-12 max-w-4xl mx-auto">
                With a commitment to quality, compliance, and reliability, we help organizations reduce hiring challenges, accelerate projects, and achieve measurable outcomes. Our partnership approach ensures long-term success for all stakeholders.
              </p>
              <div className="inline-flex items-center space-x-3 text-[#00d9a6] font-bold text-xl lg:text-2xl bg-white/10 px-8 py-4 rounded-full backdrop-blur-sm border border-[#00d9a6]/30 hover:bg-white/20 transition-all duration-300">
                <Globe className="w-6 h-6" />
                <span>QUORE IT - Connecting expertise with opportunity</span>
                <ChevronRight className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#00d9a6] to-green-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative container mx-auto px-4">
          <div
            id="cta"
            className={`max-w-5xl mx-auto text-center transform transition-all duration-1000 delay-700 ${isVisible['cta'] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">
              Ready to Build Your Dream Team?
            </h2>
            <p className="text-xl lg:text-2xl mb-12 text-gray-100 max-w-3xl mx-auto leading-relaxed">
              Let's discuss how QUORE IT can help you find the right talent for your next big project. Our experts are ready to understand your unique requirements and deliver exceptional results.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <a href="https://open-jobs.quoreit.com/" target="_blank" rel="noopener noreferrer">
                <button className="bg-white text-[#00d9a6] px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 inline-flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105">
                  <span>Get Started Today</span>
                  <ArrowRight className="w-6 h-6" />
                </button>
              </a>
              <button className="border-2 border-white text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-[#00d9a6] transition-all duration-300 inline-flex items-center justify-center space-x-3 transform hover:-translate-y-1">
                <Users className="w-6 h-6" />
                <span>Schedule Consultation</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-white/90 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm border border-white/20">
                <CheckCircle className="w-5 h-5" />
                <span>Free Initial Consultation</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-white/90 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm border border-white/20">
                <Shield className="w-5 h-5" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-white/90 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm border border-white/20">
                <Award className="w-5 h-5" />
                <span>Guaranteed Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;