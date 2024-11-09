<script lang="ts">
	import { htmlOutput } from '$lib/stores/blogOutput.svelte';
</script>

<h1>Blog Preview</h1>
<main>
	<section>
		{@html htmlOutput.html}
	</section>
</main>
