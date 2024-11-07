<script lang="ts">
	import Quill from 'quill';
	import Delta from 'quill';
	import 'quill/dist/quill.snow.css';
	import { onMount } from 'svelte';
	import { htmlOutput, rawOutput } from '$lib/stores/blogOutput.svelte';

	onMount(() => {
		let quill = new Quill('#editor', {
			theme: 'snow'
		});
		quill.on('text-change', () => {
			htmlOutput.html = quill.getSemanticHTML();
			rawOutput.raw = quill.getContents();
		});
	});

	$effect(() => {
		previewBlog(htmlOutput.html);
	});

	function previewBlog(htmlData: string) {
		console.log(htmlData);
	}
</script>

<h1>QuillJS</h1>
<main>
	<div class="quill-container">
		<div id="editor"></div>
	</div>
</main>
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
		justify-content: center;
		position: relative;
	}

	.quill-container {
		width: 50vw;
		position: relative;
	}

	#editor {
		min-height: calc(300px);
	}
</style>
