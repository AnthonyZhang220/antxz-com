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
    tags,
    coverImage {
      asset,
      hotspot,
      alt,
      "url": asset->url
    },
    category-> {
      _id,
      title,
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

export const allPostSlugsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] {
    "slug": slug.current
  }
`);
