<script lang="ts">
	import { uiStore } from "$lib/stores/uiStore.svelte";
	import LoginForm from "$lib/components/LoginForm.svelte";

	function handleLogout(event: Event) {
		event.preventDefault();
		console.log("Logging out...");
	}
</script>

{#if !uiStore.loggedIn}
	<LoginForm />
{:else if uiStore.loggedIn}
	<div>Admin Panel</div>
	<button onclick={handleLogout}>Log Out</button>
{/if}
