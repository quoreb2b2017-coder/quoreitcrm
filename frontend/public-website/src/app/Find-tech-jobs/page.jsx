// src/app/Find-tech-jobs/page.jsx
"use client";
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';

const FindJobsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');

  // Web3Forms direct API integration
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append('access_key', '2c1b7668-e873-404a-9759-f85af53e550b');
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('experience', data.experience);
      formData.append('location', data.location);
      formData.append('message', data.message);
      formData.append('from_name', 'Tech Job Portal');
      formData.append('subject', 'New Job Application Inquiry');

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        setMessage("Thank you! We'll get back to you soon.");
        reset();
        setTimeout(() => setIsModalOpen(false), 3000);
      } else {
        setIsSuccess(false);
        setMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('Something went wrong. Please try again.');
    }
  };

  // Professional SVG Icons Component
  const TechIcon = ({ type }) => {
    const icons = {
      information: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      engineering: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      government: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      aerospace: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      legal: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      )
    };
    return icons[type] || null;
  };

  const jobCategories = [
    {
      title: "Information Technology",
      type: "information",
      description: "Digital solutions and technology innovation services",
      link: "/Find-tech-jobs/Information-technology"
    },
    {
      title: "Engineering",
      type: "engineering",
      description: "Advanced engineering solutions and technical expertise",
      link: "/Find-tech-jobs/engineering"
    },
    {
      title: "Government Services",
      type: "government",
      description: "Public sector consulting and administrative solutions",
      link: "/Find-tech-jobs/government-services"
    },
    {
      title: "Aerospace Staffing",
      type: "aerospace",
      description: "Specialized aerospace and defense industry staffing",
      link: "/Find-tech-jobs/aerospace-staffing"
    },
    {
      title: "Legal & Litigation",
      type: "legal",
      description: "Comprehensive legal staffing and litigation support services",
      link: "/Find-tech-jobs/legal-and-litigation"
    }
  ];

  // Location icons
  const LocationIcon = ({ country }) => {
    if (country === 'India') {
      return (
        <div className="w-20 h-20 bg-gradient-to-br from-[#00d9a6] to-[#c5f82a] rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-20 h-20 bg-gradient-to-br from-[#00d9a6] to-[#c5f82a] rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
      );
    }
  };

  const locations = [
    {
      name: "India",
      description: "Thriving tech ecosystem with innovation opportunities",
      highlight: "Remote & Hybrid Options"
    },
    {
      name: "United States",
      description: "Silicon Valley and nationwide tech leadership",
      highlight: "Visa Sponsorship Available"
    }
  ];

  return (
    <>
      <Head>
        <title>Find Tech Jobs & Career Opportunities – Quore IT</title>
        <meta name="description" content="Explore top-tier career opportunities in IT, Engineering, Government Services, and Aerospace with Quore IT. Find your next role in India or the United States." />
        <meta property="og:title" content="Find Tech Jobs & Career Opportunities – Quore IT" />
        <meta property="og:description" content="Quore IT connects professionals with premier IT, engineering & aerospace roles. Discover your next career move with our global recruitment expertise." />
        <meta name="keywords" content="tech jobs, IT careers, engineering recruitment, aerospace jobs, government IT roles, Quore IT careers" />
      </Head>

      {/* Minimalist Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0 ">
          <Image
            src="/images/women1.webp"
            alt="Professional Technology Solutions"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-7xl md:text-7xl font-light text-white mb-12 tracking-tight py-14">
            Quore IT
            <br />
            <span className="font-bold text-[#00d9a6]">Career Solutions</span>
          </h1>
          <p className="text-2xl text-gray-200 mb-16 font-light leading-relaxed">
            Digital innovation and technology excellence
          </p>

          <Link href="/Contact-us">
            <button className="inline-flex items-center px-12 py-6 bg-[#00d9a6] text-black font-semibold rounded-full hover:bg-[#c5f82a] transform hover:scale-105 transition-all duration-300 shadow-2xl">
              Explore Opportunities
              <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </Link>
        </div>
      </section>

      {/* Career Categories - Grid Layout */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-6xl font-light text-gray-900 mb-8">
              Career <span className="font-bold text-[#00d9a6]">Domains</span>
            </h2>
            <div className="w-24 h-1 bg-[#00d9a6] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {jobCategories.map((category, index) => (
              <div key={index} className={`group ${index === 4 ? 'md:col-span-2 md:max-w-lg md:mx-auto' : ''}`}>
                <Link href={category.link}>
                  <div className="bg-white rounded-3xl p-12 shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-[#00d9a6]/20 transform hover:-translate-y-4 transition-all duration-500 cursor-pointer">
                    <div className="text-[#00d9a6] mb-8 group-hover:scale-110 transition-transform duration-300">
                      <TechIcon type={category.type} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 group-hover:text-[#00d9a6] transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                      {category.description}
                    </p>
                    <div className="flex items-center text-[#00d9a6] font-semibold group-hover:translate-x-2 transition-transform">
                      Explore Domain
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations - Side by Side Layout */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-6xl font-light text-gray-900 mb-8">
              Global <span className="font-bold text-[#00d9a6]">Markets</span>
            </h2>
            <div className="w-24 h-1 bg-[#00d9a6] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {locations.map((location, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-16 hover:from-[#00d9a6]/5 hover:to-[#c5f82a]/5 transform hover:-translate-y-4 transition-all duration-500">
                  <div className="flex items-center justify-center mb-12">
                    <LocationIcon country={location.name} />
                  </div>

                  <h3 className="text-4xl font-bold text-center text-gray-900 mb-8 group-hover:text-[#00d9a6] transition-colors">
                    {location.name}
                  </h3>

                  <p className="text-xl text-gray-600 text-center mb-12 leading-relaxed">
                    {location.description}
                  </p>

                  <div className="bg-white rounded-2xl p-6 mb-12 border-l-4 border-[#00d9a6]">
                    <p className="text-gray-700 font-semibold text-center">
                      {location.highlight}
                    </p>
                  </div>

                  <div className="text-center">
                    <Link href="/Contact-us">
                      <button className="inline-flex items-center px-10 py-4 bg-[#00d9a6] text-black font-semibold rounded-full hover:bg-[#c5f82a] transform hover:scale-105 transition-all duration-300">
                        Explore {location.name}
                        <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Features Section */}
      <section className="py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-6xl font-light text-white mb-8">
              Why Choose <span className="font-bold text-[#00d9a6]">Quore IT</span>
            </h2>
            <div className="w-24 h-1 bg-[#00d9a6] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              {
                title: "Industry Expertise",
                description: "Specialized knowledge across Information Technology, Engineering, Government, and Aerospace sectors."
              },
              {
                title: "Global Reach",
                description: "Strategic presence in key markets with deep understanding of local and international requirements."
              },
              {
                title: "Innovation Focus",
                description: "Cutting-edge solutions that drive digital transformation and technological advancement."
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-2 h-32 bg-gradient-to-b from-[#00d9a6] to-[#c5f82a] mx-auto mb-8 rounded-full"></div>
                <h3 className="text-2xl font-bold text-white mb-8">
                  {feature.title}
                </h3>
                <p className="text-xl text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative py-32 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/key.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h2 className="text-6xl font-light text-white mb-12">
            Ready to <span className="font-bold text-[#00d9a6]">Innovate</span>
          </h2>
          <p className="text-2xl text-gray-200 mb-16 leading-relaxed">
            Join the future of technology and digital transformation
          </p>

          <a href="https://open-jobs.quoreit.com/" target="_blank" rel="noopener noreferrer">
            <button className="inline-flex items-center px-12 py-6 bg-[#00d9a6] text-black font-semibold rounded-full hover:bg-[#c5f82a] transform hover:scale-105 transition-all duration-300 shadow-2xl text-xl">
              Get Started
              <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </a>
        </div>
      </section>

      {/* Professional Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-80" onClick={() => setIsModalOpen(false)}></div>

            <div className="inline-block px-8 pt-8 pb-8 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-3xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-10">
              <div className="absolute top-8 right-8">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-10">
                <h3 className="text-4xl font-light text-gray-900 mb-4">
                  Let's <span className="font-bold text-[#00d9a6]">Connect</span>
                </h3>
                <p className="text-gray-600 text-lg">Share your background and we'll match you with ideal opportunities.</p>
                {selectedLocation && (
                  <div className="mt-6 p-4 bg-[#00d9a6]/10 rounded-2xl">
                    <p className="text-[#00d9a6] font-semibold">Focus: {selectedLocation} Market</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <input type="checkbox" className="hidden" {...register("botcheck")} />

                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className={`w-full px-6 py-4 border-2 rounded-2xl outline-none transition-colors text-lg ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#00d9a6]'
                      }`}
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>}
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Professional Email"
                    className={`w-full px-6 py-4 border-2 rounded-2xl outline-none transition-colors text-lg ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#00d9a6]'
                      }`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                    })}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>}
                </div>

                <div>
                  <select
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-[#00d9a6] transition-colors text-lg"
                    {...register("experience", { required: "Please select experience level" })}
                  >
                    <option value="">Experience Level</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (2-5 years)</option>
                    <option value="senior">Senior Level (5+ years)</option>
                    <option value="principal">Principal/Lead (8+ years)</option>
                  </select>
                  {errors.experience && <p className="text-red-500 text-sm mt-2">{errors.experience.message}</p>}
                </div>

                <div>
                  <select
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-[#00d9a6] transition-colors text-lg"
                    {...register("location", { required: "Please select preferred location" })}
                    defaultValue={selectedLocation.toLowerCase().replace(' ', '')}
                  >
                    <option value="">Preferred Market</option>
                    <option value="india">India</option>
                    <option value="unitedstates">United States</option>
                    <option value="remote">Remote</option>
                  </select>
                  {errors.location && <p className="text-red-500 text-sm mt-2">{errors.location.message}</p>}
                </div>

                <div>
                  <textarea
                    placeholder="Tell us about your background and career goals..."
                    rows={4}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-[#00d9a6] transition-colors resize-none text-lg"
                    {...register("message", { required: "Please share your background" })}
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-sm mt-2">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#00d9a6] text-black font-semibold rounded-2xl hover:bg-[#c5f82a] transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-3 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </form>

              {message && (
                <div className={`mt-6 p-4 rounded-2xl text-center font-semibold ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FindJobsPage;
