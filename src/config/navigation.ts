// src/config/navigation.ts
// defined the navigation configuration for the website, which can be used in the Navbar component and other places where navigation links are needed.
export const navigationConfig = [
  { key: "home",        href: "/" },
  { key: "about",       href: "/about/me" },
  { key: "projects",    href: "/projects" },
  { key: "blog",        href: "/blog" },
  { key: "mbti",        href: "/mbti" },
  { key: "interaction", href: "/interaction" },
] as const;

export type NavKey = typeof navigationConfig[number]["key"];