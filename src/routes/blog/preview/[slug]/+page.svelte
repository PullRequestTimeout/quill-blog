<script lang="ts">
	import type { PageData } from "./$types";
	const { data }: { data: PageData } = $props();

	import { blogOutput } from "$lib/components/blog/blogOutput.svelte";
	import { formatDate } from "$lib/utils/formatDate";
	import type { BlogPost } from "$lib/components/blog/blogOutput.svelte";
	import { databaseHandlers } from "$lib/firebase/db";
	import { goto } from "$app/navigation";

	import Confirmation from "$lib/components/Confirmation.svelte";
	import { handleAlertMessage, uiStore } from "$lib/stores/uiStore.svelte";
	let confirmationOpen = $state(false);
	let confirmFunc = $state(() => {});
	let message = $state("");

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

	async function handleContinueEdit() {
		// Populate the blogOutput with the current blog data and navigate to the editor
		Object.assign(blogOutput, data.blog);
		uiStore.blogEditorOpen = true;
		if (data.blog?.id.includes("preview")) {
			blogOutput.id = data.blog.id.replace(/^preview-/, "");
			await databaseHandlers.permanentDeleteBlogPost(data.blog);
		}
		goto(`/blog/admin`);
	}

	async function handlePublish() {
		const blogObject: BlogPost = {
			...data.blog,
			id: data.blog.id.includes("preview-") ? data.blog.id.replace(/^preview-/, "") : data.blog.id,
			postState: "published",
			date: new Date().toLocaleDateString("en-CA", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit"
			})
		};

		confirmationOpen = true;
		message = "Are you sure you're ready to publish this blog post?";
		confirmFunc = async () => {
			if (data.blog?.id.includes("preview")) {
				await databaseHandlers.permanentDeleteBlogPost(data.blog);
			}
			await databaseHandlers.publishBlogPost(blogObject);
			handleAlertMessage("Blog post published successfully.");
			setTimeout(() => {
				goto(`/blog/${data.blog.slug}`);
			}, 2000);
		};
	}

	async function handleDiscardChanges() {
		confirmationOpen = true;
		message = "Are you sure you want to discard your changes? This action cannot be undone.";
		confirmFunc = async () => {
			if (data.blog?.id.includes("preview")) {
				await databaseHandlers.permanentDeleteBlogPost(data.blog);
			}
			handleAlertMessage("Changes discarded.", 5000);
			setTimeout(() => {
				goto(`/blog/admin`);
			}, 2000);
		};
	}
</script>

<svelte:head>
	<title>Preview - {data.blog?.title} | Blog</title>
	<meta name="description" content={`${data.blog?.title} — ${data.blog?.subtitle}`} />
</svelte:head>

<main>
	{#if data.blog?.heroImage}
		<img class="blog-hero-image" src={data.blog?.heroImage} alt="hero" />
	{/if}
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
				{#if data.blog?.id.includes("preview")}
					<button class="button" onclick={handleDiscardChanges}><span class="material-icons">delete</span>Discard Changes</button>
				{/if}
				<button class="button" onclick={handleContinueEdit}><span class="material-icons">edit</span>Continue Editing</button>
				<button class="button button-primary" onclick={handlePublish}
					><span class="material-icons">publish</span>Publish{data.blog?.id.includes("preview") ? " Changes" : ""}</button
				>
			</div>
		</div>
		<div class="recent-blogs">
			{#if data.publishedBlogPosts.length > 1}
				<h2>Recent Articles</h2>
				<div class="blog-posts-container">
					{#each data.publishedBlogPosts.filter((post: BlogPost) => post.slug !== data.blog?.slug).slice(0, 3) as post}
						<div class="blog-card surface">
							<!-- <img src={post.heroImage} alt={post.title} /> -->
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
<Confirmation bind:confirmationOpen {confirmFunc} {message} />

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
