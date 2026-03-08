import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: file("src/data/projects.json"),
  schema: z.object({
    id: z.string(),
    order: z.number(),
    title: z.string(),
    type: z.string(),
    typeColor: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    url: z.string().optional(),
  }),
});

const experiences = defineCollection({
  loader: file("src/data/experiences.json"),
  schema: z.object({
    id: z.string(),
    order: z.number(),
    company: z.string(),
    tenure: z.string().optional(),
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

export const collections = { projects, experiences };
