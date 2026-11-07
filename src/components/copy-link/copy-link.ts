export function setupCopyLinkButtons(): void {
	const timers = new WeakMap<HTMLButtonElement, number>();

	document
		.querySelectorAll<HTMLButtonElement>("[data-copy-link]")
		.forEach((button) => {
			const wrapper = button.parentElement;
			const copiedTip =
				wrapper?.querySelector<HTMLElement>("[data-copied-tip]");
			const status = wrapper?.querySelector<HTMLElement>("[data-copy-status]");

			button.addEventListener("click", async () => {
				const hash = button.dataset.copyLink;
				// location基準だと*.pages.devやプレビュー経由のドメインを拾うため、
				// 共有用の正規URLとしてog:urlを使う。末尾のスラッシュはルート以外では除く
				const ogUrl = document.querySelector<HTMLMetaElement>(
					'meta[property="og:url"]',
				)?.content;
				const page = new URL(ogUrl || location.href);
				const path =
					page.pathname === "/" ? "/" : page.pathname.replace(/\/$/, "");
				const url = `${page.origin}${path}${hash ? `#${hash}` : ""}`;
				let copied = true;
				try {
					await navigator.clipboard.writeText(url);
				} catch {
					copied = false;
				}

				if (copiedTip) {
					copiedTip.textContent = copied
						? "コピーしました"
						: "コピーできませんでした";
				}
				if (status) {
					status.textContent = copied
						? "リンクをコピーしました"
						: "リンクをコピーできませんでした";
				}
				// 失敗時はアイコンをチェックに切り替えず、ツールチップだけで結果を出す
				if (wrapper) wrapper.dataset.state = copied ? "copied" : "failed";

				clearTimeout(timers.get(button));
				timers.set(
					button,
					window.setTimeout(() => {
						if (wrapper) delete wrapper.dataset.state;
						if (status) status.textContent = "";
					}, 1500),
				);
			});
		});
}
