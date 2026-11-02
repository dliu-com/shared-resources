# dliu.com shared resources

Shared look for every dliu.com site: one stylesheet, the DL icon and the instructions for using them, served from one
place so a change here reaches every site.

**How to use it:** [public/README.md](public/README.md), published at https://files.dliu.com/dliu.com/README.md. When
building or updating a dliu.com app, point the developer or AI agent to that URL.

| File | Public URL |
| --- | --- |
| `public/README.md` | https://files.dliu.com/dliu.com/README.md (instructions for apps) |
| `public/ui/v1/dl.css` | https://files.dliu.com/dliu.com/ui/v1/dl.css |
| `public/ui/v1/demo.html` | https://files.dliu.com/dliu.com/ui/v1/demo.html (every component on one page) |
| `public/favicon.png` | https://files.dliu.com/dliu.com/favicon.png (the DL icon, 512 × 512) |

Everything under `public/` is published to `https://files.dliu.com/dliu.com/` by
[files.dliu.com](https://github.com/dliu-com/file-server), which serves it from CloudFront with a 5-minute cache.

## Changing it

- `ui/v1/` only gains things (new classes, fixes). Every site picks a change up within 5 minutes, so check
  [demo.html](https://files.dliu.com/dliu.com/ui/v1/demo.html) and the sites after publishing.
- A change that could break an existing page (renaming or removing a class, a different layout) goes into a new `ui/v2/`,
  and sites move over one at a time.
- Keep `public/README.md` and `demo.html` in step with `dl.css`.

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
| [video.dliu.com](https://video.dliu.com) ([dliu-com/video](https://github.com/dliu-com/video)) | v1, 2 Nov 2026 (pilot) |
