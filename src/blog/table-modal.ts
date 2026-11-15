// 記事本文の表のうち、本文幅に収まらず横スクロールになっているものに「全体表示」ボタンを出し、
// 押すと表を画面いっぱいのモーダル([slug].astroのdialog)に写して開く。
// ボタンをビルド時(markdown-tables.ts)に出力しないのは、収まるかどうかが画面幅で変わり、
// 収まっている表にまで押しても見え方の変わらないボタンが付くため
export function setupTableModal(): void {
	const dialog =
		document.querySelector<HTMLDialogElement>("[data-table-modal]");
	const body = dialog?.querySelector<HTMLElement>("[data-table-modal-body]");
	const template = document.querySelector<HTMLTemplateElement>(
		"[data-table-tools-template]",
	);
	if (!dialog || !body || !template) return;

	const toolsByScroll = new Map<Element, HTMLElement>();
	const observer = new ResizeObserver((entries) => {
		for (const { target } of entries) {
			const tools = toolsByScroll.get(target);
			if (tools) tools.hidden = target.scrollWidth <= target.clientWidth;
		}
	});

	for (const scroll of document.querySelectorAll(".blog-body .table-scroll")) {
		const table = scroll.querySelector("table");
		if (!table) continue;

		const tools = template.content.firstElementChild?.cloneNode(true);
		if (!(tools instanceof HTMLElement)) continue;
		tools.querySelector("button")?.addEventListener("click", () => {
			// 開いている間に重ねて押されたら何もしない(showModal()は開いているdialogに呼ぶと例外になる)
			if (dialog.open) return;
			// 表を移動せず複製するのは、本文側が空になって高さが変わり、閉じたときにスクロール位置がずれるため
			body.replaceChildren(table.cloneNode(true));
			dialog.showModal();
			fitTable(body);
		});
		scroll.before(tools);

		toolsByScroll.set(scroll, tools);
		observer.observe(scroll);
	}

	// closeイベントは閉じた少し後に届く。その間にもう一度開かれていたら、開いている表を消さない
	dialog.addEventListener("close", () => {
		if (!dialog.open) body.replaceChildren();
	});
	// 開いたまま端末を横向きにしたときも収め直す
	window.addEventListener("resize", () => {
		if (dialog.open) fitTable(body);
	});

	// closedby="any"(外側のクリックで閉じる)に対応していないブラウザ(Safari)向け。
	// event.targetではなく座標で判定するのは、dialog自身の余白のクリックもtargetがdialogになるため
	if (!("closedBy" in HTMLDialogElement.prototype)) {
		const isOutside = (event: PointerEvent) => {
			const rect = dialog.getBoundingClientRect();
			return (
				event.clientX < rect.left ||
				event.clientX > rect.right ||
				event.clientY < rect.top ||
				event.clientY > rect.bottom
			);
		};
		let pressedOutside = false;
		dialog.addEventListener("pointerdown", (event) => {
			pressedOutside = isOutside(event);
		});
		// 押した位置と離した位置の両方が外側のときだけ閉じる(表の文字を選択するドラッグが外で終わっても閉じない)
		dialog.addEventListener("pointerup", (event) => {
			if (pressedOutside && isOutside(event)) dialog.close();
		});
	}
}

// モーダルの幅に収まらない表を、収まる倍率まで縮める。倍率はCSS変数で渡し、縮小自体はCSSのzoomに任せる。
// transform: scaleにしないのは、レイアウト上の大きさが変わらず、縮めた後も元の幅ぶんのスクロール領域が残るため。
// 倍率に下限を設けないのは、狭い画面で列の多い表が下限に当たり、縮小したうえに横スクロールも残るため
function fitTable(body: HTMLElement): void {
	const table = body.querySelector("table");
	if (!table) return;
	// 縮小前の幅を測るため、前回の倍率を外す
	body.style.removeProperty("--table-zoom");
	const style = getComputedStyle(body);
	const padding =
		Number.parseFloat(style.paddingLeft) +
		Number.parseFloat(style.paddingRight);
	let zoom = 1;
	// 縮めた結果、縦スクロールバーが出たり消えたりして使える幅が変わることがあるので、収まるまで測り直す。
	// 端数の丸めで1〜2pxはみ出さないよう、倍率は切り捨てる
	for (let attempt = 0; attempt < 3; attempt++) {
		const overflow = body.scrollWidth / body.clientWidth;
		if (overflow <= 1) break;
		const tableWidth = table.getBoundingClientRect().width;
		const fitted = (body.clientWidth - padding) / tableWidth;
		zoom = Math.floor(zoom * Math.min(fitted, 1 / overflow) * 100) / 100;
		body.style.setProperty("--table-zoom", String(zoom));
	}
}
