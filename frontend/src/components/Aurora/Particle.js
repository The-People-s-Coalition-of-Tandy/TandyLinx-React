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
        
        const initialDelay = 1.5;
        this.startTime = index * 0.01 + options.startTimeOffset + initialDelay;
        
        this.active = false;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.sizeMultiplier = this.isMobile ? options.sizeMultiplier * 0.67 : options.sizeMultiplier;
        this.minSize = options.minSize;
        this.isGlowing = options.isGlowing;
        this.speedMultiplier = this.isMobile ? options.speedMultiplier * 1.2 : options.speedMultiplier;
        this.isFirstLoad = this.isGlowing;

        this.reset();
    }

    reset() {
        const sizeMultiplier = this.isGlowing ? this.sizeMultiplier * 0.4 : this.sizeMultiplier;
        const minSize = this.isGlowing ? this.minSize * 0.5 : this.minSize;
        
        this.size = Math.random() * sizeMultiplier + minSize;
        this.speed = (this.size / 100) * this.speedMultiplier * (this.isGlowing ? 1.5 : 1);
        
        if (this.isGlowing && this.isFirstLoad) {
            this.x = -this.size;
            const oneThirdHeight = window.innerHeight / 3;
            this.y = oneThirdHeight + Math.random() * oneThirdHeight;
            this.horizontalVelocity = this.isMobile ? (3 + Math.random() * 1) : (5 + Math.random() * 2);
            this.horizontalDrag = this.isMobile ? 0.99 : 0.995;
            this.verticalDrift = (Math.random() - 0.5) * (this.isMobile ? 0.5 : 0.8);
            this.verticalOscillation = {
                amplitude: Math.random() * 0.5 + 0.3,
                frequency: Math.random() * 0.02 + 0.01,
                offset: Math.random() * Math.PI * 2
            };
        } else {
            this.y = -this.size;
            this.x = Math.random() * window.innerWidth;
        }
        
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

        const depthFactor = 1 - (this.z / 1000);
        
        if (this.isGlowing && this.isFirstLoad) {
            if (this.horizontalVelocity > 0.01) {
                this.x += this.horizontalVelocity;
                this.horizontalVelocity *= this.horizontalDrag;
                
                const verticalOsc = Math.sin(time * this.verticalOscillation.frequency + this.verticalOscillation.offset) 
                    * this.verticalOscillation.amplitude;
                
                const velocityFactor = this.horizontalVelocity / 5;
                this.y += (this.verticalDrift + verticalOsc) * velocityFactor;
                
                this.y += this.speed * (1 - velocityFactor);
            } else {
                this.y += this.speed;
                this.x += Math.sin(time + this.z * 0.001) * (0.5 * depthFactor);
            }
        } else {
            this.y += this.speed;
            this.x += Math.sin(time + this.z * 0.001) * (this.isGlowing ? 0.5 : 0.3) * depthFactor;
        }

        if (this.y > window.innerHeight + this.size || 
            (this.isFirstLoad && this.isGlowing && this.x > window.innerWidth + this.size)) {
            if (this.isGlowing) {
                this.isFirstLoad = false;
            }
            this.reset();
            this.startTime = time - 0.1;
        }
    }
} 