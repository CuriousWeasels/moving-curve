---
title: How much of a DCF is just the terminal value?
dek: In a plain five-year model, roughly three quarters of enterprise value sits in one cell. Here is the arithmetic, the sensitivity, and what it means for how much to trust the answer.
date: 2026-10-20
tags:
  - Valuation
  - DCF
model_file: /files/models/sample-dcf-terminal-value.xlsx
model_label: Sample DCF, terminal value sensitivity (.xlsx)
model_note: Five-year FCF build, Gordon-growth terminal value and a WACC × g sensitivity grid. Inputs in blue.
---

<p class="callout-sample">Sample piece shipped with the site to show what a post can hold: a data chart, a pasted table, a footnote and a downloadable model. Replace it with your own work or delete it in the admin panel.</p>

Open almost any discounted cash flow model and look at where the value comes from. The explicit forecast, the five years of revenue, margins and capex that take the most work to build, usually accounts for a minority of the answer. The rest comes from a single line: the terminal value.

That is not a flaw in the method so much as a property of it. A business that lasts decades is worth mostly what it earns after year five. But it does mean the two assumptions that drive the terminal value, the long-run growth rate and the discount rate, deserve more scrutiny than they usually get.

## The setup

Take a simple company: free cash flow of 100 next year, growing 6% a year for five years, then growing at a constant rate *g* forever. Discount everything at the weighted average cost of capital.[^wacc]

At a 9% WACC and 3% terminal growth, the five years of explicit cash flow are worth about 434 today. The terminal value, discounted back, is worth about 1,409. Enterprise value is 1,843, and **76% of it is terminal value**.

## How the share moves

The chart below holds the explicit forecast fixed and varies only the two terminal assumptions. Across any reasonable range, the terminal value never drops below two thirds of the total.

```chart
type: line
title: Terminal value as a share of enterprise value
subtitle: By terminal growth rate, at three discount rates
suffix: %
decimals: 1
source: Author's model (illustrative)
---
Terminal growth, WACC 8%, WACC 9%, WACC 10%
1.5%, 75.0, 71.9, 68.9
2.0%, 76.6, 73.4, 70.3
2.5%, 78.2, 74.9, 71.7
3.0%, 79.9, 76.4, 73.2
3.5%, 81.6, 78.1, 74.7
4.0%, 83.4, 79.7, 76.3
```

The share rises with growth and falls with the discount rate, which is intuitive. What is less intuitive is how large the swings in *value* are, because both assumptions work through the spread between them.

## The sensitivity that matters

```table
title: Implied enterprise value
subtitle: WACC (rows) against terminal growth (columns)
source: Author's model (illustrative)
---
WACC \ g	2.0%	2.5%	3.0%	3.5%	4.0%
8.0%	1,907	2,047	2,216	2,422	2,680
9.0%	1,630	1,728	1,843	1,978	2,141
10.0%	1,422	1,494	1,576	1,671	1,781
```

Moving one percentage point on WACC and one on growth, both well within the range two reasonable analysts might choose, takes enterprise value from about 1,420 to 2,680. That is a near-doubling from inputs nobody can observe directly.

## What to do about it

- **Cross-check the exit.** Convert the terminal value into an implied EV/EBITDA multiple and ask whether a buyer would pay it for a mature version of this business.
- **Tie growth to reinvestment.** A business can only grow forever at *g* if it reinvests enough to do so. Growth without the reinvestment to fund it is free value.
- **Show the grid, not the point.** A single DCF value implies a precision the method does not have. The sensitivity table is the honest output.

[^wacc]: WACC here is a single blended rate for simplicity. In practice, the cost of capital in the terminal period should reflect the mature capital structure, not today's.
