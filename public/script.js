import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

class PortfolioScene {
    constructor() {
        this.bioText = `I'm a 3D Animator with a passion for storytelling, graduating with distinction from Think Tank Training Centre. With a decade as a stage actor and voice-over artist, my animation journey began with a deep love for character-driven narratives. Specializing in Autodesk Maya and Blender, I blend technical skill with performance intuition.`;
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
        this.zoomThresholds = [-1000, -2000, -3000, -4000, -5000];
        this.softLockEnabled = true;
        this.immersiveMode = false;
        this.idleTimer = null;
        this.lastInteractionTime = Date.now();
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
        this.zoomZ = Math.max(this.zoomZ, -5000);
        
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
        
        this.handleUserInteraction();
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
            this.zoomZ = Math.max(this.touchStartZoom - delta * 20, -5000);
            
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
            
            this.handleUserInteraction();
        }
    }

    handleMouseMove(e) {
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Parallax effect for particles
        this.particleSystem.rotation.x = mouseY * 0.05;
        this.particleSystem.rotation.y = mouseX * 0.05;
        
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
        
        // Show navigation bar and timeline when user interacts
        const navBar = document.querySelector('.nav-bar');
        if (navBar.classList.contains('hidden')) {
            navBar.classList.remove('hidden');
        }
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
                            <img src="assets/Character.png" alt="Profile Picture" class="profile-pic">
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
        
        // Add event listener to the "Hear My Story" button
        const bioButton = document.querySelector('.voice-over-btn');
        if (bioButton) {
            bioButton.addEventListener('click', () => {
                alert('Voice over feature would play here in a production environment.');
            });
        }
        
        // Add event listener to the contact form
        const contactForm = document.querySelector('.contact-form button');
        if (contactForm) {
            contactForm.addEventListener('click', (e) => {
                e.preventDefault();
                const nameInput = document.querySelector('.contact-form input[type="text"]');
                const emailInput = document.querySelector('.contact-form input[type="email"]');
                const messageInput = document.querySelector('.contact-form textarea');
                
                if (nameInput.value && emailInput.value && messageInput.value) {
                    alert(`Thank you for your message, ${nameInput.value}! In a production environment, this would be sent to Kaden Chad.`);
                    nameInput.value = '';
                    emailInput.value = '';
                    messageInput.value = '';
                } else {
                    alert('Please fill out all fields before sending your message.');
                }
            });
        }
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
        const prevActiveFrameIndex = this.activeFrameIndex;
        
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

        // Update timeline markers
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

        // Handle frame transitions with zoom and fade effects
        this.frames.forEach((frame, index) => {
            // Calculate distance from camera to determine if frame is approaching or receding
            const distanceToCamera = Math.abs(this.camera.position.z - frame.zPos);
            const isActive = index === this.activeFrameIndex;
            const wasActive = index === prevActiveFrameIndex && prevActiveFrameIndex !== this.activeFrameIndex;
            
            // Apply soft-locking effect
            if (isActive && this.softLockEnabled) {
                if (index === 0) {
                    frame.div.classList.add('raw-logo-locked');
                } else {
                    frame.div.classList.add('frame-locked');
                }
            } else {
                if (index === 0) {
                    frame.div.classList.remove('raw-logo-locked');
                } else {
                    frame.div.classList.remove('frame-locked');
                }
            }
            
            // Handle visibility and transitions
            if (index === 0) { // Logo
                if (isActive) {
                    frame.div.classList.add('raw-logo-visible');
                    frame.div.classList.remove('raw-logo-exiting');
                } else if (wasActive) {
                    frame.div.classList.add('raw-logo-exiting');
                    frame.div.classList.remove('raw-logo-visible');
                    
                    // Remove exiting class after animation completes
                    setTimeout(() => {
                        frame.div.classList.remove('raw-logo-exiting');
                    }, 1000);
                } else if (distanceToCamera < 800 && this.camera.position.z < frame.zPos) {
                    // Frame is approaching but not yet active
                    frame.div.classList.add('raw-logo-visible');
                    frame.div.classList.remove('raw-logo-exiting');
                } else if (distanceToCamera < 800 && this.camera.position.z > frame.zPos) {
                    // Frame is receding but still close
                    frame.div.classList.add('raw-logo-exiting');
                    frame.div.classList.remove('raw-logo-visible');
                    
                    // Remove exiting class after animation completes
                    setTimeout(() => {
                        frame.div.classList.remove('raw-logo-exiting');
                    }, 1000);
                } else {
                    frame.div.classList.remove('raw-logo-visible', 'raw-logo-exiting');
                }
                
                frame.div.style.pointerEvents = isActive ? 'auto' : 'none';
            } else { // Other frames
                if (isActive) {
                    frame.div.classList.add('frame-visible');
                    frame.div.classList.remove('frame-exiting');
                } else if (wasActive) {
                    frame.div.classList.add('frame-exiting');
                    frame.div.classList.remove('frame-visible');
                    
                    // Remove exiting class after animation completes
                    setTimeout(() => {
                        frame.div.classList.remove('frame-exiting');
                    }, 1000);
                } else if (distanceToCamera < 800 && this.camera.position.z < frame.zPos) {
                    // Frame is approaching but not yet active
                    frame.div.classList.add('frame-visible');
                    frame.div.classList.remove('frame-exiting');
                } else if (distanceToCamera < 800 && this.camera.position.z > frame.zPos) {
                    // Frame is receding but still close
                    frame.div.classList.add('frame-exiting');
                    frame.div.classList.remove('frame-visible');
                    
                    // Remove exiting class after animation completes
                    setTimeout(() => {
                        frame.div.classList.remove('frame-exiting');
                    }, 1000);
                } else {
                    frame.div.classList.remove('frame-visible', 'frame-exiting');
                }
                
                frame.div.style.pointerEvents = isActive ? 'auto' : 'none';
            }
        });
        
        this.previousFrameIndex = this.activeFrameIndex;
    }

    updateParticles() {
        const positions = this.particleSystem.geometry.attributes.position.array;
        const time = Date.now() * 0.0001;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Add subtle wave motion to particles
            positions[i] += Math.sin(time + positions[i] * 0.01) * 0.2;
            positions[i + 1] += Math.cos(time + positions[i + 1] * 0.01) * 0.2;
            
            // Move particles along z-axis
            positions[i + 2] += 6;
            
            // Reset particles that go beyond the camera
            if (positions[i + 2] > 1000) {
                positions[i] = (Math.random() - 0.5) * 2500;
                positions[i + 1] = (Math.random() - 0.5) * 2500;
                positions[i + 2] = -6000;
            }
        }
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        
        // Rotate particle system slightly for more dynamic effect
        this.particleSystem.rotation.z += 0.0005;
    }

    updateProgressBar() {
        const timeline = document.querySelector('#progress-timeline');
        if (!timeline) return;
        
        const navBar = document.querySelector('.nav-bar');
        const idleTime = Date.now() - this.lastScrollTime;
        
        // Hide UI elements after 3 seconds of inactivity
        if (idleTime > 3000 && !this.immersiveMode) {
            timeline.style.opacity = '0';
            navBar.classList.add('hidden');
        } else {
            timeline.style.opacity = '1';
            navBar.classList.remove('hidden');
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Apply soft-locking if enabled
        if (this.softLockEnabled && this.targetZoomZ !== undefined) {
            const damp = 0.05;
            this.zoomZ += (this.targetZoomZ - this.zoomZ) * damp;
        }
        
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
    
    // Hide tooltip after 5 seconds
    setTimeout(() => {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) tooltip.style.opacity = '0';
    }, 5000);
    
    // Add keyboard shortcut info
    console.info('Keyboard Shortcuts: Press "i" to toggle immersive mode');
});
