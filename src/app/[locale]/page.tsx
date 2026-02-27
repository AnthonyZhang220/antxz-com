import Hero from "@/components/hero";
import Intro from "@/components/intro";
import Blogs from "@/components/blogs";

const samplePosts = [
	{
		id: "1",
		title: "Building with Next.js 14",
		subtitle: "New features and patterns",
		image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
		tags: ["nextjs", "frontend"],
		date: "2026-02-20",
		href: "/blog/nextjs-14",
	},
	{
		id: "2",
		title: "Designing for Performance",
		subtitle: "Small techniques that matter",
		image: "https://images.unsplash.com/photo-1505238680356-667803448bb6?auto=format&fit=crop&w=1200&q=80",
		tags: ["performance", "ux"],
		date: "2026-01-15",
		href: "/blog/performance",
	},
	{
		id: "3",
		title: "My TypeScript Patterns",
		subtitle: "Types that help you ship",
		image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
		tags: ["typescript", "patterns"],
		date: "2025-12-10",
		href: "/blog/typescript-patterns",
	},
	{
		id: "4",
		title: "React Hooks Deep Dive",
		subtitle: "Understanding custom hooks",
		image: "https://images.unsplash.com/photo-1633356122544-f134324ef6e2?auto=format&fit=crop&w=1200&q=80",
		tags: ["react", "hooks"],
		date: "2025-11-28",
		href: "/blog/react-hooks",
	},
	{
		id: "5",
		title: "Database Optimization Tips",
		subtitle: "Making queries fast",
		image: "https://images.unsplash.com/photo-1516321318423-f06f70a504f9?auto=format&fit=crop&w=1200&q=80",
		tags: ["database", "backend"],
		date: "2025-11-05",
		href: "/blog/db-optimization",
	},
	{
		id: "6",
		title: "Deploy Like a Pro",
		subtitle: "CI/CD best practices",
		image: "https://images.unsplash.com/photo-1460925895917-adf4e565dc18?auto=format&fit=crop&w=1200&q=80",
		tags: ["devops", "deployment"],
		date: "2025-10-18",
		href: "/blog/deployment",
	},
	{
		id: "7",
		title: "CSS Grid Mastery",
		subtitle: "Create responsive layouts",
		image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
		tags: ["css", "frontend"],
		date: "2025-09-22",
		href: "/blog/css-grid",
	},
	{
		id: "8",
		title: "GraphQL vs REST",
		subtitle: "Choosing the right API",
		image: "https://images.unsplash.com/photo-1558694528-33b80f72467f?auto=format&fit=crop&w=1200&q=80",
		tags: ["api", "graphql"],
		date: "2025-08-30",
		href: "/blog/graphql-rest",
	},
];

export default function Home() {
	return (
		<main>
			<Hero />
			<Intro />
			<Blogs posts={samplePosts} />
		</main>
	);
}
