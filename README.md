# dliu.com shared resources

Shared look for every dliu.com site: one stylesheet, the DL icon and the instructions for using them, served from one
place so a change here reaches every site.

**How to use it:** [public/README.md](public/README.md), published at https://files.dliu.com/dliu.com/README.md. When
building or updating a dliu.com app, point the developer or AI agent to that URL.

| File | Public URL |
| --- | --- |
| `public/README.md` | https://files.dliu.com/dliu.com/README.md (instructions for apps) |
| `public/ui/v1/dl.css` | https://files.dliu.com/dliu.com/ui/v1/dl.css (every page) |
| `public/ui/v1/dl-docs.css` | https://files.dliu.com/dliu.com/ui/v1/dl-docs.css (Docs / About pages, after dl.css) |
| `public/ui/v1/demo.html` | https://files.dliu.com/dliu.com/ui/v1/demo.html (every component on one page) |
| `public/favicon.png` | https://files.dliu.com/dliu.com/favicon.png (the DL icon, 512 × 512) |

Everything under `public/` is published to `https://files.dliu.com/dliu.com/` by
[files.dliu.com](https://github.com/dliu-com/file-server), which serves it through CloudFront. Browsers keep a copy for 5 minutes; replacing a file clears the CDN copy automatically within about a minute.

## Changing it

- `ui/v1/` only gains things (new classes, fixes). Every site picks a change up within 5 minutes, so check
  [demo.html](https://files.dliu.com/dliu.com/ui/v1/demo.html) and the sites after publishing.
- A change that could break an existing page (renaming or removing a class, a different layout) goes into a new `ui/v2/`,
  and sites move over one at a time.
- Keep `public/README.md` and `demo.html` in step with `dl.css`.

## Publishing

`dliu.com/` is a reserved path in Files: its API cannot write there, and the API's role is denied it, so no Files API
token can change the shared assets. Publishing writes straight to the Files S3 bucket with your AWS CLI credentials
(eu-west-1; needs `s3:PutObject` and `s3:GetObject` on `dliu.com/*` in the bucket and read access to the `FileServer`
stack outputs). Requires Node.js 22+ and AWS CLI v2.

```sh
make check     # lists files whose bytes, type or cache header differ from what is in S3
make publish   # writes only those files
```

- Objects get the same content type, cache header (`public, max-age=300, s-maxage=86400, …`) and storage class
  (Intelligent-Tiering) as files uploaded through Files, plus a `sha256` metadata tag used to skip unchanged files.
- Files clears CloudFront's copy of every replaced object automatically (S3 event → its clear function), usually
  within a minute; browsers may keep their copy for up to 5 minutes more.
- The bucket comes from the `FileServer` stack's `FileBucketName` output; set `FILES_BUCKET` to skip that lookup.
- Writes bypass the Files listing (`_data/files.json`), which the Files app owns.

## Checking the sites

`sites.json` lists every dliu.com site and the pages to check. `make audit` fetches them live and reports any page that
does not load `dl.css` (and `dl-docs.css` on docs pages), has no favicon, lacks the shared header (with the app's logo)
or the DL logo in the footer, or whose CSP blocks the shared files. Each app repo also has its own test for this.

```sh
make audit
```

## Sites using it

All on `ui/v1` since 2 Nov 2026; `make audit` passes for every page in `sites.json`.

| Site | Source | Logo (top left and favicon) |
| --- | --- | --- |
| [video.dliu.com](https://video.dliu.com) | dliu-com/video | own (play) |
| [blog.dliu.com](https://blog.dliu.com) | dliu-com/blog | own (lines) |
| [files.dliu.com](https://files.dliu.com) | dliu-com/file-server | own (folder) |
| [share.dliu.com](https://share.dliu.com) | dliu-com/file-sharing | own (share) |
| [traffic.dliu.com](https://traffic.dliu.com) | dliu-com/traffic-monitor | own (bar chart) |
| [plan.dliu.com](https://plan.dliu.com) | dliu-com/travel-plan | own (map pin) |
| [auth.dliu.com](https://auth.dliu.com) | dliu-com/authenticate | own (lock) |
| [weiqi.dliu.com](https://weiqi.dliu.com) | dliu-com/weiqi | own (Go stones) |
| [xiangqi.dliu.com](https://xiangqi.dliu.com) | dliu-com/xiangqi | own (象) |
| [dliu.com](https://dliu.com) | dliu-com/dliu-com | personal: DL |
| [jh.dliu.com](https://jh.dliu.com) | dliu-com/hujia | personal: DL |
| [cyy.dliu.com](https://cyy.dliu.com) | dliu-com/chenyiyu (folder `chenyiyu-master`) | personal: cake |
| link.dliu.com | local folder `link-router` | none (redirects only, no pages) |
