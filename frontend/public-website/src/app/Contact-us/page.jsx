'use client';
import React, { useRef } from 'react';
import Head from 'next/head';
import ContactHero from '../../components/contact/ContactHero';
import ContactServices from '../../components/contact/ContactServices';
import GlobalOffices from '../../components/contact/GlobalOffices';
import SecurityAlert from '../../components/contact/SecurityAlert';
import ContactForm from '../../components/contact/ContactForm';

const ContactUs = () => {
  const formRef = useRef(null);
  const officesRef = useRef(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToOffices = () => {
    officesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Contact Quore IT – Get in Touch for IT Staffing & Recruitment</title>
        <meta
          name="description"
          content="Contact Quore IT for expert IT staffing and recruitment services. Whether you are a business looking for talent or a professional seeking opportunity, our team is here to help."
        />
        <meta name="keywords" content="contact Quore IT, IT staffing inquiries, hire talent, technical recruitment contact" />
      </Head>
      <ContactHero
        scrollToForm={scrollToForm}
        scrollToOffices={scrollToOffices}
      />

      <ContactServices scrollToForm={scrollToForm} />

      <GlobalOffices officesRef={officesRef} />

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        {/* Background Decorative - Simplified for professional look */}
        <div className="absolute inset-0 z-0 opacity-50">
          <div className="absolute top-0 left-0 w-full h-full bg-[#f9fafb]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Security Alert - Now stretches to match height */}
            <div className="lg:col-span-5 h-full">
              <SecurityAlert />
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7 h-full">
              <ContactForm formRef={formRef} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
