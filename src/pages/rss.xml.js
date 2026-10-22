import rss from '@astrojs/rss';
import site from '../data/site.json';
import { getPieces, pieceUrl } from '../lib/pieces';

export async function GET(context) {
  const pieces = await getPieces();
  return rss({
    title: site.title,
    description: site.description,
    site: context.site,
    items: pieces.map((p) => ({
      title: p.data.title,
      description: p.data.dek,
      pubDate: p.data.date,
      link: pieceUrl(p),
      categories: p.data.tags,
    })),
  });
}
