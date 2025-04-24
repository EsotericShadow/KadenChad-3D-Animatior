class PortfolioScene {
    constructor() {
        this.bioText = `I'm a 3D Animator with a passion for storytelling and performance, recently graduating with
distinction from the world-renowned Think Tank Training Centre. Before diving into the world of
animation, I spent nearly a decade as a stage actor and voice-over artist. An experience that
deeply informs my approach to character and motion.
My journey into animation began after watching The Iron Giant in 2022, a film that sparked a
profound connection to the art of visual storytelling. I specialize in character animation using
Autodesk Maya and Blender, blending technical skill with a performer's intuition to bring
characters to life`;
        this.initScene();
        this.createContentFrames();
        this.setupEventListeners();
        this.setupCustomCursor();
        this.initLoadingScreen();
        this.lastScrollTime = Date.now();
        this.tooltipVisible = true;
        this.animations = [];
        this.previousFrameIndex = null;
        this.isTransitioning = false;
        this.zoomThresholds = [-500, -1500, -2500, -3500, -4500];
        this.softLockEnabled = true;
        this.immersiveMode = false;
        this.idleTimer = null;
        this.lastInteractionTime = Date.now();
        
        this.detectTouchDevice();
        
        this.animate();
    }
    
    detectTouchDevice() {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        document.body.classList.add(isTouchDevice ? 'touch-device' : 'non-touch-device');
    }

    handleTouchMove(e) {
    if (e.touches.length === 2 && !this.isTransitioning) {
        e.preventDefault();
        const currentDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        
        const prevZoomZ = this.zoomZ;
        
        const delta = (currentDistance - this.touchStartDistance) * 0.5;
        
        // Reduced sensitivity for more precise control
        const sensitivityFactor = 6;
        
        if (Math.abs(delta) > 5) {
            const intendedZoomZ = this.touchStartZoom - delta * sensitivityFactor;
            
            if (intendedZoomZ < -4500) {
                if (this.camera.position.z <= -4450) { // Tolerance of 50 units
                    // Camera is at or beyond contact frame, trigger direct jump to logo frame
                    this.performSmoothTransition(-500);
                } else {
                    // Clamp to contact frame and ensure we stop there
                    this.zoomZ = -4500;
                    this.targetZoomZ = -4500;
                    // Force a small delay before allowing further transitions
                    this.isTransitioning = true;
                    setTimeout(() => { this.isTransitioning = false; }, 300);
                }
            } else if (intendedZoomZ > -400) {
                if (this.camera.position.z >= -550) { // Tolerance of 50 units
                    // Camera is at or before logo frame, trigger direct jump to contact frame
                    this.performSmoothTransition(-4500);
                } else {
                    // Clamp to logo frame
                    this.zoomZ = -500;
                    this.targetZoomZ = -500;
                }
            } else {
                // Calculate which threshold we're closest to
                const closestThreshold = this.findClosestThreshold(intendedZoomZ);
                
                // If we're moving quickly, snap to the nearest frame
                const isMovingQuickly = Math.abs(delta) > 20;
                if (isMovingQuickly) {
                    this.performSmoothTransition(closestThreshold);
                } else {
                    // Normal movement behavior
                    this.zoomZ = intendedZoomZ;
                    this.zoomZ = Math.max(Math.min(this.zoomZ, -500), -4500);
                    
                    const prevThresholdIndex = this.getThresholdIndex(prevZoomZ);
                    const currentThresholdIndex = this.getThresholdIndex(this.zoomZ);
                    
                    if (prevThresholdIndex !== currentThresholdIndex) {
                        if (this.softLockEnabled) {
                            this.targetZoomZ = this.zoomThresholds[currentThresholdIndex];
                            this.isTransitioning = true;
                            setTimeout(() => { this.isTransitioning = false; }, 1000);
                        }
                    }
                }
            }
        }
        
        this.handleUserInteraction();
        }
    }

    initLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingBar = document.querySelector('.loading-bar');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    loadingScreen.style.visibility = 'hidden';
                    
                    setTimeout(() => {
                        const navHints = document.querySelector('.navigation-hints');
                        navHints.classList.add('visible');
                        
                        setTimeout(() => {
                            navHints.classList.remove('visible');
                        }, 10000);
                    }, 1000);
                }, 500);
            }
            loadingBar.style.width = `${progress}%`;
        }, 200);
    }

    setupCustomCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
        
        const cursorTrail = document.createElement('div');
        cursorTrail.className = 'custom-cursor-trail';
        document.body.appendChild(cursorTrail);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
            
            setTimeout(() => {
                cursorTrail.style.left = `${e.clientX}px`;
                cursorTrail.style.top = `${e.clientY}px`;
            }, 50);
        });
        
        document.addEventListener('mousedown', () => {
            cursor.classList.add('active');
        });
        
        document.addEventListener('mouseup', () => {
            cursor.classList.remove('active');
        });
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
        this.zoomZ = -500;
        this.targetZoomZ = -500;
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
        
        this.cameraLight = new THREE.PointLight(0x007bff, 1, 1000);
        this.cameraLight.position.set(0, 0, 0);
        this.camera.add(this.cameraLight);
        this.scene.add(this.camera);
    }

    createParticles() {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 1500;
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2500;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2500;
            positions[i * 3 + 2] = Math.random() * -6000;
            sizes[i] = Math.random() * 4 + 2;
            
            const colorChoice = Math.random();
            if (colorChoice < 0.7) {
                colors[i * 3] = 0;
                colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
                colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
            } else if (colorChoice < 0.9) {
                colors[i * 3] = 0.5 + Math.random() * 0.2;
                colors[i * 3 + 1] = 0;
                colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
            } else {
                colors[i * 3] = 0.8 + Math.random() * 0.2;
                colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
                colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
            }
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 3,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            vertexColors: true
        });

        this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particleSystem);
    }

    // New method to determine the current frame index based on camera position
    getCurrentFrameIndex(cameraZ) {
        if (cameraZ > -1000) return 0;
        if (cameraZ > -2000) return 1;
        if (cameraZ > -3000) return 2;
        if (cameraZ > -4000) return 3;
        return 4;
    }

    setupEventListeners() {
        window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('keydown', this.handleKeyDown.bind(this));

        const setupNavigation = () => {
            document.getElementById('nav-home').addEventListener('click', (e) => {
                e.preventDefault();
                this.zoomZ = -1500; // Changed from targetZoomZ to zoomZ
                this.isTransitioning = true;
                setTimeout(() => { this.isTransitioning = false; }, 1000);
            });
            
            document.getElementById('nav-bio').addEventListener('click', (e) => {
                e.preventDefault();
                this.zoomZ = -2500; // Changed from targetZoomZ to zoomZ
                this.isTransitioning = true;
                setTimeout(() => { this.isTransitioning = false; }, 1000);
            });
            
            document.getElementById('nav-reel').addEventListener('click', (e) => {
                e.preventDefault();
                this.zoomZ = -3500; // Changed from targetZoomZ to zoomZ
                this.isTransitioning = true;
                setTimeout(() => { this.isTransitioning = false; }, 1000);
            });
            
            document.getElementById('nav-contact').addEventListener('click', (e) => {
                e.preventDefault();
                this.zoomZ = -4500; // Changed from targetZoomZ to zoomZ
                this.isTransitioning = true;
                setTimeout(() => { this.isTransitioning = false; }, 1000);
            });
        };
        
        setupNavigation();
        
        document.addEventListener('DOMContentLoaded', setupNavigation);
        
        ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'].forEach(eventType => {
            window.addEventListener(eventType, () => {
                this.lastInteractionTime = Date.now();
                
                if (this.immersiveMode) {
                    this.toggleImmersiveMode();
                }
                
                this.resetIdleTimer();
            });
        });
        
        this.resetIdleTimer();
    }
    
    resetIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
        
        this.idleTimer = setTimeout(() => {
            if (!this.immersiveMode) {
                this.toggleImmersiveMode();
            }
        }, 30000);
    }
    
    toggleImmersiveMode() {
        this.immersiveMode = !this.immersiveMode;
        document.body.classList.toggle('immersive-mode', this.immersiveMode);
    }
    
    handleKeyDown(e) {
        if (e.key === 'i' || e.key === 'I') {
            this.toggleImmersiveMode();
        }
    }

    // Helper method for smooth transitions
    performSmoothTransition(targetZ) {
        this.targetZoomZ = targetZ;
        this.isTransitioning = true;
        
        const transitionDuration = 1000;
        const startTime = Date.now();
        const startZoom = this.zoomZ;
        
        const animateTransition = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / transitionDuration, 1);
            const easedProgress = this.easeInOutQuad(progress);
            this.zoomZ = startZoom + (this.targetZoomZ - startZoom) * easedProgress;
            
            if (progress < 1) {
                requestAnimationFrame(animateTransition);
            } else {
                this.zoomZ = this.targetZoomZ;
                this.isTransitioning = false;
            }
        };
        
        requestAnimationFrame(animateTransition);
    }

    handleWheel(e) {
        e.preventDefault();
        
        if (this.isTransitioning) return;
        
        const prevZoomZ = this.zoomZ;
        this.zoomZ -= e.deltaY * 0.8;
        
        if (this.zoomZ < -4500) {
            // Direct jump to logo frame when scrolling past contact frame
            this.performSmoothTransition(-500);
        } else if (this.zoomZ > -400) {
            // Direct jump to contact frame when scrolling before logo frame
            this.performSmoothTransition(-4500);
        } else {
            this.zoomZ = Math.max(Math.min(this.zoomZ, -500), -4500);
            
            const prevThresholdIndex = this.getThresholdIndex(prevZoomZ);
            const currentThresholdIndex = this.getThresholdIndex(this.zoomZ);
            
            if (prevThresholdIndex !== currentThresholdIndex) {
                if (this.softLockEnabled) {
                    this.targetZoomZ = this.zoomThresholds[currentThresholdIndex];
                    this.isTransitioning = true;
                    setTimeout(() => { this.isTransitioning = false; }, 1000);
                }
            }
        }
        
        this.handleUserInteraction();
    }
    
    // Helper method to find the closest threshold to a given z value
    findClosestThreshold(zValue) {
        let closestThreshold = this.zoomThresholds[0];
        let minDistance = Math.abs(zValue - closestThreshold);
        
        for (let i = 1; i < this.zoomThresholds.length; i++) {
            const distance = Math.abs(zValue - this.zoomThresholds[i]);
            if (distance < minDistance) {
                minDistance = distance;
                closestThreshold = this.zoomThresholds[i];
            }
        }
        
        return closestThreshold;
    }

    getThresholdIndex(zValue) {
        for (let i = 0; i < this.zoomThresholds.length; i++) {
            if (zValue > this.zoomThresholds[i]) {
                return i;
            }
        }
        return this.zoomThresholds.length - 1;
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
        if (e.touches.length === 2 && !this.isTransitioning) {
            e.preventDefault();
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            
            const prevZoomZ = this.zoomZ;
            const delta = (currentDistance - this.touchStartDistance) * 0.5;
            const sensitivityFactor = 8;
            
            if (Math.abs(delta) > 5) {
                this.zoomZ = this.touchStartZoom - delta * sensitivityFactor;
            }
            
            if (this.zoomZ < -4500) {
                this.targetZoomZ = -500;
                this.isTransitioning = true;
                
                const transitionDuration = 1000;
                const startTime = Date.now();
                const startZoom = this.zoomZ;
                
                const animateTransition = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / transitionDuration, 1);
                    const easedProgress = this.easeInOutQuad(progress);
                    this.zoomZ = startZoom + (this.targetZoomZ - startZoom) * easedProgress;
                    
                    if (progress < 1) {
                        requestAnimationFrame(animateTransition);
                    } else {
                        this.zoomZ = this.targetZoomZ;
                        this.isTransitioning = false;
                    }
                };
                
                requestAnimationFrame(animateTransition);
            } else {
                this.zoomZ = Math.max(this.zoomZ, -4500);
                
                const prevThresholdIndex = this.getThresholdIndex(prevZoomZ);
                const currentThresholdIndex = this.getThresholdIndex(this.zoomZ);
                
                if (prevThresholdIndex !== currentThresholdIndex) {
                    if (this.softLockEnabled) {
                        this.targetZoomZ = this.zoomThresholds[currentThresholdIndex];
                        this.isTransitioning = true;
                        setTimeout(() => { this.isTransitioning = false; }, 1000);
                    }
                }
            }
            
            this.handleUserInteraction();
        }
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    handleMouseMove() {
        this.handleUserInteraction();
    }

    handleUserInteraction() {
        this.lastScrollTime = Date.now();
        this.updateTimelineMarkers();
    }

    updateNavLinks() {
        const navMap = {
            0: 'nav-home',
            1: 'nav-home',
            2: 'nav-bio',
            3: 'nav-reel',
            4: 'nav-contact'
        };
        
        const activeNavId = navMap[this.activeFrameIndex];
        
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.id === activeNavId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    updateTimelineMarkers() {
        document.querySelectorAll('.timeline-marker').forEach(marker => {
            const markerIndex = parseInt(marker.getAttribute('data-index'));
            if (markerIndex === this.activeFrameIndex) {
                marker.classList.add('active');
            } else {
                marker.classList.remove('active');
            }
        });
    }

    createContentFrames() {
        const logoFrame = document.createElement('div');
        logoFrame.className = 'raw-logo';
        logoFrame.innerHTML = `<img src="assets/Character.png" alt="Kaden Chad Logo" class="logo-img">`;
        document.body.appendChild(logoFrame);
        this.logoFrame = logoFrame;
        
        const homeFrame = document.createElement('div');
        homeFrame.className = 'frame';
        homeFrame.innerHTML = `
            <div class="header-content">
                <div class="header-text">
                    <h1>KADEN CHAD</h1>
                    <h2>ANIMATING THE FUTURE</h2>
                    <p>3D Character Animator</p>
                    <div class="skill-badges">
                        <div class="badge">Maya</div>
                        <div class="badge">Blender</div>
                        <div class="badge">Motion Capture</div>
                    </div>
                </div>
                <div class="profile-pic-container">
                    <img src="assets/profile_picture.png" alt="Kaden Chad" class="profile-pic">
                </div>
            </div>
        `;
        document.body.appendChild(homeFrame);
        this.homeFrame = homeFrame;
        
        const bioFrame = document.createElement('div');
        bioFrame.className = 'frame';
        bioFrame.innerHTML = `
            <h2>FROM STAGE TO 3D</h2>
            <p>${this.bioText}</p>
        `;
        document.body.appendChild(bioFrame);
        this.bioFrame = bioFrame;
        
        const reelFrame = document.createElement('div');
        reelFrame.className = 'frame';
        reelFrame.innerHTML = `
            <h2>ANIMATION REEL</h2>
            <div class="video-container">
                <div class="responsive-video">
                    <iframe 
                        src="https://player.vimeo.com/video/1071654651?badge=0&autopause=0&player_id=0&app_id=58479" 
                        frameborder="0" 
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" 
                        title="Kaden Chad CG Animation Demo April 2025"
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        `;
        document.body.appendChild(reelFrame);
        this.reelFrame = reelFrame;
        
        const contactFrame = document.createElement('div');
        contactFrame.className = 'frame';
        contactFrame.innerHTML = `
            <h2>CONNECT</h2>
            <div class="contact-form">
                <input type="text" placeholder="Your Name">
                <input type="email" placeholder="Your Email">
                <textarea rows="5" placeholder="Your Message"></textarea>
                <button>SEND MESSAGE</button>
            </div>
        `;
        document.body.appendChild(contactFrame);
        this.contactFrame = contactFrame;
        
        this.frames = [
            { element: this.logoFrame, z: -500, className: 'raw-logo-visible', exitClassName: 'raw-logo-exiting' },
            { element: this.homeFrame, z: -1500, className: 'frame-visible', exitClassName: 'frame-exiting' },
            { element: this.bioFrame, z: -2500, className: 'frame-visible', exitClassName: 'frame-exiting' },
            { element: this.reelFrame, z: -3500, className: 'frame-visible', exitClassName: 'frame-exiting' },
            { element: this.contactFrame, z: -4500, className: 'frame-visible', exitClassName: 'frame-exiting' }
        ];
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        this.camera.position.z += (this.zoomZ - this.camera.position.z) * 0.05;
        
        if (this.particleSystem) {
            const positions = this.particleSystem.geometry.attributes.position.array;
            const time = Date.now() * 0.0001;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += Math.sin(time + i * 0.1) * 0.1;
                positions[i + 1] += Math.cos(time + i * 0.1) * 0.1;
            }
            
            this.particleSystem.geometry.attributes.position.needsUpdate = true;
            this.particleSystem.rotation.z += 0.0005;
        }
        
        this.updateFrameVisibility();
        
        // Update active frame index based on camera position
        const currentIndex = this.getCurrentFrameIndex(this.camera.position.z);
        if (currentIndex !== this.activeFrameIndex) {
            this.activeFrameIndex = currentIndex;
            this.updateNavLinks();
            this.updateTimelineMarkers();
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    updateFrameVisibility() {
        const cameraZ = this.camera.position.z;
        
        this.frames.forEach((frame, index) => {
            const distance = Math.abs(cameraZ - frame.z);
            
            if (distance < 500) {
                frame.element.classList.add(frame.className);
                frame.element.classList.remove(frame.exitClassName);
                
                if (this.softLockEnabled && Math.abs(cameraZ - this.zoomThresholds[this.activeFrameIndex]) < 10) {
                    if (index === this.activeFrameIndex) {
                        if (index === 0) {
                            frame.element.classList.add('raw-logo-locked');
                        } else {
                            frame.element.classList.add('frame-locked');
                        }
                    }
                } else {
                    frame.element.classList.remove('frame-locked');
                    frame.element.classList.remove('raw-logo-locked');
                }
            } else if (distance < 1000) {
                frame.element.classList.remove(frame.className);
                frame.element.classList.add(frame.exitClassName);
                frame.element.classList.remove('frame-locked');
                frame.element.classList.remove('raw-logo-locked');
            } else {
                frame.element.classList.remove(frame.className);
                frame.element.classList.remove(frame.exitClassName);
                frame.element.classList.remove('frame-locked');
                frame.element.classList.remove('raw-logo-locked');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const timeline = document.getElementById('progress-timeline');
    if (timeline) {
        for (let i = 0; i < 5; i++) {
            const marker = document.createElement('div');
            marker.className = 'timeline-marker';
            marker.setAttribute('data-index', i);
            if (i === 0) marker.classList.add('active');
            timeline.appendChild(marker);
        }
    }
    
    window.portfolioScene = new PortfolioScene();
    
    document.getElementById('nav-home').onclick = (e) => {
        e.preventDefault();
        window.portfolioScene.zoomZ = -1500;
        window.portfolioScene.isTransitioning = true;
        setTimeout(() => { window.portfolioScene.isTransitioning = false; }, 1000);
    };
    
    document.getElementById('nav-bio').onclick = (e) => {
        e.preventDefault();
        window.portfolioScene.zoomZ = -2500;
        window.portfolioScene.isTransitioning = true;
        setTimeout(() => { window.portfolioScene.isTransitioning = false; }, 1000);
    };
    
    document.getElementById('nav-reel').onclick = (e) => {
        e.preventDefault();
        window.portfolioScene.zoomZ = -3500;
        window.portfolioScene.isTransitioning = true;
        setTimeout(() => { window.portfolioScene.isTransitioning = false; }, 1000);
    };
    
    document.getElementById('nav-contact').onclick = (e) => {
        e.preventDefault();
        window.portfolioScene.zoomZ = -4500;
        window.portfolioScene.isTransitioning = true;
        setTimeout(() => { window.portfolioScene.isTransitioning = false; }, 1000);
    };
});
