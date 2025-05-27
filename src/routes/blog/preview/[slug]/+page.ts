import { redirect, error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { databaseHandlers } from "$lib/firebase/db";
import { uiStore } from "$lib/stores/uiStore.svelte";
import { handleAlertMessage } from "$lib/stores/uiStore.svelte";

export const load: PageLoad = async ({ params, url }) => {
	// Preview routes are only accessible to admin users
	if (!uiStore.loggedIn) {
		handleAlertMessage("You must be logged in to preview a blog post.");
		throw redirect(302, "/blog/admin");
	}

	// Access query parameters from the URL
	const query = url.searchParams; // This is a URLSearchParams object
	let blog;

	// Previews of publiched blog posts are accessible via the "id" query parameter
	if (query.has("id") && query.get("id")?.includes("preview")) {
		// If the query parameter "id" is present and contains "preview", redirect to the preview page
		const previewId = query.get("id");
		if (previewId) {
			blog = await databaseHandlers.getBlogPostById(previewId);
		}
	} else {
		blog = await databaseHandlers.getBlogPostBySlug(params.slug);
	}

	if (!blog) {
		throw error(404, "Not found");
	}

	return {
		status: 200,
		blog,
		query // Optionally return query params if needed in the page
	};
};
