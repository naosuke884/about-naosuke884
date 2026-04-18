const sections = document.querySelectorAll<HTMLElement>("section[id]");
const navDots = document.querySelectorAll<HTMLAnchorElement>("[data-nav-dot]");
const activeIds = new Set<string>();

function updateActiveDot() {
	let activeId: string | null = null;
	for (const section of sections) {
		if (activeIds.has(section.id)) {
			activeId = section.id;
		}
	}
	for (const dot of navDots) {
		if (dot.dataset.navDot === `#${activeId}`) {
			dot.dataset.active = "";
		} else {
			delete dot.dataset.active;
		}
	}
}

const observer = new IntersectionObserver(
	(entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				activeIds.add(entry.target.id);
			} else {
				activeIds.delete(entry.target.id);
			}
		}
		updateActiveDot();
	},
	{ rootMargin: "0px 0px -50% 0px" },
);

for (const section of sections) {
	observer.observe(section);
}
