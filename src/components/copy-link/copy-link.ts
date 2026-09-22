export function setupCopyLinkButtons(): void {
	const timers = new WeakMap<HTMLButtonElement, number>();

	document
		.querySelectorAll<HTMLButtonElement>("[data-copy-link]")
		.forEach((button) => {
			const wrapper = button.parentElement;
			const hoverTip = wrapper?.querySelector<HTMLElement>("[data-copy-tip]");
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
				if (copied) button.classList.add("swap-active");
				hoverTip?.classList.add("opacity-0!");
				copiedTip?.classList.add("opacity-100!");

				clearTimeout(timers.get(button));
				timers.set(
					button,
					window.setTimeout(() => {
						button.classList.remove("swap-active");
						hoverTip?.classList.remove("opacity-0!");
						copiedTip?.classList.remove("opacity-100!");
						if (status) status.textContent = "";
					}, 1500),
				);
			});
		});
}
