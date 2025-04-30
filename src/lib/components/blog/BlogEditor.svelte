<!-- This component can't be Server Side Rendered, make sure "export const ssr = false" is set in /blog/admin/+layout.ts or equivalent-->
<script lang="ts">
	// Quill Imports
	import Quill from "quill";
	import { Delta } from "quill/core";
	import "quill/dist/quill.snow.css";

	import blogDummyData from "$lib/data/blogDummyData.json";

	import { databaseHandlers } from "$lib/firebase/db";

	// Props
	let { blogEditorOpen = $bindable(false) }: { blogEditorOpen: boolean } = $props();
	let dialog: HTMLDialogElement;
	$effect(() => {
		if (!dialog) return;
		if (!!blogEditorOpen) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	// Svelte Imports
	import { onMount } from "svelte";
	import { fade, fly } from "svelte/transition";

	// Utils Imports
	import { blogOutput, updateSlug, authorsRegistered } from "$lib/components/blog/blogOutput.svelte";
	import type { BlogPostState, BlogPost } from "$lib/components/blog/blogOutput.svelte";
	import { clickOutside } from "$lib/utils/clickOutside";

	// UI Components
	import Confirmation from "$lib/components/Confirmation.svelte";

	// Cloudinary Bucket
	let cloudinaryBucket = import.meta.env.VITE_CLOUDINARY_BUCKET;

	// State vars
	let cardImage: FileList | null = $state(null);
	let cardImageUpload: any = $state(null);
	let heroImage: FileList | null = $state(null);
	let heroImageUpload: any = $state(null);
	let wordCount = $state(0);
	let charCount = $state(0);
	let tags: string[] = $state([]);

	// Instantiate Quill editor on mount
	onMount(() => {
		let quill = new Quill("#editor", {
			modules: {
				toolbar: {
					container: [[{ header: [1, 2, 3, false] }], ["bold", "italic"], ["link", "blockquote", "image"], [{ list: "ordered" }, { list: "bullet" }]],
					handlers: {
						image: handleImage
					}
				}
			},
			theme: "snow"
		});

		// Preserve editor state after previewing
		if (blogOutput.delta) {
			quill.setContents(blogOutput.delta);
		}

		let delta: Delta = quill.getContents();

		// Update the output on text change
		quill.on("text-change", () => {
			blogOutput.html = quill.getSemanticHTML();
			delta = quill.getContents();
			blogOutput.delta = delta;

			const text = quill.getText().trim();
			charCount = text.length;
			wordCount = text === "" ? 0 : text.split(/\s+/).length;
		});
	});

	// Handle image upload to Cloudinary
	async function handleImage(this: any) {
		// Config
		const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
		const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

		const input = document.createElement("input");
		input.setAttribute("type", "file");
		input.setAttribute("accept", "image/jpeg, image/png, image/webp");
		input.click();

		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) return;

			// Validate type
			if (!ALLOWED_TYPES.includes(file.type)) {
				handleBlogEditorToastMessage("Only JPEG, PNG, and WEBP files are allowed.");
				return;
			}

			// Validate size
			if (file.size > MAX_IMAGE_SIZE) {
				handleBlogEditorToastMessage("Image is too large. Max file size is 2MB.");
				return;
			}

			// Upload to Cloudinary
			const formData = new FormData();
			formData.append("file", file);
			formData.append("upload_preset", "unsigned_blog_upload");

			try {
				const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryBucket}/image/upload`, {
					method: "POST",
					body: formData
				});

				const data = await response.json();

				if (response.ok && data.secure_url) {
					const range = this.quill.getSelection(true);
					this.quill.insertEmbed(range.index, "image", data.secure_url);
					this.quill.setSelection(range.index + 1);
				} else {
					console.error("Cloudinary upload failed:", data);
					handleBlogEditorToastMessage("Image upload failed. Please try again.");
				}
			} catch (err: any) {
				console.error("Cloudinary upload error:", err);
				handleBlogEditorToastMessage("Image upload error. Please try again.");
			}
		};
	}

	function handleClose() {
		// Check if input fields are empty, if they aren't, check if the current blog output is different from any of the blog posts in the database
		// If it is, show confirmation dialog to discard changes
		if (
			(blogOutput.title || blogOutput.subtitle || blogOutput.slug || blogOutput.html) &&
			!checkIfSaved(blogDummyData, $state.snapshot(blogOutput))
		) {
			handleConfirm("Are you sure you want to quit without saving?", () => {
				handleClearEditor();
				blogEditorOpen = false;
			});
		} else {
			handleClearEditor();
			blogEditorOpen = false;
		}
	}

	function handleClearEditor() {
		Object.assign(blogOutput, {
			title: "",
			subtitle: "",
			slug: "",
			author: authorsRegistered[0],
			date: (() =>
				new Date().toLocaleDateString("en-CA", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit"
				}))(),
			postState: "draft" as BlogPostState,
			html: "",
			delta: new Delta()
		});
	}

	// Confirmation dialog
	let confirmationOpen = $state(false);
	let confirmFunc = $state(() => {});
	let confirmMessage = $state("");
	let bodyMessage: string | undefined = $state("");
	function handleConfirm(message: string, func: () => void, body?: string) {
		confirmationOpen = true;
		confirmMessage = message;
		body ? (bodyMessage = body) : (bodyMessage = "");
		confirmFunc = () => {
			func();
		};
	}

	function checkIfSaved(currentSaved: any, blogOutput: any) {
		return currentSaved.some((blog: any) => {
			return (
				blog.slug === blogOutput.slug &&
				blog.title === blogOutput.title &&
				blog.subtitle === blogOutput.subtitle &&
				blog.html === blogOutput.html &&
				blog.postState === blogOutput.postState &&
				blog.author === blogOutput.author &&
				blog.date === blogOutput.date &&
				JSON.stringify(blog.tags) === JSON.stringify(blogOutput.tags) &&
				JSON.stringify(blog.delta) === JSON.stringify(blogOutput.delta)
			);
		});
	}

	function checkIfTitleUsed(title: string) {
		return blogDummyData.some((blog: any) => blog.title === title);
	}

	function handleSaveDraft() {
		// Ensures essential fields are filled
		if (!blogOutput.title || !blogOutput.subtitle || !blogOutput.html) {
			handleBlogEditorToastMessage("Please fill in the title, subtitle, and content before saving as draft.");
			return;
		}

		// Check if the blog post is already saved in the database in it's current state
		if (checkIfSaved(blogDummyData, $state.snapshot(blogOutput))) {
			handleBlogEditorToastMessage("This blog post has already been saved.");
			return;
		}

		// If required fields are filled and the blog post is not already saved, show confirmation dialog
		if (blogOutput.title && blogOutput.subtitle && blogOutput.slug && blogOutput.html && !checkIfSaved(blogDummyData, $state.snapshot(blogOutput))) {
			handleConfirm("Are you sure you want to save this post as a draft?", () => {
				blogOutput.postState = "draft";
				blogOutput.date = new Date().toLocaleDateString("en-CA", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit"
				});
				databaseHandlers.createBlogPost(blogOutput).then(() => {
					handleClearEditor();
					blogEditorOpen = false;
				});
			});
		}
	}

	function handlePreview() {
		handleBlogEditorToastMessage("Preview feature is not implemented yet.");
	}

	async function handlePublish() {
		if (!blogOutput.title || !blogOutput.subtitle || !blogOutput.html) {
			handleBlogEditorToastMessage("Please fill in the title, subtitle, and content before publishing.");
			return;
		}

		if (blogOutput.postState === "published") {
			handleBlogEditorToastMessage("This blog post is already published.");
			return;
		}

		// if (blogOutput.title && blogOutput.subtitle && blogOutput.slug && blogOutput.html && !checkIfSaved(blogDummyData, $state.snapshot(blogOutput))) {
		handleConfirm("Are you sure you want to publish this post?", async () => {
			blogOutput.postState = "published";
			blogOutput.date = new Date().toLocaleDateString("en-CA", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit"
			});
			await databaseHandlers.createBlogPost(blogOutput);
			handleClearEditor();
			blogEditorOpen = false;
		});
	}
	// }

	let blogEditorToastMessage: string = $state("");
	function handleBlogEditorToastMessage(message: string) {
		blogEditorToastMessage = message;
		setTimeout(() => {
			blogEditorToastMessage = "";
		}, 3000);
	}
</script>

<dialog class="blog-editor surface" bind:this={dialog} transition:fade={{ duration: 100 }}>
	<button class="button close" onclick={handleClose}><span class="material-icons">close</span></button>
	<h3>Blog Post Editor</h3>
	<div class="blog-inputs">
		<label class="blog-input-labels">
			Title:
			<input
				class="text-input"
				name="title"
				type="text"
				oninput={updateSlug}
				bind:value={blogOutput.title}
				placeholder="Blog post title here..."
				required
			/>
			<span class="blog-slug">Slug: {blogOutput.slug}</span>
		</label>
		<label class="blog-input-labels">
			Subtitle:
			<input class="text-input" name="subtitle" type="text" bind:value={blogOutput.subtitle} placeholder="Blog post subtitle here..." />
		</label>
		<label class="blog-input-labels button button-primary">
			<span class="material-icons">upload</span>
			Upload Hero Image
			<input type="file" bind:value={cardImageUpload} bind:files={cardImage} accept="image/jpeg" />
		</label>
	</div>
	<div class="quill-container">
		<div id="editor"></div>
		<p class="quill-stats">Word Count: {wordCount} | Character Count: {charCount}</p>
	</div>
	<div class="blog-actions">
		<button class="button" onclick={handleSaveDraft}><span class="material-icons">save</span>Save Draft</button>
		<button class="button" onclick={handlePreview}><span class="material-icons">preview</span>Preview</button>
		<button class="button" onclick={handleClose}><span class="material-icons">delete</span>Discard</button>
		<button class="button button-primary" onclick={handlePublish}><span class="material-icons">publish</span>Publish</button>
	</div>
	{#if blogEditorToastMessage}
		<div class="surface toast-message" transition:fly={{ duration: 200, y: -8 }}>{blogEditorToastMessage}</div>
	{/if}
	<Confirmation bind:confirmationOpen {confirmFunc} message={confirmMessage} body={bodyMessage} />
</dialog>

<style>
	#editor {
		min-height: 300px;
		border: 1px solid var(--color-black, #000);
		border-radius: 0 0 0.5rem 0.5rem;
	}

	/* Just an idea, it might break things though */
	/* :global(body:has(dialog.blog-editor[open])) {
		overflow: hidden;
		max-height: 100vh;
	} */

	:global(.ql-toolbar.ql-snow) {
		border: 1px solid var(--color-black, #000);
		border-radius: 0.5rem 0.5rem 0 0;
		border-bottom: none;
	}

	dialog.blog-editor {
		margin: auto;
		border: none;
		width: clamp(300px, calc(100vw - calc(var(--padding-inline, 1rem)) * 2), 1200px);
		max-height: calc(100vh - 4rem);
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--color-primary, #000) var(--color-white, #fff);
		padding: 0;
	}

	dialog.blog-editor div.toast-message {
		position: fixed;
		width: fit-content;
		height: fit-content;
		top: 3rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		text-align: center;
	}

	dialog.blog-editor > div {
		width: 100%;
		height: 100%;
		padding: var(--spacing-m);
	}

	dialog.blog-editor::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
		cursor: pointer;
	}

	dialog.blog-editor::-webkit-scrollbar {
		width: 9px;
	}

	dialog.blog-editor::-webkit-scrollbar-track {
		background-color: var(--color-white, #fff);
		border-radius: 5px;
	}

	dialog.blog-editor::-webkit-scrollbar-thumb {
		border-radius: 5px;
		background-color: var(--color-primary, #000);
	}

	button.close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background-color: transparent;
		border: none;
		cursor: pointer;
		transition:
			background-color 0.2s,
			color 0.2s;
	}

	button.close:hover,
	button.close:focus {
		background-color: var(--color-primary, #000);
		color: var(--color-white, #fff);
	}

	div.quill-container {
		width: 100%;
		position: relative;
		margin-block: 1rem;
	}

	div.blog-inputs {
		display: grid;
		grid-template-columns: 1fr;
		grid-gap: 1rem;
	}

	input[type="file"] {
		display: none;
	}

	/* label.upload-button {
	} */

	div.blog-inputs label {
		font-weight: 700;
	}

	div.blog-inputs input,
	div.blog-inputs span {
		font-weight: 400;
		margin-top: var(--spacing-xs);
	}

	p.quill-stats,
	.blog-slug {
		font-size: 0.75rem;
		opacity: 0.8;
	}

	div.blog-actions {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-m);
	}

	div.blog-actions button {
		width: 100%;
	}

	:global(.ql-container) {
		height: calc(100% - 42px);
		font-size: var(--font-body-s);
	}

	:global(.ql-toolbar span) {
		color: var(--font-color, #000);
		font-family: var(--font-body, sans-serif);
	}

	:global(.ql-snow .ql-stroke) {
		stroke: var(--font-color, #000);
	}

	:global(.ql-snow .ql-picker) {
		color: var(--font-color, #000);
	}

	:global(.ql-snow .ql-picker-item) {
		color: var(--font-color, #4b4b4b);
	}

	@media screen and (min-width: 768px) {
		dialog.blog-editor > div {
			padding: var(--spacing-m) var(--spacing-l);
		}

		button.close {
			right: 2rem;
		}

		div.blog-inputs {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media screen and (min-width: 1280px) {
		div.blog-actions {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
