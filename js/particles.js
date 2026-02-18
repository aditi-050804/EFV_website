const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const container = document.getElementById('particles-js') || document.body;

if (document.getElementById('particles-js')) {
    document.getElementById('particles-js').appendChild(canvas);
} else {
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1';
    document.body.appendChild(canvas);
}

let particles = [];
let bgCanvas = document.createElement('canvas');
let bgCtx = bgCanvas.getContext('2d', { alpha: false });
const particleCount = 40; // Reduced for performance
const starCount = 200; // Reduced for performance

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;

    drawStaticBackground();

    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 1,
            color: Math.random() > 0.6 ? '#FFD369' : (Math.random() > 0.3 ? '#6a4cff' : '#00d4ff'),
            pulse: Math.random() * 0.05,
            opacity: Math.random()
        });
    }
}

function drawStaticBackground() {
    const gradient = bgCtx.createRadialGradient(
        bgCanvas.width / 2, bgCanvas.height / 2, 0,
        bgCanvas.width / 2, bgCanvas.height / 2, bgCanvas.width
    );
    gradient.addColorStop(0, '#0a0e1c');
    gradient.addColorStop(1, '#020408');
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    for (let i = 0; i < starCount; i++) {
        const x = Math.random() * bgCanvas.width;
        const y = Math.random() * bgCanvas.height;
        const size = Math.random() * 1.5;
        const opacity = Math.random() * 0.8;

        bgCtx.fillStyle = `rgba(248, 249, 250, ${opacity})`;
        bgCtx.beginPath();
        bgCtx.arc(x, y, size, 0, Math.PI * 2);
        bgCtx.fill();
    }
}

let isPaused = false;
document.addEventListener('visibilitychange', () => {
    isPaused = document.hidden;
});

function animate() {
    if (isPaused) {
        requestAnimationFrame(animate);
        return;
    }

    ctx.drawImage(bgCanvas, 0, 0);

    particles.forEach(p => {
        p.opacity += p.pulse;
        if (p.opacity > 1 || p.opacity < 0.2) p.pulse *= -1;

        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
    });
    ctx.globalAlpha = 1.0;

    requestAnimationFrame(animate);
}

window.addEventListener('resize', init);
init();
animate();

