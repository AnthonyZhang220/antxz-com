import { defineQuery } from "next-sanity";

export const postBySlugQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    body,
    publishedAt,
    _updatedAt,
    "readingTime": coalesce(readingTime, 1),
    tags,
    source {
      platform,
      originalUrl
    },
    coverImage {
      asset,
      hotspot,
      alt,
      "url": asset->url
    },
    category-> {
      _id,
      "title": coalesce(title[$locale], title.en, title.zh, title),
      "slug": slug.current
    },
    author-> {
      _id,
      name,
      bio,
      avatar {
        asset,
        "url": asset->url
      }
    }
  }
`);

export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    tags,
    "readingTime": coalesce(readingTime, 1),
    source {
      platform,
      originalUrl
    },
    coverImage {
      asset,
      hotspot,
      alt,
      "url": asset->url
    },
    category-> {
      _id,
      "title": coalesce(title[$locale], title.en, title.zh, title),
      "slug": slug.current
    }
  }
`);

export const allPostSlugsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] {
    "slug": slug.current
  }
`);

export const allProjectsQuery = defineQuery(`
  *[_type == "project"] | order(coalesce(sortOrder, 999999) asc, coalesce(publishedAt, _createdAt) desc) {
    _id,
    title,
    subtitle,
    introduction,
    overview,
    "slug": slug.current,
    roles,
    features,
    libraries,
    tags,
    process,
    challenges,
    results,
    "websiteUrl": url,
    "githubUrl": github,
    isNew,
    featured,
    publishedAt,
    coverImage {
      asset,
      hotspot,
      alt,
      "url": asset->url
    },
    screenshots[] {
      asset,
      hotspot,
      alt,
      "url": asset->url
    },
    body
  }
`);

export const projectBySlugQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    subtitle,
    introduction,
    overview,
    "slug": slug.current,
    roles,
    features,
    libraries,
    tags,
    process,
    challenges,
    results,
    "websiteUrl": url,
    "githubUrl": github,
    isNew,
    featured,
    publishedAt,
    coverImage {
      asset,
      hotspot,
      alt,
      "url": asset->url
    },
    screenshots[] {
      asset,
      hotspot,
      alt,
      "url": asset->url
    },
    body
  }
`);

export const allProjectSlugsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current)] {
    "slug": slug.current
  }
`);
