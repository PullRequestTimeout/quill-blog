<!-- This component can't be Server Side Rendered, make sure "export const ssr = false" is set in +layout.js -->
<script lang="ts">
	import BlogEditor from "$lib/components/blog/BlogEditor.svelte";
</script>

<main>
	<h1>QuillJS</h1>
	<BlogEditor />
</main>

<style>
</style>
