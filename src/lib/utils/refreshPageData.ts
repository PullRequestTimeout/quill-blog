export function refreshPageData() {
	// Create a link with the current URL, add the attribute "data-sveltekit-reload" to it, then click it
	const link = document.createElement("a");
	link.href = location.href;
	link.setAttribute("data-sveltekit-reload", "true");
	link.style.display = "none";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
