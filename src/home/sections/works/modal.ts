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
			if (!video) return;
			if (prefersReducedMotion.matches) {
				// 自動再生しないので、再生手段として最初からコントロールを見せる
				video.controls = true;
			} else {
				video.play().catch(() => {});
			}
		});
	}
	for (const dialog of document.querySelectorAll<HTMLDialogElement>(
		"[id^='work-modal-']",
	)) {
		const video = dialog.querySelector("video");
		if (!video) continue;
		// コントロールは初期表示せず、操作の意思を示したときに初めて出す (#52)
		video.addEventListener("click", () => {
			video.controls = true;
		});
		video.addEventListener("keydown", (event) => {
			if (video.controls) return;
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				video.controls = true;
			}
		});
		dialog.addEventListener("close", () => {
			video.pause();
			video.currentTime = 0;
			video.controls = false;
		});
	}
}
