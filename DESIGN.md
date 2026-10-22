---
name: Moving Curve
description: A single author's working notebook of investment analysis, set as a clean independent finance publication.
colors:
  paper: "#ffffff"
  paper-2: "#f6f7f8"
  ink: "#15171a"
  ink-2: "#464b53"
  muted: "#6a7079"
  rule: "#e4e6e9"
  rule-2: "#cfd3d8"
  ledger-blue: "#1d5cc0"
  ledger-blue-deep: "#164a9c"
  ledger-wash: "#dce8fa"
  selection: "#cfe0f8"
  series-2-copper: "#c8602e"
  series-3-aqua: "#1a9a6c"
  series-4-ochre: "#d39200"
  series-5-magenta: "#c9577f"
  waterfall-total: "#5b6169"
typography:
  display:
    fontFamily: "'Source Serif 4 Variable', 'Source Serif Pro', Georgia, serif"
    fontSize: "clamp(2.15rem, 1.3rem + 2.9vw, 3.2rem)"
    fontWeight: 690
    lineHeight: 1.07
    letterSpacing: "-0.022em"
  headline:
    fontFamily: "'Source Serif 4 Variable', 'Source Serif Pro', Georgia, serif"
    fontSize: "clamp(2rem, 1.35rem + 2.4vw, 2.9rem)"
    fontWeight: 680
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Source Serif 4 Variable', 'Source Serif Pro', Georgia, serif"
    fontSize: "1.6rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.012em"
  feed-title:
    fontFamily: "'Source Serif 4 Variable', 'Source Serif Pro', Georgia, serif"
    fontSize: "1.3125rem"
    fontWeight: 640
    lineHeight: 1.25
    letterSpacing: "-0.012em"
  dek:
    fontFamily: "'Source Serif 4 Variable', 'Source Serif Pro', Georgia, serif"
    fontSize: "clamp(1.2rem, 1.1rem + 0.4vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "'Source Serif 4 Variable', 'Source Serif Pro', Georgia, serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.65
    fontVariation: "'opsz' auto"
  ui:
    fontFamily: "'Inter Variable', Inter, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1
  label:
    fontFamily: "'Inter Variable', Inter, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum'"
  table:
    fontFamily: "'Inter Variable', Inter, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "'tnum', 'lnum'"
  caption:
    fontFamily: "'Inter Variable', Inter, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  hairline: "2px"
  code: "4px"
  panel: "6px"
spacing:
  measure: "42.5rem"
  gutter: "clamp(1rem, 4vw, 2.5rem)"
  header-height: "4.5rem"
  feed-row: "1.35rem"
  exhibit-block: "2.4em"
  footer-gap: "6rem"
components:
  link:
    textColor: "{colors.ledger-blue}"
  link-hover:
    textColor: "{colors.ledger-blue-deep}"
  nav-link:
    textColor: "{colors.ink-2}"
    typography: "{typography.ui}"
    padding: "0.5rem 0"
  nav-link-active:
    textColor: "{colors.ink}"
  action-link:
    textColor: "{colors.ledger-blue}"
    typography: "{typography.ui}"
  feed-row:
    padding: "1.35rem 0"
  model-row:
    padding: "0.9rem 0"
  chart-tooltip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "0.45rem 0.6rem"
  code-inline:
    backgroundColor: "{colors.paper-2}"
    rounded: "{rounded.code}"
    padding: "0.12em 0.35em"
---

# Design System: Moving Curve

## Overview

**Creative North Star: "The Analyst's Broadsheet"**

Moving Curve is the independent single-author finance newsletter played straight, at the craft level of the Collaborative Fund blog and Net Interest. It does not wear a costume; it earns distinction through typographic precision. A serif reading face carries titles and body at a real measure; a workhorse sans carries everything that is apparatus (meta, navigation, tables, chart text, captions). Numbers are always tabular.

The page is white paper, near-black ink, hairline rules and one deep blue. That blue is both the link colour and the first chart series, so the reader learns one signal: blue is the author's line of argument, in prose and in data. Structure is drawn with rules, never with boxes: the feed is ruled rows, the model attachment is a ruled row, tables are ruled ledgers, the contents rail is a single left rule. The site is light only: white paper for every reader, whatever their device setting.

Charts, pasted tables, captioned images and captioned Markdown tables are one family: numbered exhibits with a single caption style, a source line, and accessible data behind every chart. The confirmed rejection is the off-the-shelf blog theme: stock card grids, hero banners, Medium-style chrome.

**Key Characteristics:**
- Serif for reading, sans for apparatus, tabular figures wherever a number appears.
- One accent (ledger blue) shared by links and chart series 1.
- Hairline rules instead of cards; flat surfaces; no shadows at rest.
- Every chart, table and figure is a numbered "Exhibit N" in one shared sequence.
- Light only. The owner chose a white background for every visitor, so there is no dark theme.

## Colors

A near-monochrome paper-and-ink palette with a single deep blue, plus a validated categorical series for data.

### Primary
- **Ledger Blue** (`ledger-blue`): links, the curve mark's dot, the model icon, focus rings, and chart series 1.
- **Ledger Blue Deep** (`ledger-blue-deep`): link and headline-link hover; the "pressed further" state of the accent.
- **Ledger Wash / Selection** (`ledger-wash`, `selection`): text selection and quiet accent tint only; never a panel fill.

### Secondary (data only)
- **Copper** (`series-2-copper`), **Aqua** (`series-3-aqua`), **Ochre** (`series-4-ochre`), **Magenta** (`series-5-magenta`): chart series 2-5, in that order. Slots 6-8 (green `#008300`, violet `#6250d6`, red `#e34948`) exist as overflow; red also outlines exhibit errors. Waterfalls map increase to series 1, decrease to copper, totals to **Waterfall Grey** (`waterfall-total`).

### Neutral
- **Paper** (`paper`): page ground.
- **Paper 2** (`paper-2`): code blocks, inline code and table-row hover only.
- **Ink** (`ink`): titles, body, strong rules (table head, total row, year divider, blockquote bar, active nav underline).
- **Ink 2** (`ink-2`): deks, feed summaries, nav at rest, tag links, legend text.
- **Muted** (`muted`): dates, meta, captions, sources, ticks, list markers.
- **Rule** (`rule`): the hairline that structures everything. **Rule 2** (`rule-2`): meta separators, chart hover guide, scrollbar.

### Named Rules
**The One Blue Rule.** Ledger blue is the only accent in the interface. It marks links, the mark's dot, focus, and chart series 1; it never fills a surface or a button.

**The Validated Series Rule.** Chart slots are fixed and ordered (blue, copper, aqua, ochre, magenta). Slot 1 is always the link accent; slots 2-5 passed the dataviz validator (lightness band, chroma floor, CVD and normal-vision delta E) in both schemes. Do not substitute hues, and do not use a neutral grey ramp for series: it was tested and failed the validator.

## Typography

**Display Font:** Source Serif 4 Variable (with Source Serif Pro, Georgia, serif)
**Body Font:** Source Serif 4 Variable, optical sizing on
**Label/Mono Font:** Inter Variable (with system-ui) for apparatus; ui-monospace stack for code

**Character:** A sturdy optical-size serif that reads like a well-made print column, paired with a neutral grotesque that keeps numbers, labels and tables crisp and out of the way.

### Hierarchy
- **Display** (690, clamp 2.15-3.2rem, 1.07, -0.022em): article title only.
- **Headline** (680, clamp 2-2.9rem, 1.08, -0.02em): the lead piece on the home page; page heads (Topics, About) use a near-identical clamp(2rem, 1.4rem + 2vw, 2.75rem) at 1.1.
- **Title** (650, 1.6rem, 1.2): prose h2. Prose h3 is 1.25rem/1.3; prose h4 drops to sans 650 1rem.
- **Feed Title** (640, 1.3125rem, 1.25): one headline per feed row.
- **Dek** (400, clamp 1.2-1.375rem, 1.45, ink 2): standfirst under titles; the home lead uses 1.25rem/1.5.
- **Body** (400, 1.1875rem, 1.65; 1.25rem from 64rem viewports): prose at the measure (42.5rem on phones and tablets, 48rem from 64rem, 54rem from 100rem).
- **UI** (sans 500, 0.9375rem, 1): navigation, "Read"/"Download" action links, contact links.
- **Label** (sans 400, 0.875rem, 1.5, muted, tabular): meta lines, dates, topic row; 0.8125rem in feed rows.
- **Table** (sans 400, 0.875rem, 1.45, tabular + lining figures): all tables.
- **Caption** (sans 400, 0.8125rem, 1.5, muted): figcaptions, exhibit sub-titles, sources, notes, legends, contents rail.

### Named Rules
**The Two Voices Rule.** Serif is the author speaking (titles, deks, prose, quotes). Sans is the apparatus (meta, navigation, exhibits, tables, footnotes). Never set a chart label or table in serif, or a headline in sans.

**The Tabular Figures Rule.** Every number that can line up does: dates, meta, years, exhibit labels, ticks, values, tooltips and tables all use tabular numerals.

**The Sentence Case Rule.** Headings, labels and captions are sentence case at normal tracking. Hierarchy comes from weight and size, never from uppercase tracking.

## Layout

A single centred reading column: the measure is 42.5rem, widening to 48rem from 64rem viewports and 54rem from 100rem (the owner asked for a wider desktop column), with a fluid gutter of clamp(1rem, 4vw, 2.5rem) each side. Article pages use a three-column grid (1fr, measure, 1fr). From 90rem the "On this page" rail (13rem, sticky, only with at least three h2s) sits in the left margin and the Key data panel (17rem, sticky) in the right. Below 90rem the rail is hidden and Key data sits inline above the text, its list and estimates table side by side from 40rem and stacked on phones.

The header is a slim 4.5rem bar (mark and wordmark left, "Topics" and "About" right) above a hairline. The home page runs a short sans intro, the lead piece as a large serif headline with dek and meta above a hairline, then the feed grouped by year: each year is a sans label over an ink rule, each piece a ruled row with a 5.5rem date column and a 1.5rem gap. The footer sits 6rem below content behind a hairline.

Vertical rhythm is in ems inside prose (paragraphs 1.15em apart, h2 2.3em above, exhibits 2.4em above and below) and in rems for page structure. One breakpoint does most of the work: at 34rem and below, the feed date stacks above the title, meta separators drop, the pager stacks, wide charts swap for narrow renders, and sticky first table columns gain a right hairline.

## Elevation & Depth

The system is flat. Depth is conveyed by hairline rules, the ink-versus-rule weight contrast, and the slightly off-white Paper 2 for code and row hover. Nothing lifts at rest.

### Shadow Vocabulary
- **Chart tooltip** (`box-shadow: 0 4px 14px rgb(0 0 0 / 0.14)`): the one shadow, on the transient inverted tooltip that floats over a chart while hovering a mark.

### Named Rules
**The Ruled Page Rule.** No cards, no panels, no shadows. Group with a hairline above and below; separate with whitespace. The active nav underline and active topic underline are 1.5px ink rules drawn with an inset box-shadow, which is a rule, not elevation.

## Shapes

Square-cornered and drawn with 1px lines. Radii are small and functional: 2px on images, covers, legend swatches and the focus ring; 4px on inline code and the skip link; 6px on code blocks, the chart tooltip and the exhibit error box. Rules come in two weights: the light hairline (`rule`) for row separators and section breaks, and the ink rule for emphasis (table header underline, total-row top rule, year divider, blockquote bar). Icons are one stroke set on a 24px grid, 1.6 stroke, round caps and joins. The brand mark is an authored compounding curve in ink ending in a blue dot.

## Components

### Links
- **Inline:** ledger blue, 1px underline at 0.18em offset in 40% blue; on hover the text deepens to Ledger Blue Deep and the underline goes solid. Transitions 160ms on the house ease-out.
- **Headline links** (lead, feed, pager): inherit ink, no underline, turn Ledger Blue Deep on hover.
- **Action links** ("Read the piece", "Download model"): sans 600 0.9375rem with a trailing stroke icon that nudges 3px (arrow) or 2px down (download) on hover over 200ms.
- **Focus:** 2px ledger blue outline, 3px offset, 2px radius, everywhere.

### Navigation
- **Header nav:** sans 500 0.9375rem, ink 2 at rest, ink on hover; the current page gets ink text and a 1.5px ink underline. Labels are "Topics" (matching the /topics route) and "About".
- **Topic row:** sans 0.875rem "Topics:" lead-in followed by tag links in ink 2; the current tag is ink, 600, with the same 1.5px underline.
- **On this page rail:** sans 0.8125rem, a 1px left rule; items muted, the active section ink with an ink left rule segment.
- **Pager:** two columns, muted sans "Previous"/"Next" over a 600 serif title.

### Feed Row
A dated, ruled row: tabular date in a 5.5rem left column, serif feed title, ink 2 summary, then a 0.8125rem meta line (read time, tags, model flag). Hairline below each row; year groups are headed by a 650 sans year over an ink rule.

### Meta Line
Sans 0.875rem muted tabular figures, items separated by Rule 2 dots that vanish on narrow screens. The model flag is ink 2 sans 500 with a small ledger-blue sheet icon.

### Model Attachment Row (signature)
A ruled row, not a card: a hairline above and below, the sheet icon in blue, the model name in sans 600 ink, a muted note beneath, and a right-aligned "Download" action link. It wraps to two lines on narrow screens.

### Exhibits (signature)
- **Numbering:** charts, pasted tables, captioned images and Markdown tables captioned "Table: ..." share one sequence, "Exhibit N".
- **Caption:** sans 0.9375rem; "Exhibit N" at 650 tabular, title at 500, optional muted sub-title beneath. Image exhibits caption below at 0.875rem. Source and note lines are muted 0.8125rem.
- **Charts:** inline SVG in sans. Gridlines are hairlines, axes muted, ticks muted tabular, values ink 2 600. Lines are 2px with round joins; dots carry a paper-coloured 2px halo. Any chart with two or more series carries a legend (squares for bars, short strokes for lines) so identity never depends on colour alone; wide line charts with 2-4 series also get direct end labels when they do not collide. Hovering a mark dims the others to 45% and shows the inverted tooltip. Every chart has a role="img" label and a "View data" disclosure with the full table. Below 34rem a separate narrow render replaces the wide one.
- **Tables:** sans 0.875rem with tabular lining figures; header bottom-aligned 600 ink over an ink rule; body rows separated by hairlines; numeric columns right-aligned and unwrapped; the first column sticks during horizontal scroll. Rows labelled "Total" (Markdown) or prefixed "=" (pasted) get a 650 total row with an ink rule above. Rows tint to Paper 2 on hover.

### Code
Inline code on Paper 2 at 0.86em with a 4px radius; code blocks on Paper 2 with a hairline border and 6px radius.

### Blockquote
Serif italic in ink 2 behind a 1px ink left rule, 1.25rem indent.

### Motion
One ease-out curve, cubic-bezier(0.23, 1, 0.32, 1), at 120-200ms for state changes. Cross-document view transitions morph a piece's title from its feed row into the article heading (280ms). Reduced motion disables view transitions and collapses all transitions.

## Do's and Don'ts

### Do:
- **Do** set reading text in the serif at 1.1875rem/1.65 (1.25rem on desktop) inside the measure.
- **Do** set every number in tabular figures, and right-align numeric table columns.
- **Do** separate content with 1px hairlines (`rule`) and reserve the ink rule for headers, totals and year dividers.
- **Do** caption every chart, data table and figure as a numbered "Exhibit N" in the shared sequence, with a source line where the data has one.
- **Do** use chart slots in their fixed order, with slot 1 equal to the link accent in each scheme.
- **Do** give any chart with two or more series a legend, and add direct end labels on wide line charts only when they do not collide.
- **Do** give every chart a text label and a "View data" table.
- **Don't** add a dark theme back without the owner asking; the white page is a deliberate choice.

### Don't:
- **Don't** use cards, panels or tiles to group content; use a ruled row.
- **Don't** add shadows; the transient chart tooltip is the only exception.
- **Don't** introduce a second accent colour in the interface, or fill buttons or surfaces with ledger blue.
- **Don't** replace the validated series hues or use a neutral grey ramp for chart series.
- **Don't** add uppercase tracked labels, eyebrows or kickers above headings.
- **Don't** set tables, chart labels or meta in the serif.
- **Don't** reach for the off-the-shelf blog theme: stock card grids, hero banners, Medium-style chrome.
