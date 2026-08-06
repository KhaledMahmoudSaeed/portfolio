const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================================
// Custom Universe Cursor Motion
// ============================================================
function initSpaceCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;

    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;

    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Highlight cursor when hovering over links/buttons
  const interactables = document.querySelectorAll('a, button, .stellar-card, .project-card, .contact-card');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });
}

// ============================================================
// Interactive Space Canvas Engine (Responds to Moves & Clicks)
// ============================================================
function initInteractiveSpaceCanvas() {
  const canvas = document.getElementById('space-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const mouse = { x: width / 2, y: height / 2, radius: 140 };

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  const stars = [];
  const numStars = prefersReducedMotion ? 60 : 180;

  class Star {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.baseX = this.x;
      this.baseY = this.y;
      this.radius = Math.random() * 1.8 + 0.5;
      this.alpha = Math.random() * 0.8 + 0.2;
      this.speed = Math.random() * 0.4 + 0.1;
      this.color = Math.random() > 0.4 ? '#ffffff' : (Math.random() > 0.5 ? '#00f0ff' : '#ffab36');
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = this.radius * 4;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    update() {
      // Gentle floating upward
      if (!prefersReducedMotion) {
        this.baseY -= this.speed;
        if (this.baseY < 0) {
          this.baseY = height;
          this.x = this.baseX = Math.random() * width;
        }
      }

      // Cursor Gravitational Repulsion Physics
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (mouse.radius - distance) / mouse.radius;
        const directionX = forceDirectionX * force * 5;
        const directionY = forceDirectionY * force * 5;

        this.x -= directionX;
        this.y -= directionY;
      } else {
        if (this.x !== this.baseX) {
          const dx = this.x - this.baseX;
          this.x -= dx * 0.05;
        }
        if (this.y !== this.baseY) {
          const dy = this.y - this.baseY;
          this.y -= dy * 0.05;
        }
      }
    }
  }

  for (let i = 0; i < numStars; i++) {
    stars.push(new Star());
  }

  // Click Shockwave Burst Reaction
  window.addEventListener('click', (e) => {
    stars.forEach(star => {
      const dx = star.x - e.clientX;
      const dy = star.y - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 280) {
        const force = (280 - dist) / 10;
        star.x += (dx / dist) * force * 8;
        star.y += (dy / dist) * force * 8;
      }
    });
  });

  function render() {
    ctx.clearRect(0, 0, width, height);
    stars.forEach(star => {
      star.update();
      star.draw();
    });
    requestAnimationFrame(render);
  }

  render();
}

// ============================================================
// Intersection Scroll Reveal
// ============================================================
function initReveal() {
  const items = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  items.forEach(el => observer.observe(el));
}

// Mobile Nav
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    links.style.display = isOpen ? 'flex' : '';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSpaceCursor();
  initInteractiveSpaceCanvas();
  initReveal();
  initMobileNav();
});