export let uiStore = $state({
	loggedIn: false,
	loading: false,
	alertMessage: "",
	blogEditorOpen: false
});

// Used to control the toast component. If no time is given, it will default to 3 seconds.
export function handleAlertMessage(message: string, seconds?: number) {
	uiStore.alertMessage = message;
	setTimeout(
		() => {
			uiStore.alertMessage = "";
		},
		(!!seconds ? seconds : 3) * 1000
	);
}
