'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ContactForm = ({ formRef }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        preferredOffice: '',
        message: '',
        accept: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');
    const [activeField, setActiveField] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const validateForm = () => {
        const errors = {};
        if (!formData.firstName.trim()) errors.firstName = 'First name is required';
        if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        if (!formData.message.trim()) errors.message = 'Please share your message with us';
        if (!formData.accept) errors.accept = 'You must accept the privacy policy to continue';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus('');

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSubmitStatus('successfully_submitted');
            setFormData({
                firstName: '', lastName: '', email: '', phone: '',
                location: '', preferredOffice: '', message: '', accept: false
            });
            setFormErrors({});
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = (fieldName) => `
    w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 text-sm
    transition-all duration-200 outline-none
    ${formErrors[fieldName]
            ? 'border-red-300 focus:border-red-500 bg-red-50/10'
            : activeField === fieldName
                ? 'border-teal-500 bg-white ring-1 ring-teal-500'
                : 'hover:border-gray-300 focus:border-gray-300'
        }
  `;

    return (
        <div ref={formRef} className="h-full">
            <motion.div
                className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-8 sm:p-10 border border-gray-100 h-full flex flex-col"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <div className="mb-8">
                    <p className="text-gray-500 text-sm">We'd love to hear from you. Fill out the form below and we'll get back to you shortly.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <AnimatePresence>
                        {submitStatus === 'successfully_submitted' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-teal-50 border border-teal-100 rounded-lg p-4 text-center text-teal-800 text-sm"
                            >
                                <p className="font-semibold">Thank you!</p>
                                <p>We've received your message and will be in touch within 24 hours.</p>
                            </motion.div>
                        )}
                        {/* Error Message similar structure... */}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField
                            label="First Name *"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            onFocus={() => setActiveField('firstName')}
                            onBlur={() => setActiveField('')}
                            error={formErrors.firstName}
                            className={inputClasses('firstName')}
                        />
                        <InputField
                            label="Last Name *"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            onFocus={() => setActiveField('lastName')}
                            onBlur={() => setActiveField('')}
                            error={formErrors.lastName}
                            className={inputClasses('lastName')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField
                            label="Email Address *"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onFocus={() => setActiveField('email')}
                            onBlur={() => setActiveField('')}
                            error={formErrors.email}
                            className={inputClasses('email')}
                        />
                        <InputField
                            label="Phone Number"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            onFocus={() => setActiveField('phone')}
                            onBlur={() => setActiveField('')}
                            className={inputClasses('phone')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField
                            label="Location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            onFocus={() => setActiveField('location')}
                            onBlur={() => setActiveField('')}
                            className={inputClasses('location')}
                            placeholder="City, Country"
                        />
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Preferred Office</label>
                            <div className="relative">
                                <select
                                    name="preferredOffice"
                                    value={formData.preferredOffice}
                                    onChange={handleInputChange}
                                    onFocus={() => setActiveField('preferredOffice')}
                                    onBlur={() => setActiveField('')}
                                    className={`${inputClasses('preferredOffice')} appearance-none cursor-pointer`}
                                >
                                    <option value="">Select an office</option>
                                    <option value="us">🇺🇸 US Office (Texas)</option>
                                    <option value="india">🇮🇳 India Office (Pune)</option>
                                    <option value="either">Either / Remote</option>
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Your Message *</label>
                        <textarea
                            name="message"
                            rows={4}
                            value={formData.message}
                            onChange={handleInputChange}
                            onFocus={() => setActiveField('message')}
                            onBlur={() => setActiveField('')}
                            className={`${inputClasses('message')} resize-none`}
                            placeholder="Tell us about your project or inquiry..."
                        />
                        {formErrors.message && (
                            <p className="mt-1 text-xs text-red-500 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                {formErrors.message}
                            </p>
                        )}
                    </div>

                    <div className={`p-4 rounded-lg transition-colors duration-300 ${formErrors.accept ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-gray-100'}`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="accept"
                                checked={formData.accept}
                                onChange={handleInputChange}
                                className="mt-0.5 w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                            />
                            <div className="text-sm">
                                <span className="font-bold text-gray-900 block mb-0.5">Privacy Policy Agreement *</span>
                                <span className="text-gray-500 text-xs leading-relaxed">
                                    I agree to the privacy policy and consent to the collection of my information for the purpose of this inquiry.
                                </span>
                            </div>
                        </label>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={!isSubmitting ? { scale: 1.01 } : {}}
                        whileTap={!isSubmitting ? { scale: 0.99 } : {}}
                        className={`w-full py-3.5 rounded-lg font-bold text-white shadow-sm transition-all duration-300 ${isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-teal-500 hover:bg-teal-600 hover:shadow-md'
                            }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            </span>
                        ) : (
                            'Send Message'
                        )}
                    </motion.button>
                    <div className="mt-auto pt-8">
                        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Or reach us directly</h4>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <a href="mailto:contactus@quoreit.com" className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:text-teal-600 hover:border-teal-200 hover:shadow-sm transition-all flex-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    contactus@quoreit.com
                                </a>
                                <a href="#" className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:text-teal-600 hover:border-teal-200 hover:shadow-sm transition-all flex-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                                    Explore Open Jobs
                                </a>
                            </div>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const InputField = ({ label, error, className, ...props }) => (
    <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{label}</label>
        <input className={className} {...props} />
        {error && (
            <p className="mt-1 text-xs text-red-500 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
            </p>
        )}
    </div>
);

export default ContactForm;
