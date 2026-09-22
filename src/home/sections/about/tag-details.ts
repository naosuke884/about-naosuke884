type TagDetailPair = { trigger: HTMLButtonElement; panel: HTMLElement };

export function setupTagDetails(): void {
	const container = document.querySelector<HTMLElement>(
		"[data-tag-detail-container]",
	);
	if (!container) return;

	// トリガーとパネルはDOM上の並び順でなくタグID(data属性の値)で対応付ける
	const pairs: TagDetailPair[] = [];
	for (const trigger of document.querySelectorAll<HTMLButtonElement>(
		"[data-tag-detail-trigger]",
	)) {
		const panel = container.querySelector<HTMLElement>(
			`[data-tag-detail-panel="${trigger.dataset.tagDetailTrigger}"]`,
		);
		if (panel) pairs.push({ trigger, panel });
	}

	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	);
	// 初期選択タグはサーバー側でaria-expanded="true"を付けて描画済みなので、DOMから引き継ぐ
	let active =
		pairs.find(
			({ trigger }) => trigger.getAttribute("aria-expanded") === "true",
		) ?? null;

	// 開いている間はheightをautoに戻し、リサイズによる折り返し変化へ追従させる
	container.addEventListener("transitionend", (event) => {
		if (
			event.target === container &&
			event.propertyName === "height" &&
			active
		) {
			container.style.height = "auto";
		}
	});

	for (const pair of pairs) {
		pair.trigger.addEventListener("click", () => {
			const prev = active;
			const next = prev === pair ? null : pair;
			// heightはauto⇄autoをtransitionできないため、変更前の高さを控えておきpxで固定する
			const startHeight = container.offsetHeight;

			if (prev) {
				prev.trigger.setAttribute("aria-expanded", "false");
				prev.panel.setAttribute("aria-hidden", "true");
			}

			let targetHeight = 0;
			if (next) {
				next.trigger.setAttribute("aria-expanded", "true");
				next.panel.removeAttribute("aria-hidden");
				targetHeight = next.panel.offsetHeight;
			}
			active = next;

			// 高さが変わらないときはtransitionendが発火しないため、直接確定値を入れる
			if (prefersReducedMotion.matches || startHeight === targetHeight) {
				container.style.height = next ? "auto" : "0px";
				return;
			}
			container.style.height = `${startHeight}px`;
			void container.offsetHeight; // reflowで開始高さを確定させてからtransitionさせる
			container.style.height = `${targetHeight}px`;
		});
	}
}
