// Firebase imports
import { db } from "$lib/firebase/firebase.js";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

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
	saveDraftBlogPost: async (post: BlogPost) => {
		try {
			if (!post.slug) {
				throw new Error("Post must have a slug.");
			}

			// Check if the post exists in the database
			const postRef = doc(db, "posts", post.slug);
			const postSnapshot = await getDoc(postRef);

			// Serialize the delta field if it exists
			const draftPost = {
				...post,
				postState: "draft",
				date: new Date().toLocaleDateString("en-CA", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit"
				}),
				delta: JSON.parse(JSON.stringify(post.delta))
			};

			// Check if the post already exists in the database
			if (postSnapshot.exists()) {
				await updateDoc(postRef, draftPost);
				handleAlertMessage("Changes saved to draft.");
			} else if (!postSnapshot.exists()) {
				await setDoc(postRef, draftPost);
				handleAlertMessage("Blog post saved as a draft.");
			}
		} catch (error) {
			console.error("Error creating blog post: ", error);
			handleAlertMessage("An error occurred trying to save the blog post.");
		}
	},

	publishBlogPost: async (post: BlogPost) => {
		try {
			if (!post.slug) {
				throw new Error("Post must have a slug.");
			}

			// Check if the post exists in the database
			const postRef = doc(db, "posts", post.slug);
			const postSnapshot = await getDoc(postRef);
			const publishedPost: BlogPost = {
				...post,
				postState: "published",
				date: new Date().toLocaleDateString("en-CA", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit"
				}),
				html: post.html,
				tags: post.tags,
				delta: JSON.parse(JSON.stringify(post.delta))
			};
			// If it does, and the post is not already in draft state, update it to published state
			if (!postSnapshot.exists()) {
				await setDoc(postRef, publishedPost);
				handleAlertMessage("Blog post created and published successfully.");
			} else {
				await setDoc(postRef, publishedPost, { merge: true });
				handleAlertMessage("Blog post updated and published successfully.");
			}
		} catch (error) {
			console.error("Error publishing blog post: ", error);
			handleAlertMessage("An error occurred trying to publish the blog post.");
		}
	},

	// Move a blog post from the deleted state to the draft state
	// This is used when a user wants to restore a blog post that was previously deleted
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
				handleAlertMessage(`Restored blog post to drafts: ${post.title}`, 5);
			}
		} catch (error) {
			console.error("Error restoring blog post: ", error);
			handleAlertMessage("An error occurred trying to restore the blog post.");
		}
	},

	deleteBlogPost: async (post: BlogPost) => {
		try {
			if (!post.slug) {
				throw new Error("Post must have a slug.");
			}
			// Check if the post exists in the database
			const postRef = doc(db, "posts", post.slug);
			const postSnapshot = await getDoc(postRef);

			if (!postSnapshot.exists()) {
				handleAlertMessage("Blog post not found.");
			} else if (post.postState === "deleted") {
				handleAlertMessage("Blog post has already been deleted.");
			} else if (postSnapshot.exists() && (post.postState === "draft" || post.postState === "published")) {
				const updatedPost = { ...post, postState: "deleted" };
				await updateDoc(postRef, updatedPost);
				handleAlertMessage(`Deleted blog post: ${post.title}`, 5);
			}
		} catch (error) {
			console.error("Error deleting blog post: ", error);
			handleAlertMessage("An error occurred trying to delete the blog post.");
		}
	},

	permanentDeleteBlogPost: async (post: BlogPost) => {
		try {
			if (!post.slug) {
				throw new Error("Post must have a slug.");
			}
			// Check if the post exists in the database
			const postRef = doc(db, "posts", post.slug);
			const postSnapshot = await getDoc(postRef);

			if (!postSnapshot.exists()) {
				handleAlertMessage("Blog post not found.");
			} else if (postSnapshot.exists() && (post.postState === "draft" || post.postState === "published")) {
				handleAlertMessage("Blog post is not in deleted state.");
			} else if (postSnapshot.exists() && post.postState === "deleted") {
				await deleteDoc(postRef);
				handleAlertMessage(`Permanently deleted blog post: ${post.title}`, 5);
			}
		} catch (error) {
			console.error("Error permanently deleting blog post: ", error);
			handleAlertMessage("An error occurred trying to permanently delete the blog post.");
		}
	},

	// get all tags to populate the tag selector component
	getAllTags: async () => {
		try {
			const tagsSnapshot = await getDoc(doc(db, "tags", "tags"));
			let tags: any = [];
			if (!tagsSnapshot.exists()) {
				// If the tags document does not exist, create one with an empty array and return an empty array
				await setDoc(doc(db, "tags", "tags"), { tags: [] });
				return [];
			} else if (tagsSnapshot.data()) {
				tags = tagsSnapshot.data().tags;
				return tags;
			}
		} catch (error) {
			console.error("Error getting tags: ", error);
			handleAlertMessage("An error occurred trying to retrieve blog tags.");
		}
	},

	// Add a new tag to the tags collection
	addNewTag: async (tag: string) => {
		try {
			const tagsRef = doc(db, "tags", "tags");
			const tagsSnapshot = await getDoc(tagsRef);

			// Check if the tags document exists, if not, create it
			// If it exists, only add the new tag if it doesn't already exist
			if (!tagsSnapshot.exists()) {
				// If the tags document does not exist, create one with an empty array
				await setDoc(tagsRef, { tags: [tag] });
				handleAlertMessage("Tag added successfully.");
			} else {
				const currentTags = tagsSnapshot.data().tags || [];
				if (!currentTags.includes(tag)) {
					currentTags.push(tag);
					await updateDoc(tagsRef, { tags: currentTags });
					handleAlertMessage("Tag added successfully.");
				} else if (currentTags.includes(tag)) {
					handleAlertMessage("Tag already exists.");
				}
			}
		} catch (error) {
			console.error("Error adding tag: ", error);
			handleAlertMessage("An error occurred trying to add the tag.");
		}
	},

	isSlugUsed: async (slug: string) => {
		try {
			const postRef = doc(db, "posts", slug);
			const postSnapshot = await getDoc(postRef);
			if (postSnapshot.exists()) {
				return true; // Slug is already used
			} else {
				return false; // Slug is not used
			}
		} catch (error) {
			console.error("Error checking slug: ", error);
			handleAlertMessage("An error occurred trying to check the slug.");
		}
	},

	isBlogSaved: async (slug: string, blog: BlogPost) => {
		if (slug === "") {
			return false; // Slug is not provided
		}
		try {
			const postRef = doc(db, "posts", slug);
			const postSnapshot = await getDoc(postRef);
			if (!postSnapshot.exists()) {
				return false; // Blog post is not saved
			} else if (postSnapshot.exists()) {
				// check the data in the database is different from the data in the blog object
				const postData = postSnapshot.data();
				const isSame =
					postData.slug === blog.slug &&
					postData.title === blog.title &&
					postData.subtitle === blog.subtitle &&
					postData.html === blog.html &&
					postData.postState === blog.postState &&
					postData.author === blog.author &&
					postData.heroImage === blog.heroImage &&
					postData.date === blog.date &&
					JSON.stringify(postData.tags) === JSON.stringify(blog.tags) &&
					JSON.stringify(postData.delta) === JSON.stringify(blog.delta);

				return isSame; // Blog post is saved
			}
		} catch (error) {
			console.error("Error checking if blog is saved: ", error);
			handleAlertMessage("An error occurred trying to check if the blog is saved.");
		}
	}
};
