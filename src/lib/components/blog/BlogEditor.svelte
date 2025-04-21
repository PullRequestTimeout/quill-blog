<script lang="ts">
	// Quill Imports
	import Quill from "quill";
	import type { Delta } from "quill/core";
	import "quill/dist/quill.snow.css";

	// Svelte Imports
	import { onMount } from "svelte";

	// Utils Imports
	import { blogOutput, updateSlug, authorsRegistered } from "$lib/components/blog/blogOutput.svelte";
	$effect(() => {
		console.log(JSON.stringify(blogOutput));
	});

	// UI Components
	import { handleAlertMessage } from "$lib/stores/uiStore.svelte";

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
</script>

<div class="blog-editor">
	<div class="blog-inputs">
		<label>
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
		</label>
		<p>Slug: {blogOutput.slug}</p>
		<label>
			Subtitle:
			<input class="text-input" name="subtitle" type="text" bind:value={blogOutput.subtitle} placeholder="Blog post subtitle here..." />
		</label>
		<label>
			Date:
			<input class="text-input" name="date" type="date" bind:value={blogOutput.date} />
		</label>
		<label>
			Author:
			<select name="author" bind:value={blogOutput.author}>
				{#each authorsRegistered as author}
					<option value={author}>{author}</option>
				{/each}
			</select>
		</label>
		<label>
			Card Image:
			<input type="file" bind:value={cardImageUpload} bind:files={cardImage} accept="image/jpeg" />
		</label>
	</div>
	<div class="quill-container">
		<div id="editor"></div>
		<div class="quill-stats">
			<p>Word Count: {wordCount} | Character Count: {charCount}</p>
		</div>
	</div>
	<div>
		<button>Save Draft</button>
		<button>Preview</button>
		<button>Publish</button>
		<button>Discard</button>
	</div>
</div>

<style>
	#editor {
		min-height: 300px;
	}

	.quill-container {
		width: 100%;
		position: relative;
	}

	.blog-inputs {
		display: grid;
		grid-template-columns: 1fr;
		grid-gap: 1rem;
	}

	:global(.ql-container) {
		height: calc(100% - 42px);
	}

	:global(.ql-toolbar span),
	* {
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
</style>
