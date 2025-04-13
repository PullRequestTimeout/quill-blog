import { Delta } from "quill/core";

export const authorsRegistered = ["Jacob Druery", "Michelle Coish"];

export let blogOutput = $state({
	title: "",
	subtitle: "",
	slug: "",
	author: authorsRegistered[0],
	date: new Date(),
	html: "",
	delta: new Delta(),
	postState: "draft" as BlogPostState
});

type BlogPostState = "posted" | "draft" | "deleted";

export function titleToSlug(title: string) {
	if (!title) return "";
	return title
		.trim() // Remove spaces at the beginning and end of the string
		.toLowerCase()
		.replace(/ /g, "-")
		.replace(/[^\w-]+/g, "");
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
