"use client";

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import PortalCard, { Portal } from './PortalCard';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';

// Default portals shown when Supabase is not configured or on error
const DEFAULT_PORTALS: Portal[] = [
  {
    id: 1,
    title: 'Hr-employee',
    description: 'Human Resources and Employee Health management system.',
    url: 'https://pfs-system.vercel.app/login',
    category: 'system',
    icon: 'users',
    status: 'active',
    ssoSystemId: 'hr-employee',
    ssoTargetUrl: 'http://localhost:3003/login',
  },
  {
    id: 2,
    title: 'Moldshop',
    description: 'Management system for mold maintenance and work orders.',
    url: 'http://localhost:3001',
    category: 'system',
    icon: 'settings',
    status: 'active',
    ssoSystemId: 'moldshop',
    ssoTargetUrl: 'http://localhost:3001/login',
  },
  {
    id: 3,
    title: 'Project-Finishing',
    description: 'Production monitoring and project finishing dashboard.',
    url: 'https://finishing.yourdomain.com',
    category: 'analytics',
    icon: 'line-chart',
    status: 'active',
    ssoSystemId: 'project-finishing',
    ssoTargetUrl: 'http://localhost:3002/login',
  },
  {
    id: 4,
    title: 'Fleet Booking',
    description: 'Vehicle and fleet reservation management.',
    url: 'https://polyfoampfs-bookingcar.vercel.app/',
    category: 'system',
    icon: 'car',
    status: 'active',
  },
  {
    id: 5,
    title: 'Moneybill-Oil',
    description: 'Fuel tracking and financial billing system.',
    url: 'https://Polyfoampfs.com/moneytrack',
    category: 'system',
    icon: 'fuel',
    status: 'active',
  },
  {
    id: 6,
    title: 'PFS Official Website',
    description: 'Visit our corporate website for more information.',
    url: 'https://www.pfs.co.th',
    category: 'external',
    icon: 'globe',
    status: 'active',
  }
];

// SSO configuration map - always applied regardless of data source
const SSO_CONFIG: Record<string, { ssoSystemId: string; ssoTargetUrl: string }> = {
  'Hr-employee': { ssoSystemId: 'hr-employee', ssoTargetUrl: 'http://localhost:3003/login' },
  'Moldshop': { ssoSystemId: 'moldshop', ssoTargetUrl: 'http://localhost:3001/login' },
  'Project-Finishing': { ssoSystemId: 'project-finishing', ssoTargetUrl: 'http://localhost:3002/login' },
};

type PortalGridProps = {
  sectionClassName?: string;
  title?: string;
  description?: string;
};

export default function PortalGrid({
  sectionClassName = 'pt-24 pb-12 px-6 bg-background',
  title = 'Directory',
  description = 'A curated list of essential portals and applications. Everything you need to get your work done, beautifully organized.',
}: PortalGridProps) {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const categories = useMemo(
    () => ['all', ...new Set(portals.map((portal) => portal.category ?? 'system'))],
    [portals]
  );

  const filteredPortals = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return portals.filter((portal) => {
      const normalizedCategory = portal.category ?? 'system';
      const normalizedStatus = portal.status ?? 'active';
      const matchesSearch = !query || [portal.title, portal.description, normalizedCategory].some((value) =>
        value.toLowerCase().includes(query)
      );
      const matchesCategory = categoryFilter === 'all' || normalizedCategory === categoryFilter;
      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [portals, searchTerm, categoryFilter, statusFilter]);

  const activeCount = portals.filter((portal) => (portal.status ?? 'active') === 'active').length;
  const hasFilters = searchTerm.trim().length > 0 || categoryFilter !== 'all' || statusFilter !== 'all';

  const formatLabel = (value: string) =>
    value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  useEffect(() => {
    async function fetchPortals() {
      let portalData: Portal[] = DEFAULT_PORTALS;

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('portals')
            .select('*')
            .order('title', { ascending: true });

          if (!error && data && data.length > 0) {
            portalData = data as Portal[];
          }
        } catch {
          // Silently fallback on exception
        }
      }

      // Merge SSO config into portals
      const merged = portalData.map(p => ({
        ...p,
        ...(SSO_CONFIG[p.title] || {}),
      }));

      // Add any DEFAULT_PORTALS that are missing from database (including Project-Finishing)
      const dbTitles = new Set(merged.map(p => p.title));
      const missingDefaults = DEFAULT_PORTALS.filter(p => !dbTitles.has(p.title));
      const finalPortals = [...merged, ...missingDefaults];

      setPortals(finalPortals);
      setLoading(false);
    }

    fetchPortals();
  }, []);

  return (
    <section id="portals" className={sectionClassName}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">{title}</h2>
              <p className="text-foreground/60 max-w-2xl text-lg">{description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60">
              <span className="rounded-full border border-card-border bg-card px-3 py-1.5 shadow-sm">
                {portals.length} portals
              </span>
              <span className="rounded-full border border-card-border bg-card px-3 py-1.5 shadow-sm">
                {activeCount} active
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-card-border bg-card p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search portals by name, description, or category"
                  className="w-full rounded-2xl border border-card-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-foreground/20 focus:ring-2 focus:ring-foreground/10"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-2xl border border-card-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-foreground/20 focus:ring-2 focus:ring-foreground/10"
              >
                <option value="all">All categories</option>
                {categories
                  .filter((category) => category !== 'all')
                  .map((category) => (
                    <option key={category} value={category}>
                      {formatLabel(category)}
                    </option>
                  ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-card-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-foreground/20 focus:ring-2 focus:ring-foreground/10"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
                disabled={!hasFilters}
                className="rounded-2xl border border-card-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reset
              </button>
            </div>

            <p className="mt-3 text-sm text-foreground/60">
              Showing {filteredPortals.length} of {portals.length} portals
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin"></div>
          </div>
        ) : filteredPortals.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card px-6 py-16 text-center shadow-sm">
            <h3 className="text-xl font-semibold tracking-tight">No portals match your filters</h3>
            <p className="mt-2 text-foreground/60">
              Try a different search term or clear the current filters to see all available portals.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortals.map((portal, idx) => (
              <PortalCard key={portal.id} portal={portal} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
