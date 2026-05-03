# Daxos Website — Project Context

## Sites
- **Test (edit here):** https://daxos-testing.netlify.app | Site ID: `bbb96f3c-0d6f-4d03-8558-3d8705f9c769`
- **Production (NEVER touch without approval):** https://daxos-staging.netlify.app = daxos.capital

## Deploy Command (test site)
```bash
NETLIFY_AUTH_TOKEN=nfp_Vq5QJfsSLcsLKTBb84NscYojwKgzxNvi1614 ~/.npm-global/bin/netlify deploy --dir=. --site=bbb96f3c-0d6f-4d03-8558-3d8705f9c769 --prod
```
Always use `--prod` or changes only go to a draft URL, NOT to daxos-testing.netlify.app.

## Pages
- `index.html` — Homepage (WordPress-origin, heavily customized with injected custom nav + CSS)
- `about/index.html` — About Us (clean custom page — use as NAV REFERENCE TEMPLATE)
- `portfolio/index.html` — Portfolio grid
- `contact/index.html` — Contact form
- `apply.html` / `apply-success/` — Application flow

## Design System
- **Background:** #000 | **Text:** #fff
- **Accent:** blue #256aef, pink #e95095, yellow #fff34b
- **Headings:** Source Code Pro | **Body:** Roboto Mono
- **Mobile breakpoint:** 768px

## Nav Reference (about/index.html is canonical)
All pages must use this exact nav CSS + HTML:
```css
.nav { display: flex; justify-content: space-between; align-items: center; padding: 28px 48px; border-bottom: 1px solid #1a1a1a; }
.nav-logo { border: 0.8px solid #fff; padding: 6px 12px; font-size: 17px; letter-spacing: 1px; }
.nav-burger { display: flex; flex-direction: column; gap: 5px; cursor: pointer; }
.nav-burger div { width: 24px; height: 1.5px; background: #fff; }
@media (max-width: 768px) {
  .nav { padding: 16px 20px; }
  .nav-logo { font-size: 13px; padding: 6px 16px; }
  .nav-close { top: 16px; right: 20px; }
}
```

## Homepage Special Notes
- WordPress-generated shell — custom nav injected ABOVE the WP header (which is hidden via `#page-header { display: none !important }`)
- Tagline uses WPBakery UltimateVC typewriter plugin: `.ultimate-typewriter-prefix` + `#typed-400673291369cc247d7f51a`
- Typed word has `left: 2ch` on desktop to indent under "disrupt"; must be `left: 0` on mobile
- Section `.l-section.full_height` = `calc(100vh - 70px)` — vertically centered content
- Footer is `position: fixed` at bottom

## Rules
- Never deploy to daxos-staging.netlify.app without explicit user approval
- Always `--prod` flag when deploying to daxos-testing
