import type { Metadata } from "next";
import { Mail, MessageCircle, Newspaper, Users } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHero } from "@/components/site/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", description: "Une question sur le produit, ta boutique ou un partenariat ? On répond sous 24 h ouvrées." };

export default function ContactPage() {
  const channels = [
    { icon: Mail, title: "E-mail", text: site.email, href: `mailto:${site.email}` },
    ...(site.whatsapp ? [{ icon: MessageCircle, title: "WhatsApp", text: "Réponse rapide en journée", href: `https://wa.me/${site.whatsapp}` }] : []),
    { icon: Users, title: "Agences", text: "Offres sur mesure pour gérer plusieurs boutiques", href: undefined },
    { icon: Newspaper, title: "Presse", text: "Interviews, visuels et informations", href: undefined },
  ];
  return (
    <>
      <PageHero eyebrow="Contact" title={<>Parlons de ta <span className="serif-accent">boutique</span></>} subtitle="Une question sur le produit, ta boutique ou un partenariat ? On répond sous 24 h ouvrées." />
      <Container className="grid max-w-[1050px] gap-8 lg:grid-cols-[0.8fr_1.4fr]">
        <div className="space-y-3">
          {channels.map((c, i) => (
            <Reveal key={c.title} delay={i * 60}>
              {c.href ? (
                <a href={c.href} className="surface flex gap-4 rounded-card p-5 transition-colors hover:border-black/20">
                  <c.icon className="mt-0.5 h-5 w-5 text-accent" /><span><span className="block">{c.title}</span><span className="text-sm text-fg-muted">{c.text}</span></span>
                </a>
              ) : (
                <div className="surface flex gap-4 rounded-card p-5">
                  <c.icon className="mt-0.5 h-5 w-5 text-accent" /><span><span className="block">{c.title}</span><span className="text-sm text-fg-muted">{c.text}</span></span>
                </div>
              )}
            </Reveal>
          ))}
        </div>
        <Reveal delay={100}><ContactForm /></Reveal>
      </Container>
    </>
  );
}
