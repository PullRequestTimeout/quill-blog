<script lang="ts">
	import type { PageData } from "./$types";
	export let data: PageData;
	console.log(data.blog);

	// function to calculate reading time
	type ContentItem = {
		type: string;
		content: string;
	};

	function readingTime(content: ContentItem[]): number {
		const wordsPerMinute = 200;
		const text = content
			.filter((item) => item.type === "paragraph")
			.map((item) => item.content)
			.join(" ");
		const wordCount = text.split(/\s+/).length;
		return Math.ceil(wordCount / wordsPerMinute);
	}
</script>

<svelte:head>
	<title>{data.blog.title} | Blog</title>
</svelte:head>

<main>
	<section class="blog-header">
		<h1>{data.blog.title}</h1>
		<p>{data.blog.subtitle}</p>
		<hr />
	</section>
	<a class="button-link" href="/blog">Back to blog</a>
	<section>
		<div class="blog-content">
			{@html data.blog.html}
		</div>
	</section>
</main>

<style>
	main {
		padding-inline: var(--padding-inline);
	}

	/* section {
		padding: 0;
	} */

	.blog-header {
		display: flex;
		flex-direction: column;
		text-align: center;
		margin: 4rem 2rem;
	}
</style>
