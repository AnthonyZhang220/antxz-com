"use client";

import { useTranslations } from "next-intl";

export default function Intro() {
  const t = useTranslations("home");

  return (
    <section className="w-full bg-white dark:bg-black py-24">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-semibold text-black dark:text-white">
          {t("intro_title")}
        </h2>
        <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
          {t("intro_body")}
        </p>
      </div>
    </section>
  );
}
