<script lang="ts">
	import { fly } from "svelte/transition";
	let showToast = $state(false);
	let message = $state("");
	export function handleToast(message: string, seconds?: number) {
		showToast = true;
		message = message;
		setTimeout(
			() => {
				showToast = false;
				message = "";
			},
			(!!seconds ? seconds : 3) * 1000
		);
	}
</script>

{#if showToast && message}
	<div class="surface" transition:fly={{ y: 20, duration: 200 }}>
		<p>{message}</p>
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
