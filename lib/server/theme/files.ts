// Fichiers fixes du thème Shopify « Vitrio » (Online Store 2.0).
// Le contenu propre à chaque boutique (textes, couleurs, polices) est injecté dans
// config/settings_data.json et templates/*.json par build.ts : le marchand peut tout modifier
// ensuite dans l'éditeur de thème Shopify.

const LAYOUT = `<!doctype html>
<html lang="{{ request.locale.iso_code }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="{{ settings.color_background }}">
  <link rel="canonical" href="{{ canonical_url }}">
  <title>{{ page_title }}{% unless page_title contains shop.name %} · {{ settings.brand_name | default: shop.name }}{% endunless %}</title>
  {% if page_description %}<meta name="description" content="{{ page_description | escape }}">{% endif %}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  {%- assign heading_family = settings.heading_font | replace: ' ', '+' -%}
  {%- assign body_family = settings.body_font | replace: ' ', '+' -%}
  {%- if settings.heading_style == 'serif' -%}
    <link href="https://fonts.googleapis.com/css2?family={{ heading_family }}:ital@0;1&display=swap" rel="stylesheet">
  {%- else -%}
    <link href="https://fonts.googleapis.com/css2?family={{ heading_family }}:wght@500;600;700&display=swap" rel="stylesheet">
  {%- endif -%}
  <link href="https://fonts.googleapis.com/css2?family={{ body_family }}:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --c-primary: {{ settings.color_primary }};
      --c-accent: {{ settings.color_accent }};
      --c-on-accent: {{ settings.color_on_accent }};
      --c-bg: {{ settings.color_background }};
      --c-soft: {{ settings.color_primary | color_modify: 'alpha', 0.05 }};
      --c-line: {{ settings.color_primary | color_modify: 'alpha', 0.12 }};
      --c-muted: {{ settings.color_primary | color_modify: 'alpha', 0.68 }};
      --c-accent-soft: {{ settings.color_accent | color_modify: 'alpha', 0.12 }};
      --f-heading: '{{ settings.heading_font }}', {% if settings.heading_style == 'serif' %}Georgia, serif{% else %}system-ui, sans-serif{% endif %};
      --f-body: '{{ settings.body_font }}', system-ui, -apple-system, sans-serif;
      --h-weight: {% if settings.heading_style == 'serif' %}400{% else %}600{% endif %};
      --h-track: {% if settings.heading_style == 'serif' %}-0.01em{% else %}-0.035em{% endif %};
    }
  </style>
  {{ 'vitrio.css' | asset_url | stylesheet_tag }}
  {{ content_for_header }}
</head>
<body class="template-{{ template.name }}">
  <a class="skip" href="#main">Aller au contenu</a>
  {% section 'announcement' %}
  {% section 'header' %}
  <main id="main">{{ content_for_layout }}</main>
  {% section 'footer' %}
  <script src="{{ 'vitrio.js' | asset_url }}" defer></script>
</body>
</html>
`;

const PASSWORD_LAYOUT = `<!doctype html>
<html lang="{{ request.locale.iso_code }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{{ settings.brand_name | default: shop.name }}</title>
  <style>:root{--c-primary:{{ settings.color_primary }};--c-accent:{{ settings.color_accent }};--c-on-accent:{{ settings.color_on_accent }};--c-bg:{{ settings.color_background }};--c-line:{{ settings.color_primary | color_modify: 'alpha', 0.12 }};--c-muted:{{ settings.color_primary | color_modify: 'alpha', 0.68 }};--f-heading:'{{ settings.heading_font }}',Georgia,serif;--f-body:'{{ settings.body_font }}',system-ui,sans-serif;--h-weight:500;--h-track:-0.02em}</style>
  {{ 'vitrio.css' | asset_url | stylesheet_tag }}
  {{ content_for_header }}
</head>
<body>{{ content_for_layout }}</body>
</html>
`;

const CSS = `*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--c-bg);color:var(--c-primary);font-family:var(--f-body);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
img{max-width:100%;height:auto;display:block}
a{color:inherit}
h1,h2,h3,.h{font-family:var(--f-heading);font-weight:var(--h-weight);letter-spacing:var(--h-track);line-height:1.08;margin:0}
p{margin:0}
.skip{position:absolute;left:-999px}.skip:focus{left:1rem;top:1rem;z-index:99;background:var(--c-bg);padding:.5rem 1rem}
.wrap{width:min(1180px,100% - 40px);margin-inline:auto}
.muted{color:var(--c-muted)}
.eyebrow{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--c-accent);font-weight:600}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:52px;padding:0 28px;border-radius:999px;border:0;background:var(--c-accent);color:var(--c-on-accent);font:600 15px/1 var(--f-body);text-decoration:none;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;box-shadow:0 10px 30px -12px var(--c-accent)}
.btn:hover{transform:translateY(-2px);box-shadow:0 16px 36px -12px var(--c-accent)}
.btn--ghost{background:transparent;color:var(--c-primary);border:1.5px solid var(--c-line);box-shadow:none}
.btn--block{width:100%}
.btn[disabled]{opacity:.5;cursor:not-allowed;transform:none}
/* bandeau */
.announce{background:var(--c-primary);color:var(--c-bg);text-align:center;font-size:13px;letter-spacing:.02em;padding:9px 16px}
/* en-tête */
.header{position:sticky;top:0;z-index:40;background:color-mix(in srgb,var(--c-bg) 88%,transparent);backdrop-filter:saturate(1.4) blur(12px);border-bottom:1px solid var(--c-line)}
.header__in{display:flex;align-items:center;justify-content:space-between;gap:24px;min-height:72px}
.logo{font-family:var(--f-heading);font-size:26px;font-weight:var(--h-weight);letter-spacing:var(--h-track);text-decoration:none}
.logo img{max-height:44px;width:auto}
.nav{display:flex;gap:28px;font-size:15px}
.nav a{text-decoration:none;color:var(--c-muted);transition:color .2s}.nav a:hover{color:var(--c-primary)}
.cart-link{position:relative;display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-size:15px}
.cart-count{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:99px;background:var(--c-accent);color:var(--c-on-accent);font-size:12px;font-weight:600}
.burger{display:none;background:none;border:0;color:inherit;padding:6px;cursor:pointer}
@media (max-width:820px){.nav{display:none}.burger{display:block}.nav.is-open{display:flex;position:absolute;left:0;right:0;top:100%;flex-direction:column;gap:0;background:var(--c-bg);border-bottom:1px solid var(--c-line)}.nav.is-open a{padding:16px 20px;border-top:1px solid var(--c-line)}}
/* héros */
.hero{padding:72px 0 64px;overflow:hidden}
.hero__grid{display:grid;grid-template-columns:1.05fr 1fr;gap:56px;align-items:center}
.hero h1{font-size:clamp(40px,5.6vw,72px);margin-top:14px}
.hero__sub{font-size:19px;margin-top:22px;max-width:34ch}
.hero__cta{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:34px}
.hero__trust{display:flex;flex-wrap:wrap;gap:18px;margin-top:28px;font-size:14px}
.hero__trust span{display:inline-flex;align-items:center;gap:7px}
.tick{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:var(--c-accent-soft);color:var(--c-accent);font-size:12px;font-weight:700;flex:none}
.visual{position:relative;aspect-ratio:4/4.3;border-radius:28px;overflow:hidden;background:linear-gradient(150deg,var(--c-soft),var(--c-accent-soft))}
.visual img{width:100%;height:100%;object-fit:cover}
.visual__art{position:absolute;inset:0;display:grid;place-items:center}
.visual__blob{position:absolute;width:78%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 30% 30%,color-mix(in srgb,var(--c-accent) 55%,#fff),var(--c-accent) 60%);filter:blur(2px);opacity:.35;animation:float 9s ease-in-out infinite}
.visual__card{position:relative;width:46%;aspect-ratio:3/4;border-radius:22%;background:linear-gradient(160deg,var(--c-accent),var(--c-primary));box-shadow:0 40px 80px -30px rgba(0,0,0,.45);animation:float 7s ease-in-out infinite reverse}
.visual__tag{position:absolute;right:7%;bottom:9%;background:var(--c-bg);border-radius:16px;padding:12px 16px;box-shadow:0 20px 40px -18px rgba(0,0,0,.35);font-size:14px}
.visual__tag strong{display:block;font-family:var(--f-heading);font-size:22px}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@media (max-width:900px){.hero{padding:40px 0}.hero__grid{grid-template-columns:1fr;gap:36px}}
/* bénéfices */
.section{padding:72px 0}
.section__head{max-width:640px;margin-bottom:40px}
.section__head h2{font-size:clamp(30px,3.6vw,44px);margin-top:10px}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.card{background:var(--c-soft);border:1px solid var(--c-line);border-radius:22px;padding:28px}
.card__n{display:inline-grid;place-items:center;width:38px;height:38px;border-radius:12px;background:var(--c-accent);color:var(--c-on-accent);font-weight:600;font-size:15px}
.card h3{font-size:22px;margin-top:18px}
.card p{margin-top:10px}
@media (max-width:900px){.cards{grid-template-columns:1fr}.section{padding:52px 0}}
/* produit */
.product{display:grid;grid-template-columns:1.1fr 1fr;gap:56px;align-items:start}
.gallery{display:grid;gap:12px;position:sticky;top:96px}
.gallery__main{border-radius:24px;overflow:hidden;background:var(--c-soft)}
.gallery__main img{width:100%;aspect-ratio:1;object-fit:cover}
.gallery__thumbs{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.gallery__thumbs button{padding:0;border:2px solid transparent;border-radius:12px;overflow:hidden;cursor:pointer;background:none}
.gallery__thumbs button.is-active{border-color:var(--c-accent)}
.gallery__thumbs img{aspect-ratio:1;object-fit:cover}
.product__title{font-size:clamp(32px,3.4vw,46px)}
.product__sub{margin-top:8px;font-size:17px}
.price{display:flex;align-items:baseline;gap:12px;margin-top:20px;font-size:26px;font-weight:600}
.price s{font-size:18px;font-weight:400;color:var(--c-muted)}
.badge{display:inline-block;padding:4px 10px;border-radius:99px;background:var(--c-accent);color:var(--c-on-accent);font-size:12px;font-weight:600}
.bullets{list-style:none;padding:0;margin:24px 0 0;display:grid;gap:10px}
.bullets li{display:flex;gap:10px;align-items:flex-start}
.offer{margin-top:22px;border:2px solid var(--c-accent);background:var(--c-accent-soft);border-radius:16px;padding:14px 16px;font-size:15px;display:flex;gap:10px;align-items:center}
.buy{margin-top:26px;display:grid;gap:12px}
.field label{display:block;font-size:13px;margin-bottom:6px;color:var(--c-muted)}
.field select,.qty input{width:100%;min-height:50px;border:1.5px solid var(--c-line);border-radius:14px;background:transparent;color:inherit;font:inherit;padding:0 14px}
.buy__row{display:grid;grid-template-columns:120px 1fr;gap:12px}
.qty{display:flex}
.shopify-payment-button__button{border-radius:999px!important;min-height:52px!important}
.reassure{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}
.reassure div{border:1px solid var(--c-line);border-radius:14px;padding:12px;font-size:13px;text-align:center}
.reassure strong{display:block;font-size:14px}
.rte{margin-top:30px;padding-top:26px;border-top:1px solid var(--c-line)}
.rte h3{font-size:22px;margin:26px 0 10px}
.rte p{margin:0 0 12px}.rte ul{padding-left:20px}.rte li{margin:6px 0}
@media (max-width:900px){.product{grid-template-columns:1fr;gap:28px}.gallery{position:static}.reassure{grid-template-columns:1fr 1fr 1fr}}
/* promesse */
.promise{background:var(--c-primary);color:var(--c-bg);border-radius:32px;padding:72px 40px;text-align:center;position:relative;overflow:hidden}
.promise::before{content:"";position:absolute;width:420px;height:420px;border-radius:50%;background:var(--c-accent);opacity:.35;filter:blur(90px);top:-160px;right:-120px}
.promise p.h{position:relative;font-size:clamp(28px,3.6vw,46px);max-width:24ch;margin:0 auto}
.promise .btn{position:relative;margin-top:30px}
/* faq */
.faq{max-width:820px}
.faq details{border-bottom:1px solid var(--c-line)}
.faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:20px;padding:22px 0;font-weight:600;font-size:18px}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";font-size:24px;line-height:1;color:var(--c-accent);transition:transform .25s}
.faq details[open] summary::after{transform:rotate(45deg)}
.faq details p{padding:0 0 22px;color:var(--c-muted)}
/* pages */
.page{max-width:760px;padding:64px 0}
.page h1{font-size:clamp(34px,4vw,52px);margin-bottom:28px}
/* collection */
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.tile{text-decoration:none}
.tile__img{border-radius:20px;overflow:hidden;background:linear-gradient(150deg,var(--c-soft),var(--c-accent-soft));aspect-ratio:1}
.tile__img img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.tile:hover img{transform:scale(1.04)}
.tile h3{font-size:19px;margin-top:14px}
@media (max-width:900px){.grid{grid-template-columns:1fr 1fr}}
/* panier */
.cart-line{display:grid;grid-template-columns:90px 1fr auto;gap:18px;align-items:center;padding:18px 0;border-bottom:1px solid var(--c-line)}
.cart-line img{border-radius:12px}
.cart-total{display:flex;justify-content:space-between;font-size:20px;font-weight:600;margin:26px 0}
/* pied de page */
.footer{margin-top:72px;background:var(--c-soft);border-top:1px solid var(--c-line);padding:56px 0 32px}
.footer__grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:32px}
.footer h4{font-size:13px;letter-spacing:.12em;text-transform:uppercase;margin:0 0 14px;color:var(--c-muted);font-weight:600}
.footer ul{list-style:none;padding:0;margin:0;display:grid;gap:8px}
.footer a{text-decoration:none}.footer a:hover{text-decoration:underline}
.footer__bottom{margin-top:44px;font-size:13px;color:var(--c-muted)}
@media (max-width:820px){.footer__grid{grid-template-columns:1fr}}
/* apparitions */
.reveal{opacity:0;transform:translateY(18px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.8,.2,1)}
.reveal.is-in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none}.visual__blob,.visual__card{animation:none}}
.form input[type=email],.form input[type=password],.form input[type=text]{width:100%;min-height:50px;border:1.5px solid var(--c-line);border-radius:14px;background:transparent;color:inherit;font:inherit;padding:0 14px;margin-bottom:12px}
`;

const JS = `(function(){
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'}) : null;
  document.querySelectorAll('.reveal').forEach(function(el){io ? io.observe(el) : el.classList.add('is-in')});
  var b = document.querySelector('.burger'), n = document.querySelector('.nav');
  if (b && n) b.addEventListener('click', function(){ var o = n.classList.toggle('is-open'); b.setAttribute('aria-expanded', o) });
  document.querySelectorAll('[data-gallery]').forEach(function(g){
    var main = g.querySelector('.gallery__main img');
    g.querySelectorAll('.gallery__thumbs button').forEach(function(t){
      t.addEventListener('click', function(){ main.src = t.dataset.src; g.querySelectorAll('.gallery__thumbs button').forEach(function(x){x.classList.remove('is-active')}); t.classList.add('is-active') });
    });
  });
  document.querySelectorAll('[data-variant-select]').forEach(function(s){
    s.addEventListener('change', function(){ var o = s.options[s.selectedIndex]; var p = document.querySelector('[data-price]'); if (p && o.dataset.price) p.textContent = o.dataset.price; var btn = document.querySelector('[data-add]'); if (btn) { btn.disabled = o.dataset.available !== 'true'; btn.textContent = btn.disabled ? btn.dataset.soldout : btn.dataset.label } });
  });
})();
`;

// Bouton d'achat, réutilisé par la fiche produit et le produit mis en avant.
const BUY_FORM = `{%- assign current = product.selected_or_first_available_variant -%}
{%- form 'product', product, class: 'buy' -%}
  {%- unless product.has_only_default_variant -%}
    <div class="field">
      <label for="v-{{ section.id }}">{{ product.options | join: ' / ' }}</label>
      <select id="v-{{ section.id }}" name="id" data-variant-select>
        {%- for v in product.variants -%}
          <option value="{{ v.id }}" data-price="{{ v.price | money }}" data-available="{{ v.available }}" {% if v == current %}selected{% endif %}>{{ v.title }}{% unless v.available %} — épuisé{% endunless %}</option>
        {%- endfor -%}
      </select>
    </div>
  {%- else -%}
    <input type="hidden" name="id" value="{{ current.id }}">
  {%- endunless -%}
  <div class="buy__row">
    <div class="qty field"><input type="number" name="quantity" value="1" min="1" aria-label="Quantité"></div>
    <button type="submit" class="btn btn--block" data-add data-label="{{ section.settings.add_label | escape }}" data-soldout="Épuisé" {% unless current.available %}disabled{% endunless %}>{% if current.available %}{{ section.settings.add_label }}{% else %}Épuisé{% endif %}</button>
  </div>
  {{ form | payment_button }}
{%- endform -%}`;

const PRICE = `<p class="price"><span data-price>{{ product.selected_or_first_available_variant.price | money }}</span>{% if product.selected_or_first_available_variant.compare_at_price > product.selected_or_first_available_variant.price %}<s>{{ product.selected_or_first_available_variant.compare_at_price | money }}</s><span class="badge">-{{ product.selected_or_first_available_variant.compare_at_price | minus: product.selected_or_first_available_variant.price | times: 100.0 | divided_by: product.selected_or_first_available_variant.compare_at_price | round }} %</span>{% endif %}</p>`;

const REASSURE = `<div class="reassure">
  <div><strong>{{ section.settings.r1_title }}</strong><span class="muted">{{ section.settings.r1_text }}</span></div>
  <div><strong>{{ section.settings.r2_title }}</strong><span class="muted">{{ section.settings.r2_text }}</span></div>
  <div><strong>{{ section.settings.r3_title }}</strong><span class="muted">{{ section.settings.r3_text }}</span></div>
</div>`;

const REASSURE_SETTINGS = [
  ["r1", "Livraison", "48-72 h"],
  ["r2", "Retours", "30 jours"],
  ["r3", "Paiement", "100 % sécurisé"],
].flatMap(([k, t, x]) => [
  { type: "text", id: `${k}_title`, label: `Réassurance ${k.slice(1)} : titre`, default: t },
  { type: "text", id: `${k}_text`, label: `Réassurance ${k.slice(1)} : texte`, default: x },
]);

const schema = (o: unknown) => `{% schema %}\n${JSON.stringify(o, null, 2)}\n{% endschema %}`;

const GALLERY = `<div class="gallery" data-gallery>
  <div class="gallery__main">
    {%- if product.featured_media -%}
      <img src="{{ product.featured_media | image_url: width: 1400 }}" alt="{{ product.featured_media.alt | default: product.title | escape }}" width="1400" height="1400" loading="eager">
    {%- else -%}
      <div class="visual" style="aspect-ratio:1;border-radius:0"><div class="visual__art"><div class="visual__blob"></div><div class="visual__card"></div></div></div>
    {%- endif -%}
  </div>
  {%- if product.media.size > 1 -%}
    <div class="gallery__thumbs">
      {%- for m in product.media limit: 5 -%}
        <button type="button" data-src="{{ m | image_url: width: 1400 }}" class="{% if forloop.first %}is-active{% endif %}" aria-label="Image {{ forloop.index }}"><img src="{{ m | image_url: width: 200 }}" alt="" width="200" height="200" loading="lazy"></button>
      {%- endfor -%}
    </div>
  {%- endif -%}
</div>`;

const SECTIONS: Record<string, string> = {
  announcement: `{%- if section.settings.text != blank -%}<div class="announce">{{ section.settings.text }}</div>{%- endif -%}
${schema({ name: "Bandeau d'annonce", settings: [{ type: "text", id: "text", label: "Texte", default: "Livraison offerte" }] })}`,

  header: `<header class="header">
  <div class="wrap header__in">
    <a class="logo" href="{{ routes.root_url }}">{% if section.settings.logo %}<img src="{{ section.settings.logo | image_url: width: 300 }}" alt="{{ settings.brand_name | escape }}" width="150" height="44">{% else %}{{ settings.brand_name | default: shop.name }}{% endif %}</a>
    <nav class="nav" aria-label="Menu principal">
      {%- if section.settings.menu != blank -%}
        {%- for link in linklists[section.settings.menu].links -%}<a href="{{ link.url }}">{{ link.title }}</a>{%- endfor -%}
      {%- else -%}
        <a href="{{ section.settings.shop_url | default: routes.all_products_collection_url }}">Boutique</a>
        {% if section.settings.about_url != blank %}<a href="{{ section.settings.about_url }}">{{ section.settings.about_label }}</a>{% endif %}
        {% if section.settings.faq_url != blank %}<a href="{{ section.settings.faq_url }}">FAQ</a>{% endif %}
      {%- endif -%}
    </nav>
    <div style="display:flex;align-items:center;gap:8px">
      <a class="cart-link" href="{{ routes.cart_url }}">Panier <span class="cart-count">{{ cart.item_count }}</span></a>
      <button class="burger" type="button" aria-label="Menu" aria-expanded="false"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
  </div>
</header>
${schema({ name: "En-tête", settings: [
    { type: "image_picker", id: "logo", label: "Logo (facultatif)" },
    { type: "link_list", id: "menu", label: "Menu (facultatif, sinon liens automatiques)" },
    { type: "url", id: "shop_url", label: "Lien « Boutique »" },
    { type: "url", id: "about_url", label: "Lien « Notre histoire »" },
    { type: "text", id: "about_label", label: "Libellé « Notre histoire »", default: "Notre histoire" },
    { type: "url", id: "faq_url", label: "Lien FAQ" },
  ] })}`,

  footer: `<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div>
        <p class="logo">{{ settings.brand_name | default: shop.name }}</p>
        <p class="muted" style="margin-top:10px;max-width:40ch">{{ section.settings.tagline }}</p>
      </div>
      <div><h4>Boutique</h4><ul><li><a href="{{ routes.all_products_collection_url }}">Tous les produits</a></li><li><a href="{{ routes.cart_url }}">Panier</a></li></ul></div>
      <div><h4>Aide</h4><ul>{% if section.settings.faq_url != blank %}<li><a href="{{ section.settings.faq_url }}">FAQ</a></li>{% endif %}{% if section.settings.about_url != blank %}<li><a href="{{ section.settings.about_url }}">Notre histoire</a></li>{% endif %}{%- for policy in shop.policies -%}<li><a href="{{ policy.url }}">{{ policy.title }}</a></li>{%- endfor -%}</ul></div>
    </div>
    <p class="footer__bottom">© {{ 'now' | date: '%Y' }} {{ settings.brand_name | default: shop.name }}</p>
  </div>
</footer>
${schema({ name: "Pied de page", settings: [
    { type: "text", id: "tagline", label: "Slogan" },
    { type: "url", id: "about_url", label: "Lien « Notre histoire »" },
    { type: "url", id: "faq_url", label: "Lien FAQ" },
  ] })}`,

  hero: `{%- assign p = all_products[section.settings.product] -%}
<section class="hero">
  <div class="wrap hero__grid">
    <div class="reveal">
      {% if section.settings.eyebrow != blank %}<p class="eyebrow">{{ section.settings.eyebrow }}</p>{% endif %}
      <h1>{{ section.settings.title }}</h1>
      <p class="hero__sub muted">{{ section.settings.subtitle }}</p>
      <div class="hero__cta">
        <a class="btn" href="{% if p %}{{ p.url }}{% else %}{{ routes.all_products_collection_url }}{% endif %}">{{ section.settings.cta }}</a>
        {% if p %}<span class="muted">{{ p.price | money }}</span>{% endif %}
      </div>
      <div class="hero__trust muted">
        {% if section.settings.t1 != blank %}<span><span class="tick">✓</span>{{ section.settings.t1 }}</span>{% endif %}
        {% if section.settings.t2 != blank %}<span><span class="tick">✓</span>{{ section.settings.t2 }}</span>{% endif %}
        {% if section.settings.t3 != blank %}<span><span class="tick">✓</span>{{ section.settings.t3 }}</span>{% endif %}
      </div>
    </div>
    <div class="visual reveal">
      {%- if section.settings.image -%}
        <img src="{{ section.settings.image | image_url: width: 1400 }}" alt="" width="1400" height="1500" loading="eager">
      {%- elsif p and p.featured_media -%}
        <img src="{{ p.featured_media | image_url: width: 1400 }}" alt="{{ p.title | escape }}" width="1400" height="1500" loading="eager">
      {%- else -%}
        <div class="visual__art"><div class="visual__blob"></div><div class="visual__card"></div></div>
      {%- endif -%}
      {% if p %}<div class="visual__tag"><span class="muted">{{ p.title }}</span><strong>{{ p.price | money }}</strong></div>{% endif %}
    </div>
  </div>
</section>
${schema({ name: "Héros", settings: [
    { type: "text", id: "eyebrow", label: "Sur-titre" },
    { type: "textarea", id: "title", label: "Titre" },
    { type: "textarea", id: "subtitle", label: "Sous-titre" },
    { type: "text", id: "cta", label: "Bouton", default: "Découvrir" },
    { type: "product", id: "product", label: "Produit mis en avant" },
    { type: "image_picker", id: "image", label: "Image (sinon la photo du produit)" },
    { type: "text", id: "t1", label: "Argument 1" },
    { type: "text", id: "t2", label: "Argument 2" },
    { type: "text", id: "t3", label: "Argument 3" },
  ], presets: [{ name: "Héros" }] })}`,

  benefits: `<section class="section">
  <div class="wrap">
    <div class="section__head reveal">{% if section.settings.eyebrow != blank %}<p class="eyebrow">{{ section.settings.eyebrow }}</p>{% endif %}<h2>{{ section.settings.title }}</h2></div>
    <div class="cards">
      {%- for block in section.blocks -%}
        <div class="card reveal" style="transition-delay:{{ forloop.index0 | times: 100 }}ms" {{ block.shopify_attributes }}>
          <span class="card__n">{{ forloop.index }}</span>
          <h3>{{ block.settings.title }}</h3>
          <p class="muted">{{ block.settings.text }}</p>
        </div>
      {%- endfor -%}
    </div>
  </div>
</section>
${schema({ name: "Bénéfices", settings: [{ type: "text", id: "eyebrow", label: "Sur-titre" }, { type: "text", id: "title", label: "Titre" }], blocks: [{ type: "benefit", name: "Bénéfice", settings: [{ type: "text", id: "title", label: "Titre" }, { type: "textarea", id: "text", label: "Texte" }] }], max_blocks: 6, presets: [{ name: "Bénéfices" }] })}`,

  "featured-product": `{%- assign product = all_products[section.settings.product] -%}
{%- if product -%}
<section class="section" style="background:var(--c-soft)">
  <div class="wrap product">
    <div class="reveal">${GALLERY}</div>
    <div class="reveal">
      <p class="eyebrow">{{ section.settings.eyebrow }}</p>
      <h2 class="product__title" style="margin-top:10px">{{ product.title }}</h2>
      ${PRICE}
      <ul class="bullets">{%- for block in section.blocks -%}<li {{ block.shopify_attributes }}><span class="tick">✓</span>{{ block.settings.text }}</li>{%- endfor -%}</ul>
      ${BUY_FORM}
      ${REASSURE}
      <p style="margin-top:18px"><a href="{{ product.url }}" class="muted">Voir tous les détails →</a></p>
    </div>
  </div>
</section>
{%- endif -%}
${schema({ name: "Produit mis en avant", settings: [{ type: "product", id: "product", label: "Produit" }, { type: "text", id: "eyebrow", label: "Sur-titre", default: "Notre produit" }, { type: "text", id: "add_label", label: "Bouton", default: "Ajouter au panier" }, ...REASSURE_SETTINGS], blocks: [{ type: "bullet", name: "Point fort", settings: [{ type: "text", id: "text", label: "Texte" }] }], presets: [{ name: "Produit mis en avant" }] })}`,

  promise: `<section class="section">
  <div class="wrap">
    <div class="promise reveal">
      <p class="h">{{ section.settings.text }}</p>
      {% if section.settings.cta != blank %}<a class="btn" href="{{ section.settings.url | default: routes.all_products_collection_url }}">{{ section.settings.cta }}</a>{% endif %}
    </div>
  </div>
</section>
${schema({ name: "Promesse", settings: [{ type: "textarea", id: "text", label: "Texte" }, { type: "text", id: "cta", label: "Bouton" }, { type: "url", id: "url", label: "Lien du bouton" }], presets: [{ name: "Promesse" }] })}`,

  faq: `<section class="section">
  <div class="wrap faq">
    <div class="section__head reveal">{% if section.settings.eyebrow != blank %}<p class="eyebrow">{{ section.settings.eyebrow }}</p>{% endif %}<h2>{{ section.settings.title }}</h2></div>
    {%- for block in section.blocks -%}
      <details class="reveal" {{ block.shopify_attributes }} {% if forloop.first and section.settings.open_first %}open{% endif %}><summary>{{ block.settings.question }}</summary><p>{{ block.settings.answer }}</p></details>
    {%- endfor -%}
  </div>
</section>
${schema({ name: "FAQ", settings: [{ type: "text", id: "eyebrow", label: "Sur-titre" }, { type: "text", id: "title", label: "Titre", default: "Questions fréquentes" }, { type: "checkbox", id: "open_first", label: "Ouvrir la première question", default: true }], blocks: [{ type: "q", name: "Question", settings: [{ type: "text", id: "question", label: "Question" }, { type: "textarea", id: "answer", label: "Réponse" }] }], presets: [{ name: "FAQ" }] })}`,

  "main-product": `<section class="section" style="padding-top:48px">
  <div class="wrap product">
    ${GALLERY}
    <div>
      <h1 class="product__title">{{ product.title }}</h1>
      {% if section.settings.subtitle != blank %}<p class="product__sub muted">{{ section.settings.subtitle }}</p>{% endif %}
      ${PRICE}
      <ul class="bullets">{%- for block in section.blocks -%}{%- if block.type == 'bullet' -%}<li {{ block.shopify_attributes }}><span class="tick">✓</span>{{ block.settings.text }}</li>{%- endif -%}{%- endfor -%}</ul>
      {%- for block in section.blocks -%}{%- if block.type == 'offer' -%}<div class="offer" {{ block.shopify_attributes }}><span class="tick">★</span>{{ block.settings.text }}</div>{%- endif -%}{%- endfor -%}
      ${BUY_FORM}
      ${REASSURE}
      <div class="rte">{{ product.description }}</div>
    </div>
  </div>
</section>
${schema({ name: "Fiche produit", settings: [{ type: "text", id: "subtitle", label: "Sous-titre" }, { type: "text", id: "add_label", label: "Bouton", default: "Ajouter au panier" }, ...REASSURE_SETTINGS], blocks: [{ type: "bullet", name: "Point fort", settings: [{ type: "text", id: "text", label: "Texte" }] }, { type: "offer", name: "Offre", settings: [{ type: "text", id: "text", label: "Texte" }] }] })}`,

  "main-page": `<div class="wrap page"><h1>{{ page.title }}</h1><div class="rte" style="border:0;padding:0;margin:0">{{ page.content }}</div></div>
${schema({ name: "Page" })}`,

  "main-collection": `<section class="section"><div class="wrap">
  <div class="section__head"><h1 class="h" style="font-size:clamp(32px,4vw,48px)">{{ collection.title }}</h1></div>
  {%- paginate collection.products by 24 -%}
  <div class="grid">
    {%- for p in collection.products -%}
      <a class="tile reveal" href="{{ p.url }}"><div class="tile__img">{% if p.featured_media %}<img src="{{ p.featured_media | image_url: width: 700 }}" alt="{{ p.title | escape }}" width="700" height="700" loading="lazy">{% endif %}</div><h3>{{ p.title }}</h3><p class="muted">{{ p.price | money }}</p></a>
    {%- else -%}<p class="muted">Aucun produit pour le moment.</p>
    {%- endfor -%}
  </div>
  {%- if paginate.pages > 1 -%}<p style="margin-top:32px">{{ paginate | default_pagination }}</p>{%- endif -%}
  {%- endpaginate -%}
</div></section>
${schema({ name: "Collection" })}`,

  "main-list-collections": `<section class="section"><div class="wrap"><div class="section__head"><h1 class="h" style="font-size:44px">Collections</h1></div><div class="grid">{%- for c in collections -%}<a class="tile" href="{{ c.url }}"><div class="tile__img">{% if c.featured_image %}<img src="{{ c.featured_image | image_url: width: 700 }}" alt="" width="700" height="700" loading="lazy">{% endif %}</div><h3>{{ c.title }}</h3></a>{%- endfor -%}</div></div></section>
${schema({ name: "Liste des collections" })}`,

  "main-cart": `<section class="section"><div class="wrap" style="max-width:820px">
  <h1 class="h" style="font-size:44px;margin-bottom:24px">Panier</h1>
  {%- if cart.item_count > 0 -%}
  <form action="{{ routes.cart_url }}" method="post">
    {%- for item in cart.items -%}
      <div class="cart-line">
        {% if item.image %}<img src="{{ item.image | image_url: width: 180 }}" alt="" width="90" height="90">{% else %}<span></span>{% endif %}
        <div><a href="{{ item.url }}">{{ item.product.title }}</a>{% unless item.product.has_only_default_variant %}<p class="muted">{{ item.variant.title }}</p>{% endunless %}
          <div class="qty" style="max-width:110px;margin-top:8px"><input type="number" name="updates[]" value="{{ item.quantity }}" min="0" aria-label="Quantité"></div></div>
        <strong>{{ item.final_line_price | money }}</strong>
      </div>
    {%- endfor -%}
    <div class="cart-total"><span>Total</span><span>{{ cart.total_price | money }}</span></div>
    <div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn btn--ghost" type="submit" name="update">Mettre à jour</button><button class="btn" type="submit" name="checkout">Passer commande</button></div>
  </form>
  {%- else -%}
    <p class="muted">Ton panier est vide.</p><p style="margin-top:20px"><a class="btn" href="{{ routes.all_products_collection_url }}">Continuer mes achats</a></p>
  {%- endif -%}
</div></section>
${schema({ name: "Panier" })}`,

  "main-404": `<div class="wrap page" style="text-align:center"><h1>Page introuvable</h1><p class="muted">Cette page n'existe pas ou a été déplacée.</p><p style="margin-top:24px"><a class="btn" href="{{ routes.root_url }}">Retour à l'accueil</a></p></div>
${schema({ name: "404" })}`,

  "main-search": `<section class="section"><div class="wrap">
  <form action="{{ routes.search_url }}" class="form" style="max-width:520px"><input type="text" name="q" value="{{ search.terms | escape }}" placeholder="Rechercher" aria-label="Rechercher"></form>
  {%- if search.performed -%}<div class="grid" style="margin-top:24px">{%- for r in search.results -%}<a class="tile" href="{{ r.url }}"><h3>{{ r.title }}</h3></a>{%- else -%}<p class="muted">Aucun résultat.</p>{%- endfor -%}</div>{%- endif -%}
</div></section>
${schema({ name: "Recherche" })}`,

  "main-blog": `<section class="section"><div class="wrap"><h1 class="h" style="font-size:44px;margin-bottom:28px">{{ blog.title }}</h1><div class="grid">{%- for a in blog.articles -%}<a class="tile" href="{{ a.url }}"><h3>{{ a.title }}</h3><p class="muted">{{ a.excerpt_or_content | strip_html | truncate: 120 }}</p></a>{%- endfor -%}</div></div></section>
${schema({ name: "Blog" })}`,

  "main-article": `<article class="wrap page"><h1>{{ article.title }}</h1><div class="rte" style="border:0;padding:0">{{ article.content }}</div></article>
${schema({ name: "Article" })}`,

  "main-password": `<div class="wrap page" style="text-align:center;min-height:80vh;display:grid;place-content:center">
  <p class="logo">{{ settings.brand_name | default: shop.name }}</p>
  <h1 style="margin-top:18px;font-size:40px">Bientôt en ligne</h1>
  <p class="muted" style="margin-top:12px">{{ shop.password_message }}</p>
  {%- form 'storefront_password', class: 'form' -%}<div style="margin-top:28px;display:grid;gap:10px;max-width:360px;margin-inline:auto"><input type="password" name="password" placeholder="Mot de passe" aria-label="Mot de passe"><button class="btn" type="submit">Entrer</button>{{ form.errors | default_errors }}</div>{%- endform -%}
</div>
${schema({ name: "Mot de passe" })}`,
};

const CUSTOMERS: Record<string, string> = {
  login: `<div class="wrap page" style="max-width:440px"><h1>Connexion</h1>{%- form 'customer_login', class: 'form' -%}{{ form.errors | default_errors }}<input type="email" name="customer[email]" placeholder="E-mail" autocomplete="email"><input type="password" name="customer[password]" placeholder="Mot de passe" autocomplete="current-password"><button class="btn btn--block" type="submit">Se connecter</button>{%- endform -%}<p style="margin-top:16px"><a href="{{ routes.account_register_url }}">Créer un compte</a></p></div>`,
  register: `<div class="wrap page" style="max-width:440px"><h1>Créer un compte</h1>{%- form 'create_customer', class: 'form' -%}{{ form.errors | default_errors }}<input type="text" name="customer[first_name]" placeholder="Prénom"><input type="email" name="customer[email]" placeholder="E-mail"><input type="password" name="customer[password]" placeholder="Mot de passe"><button class="btn btn--block" type="submit">Créer mon compte</button>{%- endform -%}</div>`,
  account: `<div class="wrap page"><h1>Mon compte</h1><p class="muted">{{ customer.email }}</p><p style="margin-top:16px"><a href="{{ routes.account_logout_url }}">Se déconnecter</a></p>{%- for order in customer.orders -%}<p style="margin-top:12px"><a href="{{ order.customer_url }}">{{ order.name }}</a> · {{ order.total_price | money }}</p>{%- endfor -%}</div>`,
  order: `<div class="wrap page"><h1>Commande {{ order.name }}</h1>{%- for li in order.line_items -%}<p>{{ li.title }} × {{ li.quantity }} — {{ li.final_line_price | money }}</p>{%- endfor -%}<p style="margin-top:16px"><strong>Total : {{ order.total_price | money }}</strong></p></div>`,
  addresses: `<div class="wrap page"><h1>Mes adresses</h1>{%- for address in customer.addresses -%}<p>{{ address | format_address }}</p>{%- endfor -%}</div>`,
  activate_account: `<div class="wrap page" style="max-width:440px"><h1>Activer mon compte</h1>{%- form 'activate_customer_password', class: 'form' -%}{{ form.errors | default_errors }}<input type="password" name="customer[password]" placeholder="Mot de passe"><input type="password" name="customer[password_confirmation]" placeholder="Confirmation"><button class="btn btn--block" type="submit">Activer</button>{%- endform -%}</div>`,
  reset_password: `<div class="wrap page" style="max-width:440px"><h1>Nouveau mot de passe</h1>{%- form 'reset_customer_password', class: 'form' -%}{{ form.errors | default_errors }}<input type="password" name="customer[password]" placeholder="Mot de passe"><input type="password" name="customer[password_confirmation]" placeholder="Confirmation"><button class="btn btn--block" type="submit">Enregistrer</button>{%- endform -%}</div>`,
};

const GIFT_CARD = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Carte cadeau</title>{{ content_for_header }}</head><body style="font-family:system-ui;text-align:center;padding:48px"><h1>Carte cadeau {{ shop.name }}</h1><p style="font-size:32px">{{ gift_card.balance | money }}</p><p>Code : <strong>{{ gift_card.code | format_code }}</strong></p></body></html>`;

export const SETTINGS_SCHEMA = [
  { name: "theme_info", theme_name: "Vitrio", theme_version: "1.0.0", theme_author: "Vitrio", theme_documentation_url: "https://nathanaeljetaime.vercel.app/aide", theme_support_url: "https://nathanaeljetaime.vercel.app/contact" },
  { name: "Marque", settings: [
    { type: "text", id: "brand_name", label: "Nom de la marque" },
    { type: "color", id: "color_primary", label: "Couleur du texte", default: "#1d1d22" },
    { type: "color", id: "color_accent", label: "Couleur d'accent (boutons)", default: "#00a676" },
    { type: "color", id: "color_on_accent", label: "Texte sur les boutons", default: "#ffffff" },
    { type: "color", id: "color_background", label: "Fond", default: "#f7f6f2" },
    { type: "text", id: "heading_font", label: "Police des titres (Google Fonts)", default: "Instrument Serif" },
    { type: "select", id: "heading_style", label: "Style des titres", options: [{ value: "serif", label: "Serif" }, { value: "sans", label: "Sans serif" }], default: "serif" },
    { type: "text", id: "body_font", label: "Police du texte (Google Fonts)", default: "DM Sans" },
  ] },
];

// Tous les fichiers fixes du thème, prêts à être zippés.
export function staticThemeFiles(): Record<string, string> {
  const files: Record<string, string> = {
    "layout/theme.liquid": LAYOUT,
    "layout/password.liquid": PASSWORD_LAYOUT,
    "assets/vitrio.css": CSS,
    "assets/vitrio.js": JS,
    "config/settings_schema.json": JSON.stringify(SETTINGS_SCHEMA, null, 2),
    "locales/fr.default.json": JSON.stringify({ general: { brand: "Vitrio" } }, null, 2),
    "locales/en.json": JSON.stringify({ general: { brand: "Vitrio" } }, null, 2),
    "templates/gift_card.liquid": GIFT_CARD,
  };
  for (const [name, src] of Object.entries(SECTIONS)) files[`sections/${name}.liquid`] = src;
  for (const [name, src] of Object.entries(CUSTOMERS)) files[`templates/customers/${name}.liquid`] = src;
  return files;
}
