import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import blogs from "$lib/data/blogDummyData.json";

export const load: PageLoad = ({ params }) => {
	// Find the blog with the matching slug in the JSON file
	const blog = blogs.find((blog) => blog.slug === params.slug);
	if (blog) {
		return {
			status: 200,
			blog
		};
	}

	error(404, "Not found");
};
