// Custom editor blocks for the Moving Curve admin panel.
// Both write a fenced block (```chart / ```table) that the site turns into a numbered exhibit.

(function () {
  const OPTION_KEYS = ['type', 'title', 'subtitle', 'prefix', 'suffix', 'decimals', 'marker', 'marker_label', 'base', 'source', 'note'];

  function parse(body) {
    const lines = body.replace(/\r/g, '').split('\n');
    const sep = lines.findIndex((l) => /^\s*-{3,}\s*$/.test(l));
    const out = {};
    const head = sep === -1 ? [] : lines.slice(0, sep);
    for (const l of head) {
      const m = l.match(/^\s*([a-zA-Z_]+)\s*:\s*(.*)$/);
      if (m) out[m[1].toLowerCase()] = m[2].trim();
    }
    out.data = (sep === -1 ? lines : lines.slice(sep + 1)).join('\n').trim();
    return out;
  }

  function build(lang, data) {
    const head = OPTION_KEYS.filter((k) => data[k] !== undefined && String(data[k]).trim() !== '')
      .map((k) => `${k}: ${String(data[k]).replace(/\n/g, ' ').trim()}`);
    const rows = String(data.data || '').replace(/\r/g, '').trim();
    return '```' + lang + '\n' + head.join('\n') + '\n---\n' + rows + '\n```';
  }

  function preview(label, data) {
    const rows = String(data.data || '').trim().split('\n');
    const shown = rows.slice(0, 6).join('\n') + (rows.length > 6 ? `\n… ${rows.length - 6} more rows` : '');
    const title = data.title ? `: ${data.title}` : '';
    return `**${label}${title}**\n\n\`\`\`\n${shown || '(no data yet)'}\n\`\`\``;
  }

  const dataHint =
    'First row: column headers (first column is the category, e.g. Year; the others are series). ' +
    'Paste straight from Excel (tab-separated) or type comma-separated values. ' +
    'Numbers can include $, %, commas or (brackets) for negatives.';

  CMS.registerEditorComponent({
    id: 'chart',
    label: 'Data chart',
    icon: 'bar_chart',
    fields: [
      {
        name: 'type',
        label: 'Chart type',
        widget: 'select',
        default: 'bar',
        options: [
          { label: 'Columns (compare values over time or across groups)', value: 'bar' },
          { label: 'Line (trends over time)', value: 'line' },
          { label: 'Stacked columns (parts of a total)', value: 'stacked' },
          { label: 'Horizontal bars (ranking, e.g. trading comps)', value: 'barh' },
          { label: 'Waterfall (bridges, e.g. EV to equity, value creation)', value: 'waterfall' },
          { label: 'Range / football field (valuation summary)', value: 'range' },
        ],
      },
      { name: 'title', label: 'Title', widget: 'string', required: false },
      { name: 'subtitle', label: 'Subtitle', widget: 'string', required: false, hint: 'Units or context, e.g. “$bn, fiscal years”.' },
      { name: 'prefix', label: 'Number prefix', widget: 'string', required: false, hint: 'e.g. $' },
      { name: 'suffix', label: 'Number suffix', widget: 'string', required: false, hint: 'e.g. %, x, bn, m' },
      { name: 'decimals', label: 'Decimal places', widget: 'number', required: false, value_type: 'int', min: 0, max: 4 },
      { name: 'marker', label: 'Reference line (range charts)', widget: 'string', required: false, hint: 'A value to draw as a dashed line, e.g. the current share price 35.33.' },
      { name: 'marker_label', label: 'Reference line label', widget: 'string', required: false, hint: 'e.g. Share price (20 Oct 2026)' },
      { name: 'source', label: 'Source', widget: 'string', required: false, hint: 'e.g. Company filings, author analysis' },
      {
        name: 'data',
        label: 'Data',
        widget: 'text',
        hint:
          dataHint +
          ' Waterfall: one value column; start a row label with = to show a running total (e.g. “= Equity value”) and leave its value blank.' +
          ' Range: columns Method, Low, Mid, High; a row with only a label (or starting with #) is a group heading.',
      },
    ],
    pattern: /^```chart\n([\s\S]*?)\n```$/m,
    fromBlock: (match) => parse(match[1]),
    toBlock: (data) => build('chart', data),
    toPreview: (data) => preview('Data chart', data),
  });

  CMS.registerEditorComponent({
    id: 'datatable',
    label: 'Table from Excel',
    icon: 'table_view',
    fields: [
      { name: 'title', label: 'Title', widget: 'string', required: false, hint: 'Start with your own label to keep it, e.g. “Table 2: My model vs consensus”; otherwise it is numbered as an exhibit.' },
      { name: 'subtitle', label: 'Subtitle', widget: 'string', required: false },
      { name: 'base', label: 'Highlight base case', widget: 'string', required: false, hint: 'Row label | column header of the cell to highlight, e.g. 8.0x | 11.1%' },
      { name: 'source', label: 'Source', widget: 'string', required: false },
      {
        name: 'data',
        label: 'Cells',
        widget: 'text',
        hint: 'Copy cells in Excel and paste here. The first row is the header. Start a row with = to style it as a total.',
      },
    ],
    pattern: /^```table\n([\s\S]*?)\n```$/m,
    fromBlock: (match) => parse(match[1]),
    toBlock: (data) => build('table', data),
    toPreview: (data) => preview('Table', data),
  });
})();
