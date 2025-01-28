export class Particle {
    constructor(index, config = {}) {
        const defaults = {
            startTimeOffset: 0,
            sizeMultiplier: 150,
            minSize: 15,
            isGlowing: false,
            speedMultiplier: .8
        };
        
        const options = { ...defaults, ...config };
        
        this.startTime = index * 0.1 + options.startTimeOffset;
        this.active = false;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.sizeMultiplier = this.isMobile ? options.sizeMultiplier * 0.67 : options.sizeMultiplier;
        this.minSize = options.minSize;
        this.isGlowing = options.isGlowing;
        this.speedMultiplier = this.isMobile ? options.speedMultiplier * 1.5 : options.speedMultiplier;

        this.reset();
    }

    // ... Rest of the Particle class from main.js ...
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



        if (this.y > window.innerHeight + this.size) {
            this.reset();
            this.startTime = time - 0.1;
        }
    }
} 