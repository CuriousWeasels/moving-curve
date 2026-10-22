# Moving Curve

A personal publication for investment writing and financial models. Static site built with [Astro](https://astro.build), edited through a browser admin panel ([Sveltia CMS](https://sveltiacms.app)).

## Run it on your computer

```bash
npm install
npm run dev
```

- Site: <http://localhost:4321>
- Admin panel: <http://localhost:4321/admin/index.html> (use Chrome or Edge), then click **Work with Local Repository** and select this folder. Saves go straight into the project files.

## Publishing a piece

1. Admin panel → **Writing** → **New Piece**.
2. Fill in the title, a one or two sentence summary, the date and topics.
3. Write the body. The toolbar covers headings, bold/italic, lists, quotes, links, images and tables.
4. **Images** (charts exported from Excel, screenshots): use the image button. Write a *title* on the image and it becomes a numbered caption (“Exhibit 2 …”). Always fill in the alt text.
5. **Data charts**: Insert → **Data chart**. Pick a type (columns, line, stacked, horizontal bars, waterfall), then paste the numbers: copy the cells from Excel, header row included, and paste them into *Data*. The site draws the chart in its own style, adds a hover tooltip and a “View data” table, and numbers it as an exhibit.
6. **Tables**: either the table button (type cell by cell) or Insert → **Table from Excel** (paste cells straight from Excel). Number columns are right-aligned automatically. Start a row label with `=` to style it as a total row.
7. **Model file**: attach the `.xlsx` in *Model file*. Readers get a download card at the top of the piece, and the piece is flagged “Model included” in the feed.
8. Tick **Draft** to keep a piece off the live site while you work on it.

### Writing charts by hand (raw Markdown)

````markdown
```chart
type: bar            # bar | line | stacked | barh | waterfall
title: Revenue by year
subtitle: $bn, fiscal years
prefix: $
suffix: bn
decimals: 1
source: Company filings
---
Year, Revenue
2023, 12.4
2024, 13.9
```
````

Waterfall: one value column. The first row is the starting bar; a row whose label starts with `=` (value left blank) shows the running total, e.g. `= Equity value,`.

## Replace the samples

The three pieces in `src/content/pieces/` are samples that show each feature. Delete them in the admin panel once you have your own. Also update:

- **Settings → Site settings**: contact email, LinkedIn, disclaimer.
- **Pages → About**: your bio.
- `public/admin/config.yml`: `site_url` / `display_url` once your domain is live.

## How it's hosted

The code lives at [github.com/CuriousWeasels/moving-curve](https://github.com/CuriousWeasels/moving-curve). Every push to `main`, including every save from the online admin panel, runs `.github/workflows/deploy.yml`, which builds the site and publishes it on **GitHub Pages** (free). Progress shows under the repository's **Actions** tab; a publish takes about a minute.

Until a custom domain is set, the site lives at <https://curiousweasels.github.io/moving-curve/>.

### Pointing your Cloudflare domain at it

The domain is registered at Cloudflare, so its DNS is managed there. Replace `yourdomain.com` below with your domain.

**1. DNS at Cloudflare.** Sign in at dash.cloudflare.com → click the domain → **DNS → Records**. Delete any existing **A**, **AAAA** or **CNAME** records on the root (`@` / `yourdomain.com`) and on `www` that point somewhere else. Keep MX/TXT email records. Then **Add record** for each row, with **Proxy status set to “DNS only” (grey cloud)**:

| Type | Name | Content | Proxy |
| --- | --- | --- | --- |
| CNAME | @ | curiousweasels.github.io | DNS only |
| CNAME | www | curiousweasels.github.io | DNS only |

Cloudflare allows a CNAME on the root domain (it “flattens” it), so these two records are all you need. Using a subdomain instead (e.g. `blog.yourdomain.com`)? Add just one record: **CNAME**, name `blog`, content `curiousweasels.github.io`, DNS only.

Why grey cloud: GitHub has to see your domain directly to issue its free HTTPS certificate. Once HTTPS works (step 2), you can switch the records to **Proxied** (orange cloud) for Cloudflare's CDN; if you do, set **SSL/TLS → Overview → Full** first, or the site will loop on redirects.

**2. Tell GitHub.** Repository → **Settings → Pages → Custom domain** → enter `yourdomain.com` → **Save**. Once the DNS check passes (usually minutes), tick **Enforce HTTPS**.

**3. Tell the build.** Repository → **Settings → Secrets and variables → Actions → Variables → New repository variable**: name `CUSTOM_DOMAIN`, value `yourdomain.com`. Then **Actions → Deploy to GitHub Pages → Run workflow**. The site now builds for your domain's root.

**4. Optional but recommended:** verify the domain under your GitHub account **Settings → Pages → Add a domain**, so nobody else can claim it on GitHub.

### Using the admin panel online

Open `https://yourdomain.com/admin/` and choose **Sign In Using Access Token**. Create the token at GitHub → **Settings → Developer settings → Fine-grained tokens**: repository access *Only select repositories → moving-curve*, permission *Contents: Read and write*. Treat it like a password. For a “Sign in with GitHub” button instead, follow Sveltia's [GitHub backend guide](https://sveltiacms.app/en/docs/backends/github).

## Project map

| Path | What it is |
| --- | --- |
| `src/content/pieces/<slug>/index.md` | Each piece, with its images beside it |
| `public/files/models/` | Uploaded model files |
| `src/data/site.json` | Site name, description, contact links, disclaimer |
| `src/content/pages/about.md` | About page |
| `src/lib/exhibits.mjs` | Turns chart/table blocks into numbered exhibits |
| `src/styles/global.css` | All styling (light and dark themes) |
| `public/admin/` | Admin panel configuration and custom blocks |
