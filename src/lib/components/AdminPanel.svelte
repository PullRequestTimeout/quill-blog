<script lang="ts">
	// Quill blog dependencies
	import BlogEditor from "$lib/components/blog/BlogEditor.svelte";
	import { blogOutput } from "$lib/components/blog/blogOutput.svelte";
	import { Delta } from "quill/core";
	import type { BlogPost, BlogPostState } from "$lib/components/blog/blogOutput.svelte";

	// Components
	import { handleAlertMessage } from "$lib/stores/uiStore.svelte";
	import Confirmation from "$lib/components/Confirmation.svelte";

	// Utils
	import { clickOutside } from "$lib/utils/clickOutside";

	// TODO: Link to database to fetch draft posts
	import blogDummyData from "$lib/data/blogDummyData.json";

	// Edit blog post functionality
	let blogEditorOpen = $state(false);
	function handleEdit(blog: BlogPost) {
		// Populate the editor with blog data and open the editor
		blogEditorOpen = true;
		Object.assign(blogOutput, blog);
	}

	// Delete blog post functionality
	let confirmationOpen = $state(false);
	let confirmFunc = $state(() => {});
	let confirmMessage = $state("Are you sure you want to delete this post?");
	let bodyMessage = $state("");
	function handleDelete(blog: BlogPost) {
		// Open the confirmation dialog
		confirmationOpen = true;
		bodyMessage = blog.title;
		confirmFunc = () => {
			handleAlertMessage(`Deleted blog post: ${blog.title}`, 5);
		};
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
		<button class="button button-primary" onclick={() => (blogEditorOpen = true)}><span class="material-icons">add</span>New Blog Post</button>
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
							<div class="blog-actions">
								<button
									class="button button-primary"
									onclick={() => {
										handleEdit({ ...blog, delta: blog.delta as Delta, postState: blog.postState as BlogPostState });
									}}><span class="material-icons">edit</span>Edit</button
								>
								<button
									class="button button-secondary"
									onclick={() => handleDelete({ ...blog, delta: blog.delta as Delta, postState: blog.postState as BlogPostState })}
									><span class="material-icons">delete</span>Delete</button
								>
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
							<div class="blog-actions">
								<button
									class="button button-primary"
									onclick={() => {
										handleEdit({ ...blog, delta: blog.delta as Delta, postState: blog.postState as BlogPostState });
									}}><span class="material-icons">edit</span>Edit</button
								>
								<button
									class="button button-secondary"
									onclick={() => handleDelete({ ...blog, delta: blog.delta as Delta, postState: blog.postState as BlogPostState })}
									><span class="material-icons">delete</span>Delete</button
								>
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
				<button
					class="button button-secondary"
					onclick={() => {
						if (blogEditorOpen) {
							blogEditorOpen = false;
						}
					}}>Close</button
				>
				<BlogEditor />
			</div>
		</div>
	{/if}
</section>
<Confirmation bind:open={confirmationOpen} {confirmFunc} message={confirmMessage} body={bodyMessage} />

<style>
	section {
		width: 100%;
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
		/* align-items: center; */
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

	li.blog-item div.blog-actions {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-end;
		gap: var(--spacing-s);
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
		width: clamp(300px, calc(100vw - calc(var(--padding-inline, 1rem)) * 2), 1200px);
		max-height: calc(100vh - 4rem);
		overflow-y: auto;
	}

	@media screen and (min-width: 768px) {
		li.blog-item div.blog-actions {
			flex-direction: row;
			justify-content: flex-end;
			align-items: center;
		}
	}
</style>
