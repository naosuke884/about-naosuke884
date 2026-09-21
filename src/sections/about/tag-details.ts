export function setupTagDetails(): void {
	const triggers = Array.from(
		document.querySelectorAll<HTMLButtonElement>("[data-tag-detail-trigger]"),
	);
	const panels = Array.from(
		document.querySelectorAll<HTMLElement>("[data-tag-detail-panel]"),
	);
	const container = document.querySelector<HTMLElement>(
		"[data-tag-detail-container]",
	);
	if (!container) return;

	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	);
	let activeIndex = -1;

	// 開いている間はheightをautoに戻し、リサイズによる折り返し変化へ追従させる
	container.addEventListener("transitionend", (event) => {
		if (
			event.target === container &&
			event.propertyName === "height" &&
			activeIndex >= 0
		) {
			container.style.height = "auto";
		}
	});

	for (const [index, trigger] of triggers.entries()) {
		trigger.addEventListener("click", () => {
			const prevIndex = activeIndex;
			const nextIndex = prevIndex === index ? -1 : index;
			// heightはauto⇄autoをtransitionできないため、変更前の高さを控えておきpxで固定する
			const startHeight = container.offsetHeight;

			if (prevIndex >= 0) {
				triggers[prevIndex].setAttribute("aria-expanded", "false");
				panels[prevIndex].setAttribute("aria-hidden", "true");
			}

			let targetHeight = 0;
			if (nextIndex >= 0) {
				trigger.setAttribute("aria-expanded", "true");
				panels[nextIndex].removeAttribute("aria-hidden");
				targetHeight = panels[nextIndex].offsetHeight;
			}
			activeIndex = nextIndex;

			// 高さが変わらないときはtransitionendが発火しないため、直接確定値を入れる
			if (prefersReducedMotion.matches || startHeight === targetHeight) {
				container.style.height = nextIndex >= 0 ? "auto" : "0px";
				return;
			}
			container.style.height = `${startHeight}px`;
			void container.offsetHeight; // reflowで開始高さを確定させてからtransitionさせる
			container.style.height = `${targetHeight}px`;
		});
	}
}
