// Fichiers fixes du thème Shopify « Vigenia » (Online Store 2.0, version 2).
// Le contenu propre à chaque boutique (textes, couleurs, polices, visuels, offres) est injecté dans
// config/settings_data.json et templates/*.json par build.ts : le marchand peut tout modifier
// ensuite dans l'éditeur de thème Shopify.
import { ICON_OPTIONS, ICON_SNIPPET } from "./icons";
import { DEFAULT_LABELS, LABEL_KEYS } from "./labels";

const L = (k: string) => `{{ settings.label_${k} }}`;

const LAYOUT = `<!doctype html>
<html lang="{{ request.locale.iso_code }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="{{ settings.color_background }}">
  <link rel="canonical" href="{{ canonical_url }}">
  <title>{{ page_title }}{% unless page_title contains settings.brand_name %} · {{ settings.brand_name | default: shop.name }}{% endunless %}</title>
  {% if page_description %}<meta name="description" content="{{ page_description | escape }}">{% endif %}
  <meta property="og:title" content="{{ page_title | escape }}">
  {% if page_image %}<meta property="og:image" content="https:{{ page_image | image_url: width: 1200 }}">{% endif %}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  {%- assign heading_family = settings.heading_font | replace: ' ', '+' -%}
  {%- assign body_family = settings.body_font | replace: ' ', '+' -%}
  {%- if settings.heading_style == 'serif' -%}
    <link href="https://fonts.googleapis.com/css2?family={{ heading_family }}:ital@0;1&display=swap" rel="stylesheet">
  {%- else -%}
    <link href="https://fonts.googleapis.com/css2?family={{ heading_family }}:wght@500;600;700&display=swap" rel="stylesheet">
  {%- endif -%}
  <link href="https://fonts.googleapis.com/css2?family={{ body_family }}:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --c-primary: {{ settings.color_primary }};
      --c-accent: {{ settings.color_accent }};
      --c-on-accent: {{ settings.color_on_accent }};
      --c-bg: {{ settings.color_background }};
      --c-tint: {{ settings.color_tint }};
      --f-heading: '{{ settings.heading_font }}', {% if settings.heading_style == 'serif' %}Georgia, serif{% else %}system-ui, sans-serif{% endif %};
      --f-body: '{{ settings.body_font }}', system-ui, -apple-system, sans-serif;
      --h-weight: {% if settings.heading_style == 'serif' %}400{% else %}700{% endif %};
      --h-track: {% if settings.heading_style == 'serif' %}-0.015em{% else %}-0.03em{% endif %};
    }
  </style>
  {{ 'vitrio.css' | asset_url | stylesheet_tag }}
  {{ content_for_header }}
</head>
<body class="template-{{ template.name }}">
  <a class="skip" href="#main">{{ settings.label_menu }}</a>
  {% section 'announcement' %}
  {% section 'header' %}
  <main id="main">{{ content_for_layout }}</main>
  {% section 'footer' %}
  <div class="drawer-bg" data-drawer-close hidden></div>
  <aside class="drawer" id="cart-drawer" aria-label="${L("cart")}" aria-hidden="true" data-currency="{{ cart.currency.iso_code }}" data-locale="{{ request.locale.iso_code }}" data-free="{{ settings.free_shipping_threshold | times: 100 }}" data-l-free-left="{{ settings.label_free_left | escape }}" data-l-free-done="{{ settings.label_free_done | escape }}" data-l-empty="{{ settings.label_empty | escape }}" data-l-added="{{ settings.label_added | escape }}" data-l-unavailable="{{ settings.label_unavailable | escape }}">
    <div class="drawer__head"><p class="h" style="font-size:24px">${L("your_cart")}</p><button type="button" class="icon-btn" data-drawer-close aria-label="${L("close")}">{% render 'icon', name: 'cross' %}</button></div>
    <div class="ship" data-ship hidden><p data-ship-text></p><div class="ship__bar"><span data-ship-fill></span></div></div>
    <div class="drawer__lines" data-lines></div>
    <div class="drawer__foot">
      <div class="cart-total"><span>${L("total")}</span><span data-total></span></div>
      <a class="btn btn--block" href="/checkout">${L("checkout")} {% render 'icon', name: 'arrow' %}</a>
      <div class="pays pays--center">{%- for type in shop.enabled_payment_types -%}{{ type | payment_type_svg_tag: class: 'pay' }}{%- endfor -%}</div>
    </div>
  </aside>
  <div class="toast" data-toast role="status" aria-live="polite"></div>
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
  <style>:root{--c-primary:{{ settings.color_primary }};--c-accent:{{ settings.color_accent }};--c-on-accent:{{ settings.color_on_accent }};--c-bg:{{ settings.color_background }};--c-tint:{{ settings.color_tint }};--f-heading:'{{ settings.heading_font }}',Georgia,serif;--f-body:'{{ settings.body_font }}',system-ui,sans-serif;--h-weight:500;--h-track:-0.02em}</style>
  {{ 'vitrio.css' | asset_url | stylesheet_tag }}
  {{ content_for_header }}
</head>
<body>{{ content_for_layout }}</body>
</html>
`;

const CSS = `*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--c-bg);color:var(--c-primary);font-family:var(--f-body);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
img{max-width:100%;height:auto;display:block}
a{color:inherit}
h1,h2,h3,.h{font-family:var(--f-heading);font-weight:var(--h-weight);letter-spacing:var(--h-track);line-height:1.08;margin:0}
p{margin:0}
.ico{width:1em;height:1em;flex:none}
.skip{position:absolute;left:-999px}.skip:focus{left:1rem;top:1rem;z-index:99;background:var(--c-bg);padding:.5rem 1rem}
.wrap{width:min(1200px,100% - 40px);margin-inline:auto}
.sec{--bgc:var(--c-bg);--fgc:var(--c-primary);background:var(--bgc);color:var(--fgc);padding:88px 0;position:relative}
.s-tint{--bgc:var(--c-tint)}
.s-dark{--bgc:var(--c-primary);--fgc:var(--c-bg)}
.s-accent{--bgc:var(--c-accent);--fgc:var(--c-on-accent)}
.muted{color:color-mix(in srgb,var(--fgc,var(--c-primary)) 70%,transparent)}
.eyebrow{font-size:12.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;color:color-mix(in srgb,var(--fgc,var(--c-primary)) 72%,transparent)}
.s-base .eyebrow,.s-tint .eyebrow{color:var(--c-accent)}
.title{font-size:clamp(32px,4vw,52px)}
.center{text-align:center;margin-inline:auto}
.head{max-width:720px;margin-bottom:48px}
.head p.muted{margin-top:14px;font-size:17px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.6rem;min-height:56px;padding:0 30px;border-radius:999px;border:0;background:var(--c-accent);color:var(--c-on-accent);font:600 16px/1 var(--f-body);text-decoration:none;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease,background .2s;box-shadow:0 12px 30px -14px var(--c-accent)}
.btn:hover{transform:translateY(-2px);box-shadow:0 18px 38px -14px var(--c-accent)}
.btn .ico{transition:transform .2s}.btn:hover .ico{transform:translateX(3px)}
.btn--light{background:var(--c-bg);color:var(--c-primary);box-shadow:0 12px 30px -14px rgba(0,0,0,.5)}
.btn--ghost{background:transparent;color:inherit;border:1.5px solid color-mix(in srgb,var(--fgc,var(--c-primary)) 30%,transparent);box-shadow:none}
.btn--block{width:100%}
.btn[disabled]{opacity:.5;cursor:not-allowed;transform:none}
.link{display:inline-flex;align-items:center;gap:8px;font-weight:600;text-decoration:underline;text-underline-offset:6px;text-decoration-thickness:1.5px;margin-top:30px}
.frame{border-radius:26px;padding:6px;background:color-mix(in srgb,var(--fgc,var(--c-primary)) 6%,transparent);border:1px solid color-mix(in srgb,var(--fgc,var(--c-primary)) 12%,transparent)}
.frame>.media{border-radius:21px;overflow:hidden;position:relative;background:linear-gradient(150deg,var(--c-tint),color-mix(in srgb,var(--c-accent) 25%,var(--c-bg)))}
.media img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s cubic-bezier(.2,.8,.2,1)}
.frame:hover .media img{transform:scale(1.035)}
.ph{position:absolute;inset:0;display:grid;place-items:center}
.ph::before{content:"";width:46%;aspect-ratio:3/4;border-radius:22%;background:linear-gradient(160deg,var(--c-accent),var(--c-primary));box-shadow:0 40px 80px -30px rgba(0,0,0,.45);animation:float 7s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.announce{background:var(--c-primary);color:var(--c-bg);font-size:13.5px;height:40px;overflow:hidden;position:relative}
.announce__i{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 16px;opacity:0;transform:translateY(100%);transition:all .5s cubic-bezier(.2,.8,.2,1);text-align:center}
.announce__i.is-on{opacity:1;transform:none}
.announce__i.is-out{opacity:0;transform:translateY(-100%)}
.announce .ico{font-size:16px}
.header{position:sticky;top:0;z-index:40;background:var(--bgc);color:var(--fgc);border-bottom:1px solid color-mix(in srgb,var(--fgc) 10%,transparent);transition:box-shadow .3s}
.header.is-stuck{box-shadow:0 10px 30px -20px rgba(0,0,0,.35)}
.header__in{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:24px;min-height:76px}
.logo{font-family:var(--f-heading);font-size:28px;font-weight:var(--h-weight);letter-spacing:var(--h-track);text-decoration:none;line-height:1}
.logo img{max-height:46px;width:auto}
.nav{display:flex;gap:32px;font-size:15.5px}
.nav a{text-decoration:none;opacity:.85;position:relative}.nav a:hover{opacity:1}
.nav a::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:1.5px;background:currentColor;transform:scaleX(0);transition:transform .25s}.nav a:hover::after{transform:scaleX(1)}
.header__end{display:flex;justify-content:flex-end;align-items:center;gap:6px}
.cart-link{position:relative;display:inline-grid;place-items:center;width:44px;height:44px;border-radius:12px;text-decoration:none;font-size:22px}
.cart-link:hover{background:color-mix(in srgb,var(--fgc) 8%,transparent)}
.cart-count{position:absolute;top:3px;right:1px;display:inline-grid;place-items:center;min-width:19px;height:19px;padding:0 5px;border-radius:99px;background:var(--c-accent);color:var(--c-on-accent);font:700 11px/1 var(--f-body)}
.burger{display:none;background:none;border:0;color:inherit;padding:8px;cursor:pointer;font-size:24px}
@media (max-width:860px){.header__in{grid-template-columns:auto 1fr auto}.nav{display:none}.burger{display:block}.logo{font-size:24px}.nav.is-open{display:flex;position:absolute;left:0;right:0;top:100%;flex-direction:column;gap:0;background:var(--bgc);border-bottom:1px solid color-mix(in srgb,var(--fgc) 12%,transparent)}.nav.is-open a{padding:16px 20px;border-top:1px solid color-mix(in srgb,var(--fgc) 10%,transparent)}}
.hero{position:relative;min-height:min(86vh,780px);display:flex;align-items:center;color:#fff;overflow:hidden;padding:80px 0}
.hero__bg{position:absolute;inset:0}
.hero__bg img{width:100%;height:100%;object-fit:cover;transform:scale(1.06);animation:heroZoom 14s ease-out forwards}
@keyframes heroZoom{to{transform:scale(1)}}
.hero__bg::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.62) 0%,rgba(0,0,0,.35) 45%,rgba(0,0,0,0) 75%)}
.hero__c{position:relative;max-width:620px}
.hero h1{font-size:clamp(42px,6vw,80px);line-height:1.02}
.hero__sub{font-size:19px;margin-top:22px;max-width:36ch;opacity:.92}
.hero .btn{margin-top:34px}
.hero__trust{display:flex;flex-wrap:wrap;gap:10px 22px;margin-top:30px;font-size:14.5px;opacity:.95}
.hero__trust span{display:inline-flex;align-items:center;gap:8px}
.hero__trust .ico{font-size:17px}
.hero--split{color:var(--c-primary);background:var(--c-tint)}
.hero--split .hero__grid{display:grid;grid-template-columns:1.05fr 1fr;gap:56px;align-items:center;width:100%}
.hero--split .media{aspect-ratio:4/4.4}
.pill{display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:99px;background:rgba(255,255,255,.14);backdrop-filter:blur(8px);font-size:13px;margin-bottom:22px;border:1px solid rgba(255,255,255,.22)}
.hero--split .pill{background:color-mix(in srgb,var(--c-accent) 14%,transparent);border-color:color-mix(in srgb,var(--c-accent) 30%,transparent)}
@media (max-width:860px){.hero{display:block;min-height:auto;padding:0 0 52px;background:var(--c-primary)}.hero__bg{position:relative;inset:auto;aspect-ratio:4/3.3}.hero__bg img{object-position:74% center;transform:none}.hero__bg::after{background:linear-gradient(0deg,var(--c-primary) 0%,transparent 38%)}.hero .wrap{margin-top:-36px}.hero h1{font-size:clamp(34px,9.5vw,44px)}.hero__sub{font-size:17px;margin-top:14px}.hero .btn{margin-top:24px}.hero__trust{margin-top:22px;font-size:14px}.hero--split .hero__grid{grid-template-columns:1fr;gap:32px}.hero--split{padding:48px 0}}
.feats{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:28px}
.feat{text-align:center;padding:8px}
.feat .ico{font-size:34px;color:var(--c-accent);margin:0 auto 14px;display:block;transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.s-dark .feat .ico,.s-accent .feat .ico{color:inherit}
.feat:hover .ico{transform:translateY(-4px) scale(1.08)}
.feat strong{display:block;font-size:16px}
.feat span{display:block;font-size:14.5px;margin-top:4px}
@media (max-width:900px){.feats{grid-template-columns:repeat(2,1fr);gap:32px 18px}}
.split{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
.split--rev>.frame{order:2}
.split .media{aspect-ratio:4/4.6}
.split .title{margin-top:12px}
.ticks{list-style:none;padding:0;margin:28px 0 0;display:grid;gap:18px}
.ticks li{display:grid;grid-template-columns:auto 1fr;gap:4px 14px}
.ticks .ico{font-size:22px;color:var(--c-accent);grid-row:span 2;margin-top:2px}
.s-dark .ticks .ico{color:inherit}
.ticks strong{font-size:16.5px}
.ticks span{font-size:15px}
.split .btn{margin-top:34px}
@media (max-width:900px){.split{grid-template-columns:1fr;gap:36px}.split--rev>.frame{order:0}}
.moments{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.moment .media{aspect-ratio:4/5}
.moment h3{font-family:var(--f-body);font-weight:600;letter-spacing:0;font-size:19px;margin-top:16px}
@media (max-width:900px){.moments{grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:78%;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px}.moment{scroll-snap-align:start}}
.vs{display:grid;grid-template-columns:1fr 1.05fr;gap:72px;align-items:center}
.vs__card{background:var(--c-bg);color:var(--c-primary);border-radius:26px;padding:34px;box-shadow:0 40px 80px -40px rgba(0,0,0,.5)}
.vs__head{display:grid;grid-template-columns:1fr 1fr;gap:18px;text-align:center;margin-bottom:10px}
.vs__head p{font-family:var(--f-heading);font-weight:var(--h-weight);font-size:26px}
.vs__head p:first-child{color:var(--c-accent)}
.vs__row{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:16px 0;border-top:1px solid color-mix(in srgb,var(--c-primary) 10%,transparent);font-size:15px}
.vs__row div{display:flex;gap:10px;align-items:flex-start}
.vs__row .ico{font-size:20px;margin-top:1px}
.vs__row div:first-child .ico{color:var(--c-accent)}
.vs__row div:last-child{color:color-mix(in srgb,var(--c-primary) 62%,transparent)}
@media (max-width:900px){.vs{grid-template-columns:1fr;gap:36px}.vs__card{padding:22px}.vs__head p{font-size:20px}}
.product{display:grid;grid-template-columns:1.08fr 1fr;gap:64px;align-items:start}
.gallery{position:sticky;top:100px;display:grid;gap:12px;min-width:0}
.gallery__main{position:relative;border-radius:24px;overflow:hidden;background:var(--c-tint);aspect-ratio:1;cursor:zoom-in}
.gallery__main img{width:100%;height:100%;object-fit:cover;transition:transform .25s ease,opacity .25s}
.gallery__main.is-zoom img{transform:scale(1.8)}
.gal-nav{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.92);color:#111;display:grid;place-items:center;cursor:pointer;font-size:20px;box-shadow:0 8px 20px -8px rgba(0,0,0,.4);transition:transform .2s;z-index:2}
.gal-nav:hover{transform:translateY(-50%) scale(1.08)}
.gal-prev{left:14px}.gal-next{right:14px}
.gal-count{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);background:rgba(0,0,0,.55);color:#fff;font-size:12.5px;padding:4px 12px;border-radius:99px;z-index:2}
.gallery__thumbs{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:2px}
.gallery__thumbs button{flex:0 0 calc(20% - 8px);padding:0;border:2px solid transparent;border-radius:14px;overflow:hidden;cursor:pointer;background:none;scroll-snap-align:start;transition:border-color .2s,opacity .2s;opacity:.75}
.gallery__thumbs button.is-active{border-color:var(--c-accent);opacity:1}
.gallery__thumbs img{aspect-ratio:1;object-fit:cover;width:100%}
.hl{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:18px;border-radius:20px;background:color-mix(in srgb,var(--c-accent) 14%,var(--c-bg))}
.hl div{text-align:center;font-size:13.5px;font-weight:600;display:grid;justify-items:center;gap:8px}
.hl .ico{font-size:20px;width:38px;height:38px;padding:9px;border-radius:12px;background:var(--c-bg);color:var(--c-accent);box-sizing:border-box}
.p-title{font-size:clamp(32px,3.6vw,48px)}
.p-sub{margin-top:8px;font-size:17px}
.price{display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin-top:18px;font-size:28px;font-weight:700}
.price s{font-size:18px;font-weight:400;opacity:.55}
.badge{display:inline-block;padding:5px 11px;border-radius:99px;background:var(--c-accent);color:var(--c-on-accent);font-size:12px;font-weight:700;letter-spacing:.02em}
.p-sep{border:0;border-top:1px solid color-mix(in srgb,var(--c-primary) 14%,transparent);margin:22px 0}
.bullets{list-style:none;padding:0;margin:0;display:grid;gap:11px}
.bullets li{display:flex;gap:11px;align-items:flex-start;font-size:15.5px}
.bullets .ico{color:var(--c-accent);font-size:19px;margin-top:2px}
.opt-label{font-weight:700;font-size:15px;margin:24px 0 14px}
.bundles{display:grid;gap:14px}
.bundle{position:relative;display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;padding:14px 16px;border:1.5px solid color-mix(in srgb,var(--c-primary) 16%,transparent);border-radius:18px;cursor:pointer;transition:border-color .2s,background .2s,transform .2s}
.bundle:hover{transform:translateY(-1px)}
.bundle input{position:absolute;opacity:0;pointer-events:none}
.bundle.is-on{border-color:var(--c-accent);background:color-mix(in srgb,var(--c-accent) 9%,var(--c-bg));box-shadow:0 0 0 1px var(--c-accent)}
.bundle__img{position:relative;width:60px;height:60px;border-radius:12px;overflow:hidden;background:var(--c-tint)}
.bundle__img img{width:100%;height:100%;object-fit:cover}
.bundle__q{position:absolute;right:4px;bottom:4px;background:#fff;color:#111;font-size:11px;font-weight:700;padding:1px 6px;border-radius:99px}
.bundle__t{display:block;font-weight:700;font-size:16px}
.bundle__p{display:flex;gap:8px;align-items:baseline;font-size:15px;margin-top:2px}
.bundle__p s{opacity:.5;font-size:13.5px}
.bundle__save{display:block;font-size:13px;color:var(--c-accent);font-weight:600}
.bundle__badge{position:absolute;top:-11px;left:16px;background:var(--c-primary);color:var(--c-bg);font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 10px;border-radius:99px}
.bundle__radio{width:22px;height:22px;border-radius:50%;border:2px solid color-mix(in srgb,var(--c-primary) 30%,transparent);display:grid;place-items:center}
.bundle.is-on .bundle__radio{border-color:var(--c-accent)}
.bundle.is-on .bundle__radio::after{content:"";width:10px;height:10px;border-radius:50%;background:var(--c-accent)}
.buy{margin-top:24px;display:grid;gap:12px}
.buy__row{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center}
.field label{display:block;font-size:13px;margin-bottom:6px;opacity:.7}
.field select{width:100%;min-height:52px;border:1.5px solid color-mix(in srgb,var(--c-primary) 18%,transparent);border-radius:14px;background:transparent;color:inherit;font:inherit;padding:0 14px}
.stepper{display:inline-flex;align-items:center;border:1.5px solid color-mix(in srgb,var(--c-primary) 18%,transparent);border-radius:999px;overflow:hidden}
.stepper button{width:42px;height:42px;border:0;background:none;color:inherit;font-size:18px;cursor:pointer}
.stepper button:hover{background:color-mix(in srgb,var(--c-primary) 6%,transparent)}
.stepper input{width:38px;border:0;background:none;text-align:center;font:inherit;color:inherit;-moz-appearance:textfield}
.stepper input::-webkit-inner-spin-button{-webkit-appearance:none}
.stepper--lg button{width:50px;height:54px}
.shopify-payment-button__button{border-radius:999px!important;min-height:54px!important}
.guarantee{display:flex;gap:10px;align-items:flex-start;margin-top:18px;font-size:15px;padding-top:16px;border-top:1px solid color-mix(in srgb,var(--c-primary) 12%,transparent)}
.guarantee .ico{color:var(--c-accent);font-size:20px;margin-top:2px}
.trustbox{margin-top:18px;padding:18px;border-radius:20px;background:color-mix(in srgb,var(--c-primary) 4%,var(--c-bg));border:1px solid color-mix(in srgb,var(--c-primary) 8%,transparent);display:grid;gap:12px}
.trustbox>div{display:flex;align-items:center;gap:12px;font-size:14.5px}
.trustbox .ico{width:34px;height:34px;padding:8px;border-radius:50%;background:color-mix(in srgb,var(--c-primary) 7%,transparent);box-sizing:border-box}
.pays{display:flex;flex-wrap:wrap;gap:6px;padding-top:12px;border-top:1px solid color-mix(in srgb,var(--c-primary) 8%,transparent)}
.trustbox .pays:empty{display:none}
.pays--center{justify-content:center;border:0;padding-top:14px}
.pay{height:24px;width:auto}
.acc{margin-top:22px}
.acc details{border-bottom:1px solid color-mix(in srgb,var(--fgc,var(--c-primary)) 14%,transparent)}
.acc summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:20px 0;font-weight:600;font-size:16.5px}
.acc summary::-webkit-details-marker{display:none}
.acc summary::after{content:"+";font-size:24px;line-height:1;transition:transform .25s;font-weight:300}
.acc details[open] summary::after{transform:rotate(45deg)}
.acc .rte{padding:0 0 20px}
.rte p{margin:0 0 12px}.rte ul{padding-left:20px;margin:0 0 12px}.rte li{margin:6px 0}.rte h3{font-size:20px;margin:20px 0 8px}
@media (max-width:900px){.product{grid-template-columns:1fr;gap:28px}.gallery{position:static}.gallery__thumbs button{flex-basis:22%}}
.quotes{columns:3;column-gap:20px}
.quote{break-inside:avoid;margin:0 0 20px;border:1px solid color-mix(in srgb,var(--fgc) 14%,transparent);border-radius:22px;padding:22px;display:grid;gap:12px;align-content:start;background:color-mix(in srgb,var(--bgc,#fff) 92%,var(--fgc))}
.quote p{margin:0;line-height:1.55}
.quote__img{width:100%;height:auto;aspect-ratio:1;object-fit:cover;border-radius:14px}
.stars{display:inline-flex;gap:1px;color:#f5b301;font-size:17px;letter-spacing:0;line-height:1}
.stars .off{color:color-mix(in srgb,var(--fgc,#000) 22%,transparent)}
.rv-sum{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:14px;font-size:17px}
.rv-note{text-align:center;font-size:13px;margin-top:8px}
.p-rating{display:inline-flex;align-items:center;gap:8px;margin-top:10px;font-size:15px;color:inherit;text-decoration:none}
.p-rating span{opacity:.7;text-decoration:underline;text-underline-offset:3px}
@media (max-width:900px){.quotes{columns:1}}
.banner{position:relative;min-height:560px;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;overflow:hidden;padding:80px 0}
.banner__bg{position:absolute;inset:0}
.banner__bg img{width:100%;height:100%;object-fit:cover}
.banner__bg::after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.45)}
.banner--plain{background:var(--c-primary);color:var(--c-bg)}
.banner__c{position:relative;max-width:700px}
.banner h2{font-size:clamp(34px,4.6vw,60px)}
.banner p{margin-top:16px;font-size:18px;opacity:.92}
.banner .btn{margin-top:32px}
.faq{max-width:840px}
.news{text-align:center;max-width:640px;margin:0 auto}
.news form{display:flex;gap:10px;margin-top:26px}
.news input{flex:1;min-height:56px;border:1.5px solid color-mix(in srgb,var(--fgc) 20%,transparent);border-radius:999px;background:var(--c-bg);color:var(--c-primary);font:inherit;padding:0 22px}
@media (max-width:560px){.news form{flex-direction:column}}
.footer{padding:64px 0 32px}
.footer__grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px}
.footer h4{font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;margin:0 0 16px;opacity:.7;font-weight:600}
.footer ul{list-style:none;padding:0;margin:0;display:grid;gap:10px}
.footer a{text-decoration:none;opacity:.9}.footer a:hover{text-decoration:underline}
.footer__bottom{margin-top:48px;padding-top:24px;border-top:1px solid color-mix(in srgb,var(--fgc) 14%,transparent);display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:center;font-size:13px;opacity:.85}
.footer .pays{border:0;padding:0}
@media (max-width:820px){.footer__grid{grid-template-columns:1fr}}
.page{max-width:780px;padding:72px 0}
.page h1{font-size:clamp(34px,4vw,54px);margin-bottom:28px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.tile{text-decoration:none}
.tile .media{aspect-ratio:1}
.tile h3{font-size:19px;margin-top:14px}
@media (max-width:900px){.grid{grid-template-columns:1fr 1fr}}
.cart-line{display:grid;grid-template-columns:90px 1fr auto;gap:18px;align-items:center;padding:18px 0;border-bottom:1px solid color-mix(in srgb,var(--c-primary) 12%,transparent)}
.cart-line img{border-radius:12px}
.cart-total{display:flex;justify-content:space-between;font-size:20px;font-weight:700;margin:26px 0}
.drawer-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:80;opacity:0;transition:opacity .3s}
.drawer-bg.is-open{opacity:1}
.drawer{position:fixed;top:0;right:0;bottom:0;width:min(440px,100%);background:var(--c-bg);color:var(--c-primary);z-index:90;display:flex;flex-direction:column;transform:translateX(100%);visibility:hidden;transition:transform .45s cubic-bezier(.2,.8,.2,1),visibility 0s .45s}
.drawer.is-open{transform:none;visibility:visible;transition:transform .45s cubic-bezier(.2,.8,.2,1);box-shadow:-30px 0 60px -30px rgba(0,0,0,.4)}
.drawer__head{display:flex;justify-content:space-between;align-items:center;padding:22px 24px;border-bottom:1px solid color-mix(in srgb,var(--c-primary) 12%,transparent)}
.drawer__lines{flex:1;overflow:auto;padding:4px 24px}
.drawer__foot{padding:18px 24px 22px;border-top:1px solid color-mix(in srgb,var(--c-primary) 12%,transparent)}
.drawer__foot .cart-total{margin:0 0 14px}
.line{display:grid;grid-template-columns:76px 1fr auto;gap:14px;align-items:center;padding:16px 0;border-bottom:1px solid color-mix(in srgb,var(--c-primary) 10%,transparent);animation:line-in .4s ease both}
.line img,.line__ph{width:76px;height:76px;border-radius:14px;object-fit:cover;background:var(--c-tint)}
.line__t{font-weight:600;font-size:15px;line-height:1.3}
.icon-btn{background:none;border:0;color:inherit;font-size:20px;cursor:pointer;padding:8px;border-radius:10px;display:grid;place-items:center}
.icon-btn:hover{background:color-mix(in srgb,var(--c-primary) 7%,transparent)}
.ship{margin:16px 24px 4px;padding:14px;border-radius:16px;background:var(--c-tint);font-size:14px}
.ship__bar{height:8px;border-radius:99px;background:color-mix(in srgb,var(--c-primary) 12%,transparent);margin-top:10px;overflow:hidden}
.ship__bar span{display:block;height:100%;width:0;background:var(--c-accent);border-radius:99px;transition:width .6s cubic-bezier(.2,.8,.2,1)}
@keyframes line-in{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}
.toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,30px);opacity:0;background:var(--c-primary);color:var(--c-bg);padding:12px 20px;border-radius:999px;font-size:14px;z-index:95;transition:all .35s cubic-bezier(.2,.8,.2,1);pointer-events:none}
.toast.is-on{opacity:1;transform:translate(-50%,0)}
.sticky-atc{position:fixed;left:0;right:0;bottom:0;z-index:60;background:color-mix(in srgb,var(--c-bg) 94%,transparent);backdrop-filter:blur(12px);border-top:1px solid color-mix(in srgb,var(--c-primary) 12%,transparent);transform:translateY(110%);transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.sticky-atc.is-on{transform:none}
.sticky-atc__in{display:flex;align-items:center;gap:14px;padding:12px 0}
.sticky-atc img,.sticky-atc .line__ph{width:48px;height:48px;border-radius:10px;object-fit:cover}
.sticky-atc__t{flex:1;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sticky-atc .btn{min-height:48px}
@media (max-width:600px){.sticky-atc img,.sticky-atc .line__ph{display:none}.sticky-atc .btn{padding:0 18px}}
.reveal{opacity:0;transform:translateY(22px);transition:opacity .9s ease,transform .9s cubic-bezier(.2,.8,.2,1)}
.reveal.is-in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none}.ph::before,.hero__bg img{animation:none}}
@media (max-width:900px){.sec{padding:60px 0}.head{margin-bottom:32px}}
.form input[type=email],.form input[type=password],.form input[type=text]{width:100%;min-height:52px;border:1.5px solid color-mix(in srgb,var(--c-primary) 18%,transparent);border-radius:14px;background:transparent;color:inherit;font:inherit;padding:0 14px;margin-bottom:12px}
`;

const JS = `(function(){
  var drawer = document.getElementById('cart-drawer'), bg = document.querySelector('.drawer-bg'), toastEl = document.querySelector('[data-toast]');
  var D = drawer ? drawer.dataset : {};
  var cur = D.currency || 'EUR', loc = D.locale || 'fr', free = Number(D.free || 0);
  function money(c){ try { return (c/100).toLocaleString(loc, { style: 'currency', currency: cur }); } catch(e) { return (c/100).toFixed(2) + ' ' + cur; } }
  function toast(t){ if(!toastEl) return; toastEl.textContent = t; toastEl.classList.add('is-on'); clearTimeout(toast._t); toast._t = setTimeout(function(){ toastEl.classList.remove('is-on') }, 2200); }
  function esc(s){ var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function render(cart){
    document.querySelectorAll('.cart-count').forEach(function(el){ el.textContent = cart.item_count; el.animate && el.animate([{transform:'scale(1.6)'},{transform:'scale(1)'}],{duration:450,easing:'cubic-bezier(.34,1.56,.64,1)'}) });
    if (!drawer) return;
    var lines = drawer.querySelector('[data-lines]');
    lines.innerHTML = cart.items.length ? cart.items.map(function(i, n){
      return '<div class="line" style="animation-delay:' + (n*60) + 'ms">' + (i.image ? '<img src="' + i.image + (i.image.indexOf('?') > -1 ? '&' : '?') + 'width=160" alt="" width="76" height="76">' : '<span class="line__ph"></span>') +
        '<div><p class="line__t">' + esc(i.product_title) + '</p>' + (i.variant_title ? '<p style="font-size:13px;opacity:.7">' + esc(i.variant_title) + '</p>' : '') +
        '<div class="stepper" style="margin-top:8px"><button type="button" data-change="' + i.key + '" data-q="' + (i.quantity - 1) + '" aria-label="-">−</button><input value="' + i.quantity + '" readonly aria-label="qty"><button type="button" data-change="' + i.key + '" data-q="' + (i.quantity + 1) + '" aria-label="+">+</button></div></div>' +
        '<strong>' + money(i.final_line_price) + '</strong></div>';
    }).join('') : '<p style="padding:32px 0;text-align:center;opacity:.7">' + esc(D.lEmpty || '') + '</p>';
    drawer.querySelector('[data-total]').textContent = money(cart.total_price);
    var ship = drawer.querySelector('[data-ship]');
    if (free > 0 && cart.item_count > 0) {
      ship.hidden = false;
      var left = free - cart.total_price;
      drawer.querySelector('[data-ship-text]').innerHTML = left > 0 ? esc(D.lFreeLeft || '').replace('[montant]', '<strong>' + money(left) + '</strong>') : '🎉 ' + esc(D.lFreeDone || '');
      requestAnimationFrame(function(){ drawer.querySelector('[data-ship-fill]').style.width = Math.min(100, cart.total_price / free * 100) + '%'; });
    } else ship.hidden = true;
  }
  function refresh(){ return fetch('/cart.js').then(function(r){ return r.json() }).then(render); }
  function open(){ if(!drawer) return; refresh(); bg.hidden = false; requestAnimationFrame(function(){ bg.classList.add('is-open'); drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden','false'); }); document.body.style.overflow = 'hidden'; }
  function close(){ if(!drawer) return; bg.classList.remove('is-open'); drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; setTimeout(function(){ bg.hidden = true }, 300); }
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-drawer-close]'); if (t) { close(); return; }
    var c = e.target.closest('.cart-link'); if (c && drawer) { e.preventDefault(); open(); return; }
    var ch = e.target.closest('[data-change]');
    if (ch) { fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ch.dataset.change, quantity: Math.max(0, Number(ch.dataset.q)) }) }).then(function(r){ return r.json() }).then(render); return; }
    var st = e.target.closest('[data-step]');
    if (st) { var inp = st.parentNode.querySelector('input'); inp.value = Math.max(Number(inp.min || 1), Number(inp.value || 1) + Number(st.dataset.step)); return; }
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  document.querySelectorAll('form[action*="/cart/add"]').forEach(function(f){
    f.addEventListener('submit', function(e){
      if (!drawer) return; e.preventDefault();
      var btn = f.querySelector('[data-add]'); if (btn) { btn.disabled = true; btn.style.opacity = '.7'; }
      fetch('/cart/add.js', { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) })
        .then(function(r){ if (!r.ok) throw r; return r.json(); })
        .then(function(){ toast(D.lAdded || '✓'); open(); })
        .catch(function(){ toast(D.lUnavailable || '!'); })
        .finally(function(){ if (btn) { btn.disabled = false; btn.style.opacity = ''; } });
    });
  });
  document.querySelectorAll('[data-bundles]').forEach(function(box){
    var form = box.closest('form');
    box.addEventListener('change', function(e){
      var r = e.target; if (r.name !== 'id') return;
      box.querySelectorAll('.bundle').forEach(function(b){ b.classList.toggle('is-on', b.contains(r)); });
      form.querySelectorAll('[data-btn-price]').forEach(function(s){ s.textContent = r.dataset.price; });
      var p = form.closest('.product'); if (p) p.querySelectorAll('.price [data-btn-price]').forEach(function(s){ s.textContent = r.dataset.price; });
      document.querySelectorAll('[data-sticky-price]').forEach(function(s){ s.textContent = r.dataset.price; });
    });
  });
  document.querySelectorAll('[data-variant-select]').forEach(function(s){
    s.addEventListener('change', function(){ var o = s.options[s.selectedIndex]; var form = s.closest('form'); var p = form.closest('.product'); (p || form).querySelectorAll('[data-btn-price]').forEach(function(x){ x.textContent = o.dataset.price; }); var btn = form.querySelector('[data-add]'); if (btn) btn.disabled = o.dataset.available !== 'true'; });
  });
  document.querySelectorAll('[data-gallery]').forEach(function(g){
    var box = g.querySelector('.gallery__main'), main = box.querySelector('img'), thumbs = [].slice.call(g.querySelectorAll('.gallery__thumbs button')), count = g.querySelector('.gal-count'), i = 0;
    if (!main) return;
    function show(n){ if (!thumbs.length) return; i = (n + thumbs.length) % thumbs.length; main.style.opacity = .3; var src = thumbs[i].dataset.src; setTimeout(function(){ main.src = src; main.removeAttribute('srcset'); main.style.opacity = 1; }, 120); thumbs.forEach(function(t, k){ t.classList.toggle('is-active', k === i) }); if (count) count.textContent = (i + 1) + ' / ' + thumbs.length; }
    thumbs.forEach(function(t, k){ t.addEventListener('click', function(){ show(k) }) });
    var p = g.querySelector('.gal-prev'), nx = g.querySelector('.gal-next');
    if (p) p.addEventListener('click', function(e){ e.stopPropagation(); show(i - 1) });
    if (nx) nx.addEventListener('click', function(e){ e.stopPropagation(); show(i + 1) });
    var x0 = null; box.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX }, { passive: true });
    box.addEventListener('touchend', function(e){ if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); x0 = null; });
    if (!matchMedia('(hover: none)').matches) {
      box.addEventListener('mousemove', function(e){ var r = box.getBoundingClientRect(); main.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%'; });
      box.addEventListener('mouseenter', function(){ box.classList.add('is-zoom') });
      box.addEventListener('mouseleave', function(){ box.classList.remove('is-zoom') });
    }
  });
  var mainAdd = document.querySelector('[data-main-add]'), bar = document.querySelector('.sticky-atc');
  if (mainAdd && bar && 'IntersectionObserver' in window) {
    new IntersectionObserver(function(es){ bar.classList.toggle('is-on', !es[0].isIntersecting && es[0].boundingClientRect.top < 0) }).observe(mainAdd);
    bar.querySelector('button').addEventListener('click', function(){ var f = mainAdd.closest('form'); f.requestSubmit ? f.requestSubmit() : f.submit(); });
  }
  document.querySelectorAll('[data-announce]').forEach(function(a){
    var items = [].slice.call(a.children), k = 0; if (items.length < 2) return;
    setInterval(function(){ var prev = items[k]; prev.classList.remove('is-on'); prev.classList.add('is-out'); setTimeout(function(){ prev.classList.remove('is-out') }, 600); k = (k + 1) % items.length; items[k].classList.add('is-on'); }, 4000);
  });
  var hd = document.querySelector('.header'); if (hd) addEventListener('scroll', function(){ hd.classList.toggle('is-stuck', scrollY > 10) }, { passive: true });
  var b = document.querySelector('.burger'), n = document.querySelector('.nav');
  if (b && n) b.addEventListener('click', function(){ var o = n.classList.toggle('is-open'); b.setAttribute('aria-expanded', o) });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'}) : null;
  document.querySelectorAll('.reveal').forEach(function(el){io ? io.observe(el) : el.classList.add('is-in')});
})();
`;

const schema = (o: unknown) => `{% schema %}\n${JSON.stringify(o, null, 2)}\n{% endschema %}`;
const SCHEME = { type: "select", id: "scheme", label: "Couleurs de la section", options: [{ value: "base", label: "Fond clair" }, { value: "tint", label: "Fond teinté" }, { value: "dark", label: "Fond foncé" }, { value: "accent", label: "Couleur d'accent" }], default: "base" };
const ICON_SETTING = (id = "icon", def = "check") => ({ type: "select", id, label: "Icône", options: ICON_OPTIONS, default: def });
const img = (expr: string, w: number, h: number, eager = false) => `<img src="{{ ${expr} | image_url: width: ${w} }}" alt="{{ ${expr}.alt | escape }}" width="${w}" height="${h}" loading="${eager ? "eager" : "lazy"}">`;
const PAYS = `{%- for type in shop.enabled_payment_types -%}{{ type | payment_type_svg_tag: class: 'pay' }}{%- endfor -%}`;

// Bloc d'achat complet (galerie, offres, bouton, réassurance, rubriques), partagé par la fiche
// produit et le produit mis en avant sur l'accueil.
const PRODUCT_CORE = `{%- assign current = product.selected_or_first_available_variant -%}
<div class="wrap product">
  <div class="reveal">
    <div class="gallery" data-gallery>
      <div class="gallery__main">
        {%- if product.featured_media -%}${img("product.featured_media", 1400, 1400, true)}{%- else -%}<div class="ph"></div>{%- endif -%}
        {%- if product.media.size > 1 -%}
          <button type="button" class="gal-nav gal-prev" aria-label="‹">{% render 'icon', name: 'left' %}</button>
          <button type="button" class="gal-nav gal-next" aria-label="›">{% render 'icon', name: 'right' %}</button>
          <span class="gal-count">1 / {{ product.media.size }}</span>
        {%- endif -%}
      </div>
      {%- if product.media.size > 1 -%}
        <div class="gallery__thumbs">
          {%- for m in product.media -%}<button type="button" data-src="{{ m | image_url: width: 1400 }}" class="{% if forloop.first %}is-active{% endif %}" aria-label="{{ forloop.index }}"><img src="{{ m | image_url: width: 240 }}" alt="" width="240" height="240" loading="lazy"></button>{%- endfor -%}
        </div>
      {%- endif -%}
      {%- assign hl_count = 0 -%}{%- for block in section.blocks -%}{%- if block.type == 'highlight' -%}{%- assign hl_count = hl_count | plus: 1 -%}{%- endif -%}{%- endfor -%}
      {%- if hl_count > 0 -%}
        <div class="hl">{%- for block in section.blocks -%}{%- if block.type == 'highlight' -%}<div {{ block.shopify_attributes }}>{% render 'icon', name: block.settings.icon %}{{ block.settings.title }}</div>{%- endif -%}{%- endfor -%}</div>
      {%- endif -%}
    </div>
  </div>
  <div class="reveal">
    {% if section.settings.eyebrow != blank %}<p class="eyebrow" style="margin-bottom:10px">{{ section.settings.eyebrow }}</p>{% endif %}
    {% if section.settings.heading_tag == 'h1' %}<h1 class="p-title">{{ product.title }}</h1>{% else %}<h2 class="p-title">{{ product.title }}</h2>{% endif %}
    {% if settings.rating != blank %}<a class="p-rating" href="#avis">{% render 'stars', rating: settings.rating %}<strong>{{ settings.rating }}</strong>{% if settings.rating_count > 0 %}<span>({{ settings.rating_count }} {{ settings.label_reviews }})</span>{% endif %}</a>{% endif %}
    {% if section.settings.subtitle != blank %}<p class="p-sub muted">{{ section.settings.subtitle }}</p>{% endif %}
    <p class="price"><span data-btn-price>{{ current.price | money }}</span>{% if current.compare_at_price > current.price %}<s>{{ current.compare_at_price | money }}</s><span class="badge">-{{ current.compare_at_price | minus: current.price | times: 100.0 | divided_by: current.compare_at_price | round }} %</span>{% endif %}</p>
    <hr class="p-sep">
    <ul class="bullets">{%- for block in section.blocks -%}{%- if block.type == 'bullet' -%}<li {{ block.shopify_attributes }}>{% render 'icon', name: 'check' %}<span>{{ block.settings.text }}</span></li>{%- endif -%}{%- endfor -%}</ul>
    {%- form 'product', product, class: 'buy' -%}
      {%- assign hits = 0 -%}
      {%- capture bundle_cards -%}
        {%- for block in section.blocks -%}{%- if block.type == 'bundle' -%}
          {%- for v in product.variants -%}{%- if v.option1 == block.settings.label -%}
            {%- assign hits = hits | plus: 1 -%}
            <label class="bundle{% if v.id == current.id %} is-on{% endif %}" {{ block.shopify_attributes }}>
              <input type="radio" name="id" value="{{ v.id }}" data-price="{{ v.price | money }}" {% if v.id == current.id %}checked{% endif %} {% unless v.available %}disabled{% endunless %}>
              {% if block.settings.badge != blank %}<span class="bundle__badge">{{ block.settings.badge }}</span>{% endif %}
              <span class="bundle__img">{% if product.featured_media %}<img src="{{ product.featured_media | image_url: width: 140 }}" alt="" width="60" height="60" loading="lazy">{% endif %}<span class="bundle__q">×{{ block.settings.quantity }}</span></span>
              <span><span class="bundle__t">{{ block.settings.label }}</span><span class="bundle__p"><strong>{{ v.price | money }}</strong>{% if v.compare_at_price > v.price %}<s>{{ v.compare_at_price | money }}</s>{% endif %}</span>{% if v.compare_at_price > v.price %}<span class="bundle__save">{{ settings.label_save }} {{ v.compare_at_price | minus: v.price | money }}</span>{% endif %}</span>
              <span class="bundle__radio" aria-hidden="true"></span>
            </label>
          {%- endif -%}{%- endfor -%}
        {%- endif -%}{%- endfor -%}
      {%- endcapture -%}
      {%- if hits > 1 -%}
        {% if section.settings.bundle_label != blank %}<p class="opt-label">{{ section.settings.bundle_label }}</p>{% endif %}
        <div class="bundles" data-bundles>{{ bundle_cards }}</div>
        <input type="hidden" name="quantity" value="1">
        <button type="submit" class="btn btn--block" data-add {% if section.settings.sticky %}data-main-add{% endif %} {% unless current.available %}disabled{% endunless %}>{{ settings.label_add }} — <span data-btn-price>{{ current.price | money }}</span></button>
      {%- else -%}
        {%- unless product.has_only_default_variant -%}
          <div class="field"><label for="v-{{ section.id }}">{{ product.options | join: ' / ' }}</label>
            <select id="v-{{ section.id }}" name="id" data-variant-select>{%- for v in product.variants -%}<option value="{{ v.id }}" data-price="{{ v.price | money }}" data-available="{{ v.available }}" {% if v.id == current.id %}selected{% endif %}>{{ v.title }}{% unless v.available %} — {{ settings.label_soldout }}{% endunless %}</option>{%- endfor -%}</select></div>
        {%- else -%}<input type="hidden" name="id" value="{{ current.id }}">{%- endunless -%}
        <div class="buy__row">
          <div class="stepper stepper--lg"><button type="button" data-step="-1" aria-label="-">−</button><input type="number" name="quantity" value="1" min="1" aria-label="{{ settings.label_quantity }}"><button type="button" data-step="1" aria-label="+">+</button></div>
          <button type="submit" class="btn btn--block" data-add {% if section.settings.sticky %}data-main-add{% endif %} {% unless current.available %}disabled{% endunless %}>{% if current.available %}{{ settings.label_add }}{% else %}{{ settings.label_soldout }}{% endif %}</button>
        </div>
      {%- endif -%}
      {%- if section.settings.dynamic_checkout -%}{{ form | payment_button }}{%- endif -%}
    {%- endform -%}
    {% if section.settings.guarantee != blank %}<p class="guarantee">{% render 'icon', name: 'shield' %}<span>{{ section.settings.guarantee }}</span></p>{% endif %}
    <div class="trustbox">
      {% if section.settings.t1 != blank %}<div>{% render 'icon', name: 'truck' %}{{ section.settings.t1 }}</div>{% endif %}
      {% if section.settings.t2 != blank %}<div>{% render 'icon', name: 'return' %}{{ section.settings.t2 }}</div>{% endif %}
      {% if section.settings.t3 != blank %}<div>{% render 'icon', name: 'lock' %}{{ section.settings.t3 }}</div>{% endif %}
      {% if section.settings.t4 != blank %}<div>{% render 'icon', name: 'clock' %}{{ section.settings.t4 }}</div>{% endif %}
      <div class="pays">${PAYS}</div>
    </div>
    <div class="acc">
      {%- if section.settings.show_description -%}<details open><summary>{{ settings.label_description }}</summary><div class="rte">{{ product.description }}</div></details>{%- endif -%}
      {%- for block in section.blocks -%}{%- if block.type == 'detail' -%}<details {{ block.shopify_attributes }}><summary>{{ block.settings.title }}</summary><div class="rte">{{ block.settings.content }}</div></details>{%- endif -%}{%- endfor -%}
    </div>
  </div>
</div>`;

const PRODUCT_SETTINGS = [
  { type: "text", id: "eyebrow", label: "Sur-titre" },
  { type: "text", id: "subtitle", label: "Sous-titre" },
  { type: "text", id: "bundle_label", label: "Titre des offres par quantité", default: "Choisis ton offre" },
  { type: "checkbox", id: "sticky", label: "Barre d'achat qui suit le défilement", default: true },
  { type: "checkbox", id: "dynamic_checkout", label: "Bouton de paiement express", default: false },
  { type: "checkbox", id: "show_description", label: "Afficher la description", default: true },
  { type: "text", id: "guarantee", label: "Garantie" },
  { type: "text", id: "t1", label: "Réassurance : livraison" },
  { type: "text", id: "t2", label: "Réassurance : retours" },
  { type: "text", id: "t3", label: "Réassurance : paiement" },
  { type: "text", id: "t4", label: "Réassurance : expédition" },
];
const PRODUCT_BLOCKS = [
  { type: "bullet", name: "Point fort", settings: [{ type: "text", id: "text", label: "Texte" }] },
  { type: "highlight", name: "Atout sous la galerie", limit: 3, settings: [ICON_SETTING("icon", "check"), { type: "text", id: "title", label: "Texte" }] },
  { type: "bundle", name: "Offre par quantité", limit: 4, settings: [{ type: "text", id: "label", label: "Nom de l'offre (= nom de la variante)" }, { type: "number", id: "quantity", label: "Quantité", default: 1 }, { type: "text", id: "badge", label: "Badge (ex. Populaire)" }] },
  { type: "detail", name: "Rubrique dépliable", settings: [{ type: "text", id: "title", label: "Titre" }, { type: "richtext", id: "content", label: "Contenu" }] },
];

const STICKY = `{%- if section.settings.sticky -%}{%- assign current = product.selected_or_first_available_variant -%}
<div class="sticky-atc" aria-hidden="true"><div class="wrap sticky-atc__in">
  {% if product.featured_media %}<img src="{{ product.featured_media | image_url: width: 120 }}" alt="" width="48" height="48">{% else %}<span class="line__ph"></span>{% endif %}
  <div class="sticky-atc__t">{{ product.title }}<div style="font-weight:400;font-size:14px;opacity:.7" data-sticky-price>{{ current.price | money }}</div></div>
  <button type="button" class="btn" tabindex="-1">{{ settings.label_add }}</button>
</div></div>
{%- endif -%}`;

const SECTIONS: Record<string, string> = {
  announcement: `<div class="announce" data-announce>
  {%- for block in section.blocks -%}<p class="announce__i{% if forloop.first %} is-on{% endif %}" {{ block.shopify_attributes }}>{% render 'icon', name: block.settings.icon %}<span>{{ block.settings.text }}</span></p>{%- endfor -%}
</div>
${schema({ name: "Annonces", blocks: [{ type: "msg", name: "Message", settings: [ICON_SETTING("icon", "truck"), { type: "text", id: "text", label: "Texte" }] }], max_blocks: 4 })}`,

  header: `<header class="header sec s-{{ section.settings.scheme }}" style="padding:0">
  <div class="wrap header__in">
    <button class="burger" type="button" aria-label="{{ settings.label_menu }}" aria-expanded="false">{% render 'icon', name: 'menu' %}</button>
    <a class="logo" href="{{ routes.root_url }}">{% if section.settings.logo %}<img src="{{ section.settings.logo | image_url: width: 300 }}" alt="{{ settings.brand_name | escape }}" width="150" height="46">{% else %}{{ settings.brand_name | default: shop.name }}{% endif %}</a>
    <nav class="nav" aria-label="{{ settings.label_menu }}">
      {%- if section.settings.menu != blank -%}
        {%- for link in linklists[section.settings.menu].links -%}<a href="{{ link.url }}">{{ link.title }}</a>{%- endfor -%}
      {%- else -%}
        <a href="{{ section.settings.shop_url | default: routes.all_products_collection_url }}">{{ settings.label_shop }}</a>
        {% if section.settings.about_url != blank %}<a href="{{ section.settings.about_url }}">{{ settings.label_about }}</a>{% endif %}
        {% if section.settings.faq_url != blank %}<a href="{{ section.settings.faq_url }}">{{ settings.label_faq }}</a>{% endif %}
      {%- endif -%}
    </nav>
    <div class="header__end"><a class="cart-link" href="{{ routes.cart_url }}" aria-label="{{ settings.label_cart }}">{% render 'icon', name: 'bag' %}<span class="cart-count">{{ cart.item_count }}</span></a></div>
  </div>
</header>
${schema({ name: "En-tête", settings: [
    SCHEME,
    { type: "image_picker", id: "logo", label: "Logo (facultatif)" },
    { type: "link_list", id: "menu", label: "Menu (facultatif, sinon liens automatiques)" },
    { type: "url", id: "shop_url", label: "Lien « Boutique »" },
    { type: "url", id: "about_url", label: "Lien « Notre histoire »" },
    { type: "url", id: "faq_url", label: "Lien FAQ" },
  ] })}`,

  footer: `<footer class="footer sec s-{{ section.settings.scheme }}">
  <div class="wrap">
    <div class="footer__grid">
      <div>
        <p class="logo">{{ settings.brand_name | default: shop.name }}</p>
        <p style="margin-top:14px;max-width:42ch;opacity:.8">{{ section.settings.tagline }}</p>
      </div>
      <div><h4>{{ settings.label_shop }}</h4><ul><li><a href="{{ routes.all_products_collection_url }}">{{ settings.label_all_products }}</a></li><li><a href="{{ routes.cart_url }}">{{ settings.label_cart }}</a></li>{% if section.settings.about_url != blank %}<li><a href="{{ section.settings.about_url }}">{{ settings.label_about }}</a></li>{% endif %}</ul></div>
      <div><h4>{{ settings.label_help }}</h4><ul>{% if section.settings.faq_url != blank %}<li><a href="{{ section.settings.faq_url }}">{{ settings.label_faq }}</a></li>{% endif %}{%- for policy in shop.policies -%}<li><a href="{{ policy.url }}">{{ policy.title }}</a></li>{%- endfor -%}</ul></div>
    </div>
    <div class="footer__bottom"><span>© {{ 'now' | date: '%Y' }} {{ settings.brand_name | default: shop.name }}</span><div class="pays">${PAYS}</div></div>
  </div>
</footer>
${schema({ name: "Pied de page", settings: [SCHEME, { type: "text", id: "tagline", label: "Phrase de présentation" }, { type: "url", id: "about_url", label: "Lien « Notre histoire »" }, { type: "url", id: "faq_url", label: "Lien FAQ" }] })}`,

  hero: `{%- assign p = all_products[section.settings.product] -%}
{%- assign bgimg = section.settings.image -%}
{%- if bgimg == blank and p -%}{%- for m in p.media -%}{%- if m.alt contains 'ambiance' -%}{%- assign bgimg = m -%}{%- endif -%}{%- endfor -%}{%- endif -%}
{%- if bgimg != blank -%}
<section class="hero">
  <div class="hero__bg">${img("bgimg", 2400, 1350, true)}</div>
  <div class="wrap"><div class="hero__c reveal">
    {% if section.settings.eyebrow != blank %}<p class="pill">{% render 'icon', name: 'sparkle' %}{{ section.settings.eyebrow }}</p>{% endif %}
    <h1>{{ section.settings.title }}</h1>
    <p class="hero__sub">{{ section.settings.subtitle }}</p>
    <a class="btn btn--light" href="{% if p %}{{ p.url }}{% else %}{{ routes.all_products_collection_url }}{% endif %}">{{ section.settings.cta }} {% render 'icon', name: 'arrow' %}</a>
    <div class="hero__trust">{%- for block in section.blocks -%}<span {{ block.shopify_attributes }}>{% render 'icon', name: block.settings.icon %}{{ block.settings.text }}</span>{%- endfor -%}</div>
  </div></div>
</section>
{%- else -%}
<section class="hero hero--split">
  <div class="wrap hero__grid">
    <div class="reveal">
      {% if section.settings.eyebrow != blank %}<p class="pill">{% render 'icon', name: 'sparkle' %}{{ section.settings.eyebrow }}</p>{% endif %}
      <h1>{{ section.settings.title }}</h1>
      <p class="hero__sub muted">{{ section.settings.subtitle }}</p>
      <a class="btn" href="{% if p %}{{ p.url }}{% else %}{{ routes.all_products_collection_url }}{% endif %}">{{ section.settings.cta }} {% render 'icon', name: 'arrow' %}</a>
      <div class="hero__trust muted">{%- for block in section.blocks -%}<span>{% render 'icon', name: block.settings.icon %}{{ block.settings.text }}</span>{%- endfor -%}</div>
    </div>
    <div class="frame reveal"><div class="media">{% if p and p.featured_media %}${img("p.featured_media", 1400, 1500, true)}{% else %}<div class="ph"></div>{% endif %}</div></div>
  </div>
</section>
{%- endif -%}
${schema({ name: "Héros", settings: [
    { type: "image_picker", id: "image", label: "Image de fond" },
    { type: "product", id: "product", label: "Produit mis en avant" },
    { type: "text", id: "eyebrow", label: "Petite étiquette" },
    { type: "textarea", id: "title", label: "Titre" },
    { type: "textarea", id: "subtitle", label: "Sous-titre" },
    { type: "text", id: "cta", label: "Bouton", default: "Découvrir" },
  ], blocks: [{ type: "trust", name: "Argument", settings: [ICON_SETTING("icon", "check"), { type: "text", id: "text", label: "Texte" }] }], max_blocks: 3, presets: [{ name: "Héros" }] })}`,

  features: `<section class="sec s-{{ section.settings.scheme }}">
  <div class="wrap">
    {% if section.settings.title != blank %}<div class="head center reveal"><h2 class="title">{{ section.settings.title }}</h2>{% if section.settings.subtitle != blank %}<p class="muted">{{ section.settings.subtitle }}</p>{% endif %}</div>{% endif %}
    <div class="feats" style="--n:{{ section.blocks.size | at_most: 6 }}">
      {%- for block in section.blocks -%}<div class="feat reveal" style="transition-delay:{{ forloop.index0 | times: 70 }}ms" {{ block.shopify_attributes }}>{% render 'icon', name: block.settings.icon %}<strong>{{ block.settings.title }}</strong><span class="muted">{{ block.settings.text }}</span></div>{%- endfor -%}
    </div>
  </div>
</section>
${schema({ name: "Bandeau d'atouts", settings: [SCHEME, { type: "text", id: "title", label: "Titre" }, { type: "text", id: "subtitle", label: "Sous-titre" }], blocks: [{ type: "feat", name: "Atout", settings: [ICON_SETTING("icon", "check"), { type: "text", id: "title", label: "Titre" }, { type: "text", id: "text", label: "Texte" }] }], max_blocks: 6, presets: [{ name: "Bandeau d'atouts" }] })}`,

  "image-list": `{%- assign pic = section.settings.image -%}
{%- if pic == blank -%}{%- assign p = all_products[section.settings.product] -%}{%- if p -%}{%- for m in p.media -%}{%- if m.alt contains section.settings.media_hint -%}{%- assign pic = m -%}{%- endif -%}{%- endfor -%}{%- endif -%}{%- endif -%}
<section class="sec s-{{ section.settings.scheme }}">
  <div class="wrap split {% if section.settings.reverse %}split--rev{% endif %}">
    <div class="frame reveal"><div class="media">{% if pic != blank %}${img("pic", 1400, 1600)}{% else %}<div class="ph"></div>{% endif %}</div></div>
    <div class="reveal">
      {% if section.settings.eyebrow != blank %}<p class="eyebrow">{{ section.settings.eyebrow }}</p>{% endif %}
      <h2 class="title">{{ section.settings.title }}</h2>
      {% if section.settings.text != blank %}<div class="muted rte" style="margin-top:18px;font-size:17px">{{ section.settings.text }}</div>{% endif %}
      {%- if section.blocks.size > 0 -%}<ul class="ticks">{%- for block in section.blocks -%}<li {{ block.shopify_attributes }}>{% render 'icon', name: block.settings.icon %}<strong>{{ block.settings.title }}</strong><span class="muted">{{ block.settings.text }}</span></li>{%- endfor -%}</ul>{%- endif -%}
      {%- if section.settings.cta != blank -%}{%- if section.settings.cta_style == 'link' -%}<p><a class="link" href="{{ section.settings.url }}">{{ section.settings.cta }} {% render 'icon', name: 'arrow' %}</a></p>{%- else -%}<a class="btn" href="{{ section.settings.url }}">{{ section.settings.cta }} {% render 'icon', name: 'arrow' %}</a>{%- endif -%}{%- endif -%}
    </div>
  </div>
</section>
${schema({ name: "Image et texte", settings: [SCHEME, { type: "image_picker", id: "image", label: "Image" }, { type: "product", id: "product", label: "Produit (pour reprendre une de ses photos)" }, { type: "text", id: "media_hint", label: "Mot repère dans le texte alternatif de la photo", default: "situation" }, { type: "checkbox", id: "reverse", label: "Image à droite", default: false }, { type: "text", id: "eyebrow", label: "Sur-titre" }, { type: "text", id: "title", label: "Titre" }, { type: "richtext", id: "text", label: "Texte" }, { type: "text", id: "cta", label: "Bouton" }, { type: "url", id: "url", label: "Lien du bouton" }, { type: "select", id: "cta_style", label: "Style du bouton", options: [{ value: "button", label: "Bouton" }, { value: "link", label: "Lien" }], default: "button" }], blocks: [{ type: "item", name: "Point", settings: [ICON_SETTING("icon", "check"), { type: "text", id: "title", label: "Titre" }, { type: "text", id: "text", label: "Texte" }] }], max_blocks: 6, presets: [{ name: "Image et texte" }] })}`,

  moments: `<section class="sec s-{{ section.settings.scheme }}">
  <div class="wrap">
    <div class="head center reveal"><h2 class="title">{{ section.settings.title }}</h2></div>
    <div class="moments">
      {%- for block in section.blocks -%}<div class="moment reveal" style="transition-delay:{{ forloop.index0 | times: 90 }}ms" {{ block.shopify_attributes }}><div class="frame"><div class="media">{% if block.settings.image != blank %}${img("block.settings.image", 900, 1125)}{% else %}<div class="ph"></div>{% endif %}</div></div><h3>{{ block.settings.title }}</h3>{% if block.settings.text != blank %}<p class="muted" style="margin-top:6px">{{ block.settings.text }}</p>{% endif %}</div>{%- endfor -%}
    </div>
  </div>
</section>
${schema({ name: "Le produit en situation", settings: [SCHEME, { type: "text", id: "title", label: "Titre" }], blocks: [{ type: "moment", name: "Situation", settings: [{ type: "image_picker", id: "image", label: "Image" }, { type: "text", id: "title", label: "Titre" }, { type: "text", id: "text", label: "Texte" }] }], max_blocks: 4, presets: [{ name: "Le produit en situation" }] })}`,

  comparison: `<section class="sec s-{{ section.settings.scheme }}">
  <div class="wrap vs">
    <div class="reveal">
      {% if section.settings.eyebrow != blank %}<p class="eyebrow">{{ section.settings.eyebrow }}</p>{% endif %}
      <h2 class="title" style="margin-top:12px">{{ section.settings.title }}</h2>
      <p class="muted" style="margin-top:18px;font-size:17px">{{ section.settings.text }}</p>
    </div>
    <div class="vs__card reveal">
      <div class="vs__head"><p>{{ section.settings.us }}</p><p>{{ section.settings.them }}</p></div>
      {%- for block in section.blocks -%}<div class="vs__row" {{ block.shopify_attributes }}><div>{% render 'icon', name: 'check' %}<span>{{ block.settings.us }}</span></div><div>{% render 'icon', name: 'cross' %}<span>{{ block.settings.them }}</span></div></div>{%- endfor -%}
    </div>
  </div>
</section>
${schema({ name: "Comparaison", settings: [SCHEME, { type: "text", id: "eyebrow", label: "Sur-titre" }, { type: "text", id: "title", label: "Titre" }, { type: "textarea", id: "text", label: "Texte" }, { type: "text", id: "us", label: "Notre produit" }, { type: "text", id: "them", label: "L'alternative" }], blocks: [{ type: "row", name: "Ligne", settings: [{ type: "text", id: "us", label: "Nous" }, { type: "text", id: "them", label: "L'alternative" }] }], max_blocks: 6, presets: [{ name: "Comparaison" }] })}`,

  "featured-product": `{%- assign product = all_products[section.settings.product] -%}
{%- if product -%}<section class="sec s-{{ section.settings.scheme }}" id="acheter">${PRODUCT_CORE}</section>{%- endif -%}
${schema({ name: "Produit mis en avant", settings: [SCHEME, { type: "product", id: "product", label: "Produit" }, { type: "select", id: "heading_tag", label: "Niveau de titre", options: [{ value: "h2", label: "H2" }, { value: "h1", label: "H1" }], default: "h2" }, ...PRODUCT_SETTINGS], blocks: PRODUCT_BLOCKS, presets: [{ name: "Produit mis en avant" }] })}`,

  "main-product": `<section class="sec s-{{ section.settings.scheme }}" style="padding-top:48px">${PRODUCT_CORE}</section>
${STICKY}
${schema({ name: "Fiche produit", settings: [SCHEME, { type: "select", id: "heading_tag", label: "Niveau de titre", options: [{ value: "h1", label: "H1" }, { value: "h2", label: "H2" }], default: "h1" }, ...PRODUCT_SETTINGS], blocks: PRODUCT_BLOCKS })}`,

  testimonials: `{%- if section.blocks.size > 0 -%}
<section class="sec s-{{ section.settings.scheme }}" id="avis">
  <div class="wrap">
    <div class="head center reveal">
      <h2 class="title">{{ section.settings.title | default: settings.label_reviews_title }}</h2>
      {%- if settings.rating != blank -%}<p class="rv-sum">{% render 'stars', rating: settings.rating %}<strong>{{ settings.rating }}/5</strong>{% if settings.rating_count > 0 %}<span class="muted">· {{ settings.rating_count }} {{ settings.label_reviews }}</span>{% endif %}</p>{%- endif -%}
    </div>
    <div class="quotes">{%- for block in section.blocks -%}<figure class="quote reveal" {{ block.shopify_attributes }}>
      {%- if block.settings.photo != blank -%}<img class="quote__img" src="{{ block.settings.photo }}" alt="" width="600" height="600" loading="lazy">{%- endif -%}
      {% render 'stars', rating: block.settings.stars %}
      <p>{{ block.settings.quote }}</p>
      <figcaption><strong>{{ block.settings.author }}</strong>{% if block.settings.country != blank %} <span class="muted">{{ block.settings.country }}</span>{% endif %}</figcaption>
    </figure>{%- endfor -%}</div>
    {%- if section.settings.note != blank -%}<p class="rv-note muted">{{ section.settings.note }}</p>{%- endif -%}
  </div>
</section>
{%- endif -%}
${schema({ name: "Avis clients", settings: [SCHEME, { type: "paragraph", content: "Uniquement de vrais avis (les tiens ou ceux des acheteurs du produit chez ton fournisseur). La section reste invisible tant qu'elle est vide." }, { type: "text", id: "title", label: "Titre" }, { type: "text", id: "note", label: "Mention sous les avis (origine des avis)" }], blocks: [{ type: "review", name: "Avis", settings: [{ type: "textarea", id: "quote", label: "Avis" }, { type: "text", id: "author", label: "Prénom et initiale" }, { type: "text", id: "country", label: "Pays (drapeau ou nom)" }, { type: "range", id: "stars", label: "Note", min: 1, max: 5, step: 1, default: 5 }, { type: "text", id: "photo", label: "Adresse de la photo du client (facultatif)" }] }], max_blocks: 12, presets: [{ name: "Avis clients" }] })}`,

  "image-banner": `{%- assign pic = section.settings.image -%}
<section class="banner{% if pic == blank %} banner--plain{% endif %}">
  {% if pic != blank %}<div class="banner__bg">${img("pic", 2400, 1200)}</div>{% endif %}
  <div class="wrap banner__c reveal">
    <h2>{{ section.settings.title }}</h2>
    {% if section.settings.text != blank %}<p>{{ section.settings.text }}</p>{% endif %}
    {% if section.settings.cta != blank %}<a class="btn btn--light" href="{{ section.settings.url | default: routes.all_products_collection_url }}">{{ section.settings.cta }} {% render 'icon', name: 'arrow' %}</a>{% endif %}
  </div>
</section>
${schema({ name: "Bannière", settings: [{ type: "image_picker", id: "image", label: "Image" }, { type: "text", id: "title", label: "Titre" }, { type: "textarea", id: "text", label: "Texte" }, { type: "text", id: "cta", label: "Bouton" }, { type: "url", id: "url", label: "Lien" }], presets: [{ name: "Bannière" }] })}`,

  faq: `<section class="sec s-{{ section.settings.scheme }}">
  <div class="wrap faq">
    <div class="head reveal">{% if section.settings.eyebrow != blank %}<p class="eyebrow">{{ section.settings.eyebrow }}</p>{% endif %}<h2 class="title" style="margin-top:10px">{{ section.settings.title }}</h2></div>
    <div class="acc">{%- for block in section.blocks -%}<details class="reveal" {{ block.shopify_attributes }} {% if forloop.first and section.settings.open_first %}open{% endif %}><summary>{{ block.settings.question }}</summary><div class="rte muted"><p>{{ block.settings.answer }}</p></div></details>{%- endfor -%}</div>
  </div>
</section>
${schema({ name: "FAQ", settings: [SCHEME, { type: "text", id: "eyebrow", label: "Sur-titre" }, { type: "text", id: "title", label: "Titre", default: "Questions fréquentes" }, { type: "checkbox", id: "open_first", label: "Ouvrir la première question", default: true }], blocks: [{ type: "q", name: "Question", settings: [{ type: "text", id: "question", label: "Question" }, { type: "textarea", id: "answer", label: "Réponse" }] }], presets: [{ name: "FAQ" }] })}`,

  newsletter: `<section class="sec s-{{ section.settings.scheme }}">
  <div class="wrap news reveal">
    <p class="eyebrow">{{ section.settings.eyebrow }}</p>
    <h2 class="title" style="margin-top:10px">{{ section.settings.title }}</h2>
    <p class="muted" style="margin-top:12px">{{ section.settings.text }}</p>
    {%- form 'customer' -%}
      <input type="hidden" name="contact[tags]" value="newsletter">
      {%- if form.posted_successfully? -%}<p style="margin:0 auto;font-weight:600">{{ settings.label_newsletter_ok }}</p>
      {%- else -%}<input type="email" name="contact[email]" placeholder="{{ settings.label_email }}" required aria-label="{{ settings.label_email }}"><button class="btn" type="submit">{{ settings.label_subscribe }}</button>{%- endif -%}
    {%- endform -%}
  </div>
</section>
${schema({ name: "Lettre d'info", settings: [SCHEME, { type: "text", id: "eyebrow", label: "Sur-titre" }, { type: "text", id: "title", label: "Titre" }, { type: "text", id: "text", label: "Texte" }], presets: [{ name: "Lettre d'info" }] })}`,

  "main-page": `<div class="wrap page"><h1>{{ page.title }}</h1><div class="rte">{{ page.content }}</div></div>
${schema({ name: "Page" })}`,

  "main-collection": `<section class="sec"><div class="wrap">
  <div class="head"><h1 class="title">{{ collection.title }}</h1></div>
  {%- paginate collection.products by 24 -%}
  <div class="grid">
    {%- for p in collection.products -%}
      <a class="tile reveal" href="{{ p.url }}"><div class="frame"><div class="media">{% if p.featured_media %}<img src="{{ p.featured_media | image_url: width: 700 }}" alt="{{ p.title | escape }}" width="700" height="700" loading="lazy">{% else %}<div class="ph"></div>{% endif %}</div></div><h3>{{ p.title }}</h3><p class="muted">{{ p.price | money }}</p></a>
    {%- endfor -%}
  </div>
  {%- if paginate.pages > 1 -%}<p style="margin-top:32px">{{ paginate | default_pagination }}</p>{%- endif -%}
  {%- endpaginate -%}
</div></section>
${schema({ name: "Collection" })}`,

  "main-list-collections": `<section class="sec"><div class="wrap"><div class="head"><h1 class="title">{{ settings.label_all_products }}</h1></div><div class="grid">{%- for c in collections -%}<a class="tile" href="{{ c.url }}"><div class="frame"><div class="media">{% if c.featured_image %}<img src="{{ c.featured_image | image_url: width: 700 }}" alt="" width="700" height="700" loading="lazy">{% else %}<div class="ph"></div>{% endif %}</div></div><h3>{{ c.title }}</h3></a>{%- endfor -%}</div></div></section>
${schema({ name: "Liste des collections" })}`,

  "main-cart": `<section class="sec"><div class="wrap" style="max-width:820px">
  <h1 class="title" style="margin-bottom:24px">{{ settings.label_your_cart }}</h1>
  {%- if cart.item_count > 0 -%}
  <form action="{{ routes.cart_url }}" method="post">
    {%- for item in cart.items -%}
      <div class="cart-line">
        {% if item.image %}<img src="{{ item.image | image_url: width: 180 }}" alt="" width="90" height="90">{% else %}<span></span>{% endif %}
        <div><a href="{{ item.url }}">{{ item.product.title }}</a>{% unless item.product.has_only_default_variant %}<p class="muted">{{ item.variant.title }}</p>{% endunless %}
          <div class="stepper" style="margin-top:8px"><button type="button" data-step="-1" aria-label="-">−</button><input type="number" name="updates[]" value="{{ item.quantity }}" min="0" aria-label="{{ settings.label_quantity }}"><button type="button" data-step="1" aria-label="+">+</button></div></div>
        <strong>{{ item.final_line_price | money }}</strong>
      </div>
    {%- endfor -%}
    <div class="cart-total"><span>{{ settings.label_total }}</span><span>{{ cart.total_price | money }}</span></div>
    <div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn btn--ghost" type="submit" name="update">↻</button><button class="btn" type="submit" name="checkout">{{ settings.label_checkout }}</button></div>
  </form>
  {%- else -%}
    <p class="muted">{{ settings.label_empty }}</p><p style="margin-top:20px"><a class="btn" href="{{ routes.all_products_collection_url }}">{{ settings.label_continue }}</a></p>
  {%- endif -%}
</div></section>
${schema({ name: "Panier" })}`,

  "main-404": `<div class="wrap page" style="text-align:center"><h1>404</h1><p style="margin-top:24px"><a class="btn" href="{{ routes.root_url }}">{{ settings.brand_name | default: shop.name }}</a></p></div>
${schema({ name: "404" })}`,

  "main-search": `<section class="sec"><div class="wrap">
  <form action="{{ routes.search_url }}" class="form" style="max-width:520px"><input type="text" name="q" value="{{ search.terms | escape }}" placeholder="{{ settings.label_search }}" aria-label="{{ settings.label_search }}"></form>
  {%- if search.performed -%}<div class="grid" style="margin-top:24px">{%- for r in search.results -%}<a class="tile" href="{{ r.url }}"><h3>{{ r.title }}</h3></a>{%- endfor -%}</div>{%- endif -%}
</div></section>
${schema({ name: "Recherche" })}`,

  "main-blog": `<section class="sec"><div class="wrap"><h1 class="title" style="margin-bottom:28px">{{ blog.title }}</h1><div class="grid">{%- for a in blog.articles -%}<a class="tile" href="{{ a.url }}"><h3>{{ a.title }}</h3><p class="muted">{{ a.excerpt_or_content | strip_html | truncate: 120 }}</p></a>{%- endfor -%}</div></div></section>
${schema({ name: "Blog" })}`,

  "main-article": `<article class="wrap page"><h1>{{ article.title }}</h1><div class="rte">{{ article.content }}</div></article>
${schema({ name: "Article" })}`,

  "main-password": `<div class="wrap page" style="text-align:center;min-height:80vh;display:grid;place-content:center">
  <p class="logo">{{ settings.brand_name | default: shop.name }}</p>
  <p class="muted" style="margin-top:16px">{{ shop.password_message }}</p>
  {%- form 'storefront_password', class: 'form' -%}<div style="margin-top:28px;display:grid;gap:10px;max-width:360px;margin-inline:auto"><input type="password" name="password" placeholder="••••••" aria-label="Password"><button class="btn" type="submit">→</button>{{ form.errors | default_errors }}</div>{%- endform -%}
</div>
${schema({ name: "Mot de passe" })}`,
};

const CUSTOMERS: Record<string, string> = {
  login: `<div class="wrap page" style="max-width:440px"><h1>Login</h1>{%- form 'customer_login', class: 'form' -%}{{ form.errors | default_errors }}<input type="email" name="customer[email]" placeholder="E-mail" autocomplete="email"><input type="password" name="customer[password]" placeholder="Password" autocomplete="current-password"><button class="btn btn--block" type="submit">→</button>{%- endform -%}<p style="margin-top:16px"><a href="{{ routes.account_register_url }}">+</a></p></div>`,
  register: `<div class="wrap page" style="max-width:440px"><h1>Account</h1>{%- form 'create_customer', class: 'form' -%}{{ form.errors | default_errors }}<input type="text" name="customer[first_name]" placeholder="Name"><input type="email" name="customer[email]" placeholder="E-mail"><input type="password" name="customer[password]" placeholder="Password"><button class="btn btn--block" type="submit">→</button>{%- endform -%}</div>`,
  account: `<div class="wrap page"><h1>{{ customer.first_name }}</h1><p class="muted">{{ customer.email }}</p><p style="margin-top:16px"><a href="{{ routes.account_logout_url }}">Logout</a></p>{%- for order in customer.orders -%}<p style="margin-top:12px"><a href="{{ order.customer_url }}">{{ order.name }}</a> · {{ order.total_price | money }}</p>{%- endfor -%}</div>`,
  order: `<div class="wrap page"><h1>{{ order.name }}</h1>{%- for li in order.line_items -%}<p>{{ li.title }} × {{ li.quantity }} — {{ li.final_line_price | money }}</p>{%- endfor -%}<p style="margin-top:16px"><strong>{{ order.total_price | money }}</strong></p></div>`,
  addresses: `<div class="wrap page"><h1>Addresses</h1>{%- for address in customer.addresses -%}<p>{{ address | format_address }}</p>{%- endfor -%}</div>`,
  activate_account: `<div class="wrap page" style="max-width:440px">{%- form 'activate_customer_password', class: 'form' -%}{{ form.errors | default_errors }}<input type="password" name="customer[password]" placeholder="Password"><input type="password" name="customer[password_confirmation]" placeholder="Password"><button class="btn btn--block" type="submit">→</button>{%- endform -%}</div>`,
  reset_password: `<div class="wrap page" style="max-width:440px">{%- form 'reset_customer_password', class: 'form' -%}{{ form.errors | default_errors }}<input type="password" name="customer[password]" placeholder="Password"><input type="password" name="customer[password_confirmation]" placeholder="Password"><button class="btn btn--block" type="submit">→</button>{%- endform -%}</div>`,
};

const GIFT_CARD = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{{ shop.name }}</title>{{ content_for_header }}</head><body style="font-family:system-ui;text-align:center;padding:48px"><h1>{{ shop.name }}</h1><p style="font-size:32px">{{ gift_card.balance | money }}</p><p><strong>{{ gift_card.code | format_code }}</strong></p></body></html>`;

export const SETTINGS_SCHEMA = [
  { name: "theme_info", theme_name: "Vigenia", theme_version: "2.0.0", theme_author: "Vigenia", theme_documentation_url: "https://vigenia.com/aide", theme_support_url: "https://vigenia.com/contact" },
  { name: "Marque", settings: [
    { type: "text", id: "brand_name", label: "Nom de la marque" },
    { type: "color", id: "color_primary", label: "Couleur du texte et des fonds foncés", default: "#1d1d22" },
    { type: "color", id: "color_accent", label: "Couleur d'accent (boutons)", default: "#00a676" },
    { type: "color", id: "color_on_accent", label: "Texte sur les boutons", default: "#ffffff" },
    { type: "color", id: "color_background", label: "Fond", default: "#f7f6f2" },
    { type: "color", id: "color_tint", label: "Fond teinté", default: "#efe9df" },
    { type: "text", id: "heading_font", label: "Police des titres (Google Fonts)", default: "Instrument Serif" },
    { type: "select", id: "heading_style", label: "Style des titres", options: [{ value: "serif", label: "Serif" }, { value: "sans", label: "Sans serif" }], default: "serif" },
    { type: "text", id: "body_font", label: "Police du texte (Google Fonts)", default: "DM Sans" },
  ] },
  { name: "Panier", settings: [
    { type: "number", id: "free_shipping_threshold", label: "Livraison offerte à partir de (0 = pas de barre)", default: 0 },
    { type: "text", id: "rating", label: "Note moyenne des avis (ex. 4.8, vide = masquée)" },
    { type: "number", id: "rating_count", label: "Nombre d'avis", default: 0 },
  ] },
  { name: "Textes", settings: LABEL_KEYS.map((k) => ({ type: "text", id: `label_${k}`, label: k, default: DEFAULT_LABELS[k] })) },
];

// Tous les fichiers fixes du thème, prêts à être zippés.
export function staticThemeFiles(): Record<string, string> {
  const files: Record<string, string> = {
    "layout/theme.liquid": LAYOUT,
    "layout/password.liquid": PASSWORD_LAYOUT,
    "assets/vitrio.css": CSS,
    "assets/vitrio.js": JS,
    "snippets/icon.liquid": ICON_SNIPPET,
    // Étoiles pleines, demi-étoile arrondie et vides, d'après une note sur 5 (ex. 4.6).
    "snippets/stars.liquid": `{%- assign r = rating | times: 1.0 -%}<span class="stars" aria-label="{{ r }}/5">{%- for i in (1..5) -%}{%- assign t = i | minus: 0.5 -%}<span{% if r < t %} class="off"{% endif %}>★</span>{%- endfor -%}</span>`,
    "config/settings_schema.json": JSON.stringify(SETTINGS_SCHEMA, null, 2),
    "locales/fr.default.json": JSON.stringify({ general: { brand: "Vigenia" } }, null, 2),
    "locales/en.json": JSON.stringify({ general: { brand: "Vigenia" } }, null, 2),
    "templates/gift_card.liquid": GIFT_CARD,
  };
  for (const [name, src] of Object.entries(SECTIONS)) files[`sections/${name}.liquid`] = src;
  for (const [name, src] of Object.entries(CUSTOMERS)) files[`templates/customers/${name}.liquid`] = src;
  return files;
}
