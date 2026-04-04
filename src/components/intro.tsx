"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Intro() {
  const t = useTranslations("home");

  return (
    <section id="intro" className="relative w-full scroll-mt-24 overflow-hidden py-24">
      <div className="absolute inset-0 bg-linear-to-b from-zinc-100 to-zinc-50 dark:from-slate-900 dark:to-slate-950" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.08),transparent_50%),radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_bottom_right,rgba(134,239,172,0.1),transparent_50%),radial-gradient(ellipse_at_top_left,rgba(96,165,250,0.1),transparent_50%)]" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,320px)_1fr]">
          <div className="mx-auto w-full max-w-xs sm:max-w-sm">
            <div className="group relative h-96 w-full">
              {/* Soft glow aura */}
              <div className="absolute -inset-6 rounded-3xl bg-linear-to-br from-blue-400/20 via-transparent to-green-400/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-blue-500/15 dark:to-green-500/15" />
              {/* Image with very soft fade edges */}
              <div className="relative h-full w-full overflow-hidden rounded-3xl transition-all duration-300 group-hover:shadow-lg dark:shadow-none">
                {/* Strong gradient fade overlay for soft edges */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-r from-zinc-100/60 via-transparent to-zinc-100/60 dark:from-slate-950/40 dark:via-transparent dark:to-slate-950/40" />
                {/* Top-bottom fade for softer vertical edges */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-b from-zinc-100/40 via-transparent to-zinc-100/40 dark:from-slate-950/30 dark:via-transparent dark:to-slate-950/30" />
              <Image
                src="/profile-image.jpg"
                alt="Anthony Zhang"
                fill
                sizes="(max-width: 640px) 80vw, 320px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
              />
              </div>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-semibold text-black dark:text-white sm:text-4xl">
              {t("introTitle")}
            </h2>
            <p className="mt-4 text-lg leading-8 text-zinc-700 dark:text-zinc-300">
              {t("introBody")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
