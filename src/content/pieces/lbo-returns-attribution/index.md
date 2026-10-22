---
title: Where an LBO's return actually comes from
dek: A simple buyout, taken apart into the three engines of private equity returns. Debt paydown does more work than most people expect, and multiple expansion less.
date: 2026-09-28
tags:
  - LBO
  - Private equity
---

<p class="callout-sample">Sample piece shipped with the site. It shows a waterfall chart, a bar chart and a Markdown table. Replace it with your own work or delete it in the admin panel.</p>

A sponsor buys a business for ten times EBITDA, funds it 60% with debt, and sells five years later. The headline return is easy to compute. The more useful question is *why* it was earned, because each source of return carries a different kind of risk.

## The deal

Table: Sources and uses at entry

| | $m | x EBITDA |
| --- | ---: | ---: |
| *Sources* | | |
| Senior debt | 600 | 6.0x |
| Sponsor equity | 400 | 4.0x |
| **Total sources** | **1,000** | **10.0x** |
| *Uses* | | |
| Enterprise value (purchase price) | 1,000 | 10.0x |
| **Total uses** | **1,000** | **10.0x** |

For simplicity the business is bought cash-free and debt-free, and fees are ignored.

Over five years, EBITDA grows from 100 to 140, the business pays down debt from 600 to 380, and the sponsor exits at 10.5x.

## Splitting the return

Exit enterprise value is 1,470. Less 380 of net debt, the equity is worth 1,090: a 2.7x multiple of money and roughly a 22% IRR. The waterfall shows where the 690 of gain came from.

```chart
type: waterfall
title: Sponsor equity value bridge, entry to exit
prefix: $
suffix: m
decimals: 0
source: Author's illustrative model
---
Step, Value
Entry equity, 400
EBITDA growth, 400
Multiple expansion, 70
Debt paydown, 220
= Exit equity,
```

EBITDA growth is the largest piece: 40 of extra EBITDA, valued at the entry multiple. Multiple expansion contributes only 70, because half a turn on 140 of EBITDA is not much. Debt paydown, 220, is a third of the gain and comes purely from the business's own cash flow.

## Deleveraging is the quiet engine

```chart
type: bar
title: Net debt / EBITDA
suffix: x
decimals: 1
source: Author's illustrative model
---
Year, Leverage
Entry, 6.0
Year 1, 5.1
Year 2, 4.4
Year 3, 3.7
Year 4, 3.2
Exit, 2.7
```

Leverage falls by more than half without any heroics. That is the part of the return a sponsor controls most directly, and it is also the part that disappears if cash flow disappoints, which is why lenders care about it as much as equity does.
