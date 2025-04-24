<script lang="ts">
	// Imports
	import LoginForm from "$lib/components/LoginForm.svelte";
	import AdminPanel from "$lib/components/AdminPanel.svelte";
	import { uiStore } from "$lib/stores/uiStore.svelte";
	import { authHandlers } from "$lib/firebase/auth";
</script>

<main>
	<a class="button-link" href="/blog">Back</a>
	{#if !uiStore.loggedIn}
		<LoginForm />
	{:else if uiStore.loggedIn}
		<AdminPanel />
		<button class="logout button button-primary" onclick={() => authHandlers.logout()}><span class="material-icons">logout</span>Log Out</button>
	{/if}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 5rem;
	}

	a.button-link,
	button.logout {
		position: fixed;
		top: 1rem;
	}

	button.logout {
		right: 1rem;
	}

	a.button-link {
		left: 1rem;
	}
</style>
