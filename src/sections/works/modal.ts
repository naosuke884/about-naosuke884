export function setupWorksModal(): void {
	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	);
	const triggers = document.querySelectorAll<HTMLElement>(
		"[data-work-modal-trigger]",
	);
	for (const trigger of triggers) {
		trigger.addEventListener("click", () => {
			const dialog = document.querySelector<HTMLDialogElement>(
				`#work-modal-${trigger.dataset.workModalTrigger}`,
			);
			if (!dialog) return;
			dialog.showModal();
			const video = dialog.querySelector("video");
			if (video && !prefersReducedMotion.matches) {
				video.play().catch(() => {});
			}
		});
	}
	for (const dialog of document.querySelectorAll<HTMLDialogElement>(
		"[id^='work-modal-']",
	)) {
		dialog.addEventListener("close", () => {
			const video = dialog.querySelector("video");
			if (video) {
				video.pause();
				video.currentTime = 0;
			}
		});
	}
}
