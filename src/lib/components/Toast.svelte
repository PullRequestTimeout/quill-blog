<script lang="ts">
	import { fly } from "svelte/transition";
	import { uiStore } from "$lib/stores/uiStore.svelte";
</script>

{#if uiStore.alertMessage && !uiStore.blogEditorOpen}
	<div class="surface" transition:fly={{ y: 20, duration: 200 }}>
		<p>{uiStore.alertMessage}</p>
	</div>
{/if}

<style>
	div {
		position: fixed;
		bottom: 2rem;
		right: 50%;
		transform: translateX(-50%);
	}

	@media screen and (min-width: 768px) {
		div {
			right: 2rem;
			transform: translateX(0);
		}
	}
</style>
