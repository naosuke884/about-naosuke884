export function setupBooksCarouselDots(): void {
	const carousel = document.querySelector<HTMLElement>("[data-books-carousel]");
	const dotsWrap = document.querySelector<HTMLElement>("[data-books-dots]");
	if (!carousel || !dotsWrap) return;

	const dots = Array.from(dotsWrap.children) as HTMLElement[];
	const items = Array.from(carousel.children) as HTMLElement[];
	const update = () => {
		const maxScroll = carousel.scrollWidth - carousel.clientWidth;
		dotsWrap.classList.toggle("invisible", maxScroll <= 8);
		const step =
			items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : 1;
		let active = Math.round(carousel.scrollLeft / step);
		if (carousel.scrollLeft >= maxScroll - 8) active = dots.length - 1;
		active = Math.max(0, Math.min(dots.length - 1, active));
		for (const [i, dot] of dots.entries()) {
			dot.classList.toggle("bg-base-content", i === active);
			dot.classList.toggle("bg-base-content/20", i !== active);
		}
	};
	update();
	carousel.addEventListener("scroll", update, { passive: true });
	window.addEventListener("resize", update, { passive: true });
}
