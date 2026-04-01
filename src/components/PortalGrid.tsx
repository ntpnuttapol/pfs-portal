"use client";

import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, X as XIcon } from 'lucide-react';
import PortalCard from './PortalCard';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { motion } from 'framer-motion';
import {
  DEFAULT_PORTALS,
  mergePortalData,
  type PortalDefinition,
} from '@/data/portals';

type PortalGridProps = {
  sectionClassName?: string;
};

export default function PortalGrid({
  sectionClassName = 'pb-16 px-6 bg-background',
}: PortalGridProps) {
  const [portals, setPortals] = useState<PortalDefinition[]>(() =>
    mergePortalData(DEFAULT_PORTALS)
  );
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
      let portalData: PortalDefinition[] = DEFAULT_PORTALS;

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('portals')
            .select('*')
            .order('title', { ascending: true });

          if (!error && data && data.length > 0) {
            portalData = data as PortalDefinition[];
          }
        } catch {
          // Silently fallback on exception
        }
      }

      setPortals(mergePortalData(portalData));
    }

    void fetchPortals();
  }, []);

  return (
    <section id="portals" className={sectionClassName}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">
            Portal Directory
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Browse systems, dashboards, and connected tools
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/60 md:text-base">
            Explore the public directory of business systems available through the
            PFS Portal hub, then launch the tools you need with direct access or
            SSO-enabled handoff.
          </p>
        </div>

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
              <label htmlFor="portal-search" className="sr-only">
                Search portals
              </label>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
              <input
                id="portal-search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search portals..."
                className="w-full sm:w-72 rounded-2xl border border-card-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-foreground/15 focus:ring-2 focus:ring-foreground/5 placeholder:text-foreground/35"
              />
            </div>

            <div className="relative">
              <label htmlFor="portal-category" className="sr-only">
                Filter portal category
              </label>
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/35" />
              <select
                id="portal-category"
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

        {filteredPortals.length === 0 ? (
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
              <PortalCard key={`${portal.id}-${portal.title}`} portal={portal} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
