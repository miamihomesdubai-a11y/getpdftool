import type { MetadataRoute } from "next";

const SITE = "https://www.getpdftool.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/organise`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/merge-pdf`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/rotate-pdf`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/add-pdf-pages`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/delete-pdf-pages`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/copy-pdf-pages`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/compress-pdf`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/sign-pdf`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/watermark-pdf`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/pdf-to-word`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${SITE}/pdf-to-excel`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${SITE}/pdf-to-powerpoint`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${SITE}/pdf-to-text`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/pdf-to-jpg`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/word-to-pdf`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${SITE}/excel-to-pdf`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${SITE}/jpeg-to-pdf`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/html-to-pdf`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
