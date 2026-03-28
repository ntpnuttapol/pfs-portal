"use client";

import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, X as XIcon } from 'lucide-react';
import PortalCard, { Portal } from './PortalCard';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { motion } from 'framer-motion';

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
    ssoTargetUrl: 'https://pfs-system.vercel.app/login',
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
  'Hr-employee': { ssoSystemId: 'hr-employee', ssoTargetUrl: 'https://pfs-system.vercel.app/login' },
  'Moldshop': { ssoSystemId: 'moldshop', ssoTargetUrl: 'http://localhost:3001/login' },
  'Project-Finishing': { ssoSystemId: 'project-finishing', ssoTargetUrl: 'http://localhost:3002/login' },
};

type PortalGridProps = {
  sectionClassName?: string;
};

export default function PortalGrid({
  sectionClassName = 'pb-16 px-6 bg-background',
}: PortalGridProps) {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = useMemo(
    () => ['all', ...new Set(portals.map((portal) => portal.category ?? 'system'))],
    [portals]
  );

  const filteredPortals = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return portals.filter((portal) => {
      const normalizedCategory = portal.category ?? 'system';
      const matchesSearch = !query || [portal.title, portal.description, normalizedCategory].some((value) =>
        value.toLowerCase().includes(query)
      );
      const matchesCategory = categoryFilter === 'all' || normalizedCategory === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [portals, searchTerm, categoryFilter]);

  const hasFilters = searchTerm.trim().length > 0 || categoryFilter !== 'all';

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
        {/* Minimal toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search portals..."
                className="w-full sm:w-72 rounded-2xl border border-card-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-foreground/15 focus:ring-2 focus:ring-foreground/5 placeholder:text-foreground/35"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/35" />
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="appearance-none rounded-2xl border border-card-border bg-card pl-9 pr-8 py-2.5 text-sm text-foreground outline-none transition focus:border-foreground/15 focus:ring-2 focus:ring-foreground/5 cursor-pointer"
              >
                <option value="all">All</option>
                {categories
                  .filter((category) => category !== 'all')
                  .map((category) => (
                    <option key={category} value={category}>
                      {formatLabel(category)}
                    </option>
                  ))}
              </select>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
                className="flex items-center gap-1.5 rounded-2xl border border-card-border bg-card px-3 py-2.5 text-xs font-medium text-foreground/60 transition hover:bg-foreground/5 hover:text-foreground"
              >
                <XIcon className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-foreground/40">
            <span className="tabular-nums">{filteredPortals.length}</span>
            <span>of</span>
            <span className="tabular-nums">{portals.length}</span>
            <span>portals</span>
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="flex items-center gap-3 text-foreground/40">
              <div className="w-5 h-5 rounded-full border-2 border-foreground/15 border-t-foreground/50 animate-spin" />
              <span className="text-sm font-medium">Loading portals...</span>
            </div>
          </div>
        ) : filteredPortals.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground/5">
              <Search className="h-6 w-6 text-foreground/30" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">No portals found</h3>
            <p className="mt-2 text-sm text-foreground/50 max-w-sm mx-auto">
              Try a different search term or clear the filter to see all portals.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPortals.map((portal, idx) => (
              <PortalCard key={`${portal.id}-${portal.title}-${idx}`} portal={portal} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
