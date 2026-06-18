'use client';

import { useState, useEffect, useRef } from 'react';
import { RouteGuard } from '@/components/RouteGuard';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import type { User } from '@/types';

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  recruiter: 'Recruiter',
};

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editBio, setEditBio] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [publicProfileEnabled, setPublicProfileEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authUser?.id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.users
      .getProfile(authUser.id)
      .then((res) => {
        if (cancelled || !res.data?.data) return;
        const u = res.data.data;
        setProfile(u);
        setEditName(u.name);
        setEditCompany(u.company ?? '');
        setEditBio(u.bio ?? '');
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load profile');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  const startEditing = () => {
    if (profile) {
      setEditName(profile.name);
      setEditCompany(profile.company ?? '');
      setEditBio(profile.bio ?? '');
      setEditing(true);
    }
  };

  const saveProfile = async () => {
    if (!authUser?.id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.users.updateProfile(authUser.id, {
        name: editName,
        company: editCompany || undefined,
        bio: editBio || undefined,
      });
      if (res.data?.data) setProfile(res.data.data);
      setEditing(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    if (profile) {
      setEditName(profile.name);
      setEditCompany(profile.company ?? '');
      setEditBio(profile.bio ?? '');
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser?.id) return;
    e.target.value = '';
    setAvatarUploading(true);
    setError(null);
    try {
      const uploadRes = await api.upload.profilePhoto(file);
      const url = uploadRes.data?.data?.url;
      if (url) {
        const res = await api.users.updateProfile(authUser.id, { avatar: url });
        if (res.data?.data) setProfile(res.data.data);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to upload photo');
    } finally {
      setAvatarUploading(false);
    }
  };

  const onIntroVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser?.id) return;
    e.target.value = '';
    setVideoUploading(true);
    setVideoProgress(0);
    setError(null);
    try {
      const uploadRes = await api.upload.introVideo(file, (p) => setVideoProgress(p));
      const url = uploadRes.data?.data?.url;
      if (url) {
        const res = await api.users.updateProfile(authUser.id, { introVideoUrl: url });
        if (res.data?.data) setProfile(res.data.data);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to upload video. Use MP4, WebM, MOV or AVI (max 100MB).');
    } finally {
      setVideoUploading(false);
      setVideoProgress(0);
    }
  };

  const removeIntroVideo = async () => {
    if (!authUser?.id || !profile?.introVideoUrl) return;
    setError(null);
    try {
      await api.users.updateProfile(authUser.id, { introVideoUrl: '' });
      setProfile((p) => (p ? { ...p, introVideoUrl: undefined } : null));
    } catch {
      setError('Failed to remove video');
    }
  };

  const publicProfileUrl =
    typeof window !== 'undefined' && profile?.id
      ? `${window.location.origin}/profile/${profile.id}`
      : '';

  const copyProfileUrl = async () => {
    if (!publicProfileUrl) return;
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy link');
    }
  };

  if (!authUser) return null;

  return (
    <RouteGuard allowedRoles={['admin', 'recruiter']}>
      <div className="mx-auto max-w-5xl px-1">
        <header className="border-b border-[var(--border)] pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
            Complete your profile so candidates and clients can connect with you.
          </p>
        </header>

        {loading && (
          <div className="flex items-center gap-3 py-12 text-[var(--muted-foreground)]">
            <span className="inline-block h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
            <span className="text-sm">Loading profile…</span>
          </div>
        )}

        {error && (
          <div
            className="mt-6 rounded-lg border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && profile && (
          <div className="grid gap-10 pt-8 lg:grid-cols-[320px_1fr]">
            {/* Left column: photo, name, company, role, intro video */}
            <div className="flex flex-col gap-6">
              <section className="flex flex-col items-start">
                <div className="relative">
                  <div className="h-28 w-28 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--muted)]/30">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-[var(--muted-foreground)]">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={onAvatarChange}
                  />
                </div>
                <button
                  type="button"
                  disabled={avatarUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 flex items-center gap-2 rounded-md border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]/20 disabled:opacity-50"
                >
                  {avatarUploading ? (
                    'Uploading…'
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </>
                  )}
                </button>
                <h2 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
                  {profile.name}
                </h2>
                {profile.company && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                    <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {profile.company}
                  </p>
                )}
                <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)]">
                  {roleLabels[profile.role] ?? profile.role}
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  Your Intro Video
                </h3>
                <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
                  Your personal intro video helps candidates and clients connect with you better.
                </p>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                  className="sr-only"
                  onChange={onIntroVideoChange}
                />
                {profile.introVideoUrl ? (
                  <div className="mt-4 space-y-3">
                    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)]/10">
                      <div className="aspect-video w-full">
                        <video
                          src={profile.introVideoUrl}
                          controls
                          className="h-full w-full object-contain"
                          preload="metadata"
                          playsInline
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={videoUploading}
                        onClick={() => videoInputRef.current?.click()}
                        className="rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]/20 disabled:opacity-50"
                      >
                        {videoUploading ? `${videoProgress}%` : 'Replace'}
                      </button>
                      <button
                        type="button"
                        onClick={removeIntroVideo}
                        className="rounded-md border border-red-200 bg-transparent px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--muted)]/5 py-10 px-4 ${videoUploading ? 'opacity-70' : 'hover:border-[var(--primary)]/30 hover:bg-[var(--muted)]/10'}`}
                  >
                    {videoUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
                        <span className="text-sm text-[var(--muted-foreground)]">{videoProgress}%</span>
                      </div>
                    ) : (
                      <>
                        <svg className="h-10 w-10 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="mt-3 text-sm font-medium text-[var(--primary)] hover:underline"
                        >
                          Add intro video
                        </button>
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">MP4, WebM, MOV · Max 100MB</p>
                      </>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* Right column: public profile toggle + URL, Bio */}
            <div className="min-w-0 space-y-8">
              <section>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--foreground)]">
                      Enable your public profile
                    </h3>
                    <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
                      You&apos;ll have a public profile page you can share with candidates and clients to build trust.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={publicProfileEnabled}
                    onClick={() => setPublicProfileEnabled((v) => !v)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${publicProfileEnabled ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]/40'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${publicProfileEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>
                {publicProfileEnabled && publicProfileUrl && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/5 px-4 py-3">
                    <span className="min-w-0 truncate text-sm text-[var(--foreground)]">
                      {publicProfileUrl}
                    </span>
                    <button
                      type="button"
                      onClick={copyProfileUrl}
                      className="shrink-0 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-base font-semibold text-[var(--foreground)]">Bio</h3>
                {editing ? (
                  <div className="mt-3 space-y-4">
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={6}
                      className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      placeholder="Write a short bio about your experience and approach to recruitment."
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={saveProfile}
                        disabled={saving}
                        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {saving ? 'Saving…' : 'Save changes'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]/30"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
                      {profile.bio ||
                        'Add a short bio to help candidates and clients connect with you.'}
                    </p>
                    <button
                      type="button"
                      onClick={startEditing}
                      className="mt-3 text-sm font-medium text-[var(--primary)] hover:underline"
                    >
                      Edit profile
                    </button>
                  </>
                )}
              </section>

              {editing && (
                <section className="rounded-lg border border-[var(--border)] bg-[var(--card)]/50 p-5">
                  <h3 className="text-sm font-semibold text-[var(--muted-foreground)]">
                    Personal details
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)]">Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)]">Company</label>
                      <input
                        type="text"
                        value={editCompany}
                        onChange={(e) => setEditCompany(e.target.value)}
                        placeholder="Your company"
                        className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                    Save using the Save changes button in the Bio section.
                  </p>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
