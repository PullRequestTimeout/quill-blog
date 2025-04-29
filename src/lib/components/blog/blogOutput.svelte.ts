import { Delta } from "quill/core";

// TODO: Link to auth
export const authorsRegistered = ["Jacob Druery", "Michelle Coish"];

// Types ------------------------------------------------
export type BlogPostState = "posted" | "draft" | "deleted";

export interface BlogPost {
	title: string;
	subtitle: string;
	slug: string;
	author: string;
	date: string; // ISO date string
	postState: BlogPostState;
	html: string;
	delta: Delta;
}

export let blogOutput: BlogPost = $state({
	title: "",
	subtitle: "",
	slug: "",
	author: authorsRegistered[0],
	date: (() => new Date().toISOString().split("T")[0])(),
	postState: "draft" as BlogPostState,
	html: "",
	delta: new Delta()
});

export function titleToSlug(title: string) {
	if (!title) return "";
	return title
		.toString() // Cast to string (optional)
		.normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
		.toLowerCase() // Convert the string to lowercase letters
		.trim() // Remove whitespace from both sides of a string (optional)
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/[^\w\-]+/g, "") // Remove all non-word chars
		.replace(/\_/g, "-") // Replace _ with -
		.replace(/\-\-+/g, "-") // Replace multiple - with single -
		.replace(/\-$/g, ""); // Remove trailing -
}

// TODO: Ensure when loading a draft, the slug is set to the correct value
export function updateSlug() {
	// Only update the slug if the post is in draft state
	// This allows for the slug to be set when the post is first created
	// and not changed when the post is published
	if (blogOutput.postState === "draft") {
		// Update the slug when the title changes
		if (blogOutput.title) {
			blogOutput.slug = titleToSlug(blogOutput.title);
		} else {
			blogOutput.slug = "";
		}
	}
}
