<script lang="ts">
	// Quill Imports
	import Quill from "quill";
	import type { Delta } from "quill/core";
	import "quill/dist/quill.snow.css";

	// Svelte Imports
	import { onMount } from "svelte";

	// Utils Imports
	import { blogOutput, updateSlug, authorsRegistered } from "$lib/components/blog/blogOutput.svelte";

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
		});
	});

	let cardImage: FileList | null = null;
	let cardImageUpload: any = null;
	let heroImage: FileList | null = null;
	let heroImageUpload: any = null;

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
				alert("Only JPEG, PNG, and WEBP files are allowed.");
				return;
			}

			// Validate size
			if (file.size > MAX_IMAGE_SIZE) {
				// Swap out the alert with custom UI ~~~~~~~~~~~~~~~~~~~~~~~~~~ <------------
				alert("Image is too large. Max file size is 2MB.");
				return;
			}

			// Upload to Cloudinary
			const formData = new FormData();
			formData.append("file", file);
			formData.append("upload_preset", "unsigned_blog_upload");

			try {
				const response = await fetch("https://api.cloudinary.com/v1_1/dvdwz9dpc/image/upload", {
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
					alert("Image upload failed. Please try again.");
				}
			} catch (err) {
				console.error("Cloudinary upload error:", err);
				alert("Image upload error. Please try again.");
			}
		};
	}
</script>

<div class="dev-columns">
	<section class="blog-editor">
		<div class="blog-inputs">
			<label>
				Title:
				<input name="title" type="text" oninput={updateSlug} bind:value={blogOutput.title} placeholder="Blog post title here..." required />
			</label>
			<p>Slug: {blogOutput.slug}</p>
			<label>
				Subtitle:
				<input name="subtitle" type="text" bind:value={blogOutput.subtitle} placeholder="Blog post subtitle here..." />
			</label>
			<label>
				Date:
				<input name="date" type="date" bind:value={blogOutput.date} />
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
		</div>
	</section>

	<section class="blog-object-output">
		<h2>Blog Output</h2>
		<pre>{JSON.stringify(blogOutput, null, 2)}</pre>
	</section>
</div>

<style>
	/* Dev */
	.dev-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 2rem;
	}

	#editor {
		min-height: 300px;
	}

	.quill-container {
		width: 50vw;
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
