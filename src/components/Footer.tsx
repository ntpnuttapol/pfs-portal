'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, FileText, LayoutDashboard, LogIn, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user, setIsLoginModalOpen } = useAuth();

  const staticLinks = [
    { href: '/#portals', label: 'Portal Directory', icon: ArrowUpRight },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/sso-docs', label: 'SSO Docs', icon: FileText },
  ];

  const guidance = [
    'Launch connected systems from one shared hub experience.',
    'Use Request Access when your account still needs approval.',
    'SSO-enabled tools can hand off your session automatically after sign-in.',
  ];

  return (
    <footer id="about" className="border-t border-card-border bg-background px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr_1fr] lg:gap-12">
          <div>
            <div className="flex items-center space-x-3 opacity-90 transition-opacity hover:opacity-100">
              <div className="overflow-hidden rounded-xl border border-card-border bg-card shadow-sm">
                <Image
                  src="/pfslogo.png"
                  alt="PFS Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-cover"
                />
              </div>
              <span className="font-semibold text-xl tracking-tight text-foreground">Polyfoam Suvarnabhumi</span>
            </div>

            <p className="mt-6 max-w-lg text-sm leading-relaxed text-foreground/55 md:text-base">
              A centralized launchpad for internal systems, public tools, and SSO-enabled workflows—organized so teams can move faster with less friction.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">
              <span className="rounded-full border border-card-border bg-card px-3 py-2">Central access hub</span>
              <span className="rounded-full border border-card-border bg-card px-3 py-2">Approval-based onboarding</span>
              <span className="rounded-full border border-card-border bg-card px-3 py-2">SSO-ready launch flow</span>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/45">Quick links</h2>
            <div className="mt-5 space-y-3">
              {staticLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-card-border bg-card px-4 py-3 text-sm font-medium text-foreground/75 transition hover:border-foreground/10 hover:bg-white hover:text-foreground"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-foreground/40" />
                </Link>
              ))}
              {!user && (
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-full flex items-center justify-between gap-3 rounded-2xl border border-card-border bg-card px-4 py-3 text-sm font-medium text-foreground/75 transition hover:border-foreground/10 hover:bg-white hover:text-foreground"
                >
                  <span className="flex items-center gap-3">
                    <LogIn className="h-4 w-4" />
                    <span>Sign In / Request Access</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-foreground/40" />
                </button>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/45">Access guidance</h2>
            <div className="mt-5 rounded-3xl border border-card-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500/10 text-green-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Hub access support</p>
                  <p className="text-sm text-foreground/55">Use the links here to sign in, request approval, or review SSO documentation.</p>
                </div>
              </div>

              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-foreground/60">
                {guidance.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/35" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-card-border pt-6 text-sm text-foreground/40 md:flex-row md:items-center md:justify-between">
          <div className="font-medium">&copy; {currentYear} Polyfoam Suvarnabhumi. All rights reserved.</div>
          <div>Centralized access, cleaner navigation, and faster launches across connected systems.</div>
        </div>
      </div>
    </footer>
  );
}
