<script lang="ts">
	import { clickOutside } from "$lib/utils/clickOutside";
	let { open = $bindable(), confirmFunc, message, body }: { open: boolean; confirmFunc: () => void; message?: string; body?: string } = $props();
	let dialog: HTMLDialogElement;

	$effect(() => {
		if (!!open) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	function handleConfirm() {
		open = false;
		confirmFunc();
	}

	function handleCancel() {
		open = false;
	}
</script>

<dialog class="surface" bind:this={dialog}>
	<div use:clickOutside onoutclick={handleCancel}>
		<h2>Are you sure?</h2>
		{#if !!message}
			<p>{!!message ? message : "This action cannot be undone."}</p>
		{/if}
		{#if !!body}
			<p class="body">{body}</p>
		{/if}
		<div class="dialog-actions">
			<button class="button button-primary" onclick={handleCancel}><span class="material-icons">close</span>Cancel</button>
			<button class="button button-secondary" onclick={handleConfirm}><span class="material-icons">check</span>Confirm</button>
		</div>
	</div>
</dialog>

<style>
	dialog {
		border: none;
		text-align: center;
		margin: auto;
	}

	div.dialog-actions {
		display: flex;
		justify-content: center;
		gap: var(--spacing-m);
		margin-top: var(--spacing-l);
	}

	p.body {
		font-weight: 700;
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
		cursor: pointer;
	}
</style>
