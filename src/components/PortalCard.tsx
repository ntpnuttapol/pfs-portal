"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExternalLink, Server, Globe, BarChart3, AppWindow, Users, Settings, LineChart, Car, Fuel, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface Portal {
  id: string | number;
  title: string;
  description: string;
  url: string;
  category?: string;
  icon?: string;
  status?: 'active' | 'maintenance' | 'offline';
  requiresSso?: boolean;
  ssoSystemId?: string;
  ssoTargetUrl?: string;
}

export default function PortalCard({ portal, index }: { portal: Portal; index: number }) {
  const router = useRouter();
  const { user, setIsLoginModalOpen } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<'active' | 'maintenance' | 'offline' | 'loading'>(
    portal.status === 'maintenance' ? 'maintenance' : portal.status === 'offline' ? 'offline' : 'loading'
  );
  const [ssoLoading, setSsoLoading] = useState(false);
  const [ssoError, setSsoError] = useState(false);

  useEffect(() => {
    if (portal.status === 'maintenance') return;

    async function checkHealth() {
      try {
        const res = await fetch(`/api/health?url=${encodeURIComponent(portal.url)}`);
        const data = await res.json();
        setCurrentStatus(data.status === 'online' ? 'active' : 'offline');
      } catch {
        setCurrentStatus('offline');
      }
    }

    checkHealth();
  }, [portal.url, portal.status]);

  const getIcon = () => {
    if (portal.icon) {
      switch (portal.icon) {
        case 'users': return Users;
        case 'settings': return Settings;
        case 'line-chart': return LineChart;
        case 'car': return Car;
        case 'fuel': return Fuel;
        case 'globe': return Globe;
      }
    }
    switch (portal.category) {
      case 'analytics': return BarChart3;
      case 'system': return AppWindow;
      case 'external': return Globe;
      default: return Server;
    }
  };

  const Icon = getIcon();
  const isInternalSystem = portal.category !== 'external';
  const hasSso = !!portal.ssoSystemId && !!portal.ssoTargetUrl;
  const requiresLogin = isInternalSystem && !user;
  const isMaintenance = currentStatus === 'maintenance';
  const isExternalLink = portal.category === 'external' || !isInternalSystem;
  const statusLabel = currentStatus === 'active'
    ? 'Available'
    : currentStatus === 'maintenance'
      ? 'Maintenance'
      : currentStatus === 'loading'
        ? 'Checking status'
        : 'Temporarily unavailable';
  const statusClassName = currentStatus === 'active'
    ? 'bg-green-500/10 text-green-600'
    : currentStatus === 'maintenance'
      ? 'bg-amber-500/10 text-amber-600'
      : currentStatus === 'loading'
        ? 'bg-foreground/10 text-foreground/40 animate-pulse'
        : 'bg-red-500/10 text-red-600';
  const accessLabel = isExternalLink
    ? 'External website'
    : requiresLogin
      ? 'Sign-in required'
      : hasSso
        ? 'SSO ready'
        : 'Direct link';
  const accessClassName = isExternalLink
    ? 'bg-slate-500/10 text-slate-600 border-slate-200'
    : requiresLogin
      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      : hasSso
        ? 'bg-green-500/10 text-green-600 border-green-500/20'
        : 'bg-blue-500/10 text-blue-600 border-blue-500/20';
  const actionLabel = ssoLoading
    ? 'Connecting...'
    : isMaintenance
      ? 'Unavailable during maintenance'
      : requiresLogin
        ? 'Sign in to access'
        : isExternalLink
          ? 'Open website'
          : hasSso
            ? 'Launch with SSO'
            : 'Open portal';
  const helperText = ssoError
    ? 'We couldn’t create a secure SSO handoff. Click again to retry.'
    : isMaintenance
      ? 'This system is temporarily unavailable while maintenance is in progress.'
      : currentStatus === 'offline'
        ? 'The latest health check could not reach this system. You can still try opening it.'
        : requiresLogin
          ? 'Sign in once to unlock internal tools and launch them from your dashboard.'
          : hasSso
            ? 'You will be redirected with a single sign-on session.'
            : isExternalLink
              ? 'This link opens outside the hub in a new browser tab.'
              : 'This system opens directly in a new browser tab.';
  const actionClassName = isMaintenance
    ? 'bg-foreground/5 text-foreground/40'
    : requiresLogin
      ? 'bg-amber-500/10 text-amber-700'
      : 'bg-foreground text-background';

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSsoError(false);

    if (isMaintenance) {
      return;
    }

    // External websites → open directly
    if (isExternalLink) {
      window.open(portal.url, '_blank');
      return;
    }

    // Not logged in → trigger login modal
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    // Logged in + has SSO → generate token and redirect
    if (hasSso) {
      setSsoLoading(true);
      try {
        const response = await fetch('/api/sso/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemId: portal.ssoSystemId,
            targetUrl: portal.ssoTargetUrl,
            userMapping: {},
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        window.location.href = data.redirectUrl;
      } catch (error) {
        console.error('SSO error:', error);
        setSsoError(true);
        setSsoLoading(false);
      }
      return;
    }

    // Logged in + no SSO → open directly
    window.open(portal.url, '_blank');
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={ssoLoading || isMaintenance ? undefined : { y: -8, scale: 1.02 }}
      disabled={ssoLoading || isMaintenance}
      className="group block w-full text-left"
    >
      <div className={`bg-card border rounded-3xl p-6 h-full shadow-[0_2px_12px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08),0_16px_48px_rgba(0,0,0,0.12)] transition-all duration-300 ${
        ssoError ? 'border-red-400' : 'border-card-border'
      } ${ssoLoading ? 'opacity-70 cursor-wait' : ''} ${isMaintenance ? 'opacity-80 cursor-not-allowed' : ''}`}>
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-background rounded-2xl shadow-sm border border-card-border group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
            {ssoLoading ? (
              <Loader2 size={24} className="animate-spin opacity-80" />
            ) : (
              <Icon size={24} className="opacity-80" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusClassName}`}>
              {statusLabel}
            </div>
            {requiresLogin ? (
              <Lock size={20} className="text-amber-500" />
            ) : !isMaintenance ? (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ExternalLink size={20} className="text-foreground/50" />
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2 tracking-tight">{portal.title}</h3>
          <p className="text-foreground/60 text-sm leading-relaxed line-clamp-2">
            {portal.description}
          </p>
        </div>

        <div className="mt-5 border-t border-card-border pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-lg border uppercase tracking-wider ${accessClassName}`}>
              {accessLabel}
            </span>
            {currentStatus === 'offline' && (
              <span className="text-xs font-medium px-2 py-1 rounded-lg border border-red-200 bg-red-500/10 text-red-600 uppercase tracking-wider">
                Retry recommended
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-foreground/60 sm:max-w-[70%]">
              {helperText}
            </p>

            <span className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${actionClassName}`}>
              {actionLabel}
              {ssoLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : requiresLogin ? (
                <Lock size={16} />
              ) : (
                <ExternalLink size={16} />
              )}
            </span>
          </div>
        </div>

        {ssoError && (
          <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-3">
            <p className="text-xs font-medium text-red-600">We couldn’t create a secure SSO session for this portal. Click again to retry.</p>
          </div>
        )}
      </div>
    </motion.button>
  );
}
