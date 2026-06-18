// Robots.txt generation for Quore IT

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/Policies/Accessibility-statement',
          '/DigitalLeadershipBanner'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/'
        ],
      },
    ],
    sitemap: [
      'https://www.quoreit.com/sitemap.xml',
      'https://blog.quoreit.com/sitemap.xml'
    ],
    host: 'https://www.quoreit.com',
  }
}