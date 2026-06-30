/* =========================================================================
 * CORE MAIN JS CONTROLLER
 * ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initPreloader();
  initCanvasBackground();
  initCustomCursor();
  initLenisScroll();
  initWorkPreviews();
  initAccordions();
  initGSAPReveals();
});

/* -------------------------------------------------------------
 * 1. LIVE SMOOTH CLOCK CONTROLLER
 * ------------------------------------------------------------- */
function initClock() {
  const hrHand = document.querySelector('.hour-hand');
  const minHand = document.querySelector('.min-hand');
  const secHand = document.querySelector('.sec-hand');
  const digitalTime = document.getElementById('digital-clock');

  function tick() {
    const now = new Date();
    const ms = now.getMilliseconds();
    const secs = now.getSeconds() + ms / 1000;
    const mins = now.getMinutes() + secs / 60;
    const hrs = (now.getHours() % 12) + mins / 60;

    // Calculate degrees (continuous gliding animation)
    const secDeg = secs * 6;     // 360 / 60 = 6
    const minDeg = mins * 6;     // 360 / 60 = 6
    const hrDeg = hrs * 30;      // 360 / 12 = 30

    if (secHand) secHand.style.transform = `rotate(${secDeg}deg)`;
    if (minHand) minHand.style.transform = `rotate(${minDeg}deg)`;
    if (hrHand) hrHand.style.transform = `rotate(${hrDeg}deg)`;

    // Digital time (format: HH:MM:SS AM/PM)
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    const timeStr = `${hours}:${minutes}:${seconds} ${ampm}`;
    if (digitalTime) digitalTime.textContent = timeStr;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* -------------------------------------------------------------
 * 2. FLUID CANVAS AURORA BACKGROUND
 * ------------------------------------------------------------- */
let globalMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

function initCanvasBackground() {
  const canvas = document.getElementById('canvas-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    globalMouse.x = e.clientX;
    globalMouse.y = e.clientY;
  });

  class Blob {
    constructor(x, y, radius, color) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      // Drift velocity variables
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = (Math.random() - 0.5) * 1.2;
    }

    update() {
      // Natural drifting
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off walls
      if (this.x - this.radius < 0 || this.x + this.radius > width) {
        this.vx *= -1;
      }
      if (this.y - this.radius < 0 || this.y + this.radius > height) {
        this.vy *= -1;
      }

      // Attract/Repel mouse
      const dx = globalMouse.x - this.x;
      const dy = globalMouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Pull slightly towards mouse to make background interactive
      if (dist < 800) {
        this.x += dx * 0.003;
        this.y += dy * 0.003;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  // Define premium brand colors for the aura
  const blobs = [
    new Blob(width * 0.25, height * 0.3, 300, 'rgba(0, 242, 254, 0.15)'),  // Neon Cyan
    new Blob(width * 0.75, height * 0.4, 380, 'rgba(255, 8, 68, 0.12)'),   // Neon Magenta
    new Blob(width * 0.5, height * 0.8, 350, 'rgba(56, 249, 215, 0.12)'),  // Mint
    new Blob(width * 0.1, height * 0.85, 260, 'rgba(250, 112, 154, 0.1)')  // Rose
  ];

  function animate() {
    ctx.clearRect(0, 0, width, height);
    blobs.forEach((blob) => {
      blob.update();
      blob.draw();
    });
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

/* -------------------------------------------------------------
 * 3. STRETCHED & MAGNETIC CUSTOM CURSOR
 * ------------------------------------------------------------- */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  // Spring physics variables
  let cursorX = 0, cursorY = 0;
  let targetX = 0, targetY = 0;
  let lastX = 0, lastY = 0;
  
  // Velocity stretching variables
  let speed = 0;
  let angle = 0;
  let scaleX = 1, scaleY = 1;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  // Main cursor render loop with spring physics
  function renderCursor() {
    // Interpolation (lag)
    const lag = 0.12; 
    cursorX += (targetX - cursorX) * lag;
    cursorY += (targetY - cursorY) * lag;

    // Compute velocity
    const dx = cursorX - lastX;
    const dy = cursorY - lastY;
    speed = Math.sqrt(dx * dx + dy * dy);

    // Update last coordinate
    lastX = cursorX;
    lastY = cursorY;

    // Calculate velocity angle for rotation direction
    if (speed > 0.1) {
      angle = Math.atan2(dy, dx) * 180 / Math.PI;
    }

    // Map speed to scale stretching
    // Max scale stretch factor is capped at 1.8
    const maxStretch = 0.8;
    const stretch = Math.min(speed * 0.04, maxStretch);
    
    scaleX = 1 + stretch;
    scaleY = 1 - stretch * 0.5;

    // Apply translations, rotation, and scaling
    // Use scale values directly computed or reset when static
    if (speed < 0.5) {
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) scale(1, 1)`;
    } else {
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
    }

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Link Hover morphing & Magnetic pulls
  const hoverLinks = document.querySelectorAll('a, .menu-btn, .social-btn, .stack-icon-wrapper, .accordion-header');
  hoverLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering-link');
    });
    link.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering-link');
    });
  });

  // Work Item hovering morphing
  const workItems = document.querySelectorAll('.work-item');
  workItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering-work');
    });
    item.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering-work');
    });
  });

  // Contact inputs morphing
  const inputs = document.querySelectorAll('.form-input');
  inputs.forEach(input => {
    input.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering-input');
    });
    input.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering-input');
    });
  });

  // -------------------------------------------------------------
  // MAGNETIC EFFECT ON ELEMENTS
  // -------------------------------------------------------------
  const magneticElements = document.querySelectorAll('.magnetic');
  magneticElements.forEach(el => {
    el.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const elementX = rect.left + rect.width / 2;
      const elementY = rect.top + rect.height / 2;

      // Mouse position relative to center of element
      const mouseRelX = e.clientX - elementX;
      const mouseRelY = e.clientY - elementY;

      // Pull strength factor
      const strength = parseFloat(this.getAttribute('data-strength')) || 10;

      // Smooth offset using GSAP
      gsap.to(this, {
        x: mouseRelX * (strength / 100),
        y: mouseRelY * (strength / 100),
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    el.addEventListener('mouseleave', function() {
      // Return back to origin
      gsap.to(this, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1.2, 0.4)'
      });
    });
  });
}

/* -------------------------------------------------------------
 * 4. LENIS SMOOTH SCROLL INTEGRATION
 * ------------------------------------------------------------- */
let lenisInstance;

function initLenisScroll() {
  // Only initialize on screens larger than mobile touch screens
  if (window.innerWidth <= 768) return;

  lenisInstance = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth cubic deceleration
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    smoothTouch: false,
  });

  function raf(time) {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Bind Lenis scroll to GSAP ScrollTrigger
  lenisInstance.on('scroll', ScrollTrigger.update);
  
  gsap.ticker.add((time) => {
    lenisInstance.raf(time * 1000);
  });
  
  gsap.ticker.lagSmoothing(0);
}

/* -------------------------------------------------------------
 * 5. CINEMATIC WORK SHOWCASE PREVIEWS (SPRING PHYSICS MOUSE FOLLOW)
 * ------------------------------------------------------------- */
function initWorkPreviews() {
  const workList = document.querySelector('.work-list');
  const workItems = document.querySelectorAll('.work-item');
  if (!workList || workItems.length === 0) return;

  // Create floating preview container
  const previewContainer = document.createElement('div');
  previewContainer.className = 'hover-preview-container';
  const previewInner = document.createElement('div');
  previewInner.className = 'hover-preview-inner';
  previewContainer.appendChild(previewInner);
  document.body.appendChild(previewContainer);

  // Populate preview container with images from work elements
  workItems.forEach((item, index) => {
    const imgSrc = item.getAttribute('data-image');
    const img = document.createElement('img');
    img.src = imgSrc;
    img.className = `hover-preview-img preview-img-${index}`;
    previewInner.appendChild(img);
  });

  const previewImages = document.querySelectorAll('.hover-preview-img');

  // Spring physics variables
  let previewX = 0, previewY = 0;
  let targetX = 0, targetY = 0;
  let rotX = 0, rotY = 0;
  let lastMouseX = 0;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  function updatePreviewPosition() {
    // Smooth trailing spring lag
    const lag = 0.08;
    previewX += (targetX - previewX) * lag;
    previewY += (targetY - previewY) * lag;

    // Calculate drag speed for skew/rotation
    const deltaX = targetX - lastMouseX;
    lastMouseX = targetX;
    
    // Rotate relative to horizontal velocity (max 15 degrees)
    const targetRot = Math.min(Math.max(deltaX * 0.3, -15), 15);
    rotY += (targetRot - rotY) * 0.1;

    previewContainer.style.transform = `translate3d(${previewX}px, ${previewY}px, 0) rotate(${rotY}deg)`;
    
    requestAnimationFrame(updatePreviewPosition);
  }
  requestAnimationFrame(updatePreviewPosition);

  // Bind mouseenter and mouseleave triggers
  workItems.forEach((item, index) => {
    item.addEventListener('mouseenter', function() {
      // Activate overlay container
      previewContainer.classList.add('active');
      
      // Hide other images, show this specific index
      previewImages.forEach(img => img.classList.remove('active'));
      const activeImg = previewInner.querySelector(`.preview-img-${index}`);
      if (activeImg) activeImg.classList.add('active');

      // Blur non-focused projects
      workList.classList.add('item-focused');
      
      // Dynamic Canvas Gradient Theme Shift
      const brandColor = this.getAttribute('data-color') || '#00f2fe';
      shiftCanvasColor(brandColor);
    });

    item.addEventListener('mouseleave', function() {
      previewContainer.classList.remove('active');
      workList.classList.remove('item-focused');
      // Reset background color theme
      resetCanvasColor();
    });
  });
}

// Global Canvas Color modifiers
function shiftCanvasColor(colorHex) {
  // Directly grab the main canvas and apply custom glow shifts
  const canvas = document.getElementById('canvas-bg');
  if (canvas) {
    canvas.style.transition = 'filter 1s ease-in-out';
    // Shift canvas filter color via CSS hue-rotate / brightness if desired,
    // or we can adjust blob alpha/tint values. Let's make it a clean CSS hue shift:
    if (colorHex === '#ff0844') {
      canvas.style.filter = 'blur(100px) hue-rotate(120deg)';
    } else if (colorHex === '#fa709a') {
      canvas.style.filter = 'blur(100px) hue-rotate(60deg)';
    } else if (colorHex === '#38f9d7') {
      canvas.style.filter = 'blur(100px) hue-rotate(-90deg)';
    } else {
      canvas.style.filter = 'blur(100px) hue-rotate(0deg)';
    }
  }
}

function resetCanvasColor() {
  const canvas = document.getElementById('canvas-bg');
  if (canvas) {
    canvas.style.filter = 'blur(80px) hue-rotate(0deg)';
  }
}

/* -------------------------------------------------------------
 * 6. INTERACTIVE EXPERIENCES ACCORDIONS
 * ------------------------------------------------------------- */
function initAccordions() {
  const accordionItems = document.querySelectorAll('.accordion-item');
  if (accordionItems.length === 0) return;

  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');

    // Force default active block height on load
    if (item.classList.contains('active') && content) {
      content.style.height = content.scrollHeight + 'px';
    }

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all items
      accordionItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherContent = otherItem.querySelector('.accordion-content');
        if (otherContent) otherContent.style.height = '0px';
      });

      // Toggle this item
      if (!isActive) {
        item.classList.add('active');
        if (content) content.style.height = content.scrollHeight + 'px';
      }
    });
  });
}

/* -------------------------------------------------------------
 * 7. TYPOGRAPHIC PRELOADER INTRO TIMER & SVG PATH LIQUID WIPEOUT
 * ------------------------------------------------------------- */
function initPreloader() {
  const counterNum = document.querySelector('.counter-number');
  const preloader = document.getElementById('preloader');
  const loaderPath = document.getElementById('loader-path');
  
  if (!preloader) return;

  // Stagger reveal preloader words
  const wordsTimeline = gsap.timeline();
  wordsTimeline.to('.loader-word', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.25,
    ease: 'power4.out',
    delay: 0.2
  });

  // Numeric count controller
  let countObj = { value: 0 };
  const duration = 2.5; // Seconds

  gsap.to(countObj, {
    value: 100,
    duration: duration,
    ease: 'power2.out',
    onUpdate: () => {
      const current = Math.floor(countObj.value);
      if (counterNum) {
        counterNum.textContent = current < 10 ? '0' + current : current;
      }
    },
    onComplete: () => {
      // Trigger slide out timeline once completed
      const exitTL = gsap.timeline({
        onComplete: () => {
          // Entirely discard preloader elements to save system resources
          preloader.style.display = 'none';
        }
      });

      // Fade content layers
      exitTL.to('.loader-content', {
        opacity: 0,
        y: -50,
        duration: 0.6,
        ease: 'power3.in'
      });

      // Liquid SVG path slide wipe
      // Morph SVG from square flat to curved arch and up
      exitTL.to(loaderPath, {
        attr: { d: 'M0,0 L100,0 L100,0 Q50,60 0,0 Z' },
        duration: 1.1,
        ease: 'power4.inOut'
      }, '-=0.2');

      exitTL.to(preloader, {
        yPercent: -100,
        duration: 1.1,
        ease: 'power4.inOut'
      }, '-=1.1');

      // Trigger landing page animations
      exitTL.add(() => {
        triggerHeroIntro();
      }, '-=0.5');
    }
  });
}

/* -------------------------------------------------------------
 * 8. GSAP INITIAL HERO INTRO & SCROLLTRIGGERS
 * ------------------------------------------------------------- */
function triggerHeroIntro() {
  const introTL = gsap.timeline();

  // Bring in logo & navigations
  introTL.from('.logo, .nav-link', {
    y: -25,
    opacity: 0,
    duration: 0.8,
    stagger: 0.08,
    ease: 'power3.out'
  });

  // Reveal masked hero headings
  introTL.to('.char-wrap', {
    y: 0,
    opacity: 1,
    duration: 1.2,
    stagger: 0.15,
    ease: 'power4.out'
  }, '-=0.6');

  // Fade in hero bio, details, badge, explore button
  introTL.from('.availability-badge, .hero-scroll-prompt, .hero-bio, .explore-btn', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out'
  }, '-=0.8');
}

function initGSAPReveals() {
  // Stagger-reveal Bento Grid cards when scrolled in
  gsap.from('.bento-card', {
    scrollTrigger: {
      trigger: '.bento-grid',
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    y: 60,
    opacity: 0,
    duration: 1,
    stagger: 0.12,
    ease: 'power3.out'
  });

  // Reveal work section heading & entries
  gsap.from('.work-section .section-title-wrap', {
    scrollTrigger: {
      trigger: '.work-section',
      start: 'top 80%',
    },
    x: -50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('.work-item', {
    scrollTrigger: {
      trigger: '.work-list',
      start: 'top 80%',
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  });

  // Reveal Capabilities Section
  gsap.from('.services-section .section-title-wrap', {
    scrollTrigger: {
      trigger: '.services-section',
      start: 'top 80%',
    },
    x: -50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('.accordion-item', {
    scrollTrigger: {
      trigger: '.services-accordion',
      start: 'top 80%',
    },
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out'
  });

  // Reveal Contact forms
  gsap.from('.contact-left', {
    scrollTrigger: {
      trigger: '.contact-section',
      start: 'top 75%',
    },
    x: -50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });

  gsap.from('.contact-right', {
    scrollTrigger: {
      trigger: '.contact-section',
      start: 'top 75%',
    },
    x: 50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });
}
