<script lang="ts">
	let {
		value,
		shownValue = value,
		copyMessage = "Copied",
		class: className = "",
		disabled,
	} = $props();

	let copied: boolean = $state(false);
	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(value);
			// Show copied message for 2 seconds
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	}
</script>

<button class={className} onclick={copyToClipboard} {disabled}>
	{copied ? copyMessage : String(shownValue)}
</button>
