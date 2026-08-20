// --- THREE.JS PARTICLE GLOBE (SPHERE TO EARTH MORPHING) ---
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// Mobilde dünyanın ekrana sığması için kamerayı uzaklaştırıyoruz
const initialZ = window.innerWidth < 768 ? 18 : 12;
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = initialZ;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

let globe;
const particleCount = 10000;
const spherePositions = [];  
const earthPositions = [];   
let morphProgress = 0;       

const img = new Image();
img.crossOrigin = "anonymous";
img.src = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg";

img.onload = () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;

    let added = 0;
    const radius = 3.5;

    while(added < particleCount) {
        const phi = Math.acos(Math.random() * 2 - 1); 
        const theta = Math.random() * Math.PI * 2;    

        const u = theta / (Math.PI * 2);
        const v = phi / Math.PI;

        const px = Math.floor(u * tempCanvas.width);
        const py = Math.floor(v * tempCanvas.height);
        const index = (py * tempCanvas.width + px) * 4;

        const r = imgData[index]; 
        
        if (r < 50) { 
            earthPositions.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );

            const phi2 = Math.acos(Math.random() * 2 - 1);
            const theta2 = Math.random() * Math.PI * 2;
            spherePositions.push(
                radius * Math.sin(phi2) * Math.cos(theta2),
                radius * Math.cos(phi2),
                radius * Math.sin(phi2) * Math.sin(theta2)
            );

            added++;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(spherePositions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.025,
        color: 0x8CA9C4, 
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    globe = new THREE.Points(geometry, material);
    scene.add(globe);

    initGSAP();
};

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    // Fare takibi masaüstünde etkin
    if(window.innerWidth > 768) {
        mouseX = (event.clientX - windowHalfX) * 0.0005;
        mouseY = (event.clientY - windowHalfY) * 0.0005;
    }
});

function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#smooth-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
            onUpdate: (self) => {
                morphProgress = self.progress; 
            }
        }
    });

    tl.to(globe.scale, { x: 2.2, y: 2.2, z: 2.2, duration: 1 }, 0)
      .to(globe.position, { y: -1.5, duration: 1 }, 0);
}

function animate() {
    requestAnimationFrame(animate);

    targetX = mouseX * 1;
    targetY = mouseY * 1;

    if (globe) {
        globe.rotation.y += 0.0015; 
        
        globe.rotation.x += (targetY - globe.rotation.x) * 0.05;
        globe.rotation.y += (targetX - globe.rotation.y) * 0.05;

        const positions = globe.geometry.attributes.position.array;
        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = spherePositions[i] + (earthPositions[i] - spherePositions[i]) * morphProgress;
        }
        globe.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Telefon döndürüldüğünde veya ekran yeniden boyutlandırıldığında kamera Z eksenini otomatik güncelle
    if(window.innerWidth < 768) {
        camera.position.z = 18;
    } else {
        camera.position.z = 12;
    }
});