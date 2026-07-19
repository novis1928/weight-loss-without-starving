import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/blog",
  }),

  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),

    author: z.string().default("George Novák"),

    category: z.enum([
      "Weight Loss Basics",
      "Nutrition",
      "Healthy Habits",
      "Motivation",
      "Exercise",
      "Recipes",
    ]),

    readingTime: z.string(),

    featured: z.boolean().default(false),
    draft: z.boolean().default(false),

    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),

    image: z.string().optional(),
    imageAlt: z.string().optional(),

    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  blog,
};