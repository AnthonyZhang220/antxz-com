import Hero from "@/components/hero";
import Intro from "@/components/intro";
import Blogs from "@/components/blog/blogs";
import { samplePosts } from "@/data/sample-data";

export default function Home() {
	return (
		<main>
			<Hero />
			<Intro />
			<Blogs posts={samplePosts} />
		</main>
	);
}
