export function setupAboutMinHeight(): void {
	const about = document.querySelector<HTMLElement>("#about");
	if (!about) return;

	// Firefox for Androidはアドレスバーの開閉でビューポート自体がリサイズされ
	// svhでも高さが変動するため、ロード時のビューポート高さをCSS変数に固定する
	const apply = () => {
		about.style.setProperty("--about-vh", `${window.innerHeight}px`);
	};
	apply();

	// アドレスバー開閉による高さのみのresizeは無視し、回転などで幅が変わったときだけ測り直す
	let lastWidth = window.innerWidth;
	window.addEventListener(
		"resize",
		() => {
			if (window.innerWidth === lastWidth) return;
			lastWidth = window.innerWidth;
			apply();
		},
		{ passive: true },
	);
}
