<!-- This component can't be Server Side Rendered, make sure "export const ssr = false" is set in +layout.js -->
<script lang="ts">
	import Quill from 'quill';
	import type { Delta } from 'quill/core';
	import 'quill/dist/quill.snow.css';
	import { onMount } from 'svelte';
	import { htmlOutput, rawOutput } from '$lib/stores/blogOutput.svelte';

	onMount(() => {
		let quill = new Quill('#editor', {
			theme: 'snow'
		});

		// Preserve editor state after previewing
		if (rawOutput.raw) {
			quill.setContents(rawOutput.raw);
		}

		let delta: Delta = quill.getContents();

		// Update the output on text change
		quill.on('text-change', () => {
			htmlOutput.html = quill.getSemanticHTML();
			delta = quill.getContents();
			rawOutput.raw = delta;
		});
	});

	let title = '';

	function titleToSlug(title: string) {
		return title
			.trim() // Remove spaces at the beginning and end of the string
			.toLowerCase()
			.replace(/ /g, '-')
			.replace(/[^\w-]+/g, '');
	}
</script>

<h1>QuillJS</h1>
<main>
	<input type="text" bind:value={title} placeholder="Blog post title here..." />
	<div class="quill-container">
		<div id="editor"></div>
	</div>
</main>
{#if title}
	<a href={`/blog-preview/${titleToSlug(title)}`}>See Preview</a>
{/if}
<h2>Live Preview</h2>
<section>
	{@html htmlOutput.html}
</section>

<style>
	/* Includes toolbar height in total height */
	:global(.ql-container) {
		height: calc(100% - 42px);
	}

	:global(html) {
		font-size: 16px;
		background-color: #151515;
	}

	:global(html *) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(.ql-toobar span),
	* {
		color: #fff;
		font-family: sans-serif;
	}

	:global(.ql-snow .ql-stroke) {
		stroke: #fff;
	}

	:global(.ql-snow .ql-picker) {
		color: #fff;
	}

	:global(.ql-snow .ql-picker-item) {
		color: #ccc;
	}

	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
	}

	input[type='text'] {
		color: #000;
	}

	.quill-container {
		width: 50vw;
		position: relative;
	}

	#editor {
		min-height: calc(300px);
	}
</style>
