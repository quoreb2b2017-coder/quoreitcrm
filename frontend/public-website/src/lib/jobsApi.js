const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4000/api/v1';

export async function fetchPublicJobs() {
  const res = await fetch(`${API_BASE}/public/jobs`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load jobs');
  return res.json();
}

export async function fetchPublicJob(id) {
  const res = await fetch(`${API_BASE}/public/jobs/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Job not found');
  return res.json();
}

export async function submitApplication(formData) {
  const res = await fetch(`${API_BASE}/public/applications/apply`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Application failed');
  }
  return data;
}

export { API_BASE };
