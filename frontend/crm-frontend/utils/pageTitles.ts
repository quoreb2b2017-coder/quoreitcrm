const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/jobs': 'Jobs',
  '/dashboard/public-jobs': 'Public Jobs',
  '/dashboard/public-applications': 'Public Applicants',
  '/dashboard/candidates': 'Candidates',
  '/dashboard/applicants': 'Pipeline',
  '/dashboard/clients': 'Clients',
  '/dashboard/projects': 'Projects',
  '/dashboard/projects/new': 'New project',
  '/dashboard/messages': 'Messages',
  '/dashboard/activity': 'Calls',
  '/dashboard/email': 'Email',
  '/dashboard/email/compose': 'Compose email',
  '/dashboard/profile': 'My Profile',
  '/dashboard/settings': 'Settings',
  '/dashboard/add-candidate': 'Add User',
  '/dashboard/applications': 'Applications',
};

export function resolvePageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/dashboard/jobs/')) return 'Job details';
  if (pathname.startsWith('/dashboard/email/')) return 'Email';
  if (pathname.startsWith('/dashboard/projects/')) return 'Projects';
  return 'Dashboard';
}
