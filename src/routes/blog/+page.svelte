<script lang="ts">
	import type { PageData } from "./$types";
	export let data: PageData;

	function formatDate(dateStr: string): string {
		const [year, month, day] = dateStr.split("-").map(Number);

		// month - 1 because JS months are 0-indexed
		const date = new Date(year, month - 1, day);

		const formatted = new Intl.DateTimeFormat("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric"
		}).format(date);

		return formatted;
	}
</script>

<svelte:head>
	<title>Our Blog</title>
</svelte:head>

<main>
	<section>
		<h1>Blog</h1>
		<p>Welcome to the blog section. Here you can find all the latest posts.</p>
		<hr />
	</section>
	<section>
		<h2>Latest Articles</h2>
		<div class="blog-posts-container">
			{#each data.posts as post}
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
	</section>
	<section>
		<a class="button-link admin" href="/blog/admin">Admin Log In</a>
	</section>
</main>

<style>
	.blog-posts-container {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 1rem;
	}

	.blog-card {
		width: 100%;
		height: 100%;
		padding: 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
		display: flex;
		flex-direction: column;
	}
	.blog-card h3 {
		margin: 0;
		font-size: 1.5rem;
	}

	.blog-card p span {
		font-style: italic;
	}

	.blog-card > p {
		margin-bottom: var(--spacing-l);
	}

	.blog-card a {
		margin-top: auto;
	}

	.blog-card:hover {
		transform: translateY(-0.25rem);
	}

	.admin {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
	}

	@media screen and (min-width: 768px) {
		.blog-posts-container {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media screen and (min-width: 1024px) {
		.blog-posts-container {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media screen and (min-width: 1280px) {
		.blog-posts-container {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media screen and (min-width: 1600px) {
		.blog-posts-container {
			grid-template-columns: repeat(5, 1fr);
		}
	}
</style>
