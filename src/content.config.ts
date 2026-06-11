import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const career = defineCollection({
  loader: file("src/data/career.json"),
  schema: z.object({
    id: z.string(),
    order: z.number(),
    company: z.string(),
    tenure: z.string().optional(),
    location: z.string().optional(),
    roles: z.array(
      z.object({
        title: z.string(),
        period: z.string(),
        location: z.string().optional(),
        description: z.array(z.string()),
        cvDescription: z.array(z.string()).optional(),
      }),
    ),
  }),
});

export const collections = { career };
