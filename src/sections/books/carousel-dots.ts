export function setupBooksCarouselDots(): void {
	const carousel = document.querySelector<HTMLElement>("[data-books-carousel]");
	const dotsWrap = document.querySelector<HTMLElement>("[data-books-dots]");
	if (!carousel || !dotsWrap) return;

	const dots = Array.from(dotsWrap.children) as HTMLElement[];
	const items = Array.from(carousel.children) as HTMLElement[];
	const update = () => {
		// 読み取りを先に済ませてから書き込む(交互に行うと強制リフローが起きる)
		const maxScroll = carousel.scrollWidth - carousel.clientWidth;
		const step =
			items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : 1;
		const scrollLeft = carousel.scrollLeft;

		dotsWrap.classList.toggle("invisible", maxScroll <= 8);
		let active = Math.round(scrollLeft / step);
		if (scrollLeft >= maxScroll - 8) active = dots.length - 1;
		active = Math.max(0, Math.min(dots.length - 1, active));
		for (const [i, dot] of dots.entries()) {
			dot.classList.toggle("bg-base-content", i === active);
			dot.classList.toggle("bg-base-content/20", i !== active);
		}
	};
	update();
	carousel.addEventListener("scroll", update, { passive: true });
	// モバイルのURLバー開閉は高さだけのresizeを連続発火させるため、
	// 幅が変わったときのみ再計算する(強制リフローによるスクロールのカクつき対策)
	let lastWidth = window.innerWidth;
	window.addEventListener(
		"resize",
		() => {
			if (window.innerWidth === lastWidth) return;
			lastWidth = window.innerWidth;
			update();
		},
		{ passive: true },
	);
}
