# AGENTS.md — NS Landing Page SEO / AEO Optimization Guide

## Repository

You are working in this exact repository:

```txt
C:\HELLOWORLD\NS_LandingPage_Codex
````

Known current structure:

```txt
C:\HELLOWORLD\NS_LandingPage_Codex
C:\HELLOWORLD\NS_LandingPage_Codex\.well-known
C:\HELLOWORLD\NS_LandingPage_Codex\.well-known\assetlinks.json
C:\HELLOWORLD\NS_LandingPage_Codex\static
C:\HELLOWORLD\NS_LandingPage_Codex\.gitattributes
C:\HELLOWORLD\NS_LandingPage_Codex\AGENTS.md
C:\HELLOWORLD\NS_LandingPage_Codex\bellagio.jpg
C:\HELLOWORLD\NS_LandingPage_Codex\confirmed.html
C:\HELLOWORLD\NS_LandingPage_Codex\goldentiki.jpg
C:\HELLOWORLD\NS_LandingPage_Codex\hardrock.jpg
C:\HELLOWORLD\NS_LandingPage_Codex\index.html
C:\HELLOWORLD\NS_LandingPage_Codex\privacypolicy.html
C:\HELLOWORLD\NS_LandingPage_Codex\vegas.jpg
```

## Mission

Improve the recently launched web app landing page for:

* Google Search
* Google AI Overviews / AI Mode visibility
* Answer-engine readiness
* Crawlability
* Structured data clarity
* Social sharing previews
* Mobile UX
* Desktop UX
* Core Web Vitals
* Accessibility
* Static hosting reliability
* Long-term SEO iteration using Google Search Console data

The current site is a simple static landing page with a self-contained `index.html`. It already works well on desktop and mobile. Preserve that simplicity unless a change creates clear value.

## Core principle

Do not split `index.html` just because it is self-contained.

A single static HTML page can be excellent for SEO when:

* Important content exists directly in crawlable HTML.
* Metadata is complete.
* Structured data is valid and matches visible content.
* Images are optimized and accessible.
* The page loads quickly.
* Mobile and desktop UX are stable.
* The canonical URL, sitemap, and robots rules are correct.

Only split CSS/JS or create new pages when it improves performance, maintainability, caching, crawlability, or distinct search intent.

## Non-negotiable constraints

* Do not add a framework.
* Do not convert this repo to Next.js, React, Vite, Astro, Remix, or any other build system.
* Do not add npm dependencies unless explicitly required and justified.
* Do not damage the current desktop/mobile layout.
* Do not remove existing working behavior.
* Do not delete existing pages.
* Do not modify `.well-known/assetlinks.json` unless it is invalid JSON or clearly broken.
* Do not invent product facts, testimonials, ratings, review counts, user counts, awards, partnerships, or app store rankings.
* Do not add fake schema.
* Do not add hidden SEO text.
* Do not keyword stuff.
* Do not create doorway pages.
* Do not create thin duplicate pages.
* Do not use structured data for content that is not visible to users.
* Do not block important assets from crawlers.
* Do not expose secrets or add tracking scripts unless already present and necessary.

## Source of truth

Use the actual files in this repo as the source of truth.

Before editing:

1. Inspect `index.html`.
2. Inspect `confirmed.html`.
3. Inspect `privacypolicy.html`.
4. Inspect `.well-known/assetlinks.json`.
5. Inspect the `static/` folder.
6. Inspect all image references.
7. Identify the actual app name, brand name, CTA, feature claims, audience, platform links, and production URL from the existing files.

If the production domain is missing, use this placeholder:

```txt
https://YOUR_PRODUCTION_DOMAIN.com/
```

Add a clear TODO comment near canonical, Open Graph, sitemap, and JSON-LD references when this placeholder is used.

## SEO objectives

The homepage should clearly answer:

* What is the app?
* Who is it for?
* What problem does it solve?
* What is the main benefit?
* What makes it different?
* How does someone start?
* Is it available on web, iOS, Android, or another platform?
* What privacy/trust information is available?
* What page title and description should Google show?
* What short direct answers should AI answer engines be able to extract?

## Landing page structure

`index.html` should include:

* Valid `<!doctype html>`.
* `<html lang="en">`, unless the visible page language is different.
* One clear `<h1>`.
* Logical `<h2>` and `<h3>` sections.
* Semantic structure:

  * `<header>`
  * `<main>`
  * `<section>`
  * `<footer>`
  * `<nav>` if navigation exists
* Descriptive CTA text.
* Crawlable visible text for the product value proposition.
* Clear internal links to `privacypolicy.html` and any other public pages.
* No important marketing message only embedded inside images.
* No duplicate/conflicting metadata.

## Metadata requirements

Add or verify:

```html
<title>...</title>
<meta name="description" content="...">
<link rel="canonical" href="https://YOUR_PRODUCTION_DOMAIN.com/">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="...">
```

Title requirements:

* Specific.
* Human-readable.
* Benefit-driven.
* Brand-aware.
* Not keyword stuffed.
* Ideally concise enough to display well in search results.

Meta description requirements:

* Accurate.
* Compelling.
* Matched to visible page content.
* Not a keyword list.
* Not based on unsupported claims.

## Open Graph and social preview metadata

Add or verify:

```html
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:type" content="website">
<meta property="og:url" content="https://YOUR_PRODUCTION_DOMAIN.com/">
<meta property="og:image" content="https://YOUR_PRODUCTION_DOMAIN.com/path-to-image.jpg">
<meta property="og:site_name" content="...">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="https://YOUR_PRODUCTION_DOMAIN.com/path-to-image.jpg">
```

Use the best existing image from the repo. If no current image is ideal for social previews, use the best available image and document a TODO recommending a future 1200x630 branded social image.

Current available root images:

```txt
bellagio.jpg
goldentiki.jpg
hardrock.jpg
vegas.jpg
```

Do not remove existing images unless all references are safely updated.

## Structured data requirements

Use JSON-LD with:

```html
<script type="application/ld+json">
...
</script>
```

Use only schema that matches visible page content.

Allowed schema types when supported by the current page:

* `Organization`
* `WebSite`
* `WebPage`
* `SoftwareApplication`
* `MobileApplication`
* `FAQPage`
* `BreadcrumbList`

Rules:

* Prefer JSON-LD.
* Keep schema accurate.
* Keep schema complete enough to be useful.
* Use stable `@id` values based on the canonical URL.
* Do not include fake reviews.
* Do not include fake aggregate ratings.
* Do not include fake offers.
* Do not include fake pricing.
* Do not include fake app availability.
* Do not include FAQ schema unless the same questions and answers are visible on the page.
* Do not include `Product`, `Offer`, `Review`, or `AggregateRating` unless the visible page genuinely supports them.

Recommended JSON-LD graph pattern:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://YOUR_PRODUCTION_DOMAIN.com/#organization",
      "name": "BRAND_NAME",
      "url": "https://YOUR_PRODUCTION_DOMAIN.com/"
    },
    {
      "@type": "WebSite",
      "@id": "https://YOUR_PRODUCTION_DOMAIN.com/#website",
      "url": "https://YOUR_PRODUCTION_DOMAIN.com/",
      "name": "BRAND_NAME",
      "publisher": {
        "@id": "https://YOUR_PRODUCTION_DOMAIN.com/#organization"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://YOUR_PRODUCTION_DOMAIN.com/#webpage",
      "url": "https://YOUR_PRODUCTION_DOMAIN.com/",
      "name": "PAGE_TITLE",
      "isPartOf": {
        "@id": "https://YOUR_PRODUCTION_DOMAIN.com/#website"
      },
      "about": {
        "@id": "https://YOUR_PRODUCTION_DOMAIN.com/#organization"
      }
    }
  ]
}
```

Replace placeholders only with facts verified from the repo.

## FAQ / answer-engine optimization

Add or improve a concise visible FAQ section only if it naturally helps users.

FAQ goals:

* Answer real user questions directly.
* Make the app easier to understand.
* Help search engines and answer engines extract clear answers.
* Reduce friction before clicking the CTA.
* Avoid generic filler.

Good FAQ patterns:

```html
<h2>How does [App Name] work?</h2>
<h2>Who is [App Name] for?</h2>
<h2>Is [App Name] available on mobile?</h2>
<h2>What makes [App Name] different?</h2>
<h2>How does [App Name] handle privacy?</h2>
```

FAQ rules:

* Keep answers short and useful.
* Do not stuff keywords.
* Do not invent claims.
* Do not hide the FAQ.
* Only add `FAQPage` schema for visible FAQ content.
* Ensure schema answers match visible answers.

## Page splitting decision rules

### Keep `index.html` self-contained when:

* The file remains readable.
* CSS/JS is not causing performance issues.
* The page is simple.
* Static hosting compatibility is important.
* Current desktop/mobile behavior is stable.
* SEO improvements can be made directly inside HTML.

### Split CSS into `static/styles.css` only when:

* Inline CSS is very large or hard to maintain.
* External CSS improves caching.
* The result is visually identical.
* It does not introduce flash/layout problems.
* It does not complicate static hosting.

### Split JS into `static/main.js` only when:

* Inline JS is large or hard to maintain.
* JS is non-critical and can be loaded with `defer`.
* Behavior remains identical.
* Static hosting still works.
* No dependency/build step is introduced.

### Add new pages only when:

* The page has unique user value.
* The page serves a distinct search intent.
* The content is not duplicated from the homepage.
* The page can be internally linked.
* The content is substantial enough to justify indexing.

Possible future pages:

* `faq.html`
* `features.html`
* `how-it-works.html`

Do not create these automatically unless the current content supports them.

## Image optimization

For all images:

* Add meaningful `alt` text when the image communicates content.
* Use `alt=""` for purely decorative images.
* Add `width` and `height` when dimensions are known.
* Add `loading="lazy"` to below-the-fold images.
* Add `decoding="async"` where appropriate.
* Keep likely above-the-fold hero/LCP image eager-loaded.
* Avoid layout shifts.
* Keep images near relevant text.
* Do not reference missing image files.
* Do not delete JPGs unless all references are updated.

If image optimization tooling is available, consider adding optimized WebP/AVIF versions, but only if references remain correct and original files are preserved.

## Performance requirements

Prioritize:

* Fast initial render.
* Stable layout.
* No horizontal overflow.
* Minimal render-blocking code.
* No unnecessary third-party scripts.
* Efficient CSS.
* Deferred non-critical JS.
* Proper image sizing.
* Mobile-first responsiveness.
* `prefers-reduced-motion` handling if animations exist.

Do not remove important visual polish unless it clearly harms performance, accessibility, or stability.

## Accessibility requirements

Ensure:

* One clear `<h1>`.
* Logical heading order.
* Semantic HTML.
* Descriptive links/buttons.
* Keyboard-visible focus styles.
* Sufficient contrast.
* Forms have labels if forms exist.
* Icons used as buttons have accessible names.
* Decorative images use empty alt text.
* Motion respects reduced-motion preferences where applicable.
* Clickable elements use `<a>` or `<button>` instead of non-semantic divs.

## `robots.txt`

Create or update root `robots.txt`.

Default recommended content:

```txt
User-agent: *
Allow: /

Sitemap: https://YOUR_PRODUCTION_DOMAIN.com/sitemap.xml
```

Do not block:

* `/static/`
* CSS
* JS
* images
* `index.html`
* public HTML pages

Do not rely on `robots.txt` to protect secrets.

## `sitemap.xml`

Create or update root `sitemap.xml`.

Include only public, index-worthy pages.

Typical structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://YOUR_PRODUCTION_DOMAIN.com/</loc>
    <lastmod>YYYY-MM-DD</lastmod>
  </url>
  <url>
    <loc>https://YOUR_PRODUCTION_DOMAIN.com/privacypolicy.html</loc>
    <lastmod>YYYY-MM-DD</lastmod>
  </url>
</urlset>
```

Only include `confirmed.html` if it has search value. If it is a post-action confirmation page, prefer:

```html
<meta name="robots" content="noindex,follow">
```

## `privacypolicy.html`

Allowed improvements:

* Better `<title>`.
* Better meta description.
* Canonical URL.
* Semantic HTML cleanup.
* Mobile/accessibility fixes.
* Internal navigation/footer consistency.

Do not rewrite legal/privacy substance unless explicitly instructed.

## `confirmed.html`

Allowed improvements:

* Better `<title>`.
* Cleaner metadata.
* Semantic HTML cleanup.
* Mobile/accessibility fixes.
* Clear navigation back to homepage.

If this is a utility confirmation page, it should usually be `noindex,follow`.

## `.well-known/assetlinks.json`

This file is important for Android App Links / Digital Asset Links.

Rules:

* Do not modify unless it is invalid JSON or clearly incorrect.
* If modified, validate JSON.
* Preserve package names.
* Preserve certificate fingerprints.
* Preserve relation values.
* Preserve the `.well-known/assetlinks.json` path.

## SEO audit document

Create or update:

```txt
SEO_AUDIT.md
```

or:

```txt
static/seo-audit.md
```

Include:

* Files changed.
* Metadata changes.
* Structured data added/changed.
* Image improvements.
* Robots/sitemap status.
* Whether `index.html` was kept self-contained or split.
* Placeholder URLs that must be replaced.
* Manual verification checklist.
* Google Search Console workflow.
* Remaining recommendations.

## Weekly Search Console workflow

After deployment, the user should use this process weekly:

1. Export Google Search Console query data.
2. Export page data.
3. Find high-impression / low-click queries.
4. Find pages where title/meta do not match search intent.
5. Find queries Google is already associating with the site but the page does not answer directly.
6. Find cannibalization if multiple pages exist.
7. Update page copy based on actual query data.
8. Add or refine visible FAQ answers only when useful.
9. Validate structured data.
10. Re-inspect important URLs after deployment.
11. Submit updated sitemap after meaningful changes.

## Technical validation checklist

Before final response, verify:

* HTML syntax is valid enough to render correctly.
* JSON-LD parses as valid JSON.
* `assetlinks.json` parses as valid JSON if touched.
* `robots.txt` is valid plain text.
* `sitemap.xml` is valid XML.
* All local links work.
* All local image references work.
* No missing CSS/JS/image paths.
* Mobile layout works at 360px, 390px, and 430px widths.
* Desktop layout works at 1280px and 1440px widths.
* No horizontal overflow.
* CTA links/buttons still work.
* Privacy policy link still works.
* Confirmation page still works.
* Important content is visible in raw HTML.
* Page remains usable without unnecessary JavaScript where possible.

## Manual post-deployment checklist

After deployment, tell the user to verify:

* Google Search Console property is configured.
* Homepage passes URL Inspection.
* Sitemap is submitted.
* Rich Results Test validates structured data.
* PageSpeed Insights is checked for mobile and desktop.
* Social previews are checked.
* Canonical URL resolves correctly.
* `robots.txt` resolves.
* `sitemap.xml` resolves.
* `.well-known/assetlinks.json` resolves.
* No important page has accidental `noindex`.
* No important asset is blocked from crawling.

## Final response format

When finished, respond with:

```md
## Files changed

- `index.html` — ...
- `robots.txt` — ...
- `sitemap.xml` — ...
- `SEO_AUDIT.md` — ...

## Single-file decision

Kept `index.html` self-contained because ...
```

or:

```md
## Single-file decision

Split CSS/JS because ...
```

Then include:

```md
## Placeholders to replace

- `https://YOUR_PRODUCTION_DOMAIN.com/`
```

Then include:

```md
## Manual verification

- Submit sitemap in Google Search Console.
- Run Rich Results Test.
- Run PageSpeed Insights mobile/desktop.
- Check social previews.
- Check the live canonical URL.
```

Then include:

```md
## Risks / assumptions

- ...
```

## Operating style

Be conservative with architecture.

Prefer high-impact, low-risk improvements.

Preserve what already works.

Optimize in this order:

1. Correctness.
2. Existing UX preservation.
3. Crawlability.
4. Clear user-facing copy.
5. Accurate metadata.
6. Valid structured data.
7. Performance.
8. Accessibility.
9. Maintainability.
10. Search Console iteration readiness.

Do not guess. Inspect first, edit second, validate third.
