const canvas = document.getElementById("ripple-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const ripples: { x: number; y: number; radius: number; opacity: number }[] = [];
let lastRippleTime = 0;
const rippleInterval = 150;

document.addEventListener("mousemove", (e) => {
	const target = e.target as HTMLElement;
	if (target.closest("a, button, span, h1, h2, h3, p, img, nav, footer"))
		return;

	const now = Date.now();
	if (now - lastRippleTime < rippleInterval) return;
	lastRippleTime = now;

	ripples.push({ x: e.clientX, y: e.clientY, radius: 0, opacity: 0.4 });
});

const accentColor = getComputedStyle(document.documentElement)
	.getPropertyValue("--color-accent")
	.trim();

function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (let i = ripples.length - 1; i >= 0; i--) {
		const r = ripples[i];
		r.radius += 1.5;
		r.opacity -= 0.008;

		if (r.opacity <= 0) {
			ripples.splice(i, 1);
			continue;
		}

		ctx.beginPath();
		ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
		ctx.strokeStyle = accentColor;
		ctx.globalAlpha = r.opacity;
		ctx.lineWidth = 1;
		ctx.stroke();
	}

	ctx.globalAlpha = 1;
	requestAnimationFrame(animate);
}

animate();
