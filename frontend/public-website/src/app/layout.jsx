
// "use client";
// import { usePathname } from "next/navigation";
// import Script from "next/script";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import ArrowNavigation from '@/components/ArrowNavigation';
// import "./globals.css";

// export default function RootLayout({ children }) {
//   const pathname = usePathname();

//   // Base URLs
//   const mainSiteUrl = "https://www.quoreit.com";
//   const blogSiteUrl = "https://blog.quoreit.com";

//   // Generate canonical URL based on pathname
//   const getCanonicalUrl = (pathname) => {
//     // Remove trailing slash if present (except for root)
//     const cleanPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');

//     // Blog-specific paths that should use blog.quoreit.com
//     const blogPaths = [
//       '/Insights',
//       '/Insights/Tech-Talks',
//       '/Insights/Digital-Leadership-Report-2025',
//       '/Insights/Diversity-Inclusion',
//       '/Insights/Women-in-Tech',
//       '/Insights/Cybersecurity',
//       '/Insights/Comment-Analysis',
//       '/Insights/Blogs',
//       '/Insights/Tech-Flix',
//       '/Insights/Parliamentary-Tech-Champions',
//     ];

//     // Check if current path is blog-related
//     const isBlogPath = blogPaths.some(blogPath => pathname.startsWith(blogPath));

//     if (isBlogPath) {
//       return `${blogSiteUrl}${cleanPath}`;
//     }

//     return `${mainSiteUrl}${cleanPath}`;
//   };

//   const canonicalUrl = getCanonicalUrl(pathname);

//   const hiddenPaths = [
//     "/Policies/Accessibility-statement",
//     "/Quick-Links/What-we-do",
//     "/Quick-Links/About-us",
//     "/Quick-Links/Our-Brands",
//     "/Quick-Links/Newsroom",
//     "/Quick-Links/Work-for-us",
//     "/Quick-Links/Contact-us",
//     "/Quick-Links/Wellbeing-Hub",
//     "/Insights/Tech-Talks",
//     "/Insights/Digital-Leadership-Report-2025",
//     "/Insights/Diversity-Inclusion",
//     "/Insights/Women-in-Tech",
//     "/Insights/Cybersecurity",
//     "/Insights/Comment-Analysis",
//     "/Insights/Blogs",
//     "/Insights/Tech-Flix",
//     "/Insights/Parliamentary-Tech-Champions",
//     "/Insights/Parliamentary-Tech-Champions/Baroness-smith-of-llanfaes",
//     "/DigitalLeadershipBanner"
//   ];

//   const hideLayout = hiddenPaths.some((path) => pathname?.startsWith(path));

//   return (
//     <html lang="en">
//       <head>
//         {/* Basic Meta Tags */}
//         <meta charSet="utf-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <meta name="theme-color" content="#000000" />

//         {/* Google Site Verification Meta Tag */}
//         <meta name="google-site-verification" content="5b7bb9c11b9406a" />

//         {/* Canonical URL - IMPORTANT FOR SEO */}
//         <link rel="canonical" href={canonicalUrl} />

//         {/* SEO Meta Tags */}
//         <title>Quore IT – Technology Staffing & Recruitment Solutions</title>
//         <meta name="description" content="Quore IT connects businesses with premier IT, engineering & aerospace talent. From startups to enterprises, we deliver precision hiring, tech insight, and long-term partnerships." />
//         <meta name="keywords" content="digital innovation, technology solutions, tech insights, cybersecurity, digital leadership, tech talks, quore it" />
//         <meta name="author" content="Quore IT" />
//         <meta name="robots" content="index, follow" />
//         <meta name="language" content="English" />

//         {/* Open Graph / Facebook Meta Tags */}
//         <meta property="og:type" content="website" />
//         <meta property="og:url" content={canonicalUrl} />
//         <meta property="og:title" content="Quore IT – Technology Staffing & Recruitment Solutions" />
//         <meta property="og:description" content="Quore IT connects businesses with premier IT, engineering & aerospace talent. From startups to enterprises, we deliver precision hiring, tech insight, and long-term partnerships." />
//         <meta property="og:image" content={`${mainSiteUrl}/images/image.png`} />
//         <meta property="og:image:width" content="1200" />
//         <meta property="og:image:height" content="630" />
//         <meta property="og:site_name" content="Quore IT" />
//         <meta property="og:locale" content="en_US" />

//         {/* Twitter Card Meta Tags */}
//         <meta property="twitter:card" content="summary_large_image" />
//         <meta property="twitter:url" content={canonicalUrl} />
//         <meta property="twitter:title" content="Quore IT – Technology Staffing & Recruitment Solutions" />
//         <meta property="twitter:description" content="Quore IT connects businesses with premier IT, engineering & aerospace talent. From startups to enterprises, we deliver precision hiring, tech insight, and long-term partnerships." />
//         <meta property="twitter:image" content={`${mainSiteUrl}/images/image.png`} />
//         <meta property="twitter:creator" content="@quoreit" />
//         <meta property="twitter:site" content="@quoreit" />

//         {/* Favicon - Simple approach with timestamp */}
//         <link rel="icon" href={`/images/image.png?t=${Date.now()}`} type="image/png" />
//         <link rel="shortcut icon" href={`/images/image.png?t=${Date.now()}`} type="image/png" />
//         <link rel="apple-touch-icon" href={`/images/image.png?t=${Date.now()}`} />

//         {/* Additional Icons (if you have them) */}
//         <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
//         <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
//         <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png" />
//         <link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png" />
//         <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png" />
//         <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png" />
//         <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png" />
//         <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png" />
//         <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png" />
//         <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
//         <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
//         <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
//         <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />

//         {/* Web App Manifest */}
//         <link rel="manifest" href="/site.webmanifest" />

//         {/* Safari Pinned Tab */}
//         <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />

//         {/* Microsoft Tiles */}
//         <meta name="msapplication-TileColor" content="#000000" />
//         <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
//         <meta name="msapplication-config" content="/browserconfig.xml" />

//         {/* Additional Meta Tags */}
//         <meta name="application-name" content="Quore IT" />
//         <meta name="apple-mobile-web-app-title" content="Quore IT" />
//         <meta name="apple-mobile-web-app-capable" content="yes" />
//         <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
//         <meta name="format-detection" content="telephone=no" />

//         {/* Preconnect to external domains for performance */}
//         <link rel="preconnect" href="https://fonts.googleapis.com" />
//         <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
//         <link rel="preconnect" href="https://consent.cookiebot.com" />

//         {/* DNS Prefetch */}
//         <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
//         <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

//         {/* Cookiebot preview script */}
//         <script
//           id="Cookiebot"
//           src="https://consent.cookiebot.com/78869508-adbc-4a8b-af19-83bdf0866c05/cd.js"
//           data-cbid="78869508-adbc-4a8b-af19-83bdf0866c05"
//           data-blockingmode="auto"
//           data-culture="EN"
//           type="text/javascript"
//         ></script>

//         {/* Structured Data - Organization Schema */}
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{
//             __html: JSON.stringify({
//               "@context": "https://schema.org",
//               "@type": "Organization",
//               "name": "Quore IT",
//               "url": canonicalUrl,
//               "logo": `${mainSiteUrl}/images/image.png`,
//               "description": "Quore IT - Leading digital innovation company providing cutting-edge technology solutions, insights, and expertise across various industries.",
//               "sameAs": [
//                 "https://www.linkedin.com/company/quoreit",
//                 "https://twitter.com/quoreit",
//                 "https://www.facebook.com/quoreit"
//               ],
//               "contactPoint": {
//                 "@type": "ContactPoint",
//                 "contactType": "customer service",
//                 "url": `${mainSiteUrl}/Quick-Links/Contact-us`
//               }
//             })
//           }}
//         />
//       </head>
//       <body className="bg-white text-black dark:bg-black dark:text-white">
//         <ArrowNavigation />
//         {!hideLayout && <Navbar />}
//         <main className="min-h-screen flex flex-col justify-between">
//           <div className="flex-grow">{children}</div>
//           {!hideLayout && <Footer />}
//         </main>
//       </body>
//     </html>
//   );
// }
"use client";
import { usePathname } from "next/navigation";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArrowNavigation from '@/components/ArrowNavigation';
import "./globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Base URLs
  const mainSiteUrl = "https://www.quoreit.com";
  const blogSiteUrl = "https://blog.quoreit.com";

  // Generate canonical URL based on pathname
  const getCanonicalUrl = (pathname) => {
    const cleanPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');

    const blogPaths = [
      '/Insights',
      '/Insights/Tech-Talks',
      '/Insights/Digital-Leadership-Report-2025',
      '/Insights/Diversity-Inclusion',
      '/Insights/Women-in-Tech',
      '/Insights/Cybersecurity',
      '/Insights/Comment-Analysis',
      '/Insights/Blogs',
      '/Insights/Tech-Flix',
      '/Insights/Parliamentary-Tech-Champions',
    ];

    const isBlogPath = blogPaths.some(blogPath => pathname.startsWith(blogPath));

    if (isBlogPath) {
      return `${blogSiteUrl}${cleanPath}`;
    }

    return `${mainSiteUrl}${cleanPath}`;
  };

  // Comprehensive dynamic metadata based on pathname
  const getMetadata = (pathname) => {
    const metadata = {
      title: "Quore IT – Technology Staffing & Recruitment Solutions",
      description: "Quore IT connects businesses with premier IT, engineering & aerospace talent. From startups to enterprises, we deliver precision hiring, tech insight, and long-term partnerships.",
      keywords: "Quore IT, technology staffing, IT recruitment, engineering talent, aerospace staffing, recruitment solutions, tech talent acquisition"
    };

    switch (pathname) {
      // Main Pages
      case '/':
        return {
          title: "Quore IT | Global Technology Staffing & Workforce Solutions",
          description: "Quore IT is a leading technology staffing agency connecting businesses with top-tier IT, engineering, and aerospace talent. We provide precision recruitment services worldwide.",
          keywords: "Quore IT, tech staffing, IT recruitment agency, engineering hiring, aerospace recruitment, workforce solutions"
        };
      case '/What-we-do':
      case '/Quick-Links/What-we-do':
        return {
          title: "Our Services – Quore IT Technology & Workforce Solutions",
          description: "Discover Quore IT's comprehensive staffing services: permanent recruitment, contract solutions, RPO, and managed workforce programs tailored for the tech industry.",
          keywords: "tech recruitment services, RPO solutions, managed workforce, Quore IT services, permanent staffing, contract hiring"
        };

      case '/Find-tech-jobs':
        return {
          title: "Careers at Quore IT – Explore Tech Job Opportunities",
          description: "Discover exciting roles in IT, engineering, government services & aerospace. Join Quore IT's global network and accelerate your career in technology.",
          keywords: "tech jobs, IT careers, engineering jobs, government services jobs, aerospace careers, quore it careers, technology opportunities"
        };

      case '/Find-tech-jobs/Information-technology':
        return {
          title: "IT Recruitment & Talent – Quore IT Information Technology Jobs",
          description: "We connect businesses with top IT professionals across software, cloud, AI, DevOps, cybersecurity & more. Explore opportunities or hire expert talent.",
          keywords: "IT recruitment, software jobs, cloud computing, AI jobs, DevOps, cybersecurity, IT talent, technology professionals"
        };

      case '/Find-tech-jobs/engineering':
        return {
          title: "Engineering Careers – Quore IT Engineering Recruitment",
          description: "Discover engineering opportunities across diverse industries. From mechanical to software engineering, find your next career move with Quore IT.",
          keywords: "engineering jobs, mechanical engineering, software engineering, engineering careers, technical recruitment"
        };

      case '/Find-tech-jobs/government-services':
        return {
          title: "Government Services Careers – Quore IT Public Sector Jobs",
          description: "Explore government and public sector technology roles. Join teams making a difference in public service with cutting-edge technology solutions.",
          keywords: "government jobs, public sector careers, government technology, public service, compliance roles"
        };

      case '/Find-tech-jobs/aerospace-staffing':
        return {
          title: "Aerospace Careers – Quore IT Aerospace & Defense Jobs",
          description: "Launch your aerospace career with leading industry organizations. From avionics to space technology, find specialized aerospace opportunities.",
          keywords: "aerospace jobs, defense careers, avionics, space technology, aerospace engineering, defense contracting"
        };

      case '/Find-tech-talent':
        return {
          title: "Find Tech Talent – Quore IT Recruitment Services",
          description: "Partner with Quore IT to find exceptional technology talent. Access our network of vetted IT, engineering, and aerospace professionals.",
          keywords: "find tech talent, hire IT professionals, recruitment services, technology hiring, talent acquisition"
        };

      case '/Insights':
        return {
          title: "Quore IT Blog – Technology Insights, Trends & Analysis",
          description: "Stay updated with the latest in technology, recruitment, startups & industry trends. Quore IT shares expert perspectives and research-driven insights.",
          keywords: "technology insights, tech trends, recruitment insights, startup trends, industry analysis, tech blog, digital innovation"
        };

      case '/About-Us':
      case '/Quick-Links/About-us':
        return {
          title: "About Quore IT – Our Mission, Values & Expertise",
          description: "Learn about Quore IT's journey, mission, values, and how we combine domain insight with a global talent network to deliver staffing excellence.",
          keywords: "about quore it, company mission, values, expertise, talent network, staffing excellence, recruitment leaders"
        };

      case '/Contact-us':
      case '/Quick-Links/Contact-us':
        return {
          title: "Contact Quore IT – Get in Touch with Our Team",
          description: "Reach out to Quore IT for hiring, job inquiries, or partnerships. Let's explore how we can support your technology staffing and recruitment needs.",
          keywords: "contact quore it, hiring inquiries, job inquiries, partnerships, technology staffing, recruitment contact"
        };

      // Service-specific Pages
      case '/Services/Aerospace-Staffing':
        return {
          title: "Aerospace Staffing Solutions – Quore IT Aerospace Recruitment",
          description: "Specialized aerospace talent acquisition for leading organizations. From engineers to project managers, we deliver precision aerospace staffing solutions.",
          keywords: "aerospace staffing, aerospace recruitment, aviation talent, defense staffing, aerospace engineers"
        };

      case '/Services/Information-Technology':
        return {
          title: "IT Staffing Services – Quore IT Technology Recruitment",
          description: "Comprehensive IT staffing solutions across all technology domains. From startups to enterprises, we deliver the right technology talent.",
          keywords: "IT staffing, technology recruitment, software developers, IT consultants, tech talent solutions"
        };

      case '/Services/Engineering':
        return {
          title: "Engineering Staffing – Quore IT Engineering Recruitment Services",
          description: "Expert engineering recruitment across multiple disciplines. Connect with top engineering talent for your critical projects and initiatives.",
          keywords: "engineering staffing, engineering recruitment, technical talent, engineering consultants, project engineers"
        };

      case '/Services/Government-Services':
        return {
          title: "Government Staffing – Quore IT Public Sector Recruitment",
          description: "Specialized government and public sector staffing solutions. Navigate compliance requirements while accessing top technology talent.",
          keywords: "government staffing, public sector recruitment, government contractors, compliance staffing, federal jobs"
        };

      // Industry Pages
      case '/Industries/Automotive':
        return {
          title: "Automotive Industry Staffing – Quore IT Automotive Recruitment",
          description: "Specialized automotive technology staffing solutions. From connected vehicles to autonomous systems, we deliver automotive industry expertise.",
          keywords: "automotive staffing, automotive technology, connected vehicles, automotive engineering, EV technology"
        };

      case '/Industries/Financial':
        return {
          title: "Financial Services Staffing – Quore IT FinTech Recruitment",
          description: "Expert financial technology staffing for banks, fintech startups, and financial institutions. Secure top talent for your financial initiatives.",
          keywords: "financial staffing, fintech recruitment, banking technology, financial services, payment systems"
        };

      case '/Industries/Government':
        return {
          title: "Government Technology Staffing – Quore IT Public Sector Solutions",
          description: "Specialized government technology staffing with deep compliance expertise. Support critical public sector technology initiatives.",
          keywords: "government technology, public sector staffing, federal contractors, government IT, compliance technology"
        };

      case '/Industries/Healthcare':
        return {
          title: "Healthcare Technology Staffing – Quore IT HealthTech Recruitment",
          description: "Healthcare technology staffing solutions for hospitals, health systems, and healthtech companies. Expert talent for critical healthcare initiatives.",
          keywords: "healthcare staffing, healthtech recruitment, medical technology, healthcare IT, digital health"
        };

      case '/Industries/Retail':
        return {
          title: "Retail Technology Staffing – Quore IT Retail Tech Recruitment",
          description: "Retail technology staffing for e-commerce, omnichannel, and retail innovation. Connect with talent driving retail transformation.",
          keywords: "retail staffing, retail technology, e-commerce talent, omnichannel solutions, retail innovation"
        };

      case '/Industries/Utilities':
        return {
          title: "Utilities Staffing – Quore IT Energy & Utilities Recruitment",
          description: "Specialized utilities and energy sector staffing. From smart grid to renewable energy, we deliver utility industry expertise.",
          keywords: "utilities staffing, energy recruitment, smart grid, renewable energy, utility technology"
        };

      case '/Industries/Manufacturing':
        return {
          title: "Manufacturing Technology Staffing – Quore IT Industry 4.0 Recruitment",
          description: "Manufacturing technology staffing for Industry 4.0 initiatives. IoT, automation, and smart manufacturing talent solutions.",
          keywords: "manufacturing staffing, industry 4.0, IoT recruitment, automation talent, smart manufacturing"
        };

      // Policy Pages
      case '/Policies/Privacy-Policy':
        return {
          title: "Quore IT – Privacy Policy",
          description: "This Privacy Policy outlines how Quore IT collects, uses, protects, and shares your personal data, in compliance with GDPR, CCPA & India's DPDP Act.",
          keywords: "privacy policy, data protection, GDPR, CCPA, DPDP Act, personal data, data privacy"
        };

      case '/Policies/Terms-of-Service':
        return {
          title: "Quore IT – Terms & Conditions",
          description: "These Terms govern your use of the Quore IT website, services, and legal relationship with us. Please read carefully before use.",
          keywords: "terms and conditions, terms of service, legal terms, website usage, service agreement"
        };

      case '/Policies/Cookies-Legal':
        return {
          title: "Quore IT – Cookies & Legal Notice",
          description: "Learn how Quore IT uses cookies and legal policies governing data, consent, website usage, and global compliance.",
          keywords: "cookies policy, legal notice, data consent, website usage, compliance, cookie management"
        };

      case '/Policies/Modern-Slavery-Statement':
        return {
          title: "Quore IT – Modern Slavery & Ethical Commitment",
          description: "Our commitment to eradicating modern slavery, human trafficking, and unethical labor practices within our operations and supply chain.",
          keywords: "modern slavery statement, ethical commitment, human trafficking, labor practices, supply chain ethics"
        };

      // Blog/Insights Pages
      case '/Insights/Tech-Talks':
        return {
          title: "Tech Talks – Quore IT Technology Discussions & Insights",
          description: "Join industry leaders in technology discussions. Expert insights on emerging trends, innovations, and the future of technology.",
          keywords: "tech talks, technology discussions, tech insights, industry leaders, technology trends"
        };

      case '/Insights/Digital-Leadership-Report-2025':
        return {
          title: "Digital Leadership Report 2025 – Quore IT Industry Analysis",
          description: "Comprehensive analysis of digital leadership trends for 2025. Strategic insights for technology leaders and decision makers.",
          keywords: "digital leadership, technology leadership, 2025 trends, digital transformation, tech strategy"
        };

      case '/Insights/Diversity-Inclusion':
        return {
          title: "Diversity & Inclusion – Quore IT Tech Industry Insights",
          description: "Exploring diversity and inclusion in technology. Best practices, trends, and strategies for building inclusive tech teams.",
          keywords: "diversity inclusion, tech diversity, inclusive hiring, workplace equality, diverse teams"
        };

      case '/Insights/Women-in-Tech':
        return {
          title: "Women in Tech – Quore IT Gender Equality Insights",
          description: "Celebrating and supporting women in technology. Career insights, success stories, and advancement strategies for women in tech.",
          keywords: "women in tech, gender equality, female tech leaders, women technology careers, tech inclusion"
        };

      case '/Insights/Cybersecurity':
        return {
          title: "Cybersecurity Insights – Quore IT Security Trends & Analysis",
          description: "Latest cybersecurity trends, threats, and solutions. Expert analysis on protecting digital assets and building secure systems.",
          keywords: "cybersecurity, security trends, cyber threats, information security, data protection"
        };

      default:
        return metadata;
    }
  };

  const canonicalUrl = getCanonicalUrl(pathname);
  const currentMetadata = getMetadata(pathname);

  const hiddenPaths = [
    "/Policies/Accessibility-statement",
    "/Quick-Links/What-we-do",
    "/Quick-Links/About-us",
    "/Quick-Links/Our-Brands",
    "/Quick-Links/Newsroom",
    "/Quick-Links/Work-for-us",
    "/Quick-Links/Contact-us",
    "/Quick-Links/Wellbeing-Hub",
    "/Insights/Tech-Talks",
    "/Insights/Digital-Leadership-Report-2025",
    "/Insights/Diversity-Inclusion",
    "/Insights/Women-in-Tech",
    "/Insights/Cybersecurity",
    "/Insights/Comment-Analysis",
    "/Insights/Blogs",
    "/Insights/Tech-Flix",
    "/Insights/Parliamentary-Tech-Champions",
    "/Insights/Parliamentary-Tech-Champions/Baroness-smith-of-llanfaes",
    "/DigitalLeadershipBanner"
  ];

  const hideLayout = hiddenPaths.some((path) => pathname?.startsWith(path));

  return (
    <html lang="en">
      <head>
        {/* Basic Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />

        {/* Google Site Verification Meta Tag */}
        <meta name="google-site-verification" content="5b7bb9c11b9406a" />

        {/* Canonical URL - IMPORTANT FOR SEO */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Dynamic SEO Meta Tags */}
        <title>{currentMetadata.title}</title>
        <meta name="description" content={currentMetadata.description} />
        <meta name="keywords" content={currentMetadata.keywords} />
        <meta name="author" content="Quore IT" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />

        {/* Open Graph / Facebook Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={currentMetadata.title} />
        <meta property="og:description" content={currentMetadata.description} />
        <meta property="og:image" content={`${mainSiteUrl}/images/image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Quore IT" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card Meta Tags */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={currentMetadata.title} />
        <meta property="twitter:description" content={currentMetadata.description} />
        <meta property="twitter:image" content={`${mainSiteUrl}/images/image.png`} />
        <meta property="twitter:creator" content="@quoreit" />
        <meta property="twitter:site" content="@quoreit" />

        {/* Favicon */}
        <link rel="icon" href="/images/favicon.png" type="image/png" sizes="300x300" />
        <link rel="shortcut icon" href="/images/favicon.png" type="image/png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/icons/icon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/images/icons/icon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/images/icons/icon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/icons/icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/images/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/images/icons/icon-512x512.png" />

        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* Safari Pinned Tab */}
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Additional Meta Tags */}
        <meta name="application-name" content="Quore IT" />
        <meta name="apple-mobile-web-app-title" content="Quore IT" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://consent.cookiebot.com" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* Structured Data - Organization & ProfessionalService Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Quore IT",
                "url": mainSiteUrl,
                "logo": `${mainSiteUrl}/images/image.png`,
                "description": "Quore IT is a premier technology staffing and recruitment agency connecting global businesses with top-tier talent in IT, engineering, and aerospace.",
                "sameAs": [
                  "https://www.linkedin.com/company/quoreit",
                  "https://twitter.com/quoreit",
                  "https://www.facebook.com/quoreit"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "url": `${mainSiteUrl}/Contact-us`
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "ProfessionalService",
                "name": "Quore IT Staffing",
                "image": `${mainSiteUrl}/images/image.png`,
                "@id": mainSiteUrl,
                "url": mainSiteUrl,
                "telephone": "",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "London",
                  "addressCountry": "UK"
                },
                "openingHoursSpecification": {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday"
                  ],
                  "opens": "09:00",
                  "closes": "18:00"
                }
              }
            ])
          }}
        />
      </head>
      <body className="bg-white text-black dark:bg-black dark:text-white">
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="78869508-adbc-4a8b-af19-83bdf0866c05"
          data-blockingmode="auto"
          data-culture="EN"
          strategy="beforeInteractive"
        />
        <ArrowNavigation />
        {!hideLayout && <Navbar />}
        <main className="min-h-screen flex flex-col justify-between">
          <div className="flex-grow">{children}</div>
          {!hideLayout && <Footer />}
        </main>
      </body>
    </html>
  );
}
