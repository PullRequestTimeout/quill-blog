<script lang="ts">
	// Quill dependencies
	import BlogEditor from "$lib/components/blog/BlogEditor.svelte";
	import { Delta } from "quill/core";
	import { blogOutput } from "$lib/components/blog/blogOutput.svelte";
	import type { BlogPost, BlogPostState } from "$lib/components/blog/blogOutput.svelte";

	// Utils
	import { clickOutside } from "$lib/utils/clickOutside";

	// TODO: Link to database to fetch draft posts
	import blogDummyData from "$lib/data/blogDummyData.json";
	let blogEditorOpen = $state(false);

	function handleEdit(blog: BlogPost) {
		// Populate the editor with blog data and open the editor
		blogEditorOpen = true;
		Object.assign(blogOutput, blog);
	}
</script>

<section>
	<div class="admin-hero">
		<h2>Blog Admin Panel</h2>
		<p>Welcome to your admin panel. Here you can write and manage blog posts.</p>
		<hr />
	</div>
	<div class="create-post">
		<h3>Create New Post</h3>
		<button class="button button-primary" onclick={() => (blogEditorOpen = true)}>New Blog Post</button>
	</div>
	<hr />
	<div class="draft-posts">
		<h3>Unpublished Drafts</h3>
		{#if blogDummyData.length === 0}
			<p>No draft posts available.</p>
		{:else}
			<ul class="draft-list">
				{#each blogDummyData as blog}
					{#if blog.postState === "draft"}
						<li class="blog-item">
							<div>
								<h4>{blog.title}</h4>
								<p>{blog.subtitle}</p>
								<p class="blog-date">{blog.date}</p>
							</div>
							<div>
								<button
									class="button button-primary"
									onclick={() => {
										handleEdit({ ...blog, delta: blog.delta as Delta, postState: blog.postState as BlogPostState });
									}}>Edit</button
								>
								<button class="button button-secondary">Delete</button>
							</div>
						</li>
					{/if}
				{/each}
			</ul>
		{/if}
	</div>
	<hr />
	<div class="published-posts">
		<h3>Published Posts</h3>
		<ul class="published-list">
			{#if blogDummyData.length === 0}
				<li>No published posts available.</li>
			{:else}
				{#each blogDummyData as blog}
					{#if blog.postState === "published"}
						<li class="blog-item">
							<div>
								<h4>{blog.title}</h4>
								<p>{blog.subtitle}</p>
								<p class="blog-date">{blog.date}</p>
							</div>
							<div>
								<button
									class="button button-primary"
									onclick={() => {
										handleEdit({ ...blog, delta: blog.delta as Delta, postState: blog.postState as BlogPostState });
									}}>Edit</button
								>
								<button class="button button-secondary">Delete</button>
							</div>
						</li>
					{/if}
				{/each}
			{/if}
		</ul>
	</div>
	<hr />
	{#if blogEditorOpen}
		<div class="modal-overlay">
			<div
				class="blog-editor-modal surface"
				use:clickOutside
				onoutclick={() => {
					if (blogEditorOpen) {
						blogEditorOpen = false;
					}
				}}
			>
				<button class="button button-secondary" onclick={() => (blogEditorOpen = false)}>Close</button>
				<BlogEditor />
			</div>
		</div>
	{/if}
</section>

<style>
	section {
		/* padding: 0; */
		width: 70%;
	}

	div.admin-hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--spacing-s);
	}

	div.create-post {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	div.create-post h3 {
		margin: 0;
		transform: translateY(0.2rem);
	}

	ul {
		list-style-type: none;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
		padding: 0;
	}

	li.blog-item {
		background-color: #00000009;
		text-align: left;
		display: flex;
		justify-content: space-between;
		gap: var(--spacing-m);
		align-items: center;
		padding: 1rem;
		border-radius: 2px;
	}

	li.blog-item:hover {
		background-color: #00000010;
	}

	li.blog-item h4 {
		margin: 0;
		font-size: var(--font-body-l, 1.5rem);
	}

	li.blog-item .blog-date {
		color: #505050;
		font-style: italic;
	}

	hr {
		width: 100%;
		border: 1px solid var(--color-black);
		margin: 1rem auto;
	}

	div.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		backdrop-filter: blur(5px);
		transition: opacity 0.3s ease-in-out;
		opacity: 1;
		pointer-events: all;
	}

	div.blog-editor-modal {
		width: clamp(300px, 80vw, 800px);
		margin: 2rem;
		max-height: calc(100vh - 4rem);
		overflow-y: auto;
	}
</style>
