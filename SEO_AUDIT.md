# NomadSwipe SEO Audit

Last updated: 2026-05-12
App Store readiness update: 2026-06-21

## Files changed

- `index.html`: improved metadata, social preview tags, canonical signals, local image usage, structured data, FAQ content, focus styles, reduced-motion handling, broken placeholder links, and footer links.
- `privacypolicy.html`: added indexable metadata, canonical URL, theme/icon links, corrected internal navigation anchors, and wrapped the primary content in `main`.
- `confirmed.html`: added utility-page metadata, `noindex,follow`, canonical URL, theme/icon links, corrected internal navigation anchors, and wrapped the primary content in `main`.
- `robots.txt`: allows crawling of public files and points to the production sitemap.
- `sitemap.xml`: includes the homepage, privacy policy, support, terms, and account deletion pages, and excludes the utility confirmation page.
- `site.webmanifest`: uses the existing `static/adaptive-icon.png` asset for basic app metadata.
- `support.html`: public App Store Support URL candidate with contact and help paths.
- `terms.html`: public Terms of Use page with App Store license note.
- `account-deletion.html`: public account and data deletion request instructions.

## App Store URL checklist

Use these production URLs in App Store Connect when applicable:

- Privacy Policy URL: `https://nomadswipe.com/privacypolicy.html`
- Support URL: `https://nomadswipe.com/support.html`
- Marketing URL: `https://nomadswipe.com/`
- Terms URL: `https://nomadswipe.com/terms.html`
- Account deletion information: `https://nomadswipe.com/account-deletion.html`

Manual app-side verification needed: if the iOS app supports account creation, confirm the app itself also provides an in-app account deletion path. A public web page helps users and reviewers, but Apple may still expect deletion controls inside the app experience for account-based apps.

## Canonical URL

Production canonical URL used across metadata, structured data, robots, and sitemap:

`https://nomadswipe.com/`

Manual verification needed: confirm the deployed production domain resolves exactly at `https://nomadswipe.com/` and that the HTTPS version is the preferred canonical host.

## Structured Data

`index.html` now uses JSON-LD with:

- `Organization`
- `WebSite`
- `WebPage`
- `MobileApplication`
- `FAQPage`

The previous pricing schema was removed because pricing and subscription details are not visible on the page.

## Image Notes

- Social preview image uses `https://nomadswipe.com/static/bellagio.jpg`.
- The homepage hero preview and interactive demo now use local images from `static/`.
- TODO: create a dedicated 1200x630 branded social image for more reliable Open Graph cropping.
- Original JPG files were preserved.

## Manual Verification Checklist

- Run Google Search Console URL Inspection for `https://nomadswipe.com/`.
- Submit `https://nomadswipe.com/sitemap.xml` in Google Search Console.
- Run Google Rich Results Test for the homepage.
- Run PageSpeed Insights for mobile and desktop.
- Test social previews for Open Graph and Twitter/X cards.
- Confirm `https://nomadswipe.com/robots.txt` resolves.
- Confirm `https://nomadswipe.com/sitemap.xml` resolves.
- Confirm `https://nomadswipe.com/.well-known/assetlinks.json` resolves.
- Confirm the live canonical URL does not redirect to an unexpected host.
- Confirm `confirmed.html` remains excluded from indexing.

## Weekly Google Search Console Workflow

1. Export query data.
2. Export page data.
3. Find high-impression, low-click queries.
4. Find pages with impressions but weak titles or descriptions.
5. Find search queries not directly answered on the page.
6. Check for cannibalization if additional pages are added later.
7. Update visible copy based on data, not guesses.
8. Add or refine FAQ answers only when they genuinely help users.
9. Validate structured data after meaningful content changes.
10. Re-inspect important URLs after deployment.
11. Resubmit the sitemap after meaningful changes.

## PageSpeed And Lighthouse Checklist

- Check LCP image behavior on mobile.
- Confirm no horizontal overflow at 360px, 390px, 430px, 1280px, and 1440px.
- Confirm local images load correctly on static hosting.
- Confirm third-party font and icon loads are acceptable for launch.
- Consider a future local icon strategy if CDN latency becomes a measurable problem.

## Future Content Guidance

- Do not add thin SEO pages.
- Consider `features.html`, `faq.html`, or `how-it-works.html` only after Search Console shows distinct search intent that the homepage cannot answer cleanly.
- Do not add reviews, ratings, pricing, awards, partnerships, user counts, or launch claims unless they are verifiable and visible on the page.
