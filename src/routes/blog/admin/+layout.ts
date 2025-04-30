import type { Load } from "@sveltejs/kit";
import { databaseHandlers } from "$lib/firebase/db";

export const load: Load = async () => {
	const allBlogPosts = await databaseHandlers.getAllBlogPosts();
	return {
		allBlogPosts
	};
};

export const ssr = false;
