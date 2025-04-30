// funtions needed for blog operations ----------------

// store new blog post
// get all blog posts
// get a single blog post
// update a blog post
// delete a blog post
// Add new tag
// get all tags

// -----------------------------------------------------

// Firebase imports
import { auth, db } from "$lib/firebase/firebase.js";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";

// UI import
import { handleAlertMessage } from "$lib/stores/uiStore.svelte";

// Blog dependencies
import { blogOutput } from "$lib/components/blog/blogOutput.svelte";
import type { BlogPost } from "$lib/components/blog/blogOutput.svelte";

export const databaseHandlers = {
	getAllBlogPosts: async () => {
		try {
			const postsSnapshot = await getDocs(collection(db, "posts"));
			const blogPosts: any = [];
			postsSnapshot.forEach((doc) => {
				blogPosts.push(doc.data());
			});
			return blogPosts;
		} catch (error) {
			console.error("Error getting blog posts: ", error);
			handleAlertMessage("An error occurred trying to retrieve blog posts.");
		}
	},

	// create new blog post
	createBlogPost: async (post: BlogPost) => {
		try {
			if (!post.slug) {
				throw new Error("Post must have a slug.");
			}
			const newPostRef = doc(db, "posts", post.slug);
			await setDoc(newPostRef, post);
			handleAlertMessage("Blog post created successfully.");
		} catch (error) {
			console.error("Error creating blog post: ", error);
			handleAlertMessage("An error occurred trying to create the blog post.");
		}
	}
};
