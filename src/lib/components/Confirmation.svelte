<script lang="ts">
	import { clickOutside } from "$lib/utils/clickOutside";
	let { open = $bindable(), confirmFunc, message }: { open: boolean; confirmFunc: () => void; message?: string } = $props();
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

<dialog class="surface" bind:this={dialog} use:clickOutside onoutclick={handleCancel}>
	<h2>Are you sure?</h2>
	<p>{!!message ? message : "This action cannot be undone."}</p>
	<div class="dialog-actions">
		<button class="button button-secondary" onclick={handleCancel}>Cancel</button>
		<button class="button button-primary" onclick={handleConfirm}>Confirm</button>
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
		margin-top: 1rem;
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}
</style>
