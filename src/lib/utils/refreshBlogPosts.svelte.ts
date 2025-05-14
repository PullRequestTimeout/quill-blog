import type { BlogPost } from "$lib/components/blog/blogOutput.svelte";
import { databaseHandlers } from "$lib/firebase/db";
import { invalidateAll } from "$app/navigation";

export let blogPostsArr: BlogPost[] = $state(await databaseHandlers.getAllBlogPosts());

export async function refreshBlogPosts() {
	const localBlogPostsArr = await databaseHandlers.getAllBlogPosts();
	blogPostsArr.splice(0, blogPostsArr.length, ...localBlogPostsArr.sort((a: BlogPost, b: BlogPost) => b.date.localeCompare(a.date)));
	invalidateAll();
}
