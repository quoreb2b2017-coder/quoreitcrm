

import {
  Facebook,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Heart,
  ChevronUp,
  Globe,
  Shield,
  Clock,
  Users,
  Rocket,
  Target,
  Zap,
  Newspaper,
  MessageCircle,
  Lock,
  FileText,
  Scale,
  Handshake,
  BarChart3,
  Send
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  
  return (
    <footer className="relative text-white overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/images/f1.jpg"
            alt="Footer Background"
            fill
            className="object-cover object-center"
            priority
            quality={100}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-black/95 backdrop-blur-[2px]"></div>

        {/* Animated Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
          }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >

            {/* Brand Section */}
            <motion.div className="lg:col-span-1 space-y-8" variants={itemVariants}>
              <div className="group cursor-pointer inline-block">
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-green-500/30 group-hover:border-green-400/50 transition-all duration-500 backdrop-blur-md">
                      <span className="text-white font-bold text-2xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Q</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                      QuoreIT
                    </h1>
                  </div>
                </div>
                <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full group-hover:w-full transition-all duration-700 ease-out"></div>
              </div>

              <p className="text-slate-300 text-base leading-relaxed max-w-sm">
                Pioneering the future of technology recruitment. Connecting visionary talent with revolutionary organizations across the globe.
              </p>

              {/* Contact Info */}
              <div className="space-y-4 pt-4">
                {[
                  { Icon: Mail, text: "contactus@quoreit.com", label: "Email" },
                  { Icon: Phone, text: "+1 332-231-0404", label: "Phone" }
                ].map(({ Icon, text, label }, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-4 group cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10"
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors duration-300">
                      <Icon className="w-5 h-5 text-slate-400 group-hover:text-green-400 transition-colors duration-300" />
                    </div>
                    <div>
                      <div className="text-slate-200 font-medium group-hover:text-white transition-colors">{text}</div>
                      <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors uppercase tracking-wider">{label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Services Section */}
            <motion.div className="space-y-8" variants={itemVariants}>
              <div className="relative inline-block">
                <h3 className="text-xl font-bold text-white mb-1">Services</h3>
                <div className="h-1 w-full bg-gradient-to-r from-green-500 to-transparent rounded-full opacity-50"></div>
              </div>

              <ul className="space-y-3">
                {[
                  { label: "Find Tech Jobs", path: "/Find-tech-jobs", Icon: Rocket },
                  { label: "Submit Vacancy", path: "/Find-tech-talent", Icon: Users },
                  { label: "What We Do", path: "/What-we-do", Icon: Zap },
                  { label: "News & Events", path: "https://blog.quoreit.com/", Icon: Newspaper },
                  { label: "About Us", path: "/About-Us", Icon: Target },
                  { label: "Contact Us", path: "/Contact-us", Icon: MessageCircle },
                ].map(({ label, path, Icon }, idx) => (
                  <li key={idx}>
                    <Link
                      href={path}
                      className="group flex items-center gap-3 p-2 text-slate-300 hover:text-green-400 transition-all duration-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-green-400 group-hover:scale-150 transition-all duration-300"></span>
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources Section */}
            <motion.div className="space-y-8" variants={itemVariants}>
              <div className="relative inline-block">
                <h3 className="text-xl font-bold text-white mb-1">Resources</h3>
                <div className="h-1 w-full bg-gradient-to-r from-green-500 to-transparent rounded-full opacity-50"></div>
              </div>

              <ul className="space-y-3">
                {[
                  { label: "Privacy Policy", path: "/Policies/Privacy-Policy" },
                  { label: "Terms of Service", path: "/Policies/Terms-of-Service" },
                  { label: "Cookies & Legal", path: "/Policies/Cookies-Legal" },
                  { label: "Modern Slavery", path: "/Policies/Modern-Slavery-Statement" },
                ].map(({ label, path }, idx) => (
                  <li key={idx}>
                    <Link
                      href={path}
                      className="group flex items-center gap-3 p-2 text-slate-300 hover:text-green-400 transition-all duration-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-green-400 group-hover:scale-150 transition-all duration-300"></span>
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Connect Section */}
            <motion.div className="space-y-8" variants={itemVariants}>
              <div className="relative inline-block">
                <h3 className="text-xl font-bold text-white mb-1">Stay Connected</h3>
                <div className="h-1 w-full bg-gradient-to-r from-green-500 to-transparent rounded-full opacity-50"></div>
              </div>

              <div className="flex gap-4">
                {[
                  { Icon: Linkedin, href: "https://www.linkedin.com/company/quore-it/", label: "LinkedIn" },
                ].map(({ Icon, href, label }, idx) => (
                  <motion.a
                    key={idx}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-700 hover:border-green-500/50 hover:bg-green-500/10 transition-all duration-300 group relative overflow-hidden"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-5 h-5 text-slate-300 group-hover:text-green-400 relative z-10 transition-colors" />
                    <div className="absolute inset-0 bg-green-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </motion.a>
                ))}
              </div>

              {/* Newsletter / CTA */}
              <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                <h4 className="text-white font-semibold mb-2">Ready to transform?</h4>
                <p className="text-slate-400 text-sm mb-4">Join the future of recruitment today.</p>
                <Link
                  href="/Contact-us"
                  className="block w-full text-center py-2.5 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/60 bg-slate-950/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <p className="text-slate-500 text-sm">
                  © {new Date().getFullYear()} QuoreIT. All Rights Reserved.
                </p>
                <div className="hidden md:block w-1 h-1 bg-slate-700 rounded-full"></div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>Designed for Tech Professionals</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-green-500 text-xs font-medium">System Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
