<script lang="ts">
	// Imports
	import { authHandlers } from "$lib/firebase/auth";
	import { handleAlertMessage } from "$lib/stores/uiStore.svelte";

	// State management
	let email: string = $state("");
	let password: string = $state("");
	type InputType = "text" | "password";
	let inputType: InputType = $state("password");
	let forgotPassword: boolean = $state(false);
	let rememberUser: boolean = $state(false);

	function handleLogin(event: Event) {
		event.preventDefault();
		if (!email || !password) {
			handleAlertMessage("Please fill in all fields.");
			return;
		}
		authHandlers.login(email, password).catch((error) => {
			handleAlertMessage(error.message.toString());
		});
	}
</script>

<form onsubmit={handleLogin} class="surface">
	<div class="form-container">
		<!-- <img src="" alt=""> [Logo] -->
		{#if !forgotPassword}
			<h2>Welcome back</h2>
			<label
				>Email address:<span>*</span>
				<input class="text-input" type="email" placeholder="email@example.com" bind:value={email} required />
			</label>
			<label
				>Password:<span>*</span>
				<div class="password-input">
					<input class="text-input" type={inputType} placeholder="**********" bind:value={password} required />
					{#if inputType === "password"}
						<button type="button" onclick={() => (inputType = "text")}>Show</button>
					{:else}
						<button type="button" onclick={() => (inputType = "password")}>Hide</button>
					{/if}
				</div>
			</label>
			<label>
				<input type="checkbox" bind:checked={rememberUser} /> Remember me
			</label>
			<button class="button button-primary" type="submit">Log In</button>
			<button class="button button-link" type="button" onclick={() => (forgotPassword = true)}>Forgot Password?</button>
		{:else if forgotPassword}
			<label
				>Email address:<span>*</span>
				<input class="text-input" type="email" placeholder="email@example.com" bind:value={email} required />
			</label>
			<div>
				<button class="button button-primary" type="submit">Send Password Reset</button>
				<button class="button button-link" type="button" onclick={() => (forgotPassword = false)}>Back to Login</button>
			</div>
		{/if}
	</div>
</form>

<style>
	form {
		width: fit-content;
	}

	label span {
		color: var(--color-error, red);
	}

	label input {
		margin-top: var(--spacing-s);
	}

	.form-container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-m);
	}

	.password-input {
		position: relative;
	}

	.password-input button {
		position: absolute;
		right: var(--spacing-s, 0.25rem);
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		cursor: pointer;
	}
</style>
