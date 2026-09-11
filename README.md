# ÏMAM — Days Before Reincarnation: Web Comic

A static, mobile-first comic reader for the 24-page Issue One.

## What is included
- 24 optimized WebP pages
- Swipe/tap/keyboard page navigation
- Page slider and thumbnail browser
- Optional vertical-scroll reading mode
- Fullscreen and share controls
- Downloadable PDF
- No server, database, account, or payment required

## Publish free with GitHub Pages
1. Create a free GitHub account if you do not already have one.
2. Create a new public repository, e.g. `imam-comic`.
3. Upload everything **inside this folder** to the repository root.
4. Open the repository **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select `main` and `/ (root)`, then save.
7. GitHub will show your public URL after deployment.

Readers do not need a GitHub account.

## Publish free with Cloudflare Pages
1. Create a free Cloudflare account.
2. Open **Workers & Pages → Create → Pages**.
3. Choose direct upload (or connect the GitHub repository).
4. Upload this site's files. There is no build command.
5. Cloudflare gives you a public `*.pages.dev` URL.

## Custom domain later
A custom domain can be connected later without changing the comic site.

## Local preview
Run a simple web server in this folder, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes
- Keep the `assets` folder structure unchanged.
- `index.html` is the home page.
- The PDF download is in `assets/IMAM_Days_Before_Reincarnation_Issue_One.pdf`.
