import { useEffect, useRef } from 'react';
import { Particle } from './Particle';
import { vertexShaderSource, fragmentShaderSource } from './shaders';

export const Aurora = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        class ShaderAnimation {
            constructor(canvasElement) {
                this.canvas = canvasElement;
                this.gl = this.canvas.getContext('webgl');
                if (!this.gl) {
                    console.error('WebGL not supported');
                    return;
                }

                this.initState();
                this.initParticles();
                this.initShaders();
                this.initBuffers();
                this.setupEventListeners();
                
                this.resize();
                this.animate();
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

                this.glowingSpheres = Array(15).fill(0).map((_, i) => new Particle(i, {
                    startTimeOffset: 2,
                    sizeMultiplier: 80,
                    minSize: 8,
                    isGlowing: true,
                    speedMultiplier: 1.2
                }));

                this.sphereData = new Float32Array(15 * 4);
                this.glowingSphereData = new Float32Array(15 * 4);
            }

            setupEventListeners() {
                let resizeTimeout;
                window.addEventListener('resize', () => {
                    if (resizeTimeout) {
                        clearTimeout(resizeTimeout);
                    }
                    
                    resizeTimeout = setTimeout(() => {
                        this.width = window.innerWidth;
                        this.height = window.innerHeight;
                        this.resize();
                    }, 100);
                    
                    if (!this.isRunning) {
                        this.isRunning = true;
                        this.animate();
                    }
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
                    vertexShaderSource
                );
                const fragmentShader = this.createShader(
                    this.gl.FRAGMENT_SHADER,
                    fragmentShaderSource
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

                this.gl.uniform4fv(this.uSpheres, this.sphereData);
                this.gl.uniform4fv(this.uGlowingSpheres, this.glowingSphereData);
            }

            animate() {
                if (!this.isRunning) return;
                
                this.time += 0.003;
                this.gl.uniform1f(this.uTime, this.time);
                this.gl.uniform1i(this.colorToggleLocation, this.animateColors);
                
                this.updateSpheres();
                this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
                
                this.rafId = requestAnimationFrame(() => this.animate());
            }

            cleanup() {
                this.isRunning = false;
                if (this.rafId) cancelAnimationFrame(this.rafId);
                if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
                if (this.gl && this.program) this.gl.deleteProgram(this.program);
            }
        }
        if (canvasRef.current) {
            animationRef.current = new ShaderAnimation(canvasRef.current);
        }

        return () => {
            if (animationRef.current) {
                animationRef.current.cleanup();
            }
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            id="glCanvas" 
            className="aurora"
            style={{
                display: 'block',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: -1,
                backgroundColor: '#000000'
            }}
        />
    );
};