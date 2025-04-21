// Use the svelte load function to load the blog data from the JSON file
import type { PageLoad } from "./$types";
import blogPosts from "$lib/data/blogDummyData.json";

export const load: PageLoad = ({ params }) => {
	// return all blogs where "blogState" is "published"
	const publishedPosts = blogPosts.filter((post) => post.postState === "published");
	return {
		posts: publishedPosts
	};
};
