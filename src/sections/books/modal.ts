export function setupBooksModal(): void {
	const triggers = document.querySelectorAll<HTMLElement>(
		"[data-book-modal-trigger]",
	);
	for (const trigger of triggers) {
		trigger.addEventListener("click", () => {
			document
				.querySelector<HTMLDialogElement>(
					`#book-modal-${trigger.dataset.bookModalTrigger}`,
				)
				?.showModal();
		});
	}
}
