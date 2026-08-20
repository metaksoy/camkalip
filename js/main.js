// --- LENIS SMOOTH SCROLL ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate Lenis with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time)=>{
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// GSAP Eklentisini Başlat
gsap.registerPlugin(ScrollTrigger);

// --- PRELOADER ---
const preloaderCounter = document.querySelector('.preloader-counter');
let progress = 0;

const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 10) + 1;
    if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        

        gsap.to('.preloader', {
            yPercent: -100,
            duration: 1.5,
            ease: 'expo.inOut',
            delay: 0.2,
            onComplete: startAllAnimations // 
        });
    }
    preloaderCounter.textContent = progress + '%';
}, 50);

// --- CUSTOM CURSOR ---
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0 });
    gsap.to(cursorFollower, { x: e.clientX, y: e.clientY, duration: 0.3 });
});

function applyHoverEffects() {
    const links = document.querySelectorAll('a, .hover-link, .sector-item, .orbit-img, .lightbox-close, .partner-card');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => document.body.classList.add('hover-active'));
        link.addEventListener('mouseleave', () => document.body.classList.remove('hover-active'));
    });
}
applyHoverEffects();

// --- TÜM ANİMASYONLARI BAŞLATAN ANA FONKSİYON ---
function startAllAnimations() {
    initHeroAndScrollReveals();
    initProductsMarquee();
    initGalleryOrbit();
    initPartnersSlider();
    
    // Tüm pinler eklendikten sonra hesaplamaları tazele (çakışmayı önler)
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 500);
}

// 1. Hero ve Standart Scroll Animasyonları
function initHeroAndScrollReveals() {
    gsap.fromTo('.hero .reveal-text', 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'power4.out' }
    );

    const revealElements = document.querySelectorAll('.reveal-text:not(.hero .reveal-text)');
    revealElements.forEach((el) => {
        gsap.fromTo(el, 
            { y: 50, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%' }
            }
        );
    });

    const fadeElements = document.querySelectorAll('.reveal-fade');
    fadeElements.forEach((el) => {
        gsap.fromTo(el, 
            { y: 30, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 1, ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 90%' }
            }
        );
    });

    gsap.to('.text-block[data-speed="0.9"]', {
        y: -50, ease: 'none',
        scrollTrigger: { trigger: '.design-quality', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    gsap.to('.text-block[data-speed="1.1"]', {
        y: 50, ease: 'none',
        scrollTrigger: { trigger: '.design-quality', start: 'top bottom', end: 'bottom top', scrub: true }
    });
}

// 2. Ürünler Yatay Kaydırma (Marquee) -
function initProductsMarquee() {
    const productsSection = document.querySelector('.products');
    const marqueeContent = document.querySelector('.marquee');

    if (productsSection && marqueeContent) {
        gsap.set(marqueeContent, { clearProps: "all" });


        let getScrollAmount = () => -(marqueeContent.scrollWidth - window.innerWidth);

        gsap.fromTo(marqueeContent, 
            { 

                x: "15vw" 
            }, 
            {
                x: getScrollAmount, 
                ease: "none",
                scrollTrigger: {
                    trigger: productsSection,
                    start: "center center", 
                    end: () => `+=${marqueeContent.scrollWidth}`, 
                    pin: true, 
                    scrub: 1, 
                    invalidateOnRefresh: true
                }
            }
        );
    }
}

// 3. Yörünge Galerisi
function initGalleryOrbit() {
    const orbitContainer = document.querySelector('.orbit-container');
    if (!orbitContainer) return;


    if (orbitContainer.children.length > 0) return;

    const totalImages = 59; 
    const galleryImages = [];

    for(let i = 1; i <= totalImages; i++) {
        galleryImages.push({
            thumb: `images/thumbs/görsel (${i}).webp`, 
            full: `images/gorsel (${i}).webp`          
        }); 
    }

    const ringsConfig = [
        { radius: 280, count: 10, speed: 25, direction: 1 },
        { radius: 420, count: 14, speed: 35, direction: -1 },
        { radius: 580, count: 16, speed: 45, direction: 1 }
    ];

    let imgIndex = 0;

    ringsConfig.forEach((ring) => {
        const ringEl = document.createElement('div');
        ringEl.classList.add('orbit-ring');
        orbitContainer.appendChild(ringEl);

        for (let i = 0; i < ring.count; i++) {
            if (imgIndex >= galleryImages.length) break;

            const angle = (i / ring.count) * Math.PI * 2;
            const x = Math.cos(angle) * ring.radius;
            const y = Math.sin(angle) * ring.radius;

            const img = document.createElement('img');
            img.loading = "lazy"; 
            img.decoding = "async"; 
            img.src = galleryImages[imgIndex].thumb;
            img.classList.add('orbit-img');
            img.style.left = `${x}px`;
            img.style.top = `${y}px`;

            const fullImageSrc = galleryImages[imgIndex].full;
            img.addEventListener('click', () => openLightbox(fullImageSrc));
            
            ringEl.appendChild(img);
            imgIndex++;
        }

        const ringAnimation = gsap.to(ringEl, {
            rotation: 360 * ring.direction, duration: ring.speed, repeat: -1, ease: "none"
        });

        const imagesInRing = ringEl.querySelectorAll('.orbit-img');
        imagesInRing.forEach(img => {
            img.addEventListener('mouseenter', () => ringAnimation.pause()); 
            img.addEventListener('mouseleave', () => ringAnimation.play());  
            img.addEventListener('touchstart', () => ringAnimation.pause(), {passive: true});
            img.addEventListener('touchend', () => { setTimeout(() => ringAnimation.play(), 500); }, {passive: true});
        });
    });

    gsap.from('.orbit-ring', {
        opacity: 0, scale: 0.5, duration: 2, stagger: 0.3, ease: 'power3.out',
        scrollTrigger: { trigger: '.gallery-section', start: 'top 60%' }
    });

    applyHoverEffects();
}


// 4. Partnerler Yatay Slider - DÜZELTİLDİ (Yön: Soldan Sağa)
function initPartnersSlider() {
    const partnersSection = document.querySelector('.partners');
    const partnersTrack = document.querySelector('.partners-track');

    if (partnersSection && partnersTrack) {

        let getPartnersScrollAmount = () => -(partnersTrack.scrollWidth - window.innerWidth + (window.innerWidth * 0.1));


        gsap.set('.partner-card', { opacity: 1, y: 0 });


        gsap.fromTo(partnersTrack, 
            {
                x: getPartnersScrollAmount 
            },
            {
                x: 0, 
                ease: "none",
                scrollTrigger: {
                    trigger: partnersSection,
                    start: "center center", 
                    end: () => `+=${partnersTrack.scrollWidth}`, 
                    pin: true, 
                    scrub: 1.5, 
                    invalidateOnRefresh: true
                }
            }
        );
    }
}

// --- LIGHTBOX ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');

function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('active');
    lenis.stop();
}

function closeLightbox() {
    lightbox.classList.remove('active');
    setTimeout(() => { lightboxImg.src = ""; }, 400);
    lenis.start();
}

if(lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
}