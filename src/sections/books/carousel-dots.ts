export function setupBooksCarouselDots(): void {
	const carousel = document.querySelector<HTMLElement>("[data-books-carousel]");
	const dotsWrap = document.querySelector<HTMLElement>("[data-books-dots]");
	if (!carousel || !dotsWrap) return;

	const dots = Array.from(dotsWrap.children) as HTMLElement[];
	const items = Array.from(carousel.children) as HTMLElement[];

	// レイアウト測定はロード時と幅が変わったときだけ行い、scrollハンドラでは読み取らない
	let maxScroll = 0;
	let step = 1;
	let active = -1;
	const measure = () => {
		maxScroll = carousel.scrollWidth - carousel.clientWidth;
		step = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : 1;
		dotsWrap.classList.toggle("invisible", maxScroll <= 8);
	};

	const update = () => {
		const scrollLeft = carousel.scrollLeft;
		let next = Math.round(scrollLeft / step);
		if (scrollLeft >= maxScroll - 8) next = dots.length - 1;
		next = Math.max(0, Math.min(dots.length - 1, next));
		// DOMへの書き込みはアクティブなドットが変わったときだけ(強制リフロー対策)
		if (next === active) return;
		active = next;
		for (const [i, dot] of dots.entries()) {
			dot.classList.toggle("bg-base-content", i === active);
			dot.classList.toggle("bg-base-content/20", i !== active);
		}
	};

	measure();
	update();

	// スクロール中の更新は1フレーム1回に間引く
	let rafId = 0;
	carousel.addEventListener(
		"scroll",
		() => {
			if (rafId) return;
			rafId = requestAnimationFrame(() => {
				rafId = 0;
				update();
			});
		},
		{ passive: true },
	);

	// モバイルのURLバー開閉は高さだけのresizeを連続発火させるため、幅が変わったときのみ再計算する
	let lastWidth = window.innerWidth;
	window.addEventListener(
		"resize",
		() => {
			if (window.innerWidth === lastWidth) return;
			lastWidth = window.innerWidth;
			measure();
			update();
		},
		{ passive: true },
	);
}
