import { redirect, error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { databaseHandlers } from "$lib/firebase/db";
import { uiStore } from "$lib/stores/uiStore.svelte";
import { handleAlertMessage } from "$lib/stores/uiStore.svelte";

export const load: PageLoad = async ({ params }) => {
	// Preview routes are only accessible to admin users
	const loggedIn = uiStore.loggedIn;
	if (!loggedIn) {
		handleAlertMessage("You must be logged in to preview a blog post.");
		throw redirect(302, "/blog");
	}

	// Find the blog with the matching slug in the DB
	const blog = await databaseHandlers.getBlogPostBySlug(params.slug);
	if (!blog) {
		throw error(404, "Not found");
	}

	return {
		status: 200,
		blog
	};
};
