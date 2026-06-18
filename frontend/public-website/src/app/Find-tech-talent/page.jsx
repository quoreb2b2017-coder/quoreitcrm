'use client';
  import Head from 'next/head';
import React from 'react';
import Image from 'next/image';
import { useForm } from "react-hook-form";
import { useState } from "react";
 
const TechTalent = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data) => {
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_key: '613d3f89-d888-4927-a609-99541b5d46ba', // 🔐 Replace this
          ...data
        })
      });

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        alert("Something went wrong: " + result.message);
      }
    } catch (error) {
      alert("Submission failed.");
      console.error(error);
    }
  };
  return (
    <>
    <Head>
  <title>Hire Top Tech Talent | Build Your Dream Tech Team</title>
  <meta name="description" content="Looking to hire developers, engineers, or IT professionals? Share your requirements and let us connect you with top-tier tech talent globally." />

  {/* Open Graph / Facebook */}
  <meta property="og:title" content="Hire Top Tech Talent | Build Your Dream Tech Team" />
  <meta property="og:description" content="We help companies hire highly skilled developers and engineers. Fill out the form to get matched with vetted tech talent." />
  <meta property="og:image" content="/images/talent_hero.jpg" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://yourdomain.com/tech-talent" />

  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Hire Top Tech Talent | Build Your Dream Tech Team" />
  <meta name="twitter:description" content="Share your tech hiring needs and let us help you recruit the best global developers and engineers." />
  <meta name="twitter:image" content="/images/talent_hero.jpg" />
</Head>
    <section className="relative h-96 flex items-center justify-center overflow-hidden mt-25">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/talent_hero.jpg" // Replace with your actual hero background image
          alt="Tech Talent Hero Background"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white tracking-wide">
          Find Tech Talent
        </h1>
      </div>
    </section>
    <section className="max-w-4xl mx-auto p-6">
      <h2 className="text-4xl font-bold mb-2 text-gray-800">Let us help you</h2>
      <p className="text-gray-600 mb-4">
        We have solved almost every problem imaginable when it comes to recruiting technology experts.
      </p>

      {submitted ? (
        <div className="bg-gradient-to-r from-[#c5f82a] to-[#00d9a6] text-white p-6 rounded shadow text-center text-xl font-semibold">
          Thank you! Your submission has been received!
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded shadow">

          <input type="hidden" name="access_key" value="YOUR_WEB3FORM_ACCESS_KEY" />

          {/* Name and Job Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Name *</label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className="w-full border rounded p-2"
              />
              {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
            </div>
            <div>
              <label className="block font-medium mb-1">Your Job Title</label>
              <input
                type="text"
                {...register("jobTitle")}
                className="w-full border rounded p-2"
                list="jobTitles"
              />
              <datalist id="jobTitles">
                <option value="CTO" />
                <option value="HR Manager" />
                <option value="Team Lead" />
                <option value="Hiring Manager" />
              </datalist>
            </div>
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Email *</label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="w-full border rounded p-2"
              />
              {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            </div>
            <div>
              <label className="block font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                {...register("phone")}
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block font-medium mb-1">Company Name *</label>
            <input
              type="text"
              {...register("companyName", { required: "Company name is required" })}
              className="w-full border rounded p-2"
            />
            {errors.companyName && <span className="text-red-500 text-sm">{errors.companyName.message}</span>}
          </div>

          {/* Role Count */}
          <div>
            <label className="block font-medium mb-1">How many roles are you looking to fill?</label>
            <input
              type="number"
              {...register("roleCount")}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Technical Skills */}
          <div>
            <label className="block font-medium mb-1">What technical skills does the candidate(s) require? *</label>
            <textarea
              {...register("skills", { required: "Please specify required skills" })}
              className="w-full border rounded p-2"
              rows={2}
            />
            {errors.skills && <span className="text-red-500 text-sm">{errors.skills.message}</span>}
          </div>

          {/* Start Date */}
          <div>
            <label className="block font-medium mb-1">When would you like the candidate(s) to start work?</label>
            <input
              type="date"
              {...register("startDate")}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block font-medium mb-1">Where will the candidate(s) be located?</label>
            <textarea
              {...register("location")}
              className="w-full border rounded p-2"
              rows={2}
            />
          </div>

          {/* Salary */}
          <div>
            <label className="block font-medium mb-1">What salary are you hoping to offer?</label>
            <textarea
              {...register("salary")}
              className="w-full border rounded p-2"
              rows={2}
            />
          </div>

          {/* Privacy Policy */}
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              {...register("acceptPolicy", { required: true })}
              className="mt-1"
            />
            <div className="text-sm text-gray-700">
              <label>
                Please read our{" "}
                <a href="#" className="text-blue-600 underline">privacy policy</a> to find out how we use personal data,
                as well as how to change your preferences. Should you ever wish to unsubscribe from Harvey Nash marketing
                communications, please email{" "}
                <a href="mailto:contactus@quoreitgmail.com" className="text-blue-600 underline">contactus@quoreitgmail.com</a> with
                ‘unsubscribe’ in the subject line.
              </label>
              {errors.acceptPolicy && (
                <div className="text-red-500 text-sm mt-1">* This field is required</div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-[#c5f82a] to-[#00d9a6] text-white px-6 py-2 rounded shadow hover:opacity-90"
          >
            SUBMIT
          </button>
        </form>
      )}
    </section>
    </>
  );
};

export default TechTalent;