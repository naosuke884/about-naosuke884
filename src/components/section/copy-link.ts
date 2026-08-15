export function setupCopySectionLinks(): void {
	const timers = new WeakMap<HTMLButtonElement, number>();

	document
		.querySelectorAll<HTMLButtonElement>("[data-copy-link]")
		.forEach((button) => {
			const tooltip = button.closest<HTMLElement>(".tooltip");
			const defaultTip = tooltip?.dataset.tip ?? "";

			button.addEventListener("click", async () => {
				const url = `${location.origin}${location.pathname}#${button.dataset.copyLink}`;
				await navigator.clipboard.writeText(url);

				button.classList.add("swap-active");
				tooltip?.setAttribute("data-tip", "コピーしました");

				clearTimeout(timers.get(button));
				timers.set(
					button,
					window.setTimeout(() => {
						button.classList.remove("swap-active");
						tooltip?.setAttribute("data-tip", defaultTip);
					}, 1500),
				);
			});
		});
}
