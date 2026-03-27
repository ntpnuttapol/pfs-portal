"use client";

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative pt-12 pb-16 overflow-hidden px-6">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-dot-pattern opacity-50 -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            All your portals.<br />
            <span className="text-foreground/60">Beautifully organized.</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xl md:text-2xl text-foreground/70 mb-10 max-w-2xl mx-auto font-medium">
            Access internal tools, dashboard applications, and external websites all from one unified, sleek dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#portals" className="bg-foreground text-background px-8 py-3.5 rounded-full font-medium text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95">
            Browse Portals
          </a>
          <a href="#about" className="bg-card text-foreground px-8 py-3.5 rounded-full font-medium text-lg border border-card-border hover:bg-card-border transition-all hover:scale-105 active:scale-95 shadow-sm">
            Learn More
          </a>
        </motion.div>
      </div>
    </section>
  );
}
