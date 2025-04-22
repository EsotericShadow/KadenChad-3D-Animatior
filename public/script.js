import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

class PortfolioScene {
    constructor() {
        this.bioText = `I'm a 3D Animator with a passion for storytelling, graduating with distinction from Think Tank Training Centre. With a decade as a stage actor and voice-over artist, my animation journey began with a deep love for character-driven narratives. Specializing in Autodesk Maya and Blender, I blend technical skill with performance intuition.`;
        this.initScene();
        this.createContentFrames();
        this.setupEventListeners();
        this.animate();
        this.lastScrollTime = Date.now();
        this.tooltipVisible = true;
        this.animations = [];
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0A0F1A);
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.set(0, 0, 1000);
        this.zoomZ = -500; // Set to match the logo frame's z position
        this.activeFrameIndex = 0;
        this.frames = [];
        this.particles = [];

        this.createParticles();
        this.setupLights();
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        this.spotLight = new THREE.SpotLight(0x00FFFF, 2);
        this.spotLight.position.set(0, 0, 1000);
        this.spotLight.angle = Math.PI / 4;
        this.spotLight.penumbra = 0.5;
        this.spotLight.decay = 2;
        this.spotLight.distance = 2000;
        this.scene.add(this.spotLight);
    }

    createParticles() {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 1500;
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2500;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2500;
            positions[i * 3 + 2] = Math.random() * -6000;
            sizes[i] = Math.random() * 4 + 2;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            size: 3,
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particleSystem);
    }

    setupEventListeners() {
        window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(link.dataset.index);
                if (index === 0) {
                    this.zoomZ = -500;
                    this.activeFrameIndex = 0;
                } else {
                    this.zoomZ = -500 - index * 1000;
                    this.activeFrameIndex = index;
                }
                this.updateNavLinks();
                this.handleUserInteraction();
            });
        });
    }

    handleWheel(e) {
        e.preventDefault();
        this.zoomZ -= e.deltaY * 0.8;
        this.zoomZ = Math.max(this.zoomZ, -5000);
        this.handleUserInteraction();
    }

    handleTouchStart(e) {
        if (e.touches.length === 2) {
            this.touchStartDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            this.touchStartZoom = this.zoomZ;
        }
    }

    handleTouchMove(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const delta = (currentDistance - this.touchStartDistance) * 0.5;
            this.zoomZ = Math.max(this.touchStartZoom - delta * 20, -5000);
            this.handleUserInteraction();
        }
    }

    handleMouseMove(e) {
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        this.frames.forEach(frame => {
            const screenPos = frame.mesh.position.clone().project(this.camera);
            const dist = Math.hypot(mouseX - screenPos.x, mouseY - screenPos.y);
            this.animateElement(frame.div, {
                transform: dist < 0.2 ? 'translate(-50%, -50%) scale(1.05)' : 'translate(-50%, -50%) scale(1)'
            }, 300);
        });
    }

    handleUserInteraction() {
        if (this.tooltipVisible) {
            this.tooltipVisible = false;
            this.animateElement(document.querySelector('.tooltip'), {
                opacity: 0
            }, 1000);
        }
        this.lastScrollTime = Date.now();
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animateElement(element, properties, duration) {
        const startTime = performance.now();
        const startValues = {};
        
        for (const prop in properties) {
            startValues[prop] = parseFloat(getComputedStyle(element)[prop]) || 0;
        }
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            for (const prop in properties) {
                if (prop === 'transform') {
                    element.style.transform = properties[prop];
                } else if (prop === 'opacity') {
                    element.style.opacity = properties[prop];
                } else {
                    element.style[prop] = `${properties[prop]}px`;
                }
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    createContentFrames() {
        const frameData = [
            {
                z: -500,
                html: `
                    <img src="assets/Logo.png" alt="Kaden Chad Logo" class="logo-img">
                `
            },
            {
                z: -1500,
                html: `
                    <div class="header-content">
                        <div class="header-text">
                            <h1>Kaden Chad</h1>
                            <h2>Animating the Future</h2>
                            <p>3D Character Animator</p>
                            <div class="skill-badges">
                                <span class="badge">Maya</span>
                                <span class="badge">Blender</span>
                                <span class="badge">Motion Capture</span>
                            </div>
                        </div>
                        <div class="profile-pic-container">
                            <img src="assets/profile.png" alt="Profile Picture" class="profile-pic">
                        </div>
                    </div>
                `
            },
            {
                z: -2500,
                html: `
                    <h2>From Stage to 3D</h2>
                    <p>${this.bioText}</p>
                    <button class="voice-over-btn">Hear My Story</button>
                `
            },
            {
                z: -3500,
                html: `
                    <h2>Animation Reel</h2>
                    <div class="video-container">
                        <video controls playsinline>
                            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">
                        </video>
                    </div>
                `
            },
            {
                z: -4500,
                html: `
                    <h2>Connect</h2>
                    <div class="contact-form">
                        <input type="text" placeholder="Your Name">
                        <input type="email" placeholder="Your Email">
                        <textarea placeholder="Your Message" rows="4"></textarea>
                        <button>Send Message</button>
                    </div>
                `
            }
        ];

        frameData.forEach((config, index) => {
            const div = document.createElement('div');
            div.className = index === 0 ? 'raw-logo' : 'frame';
            div.innerHTML = config.html;
            document.body.appendChild(div);

            const img = div.querySelector('img');
            if (img) {
                img.onerror = () => {
                    console.error('Failed to load image:', img.src);
                };
                img.onload = () => {
                    console.log('Image loaded successfully:', img.src);
                };
            }

            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(20, 15),
                new THREE.MeshBasicMaterial({ visible: false })
            );
            mesh.position.z = config.z;
            mesh.userData.index = index;
            this.scene.add(mesh);

            // Set initial visibility
            div.classList.toggle(index === 0 ? 'raw-logo-visible' : 'frame-visible', index === 0);
            div.style.pointerEvents = index === 0 ? 'auto' : 'none';

            this.frames.push({ mesh, div, zPos: config.z });
        });
    }

    updateNavLinks() {
        document.querySelectorAll('.nav-link').forEach(link => {
            const navIndex = parseInt(link.dataset.index);
            let isActive = false;
            if (navIndex === 0) {
                isActive = this.activeFrameIndex === 0 || this.activeFrameIndex === 1;
            } else {
                isActive = this.activeFrameIndex === navIndex;
            }
            link.classList.toggle('active', isActive);
        });
    }

    updateFrames() {
        // Determine active frame based on camera z-position
        if (this.camera.position.z > -1000) {
            this.activeFrameIndex = 0; // Logo
        } else if (this.camera.position.z > -2000) {
            this.activeFrameIndex = 1; // Header
        } else if (this.camera.position.z > -3000) {
            this.activeFrameIndex = 2; // Bio
        } else if (this.camera.position.z > -4000) {
            this.activeFrameIndex = 3; // Reel
        } else {
            this.activeFrameIndex = 4; // Contact
        }

        document.querySelectorAll('.timeline-marker').forEach(marker => {
            const markerIndex = parseInt(marker.dataset.index);
            let isActive = false;
            if (markerIndex === 0) {
                isActive = this.activeFrameIndex === 0 || this.activeFrameIndex == 1;
            } else {
                isActive = this.activeFrameIndex === markerIndex;
            }
            marker.classList.toggle('active', isActive);
        });

        this.updateNavLinks();

        this.frames.forEach((frame, index) => {
            const isActive = index === this.activeFrameIndex;
            if (index === 0) {
                frame.div.classList.toggle('raw-logo-visible', isActive);
                console.log('Logo visibility:', isActive, 'Camera Z:', this.camera.position.z, 'Classes:', frame.div.className);
            } else {
                frame.div.classList.toggle('frame-visible', isActive);
            }
            frame.div.style.pointerEvents = isActive ? 'auto' : 'none';
        });
    }

    updateParticles() {
        const positions = this.particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] += 6;
            if (positions[i + 2] > 1000) {
                positions[i] = (Math.random() - 0.5) * 2500;
                positions[i + 1] = (Math.random() - 0.5) * 2500;
                positions[i + 2] = -6000;
            }
        }
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    updateProgressBar() {
        const timeline = document.querySelector('#progress-timeline');
        if (!timeline) return;
        timeline.style.opacity = Date.now() - this.lastScrollTime > 3000 ? '0' : '1';
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const damp = 0.1;
        this.camera.position.z += (this.zoomZ - this.camera.position.z) * damp;
        this.spotLight.position.z = this.camera.position.z;
        
        this.updateFrames();
        this.updateParticles();
        this.updateProgressBar();
        
        this.renderer.render(this.scene, this.camera);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.portfolioScene = new PortfolioScene();
    setTimeout(() => {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) tooltip.style.opacity = '0';
    }, 5000);
});
