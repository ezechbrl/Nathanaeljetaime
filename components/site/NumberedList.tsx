import { Reveal } from "@/components/ui/Reveal";

export function NumberedList({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ol className="grid gap-px overflow-hidden rounded-card border border-white/[0.07] bg-white/[0.07] md:grid-cols-2 lg:grid-cols-4">
      {items.map((s, i) => (
        <Reveal as="li" key={s.title} delay={i * 70} className="bg-bg p-6">
          <p className="font-serif text-4xl italic text-accent">{String(i + 1).padStart(2, "0")}</p>
          <p className="mt-4 text-lg tracking-tight">{s.title}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">{s.text}</p>
        </Reveal>
      ))}
    </ol>
  );
}
