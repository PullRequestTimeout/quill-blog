import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { databaseHandlers } from "$lib/firebase/db";
import type { BlogPost } from "$lib/components/blog/blogOutput.svelte";

export const load: PageLoad = async ({ params }) => {
	// Find the blog with the matching slug in the JSON file
	const blogs = await databaseHandlers.getAllBlogPosts();
	const blog = blogs.find((blog: BlogPost) => blog.slug === params.slug);
	if (blog) {
		return {
			status: 200,
			blog
		};
	}

	error(404, "Not found");
};
