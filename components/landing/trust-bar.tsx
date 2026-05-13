"use client";

import { motion } from "framer-motion";

const JOB_CATEGORIES = [
  "Software Engineering", "Product Management", "Data Science", "Marketing",
  "Finance & Accounting", "Human Resources", "Sales", "Design & UX",
  "Healthcare", "Legal", "Operations", "Executive Leadership",
  "Teaching & Education", "Construction", "Hospitality", "Logistics",
];

export function TrustBar() {
  return (
    <section className="border-y border-border/30 bg-muted/10 py-8 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-widest font-medium mb-6">
          Works for every industry and job type
        </p>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 items-center whitespace-nowrap"
          >
            {[...JOB_CATEGORIES, ...JOB_CATEGORIES].map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors flex-shrink-0"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <span className="text-sm font-medium tracking-wide">{name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
