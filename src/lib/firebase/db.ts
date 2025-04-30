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
			// Serialize the delta field if it exists
			const serializedPost = {
				...post,
				delta: JSON.parse(JSON.stringify(post.delta))
			};

			await setDoc(newPostRef, serializedPost);
			handleAlertMessage("Blog post created successfully.");
		} catch (error) {
			console.error("Error creating blog post: ", error);
			handleAlertMessage("An error occurred trying to create the blog post.");
		}
	},

	restoreBlogPost: async (post: BlogPost) => {
		try {
			if (!post.slug) {
				throw new Error("Post must have a slug.");
			}

			// Check if the post exists in the database
			const postRef = doc(db, "posts", post.slug);
			const postSnapshot = await getDoc(postRef);

			// If it does, and the post is not already in draft or published state, update it to draft state
			if (!postSnapshot.exists()) {
				handleAlertMessage("Blog post not found.");
			} else if (post.postState === "draft" || post.postState === "published") {
				handleAlertMessage("Blog post is already in draft or published state.");
			} else {
				const updatedPost = { ...post, postState: "draft" };
				await updateDoc(postRef, updatedPost);
				handleAlertMessage("Blog post restored successfully.");
			}
		} catch (error) {
			console.error("Error restoring blog post: ", error);
			handleAlertMessage("An error occurred trying to restore the blog post.");
		}
	}
};
