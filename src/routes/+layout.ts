import type { Load } from "@sveltejs/kit";
import { databaseHandlers } from "$lib/firebase/db";

export const load: Load = async () => {
	const blogPosts = await databaseHandlers.getAllBlogPosts();
	// Only return the blog posts if each post's postState is "published"
	const publishedBlogPosts = blogPosts.filter((post: any) => post.postState === "published");
	return {
		publishedBlogPosts
	};
};
