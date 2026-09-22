/**
 * タグ一覧(flex-wrap)の折り返しが行ごとに偏らないよう、行数を変えない範囲で
 * コンテナのmax-widthを最小まで詰めて各行の詰まり具合を均す。
 * CSSのtext-wrap:balanceはflexに効かず、Firefoxはインライン配置にしても
 * atomic inlineを均してくれないため、JSで同等のことをする。
 */
export function setupTagBalance(): void {
	const container = document.querySelector<HTMLElement>("[data-tag-balance]");
	if (!container) return;

	const countRows = (): number => {
		const tops = new Set<number>();
		for (const child of container.children) {
			tops.add((child as HTMLElement).offsetTop);
		}
		return tops.size;
	};

	const balance = (): void => {
		container.style.maxWidth = "";
		const naturalWidth = container.getBoundingClientRect().width;
		const naturalRows = countRows();
		if (naturalRows <= 1) return;

		// 行数がnaturalRowsのまま保てる最小幅を二分探索する
		let low = 0;
		let high = naturalWidth;
		for (let i = 0; i < 12; i++) {
			const mid = (low + high) / 2;
			container.style.maxWidth = `${mid}px`;
			if (countRows() > naturalRows) {
				low = mid;
			} else {
				high = mid;
			}
		}
		container.style.maxWidth = `${Math.ceil(high)}px`;
	};

	balance();
	// Webフォント適用でタグ幅が変わるため、フォント確定後にもう一度均す
	document.fonts?.ready.then(balance);

	let scheduled = false;
	window.addEventListener("resize", () => {
		if (scheduled) return;
		scheduled = true;
		requestAnimationFrame(() => {
			scheduled = false;
			balance();
		});
	});
}
