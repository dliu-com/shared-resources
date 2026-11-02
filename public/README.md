# dliu.com shared resources

Instructions for building or updating any dliu.com app (people and AI agents). Every dliu.com site must look the same:
same header (menu bar), buttons, sign-in button, colours, fonts and footer. Each app keeps its own logo (top left and
favicon); the shared DL logo sits in every footer. Do not invent a
new look; load the shared files below and build the app's own pages with them.

| What | URL |
| --- | --- |
| This guide | https://files.dliu.com/dliu.com/README.md |
| Shared stylesheet (every page) | https://files.dliu.com/dliu.com/ui/v1/dl.css |
| Docs stylesheet (Docs / About / How it works pages, after dl.css) | https://files.dliu.com/dliu.com/ui/v1/dl-docs.css |
| Every component on one page (open it to see the look) | https://files.dliu.com/dliu.com/ui/v1/demo.html |
| DL logo (512 × 512 PNG): in every footer | https://files.dliu.com/dliu.com/favicon.png |
| Source (edit here, then publish) | https://github.com/dliu-com/shared-resources |

## Rules

1. Link the shared files from `https://files.dliu.com/dliu.com/`. Never copy `dl.css` or the icon into the app.
2. Load `dl.css` first, then the app's own stylesheet. The app's CSS holds only what is specific to the app (its pages,
   tables, editors…), never its own header, buttons, sign-in button, footer or colour palette.
3. Use the `--dl-*` CSS variables for every colour, radius and font in the app's CSS (for example
   `border: 1px solid var(--dl-line)`, `color: var(--dl-muted)`). Do not define other colour values for things the
   variables already cover, and never hard-code the accent (`#209cee`, or the older `#2563eb`).
4. Use the markup below for the header and footer exactly, on every page of the app.
5. The theme is light only (no dark mode).
6. No JavaScript is shared. The app's own script may fill the header's `<nav>` (for example Sign in vs Sign out), but
   it must use the same classes.
7. Need something the kit lacks that other apps would also use? Add it to `dl.css` in the source repo and publish,
   rather than styling it in one app only.
8. The app's own content keeps its own design where it is the point of the app (a Go or chess board, a video player,
   a birthday card); everything around it (header, buttons, fields, tabs, tables, footer, colours, fonts) is shared.
9. Every app repo has a test that fails if a page stops loading `dl.css`, or drops the shared header (with the app's
   logo) or the footer's DL logo (see video's `test/shared-ui.test.js`), and `make audit` in the source repo checks the live sites.

## Page skeleton

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Page · App name</title>
  <link rel="icon" href="/logo.svg" type="image/svg+xml">
  <link rel="stylesheet" href="https://files.dliu.com/dliu.com/ui/v1/dl.css">
  <link rel="stylesheet" href="/style.css">
</head>
<body class="dl-page">
  <header class="dl-header">
    <a class="dl-brand" href="/"><img class="dl-logo" src="/logo.svg" alt="" width="32" height="32">App name</a>
    <nav class="dl-nav" aria-label="Site">
      <a class="dl-nav-link" href="/about">About</a>
      <a class="dl-button" href="/docs">Docs</a>
      <a class="dl-button dl-signin" href="/auth/login">Sign in</a>
    </nav>
  </header>
  <main class="dl-main">
    <h1>Page title</h1>
    …
  </main>
  <footer class="dl-footer">
    <a class="dl-footer-logo" href="https://dliu.com" aria-label="dliu.com"><img src="https://files.dliu.com/dliu.com/favicon.png" alt="" width="24" height="24"></a>
    <a href="https://dliu.com">dliu.com</a> · <a href="/docs">Docs</a>
  </footer>
</body>
</html>
```

- Top left is the app's **own logo** and name, one link to the app's home page (`/`). The favicon is the same logo.
  App logos follow the DL logo's style: white artwork on a `#209cee` square with rounded corners (`rx="8"` on a
  32 × 32 viewBox), as an SVG. Personal sites (dliu.com, home.dliu.com, jh.dliu.com, cyy.dliu.com) keep their own.
- Every footer starts with the shared **DL logo** (`dl-footer-logo`) linking to `https://dliu.com`, then the
  `dliu.com` link and the app's own links, separated by ` · `.
- Apps with more links than fit on a phone use the collapsible menu (below).
- Put the header's links and buttons inside `<nav class="dl-nav">`, in this order: text links (`dl-nav-link`), then
  `Docs` (`dl-button`), then the app's main action (`dl-button dl-button-primary`, for example `＋ Upload`), then
  `Sign in` (`dl-button dl-signin`) or `Sign out` (`dl-button`). Mark the current page with `aria-current="page"`.
- Use `<main class="dl-main dl-narrow">` for reading and form pages (760 px wide), plain `dl-main` (1280 px) for
  grids, dashboards and tables.
- Apps in Chinese and English put the language switcher (below) last in the `dl-nav`.
- If the app's script draws the header, it must produce exactly this markup.

## Docs, About and How it works pages

Load `dl-docs.css` after `dl.css`, and use the shared tabs between the sections:

```html
<link rel="stylesheet" href="https://files.dliu.com/dliu.com/ui/v1/dl.css">
<link rel="stylesheet" href="https://files.dliu.com/dliu.com/ui/v1/dl-docs.css">
…
<main class="dl-main dl-docs-main">
  <nav class="dl-tabs" aria-label="Docs sections">
    <a href="/docs#architecture" aria-current="page">Technical architecture</a>
    <a href="/docs#cost">Cost</a>
    <a href="/docs#security">Security</a>
    <a href="/docs/api">API</a>
  </nav>
  <article class="dl-docs">
    <h2>How it works</h2>
    <p class="lead">…</p>
  </article>
</main>
```

`dl-docs` styles the article: headings, `.lead`, lists, `code`, `pre.code`, tables in `.table-wrap`, `.source`. The `dg-*`
classes are the diagram kit (`dg-stats`/`dg-stat`, `dg-flow`/`dg-step`/`dg-arrow`, `dg-tier`/`dg-node`, `dg-callout`,
`dg-more`, `dg-icon` with `--dg` set to its colour, and the `dg-untrusted`, `dg-edge`, `dg-private`, `dg-app`,
`dg-good`, `dg-warn`, `dg-bad` variants); the app's diagram script builds them.
Read-more cards linking to other docs pages: `dl-docs-cards` holding `a.dl-docs-card` links, each with a `dg-icon` and a
`dl-docs-card-text` (`strong` title, `dl-docs-card-line` text, `dl-docs-card-key` "Read more →"). In security tables,
`.status` is green and `.status.fixed` amber.

## Components

| Class | Use |
| --- | --- |
| `dl-page` | On `<body>`: header on top, main fills the screen, footer at the bottom |
| `dl-header`, `dl-brand`, `dl-logo`, `dl-nav` | The menu bar: the app's logo (`img.dl-logo`) and name in one `dl-brand` link, then the nav (see the skeleton) |
| `dl-menu-toggle`, `dl-nav-collapsible` | Collapsible menu for apps with many links (markup below) |
| `dl-nav-link` | Plain text link in the menu bar |
| `dl-button` | Every button, on `<a>` or `<button>` |
| `dl-button dl-button-primary` | The main action on a page or form (one per area) |
| `dl-button dl-button-danger` | Delete and other destructive actions |
| `dl-button dl-button-small` | Compact buttons in lists and tables |
| `dl-button dl-button-quiet` | Borderless until hovered: toolbars and icon buttons |
| `dl-button dl-button-link` | A button that looks like a link |
| `dl-button dl-signin` | The Sign in button in the header |
| `dl-ms-signin` | Large "Sign in with Microsoft" button for a sign-in page or a private page's landing card (markup below) |
| `dl-account` | The signed-in account name, next to Sign out |
| `dl-main`, `dl-narrow` | Page content width |
| `dl-footer`, `dl-footer-logo` | Footer: the DL logo, the `dliu.com` link, then the app's own links, separated by ` · ` |
| `dl-tabs` | Tabs: links or buttons; `aria-current="page"` or `aria-selected="true"` marks the open tab |
| `dl-language`, `dl-language-toggle`, `dl-languages` | Chinese/English switcher (markup below) |
| `dl-button` with `aria-pressed="true"` | A toggle button that is on |
| `dl-segmented` (+ `dl-segmented-small`) | One choice out of a few (buttons inside; `aria-pressed`, `aria-checked` or `aria-selected="true"` marks the chosen one) |
| `dl-dialog`, `dl-dialog-head`, `dl-dialog-close`, `dl-dialog-body`, `dl-dialog-actions` | Native `<dialog>` opened with `showModal()` (markup below) |
| `dl-panel` | Grey box for a group of settings or a form section |
| `dl-card` | White bordered box for dashboard figures, charts and lists |
| `dl-table-wrap`, `dl-table`, `dl-num` | Tables (scroll sideways on phones); `dl-num` right-aligns numbers |
| `dl-notice` (+ `dl-error`) | Green (or red) message box at the top of a page or form |
| `dl-muted`, `dl-error`, `dl-success` | Secondary, error and success text |
| `dl-visually-hidden` | Text for screen readers only |
| `dl-icon` | A 16 px stroke SVG icon inside a `dl-button` |

Plain elements already get the shared look with no class: body text and font, links, `h1`, `h2`, text inputs, date and time
inputs, textareas and selects (full-width text fields, focus ring).

Microsoft sign-in button, following
[Microsoft's branding guidelines](https://learn.microsoft.com/entra/identity-platform/howto-add-branding-in-apps):

```html
<a class="dl-ms-signin" href="/auth/login">
  <svg viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>
  <span>Sign in with Microsoft</span>
</a>
```

Language switcher, last in the header's `dl-nav`. The app's script sets `aria-pressed` on the two language buttons,
and on narrow screens (≤ 600 px, where only the 文/A button shows) toggles the `is-open` class on `.dl-languages` and
`aria-expanded` on the toggle:

```html
<div class="dl-language">
  <button type="button" class="dl-button dl-language-toggle" aria-controls="dl-languages" aria-expanded="false" aria-label="Language / 语言">文/A</button>
  <div id="dl-languages" class="dl-languages" role="group" aria-label="Language / 语言">
    <button type="button" data-language="zh" lang="zh-CN" aria-pressed="true">中文</button>
    <button type="button" data-language="en" lang="en" aria-pressed="false">English</button>
  </div>
</div>
```

Collapsible menu: on screens up to 600 px the nav hides behind a ☰ button. Put the button just before the nav; the
app's script toggles the `is-open` class on the nav and `aria-expanded` on the button (and closes it on Escape or a tap
outside). A language switcher inside the nav shows both languages when the menu is open:

```html
<button type="button" class="dl-button dl-menu-toggle" aria-controls="dl-menu" aria-expanded="false" aria-label="Menu">☰</button>
<nav id="dl-menu" class="dl-nav dl-nav-collapsible" aria-label="Site">…</nav>
```

Dialog (a native `<dialog>`; the app's script calls `showModal()` and `close()`; a `<form method="dialog">` may wrap
the head, body and actions):

```html
<dialog class="dl-dialog" aria-labelledby="rules-title">
  <div class="dl-dialog-head">
    <h2 id="rules-title">Title</h2>
    <button type="button" class="dl-dialog-close" aria-label="Close">✕</button>
  </div>
  <div class="dl-dialog-body">…</div>
  <div class="dl-dialog-actions">
    <button type="button" class="dl-button">Cancel</button>
    <button type="button" class="dl-button dl-button-primary">OK</button>
  </div>
</dialog>
```

## CSS variables

| Variable | Value | Use |
| --- | --- | --- |
| `--dl-bg` | `#ffffff` | Page background |
| `--dl-panel` | `#f6f7f9` | Panels, hover backgrounds, code blocks |
| `--dl-surface` | `#ffffff` | Cards, fields, buttons |
| `--dl-line` | `#dfe3e8` | Borders and dividers |
| `--dl-line-strong` | `#b8c0ca` | Hovered borders |
| `--dl-text` | `#1c2024` | Text |
| `--dl-muted` | `#646b75` | Secondary text |
| `--dl-accent` | `#209cee` (the DL logo's blue) | Links, primary buttons, selection, app logos |
| `--dl-accent-hover` | `#1786d1` | Hovered primary buttons |
| `--dl-accent-soft` | `#e8f5fd` | Light accent background (selected rows, badges) |
| `--dl-focus` | blue at 35 % | Focus ring of fields |
| `--dl-danger` | `#d1242f` | Errors and destructive actions |
| `--dl-ok` | `#1a7f37` | Success |
| `--dl-radius` | `12px` | Panels, cards, media |
| `--dl-radius-small` | `8px` | Buttons and fields |
| `--dl-font` | system UI fonts (with PingFang SC / Microsoft YaHei for Chinese) | All text |
| `--dl-mono` | `ui-monospace, SFMono-Regular, Menlo, monospace` | Code |
| `--dl-main-width` | `1280px` | Width of `dl-main` |
| `--dl-gutter` | `24px` (16 px on phones) | Page side padding |

## Content Security Policy

dliu.com apps send a strict CSP. Allow only the shared paths, not the whole host:

```
style-src 'self' https://files.dliu.com/dliu.com/ui/
img-src   'self' https://files.dliu.com/dliu.com/
```

`script-src` needs nothing for the shared look, because no JavaScript is shared. (The optional traffic script below adds
its own two sources.)

## Traffic monitoring (optional page script)

Page views and visitors are counted from CloudFront logs for every site, with nothing on the page. For time on page,
scroll depth and load time, add traffic.dliu.com's page script to every page:

```html
<script src="https://traffic.dliu.com/t/s.js" async></script>
```

```
script-src  'self' https://traffic.dliu.com/t/s.js
connect-src 'self' https://traffic.dliu.com/t/e
```

- The script stays on traffic.dliu.com, not here: one script serves every site with its report address built in, and
  traffic's edge function both serves it and checks the reports, so the two always deploy together.
- Reports count only when the site's host is listed in traffic's `config/sites.json` and the report comes from that
  host's pages (its Origin or Referer must match; reports with neither are dropped). For a new site, ask
  traffic.dliu.com (dliu-com/traffic-monitor) to add it.
- Logging for a new CloudFront distribution: see "Adding a site" in
  https://github.com/dliu-com/traffic-monitor#readme.

## Checklist for a new or updated app

- [ ] Every page loads `dl.css` before the app's stylesheet, shows the app's own logo top left and as its favicon, and has
      the DL logo in the footer; Docs/About pages also
      load `dl-docs.css` and use `dl-tabs`.
- [ ] Every page has the shared header and footer; the app's own CSS defines no header, button or footer styles.
- [ ] The app's CSS uses `--dl-*` variables, not its own palette.
- [ ] The CSP allows the two paths above.
- [ ] The repo has a test that keeps the pages on the shared look.
- [ ] Optional: the traffic page script is on every page and the site is in traffic's `config/sites.json`.
- [ ] The app is listed in `sites.json` in the source repo, and `make audit` passes for it.
- [ ] Checked on a phone-sized screen (≤ 400 px): the header wraps cleanly and buttons are at least 44 px tall on touch screens.

## Versions

`ui/v1/` only gains things or gets fixes, and every site picks a change up within 5 minutes. A change that could break an
existing page (renaming or removing a class, a different layout) goes into `ui/v2/`, and apps move over one at a time.
