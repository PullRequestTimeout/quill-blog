export function formatDate(dateStr: string): string {
	const [year, month, day] = dateStr.split("-").map(Number);

	// month - 1 because JS months are 0-indexed
	const date = new Date(year, month - 1, day);

	const formatted = new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric"
	}).format(date);

	return formatted;
}
