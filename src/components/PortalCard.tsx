"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExternalLink, Server, Globe, BarChart3, AppWindow, Users, Settings, LineChart, Car, Fuel, Lock, Loader2, ArrowUpRight } from 'lucide-react';
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

  // Status dot color
  const statusDotColor = currentStatus === 'active'
    ? 'bg-emerald-500'
    : currentStatus === 'maintenance'
      ? 'bg-amber-500'
      : currentStatus === 'loading'
        ? 'bg-foreground/20 animate-pulse'
        : 'bg-red-500';

  const statusText = currentStatus === 'active'
    ? 'Online'
    : currentStatus === 'maintenance'
      ? 'Maintenance'
      : currentStatus === 'loading'
        ? 'Checking...'
        : 'Offline';

  // Access badge
  const accessInfo = isExternalLink
    ? { label: 'External', className: 'text-slate-500 bg-slate-500/8' }
    : requiresLogin
      ? { label: 'Sign in required', className: 'text-amber-600 bg-amber-500/8' }
      : hasSso
        ? { label: 'SSO', className: 'text-emerald-600 bg-emerald-500/8' }
        : { label: 'Direct', className: 'text-blue-600 bg-blue-500/8' };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSsoError(false);

    if (isMaintenance) return;

    if (isExternalLink) {
      window.open(portal.url, '_blank');
      return;
    }

    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

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

    window.open(portal.url, '_blank');
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={ssoLoading || isMaintenance ? undefined : { y: -4 }}
      disabled={ssoLoading || isMaintenance}
      className="group block w-full text-left"
    >
      <div className={`relative bg-card border rounded-[24px] p-5 h-full transition-all duration-300 ${
        ssoError ? 'border-red-300 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]' : 'border-card-border'
      } ${ssoLoading ? 'opacity-60 cursor-wait' : ''} ${isMaintenance ? 'opacity-70 cursor-not-allowed' : ''} hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:border-foreground/10`}>
        
        {/* Top row: Icon + Status */}
        <div className="flex items-start justify-between mb-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] border border-card-border bg-background transition-all duration-300 group-hover:bg-foreground group-hover:text-background group-hover:border-foreground group-hover:shadow-lg`}>
            {ssoLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Icon className="h-5 w-5 opacity-70 group-hover:opacity-100" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${statusDotColor}`} />
              <span className="text-[11px] font-medium text-foreground/40">{statusText}</span>
            </div>
            {requiresLogin && (
              <Lock className="h-3.5 w-3.5 text-amber-500/70" />
            )}
          </div>
        </div>

        {/* Title + Description */}
        <div className="mb-4">
          <h3 className="text-[15px] font-semibold mb-1 tracking-tight text-foreground group-hover:text-foreground">
            {portal.title}
          </h3>
          <p className="text-[13px] text-foreground/50 leading-relaxed line-clamp-2">
            {portal.description}
          </p>
        </div>

        {/* Bottom row: Access badge + Arrow */}
        <div className="flex items-center justify-between pt-3 border-t border-card-border/60">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] px-2 py-1 rounded-md ${accessInfo.className}`}>
            {accessInfo.label}
          </span>

          <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
            isMaintenance ? 'bg-foreground/5 text-foreground/20' 
            : requiresLogin ? 'bg-amber-500/8 text-amber-600 group-hover:bg-amber-500 group-hover:text-white'
            : 'bg-foreground/5 text-foreground/30 group-hover:bg-foreground group-hover:text-background'
          }`}>
            {ssoLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : requiresLogin ? (
              <Lock className="h-3 w-3" />
            ) : (
              <ArrowUpRight className="h-3.5 w-3.5" />
            )}
          </div>
        </div>

        {/* SSO Error */}
        {ssoError && (
          <div className="mt-3 rounded-xl bg-red-50 border border-red-100 px-3 py-2">
            <p className="text-[11px] font-medium text-red-600">SSO handoff failed. Click to retry.</p>
          </div>
        )}
      </div>
    </motion.button>
  );
}
