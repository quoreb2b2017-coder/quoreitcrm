// Sitemap generation for Quore IT

export default function sitemap() {
  const mainSiteUrl = 'https://www.quoreit.com'
  const blogSiteUrl = 'https://blog.quoreit.com'
  const currentDate = new Date().toISOString()

  return [
    // Main site pages
    {
      url: mainSiteUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${mainSiteUrl}/Find-tech-jobs`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${mainSiteUrl}/Find-tech-jobs/Information-technology`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${mainSiteUrl}/Find-tech-jobs/engineering`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${mainSiteUrl}/Find-tech-jobs/government-services`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${mainSiteUrl}/Find-tech-jobs/aerospace-staffing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${mainSiteUrl}/Find-tech-talent`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${mainSiteUrl}/What-we-do`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${mainSiteUrl}/About-Us`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${mainSiteUrl}/Contact-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // Policy pages
    {
      url: `${mainSiteUrl}/Policies/Privacy-Policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${mainSiteUrl}/Policies/Terms-of-Service`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${mainSiteUrl}/Policies/Cookies-Legal`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${mainSiteUrl}/Policies/Modern-Slavery-Statement`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },

    // Blog pages (using blog.quoreit.com)
    {
      url: `${blogSiteUrl}/Insights`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${blogSiteUrl}/Insights/Tech-Talks`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${blogSiteUrl}/Insights/Digital-Leadership-Report-2025`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${blogSiteUrl}/Insights/Diversity-Inclusion`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${blogSiteUrl}/Insights/Women-in-Tech`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${blogSiteUrl}/Insights/Cybersecurity`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${blogSiteUrl}/Insights/Comment-Analysis`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${blogSiteUrl}/Insights/Blogs`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${blogSiteUrl}/Insights/Tech-Flix`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${blogSiteUrl}/Insights/Parliamentary-Tech-Champions`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${blogSiteUrl}/Insights/Parliamentary-Tech-Champions/Baroness-smith-of-llanfaes`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
  ]
}