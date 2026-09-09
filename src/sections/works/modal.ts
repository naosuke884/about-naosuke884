export function setupWorksModal(): void {
	const triggers = document.querySelectorAll<HTMLElement>(
		"[data-work-modal-trigger]",
	);
	for (const trigger of triggers) {
		trigger.addEventListener("click", () => {
			const dialog = document.querySelector<HTMLDialogElement>(
				`#work-modal-${trigger.dataset.workModalTrigger}`,
			);
			dialog?.showModal();
		});
	}
}
