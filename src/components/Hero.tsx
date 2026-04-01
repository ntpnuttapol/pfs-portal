"use client";

import { motion } from 'framer-motion';
import { Zap, ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-28 pb-20 overflow-hidden px-6">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40 -z-10" />
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-blue-500/8 via-indigo-500/5 to-transparent rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent -z-10" />

      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-foreground/55 shadow-sm mb-8">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Internal Portal Hub
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight mb-6 leading-[1.05]">
            PFS Portal.
            <br />
            <span className="bg-gradient-to-r from-foreground/65 via-foreground/45 to-foreground/30 bg-clip-text text-transparent">
              One directory.
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-lg md:text-xl text-foreground/55 mb-12 max-w-xl mx-auto font-medium leading-relaxed">
            Explore Polyfoam Suvarnabhumi systems, dashboards, and SSO-enabled tools from one organized internal portal.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center"
        >
          <a
            href="#portals"
            className="group flex items-center gap-2 text-sm font-medium text-foreground/40 hover:text-foreground/70 transition-colors"
          >
            <span>Explore portals</span>
            <ArrowDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
