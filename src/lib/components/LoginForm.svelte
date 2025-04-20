<script lang="ts">
	// Imports
	import { authHandlers } from "$lib/firebase/auth";
	import { handleAlertMessage } from "$lib/stores/uiStore.svelte";

	// State management
	let email: string = $state("");
	let password: string = $state("");
	type InputType = "text" | "password";
	let inputType: InputType = $state("password");

	function handleLogin(event: Event) {
		event.preventDefault();
		if (!email || !password) {
			handleAlertMessage("Please fill in all fields.");
			return;
		}
		authHandlers
			.login(email, password)
			.then(() => {
				handleAlertMessage("Login successful!");
			})
			.catch((error) => {
				handleAlertMessage(error.message.toString());
			});
	}
</script>

<form onsubmit={handleLogin} class="surface">
	<div class="form-container">
		<!-- <img src="" alt=""> [Logo] -->
		<h2>Welcome back</h2>
		<label
			>Email address:<span>*</span>
			<input class="text-input" type="email" placeholder="email@example.com" bind:value={email} required />
		</label>
		<label
			>Password:<span>*</span>
			<div>
				<input class="text-input" type={inputType} placeholder="**********" bind:value={password} required />
				{#if inputType === "password"}
					<button type="button" onclick={() => (inputType = "text")}>Show</button>
				{:else}
					<button type="button" onclick={() => (inputType = "password")}>Hide</button>
				{/if}
			</div>
		</label>
		<button class="button button-primary" type="submit">Log In</button>
	</div>
</form>

<style>
	.form-container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-m);
	}
</style>
