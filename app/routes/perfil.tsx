import type { Route } from './+types/perfil';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { PageShell } from '../components/page-shell';
import { FadeIn, SlideUp } from '../components/animation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Toggle } from '../components/ui/toggle';
import { requireAuth } from '../utils/auth.server';
import { useI18n } from '../i18n/i18n-provider';
import { formatMessage } from '../lib/config';
import { me as getMyProfile } from '../lib/api/clients/auth';

interface StatItem {
  label?: string;
  value?: string | number;
}

interface HistoryEntry {
  event?: string;
  odd?: string | number;
  status?: string;
}

interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  document?: string;
  bio?: string;
  stats?: StatItem[];
  history?: { entries?: HistoryEntry[] };
  notifications?: Record<string, boolean>;
}
import { getPageMeta } from '../i18n/page-copy';
import type { ProfileCopy, ProfileHistoryStatus } from '../types/i18n';

export function meta({}: Route.MetaArgs) {
  const meta = getPageMeta('profile');
  return [{ title: meta.title }, { name: 'description', content: meta.description }];
}

export default function Perfil() {
  const { messages } = useI18n();
  const profileCopy: ProfileCopy = messages.profile;

  // Start with empty form state; backend will populate when available.
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    bio: '',
  });
  const [profileStatus, setProfileStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [documentStatus, setDocumentStatus] = useState<'idle' | 'uploading' | 'processed'>('idle');
  const [documentName, setDocumentName] = useState<string | null>(null);

  // Build notifications initial state from translation keys when backend not available.
  const initialNotifications = (profileCopy?.notifications?.items ?? []).reduce(
    (acc, it) => ({ ...acc, [it.id]: false }),
    {} as Record<string, boolean>
  );
  const [notifications, setNotifications] = useState<Record<string, boolean>>(initialNotifications);

  const [remoteProfile, setRemoteProfile] = useState<null | Record<string, unknown>>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Use central auth client to obtain current user info.
        const res = await getMyProfile();
        if (!mounted || !res) return;
        setRemoteProfile(res as Record<string, unknown>);
        // seed client form values if available
        const maybe = res as unknown;
        const user = (maybe as { user?: unknown }).user ?? maybe;
        if (user && typeof user === 'object') {
          const u = user as UserProfile;
          setProfileForm((current) => ({
            ...current,
            name: u.name ?? current.name,
            email: u.email ?? current.email,
            phone: u.phone ?? current.phone,
            document: u.document ?? current.document,
            bio: u.bio ?? current.bio,
          }));
          if (u.notifications && typeof u.notifications === 'object') {
            setNotifications((current) => ({ ...current, ...u.notifications }));
          }
        }
      } catch {
        // ignore — fall back to translation copy
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileStatus('saving');
    window.setTimeout(() => setProfileStatus('saved'), 800);
  };

  const handleDocUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setDocumentName(file.name);
    setDocumentStatus('uploading');
    window.setTimeout(() => setDocumentStatus('processed'), 1200);
  };

  return (
    <PageShell title={profileCopy.title} description={profileCopy.description}>
      <section className="grid gap-6 md:grid-cols-3">
        {(Array.isArray((remoteProfile as unknown as UserProfile)?.stats)
          ? ((remoteProfile as unknown as UserProfile).stats as unknown[])
          : profileCopy.stats
        ).map((item: unknown, index: number) => {
          const it = item as Record<string, unknown>;
          return (
            <FadeIn key={String(it.label ?? index)} delay={index * 0.1}>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-[var(--color-muted)]">{String(it.label ?? '')}</p>
                  <p className="text-2xl font-semibold">{String(it.value ?? '')}</p>
                </CardContent>
              </Card>
            </FadeIn>
          );
        })}
      </section>

      <SlideUp>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{profileCopy.history.title}</CardTitle>
              <p className="text-sm text-[var(--color-muted)]">{profileCopy.history.subtitle}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              {profileCopy.history.cta}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              (remoteProfile as unknown as UserProfile)?.history?.entries ??
              profileCopy.history.entries
            ).map((item: unknown, idx: number) => {
              const it = item as Record<string, unknown>;
              return (
                <div
                  key={String(it.event ?? `entry-${idx}`)}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--color-border)] pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{String(it.event ?? '')}</p>
                    <p className="text-sm text-[var(--color-muted)]">
                      {formatMessage(profileCopy.history.oddTemplate, {
                        odd: String(it.odd ?? ''),
                      })}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      String(it.status ?? '') === 'won'
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : String(it.status ?? '') === 'lost'
                          ? 'bg-rose-500/20 text-rose-500'
                          : 'bg-amber-500/20 text-amber-500'
                    }`}
                  >
                    {
                      profileCopy.history.statusLabels[
                        String(it.status ?? '') as ProfileHistoryStatus
                      ]
                    }
                  </span>
                </div>
              );
            })}
          </CardContent>
          <CardFooter className="text-xs text-[var(--color-muted)]">
            {profileCopy.history.footer}
          </CardFooter>
        </Card>
      </SlideUp>

      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{profileCopy.personalForm.title}</CardTitle>
            <p className="text-sm text-[var(--color-muted)]">
              {profileCopy.personalForm.description}
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleProfileSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="profile-name">
                    {profileCopy.personalForm.fields.name.label}
                  </label>
                  <Input
                    id="profile-name"
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, name: event.target.value }))
                    }
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="profile-email">
                    {profileCopy.personalForm.fields.email.label}
                  </label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, email: event.target.value }))
                    }
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="profile-phone">
                    {profileCopy.personalForm.fields.phone.label}
                  </label>
                  <Input
                    id="profile-phone"
                    value={profileForm.phone}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="profile-document">
                    {profileCopy.personalForm.fields.document.label}
                  </label>
                  <Input
                    id="profile-document"
                    value={profileForm.document}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, document: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="profile-bio">
                  {profileCopy.personalForm.fields.notes.label}
                </label>
                <textarea
                  id="profile-bio"
                  value={profileForm.bio}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, bio: event.target.value }))
                  }
                  className="min-h-[120px] w-full rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none focus-visible:ring focus-visible:ring-[color:var(--color-primary)]/40"
                  placeholder={profileCopy.personalForm.fields.notes.placeholder}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button type="submit" disabled={profileStatus === 'saving'}>
                  {profileStatus === 'saving'
                    ? profileCopy.personalForm.savingLabel
                    : profileCopy.personalForm.saveCta}
                </Button>
                {profileStatus === 'saved' && (
                  <span className="text-sm text-emerald-400">
                    {profileCopy.personalForm.savedNote}
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{profileCopy.documentUpload.title}</CardTitle>
              <p className="text-sm text-[var(--color-muted)]">
                {profileCopy.documentUpload.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <label
                htmlFor="document-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[var(--color-surface-muted)] px-6 py-10 text-center"
              >
                <p className="text-lg font-semibold text-[var(--color-text)]">
                  {documentName ?? profileCopy.documentUpload.dropzoneLabel}
                </p>
                <p className="text-sm text-[var(--color-muted)]">
                  {profileCopy.documentUpload.acceptedFormats}
                </p>
                <span className="mt-3 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                  {profileCopy.documentUpload.statusLabels[documentStatus]}
                </span>
              </label>
              <input
                id="document-upload"
                type="file"
                accept=".pdf,image/*"
                className="sr-only"
                onChange={handleDocUpload}
              />
              <p className="text-xs text-[var(--color-muted)]">
                {profileCopy.documentUpload.helper}
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{profileCopy.notifications.title}</CardTitle>
              <p className="text-sm text-[var(--color-muted)]">
                {profileCopy.notifications.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {(profileCopy.notifications.items ?? []).map((item) => {
                const key = item.id as keyof typeof notifications;
                return (
                  <Toggle
                    key={item.id}
                    label={item.label}
                    description={item.description}
                    checked={notifications[key]}
                    onChange={(next) =>
                      setNotifications((current) => ({ ...current, [key]: next }))
                    }
                  />
                );
              })}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">
                  {profileCopy.notifications.actions.reset}
                </Button>
                <Button size="sm">{profileCopy.notifications.actions.save}</Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </PageShell>
  );
}

export async function loader(args: Route.LoaderArgs) {
  await requireAuth(args);
  return {};
}
