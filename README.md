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

### Pointing your IONOS domain at it

Replace `yourdomain.com` below with your domain.

**1. DNS at IONOS.** Sign in at ionos.com → **Menu → Domains & SSL** → click the domain → **DNS**. Remove any existing **A**, **AAAA** or **CNAME** records on `@` (and on `www`) that point somewhere else, such as the default IONOS parking page or your VPS. Keep MX/TXT email records. Then add:

| Type | Host name | Points to |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | curiousweasels.github.io |

Using a subdomain instead (e.g. `blog.yourdomain.com`)? Add only one record: **CNAME**, host `blog`, pointing to `curiousweasels.github.io`.

**2. Tell GitHub.** Repository → **Settings → Pages → Custom domain** → enter `yourdomain.com` → **Save**. Once the DNS check passes (minutes to a few hours), tick **Enforce HTTPS**.

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
