<script lang="ts">
	import Quill from "quill";
	import type { Delta } from "quill/core";
	import "quill/dist/quill.snow.css";
	import { onMount } from "svelte";
	import { blogOutput, titleToSlug } from "$lib/components/blog/blogOutput.svelte";

	onMount(() => {
		let quill = new Quill("#editor", {
			modules: {
				toolbar: [
					["bold", "italic"],
					["link", "blockquote", "code-block", "image"],
					[{ list: "ordered" }, { list: "bullet" }]
				]
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

	let title = blogOutput.title;
	let subtitle = $state("");
	let postType = $state("");
	let slug = $derived(titleToSlug(title));
	let date: Date = $state(new Date());
	let tags: string[];
	let author = "";

	let authorImage = ""; // not 100% sure of type, have to play with it
	let authorTitle = ""; // eg. Owner - Pixel Mountain Creative
	let cardImage: FileList | null | undefined = $state(); //I feel like this should ultimately have null and undefined removed
	let cardImageUpload: any = $state();
	let heroImage: FileList | null | undefined = $state();
	let heroImageUpload: any = $state();

	// Cloudinary upload target
	// https://res.cloudinary.com/dvdwz9dpc/image/upload

	// On form submit, grab just the image file and upload to Cloudinary
	// Then, update the cardImageUpload with the Cloudinary URL
	// After that, update the blogOutput object and send to the server

	// <form method="post" action="https://api.cloudinary.com/v1_1/dvdwz9dpc/image/upload" enctype="multipart/form-data">

	$effect(() => {
		console.log(cardImageUpload);
		console.log(new Date());
	});

	/*
            "cardImage": "/assets/images/blogs/treehugger-hare-scramble-card.jpg",
            "heroImage": "/assets/images/blogs/treehugger-hare-scramble-hero.jpg",
            "tags": ["Digital Media"],
            "author": "Jacob Druery",
            "authorImage": "/assets/images/jacob-snowboarding-circle.png",
            "authorTitle": "Owner - Pixel Mountain Creative",
            "link": ""
    */
</script>

<section>
	<div class="blog-inputs">
		<label
			>Title:
			<input name="title" type="text" bind:value={blogOutput.title} placeholder="Blog post title here..." required />
		</label>
		<label
			>Subtitle:
			<input name="subtitle" type="text" bind:value={blogOutput.subtitle} placeholder="Blog post subtitle here..." />
		</label>
		<label
			>Author:
			<select name="author" bind:value={blogOutput.author}>
				<option value="Jacob Druery">Jacob Druery</option>
				<option value="Guest Author">Guest Author</option>
			</select>
		</label>
		<label
			>Post Type:
			<select bind:value={blogOutput.postType}>
				<option value="blog">Blog</option>
				<option value="project">Project</option>
			</select>
		</label>
		<label
			>Card Image:
			<input type="file" bind:value={cardImageUpload} bind:files={cardImage} accept="image/jpeg" />
		</label>
	</div>
	<div class="quill-container">
		<div id="editor"></div>
	</div>
</section>

<style>
	#editor {
		min-height: calc(300px);
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

	/* Includes toolbar height in total height */
	:global(.ql-container) {
		height: calc(100% - 42px);
	}

	:global(.ql-toobar span),
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
