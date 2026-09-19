export function setupTagDetails(): void {
	const triggers = document.querySelectorAll<HTMLButtonElement>(
		"[data-tag-detail-trigger]",
	);
	const panels = document.querySelectorAll<HTMLElement>(
		"[data-tag-detail-panel]",
	);
	const closeAll = () => {
		for (const trigger of triggers) {
			trigger.setAttribute("aria-expanded", "false");
		}
		for (const panel of panels) {
			// aria-hidden="true"がスタイルフックを兼ね、grid-rowsが0frに潰れる
			panel.setAttribute("aria-hidden", "true");
		}
	};
	for (const trigger of triggers) {
		trigger.addEventListener("click", () => {
			const wasOpen = trigger.getAttribute("aria-expanded") === "true";
			closeAll();
			if (wasOpen) return;
			trigger.setAttribute("aria-expanded", "true");
			document
				.querySelector(
					`[data-tag-detail-panel="${trigger.dataset.tagDetailTrigger}"]`,
				)
				?.removeAttribute("aria-hidden");
		});
	}
}
