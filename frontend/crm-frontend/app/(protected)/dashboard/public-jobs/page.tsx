'use client';

import JobsPage from '../jobs/page';

/** Admin posts jobs here → appear on quoreit.com/open-jobs */
export default function PublicJobsPage() {
  return <JobsPage publicWebsiteMode />;
}
