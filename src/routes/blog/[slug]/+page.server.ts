import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { databaseHandlers } from "$lib/firebase/db";

export const load: PageLoad = async ({ params }) => {
	// Find the blog with the matching slug in the DB
	const blog = await databaseHandlers.getBlogPostBySlug(params.slug);
	if (!blog) {
		// If the blog is not found, return a 404 error
		error(404, "Not found");
	} else if (blog) {
		return {
			status: 200,
			blog
		};
	}
};
