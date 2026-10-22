import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Each piece lives in its own folder: src/content/pieces/<slug>/index.md,
// with its images saved next to it by the admin panel.
const pieces = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/pieces', generateId: ({ entry }) => entry.replace(/\/index\.md$/, '') }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      dek: z.string().optional(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      cover_alt: z.string().optional(),
      cover_caption: z.string().optional(),
      model_file: z.string().optional(),
      model_label: z.string().optional(),
      model_note: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    dek: z.string().optional(),
  }),
});

export const collections = { pieces, pages };
