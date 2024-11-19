<script lang="ts">
	import { blogOutput } from "$lib/components/blog/blogOutput.svelte";
</script>

<h1>Blog Preview</h1>
<main>
	<section>
		{@html blogOutput.html}
	</section>
</main>
