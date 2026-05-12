import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { AuthLanguageSwitcher } from "@/components/layout/language-switcher";
import { QINGJING_QUOTES } from "@/lib/quotes/qingjing-quotes";

const AUTH_BACKGROUNDS = [
	"https://picsum.photos/seed/qingjing-01/1600/1200",
	"https://picsum.photos/seed/qingjing-02/1600/1200",
	"https://picsum.photos/seed/qingjing-03/1600/1200",
	"https://picsum.photos/seed/qingjing-04/1600/1200",
	"https://picsum.photos/seed/qingjing-05/1600/1200",
];

const UNSPLASH_COLLECTION_ID = process.env.NEXT_PUBLIC_UNSPLASH_COLLECTION_ID ?? "kNhCfAx_DLQ";
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

type UnsplashRandomPhoto = {
	urls?: {
		full?: string;
		regular?: string;
		small?: string;
		thumb?: string;
		raw?: string;
	};
	user?: {
		name?: string;
		links?: {
			html?: string;
		};
	};
	location?: {
		name?: string;
		city?: string;
		country?: string;
	};
	links?: {
		html?: string;
	};
};

type CoverPhotoMeta = {
	imageUrl: string;
	blurDataUrl?: string;
	photographerName?: string;
	photographerProfile?: string;
	locationText?: string;
	photoPage?: string;
};

function pickRandom<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)];
}

async function getUnsplashCoverPhoto(): Promise<CoverPhotoMeta | null> {
	if (!UNSPLASH_ACCESS_KEY) return null;

	try {
		const endpoint = new URL("https://api.unsplash.com/photos/random");
		endpoint.searchParams.set("collections", UNSPLASH_COLLECTION_ID);
		endpoint.searchParams.set("client_id", UNSPLASH_ACCESS_KEY);
		endpoint.searchParams.set("orientation", "landscape");

		const response = await fetch(endpoint.toString(), {
			next: { revalidate: 0 },
			headers: {
				"Accept-Version": "v1",
			},
		});

		if (!response.ok) return null;

		const photo = (await response.json()) as UnsplashRandomPhoto;
		const imageUrl =
			photo.urls?.regular ?? photo.urls?.full ?? photo.urls?.raw ?? null;
		const blurDataUrl = photo.urls?.thumb ?? photo.urls?.small;

		if (!imageUrl) return null;

		const locationText =
			photo.location?.name ||
			[photo.location?.city, photo.location?.country].filter(Boolean).join(", ") ||
			undefined;

		return {
			imageUrl,
			blurDataUrl,
			photographerName: photo.user?.name,
			photographerProfile: photo.user?.links?.html,
			locationText,
			photoPage: photo.links?.html,
		};
	} catch {
		return null;
	}
}

export default async function AuthLayout({
	children,
params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
	const { locale } = await params;
	const currentLocale = locale === "zh" ? "zh" : "en";
	const tHome = await getTranslations("home");
	const tAuth = await getTranslations("auth");
	const quote = pickRandom(QINGJING_QUOTES);
	const quoteText = currentLocale === "zh" ? quote.zh : quote.en;
	const quoteSource = currentLocale === "zh" ? quote.sourceZh : quote.sourceEn;
	const fallbackBackground = pickRandom(AUTH_BACKGROUNDS);
	const coverPhoto = await getUnsplashCoverPhoto();
	const background = coverPhoto?.imageUrl ?? fallbackBackground;

	return (
		<main className="grid min-h-svh overflow-hidden lg:grid-cols-2">
			<section className="flex min-h-svh items-center justify-center p-6 md:p-10">
				<div className="w-full max-w-sm">
					<div className="mb-6 flex flex-col items-center gap-3">
						<Link
							href="/"
							aria-label={tHome("logo")}
							className="inline-flex items-center justify-center gap-3"
						>
							<Image
								src="/logo.svg"
								alt={tHome("logo")}
								width={1024}
								height={672}
								className="h-10 w-auto dark:invert"
								priority
							/>
							<span className="font-montserrat text-xl font-semibold tracking-[0.08em] text-foreground">
								ANTXZ
							</span>
						</Link>
						<AuthLanguageSwitcher />
					</div>
					{children}
				</div>
			</section>
			<aside className="relative hidden items-center justify-center p-10 lg:flex">
				<Image
					src={background}
					alt="Auth cover background"
					fill
					className="pointer-events-none object-cover brightness-[0.7] grayscale-[0.2]"
					sizes="50vw"
					priority
					placeholder={coverPhoto?.blurDataUrl ? "blur" : "empty"}
					blurDataURL={coverPhoto?.blurDataUrl}
				/>
				<div className="pointer-events-none absolute inset-0 bg-linear-to-br from-black/60 via-black/40 to-black/70" />
				{coverPhoto && (
					<div className="absolute bottom-4 right-4 z-20 max-w-sm rounded-lg border border-white/20 bg-black/45 px-3 py-2 text-[11px] text-white/85 backdrop-blur-sm">
						{coverPhoto.photographerName && (
							<p>
								{tAuth("coverPhoto.photoBy")} {" "}
								{coverPhoto.photographerProfile ? (
									<Link
										href={coverPhoto.photographerProfile}
										target="_blank"
										rel="noopener noreferrer"
										className="underline underline-offset-2 hover:text-white"
									>
										{coverPhoto.photographerName}
									</Link>
								) : (
									coverPhoto.photographerName
								)}
							</p>
						)}
						{coverPhoto.locationText && (
							<p className="mt-0.5">{tAuth("coverPhoto.location")}: {coverPhoto.locationText}</p>
						)}
						{coverPhoto.photoPage && (
							<p className="mt-0.5">
								<Link
									href={coverPhoto.photoPage}
									target="_blank"
									rel="noopener noreferrer"
									className="underline underline-offset-2 hover:text-white"
								>
									{tAuth("coverPhoto.viewOriginal")}
								</Link>
							</p>
						)}
					</div>
				)}
				<div className="relative z-10 mx-auto w-full max-w-3xl px-8 text-center xl:px-10">
					<p className="font-montserrat text-2xl font-semibold leading-relaxed text-white xl:text-3xl">
						{quoteText}
					</p>
					<div className="mt-6 flex items-center justify-center gap-4 text-white/85">
						<span className="h-px w-28 bg-white/45 xl:w-36" />
						<span className="font-montserrat text-[11px] uppercase tracking-[0.2em]">
							{currentLocale === "zh" ? "来自" : "From"}
						</span>
						<span className="text-sm">{quoteSource}</span>
					</div>
				</div>
			</aside>
		</main>
	);
}
