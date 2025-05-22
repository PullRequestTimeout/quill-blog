<script lang="ts">
	import type { PageData } from "./$types";
	const { data }: { data: PageData } = $props();

	import { blogOutput } from "$lib/components/blog/blogOutput.svelte";
	import { formatDate } from "$lib/utils/formatDate";
	import type { BlogPost } from "$lib/components/blog/blogOutput.svelte";
	import { databaseHandlers } from "$lib/firebase/db";
	import { goto } from "$app/navigation";

	function readingTimeFromHTML(html: string): number {
		const wordsPerMinute = 200;

		// Create a temporary DOM element to parse HTML
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = html;
		const text = tempDiv.textContent || tempDiv.innerText || "";

		const wordCount = text.trim().split(/\s+/).length;
		return Math.ceil(wordCount / wordsPerMinute);
	}

	let readingTime: number = $state(0);
	$effect(() => {
		readingTime = readingTimeFromHTML(data.blog?.html ?? "");
	});

	function handleSaveDraft() {
		// databaseHandlers.saveDraftBlogPost(data.blog);
	}

	// WIP
	function handleContinueEdit() {
		// if (data.blog?.postState === "draft") {
		// 	goto("/blog/admin");
		// 	return;
		// } else if (data.blog?.postState === "published") {
		// 	goto(`/blog/${data.blog.slug}/edit`);
		// 	return;
		// } else {
		// 	goto("/blog");
		// 	return;
		// }
	}

	// WIP
	async function handlePublish() {
		const isSaved = await databaseHandlers.isBlogSaved(blogOutput);
		// Implement publish functionality
		// if (data.blog?.postState !== "published") {
		// 	// Confirm changes and publish
		// 	databaseHandlers.publishBlogPost(data.blog);
		// } else {
		// 	//merge changes from "preview-id" into "id", delete "preview-id", and then publish
		// }
	}
</script>

<svelte:head>
	<title>Preview - {data.blog?.title} | Blog</title>
	<meta name="description" content={`${data.blog?.title} — ${data.blog?.subtitle}`} />
</svelte:head>

<main>
	<section class="blog-header">
		<h1>{data.blog?.title} - (Preview)</h1>
		<p>{data.blog?.subtitle}</p>
		{#if data.blog?.date}
			<p class="blog-date">{formatDate(data.blog.date)}</p>
		{/if}
		<hr />
	</section>
	<section class="blog-body" class:columns={data.publishedBlogPosts.length > 0}>
		<div class="blog-content">
			{#if !!readingTime}
				<p>Estimated reading time — {readingTime}min</p>
			{/if}
			{@html data.blog?.html}
			<hr />
			<div class="blog-footer">
				<p>Written by <span>{data.blog?.author}</span></p>
				<a class="button-link" href="/blog">Back to blog</a>
			</div>
			<div class="blog-preview-actions">
				<button class="button" onclick={handleContinueEdit}><span class="material-icons">edit</span>Continue Editing</button>
				{#if data.blog?.postState === "draft"}
					<button class="button" onclick={handleSaveDraft}><span class="material-icons">save</span>Save Draft</button>
				{/if}
				<button class="button button-primary" onclick={handlePublish}
					><span class="material-icons">publish</span>Publish{data.blog?.postState === "published" ? " Changes" : ""}</button
				>
			</div>
		</div>
		<div class="recent-blogs">
			{#if data.publishedBlogPosts.length > 1}
				<h2>Recent Articles</h2>
				<div class="blog-posts-container">
					{#each data.publishedBlogPosts.filter((post: BlogPost) => post.slug !== data.blog?.slug).slice(0, 3) as post}
						<div class="blog-card surface">
							<!-- <img src={post.cardImage} alt={post.title} /> -->
							<div>
								<p>{post.author} — <span>{formatDate(post.date)}</span></p>
							</div>
							<h3>{post.title}</h3>
							<p>{post.subtitle}</p>
							<a class="button-link" href={`/blog/${post.slug}`}>Read More </a>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</main>

<style>
	section.blog-header {
		display: flex;
		flex-direction: column;
		text-align: center;
		margin: 4rem 0;
	}

	section.blog-header p.blog-date {
		font-style: italic;
	}

	div.blog-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	div.blog-footer p span {
		font-weight: 700;
	}

	hr {
		margin-block: 2rem;
	}

	section.blog-body {
		display: grid;
		margin-bottom: var(--spacing-l);
	}

	section.blog-body.columns {
		gap: var(--spacing-l);
	}

	div.blog-preview-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-s);
		margin-top: var(--spacing-m);
	}

	div.blog-posts-container {
		display: grid;
		grid-template-rows: repeat(3, 1fr);
		gap: var(--spacing-m);
	}

	div.blog-posts-container div.blog-card {
		padding: var(--spacing-m);
		display: flex;
		flex-direction: column;
	}
	div.blog-card a {
		width: fit-content;
		margin-top: auto;
	}

	@media screen and (min-width: 768px) {
		div.blog-posts-container {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(2, 1fr);
		}
	}

	@media screen and (min-width: 1024px) {
		section.blog-body.columns {
			grid-template-columns: 3fr 1fr;
		}

		div.blog-posts-container {
			grid-template-columns: 1fr;
			grid-template-rows: repeat(3, 1fr);
		}
	}

	@media screen and (min-width: 1440px) {
		section.blog-body.columns {
			gap: var(--spacing-xl);
		}
	}
</style>
