<script lang="ts">
	import { slide } from "svelte/transition";

	// Quill blog dependencies
	import BlogEditor from "$lib/components/blog/BlogEditor.svelte";
	import { blogOutput } from "$lib/components/blog/blogOutput.svelte";
	import { Delta } from "quill/core";
	import type { BlogPost, BlogPostState } from "$lib/components/blog/blogOutput.svelte";

	// Components & Utils
	import { handleAlertMessage } from "$lib/stores/uiStore.svelte";
	import Confirmation from "$lib/components/Confirmation.svelte";
	import { formatDate } from "$lib/utils/formatDate";

	import { databaseHandlers } from "$lib/firebase/db";
	// TODO: Link to database to fetch draft posts
	import blogDummyData from "$lib/data/blogDummyData.json";

	// Edit blog post functionality
	let blogEditorOpen = $state(false);
	function handleEdit(blog: BlogPost) {
		// Populate the editor with blog data and open the editor
		Object.assign(blogOutput, blog);
		blogEditorOpen = true;
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

	let displayDeletedPosts = $state(false);
	function toggleDeletedPosts() {
		displayDeletedPosts = !displayDeletedPosts;
	}

	// Restore blog post functionality
	function handleRestore(blog: BlogPost) {
		// Open the confirmation dialog
		confirmationOpen = true;
		confirmMessage = "Are you sure you want to restore this post to drafts?";
		bodyMessage = blog.title;
		confirmFunc = () => {
			databaseHandlers.restoreBlogPost(blog);
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
								<p class="blog-date">{formatDate(blog.date)}</p>
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
								<p class="blog-date">{formatDate(blog.date)}</p>
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
	<button class="button deleted-posts-button" class:open={displayDeletedPosts} onclick={toggleDeletedPosts}
		>See Deleted Posts <span class="material-icons">arrow_drop_down</span></button
	>
	{#if displayDeletedPosts}
		<div class="deleted-posts" transition:slide={{ duration: 200 }}>
			{#if blogDummyData.filter((blog) => {
				return blog.postState === "deleted";
			}).length === 0}
				<p>No deleted posts available.</p>
			{:else}
				<h3>Deleted Posts</h3>
				{#each blogDummyData as blog}
					{#if blog.postState === "deleted"}
						<ul class="deleted-list">
							<li class="blog-item">
								<div>
									<h4>{blog.title}</h4>
									<p>{blog.subtitle}</p>
									<p class="blog-date">{formatDate(blog.date)}</p>
								</div>
								<div class="blog-actions">
									<button
										class="button button-primary"
										onclick={() => {
											handleRestore({ ...blog, delta: blog.delta as Delta, postState: blog.postState as BlogPostState });
										}}><span class="material-icons">restore</span>Restore</button
									>
								</div>
							</li>
						</ul>
					{/if}
				{/each}
			{/if}
		</div>
	{/if}
	<hr />
</section>

<!-- Reinitialises component to trigger onMount population -->
{#if blogEditorOpen}
	<BlogEditor bind:blogEditorOpen />
{/if}

<Confirmation bind:confirmationOpen {confirmFunc} message={confirmMessage} body={bodyMessage} />

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

	button.deleted-posts-button,
	button.deleted-posts-button span {
		transition: 0.2s;
	}

	button.deleted-posts-button.open {
		margin-bottom: 1rem;
	}

	button.deleted-posts-button.open span {
		transform: rotate(180deg);
	}

	@media screen and (min-width: 768px) {
		li.blog-item div.blog-actions {
			flex-direction: row;
			justify-content: flex-end;
			align-items: center;
		}
	}
</style>
