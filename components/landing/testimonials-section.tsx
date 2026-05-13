"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/shared/language-provider";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "Software Engineer", company: "Toronto, CA", avatar: "SC", color: "bg-blue-500", rating: 5, scoreFrom: 42, scoreTo: 91, quote: "I went from 42 to 91 ATS score on a single application. Got the interview within 3 days. The difference was night and day — the AI rewrote my resume to match the JD perfectly.", quoteFr: "Je suis passé de 42 à 91 en score ATS sur une seule candidature. J'ai décroché un entretien en 3 jours. La différence était incroyable." },
  { name: "Thomas Leblanc", role: "Développeur Senior", company: "Montréal, QC", avatar: "TL", color: "bg-amber-500", rating: 5, scoreFrom: 39, scoreTo: 93, quote: "As a French-speaking developer looking for bilingual roles, the EN/FR feature is exactly what I needed. One master resume, tailored in both languages in seconds.", quoteFr: "En tant que développeur francophone, la fonctionnalité EN/FR est exactement ce dont j'avais besoin. Un CV maître, adapté dans les deux langues en quelques secondes." },
  { name: "Amira Khalil", role: "Marketing Manager", company: "Melbourne, AU", avatar: "AK", color: "bg-purple-500", rating: 5, scoreFrom: 35, scoreTo: 88, quote: "I'd been applying for weeks with no responses. After using Hyrefy, I got 3 interview requests in one week. The country-specific formatting for Australia made a real difference.", quoteFr: "Je postulais depuis des semaines sans réponse. Après avoir utilisé Hyrefy, j'ai reçu 3 invitations à des entretiens en une semaine." },
  { name: "Rajiv Sharma", role: "Data Engineer", company: "Bengaluru, IN", avatar: "RS", color: "bg-emerald-500", rating: 5, scoreFrom: 44, scoreTo: 89, quote: "The India-specific format is spot on — skills section first, education prominent, career objective at the top. This is exactly how Indian recruiters want to see a resume.", quoteFr: "Le format spécifique à l'Inde est parfait — compétences d'abord, formation bien mise en avant. C'est exactement ce que recherchent les recruteurs indiens." },
];

export function TestimonialsSection() {
  const { t, language } = useLanguage();
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px]" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{t.testimonials.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.testimonials.subtitle}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((item, i) => (
            <motion.div key={item.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }} className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 hover:bg-card/60 hover:border-border/60 transition-all duration-300">
              <Quote className="h-6 w-6 text-primary/30 mb-3" />
              <div className="flex mb-2">{Array.from({ length: item.rating }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">&ldquo;{language === "fr" ? item.quoteFr : item.quote}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full ${item.color} flex items-center justify-center text-white text-xs font-bold`}>{item.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role} · {item.company}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-muted-foreground">Score</p>
                  <p className="text-xs font-bold"><span className="text-destructive/70">{item.scoreFrom}</span>{" → "}<span className="text-emerald-400">{item.scoreTo}</span></p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
