// Ne garde qu'un HTML de mise en forme simple (texte généré par l'IA) avant de l'afficher.
const ALLOWED = /^(p|h3|h4|ul|ol|li|strong|em|br)$/i;

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed|svg|math|template)[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-z0-9]+)\b[^>]*>/gi, (tag, name: string) => {
      if (!ALLOWED.test(name)) return "";
      return tag.startsWith("</") ? `</${name.toLowerCase()}>` : `<${name.toLowerCase()}>`;
    });
}
