// ==========================================
// 1. LENIS SMOOTH SCROLL (YUMUŞAK KAYDIRMA)
// ==========================================
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Lenis ve ScrollTrigger Entegrasyonu
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 2. PRELOADER (AÇILIŞ EKRANI)
// ==========================================
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
            onComplete: startAllAnimations
        });
    }
    if(preloaderCounter) preloaderCounter.textContent = progress + '%';
}, 50);

// ==========================================
// 3. CUSTOM CURSOR (ÖZEL FARE İMLECİ)
// ==========================================
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0 });
    gsap.to(cursorFollower, { x: e.clientX, y: e.clientY, duration: 0.3 });
});

function applyHoverEffects() {
    const links = document.querySelectorAll('a, button, .hover-link, .sector-item, .orbit-img, .lightbox-close, .partner-card, .product-card');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => document.body.classList.add('hover-active'));
        link.addEventListener('mouseleave', () => document.body.classList.remove('hover-active'));
    });
}
applyHoverEffects();

// ==========================================
// 4. GSAP ANİMASYON BAŞLATICISI
// ==========================================
function startAllAnimations() {
    initHeroAndScrollReveals();
    initGalleryOrbit();
    initPartnersSlider();
    setTimeout(() => { ScrollTrigger.refresh(); }, 500); // Tüm animasyonlar yüklendikten sonra hesaplamaları tazele
}

// Hero ve Standart Sayfa Animasyonları
function initHeroAndScrollReveals() {
    gsap.fromTo('.hero .reveal-text',
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'power4.out' }
    );

    document.querySelectorAll('.reveal-text:not(.hero .reveal-text)').forEach((el) => {
        gsap.fromTo(el,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }
        );
    });

    document.querySelectorAll('.reveal-fade').forEach((el) => {
        gsap.fromTo(el,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' } }
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

// 3D Dönen Yörünge Galerisi
function initGalleryOrbit() {
    const orbitContainer = document.querySelector('.orbit-container');
    if (!orbitContainer || orbitContainer.children.length > 0) return;

    const totalImages = 59;
    const galleryImages = [];
    for(let i = 1; i <= totalImages; i++) {
        galleryImages.push({
            // thumb: `images/thumbs/görsel-${i}.webp`, 
            // full: `images/gorsel-${i}.webp`
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
            img.src = galleryImages[imgIndex].thumb;
            img.classList.add('orbit-img');
            img.style.left = `${x}px`;
            img.style.top = `${y}px`;

            const fullSrc = galleryImages[imgIndex].full;
            img.addEventListener('click', () => openLightbox(fullSrc));
            ringEl.appendChild(img);
            imgIndex++;
        }

        const ringAnim = gsap.to(ringEl, {
            rotation: 360 * ring.direction, duration: ring.speed, repeat: -1, ease: "none"
        });

        ringEl.querySelectorAll('.orbit-img').forEach(img => {
            img.addEventListener('mouseenter', () => ringAnim.pause());
            img.addEventListener('mouseleave', () => ringAnim.play());
        });
    });

    gsap.from('.orbit-ring', {
        opacity: 0, scale: 0.5, duration: 2, stagger: 0.3, ease: 'power3.out',
        scrollTrigger: { trigger: '.gallery-section', start: 'top 60%' }
    });
    applyHoverEffects();
}

// İŞ ORTAKLARIMIZ - SOLDAN SAĞA SCROLL (DÜZELTİLDİ)
function initPartnersSlider() {
    const partnersSection = document.querySelector('.partners');
    const partnersTrack = document.querySelector('.partners-track');

    if (partnersSection && partnersTrack) {
        gsap.fromTo(partnersTrack,
            {
                // En soldan (eksi değerden) başlamasını sağlıyoruz
                x: () => -(partnersTrack.scrollWidth - window.innerWidth + 100) 
            },
            {
                // En sağa (sıfır noktasına) doğru ilerler
                x: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: partnersSection,
                    start: "center center",
                    end: () => `+=${partnersTrack.scrollWidth}`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            }
        );
    }
}

// ==========================================
// 5. LIGHTBOX (GALERİ FOTOĞRAFI BÜYÜTME)
// ==========================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');

function openLightbox(src) {
    if(lightboxImg) lightboxImg.src = src;
    if(lightbox) lightbox.classList.add('active');
    lenis.stop();
}

function closeLightbox() {
    if(lightbox) lightbox.classList.remove('active');
    setTimeout(() => { if(lightboxImg) lightboxImg.src = ""; }, 400);
    lenis.start();
}

if(lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
}

// ==========================================
// 6. ÜRÜN KARTLARI DETAY MODALI (EKSİK OLAN KISIM EKLENDİ)
// ==========================================
const productSEOData = {
    pres: {
        title: "Pres Kalıplar ile Kusursuz Züccaciye Üretimi",
        badge: "Züccaciye & Mutfak",
        img: "images/gorsel (33).webp",
        content: "<p><strong>Özbay Cam Kalıp Sanayi</strong> olarak, züccaciye ürünleri ve kalın cidarlı cam eşyalar için mikron hassasiyetinde <strong>pres kalıplar</strong> üretiyoruz.</p><p>Gelişmiş CNC merkezlerimizde ürettiğimiz kalıplar, cam eriyiğinin kusursuz dağılmasını sağlar. Isı değişimlerine karşı maksimum dayanıklılık gösteren çelikler kullanıyoruz.</p>"
    },
    savurma: {
        title: "Savurma Kalıplarında Yüksek Denge",
        badge: "Aydınlatma & Dekor",
        img: "images/gorsel (27).webp",
        content: "<p>Dairesel ve simetrik cam parçaların üretiminde kullanılan <strong>savurma kalıp</strong> teknolojisi mükemmel denge gerektirir. Aydınlatma armatürleri için idealdir.</p><p>Kalıplarımız 3D simülasyonlarla test edilir. Yüksek devirlerde bile titreşim yapmayan, güvenli çözümler sunuyoruz.</p>"
    },
    ufleme: {
        title: "Üfleme Kalıplar: Kozmetikte Zarif Dokunuşlar",
        badge: "Kozmetik & Parfüm",
        img: "images/gorsel (17).webp",
        content: "<p>Kozmetik sektörünün en önemli unsuru ambalajdır. Parfüm ve kozmetik markalarına özel <strong>üfleme cam kalıpları</strong> üreten Özbay, zarafeti endüstriyle buluşturuyor.</p><p>Kalıp ayırma çizgileri minimuma indirilmiş, rafta parlayan pürüzsüz cam şişeler elde etmenizi sağlıyoruz.</p>"
    },
    siller: {
        title: "Şiller Kalıplarla Seri Üretimde Hız",
        badge: "Seri Üretim",
        img: "images/gorsel (9).webp",
        content: "<p>Üretim döngüsünü hızlandırmak ve camın doğru sürede soğumasını sağlamak amacıyla <strong>Şiller Kalıpları</strong> tasarlıyoruz.</p><p>Yüksek aşınma direncine sahip malzemelerle, aralıksız seri üretimde kalite kaybı yaşamadan standart formları yakalayabilirsiniz.</p>"
    },
    sivama: {
        title: "Sıvama Kalıpları: Özel Şekillendirme",
        badge: "Gıda & Aydınlatma",
        img: "images/gorsel (60).webp",
        content: "<p>El yapımı hissiyatı veren dairesel cam eşyaların üretiminde kullanılan <strong>sıvama kalıpları</strong>, geleneksel sanatı teknolojiyle birleştirir.</p><p>Kalıp içi yüzey işleme (polisaj) kalitemiz sayesinde, şeffaflıkta son ürünler elde edilir.</p>"
    }
};

const productModalOverlay = document.getElementById('productModalOverlay');
const modalImg = document.getElementById('modalImg');
const modalBadge = document.getElementById('modalBadge');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

const productOrder = ['pres', 'savurma', 'ufleme', 'siller', 'sivama'];
let currentProductIndex = 0;

// Açılır Kart Modalı
function openProductModal(productId) {
    const data = productSEOData[productId];
    if(!data || !productModalOverlay) return;
    
    // Tıklanan ürünün sırasını bul (İleri-Geri yapabilmek için)
    currentProductIndex = productOrder.indexOf(productId);
    
    if(modalImg) modalImg.src = data.img;
    if(modalBadge) modalBadge.textContent = data.badge;
    if(modalTitle) modalTitle.textContent = data.title;
    if(modalBody) modalBody.innerHTML = data.content;
    
    productModalOverlay.classList.add('active');
    lenis.stop(); // Arkadaki kaymayı durdur
}

// Kartlar Arasında Gezinme (İleri / Geri)
function navigateProduct(direction, event) {
    if (event) event.stopPropagation(); // Butona basınca arkaplan kapanmasını engelle
    
    currentProductIndex += direction;
    
    // Başa veya sona gelirse döngüyü tekrarla
    if (currentProductIndex < 0) currentProductIndex = productOrder.length - 1;
    if (currentProductIndex >= productOrder.length) currentProductIndex = 0;
    
    const nextProductId = productOrder[currentProductIndex];
    const data = productSEOData[nextProductId];
    
    // Yumuşak geçiş efekti ile içeriği değiştir
    const content = document.getElementById('productModalContent');
    gsap.to(content, { opacity: 0, scale: 0.98, duration: 0.2, onComplete: () => {
        if(modalImg) modalImg.src = data.img;
        if(modalBadge) modalBadge.textContent = data.badge;
        if(modalTitle) modalTitle.textContent = data.title;
        if(modalBody) modalBody.innerHTML = data.content;
        
        gsap.to(content, { opacity: 1, scale: 1, duration: 0.2 });
    }});
}

// Modalı Kapatma
function closeProductModal(event, forceClose = false) {
    if (!productModalOverlay) return;
    if (forceClose || event.target === productModalOverlay) {
        productModalOverlay.classList.remove('active');
        lenis.start(); // Arkadaki kaymayı başlat
    }
}

// KLAVYE DESTEĞİ (ESC ile kapatma, Oklarla Gezinme)
document.addEventListener('keydown', (e) => {
    if (productModalOverlay && productModalOverlay.classList.contains('active')) {
        if (e.key === 'Escape') closeProductModal(e, true);
        if (e.key === 'ArrowRight') navigateProduct(1);
        if (e.key === 'ArrowLeft') navigateProduct(-1);
    }
});

// ==========================================
// 7. WHATSAPP İLETİŞİM FORMU
// ==========================================
const waForm = document.getElementById('whatsapp-form');
if(waForm) {
    waForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('wa-name') ? document.getElementById('wa-name').value : '';
        const phone = document.getElementById('wa-phone') ? document.getElementById('wa-phone').value : '';
        const message = document.getElementById('wa-message') ? document.getElementById('wa-message').value : '';
        
        let waText = `Merhaba.\n\n`;
        waText += `*Ben Ad / Firma:* ${name}\n`;
        waText += `*Telefon:* ${phone}\n`;
        if(message) waText += `*Not:* ${message}`;
        
        const encodedText = encodeURIComponent(waText);
        window.open(`https://wa.me/905324637933?text=${encodedText}`, '_blank');
    });
}


// ==========================================
// 8. BÖLÜMLER ARASI HIZLI GEÇİŞ (OKLAR)
// ==========================================
const navUp = document.getElementById('nav-up');
const navDown = document.getElementById('nav-down');

// Sitedeki tüm ana bölümleri (section) topla
const sections = Array.from(document.querySelectorAll('section'));

function scrollToNextSection(direction) {
    if(sections.length === 0) return;
    
    let targetSection = null;
    
    if(direction === 1) {
        // AŞAĞI İN: Ekranda görünen kısımdan aşağıda olan İLK section'ı bul
        targetSection = sections.find(sec => {
            const rect = sec.getBoundingClientRect();
            return rect.top > 50; // 50px tolerans payı
        });
    } else {
        // YUKARI ÇIK: Aramayı sondan başa doğru yap, yukarıda kalan SON section'ı bul
        for(let i = sections.length - 1; i >= 0; i--) {
            const rect = sections[i].getBoundingClientRect();
            if(rect.top < -50) {
                targetSection = sections[i];
                break;
            }
        }
        
        // Eğer hiçbir şey bulamadıysa (en üstteyse) ana ekrana (Hero) dön
        if(!targetSection && window.scrollY > 100) {
            targetSection = document.querySelector('.hero');
        }
    }
    
    // Hedef bölüm bulunduysa, Lenis ile yumuşakça oraya kaydır
    if(targetSection) {
        lenis.scrollTo(targetSection, {
            offset: 0,
            duration: 1.2
        });
    }
}

if(navUp) navUp.addEventListener('click', () => scrollToNextSection(-1));
if(navDown) navDown.addEventListener('click', () => scrollToNextSection(1));