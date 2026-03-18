# SEO Improvement Plan — Fasting Tracker

**Date:** 2026-03-18
**Analyst:** SEO Expert + Full Stack Developer
**Tech Stack:** React 19, Vite, Tailwind CSS, Vercel Analytics (CSR-only SPA)

---

## Executive Summary

The Fasting Tracker is a client-side React SPA with almost no SEO foundation. The current setup will result in poor search engine discoverability because search crawlers see an essentially blank HTML shell until JavaScript hydrates. The plan below addresses this in prioritised layers: technical fundamentals first, then on-page signals, then structured data, then content strategy, and finally performance/PWA.

---

## 1. Audit — Current State

| SEO Signal | Status | Notes |
|---|---|---|
| `<title>` tag | ⚠️ Minimal | Generic "Fasting Tracker" — no branding or keyword context |
| Meta description | ❌ Missing | No `<meta name="description">` |
| Canonical URL | ❌ Missing | No `<link rel="canonical">` |
| Open Graph tags | ❌ Missing | No social sharing preview |
| Twitter Card | ❌ Missing | No Twitter/X sharing preview |
| Structured data (JSON-LD) | ❌ Missing | No schema.org markup |
| `robots.txt` | ❌ Missing | No crawl directives |
| `sitemap.xml` | ❌ Missing | No URL discovery for crawlers |
| `manifest.json` (PWA) | ❌ Missing | No PWA metadata |
| Favicon / apple-touch-icon | ⚠️ Partial | `icon.png` linked, no apple-touch-icon, no multiple sizes |
| `lang` attribute | ✅ Present | `<html lang="en">` |
| Viewport meta | ✅ Present | Mobile-responsive |
| Font preconnect | ✅ Present | Google Fonts preconnected |
| SSR / Pre-rendering | ❌ None | Pure CSR — blank HTML for crawlers |
| Image optimisation | ❌ Poor | `icon.png` is 1.3 MB (unoptimised) |
| Core Web Vitals | ⚠️ Unknown | No monitoring or explicit optimisation |
| Analytics | ⚠️ Minimal | Vercel Analytics installed, no custom events |
| Accessibility (affects SEO) | ✅ Good | ARIA, semantic HTML, focus management present |

---

## 2. Priority Matrix

| Priority | Area | Effort | Impact |
|---|---|---|---|
| P0 (Critical) | Meta tags & `<head>` completeness | Low | High |
| P0 (Critical) | `robots.txt` & `sitemap.xml` | Low | High |
| P0 (Critical) | Open Graph + Twitter Card | Low | High |
| P1 (High) | Structured data (JSON-LD) | Medium | High |
| P1 (High) | Pre-rendering / SSG migration | High | Very High |
| P1 (High) | `manifest.json` + PWA | Low | Medium |
| P1 (High) | Image optimisation | Low | Medium |
| P2 (Medium) | Core Web Vitals optimisation | Medium | Medium |
| P2 (Medium) | Content expansion (landing page) | High | Very High |
| P2 (Medium) | Analytics event tracking | Low | Medium |
| P3 (Low) | Internationalisation (i18n) | High | Low-Medium |
| P3 (Low) | Security headers | Low | Low |

---

## 3. P0 — Critical Fixes (Quick Wins)

### 3.1 Complete `<head>` Meta Tags

**File:** `index.html`

The `<head>` section needs a complete set of foundational SEO tags. These are purely static, low-risk changes.

**Add the following:**

```html
<!-- Primary Meta Tags -->
<title>Fasting Tracker — Free Intermittent Fasting Timer & History</title>
<meta name="title" content="Fasting Tracker — Free Intermittent Fasting Timer & History" />
<meta name="description" content="Track your intermittent fasting sessions with ease. Support for 16:8, 18:6, 20:4, 12:12 protocols. Free, private, and works offline." />
<meta name="keywords" content="intermittent fasting tracker, fasting timer, 16:8 fasting, 18:6 fasting, fasting app, fasting history, calorie restriction, time-restricted eating" />
<meta name="author" content="Fasting Tracker" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://your-domain.com/" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://your-domain.com/" />
<meta property="og:title" content="Fasting Tracker — Free Intermittent Fasting Timer & History" />
<meta property="og:description" content="Track your intermittent fasting sessions with ease. Support for 16:8, 18:6, 20:4, 12:12 protocols. Free, private, and works offline." />
<meta property="og:image" content="https://your-domain.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Fasting Tracker" />
<meta property="og:locale" content="en_US" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="https://your-domain.com/" />
<meta name="twitter:title" content="Fasting Tracker — Free Intermittent Fasting Timer & History" />
<meta name="twitter:description" content="Track your intermittent fasting sessions with ease. Support for 16:8, 18:6, 20:4, 12:12 protocols. Free, private, and works offline." />
<meta name="twitter:image" content="https://your-domain.com/og-image.png" />

<!-- Favicon & Touch Icons -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#F97316" />
```

**Implementation notes:**
- Replace `https://your-domain.com/` with the actual deployed URL (can be injected via Vite's `define` or environment variables).
- Create a 1200×630 OG image (`og-image.png`) — a branded screenshot or designed card.
- Generate favicon sizes from `icon.png` using a tool like [RealFaviconGenerator](https://realfavicongenerator.net/).

---

### 3.2 `robots.txt`

**File:** `public/robots.txt` (new file)

```
User-agent: *
Allow: /

Sitemap: https://your-domain.com/sitemap.xml
```

This allows all bots to crawl and points them to the sitemap. Since this is a single-page app with no private routes (all data is local), there is nothing to disallow.

---

### 3.3 `sitemap.xml`

**File:** `public/sitemap.xml` (new file)

Because this is a single-URL SPA, the sitemap is simple:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://your-domain.com/</loc>
    <lastmod>2026-03-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

If the app is later migrated to a multi-page architecture (see Section 5), this file should be dynamically generated at build time.

---

### 3.4 Open Graph Image

**File:** `public/og-image.png` (new asset)

Create a 1200×630 PNG image that shows:
- App name "Fasting Tracker" in DM Serif Display
- A visual of the fasting ring/timer (screenshot or designed mockup)
- Tagline: "Free · Private · Offline-Ready"
- Brand colour `#F97316` (orange accent from the design system)

This image is displayed when the URL is shared on Facebook, LinkedIn, Twitter/X, iMessage, Slack, WhatsApp, Discord, etc.

---

## 4. P1 — High Impact

### 4.1 JSON-LD Structured Data

**File:** `index.html` (add to `<head>` or before `</body>`)

Structured data helps Google understand what the page is about and can generate rich results in SERPs.

#### 4.1.1 WebApplication Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Fasting Tracker",
  "url": "https://your-domain.com/",
  "description": "A free, private intermittent fasting tracker with support for 16:8, 18:6, 20:4, and 12:12 fasting protocols. Track fasting sessions, view history, and monitor streaks.",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Intermittent fasting timer",
    "Fasting history tracking",
    "Streak counter",
    "Multiple fasting protocols (16:8, 18:6, 20:4, 12:12)",
    "Dark mode support",
    "Offline capable",
    "Private — data stored locally"
  ],
  "screenshot": "https://your-domain.com/og-image.png",
  "author": {
    "@type": "Organization",
    "name": "Fasting Tracker"
  }
}
</script>
```

#### 4.1.2 FAQPage Schema

The app's blog section links to articles from Johns Hopkins, Healthline, Harvard, Mayo Clinic, etc. Add FAQ-style structured data that surfaces common fasting questions directly in Google results:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is intermittent fasting?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Intermittent fasting (IF) is an eating pattern that cycles between periods of fasting and eating. Common protocols include 16:8 (16 hours fasting, 8 hours eating), 18:6, and 12:12."
      }
    },
    {
      "@type": "Question",
      "name": "What is the 16:8 fasting protocol?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The 16:8 protocol involves fasting for 16 hours and restricting eating to an 8-hour window each day. It is one of the most popular and sustainable intermittent fasting methods."
      }
    },
    {
      "@type": "Question",
      "name": "Is intermittent fasting safe?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Intermittent fasting is generally considered safe for most healthy adults. However, it is not recommended for pregnant or breastfeeding women, those with eating disorders, or people with certain medical conditions. Consult a healthcare provider before starting."
      }
    },
    {
      "@type": "Question",
      "name": "How do I track my intermittent fasting?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Fasting Tracker is a free web app that lets you start and stop a fasting timer, log your fasting history, and track your streak. All data is stored privately in your browser."
      }
    }
  ]
}
</script>
```

---

### 4.2 `manifest.json` (PWA + SEO)

**File:** `public/manifest.json` (new file)

A web app manifest improves discoverability, enables "Add to Home Screen" on mobile, and signals to Google that the app is installable (which can improve rankings for app-related searches).

```json
{
  "name": "Fasting Tracker",
  "short_name": "FastingTracker",
  "description": "Free intermittent fasting timer with history tracking. Supports 16:8, 18:6, 20:4, and 12:12 protocols.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#F97316",
  "orientation": "portrait-primary",
  "categories": ["health", "fitness", "lifestyle"],
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/og-image.png",
      "sizes": "1200x630",
      "type": "image/png",
      "label": "Fasting Tracker home screen"
    }
  ],
  "lang": "en",
  "dir": "ltr"
}
```

**Icons to generate:** Export `icon-192x192.png` and `icon-512x512.png` from the existing `icon.png` source.

---

### 4.3 Image Optimisation

**File:** `public/icon.png` — currently **1.3 MB** (unacceptable).

| Asset | Current | Target | Method |
|---|---|---|---|
| `icon.png` | 1.3 MB | < 50 KB | Convert to WebP or compress PNG with `sharp`/`squoosh` |
| Favicon | Missing | 32×32 PNG | Generate from icon source |
| Apple touch icon | Missing | 180×180 PNG | Generate from icon source |
| OG image | Missing | < 300 KB optimised PNG/WebP | Design and export |
| PWA icons | Missing | 192px, 512px PNG | Generate from icon source |

**Recommended tool:** Use [Squoosh](https://squoosh.app/) for one-off conversion, or `vite-plugin-imagemin` for automated build-time compression.

```js
// vite.config.js — add imagemin plugin
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    react(),
    viteImagemin({
      optipng: { optimizationLevel: 7 },
      webp: { quality: 80 },
      svgo: {}
    })
  ]
})
```

---

### 4.4 Pre-rendering / SSG Migration (Major, High Impact)

**Current problem:** Google's crawler receives an empty `<div id="root"></div>`. Even though Googlebot can execute JavaScript, rendering is deferred, deprioritised, and may not capture all content correctly — especially for a competitive health/wellness niche.

**Recommended approach:** Migrate to **Vite SSG** (static site generation) using `vite-ssg` or migrate to a proper SSG/SSR framework.

#### Option A — `vite-ssg` (lowest friction)

`vite-ssg` pre-renders React routes to static HTML at build time with zero server required. Since the app is a SPA with one "page", this is a low-effort win.

```bash
npm install vite-ssg react-router-dom
```

The pre-rendered HTML will contain the full page text, headings, and content — dramatically improving crawlability.

#### Option B — Migrate to Next.js (highest SEO ceiling)

If the app evolves to have multiple pages (fasting guides, blog posts, protocol explainers), Next.js with `getStaticProps` or the App Router would provide:
- Per-page meta tags
- Static generation for all content pages
- Incremental static regeneration
- Built-in `next/image` optimisation
- Built-in `next/head` / Metadata API

**Recommendation:** Implement Option A (`vite-ssg`) now for immediate gains. Plan a Next.js migration if/when a content expansion strategy (Section 6) is adopted.

---

## 5. P2 — Medium Priority

### 5.1 Core Web Vitals Optimisation

Core Web Vitals are a confirmed Google ranking signal. Target scores:

| Metric | Target | Current Risk |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Medium — large icon.png, Google Fonts blocking |
| FID / INP (Interaction to Next Paint) | < 200ms | Low — simple interactions |
| CLS (Cumulative Layout Shift) | < 0.1 | Low — no ads or late-loaded elements |
| TTFB (Time to First Byte) | < 800ms | Low — Vercel CDN handles this |

**Actions:**

1. **Font loading optimisation:** Add `font-display: swap` to the Google Fonts URL (already supported via `&display=swap` parameter). Optionally self-host fonts via `fontsource` to eliminate the third-party DNS lookup entirely.

   ```html
   <!-- Current -->
   <link href="https://fonts.googleapis.com/css2?family=DM+Sans:..." rel="stylesheet" />

   <!-- Improved — add display=swap and preload the woff2 -->
   <link rel="preload" as="font" type="font/woff2" href="/fonts/dm-sans.woff2" crossorigin />
   ```

2. **Eliminate render-blocking resources:** Audit the Vite build output for any synchronous scripts or CSS that blocks first paint.

3. **Compress the icon:** The 1.3 MB `icon.png` is referenced as a favicon. Browsers load favicons after page paint, so this is lower priority for LCP — but it wastes bandwidth on every page load.

4. **Add `preload` for critical assets:**
   ```html
   <link rel="preload" as="image" href="/og-image.png" />
   ```

5. **Vite build optimisation:** Add explicit chunk splitting and compression:

   ```js
   // vite.config.js
   export default defineConfig({
     plugins: [react()],
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             icons: ['lucide-react']
           }
         }
       },
       target: 'es2015',
       minify: 'terser'
     }
   })
   ```

---

### 5.2 Analytics Event Tracking

The Vercel Analytics component is installed but only tracks page views. For SEO-informed decisions, expand tracking to understand user behaviour.

**Events to add:**

| Event | Trigger | Value |
|---|---|---|
| `fast_started` | User clicks "Start Fast" | Informs engagement rate |
| `fast_stopped` | User stops a fast | Informs completion rate |
| `protocol_changed` | User changes fasting protocol | Informs popular protocols |
| `history_viewed` | User opens History modal | Informs feature usage |
| `blog_article_clicked` | User clicks a blog article | Informs content interest |
| `settings_opened` | User opens Settings | Informs feature usage |
| `theme_toggled` | Dark/light mode toggle | Informs UX preference |

```jsx
// Example using Vercel Analytics track()
import { track } from '@vercel/analytics'

// When starting a fast:
track('fast_started', { protocol: selectedProtocol })

// When clicking a blog article:
track('blog_article_clicked', { article_title: article.title, source: article.source })
```

**Also consider adding:**
- Google Search Console verification (via `<meta name="google-site-verification">` tag)
- Bing Webmaster Tools verification

---

### 5.3 Heading Hierarchy & Semantic HTML Review

Crawlers use heading hierarchy to understand page structure. The current single-page layout should expose a clear `<h1>` in the rendered HTML.

**Recommendations:**
- Ensure exactly **one `<h1>`** per page: e.g., "Intermittent Fasting Tracker" as the hero heading.
- Use `<h2>` for section headings (History, Settings, Blog Resources).
- Use `<h3>` for subsections (article cards, protocol options).
- Confirm these headings are visible in the pre-rendered HTML (requires SSG, see 4.4).

**Current state:** The app renders headings inside React state-controlled modals that are conditionally visible. These are invisible to crawlers that don't execute JavaScript.

---

### 5.4 Page Speed — Self-Host Google Fonts

Loading Google Fonts introduces a cross-origin DNS lookup + TLS handshake on every visit. Self-hosting eliminates this:

```bash
npm install @fontsource/dm-sans @fontsource/dm-serif-display
```

```js
// src/main.jsx
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/600.css'
import '@fontsource/dm-serif-display/400.css'
```

Remove the `<link>` tags for Google Fonts from `index.html`. This improves LCP and eliminates a privacy-invasive third-party request.

---

## 6. P2 — Content Expansion Strategy (High SEO Upside)

The single biggest SEO opportunity is **content**. A fasting timer app with no unique text content will struggle to rank for competitive health keywords. The blog section currently links to external articles — but those articles rank on *other domains*, not on this app.

### 6.1 Keyword Targets

| Keyword | Monthly Volume (est.) | Difficulty | Intent |
|---|---|---|---|
| intermittent fasting tracker | 9,900 | Medium | Transactional |
| fasting timer | 8,100 | Low | Transactional |
| 16:8 fasting timer | 5,400 | Low | Transactional |
| intermittent fasting app free | 4,400 | Medium | Transactional |
| how to do 16:8 fasting | 14,800 | High | Informational |
| what is intermittent fasting | 74,000 | Very High | Informational |
| 18:6 fasting | 6,600 | Medium | Informational |
| fasting streak tracker | 1,300 | Low | Transactional |
| intermittent fasting schedule | 12,100 | High | Informational |

**Quick wins** (low difficulty, transactional intent):
- "fasting timer" — the app is literally a fasting timer
- "16:8 fasting timer" — the most popular protocol
- "fasting streak tracker" — unique feature of the app

### 6.2 Recommended Content Pages

If the app migrates to a multi-page architecture (Next.js or vite-ssg with routes), add these static content pages:

| Page | URL | Target Keyword |
|---|---|---|
| Homepage | `/` | fasting tracker, fasting timer |
| 16:8 Guide | `/guides/16-8-fasting` | 16:8 fasting timer, 16:8 guide |
| 18:6 Guide | `/guides/18-6-fasting` | 18:6 fasting |
| 20:4 / OMAD Guide | `/guides/20-4-fasting` | 20:4 fasting, OMAD |
| 12:12 Guide | `/guides/12-12-fasting` | 12:12 fasting, beginner fasting |
| What is IF? | `/guides/what-is-intermittent-fasting` | what is intermittent fasting |
| FAQ | `/faq` | fasting questions |
| Privacy Policy | `/privacy` | Trust signal, no SEO value but required |

Each guide page should:
- Be statically pre-rendered with full text content
- Target one primary keyword in `<title>`, `<h1>`, and meta description
- Include internal links back to the app (CTA: "Track your [16:8] fast →")
- Include the WebPage + Article JSON-LD schema

### 6.3 Landing Page Copy for Homepage

The current homepage is purely the app UI with no descriptive text. Add a hidden-but-crawlable (or visible) section below the fold:

```html
<section aria-label="About Fasting Tracker">
  <h2>The Simplest Intermittent Fasting Tracker</h2>
  <p>
    Fasting Tracker is a free, private web app for tracking your intermittent fasting
    sessions. Whether you follow 16:8, 18:6, 20:4, or 12:12 — start your timer,
    log your history, and track your streak, all without creating an account.
  </p>
  <h3>Supported Fasting Protocols</h3>
  <ul>
    <li><strong>16:8</strong> — Fast for 16 hours, eat within an 8-hour window</li>
    <li><strong>18:6</strong> — Fast for 18 hours, eat within a 6-hour window</li>
    <li><strong>20:4</strong> — Fast for 20 hours, eat within a 4-hour window</li>
    <li><strong>12:12</strong> — Fast for 12 hours, eat within a 12-hour window</li>
  </ul>
</section>
```

This text gives crawlers something to index and helps target keyword phrases naturally.

---

## 7. P3 — Low Priority / Future

### 7.1 Internationalisation (i18n)

Intermittent fasting is globally popular. Consider translating to:
- Spanish (es) — large search volume
- German (de)
- French (fr)
- Portuguese (pt-BR)

Use `react-i18next` and add `hreflang` alternate tags:
```html
<link rel="alternate" hreflang="en" href="https://your-domain.com/" />
<link rel="alternate" hreflang="es" href="https://your-domain.com/es/" />
<link rel="alternate" hreflang="x-default" href="https://your-domain.com/" />
```

### 7.2 Security Headers (Trust Signal)

Add HTTP security headers via `vercel.json`. These don't directly affect SEO rankings but are part of Google's Safe Browsing signals and improve site trust:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

### 7.3 Service Worker / Offline Support

A service worker enables offline functionality and is a positive ranking signal for mobile searches. Use Vite's `vite-plugin-pwa`:

```bash
npm install vite-plugin-pwa
```

This also pre-caches all static assets, improving repeat-visit performance (better LCP on subsequent visits).

### 7.4 Search Console & Bing Webmaster Verification

After deploying:
1. Register on [Google Search Console](https://search.google.com/search-console)
2. Register on [Bing Webmaster Tools](https://www.bing.com/webmasters)
3. Submit `sitemap.xml`
4. Monitor crawl errors, index coverage, and Core Web Vitals in Search Console

---

## 8. Implementation Checklist

### Phase 1 — Quick Wins (1–2 days)
- [ ] Write complete `<head>` meta tags in `index.html` (title, description, og:*, twitter:*)
- [ ] Create `public/robots.txt`
- [ ] Create `public/sitemap.xml`
- [ ] Add JSON-LD structured data (WebApplication + FAQPage)
- [ ] Create `public/manifest.json`
- [ ] Compress `public/icon.png` (1.3 MB → target < 50 KB)
- [ ] Generate favicon sizes (16×16, 32×32, 180×180 apple-touch-icon)
- [ ] Design and export `og-image.png` (1200×630)
- [ ] Add `<meta name="theme-color">` and `<link rel="apple-touch-icon">`

### Phase 2 — Technical SEO (1 week)
- [ ] Self-host Google Fonts (remove external `<link>`)
- [ ] Install and configure `vite-ssg` for pre-rendering
- [ ] Optimise Vite build (chunk splitting, terser minification)
- [ ] Add `font-display: swap` to font loading
- [ ] Add Vercel Analytics custom events (fast_started, blog_clicked, etc.)
- [ ] Register on Google Search Console and submit sitemap
- [ ] Register on Bing Webmaster Tools

### Phase 3 — Content SEO (2–4 weeks)
- [ ] Add descriptive landing page copy below the fold in `App.jsx`
- [ ] Migrate architecture to Next.js or implement `vite-ssg` routing
- [ ] Create `/guides/16-8-fasting` content page
- [ ] Create `/guides/18-6-fasting` content page
- [ ] Create `/guides/what-is-intermittent-fasting` content page
- [ ] Create `/faq` page with expanded FAQ content
- [ ] Add internal linking strategy between guide pages and the app

### Phase 4 — Advanced (Ongoing)
- [ ] Implement service worker with `vite-plugin-pwa`
- [ ] Add `vercel.json` security headers
- [ ] Set up Core Web Vitals monitoring (Vercel Speed Insights or PageSpeed Insights CI)
- [ ] Evaluate i18n expansion (Spanish first)
- [ ] Monitor keyword rankings and adjust content strategy

---

## 9. Expected Impact

| Phase | Timeline | Expected Outcome |
|---|---|---|
| Phase 1 | Week 1 | Social sharing previews active, basic crawlability, sitemap indexed |
| Phase 2 | Week 2 | Pre-rendered HTML indexed, Core Web Vitals improved, Google Search Console data flowing |
| Phase 3 | Month 2 | Organic traffic from long-tail fasting keywords, content pages ranking |
| Phase 4 | Month 3+ | PWA install rate, international traffic, continuous CWV monitoring |

Achieving Phase 1 + 2 alone can move the app from **zero indexed content** to a properly discoverable, social-shareable product. Phase 3 (content) is where long-term organic growth happens.

---

## 10. Tools & References

| Tool | Purpose |
|---|---|
| [Google Search Console](https://search.google.com/search-console) | Index monitoring, crawl errors, CWV |
| [PageSpeed Insights](https://pagespeed.web.dev/) | Core Web Vitals measurement |
| [Rich Results Test](https://search.google.com/test/rich-results) | Validate JSON-LD structured data |
| [Open Graph Debugger](https://developers.facebook.com/tools/debug/) | Validate OG tags |
| [Twitter Card Validator](https://cards-dev.twitter.com/validator) | Validate Twitter cards |
| [RealFaviconGenerator](https://realfavicongenerator.net/) | Generate all favicon sizes |
| [Squoosh](https://squoosh.app/) | Compress and convert images |
| [Schema.org](https://schema.org/) | Structured data reference |
| [vite-ssg](https://github.com/antfu/vite-ssg) | Static site generation for Vite |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | PWA + service worker for Vite |
| [Ahrefs / SEMrush](https://ahrefs.com) | Keyword research and rank tracking |

---

*End of SEO Improvement Plan*
