# dliu.com shared resources

Shared look for every dliu.com site: one stylesheet and the DL icon, served from a single place so a change here
reaches every site.

| File | Public URL |
| --- | --- |
| `public/ui/v1/dl.css` | https://files.dliu.com/dliu.com/ui/v1/dl.css |
| `public/ui/v1/demo.html` | https://files.dliu.com/dliu.com/ui/v1/demo.html (every component on one page) |
| `public/favicon.png` | https://files.dliu.com/dliu.com/favicon.png (the DL icon, 512 × 512) |

Everything under `public/` is published to `https://files.dliu.com/dliu.com/` by
[files.dliu.com](https://github.com/dliu-com/file-server), which serves it from CloudFront with a 5-minute cache.

## Using it on a site

Load `dl.css` before the site's own stylesheet, and use the shared header and footer:

```html
<link rel="icon" type="image/png" href="https://files.dliu.com/dliu.com/favicon.png">
<link rel="stylesheet" href="https://files.dliu.com/dliu.com/ui/v1/dl.css">
<link rel="stylesheet" href="/style.css">
…
<body class="dl-page">
  <header class="dl-header">
    <a class="dl-logo" href="https://dliu.com" aria-label="dliu.com"><img src="https://files.dliu.com/dliu.com/favicon.png" alt="DL" width="32" height="32"></a>
    <a class="dl-brand" href="/">Site name</a>
    <nav class="dl-nav" aria-label="Site">
      <a class="dl-nav-link" href="/about">About</a>
      <a class="dl-button" href="/docs">Docs</a>
      <a class="dl-button dl-signin" href="/auth/login">Sign in</a>
    </nav>
  </header>
  <main class="dl-main">…</main>
  <footer class="dl-footer"><a href="https://dliu.com">dliu.com</a></footer>
</body>
```

| Class | What |
| --- | --- |
| `dl-page` | On `<body>`: header on top, main fills the screen, footer at the bottom |
| `dl-header`, `dl-logo`, `dl-brand`, `dl-nav` | The menu bar: DL icon (links to dliu.com), site name (links to the site's home), links and buttons on the right |
| `dl-nav-link` | Plain text link in the menu bar; `aria-current="page"` marks the current page |
| `dl-button` + `dl-button-primary`, `dl-button-danger`, `dl-button-small`, `dl-button-link` | Buttons (on `<a>` or `<button>`); `aria-current` on a `dl-button` marks the current page |
| `dl-signin` | The header's Sign in button (with `dl-button`) |
| `dl-ms-signin` | Full "Sign in with Microsoft" button, following [Microsoft's branding guidelines](https://learn.microsoft.com/entra/identity-platform/howto-add-branding-in-apps) |
| `dl-account` | Signed-in name next to Sign out |
| `dl-main` (+ `dl-narrow`), `dl-footer` | Page width (1280 px, or 760 px) and footer |
| `dl-panel`, `dl-muted`, `dl-error`, `dl-success`, `dl-visually-hidden` | Content helpers |

Colours, radii and fonts are CSS variables (`--dl-accent`, `--dl-text`, `--dl-muted`, `--dl-line`, `--dl-panel`, …); a site's
own CSS should use them instead of its own colours. `dl.css` also gives plain elements (body, links, headings, text fields)
the shared look, with no specificity, so any site rule still wins.

### Content Security Policy

A site with a CSP must allow the shared files:

```
style-src 'self' https://files.dliu.com/dliu.com/ui/
img-src   'self' https://files.dliu.com/dliu.com/
```

Allow only these paths, not all of `https://files.dliu.com`. No JavaScript is shared, so `script-src` stays unchanged.

## Changing it

- `v1` only gains things (new classes, fixes). Every site picks a change up within 5 minutes, so check
  [demo.html](https://files.dliu.com/dliu.com/ui/v1/demo.html) and the sites after publishing.
- A change that could break an existing page (renaming or removing a class, a different layout) goes into a new `ui/v2/`,
  and sites move over one at a time.

## Publishing

Requires Node.js 22+, AWS CLI access to the `FileServer` stack outputs (eu-west-1), and a Microsoft access token saved with
**Save file** at https://auth.dliu.com (`~/.dliu_token`) for an account that may use the Files API (`files.write`).

```sh
make check     # lists files that differ from what is published
make publish   # uploads only those files
```

`FILES_API_URL` can be set instead of reading the stack output. The script never prints the token or the presigned URLs.

## Sites using it

| Site | Since |
| --- | --- |
