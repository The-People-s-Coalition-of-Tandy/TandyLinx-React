class Particle {
    constructor(index, config = {}) {
        const defaults = {
            startTimeOffset: 0,
            sizeMultiplier: 150,
            minSize: 15,
            isGlowing: false,
            speedMultiplier: 1
        };
        
        const options = { ...defaults, ...config };
        
        this.startTime = index * 0.5 + options.startTimeOffset;
        this.active = false;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.sizeMultiplier = this.isMobile ? options.sizeMultiplier * 0.67 : options.sizeMultiplier;
        this.minSize = options.minSize;
        this.isGlowing = options.isGlowing;
        this.speedMultiplier = options.speedMultiplier;

        this.reset();
    }

    reset() {
        const sizeMultiplier = this.isGlowing ? this.sizeMultiplier * 0.4 : this.sizeMultiplier;
        const minSize = this.isGlowing ? this.minSize * 0.5 : this.minSize;
        
        this.size = Math.random() * sizeMultiplier + minSize;
        this.speed = (this.size / 100) * this.speedMultiplier * (this.isGlowing ? 1.5 : 1);
        
        this.y = -this.size;
        this.x = Math.random() * window.innerWidth;
        this.z = Math.random() * 1000;
        
        const depthFactor = 1 - (this.z / 1000);
        this.speed *= (depthFactor * 0.4 + 0.1);
        
        this.active = false;
    }

    update(time) {
        if (time < this.startTime) return;
        
        if (!this.active) {
            this.active = true;
        }

        this.y += this.speed;
        const depthFactor = 1 - (this.z / 1000);
        
        const horizontalMovement = this.isGlowing ? 0.5 : 0.3;
        const verticalMovement = this.isGlowing ? 0.4 : 0.2;
        
        this.x += Math.sin(time + this.z * 0.001) * (horizontalMovement * depthFactor);
        this.z += Math.sin(time) * verticalMovement;
        
        this.z = Math.max(0, Math.min(1000, this.z));

        if (this.y > window.innerHeight + this.size) {
            this.reset();
            this.startTime = time - 0.1;
        }
    }
}

class ShaderAnimation {
    constructor() {
        this.setupCanvas();
        if (!this.gl) return;

        this.initState();
        this.activeParticles = new Set();
        this.particlePool = [];
        this.initParticles();
        this.initShaders();
        this.initBuffers();
        this.setupEventListeners();
        
        this.resize();
        this.initBurstParticles();
        this.setupLinkHoverEffects();
        this.transition = 0.0;
        this.animate();
    }

    setupCanvas() {
        this.canvas = document.getElementById('glCanvas');
        this.gl = this.canvas.getContext('webgl');
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }
    }

    initState() {
        this.rafId = null;
        this.isRunning = true;
        this.resizeTimeout = null;
        this.time = 0;
        this.animateColors = true;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    initParticles() {
        this.spheres = Array(15).fill(0).map((_, i) => new Particle(i, {
            sizeMultiplier: 150,
            minSize: 15,
            isGlowing: false
        }));

        this.glowingSpheres = Array(45).fill(0).map((_, i) => new Particle(i, {
            startTimeOffset: 2,
            sizeMultiplier: 80,
            minSize: 8,
            isGlowing: true,
            speedMultiplier: 1.2
        }));

        this.sphereData = new Float32Array(15 * 4);
        this.glowingSphereData = new Float32Array(45 * 4);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            if (this.resizeTimeout) {
                cancelAnimationFrame(this.resizeTimeout);
            }
            this.resizeTimeout = requestAnimationFrame(() => this.resize());
        });

        window.addEventListener('keypress', (e) => {
            if (e.key.toLowerCase() === 'c') {
                this.animateColors = !this.animateColors;
            }
        });
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    initShaders() {
        const vertexShader = this.createShader(
            this.gl.VERTEX_SHADER,
            document.getElementById('vertexShader').text
        );
        const fragmentShader = this.createShader(
            this.gl.FRAGMENT_SHADER,
            document.getElementById('fragmentShader').text
        );

        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Shader program failed to link');
            return;
        }

        this.gl.useProgram(this.program);
        this.initUniforms();
    }

    initUniforms() {
        this.uSpheres = this.gl.getUniformLocation(this.program, 'uSpheres');
        this.uGlowingSpheres = this.gl.getUniformLocation(this.program, 'uGlowingSpheres');
        this.uTime = this.gl.getUniformLocation(this.program, 'uTime');
        this.uResolution = this.gl.getUniformLocation(this.program, 'uResolution');
        this.colorToggleLocation = this.gl.getUniformLocation(this.program, 'uAnimateColors');
        this.uTransition = this.gl.getUniformLocation(this.program, 'uTransition');
    }

    initBuffers() {
        const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        const positionBuffer = this.gl.createBuffer();
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

        const aPosition = this.gl.getAttribLocation(this.program, 'aPosition');
        this.gl.enableVertexAttribArray(aPosition);
        this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, 0, 0);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height);
    }

    initBurstParticles() {
        this.particlePool = Array(100).fill(0).map(() => new Particle(0, {
            sizeMultiplier: 80,
            minSize: 8,
            isGlowing: true,
            speedMultiplier: 1.2
        }));
    }

    setupLinkHoverEffects() {
        const links = document.querySelectorAll('.link');
        links.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                const rect = link.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                this.createParticleBurst(centerX, centerY);
            });
        });
    }

    createParticleBurst(x, y) {
        const particleCount = 20;
        const angleStep = (Math.PI * 2) / particleCount;

        for (let i = 0; i < particleCount; i++) {
            const particle = this.particlePool.find(p => !this.activeParticles.has(p));
            if (!particle) {
                console.log('No available particles in pool');
                continue;
            }

            const angle = angleStep * i;
            const speed = Math.random() * 4 + 2;
            const distance = Math.random() * 150 + 100;

            particle.x = x;
            particle.y = y;
            particle.z = Math.random() * 500;
            particle.velocityX = Math.cos(angle) * speed;
            particle.velocityY = Math.sin(angle) * speed;
            particle.size = Math.random() * 20 + 10;
            particle.life = 1.0;
            particle.decay = 0.01;
            particle.active = true;

            this.activeParticles.add(particle);
        }
    }

    updateBurstParticles() {
        for (const particle of this.activeParticles) {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityX *= 0.98;
            particle.velocityY *= 0.98;
            particle.life -= particle.decay;

            particle.velocityY -= 0.05;

            if (particle.life <= 0) {
                particle.active = false;
                this.activeParticles.delete(particle);
            }
        }
    }

    updateSpheres() {
        const updateSphereData = (sphere, index, dataArray) => {
            if (sphere.active) {
                dataArray[index * 4] = sphere.x;
                dataArray[index * 4 + 1] = sphere.y;
                dataArray[index * 4 + 2] = sphere.z;
                dataArray[index * 4 + 3] = sphere.size;
            } else {
                dataArray[index * 4] = -1000;
                dataArray[index * 4 + 1] = -1000;
                dataArray[index * 4 + 2] = 0;
                dataArray[index * 4 + 3] = 0;
            }
        };

        this.spheres.forEach((sphere, i) => {
            sphere.update(this.time);
            updateSphereData(sphere, i, this.sphereData);
        });

        this.glowingSpheres.forEach((sphere, i) => {
            sphere.update(this.time);
            updateSphereData(sphere, i, this.glowingSphereData);
        });

        let extraIndex = this.glowingSpheres.length;
        console.log('Active burst particles:', this.activeParticles.size);
        
        for (const particle of this.activeParticles) {
            if (extraIndex >= this.glowingSphereData.length / 4) {
                console.log('Exceeded glowingSphereData capacity');
                break;
            }
            
            this.glowingSphereData[extraIndex * 4] = particle.x;
            this.glowingSphereData[extraIndex * 4 + 1] = particle.y;
            this.glowingSphereData[extraIndex * 4 + 2] = particle.z;
            this.glowingSphereData[extraIndex * 4 + 3] = particle.size * particle.life;
            
            console.log('Updated particle data:', extraIndex, {
                x: particle.x,
                y: particle.y,
                size: particle.size * particle.life
            });
            
            extraIndex++;
        }

        while (extraIndex < this.glowingSphereData.length / 4) {
            this.glowingSphereData[extraIndex * 4] = -1000;
            this.glowingSphereData[extraIndex * 4 + 1] = -1000;
            this.glowingSphereData[extraIndex * 4 + 2] = 0;
            this.glowingSphereData[extraIndex * 4 + 3] = 0;
            extraIndex++;
        }

        this.gl.uniform4fv(this.uSpheres, this.sphereData);
        this.gl.uniform4fv(this.uGlowingSpheres, this.glowingSphereData);
    }

    startTransition() {
        this.transition = 0;
        
        gsap.to(this, {
            transition: 1,
            duration: 1.5,
            ease: "power2.inOut",
            delay: 0.8
        });
    }

    animate() {
        if (!this.isRunning) return;
        
        this.time += 0.003;
        this.gl.uniform1f(this.uTime, this.time);
        this.gl.uniform1f(this.uTransition, this.transition);
        this.gl.uniform1i(this.colorToggleLocation, this.animateColors);
        
        this.updateBurstParticles();
        this.updateSpheres();
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        
        this.rafId = requestAnimationFrame(() => this.animate());
    }

    cleanup() {
        this.isRunning = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.resizeTimeout) cancelAnimationFrame(this.resizeTimeout);
        if (this.gl && this.program) this.gl.deleteProgram(this.program);
    }
}

const animation = new ShaderAnimation();
window.addEventListener('unload', () => animation.cleanup());

window.addEventListener('load', () => {
    document.fonts.ready.then(() => {
        const tl = gsap.timeline();
        const animation = new ShaderAnimation();
        
        tl.set(['.title-tandy', '.title-linx'], { 
            opacity: 0
        })
        .set('.title-linx', {
            visibility: 'visible'
        })
        .set('.title-tandy', { 
            x: window.innerWidth < 768 ? 0 : '1.5em',
            y: '-0.2em'
        })
        .to('.title-tandy', {
            opacity: 1,
            duration: 0.8,
            x: 0,
            ease: "power2.out",
            clearProps: "x",
            onComplete: () => animation.startTransition()
        })
    });
}); 