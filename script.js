const textElement = document.getElementById("typewriter-text");
const fullText = "Declutter Your Mind";
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  if (!textElement) return;

  if (!isDeleting) {
    textElement.textContent = fullText.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === fullText.length) {
      isDeleting = true;
      setTimeout(typeEffect, 2200);
      return;
    }
  } else {
    textElement.textContent = fullText.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      setTimeout(typeEffect, 600);
      return;
    }
  }
  setTimeout(typeEffect, isDeleting ? 50 : 100);
}

function initHeroMatrixCursor() {
  const heroSection = document.getElementById("hero");
  const canvas = document.getElementById("hero-matrix-canvas");
  const ctx = canvas.getContext("2d");
  let width = 0;
  let dpr = window.devicePixelRatio || 1;

  const matrixChars = "アカサタナハマヤラワガザダバパイキシチニヒミリヰギジヂビピウクスツヌフムユルグズブヅプエケセテネヘメレヱゲゼデベペ0123456789010101+-*/=<>%$#@&λ§▲◆";
  const colors = ["#ffffff", "#a3ffc9", "#00ff77", "#00ff77", "#00ff77", "#5F7E68", "#92B39A"];
  const densityConfig = {
    idle: { spawnChance: 0.025, spawnCount: 1, maxParticles: 80 },
    hover: { spawnChance: 0.08, spawnCount: 2, maxParticles: 140 }
  };
  let height = 0;

  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    const rect = heroSection.getBoundingClientRect();
    width = rect.width;
    height = rect.height;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  let targetX = width / 2;
  let targetY = height / 2;
  let currX = width / 2;
  let currY = height / 2;
  let isHovering = false;
  let lastX = width / 2;
  let lastY = height / 2;
  let globalAlpha = 0;

  heroSection.addEventListener("mousemove", (e) => {
    const rect = heroSection.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
    isHovering = true;
  });

  heroSection.addEventListener("mouseenter", (e) => {
    const rect = heroSection.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
    currX = targetX;
    currY = targetY;
    lastX = targetX;
    lastY = targetY;
    isHovering = true;
  });

  heroSection.addEventListener("mouseleave", () => {
    isHovering = false;
  });

  const particles = [];

  function spawnParticles(x, y, count = 1) {
    const config = isHovering ? densityConfig.hover : densityConfig.idle;

    for (let i = 0; i < count; i++) {
      if (particles.length >= config.maxParticles) particles.shift();

      const spread = isHovering ? 24 : 18;
      const px = x + (Math.random() - 0.5) * spread;
      const py = y + (Math.random() - 0.5) * spread;

      particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * (isHovering ? 2.4 : 1.5),
        vy: (Math.random() - 0.5) * (isHovering ? 2.4 : 1.5) - 0.5,
        char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.012 + Math.random() * 0.018,
        size: Math.floor(10 + Math.random() * 8),
        step: 0
      });
    }
  }

  function render() {
    requestAnimationFrame(render);

    const targetAlpha = isHovering ? 1 : 0;
    globalAlpha += (targetAlpha - globalAlpha) * 0.12;

    currX += (targetX - currX) * 0.2;
    currY += (targetY - currY) * 0.2;

    ctx.clearRect(0, 0, width, height);

    if (globalAlpha < 0.005 && particles.length === 0) return;

    const config = isHovering ? densityConfig.hover : densityConfig.idle;
    const moved = Math.hypot(currX - lastX, currY - lastY);

    if (isHovering) {
      if (moved > 1.5) {
        spawnParticles(currX, currY, 2);
        lastX = currX;
        lastY = currY;
      } else if (Math.random() < config.spawnChance) {
        spawnParticles(currX, currY, config.spawnCount);
      }
    } else if (Math.random() < config.spawnChance) {
      spawnParticles(currX, currY, config.spawnCount);
    }

    ctx.save();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      p.step++;
      if (p.step % 5 === 0) {
        p.char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.font = `bold ${p.size}px "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = p.color;
      if (["#ffffff", "#a3ffc9", "#00ff77"].includes(p.color)) {
        ctx.shadowColor = "#00ff77";
        ctx.shadowBlur = 12;
      } else {
        ctx.shadowColor = "#5F7E68";
        ctx.shadowBlur = 5;
      }

      ctx.fillText(p.char, p.x, p.y);
      ctx.restore();
    }

    ctx.restore();
  }

  render();
}

function initTapReveal() {
  const button = document.getElementById("about-reveal-button");
  const panel = document.getElementById("about-summary");

  if (!button || !panel) return;

  const revealOnce = () => {
    if (button.dataset.revealed === "true") return;
    button.dataset.revealed = "true";

    panel.setAttribute("aria-hidden", "false");
    button.setAttribute("aria-expanded", "true");
    panel.classList.add("revealed");
    button.classList.add("fade-out-and-scale");

    const hideButton = () => {
      button.style.display = "none";
      button.removeEventListener("animationend", hideButton);
    };

    button.addEventListener("animationend", hideButton);

    // start scroll reveal only after the tap action has occurred
    initProblemScrollReveal();
  };

  button.addEventListener("click", revealOnce);
  button.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      revealOnce();
    }
  });
}

function initProblemScrollReveal() {
  const problemCard = document.getElementById("about-problem-card");
  if (!problemCard) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        problemCard.classList.add("visible");
        obs.unobserve(problemCard);
      }
    });
  }, {
    threshold: 1.0,
  });

  observer.observe(problemCard);
}

document.addEventListener("DOMContentLoaded", () => {
  typeEffect();
  initHeroMatrixCursor();
  initTapReveal();
});