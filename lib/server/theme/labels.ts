// Libellés fixes du thème, dans la langue de la boutique (réglages globaux du thème, modifiables).
export type Labels = Record<(typeof KEYS)[number], string>;

const KEYS = [
  "add", "soldout", "cart", "your_cart", "checkout", "total", "empty", "continue", "added", "unavailable",
  "free_left", "free_done", "secure", "save", "description", "shop", "about", "faq", "help", "all_products",
  "newsletter_ok", "email", "subscribe", "quantity", "search", "menu", "close",
  "reviews", "reviews_title", "reviews_note",
] as const;

const FR: Labels = {
  add: "Ajouter au panier", soldout: "Épuisé", cart: "Panier", your_cart: "Ton panier", checkout: "Passer commande", total: "Total",
  empty: "Ton panier est vide.", continue: "Continuer mes achats", added: "Ajouté au panier ✓", unavailable: "Ce produit est indisponible pour le moment.",
  free_left: "Plus que [montant] pour la livraison offerte", free_done: "Livraison offerte débloquée !", secure: "Paiement sécurisé",
  save: "Économise", description: "Description", shop: "Boutique", about: "Notre histoire", faq: "FAQ", help: "Aide", all_products: "Tous les produits",
  newsletter_ok: "Merci, c'est noté ✓", email: "Ton e-mail", subscribe: "Je m'inscris", quantity: "Quantité", search: "Rechercher", menu: "Menu", close: "Fermer",
  reviews: 'avis', reviews_title: "Ce qu'en disent les acheteurs", reviews_note: "Avis d'acheteurs de ce produit, traduits automatiquement.",
};

const EN: Labels = {
  add: "Add to cart", soldout: "Sold out", cart: "Cart", your_cart: "Your cart", checkout: "Checkout", total: "Total",
  empty: "Your cart is empty.", continue: "Continue shopping", added: "Added to cart ✓", unavailable: "This product is currently unavailable.",
  free_left: "Only [montant] away from free shipping", free_done: "Free shipping unlocked!", secure: "Secure payment",
  save: "Save", description: "Description", shop: "Shop", about: "Our story", faq: "FAQ", help: "Help", all_products: "All products",
  newsletter_ok: "Thanks, you're in ✓", email: "Your email", subscribe: "Subscribe", quantity: "Quantity", search: "Search", menu: "Menu", close: "Close",
  reviews: 'reviews', reviews_title: 'What buyers say', reviews_note: 'Reviews from buyers of this product, automatically translated.',
};

const ES: Labels = {
  ...EN, add: "Añadir al carrito", soldout: "Agotado", cart: "Carrito", your_cart: "Tu carrito", checkout: "Finalizar compra", empty: "Tu carrito está vacío.",
  continue: "Seguir comprando", added: "Añadido al carrito ✓", unavailable: "Este producto no está disponible por ahora.", free_left: "Te faltan [montant] para el envío gratis",
  free_done: "¡Envío gratis desbloqueado!", secure: "Pago seguro", save: "Ahorras", description: "Descripción", shop: "Tienda", about: "Nuestra historia",
  help: "Ayuda", all_products: "Todos los productos", newsletter_ok: "¡Gracias! ✓", email: "Tu email", subscribe: "Suscribirme", quantity: "Cantidad", search: "Buscar", menu: "Menú", close: "Cerrar",
  reviews: 'opiniones', reviews_title: 'Lo que dicen los compradores', reviews_note: 'Opiniones de compradores de este producto, traducidas automáticamente.',
};

const DE: Labels = {
  ...EN, add: "In den Warenkorb", soldout: "Ausverkauft", cart: "Warenkorb", your_cart: "Dein Warenkorb", checkout: "Zur Kasse", total: "Gesamt", empty: "Dein Warenkorb ist leer.",
  continue: "Weiter einkaufen", added: "Zum Warenkorb hinzugefügt ✓", unavailable: "Dieses Produkt ist derzeit nicht verfügbar.", free_left: "Noch [montant] bis zum kostenlosen Versand",
  free_done: "Kostenloser Versand freigeschaltet!", secure: "Sichere Zahlung", save: "Du sparst", description: "Beschreibung", shop: "Shop", about: "Unsere Geschichte",
  help: "Hilfe", all_products: "Alle Produkte", newsletter_ok: "Danke! ✓", email: "Deine E-Mail", subscribe: "Anmelden", quantity: "Menge", search: "Suchen", menu: "Menü", close: "Schließen",
  reviews: 'Bewertungen', reviews_title: 'Das sagen Käufer', reviews_note: 'Bewertungen von Käufern dieses Produkts, automatisch übersetzt.',
};

const IT: Labels = {
  ...EN, add: "Aggiungi al carrello", soldout: "Esaurito", cart: "Carrello", your_cart: "Il tuo carrello", checkout: "Vai al pagamento", total: "Totale", empty: "Il tuo carrello è vuoto.",
  continue: "Continua lo shopping", added: "Aggiunto al carrello ✓", unavailable: "Prodotto al momento non disponibile.", free_left: "Ancora [montant] per la spedizione gratuita",
  free_done: "Spedizione gratuita sbloccata!", secure: "Pagamento sicuro", save: "Risparmi", description: "Descrizione", shop: "Negozio", about: "La nostra storia",
  help: "Aiuto", all_products: "Tutti i prodotti", newsletter_ok: "Grazie! ✓", email: "La tua email", subscribe: "Iscriviti", quantity: "Quantità", search: "Cerca", menu: "Menu", close: "Chiudi",
  reviews: 'recensioni', reviews_title: 'Cosa dicono gli acquirenti', reviews_note: 'Recensioni di acquirenti di questo prodotto, tradotte automaticamente.',
};

const NL: Labels = {
  ...EN, add: "In winkelwagen", soldout: "Uitverkocht", cart: "Winkelwagen", your_cart: "Je winkelwagen", checkout: "Afrekenen", total: "Totaal", empty: "Je winkelwagen is leeg.",
  continue: "Verder winkelen", added: "Toegevoegd ✓", unavailable: "Dit product is momenteel niet beschikbaar.", free_left: "Nog [montant] tot gratis verzending",
  free_done: "Gratis verzending!", secure: "Veilig betalen", save: "Bespaar", description: "Beschrijving", shop: "Winkel", about: "Ons verhaal",
  help: "Hulp", all_products: "Alle producten", newsletter_ok: "Bedankt! ✓", email: "Je e-mail", subscribe: "Inschrijven", quantity: "Aantal", search: "Zoeken", menu: "Menu", close: "Sluiten",
  reviews: 'reviews', reviews_title: 'Wat kopers zeggen', reviews_note: 'Reviews van kopers van dit product, automatisch vertaald.',
};

const PT: Labels = {
  ...EN, add: "Adicionar ao carrinho", soldout: "Esgotado", cart: "Carrinho", your_cart: "O seu carrinho", checkout: "Finalizar compra", empty: "O seu carrinho está vazio.",
  continue: "Continuar a comprar", added: "Adicionado ✓", unavailable: "Produto indisponível de momento.", free_left: "Faltam [montant] para portes grátis",
  free_done: "Portes grátis desbloqueados!", secure: "Pagamento seguro", save: "Poupa", description: "Descrição", shop: "Loja", about: "A nossa história",
  help: "Ajuda", all_products: "Todos os produtos", newsletter_ok: "Obrigado! ✓", email: "O seu email", subscribe: "Subscrever", quantity: "Quantidade", search: "Pesquisar", menu: "Menu", close: "Fechar",
  reviews: 'avaliações', reviews_title: 'O que dizem os compradores', reviews_note: 'Avaliações de compradores deste produto, traduzidas automaticamente.',
};

export function labelsFor(language: string): Labels {
  const l = language.toLowerCase();
  if (l.startsWith("fr")) return FR;
  if (l.startsWith("es") || l.startsWith("esp")) return ES;
  if (l.startsWith("de") || l.startsWith("all")) return DE;
  if (l.startsWith("it")) return IT;
  if (l.startsWith("nl") || l.startsWith("néer") || l.startsWith("neer") || l.startsWith("dutch")) return NL;
  if (l.startsWith("pt") || l.startsWith("port")) return PT;
  return EN;
}

export const LABEL_KEYS = KEYS;
export const DEFAULT_LABELS = FR;
