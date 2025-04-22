// Use the globally loaded THREE from the script tag
// Remove the import statement since we're now loading Three.js via script tag
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

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
        
        // Detect if device is touch-enabled
        this.detectTouchDevice();
        
        // Start animation loop
        this.animate();
    }
    
    detectTouchDevice() {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        document.body.classList.add(isTouchDevice ? 'touch-device' : 'non-touch-device');
    }

    initLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingBar = document.querySelector('.loading-bar');
        
        // Simulate loading progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Hide loading screen after a short delay
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    loadingScreen.style.visibility = 'hidden';
                    
                    // Show navigation hints after loading
                    setTimeout(() => {
                        const navHints = document.querySelector('.navigation-hints');
                        navHints.classList.add('visible');
                        
                        // Hide navigation hints after 10 seconds
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
        // Create custom cursor elements
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
        
        const cursorTrail = document.createElement('div');
        cursorTrail.className = 'custom-cursor-trail';
        document.body.appendChild(cursorTrail);
        
        // Update cursor position on mouse move
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
            
            // Delayed trail effect
            setTimeout(() => {
                cursorTrail.style.left = `${e.clientX}px`;
                cursorTrail.style.top = `${e.clientY}px`;
            }, 50);
        });
        
        // Change cursor state on mouse down/up
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
        this.zoomZ = -500; // Set to match the logo frame's z position
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
        
        // Add a point light that follows the camera
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
            
            // Add color variation to particles
            const colorChoice = Math.random();
            if (colorChoice < 0.7) {
                // Cyan/blue particles (majority)
                colors[i * 3] = 0;
                colors[i * 3 + 1] = 0.7 + Math.random() * 0.3; // Cyan component
                colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // Blue component
            } else if (colorChoice < 0.9) {
                // Purple particles
                colors[i * 3] = 0.5 + Math.random() * 0.2;
                colors[i * 3 + 1] = 0;
                colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
            } else {
                // White particles (minority)
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

    setupEventListeners() {
        window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('keydown', this.handleKeyDown.bind(this));

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(link.dataset.index);
                this.navigateToSection(index);
            });
        });
        
        // Track user interaction for idle detection
        ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'].forEach(eventType => {
            window.addEventListener(eventType, () => {
                this.lastInteractionTime = Date.now();
                
                // If we were in immersive mode, exit it
                if (this.immersiveMode) {
                    this.toggleImmersiveMode();
                }
                
                // Reset idle timer
                this.resetIdleTimer();
            });
        });
        
        // Set initial idle timer
        this.resetIdleTimer();
    }
    
    resetIdleTimer() {
        // Clear existing timer
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
        
        // Set new timer - enter immersive mode after 30 seconds of inactivity
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
        // Toggle immersive mode with 'i' key
        if (e.key === 'i' || e.key === 'I') {
            this.toggleImmersiveMode();
        }
    }

    navigateToSection(index) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Handle the special case for Home which has two frames (logo and header)
        if (index === 0) {
            this.targetZoomZ = -500;
            this.activeFrameIndex = 0;
        } else {
            this.targetZoomZ = -500 - index * 1000;
            this.activeFrameIndex = index;
        }
        
        this.updateNavLinks();
        this.handleUserInteraction();
        
        // Set a timeout to allow the transition to complete
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1000);
    }

    handleWheel(e) {
        e.preventDefault();
        
        if (this.isTransitioning) return;
        
        const prevZoomZ = this.zoomZ;
        this.zoomZ -= e.deltaY * 0.8;
        
        // Implement infinite loop - if we go past the last section, loop back to the first
        // Modified to transition smoothly forward to the logo frame without reversing
        if (this.zoomZ < -4500) {
            // Instead of immediately resetting, set target to logo position
            this.targetZoomZ = -500; // Logo position
            this.isTransitioning = true;
            
            // Animate the transition to the logo frame
            const transitionDuration = 1000; // 1 second transition
            const startTime = Date.now();
            const startZoom = this.zoomZ;
            
            const animateTransition = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / transitionDuration, 1);
                
                // Use easing function for smooth transition
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
            
            // Check if we've crossed a threshold
            const prevThresholdIndex = this.getThresholdIndex(prevZoomZ);
            const currentThresholdIndex = this.getThresholdIndex(this.zoomZ);
            
            if (prevThresholdIndex !== currentThresholdIndex) {
                // We've crossed a threshold, apply soft-locking
                if (this.softLockEnabled) {
                    this.targetZoomZ = this.zoomThresholds[currentThresholdIndex];
                    this.isTransitioning = true;
                    
                    // Set a timeout to allow the transition to complete
                    setTimeout(() => {
                        this.isTransitioning = false;
                    }, 1000);
                }
            }
        }
        
        this.handleUserInteraction();
    }
    
    // Easing function for smooth transitions
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
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
            this.zoomZ = this.touchStartZoom - delta * 20;
            
            // Implement infinite loop - if we go past the last section, loop back to the first
            // Modified to transition smoothly forward to the logo frame without reversing
            if (this.zoomZ < -4500) {
                // Instead of immediately resetting, set target to logo position
                this.targetZoomZ = -500; // Logo position
                this.isTransitioning = true;
                
                // Animate the transition to the logo frame
                const transitionDuration = 1000; // 1 second transition
                const startTime = Date.now();
                const startZoom = this.zoomZ;
                
                const animateTransition = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / transitionDuration, 1);
                    
                    // Use easing function for smooth transition
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
                
                // Check if we've crossed a threshold
                const prevThresholdIndex = this.getThresholdIndex(prevZoomZ);
                const currentThresholdIndex = this.getThresholdIndex(this.zoomZ);
                
                if (prevThresholdIndex !== currentThresholdIndex) {
                    // We've crossed a threshold, apply soft-locking
                    if (this.softLockEnabled) {
                        this.targetZoomZ = this.zoomThresholds[currentThresholdIndex];
                        this.isTransitioning = true;
                        
                        // Set a timeout to allow the transition to complete
                        setTimeout(() => {
                            this.isTransitioning = false;
                        }, 1000);
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
        
        // Update active frame index based on current zoom level
        const newIndex = this.getThresholdIndex(this.zoomZ);
        if (newIndex !== this.activeFrameIndex) {
            this.activeFrameIndex = newIndex;
            this.updateNavLinks();
        }
        
        // Update timeline markers
        this.updateTimelineMarkers();
    }

    updateNavLinks() {
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkIndex = parseInt(link.dataset.index);
            if (linkIndex === this.activeFrameIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    updateTimelineMarkers() {
        document.querySelectorAll('.timeline-marker').forEach(marker => {
            const markerIndex = parseInt(marker.dataset.index);
            if (markerIndex === this.activeFrameIndex) {
                marker.classList.add('active');
            } else {
                marker.classList.remove('active');
            }
        });
    }

    createContentFrames() {
        // Create logo frame (first frame)
        const logoFrame = document.createElement('div');
        logoFrame.className = 'raw-logo';
        logoFrame.innerHTML = `<img src="assets/Character.png" alt="Kaden Chad Logo" class="logo-img">`;
        document.body.appendChild(logoFrame);
        this.logoFrame = logoFrame;
        
        // Create home frame
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
        
        // Create bio frame
        const bioFrame = document.createElement('div');
        bioFrame.className = 'frame';
        bioFrame.innerHTML = `
            <h2>FROM STAGE TO 3D</h2>
            <p>${this.bioText}</p>
            <button class="btn">Hear My Story</button>
        `;
        document.body.appendChild(bioFrame);
        this.bioFrame = bioFrame;
        
        // Create reel frame with Vimeo embed
        const reelFrame = document.createElement('div');
        reelFrame.className = 'frame';
        reelFrame.innerHTML = `
            <h2>ANIMATION REEL</h2>
            <div class="video-container">
                <div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1077504753?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="New_Demo - Kaden Chad"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>
            </div>
        `;
        document.body.appendChild(reelFrame);
        this.reelFrame = reelFrame;
        
        // Create contact frame
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
        
        // Store frames in array for easy access
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
        
        // Smooth camera movement
        this.camera.position.z += (this.zoomZ - this.camera.position.z) * 0.05;
        
        // Animate particles
        if (this.particleSystem) {
            const positions = this.particleSystem.geometry.attributes.position.array;
            const time = Date.now() * 0.0001;
            
            for (let i = 0; i < positions.length; i += 3) {
                // Add subtle wave motion to particles
                positions[i] += Math.sin(time + i * 0.1) * 0.1;
                positions[i + 1] += Math.cos(time + i * 0.1) * 0.1;
            }
            
            this.particleSystem.geometry.attributes.position.needsUpdate = true;
            this.particleSystem.rotation.z += 0.0005;
        }
        
        // Update frame visibility based on camera position
        this.updateFrameVisibility();
        
        this.renderer.render(this.scene, this.camera);
    }

    updateFrameVisibility() {
        const cameraZ = this.camera.position.z;
        
        this.frames.forEach((frame, index) => {
            const distance = Math.abs(cameraZ - frame.z);
            
            if (distance < 500) {
                // Frame is visible
                frame.element.classList.add(frame.className);
                frame.element.classList.remove(frame.exitClassName);
                
                // Add locked effect if we're at a threshold
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
                // Frame is exiting
                frame.element.classList.remove(frame.className);
                frame.element.classList.add(frame.exitClassName);
                frame.element.classList.remove('frame-locked');
                frame.element.classList.remove('raw-logo-locked');
            } else {
                // Frame is not visible
                frame.element.classList.remove(frame.className);
                frame.element.classList.remove(frame.exitClassName);
                frame.element.classList.remove('frame-locked');
                frame.element.classList.remove('raw-logo-locked');
            }
        });
    }
}

// Initialize the portfolio scene when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const portfolioScene = new PortfolioScene();
});
