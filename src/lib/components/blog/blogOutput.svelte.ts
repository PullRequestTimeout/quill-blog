import { Delta } from "quill/core";

export let blogOutput = $state({
    title: "",
    subtitle: "",
    postType: "blog" as BlogPostType,
    slug: "",
    author: "",
    date: new Date(),
    html: "",
    delta: new Delta()

})

type BlogPostType = "project" | "blog";

export function titleToSlug(title: string) {
    if (!title) return;
    return title
        .trim() // Remove spaces at the beginning and end of the string
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
}