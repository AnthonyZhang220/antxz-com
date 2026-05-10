import { defineQuery } from "next-sanity";

export const postBySlugQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    "title": coalesce(titleI18n[$contentLang], titleI18n.en, title, titleI18n.zh),
    "slug": slug.current,
    "excerpt": coalesce(excerptI18n[$contentLang], excerptI18n.en, excerpt, excerptI18n.zh),
    "body": coalesce(bodyI18n[$contentLang], bodyI18n.en, body, bodyI18n.zh),
    "hasEn": select(
      defined(titleI18n.en) || defined(excerptI18n.en) || defined(bodyI18n.en) => true,
      false
    ),
    "hasZh": select(
      defined(titleI18n.zh) || defined(excerptI18n.zh) || defined(bodyI18n.zh) => true,
      false
    ),
    "originalLanguage": coalesce(
      originalLanguage,
      select(
        source.platform in ["devto", "medium"] => "en",
        // 如果只有中文 i18n，没有英文 i18n -> 中文是原文
        (defined(titleI18n.zh) || defined(excerptI18n.zh) || defined(bodyI18n.zh)) && !(defined(titleI18n.en) || defined(excerptI18n.en) || defined(bodyI18n.en)) => "zh",
        // 其他情况默认英文
        "en"
      )
    ),
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
    "title": coalesce(titleI18n[$locale], titleI18n.en, titleI18n.zh, title),
    "slug": slug.current,
    "excerpt": coalesce(excerptI18n[$locale], excerptI18n.en, excerptI18n.zh, excerpt),
    "hasEn": select(
      defined(titleI18n.en) || defined(excerptI18n.en) || defined(bodyI18n.en) => true,
      false
    ),
    "hasZh": select(
      defined(titleI18n.zh) || defined(excerptI18n.zh) || defined(bodyI18n.zh) => true,
      false
    ),
    "languageType": select(
      (defined(titleI18n.en) || defined(excerptI18n.en) || defined(bodyI18n.en)) &&
      (defined(titleI18n.zh) || defined(excerptI18n.zh) || defined(bodyI18n.zh)) => "bilingual",
      (defined(titleI18n.zh) || defined(excerptI18n.zh) || defined(bodyI18n.zh)) => "zh",
      "en"
    ),
    publishedAt,
    tags,
    "readingTime": coalesce(readingTime, 1),
    "originalLanguage": coalesce(
      originalLanguage,
      select(
        source.platform in ["devto", "medium"] => "en",
        (defined(titleI18n.zh) || defined(excerptI18n.zh) || defined(bodyI18n.zh)) && !(defined(titleI18n.en) || defined(excerptI18n.en) || defined(bodyI18n.en)) => "zh",
        "en"
      )
    ),
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

export const postsBySlugsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current) && slug.current in $slugs] {
    _id,
    "title": coalesce(titleI18n[$locale], titleI18n.en, titleI18n.zh, title),
    "slug": slug.current,
    "excerpt": coalesce(excerptI18n[$locale], excerptI18n.en, excerptI18n.zh, excerpt),
    "hasEn": select(
      defined(titleI18n.en) || defined(excerptI18n.en) || defined(bodyI18n.en) => true,
      false
    ),
    "hasZh": select(
      defined(titleI18n.zh) || defined(excerptI18n.zh) || defined(bodyI18n.zh) => true,
      false
    ),
    "languageType": select(
      (defined(titleI18n.en) || defined(excerptI18n.en) || defined(bodyI18n.en)) &&
      (defined(titleI18n.zh) || defined(excerptI18n.zh) || defined(bodyI18n.zh)) => "bilingual",
      (defined(titleI18n.zh) || defined(excerptI18n.zh) || defined(bodyI18n.zh)) => "zh",
      "en"
    ),
    publishedAt,
    tags,
    "readingTime": coalesce(readingTime, 1),
    "originalLanguage": coalesce(
      originalLanguage,
      select(
        source.platform in ["devto", "medium"] => "en",
        (defined(titleI18n.zh) || defined(excerptI18n.zh) || defined(bodyI18n.zh)) && !(defined(titleI18n.en) || defined(excerptI18n.en) || defined(bodyI18n.en)) => "zh",
        "en"
      )
    ),
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

export const aboutMeQuery = defineQuery(`
  *[_type == "aboutMe" && _id == "singleton-aboutMe"][0] {
    _id,
    headline,
    tagline,
    body,
    updatedAt,
    profileImage {
      asset,
      hotspot,
      alt,
      "url": asset->url
    }
  }
`);
