# dliu.com shared resources

Instructions for building or updating any dliu.com app (people and AI agents). Every dliu.com site must look the same:
same header (menu bar) with the DL icon, same buttons, same sign-in button, same colours, fonts and footer. Do not invent a
new look; load the shared files below and build the app's own pages with them.

| What | URL |
| --- | --- |
| This guide | https://files.dliu.com/dliu.com/README.md |
| Shared stylesheet | https://files.dliu.com/dliu.com/ui/v1/dl.css |
| Every component on one page (open it to see the look) | https://files.dliu.com/dliu.com/ui/v1/demo.html |
| DL icon (512 × 512 PNG): header logo and favicon | https://files.dliu.com/dliu.com/favicon.png |
| Source (edit here, then publish) | https://github.com/dliu-com/shared-resources |

## Rules

1. Link the shared files from `https://files.dliu.com/dliu.com/`. Never copy `dl.css` or the icon into the app.
2. Load `dl.css` first, then the app's own stylesheet. The app's CSS holds only what is specific to the app (its pages,
   tables, editors…), never its own header, buttons, sign-in button, footer or colour palette.
3. Use the `--dl-*` CSS variables for every colour, radius and font in the app's CSS (for example
   `border: 1px solid var(--dl-line)`, `color: var(--dl-muted)`). Do not define other colour values for things the
   variables already cover.
4. Use the markup below for the header and footer exactly, on every page of the app.
5. The theme is light only.
6. No JavaScript is shared. The app's own script may fill the header's `<nav>` (for example Sign in vs Sign out), but
   it must use the same classes.
7. Need something the kit lacks that other apps would also use (a new kind of button, a tabs bar…)? Add it to
   `dl.css` in the source repo and publish, rather than styling it in one app only.

## Page skeleton

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Page · App name</title>
  <link rel="icon" type="image/png" href="https://files.dliu.com/dliu.com/favicon.png">
  <link rel="stylesheet" href="https://files.dliu.com/dliu.com/ui/v1/dl.css">
  <link rel="stylesheet" href="/style.css">
</head>
<body class="dl-page">
  <header class="dl-header">
    <a class="dl-logo" href="https://dliu.com" aria-label="dliu.com"><img src="https://files.dliu.com/dliu.com/favicon.png" alt="DL" width="32" height="32"></a>
    <a class="dl-brand" href="/">App name</a>
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
  <footer class="dl-footer"><a href="https://dliu.com">dliu.com</a> · <a href="/docs">Docs</a></footer>
</body>
</html>
```

- The DL icon always links to `https://dliu.com`; the app name always links to the app's home page (`/`).
- Put the header's links and buttons inside `<nav class="dl-nav">`, in this order: text links (`dl-nav-link`), then
  `Docs` (`dl-button`), then the app's main action (`dl-button dl-button-primary`, for example `＋ Upload`), then
  `Sign in` (`dl-button dl-signin`) or `Sign out` (`dl-button`). Mark the current page with `aria-current="page"`.
- Use `<main class="dl-main dl-narrow">` for reading and form pages (760 px wide), plain `dl-main` (1280 px) for
  grids, dashboards and tables.

## Components

| Class | Use |
| --- | --- |
| `dl-page` | On `<body>`: header on top, main fills the screen, footer at the bottom |
| `dl-header`, `dl-logo`, `dl-brand`, `dl-nav` | The menu bar (see the skeleton) |
| `dl-nav-link` | Plain text link in the menu bar |
| `dl-button` | Every button, on `<a>` or `<button>` |
| `dl-button dl-button-primary` | The main action on a page or form (one per area) |
| `dl-button dl-button-danger` | Delete and other destructive actions |
| `dl-button dl-button-small` | Compact buttons in lists and tables |
| `dl-button dl-button-link` | A button that looks like a link |
| `dl-button dl-signin` | The Sign in button in the header |
| `dl-ms-signin` | Large "Sign in with Microsoft" button for a sign-in page or a private page's landing card (markup below) |
| `dl-account` | The signed-in account name, next to Sign out |
| `dl-main`, `dl-narrow` | Page content width |
| `dl-footer` | Footer: `dliu.com` link first, then the app's own links, separated by ` · ` |
| `dl-panel` | Grey box for a group of settings or a form section |
| `dl-muted`, `dl-error`, `dl-success` | Secondary, error and success text |
| `dl-visually-hidden` | Text for screen readers only |
| `dl-icon` | A 16 px stroke SVG icon inside a `dl-button` |

Plain elements already get the shared look with no class: body text and font, links, `h1`, `h2`, text inputs, textareas
and selects (full-width text fields, focus ring).

Microsoft sign-in button, following
[Microsoft's branding guidelines](https://learn.microsoft.com/entra/identity-platform/howto-add-branding-in-apps):

```html
<a class="dl-ms-signin" href="/auth/login">
  <svg viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>
  <span>Sign in with Microsoft</span>
</a>
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
| `--dl-accent` | `#2563eb` | Links, primary buttons, selection |
| `--dl-accent-hover` | `#1d4ed8` | Hovered primary buttons |
| `--dl-accent-soft` | `#eef3fe` | Light accent background (selected rows, badges) |
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

`script-src` needs nothing, because no JavaScript is shared.

## Checklist for a new or updated app

- [ ] Every page loads `dl.css` before the app's stylesheet and uses the DL icon as its favicon.
- [ ] Every page has the shared header and footer; the app's own CSS defines no header, button or footer styles.
- [ ] The app's CSS uses `--dl-*` variables, not its own palette.
- [ ] The CSP allows the two paths above.
- [ ] Checked on a phone-sized screen (≤ 400 px): the header wraps cleanly and buttons are at least 44 px tall on touch screens.

## Versions

`ui/v1/` only gains things or gets fixes, and every site picks a change up within 5 minutes. A change that could break an
existing page (renaming or removing a class, a different layout) goes into `ui/v2/`, and apps move over one at a time.
