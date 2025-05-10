<script lang="ts">
	import { clickOutside } from "$lib/utils/clickOutside";
	import { databaseHandlers } from "$lib/firebase/db";
	import { onMount } from "svelte";
	import { blogOutput } from "$lib/components/blog/blogOutput.svelte";
	import { handleAlertMessage } from "$lib/stores/uiStore.svelte";
	let { selectedTags = $bindable([]) }: { selectedTags?: string[] } = $props();
	let tags: string[] = $state([]);
	let tagSelectorOpen = $state(false);
	let tagInputOpen = $state(false);
	let tagInputValue = $state("");

	function handleToggleTagSelectorOpen() {
		tagSelectorOpen = !tagSelectorOpen;
		if (tagInputOpen) {
			tagInputOpen = false;
			tagSelectorOpen = false;
		}
	}

	function handleDeselectTag(tag: string) {
		selectedTags = selectedTags.filter((t) => t !== tag);
	}

	async function handleAddNewTag() {
		if (tagInputValue.trim() === "") return;
		const newTag = tagInputValue.trim().toLowerCase();
		if (tags.includes(newTag)) {
			handleAlertMessage("Tag already exists!");
			return;
		}
		await databaseHandlers.addNewTag(newTag);
		tags = await databaseHandlers.getAllTags();
		selectedTags.push(newTag);
		tagInputValue = "";
		tagInputOpen = false;
	}

	onMount(() => {
		databaseHandlers.getAllTags().then((fetchedTags) => {
			tags = fetchedTags;
		});
		if (blogOutput.tags) {
			selectedTags = blogOutput.tags;
		}
	});
</script>

<div
	class="tag-selector-container"
	use:clickOutside
	onoutclick={() => {
		tagSelectorOpen = false;
		tagInputOpen = false;
	}}
>
	<button class="button button-primary" onclick={handleToggleTagSelectorOpen}>
		<span class="material-icons">tag</span>
		Select Tags
	</button>

	{#if selectedTags.length > 0}
		<div class="selected-tags">
			{#each selectedTags as tag}
				<span class="tag">{tag}<button onclick={() => handleDeselectTag(tag)}><span class="material-icons">close</span></button></span>
			{/each}
		</div>
	{/if}
	{#if tagSelectorOpen}
		{#key tags}
			<div class="tag-selector-list surface">
				{#if tags.length > 0}
					{#each tags as tag}
						<label class="tag-selector">
							<input type="checkbox" bind:group={selectedTags} value={tag} />
							<span>{tag}</span>
						</label>
					{/each}
				{/if}
				<button
					class="button button-primary"
					onclick={() => {
						tagInputOpen = true;
						tagSelectorOpen = false;
					}}><span class="material-icons">add</span>New Tag</button
				>
			</div>
		{/key}
	{/if}
	{#if tagInputOpen}
		<div class="surface tag-input-container">
			<input
				type="text"
				class="text-input"
				bind:value={tagInputValue}
				placeholder="Enter new tag"
				onkeydown={(e) => e.key === "Enter" && handleAddNewTag()}
			/>
			<div class="tag-input-buttons">
				<button
					class="button button-secondary"
					onclick={() => {
						tagInputOpen = false;
						tagInputValue = "";
						tagSelectorOpen = true;
					}}><span class="material-icons">close</span>Cancel</button
				>
				<button class="button button-primary" onclick={handleAddNewTag}><span class="material-icons">add</span>Add Tag</button>
			</div>
		</div>
	{/if}
</div>

<style>
	div.tag-selector-container,
	div.tag-input-buttons {
		position: relative;
		display: inline-block;
		width: fit-content;
		display: flex;
		gap: var(--spacing-s);
		align-items: center;
	}

	div.tag-selector-list,
	div.tag-input-container {
		position: absolute;
		top: calc(100% + var(--spacing-s));
		left: 0;
		z-index: 1;
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-s);
		padding: var(--spacing-m);
		max-height: 15rem;
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: thin;
	}

	input[type="checkbox"] {
		accent-color: var(--color-primary, #000);
	}

	div.tag-selector-list button.button-primary {
		padding: var(--spacing-xs) var(--spacing-s);
	}

	div.tag-selector-list button.button-primary,
	div.tag-selector-list button.button-primary span {
		font-size: 0.875rem;
	}

	div.selected-tags {
		display: flex;
		gap: var(--spacing-s);
		flex-wrap: wrap;
	}

	span.tag,
	label.tag-selector {
		text-transform: capitalize;
	}

	span.tag {
		background-color: #00000010;
		border-radius: 2rem;
		height: 2rem;
		padding: var(--spacing-xs) var(--spacing-s) var(--spacing-xs) var(--spacing-m);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		font-weight: 600;
	}

	span.tag button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		border-radius: 0.5rem;
		width: 1rem;
		height: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	span.tag button:hover {
		background-color: #00000015;
	}

	span.tag button span {
		font-size: 0.75rem;
		transform: translate(0.005rem, 0);
	}
</style>
