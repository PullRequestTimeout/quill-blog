<!-- This component can't be Server Side Rendered, make sure "export const ssr = false" is set in /blog/admin/+layout.ts or equivalent-->
<script lang="ts">
	// Quill Imports
	import Quill from "quill";
	import { Delta } from "quill/core";
	import "quill/dist/quill.snow.css";

	import { databaseHandlers } from "$lib/firebase/db";
	import { refreshBlogPosts } from "$lib/utils/refreshBlogPosts.svelte";

	// Props
	let { blogEditorOpen = $bindable(false) }: { blogEditorOpen: boolean } = $props();
	let dialog: HTMLDialogElement;
	$effect(() => {
		if (!!blogEditorOpen) {
			dialog.showModal();
			uiStore.blogEditorOpen = true;
		} else {
			dialog.close();
			uiStore.blogEditorOpen = false;
		}
	});

	// Svelte Imports
	import { onMount } from "svelte";
	import { fade, fly } from "svelte/transition";

	// Utils Imports
	import { blogOutput, updateSlug, authorsRegistered } from "$lib/components/blog/blogOutput.svelte";
	import type { BlogPostState, BlogPost } from "$lib/components/blog/blogOutput.svelte";
	import { handleAlertMessage, uiStore } from "$lib/stores/uiStore.svelte";

	// UI Components
	import Confirmation from "$lib/components/Confirmation.svelte";
	import TagSelector from "./TagSelector.svelte";

	// Cloudinary Bucket
	let cloudinaryBucket = import.meta.env.VITE_CLOUDINARY_BUCKET;

	// State vars
	let heroImage: FileList | null = $state(null);
	let heroImageUpload: string | null = $state(null);

	let wordCount = $state(0);
	let charCount = $state(0);
	let selectedTags: string[] = $state([]);

	$effect(() => {
		blogOutput.tags = selectedTags;
	});

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
				handleAlertMessage("Only JPEG, PNG, and WEBP files are allowed.");
				return;
			}

			// Validate size
			if (file.size > MAX_IMAGE_SIZE) {
				handleAlertMessage("Image is too large. Max file size is 2MB.");
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
					handleAlertMessage("Image upload failed. Please try again.");
				}
			} catch (err: any) {
				console.error("Cloudinary upload error:", err);
				handleAlertMessage("Image upload error. Please try again.");
			}
		};
	}

	// Uploads a file from an <input type="file"> to Cloudinary and returns the URL
	async function handleHeroImageUpload(fileInput: HTMLInputElement): Promise<string | null> {
		const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
		const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
		const UPLOAD_PRESET = "unsigned_blog_upload";
		const CLOUDINARY_BUCKET = cloudinaryBucket; // or replace with actual string if not in scope

		const file = fileInput.files?.[0];
		if (!file) return null;

		// Validate type
		if (!ALLOWED_TYPES.includes(file.type)) {
			handleAlertMessage("Only JPEG, PNG, and WEBP files are allowed.");
			return null;
		}

		// Validate size
		if (file.size > MAX_IMAGE_SIZE) {
			handleAlertMessage("Image is too large. Max file size is 2MB.");
			return null;
		}

		const formData = new FormData();
		formData.append("file", file);
		formData.append("upload_preset", UPLOAD_PRESET);

		try {
			const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_BUCKET}/image/upload`, {
				method: "POST",
				body: formData
			});

			const data = await response.json();

			if (response.ok && data.secure_url) {
				return data.secure_url;
			} else {
				console.error("Cloudinary upload failed:", data);
				handleAlertMessage("Image upload failed. Please try again.");
				return null;
			}
		} catch (err: any) {
			console.error("Cloudinary upload error:", err);
			handleAlertMessage("Image upload error. Please try again.");
			return null;
		}
	}

	// Wrapper for input change event
	async function handleHeroImageInputChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const url = await handleHeroImageUpload(input);
		if (url) {
			heroImageUpload = url;
			blogOutput.heroImage = url;
		}
	}

	async function handleClose() {
		// Check if input fields are empty, if they aren't, check if the current blog output is different from any of the blog posts in the database
		// If it is, show confirmation dialog to discard changes
		const saved = await databaseHandlers.isBlogSaved(blogOutput.slug, $state.snapshot(blogOutput) as BlogPost);

		if ((blogOutput.title || blogOutput.subtitle || blogOutput.slug || blogOutput.html) && saved === false) {
			handleConfirm("Are you sure you want to quit without saving? Changes have not been saved.", () => {
				handleClearEditor();
				blogEditorOpen = false;
			});
		} else {
			handleClearEditor();
			blogEditorOpen = false;
		}
	}

	// Add event listener to the esc key, prevent default action, and use to run the handleClose function
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			event.preventDefault();
			handleClose();
		}
	}

	// This ensures that the modal is closed using the handleClose, so the confirmation dialog and prompt to save is shown
	$effect(() => {
		if (blogEditorOpen) {
			document.addEventListener("keydown", handleKeydown);
		} else {
			document.removeEventListener("keydown", handleKeydown);
		}
	});

	function handleClearEditor() {
		Object.assign(blogOutput, {
			title: "",
			subtitle: "",
			slug: "",
			heroImage: "",
			tags: [],
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

	async function handleSaveDraft() {
		// Ensures essential fields are filled
		if (!blogOutput.title || !blogOutput.subtitle || !blogOutput.html) {
			handleAlertMessage("Please fill in the title, subtitle, and content before saving as draft.");
			return;
		}

		// Check if the blog post is already saved in the database in it's current state
		if (await databaseHandlers.isBlogSaved(blogOutput.slug, $state.snapshot(blogOutput) as BlogPost)) {
			if (blogOutput.postState === "draft") {
				handleAlertMessage("This blog post is already saved as a draft.");
				return;
			}
		}

		handleConfirm(
			"Are you sure you want to save this post as a draft?",
			async () => {
				blogOutput.postState = "draft";
				blogOutput.date = new Date().toLocaleDateString("en-CA", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit"
				});
				await databaseHandlers.saveDraftBlogPost(blogOutput);
				handleClearEditor();
				blogEditorOpen = false;
				refreshBlogPosts();
			},
			blogOutput.title
		);
	}

	function handlePreview() {
		handleAlertMessage("Preview feature is not implemented yet.");
	}

	async function handlePublish() {
		if (!blogOutput.title || !blogOutput.subtitle || !blogOutput.html) {
			handleAlertMessage("Please fill in the title, subtitle, and content before publishing.");
			return;
		}

		if (blogOutput.postState === "published" && (await databaseHandlers.isBlogSaved(blogOutput.slug, $state.snapshot(blogOutput) as BlogPost))) {
			handleAlertMessage("This blog post is already published in its current state.");
			return;
		}

		handleConfirm(
			"Are you sure you want to publish this post?",
			async () => {
				blogOutput.postState = "published";
				blogOutput.date = new Date().toLocaleDateString("en-CA", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit"
				});
				await databaseHandlers.publishBlogPost(blogOutput);
				handleClearEditor();
				blogEditorOpen = false;
				refreshBlogPosts();
			},
			blogOutput.title
		);
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
				disabled={blogOutput.postState === "published"}
			/>
			<span class="blog-slug">Slug: {blogOutput.slug}</span>
		</label>
		<label class="blog-input-labels">
			Subtitle:
			<input class="text-input" name="subtitle" type="text" bind:value={blogOutput.subtitle} placeholder="Blog post subtitle here..." />
		</label>
		<div class="hero-image-upload">
			<label class="blog-input-labels button button-primary">
				<span class="material-icons">upload</span>
				Upload Hero Image
				<input type="file" bind:files={heroImage} onchange={(e) => handleHeroImageInputChange(e)} accept="image/*" />
			</label>
			{#if blogOutput.heroImage}
				<div class="hero-image-upload-preview">
					<img src={blogOutput.heroImage} alt={blogOutput.heroImage} />
					<button class="button" onclick={() => (blogOutput.heroImage = "")}>
						<span class="material-icons">delete</span>
					</button>
				</div>
			{/if}
		</div>
		<TagSelector bind:selectedTags />
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
	{#if uiStore.alertMessage}
		<div class="surface toast-message" transition:fly={{ duration: 200, y: -8 }}>{uiStore.alertMessage}</div>
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
	:global(body:has(dialog.blog-editor[open])) {
		overflow: hidden;
		max-height: 100vh;
	}

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
		padding: var(--spacing-m);
	}

	div.toast-message {
		position: fixed;
		width: fit-content;
		height: fit-content;
		top: 4rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		text-align: center;
	}

	dialog.blog-editor::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
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

	div.hero-image-upload {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	div.hero-image-upload-preview {
		position: relative;
		max-width: 15rem;
	}

	div.hero-image-upload-preview button {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background-color: #00000050;
		padding: 0.25rem;
		border-radius: 2rem;
		color: var(--color-white, #fff);
		transition: background-color 0.2s;
	}

	div.hero-image-upload-preview button span {
		margin: 0;
		width: 2rem;
	}

	div.hero-image-upload-preview img {
		border-radius: 0.5rem;
	}

	@media (hover: hover) {
		div.hero-image-upload-preview button:hover {
			background-color: #00000080;
		}
	}

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
		gap: var(--spacing-s);
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
		button.close {
			right: 2rem;
		}

		div.blog-inputs {
			grid-template-columns: 1fr 1fr;
		}

		div.hero-image-upload {
			flex-direction: row;
		}
	}

	@media screen and (min-width: 1024px) {
		dialog.blog-editor {
			padding: var(--spacing-m) var(--spacing-l);
		}
	}

	@media screen and (min-width: 1280px) {
		div.blog-actions {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
