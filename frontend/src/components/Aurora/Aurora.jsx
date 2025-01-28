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
                this.gl = this.canvas.getContext('webgl2');
                if (!this.gl) {
                    console.error('WebGL 2 not supported, falling back to WebGL 1');
                    this.gl = this.canvas.getContext('webgl');
                    if (!this.gl) {
                        console.error('WebGL not supported');
                        return;
                    }
                }
                this.easing = {
                    // Linear
                    linear: t => t,
                    
                    // Smooth step
                    smoothStep: t => t * t * (3 - 2 * t),
                    
                    // Ease out cubic
                    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
                    
                    // Ease in out quad
                    easeInOutQuad: t => 
                        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,

                    cubicBezier: (t, x1, y1, x2, y2, start = 0, end = 1) => {
                        const u = 1 - t;
                        const tt = t * t;
                        const uu = u * u;
                        const uuu = uu * u;
                        const ttt = tt * t;
                        
                        // Calculate curve with control points
                        const y = 3 * uu * t * y1 + 3 * u * tt * y2 + ttt;
                        
                        // Remap the 0-1 range to start-end range
                        return start + (end - start) * y;
                    }
                };

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
                this.animateColors = false;
                this.width = window.innerWidth;
                this.height = window.innerHeight;
                this.transitionTimeline = 0.0;
                this.animating = false;
                this.transitionDuration = 4000;
                this.currentUniforms = {
                    skyTop: [0.4, 0.6, 1.0],
                    skyBottom: [0.8, 0.9, 1.0],
                    brightColor: [1.0, 0.4, 0.8, 1.0],
                    darkColor: [0.15, 0.0, 0.1, 1.0],
                    bgGradientLight: [1.0, 0.4, 0.8, 1.0],
                    bgGradientDark: [0.15, 0.0, 0.1, 1.0],
                    cloudFrequency: [1.0, 1.0],
                    waveColor: [1.0, 0.6, 0.9],
                    audioWaveColor: [0.9, 0.5, 0.7, 0.9],
                    cloudAlpha: 1.0,
                    bgMix: 0.5
                };

                // Add color themes
                this.colorThemes = {
                    initial: {
                        skyTop: [1.0, 1.0, 1.0],
                        skyBottom: [1.0, 1.0, 1.0],
                        brightColor: [1.0, 1.0, 1.0, 1.0],
                        bgGradientLight: [1.0, 1.0, 1.0, 1.0],
                        bgGradientDark: [1.0, 1.0, 1.0, 1.0],
                        waveColor: [0.9, 0.0, 0.9],
                        audioWaveColor: [0.9, 0.9, 0.9, 0.9],
                        cloudAlpha: 1.0,
                        bgMix: 0.0,
                        rainbowTransition: 0.0
                    },
                    pink: {
                        skyTop: [0.4, 0.6, 1.0],
                        skyBottom: [0.8, 0.9, 1.0],
                        brightColor: [1.0, 0.4, 0.8, 1.0],
                        bgGradientLight: [1.0, 0.4, 0.8, 1.0],
                        bgGradientDark: [0.15, 0.0, 0.1, 1.0],
                        waveColor: [1.0, 0.6, 0.9],
                        audioWaveColor: [0.9, 0.5, 0.7, 0.9],
                        cloudAlpha: 1.0,
                        bgMix: 0.5,
                        rainbowTransition: 0.0
                    },
                    sunset: {
                        skyTop: [0.8, 0.3, 0.1],      // Orange-red
                        skyBottom: [0.95, 0.6, 0.4],   // Soft peach
                        brightColor: [1.0, 0.4, 0.2, 1.0],
                        bgGradientLight: [1.0, 0.5, 0.2, 1.0],
                        bgGradientDark: [0.2, 0.05, 0.0, 1.0],
                        waveColor: [1.0, 0.7, 0.4],
                        audioWaveColor: [1.0, 0.6, 0.3, 0.9],
                        cloudAlpha: 0.0,
                        bgMix: 0.5,
                        rainbowTransition: 0.0
                    },
                    midnight: {
                        skyTop: [0.05, 0.05, 0.2],    // Deep blue
                        skyBottom: [0.15, 0.15, 0.3],  // Navy
                        brightColor: [0.3, 0.4, 1.0, 1.0],
                        bgGradientLight: [0.3, 0.4, 0.9, 1.0],
                        bgGradientDark: [0.02, 0.02, 0.1, 1.0],
                        waveColor: [0.4, 0.5, 1.0],
                        audioWaveColor: [0.5, 0.6, 1.0, 0.9],
                        cloudAlpha: 1.0,
                        bgMix: 0.5,
                        rainbowTransition: 0.0
                    },
                    forest: {
                        skyTop: [0.2, 0.4, 0.2],      // Forest green
                        skyBottom: [0.4, 0.6, 0.4],    // Sage
                        brightColor: [0.3, 0.8, 0.4, 1.0],
                        bgGradientLight: [0.4, 0.8, 0.5, 1.0],
                        bgGradientDark: [0.05, 0.15, 0.05, 1.0],
                        waveColor: [0.5, 0.9, 0.6],
                        audioWaveColor: [1.0, 0.9, 0.0, 0.9],
                        cloudAlpha: 0.0,
                        bgMix: 0.5,
                        rainbowTransition: 0.0
                    },
                    cyberpunk: {
                        skyTop: [0.2, 0.0, 0.4],      // Deep purple
                        skyBottom: [0.4, 0.0, 0.6],    // Bright purple
                        brightColor: [1.0, 0.2, 1.0, 1.0],
                        bgGradientLight: [0.9, 0.2, 0.9, 1.0],
                        bgGradientDark: [0.2, 0.0, 0.2, 1.0],
                        waveColor: [0.0, 1.0, 1.0],
                        audioWaveColor: [1.0, 0.2, 1.0, 0.9],
                        cloudAlpha: 0.0,
                        bgMix: 0.5,
                        rainbowTransition: 0.0
                    },
                    plain: {
                        skyTop: [0.4, 0.6, 1.0],      // Light blue
                        skyBottom: [0.8, 0.9, 1.0],  // Very light blue
                        brightColor: [1.0, 1.0, 1.0, 1.0],
                        bgGradientLight: [1.0, 1.0, 1.0, 0.0],
                        bgGradientDark: [0.8, 0.8, 0.8, 0.0],
                        waveColor: [1.0, 1.0, 1.0],
                        audioWaveColor: [1.0, 1.0, 1.0, 0.7],
                        cloudAlpha: 1.0,
                        bgMix: 0.0,
                        rainbowTransition: 0.0
                    },
                    rainbowSky: {
                        skyTop: [0.4, 0.6, 1.0],      // Light blue
                        skyBottom: [0.8, 0.9, 1.0],  // Very light blue
                        brightColor: [1.0, 1.0, 1.0, 1.0],
                        bgGradientLight: [1.0, 1.0, 1.0, 0.0],
                        bgGradientDark: [0.8, 0.8, 0.8, 0.0],
                        waveColor: [1.0, 1.0, 1.0],
                        audioWaveColor: [1.0, 1.0, 1.0, 0.7],
                        cloudAlpha: 1.0,
                        bgMix: 0.0,
                        rainbowTransition: 1.0
                    },
                    rainbowWave: {
                        skyTop: [1.0, 1.0, 1.0],      // Light blue
                        skyBottom: [1.0, 1.0, 1.0],  // Very light blue
                        brightColor: [1.0, 1.0, 1.0, 1.0],
                        bgGradientLight: [1.0, 1.0, 1.0, 0.0],
                        bgGradientDark: [0.8, 0.8, 0.8, 0.0],
                        waveColor: [1.0, 1.0, 1.0],
                        audioWaveColor: [1.0, 1.0, 1.0, 0.7],
                        cloudAlpha: 1.0,
                        bgMix: 0.0,
                        rainbowTransition: 1.0
                    },
                    fullWhite: {
                        skyTop: [1.0, 1.0, 1.0],      // Light blue
                        skyBottom: [1.0, 1.0, 1.0],  // Very light blue
                        brightColor: [1.0, 1.0, 1.0, 1.0],
                        bgGradientLight: [1.0, 1.0, 1.0, 0.0],
                        bgGradientDark: [1.0, 1.0, 1.0, 0.0],
                        waveColor: [1.0, 1.0, 1.0],
                        audioWaveColor: [1.0, 1.0, 1.0, 1.0],
                        cloudAlpha: 1.0,
                        bgMix: 0.0,
                        rainbowTransition: 0.0
                    },
                    rainbowOnly: {
                        skyTop: [1.0, 1.0, 1.0],      // Light blue
                        skyBottom: [1.0, 1.0, 1.0],  // Very light blue
                        brightColor: [1.0, 1.0, 1.0, 1.0],
                        bgGradientLight: [1.0, 1.0, 1.0, 0.0],
                        bgGradientDark: [1.0, 1.0, 1.0, 0.0],
                        waveColor: [1.0, 1.0, 1.0],
                        audioWaveColor: [1.0, 1.0, 1.0, 1.0],
                        cloudAlpha: 1.0,
                        bgMix: 0.0,
                        rainbowTransition: 1.0
                    }
                };
            }

            initParticles() {
                this.spheres = Array(15).fill(0).map((_, i) => new Particle(i, {
                    startTimeOffset: i * 0.2,  // Add staggered start times
                    sizeMultiplier: 150,
                    minSize: 15,
                    isGlowing: false,
                    speedMultiplier: 0.8  // Ensure consistent speed
                }));

                this.glowingSpheres = Array(45).fill(0).map((_, i) => new Particle(i, {
                    startTimeOffset: 0.5,
                    sizeMultiplier: 80,
                    minSize: 8,
                    isGlowing: true,
                    speedMultiplier: 1.2
                }));

                this.sphereData = new Float32Array(15 * 4);
                this.glowingSphereData = new Float32Array(45 * 4);
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
                    console.log(e.duration);
                    const themeTransitionDuration = e.duration || 2000; // 2 seconds

                    switch(e.key.toLowerCase()) {
                        // case '1':
                        //     this.startUniformAnimation(this.colorThemes.pink, themeTransitionDuration);
                        //     break;
                        // case '2':
                        //     this.startUniformAnimation(this.colorThemes.sunset, themeTransitionDuration);
                        //     break;
                        // case '3':
                        //     this.startUniformAnimation(this.colorThemes.midnight, themeTransitionDuration);
                        //     break;
                        // case '4':
                        //     this.startUniformAnimation(this.colorThemes.forest, themeTransitionDuration);
                        //     break;
                        // case '5':
                        //     this.startUniformAnimation(this.colorThemes.cyberpunk, themeTransitionDuration);
                        //     break;
                        // case '6':
                        //     this.startUniformAnimation(this.colorThemes.plain, themeTransitionDuration);
                        //     break;
                        // case '7':
                        //     this.startUniformAnimation(this.colorThemes.rainbowSky, themeTransitionDuration);
                        //     break;
                        // case '8':
                        //     this.startUniformAnimation(this.colorThemes.rainbowWhite, themeTransitionDuration);
                        //     break;
                        // case 'c':
                        //     this.animateColors = !this.animateColors;
                        //     break;
                        // case 'd':
                        //     this.ditherEnabled = !this.ditherEnabled;
                        //     this.gl.uniform1i(this.uEnableDither, this.ditherEnabled);
                        //     break;
                    }
                });

                window.addEventListener('mousemove', (e) => {
                    this.gl.uniform2f(this.uMouse, e.clientX, e.clientY);
                });
            }

            createShader(type, source) {
                const shader = this.gl.createShader(type);
                if (!shader) {
                    console.error('Failed to create shader');
                    return null;
                }
                
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

                if (!vertexShader || !fragmentShader) {
                    console.error('Failed to create shaders');
                    return;
                }

                this.program = this.gl.createProgram();
                if (!this.program) {
                    console.error('Failed to create shader program');
                    return;
                }

                this.gl.attachShader(this.program, vertexShader);
                this.gl.attachShader(this.program, fragmentShader);
                this.gl.linkProgram(this.program);

                if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
                    console.error('Shader program failed to link:', this.gl.getProgramInfoLog(this.program));
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
                this.uMouse = this.gl.getUniformLocation(this.program, 'uMouse');
                this.uEnableDither = this.gl.getUniformLocation(this.program, 'uEnableDither');

                this.animatedUniforms = {
                    skyTop: {
                        A: this.gl.getUniformLocation(this.program, 'uSkyTop.A'),
                        B: this.gl.getUniformLocation(this.program, 'uSkyTop.B'),
                        type: 'vec3'
                    },
                    skyBottom: {
                        A: this.gl.getUniformLocation(this.program, 'uSkyBottom.A'),
                        B: this.gl.getUniformLocation(this.program, 'uSkyBottom.B'),
                        type: 'vec3'
                    },
                    cloudFrequency: {
                        A: this.gl.getUniformLocation(this.program, 'uCloudFrequency.A'),
                        B: this.gl.getUniformLocation(this.program, 'uCloudFrequency.B'),
                        type: 'float'
                    },
                    bgGradientLight: {
                        A: this.gl.getUniformLocation(this.program, 'uBgGradientLight.A'),
                        B: this.gl.getUniformLocation(this.program, 'uBgGradientLight.B'),
                        type: 'vec4'
                    },
                    bgGradientDark: {
                        A: this.gl.getUniformLocation(this.program, 'uBgGradientDark.A'),
                        B: this.gl.getUniformLocation(this.program, 'uBgGradientDark.B'),
                        type: 'vec4'
                    },
                    brightColor: {
                        A: this.gl.getUniformLocation(this.program, 'uBrightColor.A'),
                        B: this.gl.getUniformLocation(this.program, 'uBrightColor.B'),
                        type: 'vec4'
                    },
                    waveColor: {
                        A: this.gl.getUniformLocation(this.program, 'uWaveColor.A'),
                        B: this.gl.getUniformLocation(this.program, 'uWaveColor.B'),
                        type: 'vec3'
                    },
                    audioWaveColor: {
                        A: this.gl.getUniformLocation(this.program, 'uAudioWaveColor.A'),
                        B: this.gl.getUniformLocation(this.program, 'uAudioWaveColor.B'),
                        type: 'vec4'
                    },
                    cloudAlpha: {
                        A: this.gl.getUniformLocation(this.program, 'uCloudAlpha.A'),
                        B: this.gl.getUniformLocation(this.program, 'uCloudAlpha.B'),
                        type: 'float'
                    },
                    bgMix: {
                        A: this.gl.getUniformLocation(this.program, 'uBgMix.A'),
                        B: this.gl.getUniformLocation(this.program, 'uBgMix.B'),
                        type: 'float'
                    },
                    rainbowTransition: {
                        A: this.gl.getUniformLocation(this.program, 'uRainbowTransition.A'),
                        B: this.gl.getUniformLocation(this.program, 'uRainbowTransition.B'),
                        type: 'float'
                    }
                };

                this.transitionTimelineLocation = this.gl.getUniformLocation(this.program, 'uTransitionTimeline');

                this.gl.uniform3f(this.animatedUniforms.skyTop.A, 1.0, 1.0, 1.0);     // Light blue
                this.gl.uniform3f(this.animatedUniforms.skyTop.B, 1.0, 1.0, 1.0);     // Light blue
                this.gl.uniform3f(this.animatedUniforms.skyBottom.A, 1.0, 1.0, 1.0);  // Very light blue
                this.gl.uniform3f(this.animatedUniforms.skyBottom.B, 1.0, 1.0, 1.0);  // Very light blue
                this.gl.uniform1f(this.animatedUniforms.cloudFrequency.A, 1.0);
                this.gl.uniform1f(this.animatedUniforms.cloudFrequency.B, 1.0);
                this.gl.uniform4f(this.animatedUniforms.bgGradientLight.A, 1.0, 1.0, 1.0, 1.0);
                this.gl.uniform4f(this.animatedUniforms.bgGradientLight.B, 1.0, 1.0, 1.0, 1.0);
                this.gl.uniform4f(this.animatedUniforms.bgGradientDark.A, 1.0, 1.0, 1.0, 1.0);
                this.gl.uniform4f(this.animatedUniforms.bgGradientDark.B, 1.0, 1.0, 1.0, 1.0);
                this.gl.uniform4f(this.animatedUniforms.brightColor.A, 1.0, 1.0, 1.0, 1.0);
                this.gl.uniform4f(this.animatedUniforms.brightColor.B, 1.0, 1.0, 1.0, 1.0);
                this.gl.uniform3f(this.animatedUniforms.waveColor.A, 1.0, 1.0, 1.0);
                this.gl.uniform3f(this.animatedUniforms.waveColor.B, 1.0, 1.0, 1.0);
                this.gl.uniform4f(this.animatedUniforms.audioWaveColor.A, 1.0, 1.0, 1.0, 1.0);
                this.gl.uniform4f(this.animatedUniforms.audioWaveColor.B, 1.0, 1.0, 1.0, 1.0);
                this.gl.uniform1f(this.animatedUniforms.cloudAlpha.A, 1.0);
                this.gl.uniform1f(this.animatedUniforms.cloudAlpha.B, 1.0);
                this.gl.uniform1f(this.animatedUniforms.bgMix.A, 0.0);
                this.gl.uniform1f(this.animatedUniforms.bgMix.B, 0.0);
                this.gl.uniform1f(this.animatedUniforms.rainbowTransition.A, 0.0);
                this.gl.uniform1f(this.animatedUniforms.rainbowTransition.B, 0.0);
                
                this.gl.uniform1f(this.transitionTimelineLocation, 0.0);

                // Initialize dither as disabled
                this.gl.uniform1i(this.uEnableDither, false);
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

            startUniformAnimation(newValues, duration, easingFunction="easeInOutQuad") {
                // Get current interpolated values based on timeline
                const easingFn = this.easing[easingFunction];
                const currentProgress = easingFn(this.transitionTimeline);
                
                Object.entries(newValues).forEach(([key, value]) => {
                    if (this.animatedUniforms[key]) {
                        // Get current A and B values
                        const currentA = this.gl.getUniform(this.program, this.animatedUniforms[key].A);
                        const currentB = this.gl.getUniform(this.program, this.animatedUniforms[key].B);
                        const type = this.animatedUniforms[key].type;
                        
                        const isArray = type === 'float' ? false : true;

                        // Calculate current interpolated value
                        const interpolatedValue = isArray ? currentA.map((a, i) => 
                            a + (currentB[i] - a) * currentProgress
                        ) : currentA + (currentB - currentA) * currentProgress;
                        
                        switch (type) {
                            case 'vec3':
                                this.gl.uniform3f(this.animatedUniforms[key].A, ...interpolatedValue);
                                this.gl.uniform3f(this.animatedUniforms[key].B, ...value);
                                break;
                            case 'vec4':
                                this.gl.uniform4f(this.animatedUniforms[key].A, ...interpolatedValue);
                                this.gl.uniform4f(this.animatedUniforms[key].B, ...value);
                                break;
                            case 'float':
                                this.gl.uniform1f(this.animatedUniforms[key].A, interpolatedValue);
                                this.gl.uniform1f(this.animatedUniforms[key].B, value);
                                break;
                        }
                        
                        // Update current uniforms
                        this.currentUniforms[key] = value;
                    }
                });

                // Reset animation state
                this.transitionStartTime = null;
                this.transitionTimeline = 0;
                this.gl.uniform1f(this.transitionTimelineLocation, 0);
                
                this.transitionDuration = duration;
                this.animating = true;
            }

            animateUniforms() {
                if (!this.animating) return;
                
                if (!this.transitionStartTime) {
                    this.transitionStartTime = performance.now();
                }
                
                const currentTime = performance.now();
                const elapsedTime = currentTime - this.transitionStartTime;
                const progress = Math.min(elapsedTime / this.transitionDuration, 1.0);
                
                this.transitionTimeline = progress;
                this.gl.uniform1f(this.transitionTimelineLocation, this.easing.easeInOutQuad(this.transitionTimeline));

                if (progress >= 1.0) {
                    Object.keys(this.animatedUniforms).forEach(key => {
                        const uniform = this.animatedUniforms[key];
                        const value = this.gl.getUniform(this.program, uniform.B);
                        
                        // Handle different uniform types
                        if (uniform.type === 'float') {
                            this.gl.uniform1f(uniform.A, value);
                            this.currentUniforms[key] = value;
                        } else {
                            const type = this.animatedUniforms[key].type;
                            switch (type) {
                                case 'vec2':
                                    this.gl.uniform2f(uniform.A, ...value);
                                    break;
                                case 'vec3':
                                    this.gl.uniform3f(uniform.A, ...value);
                                    break;
                                case 'vec4':
                                    this.gl.uniform4f(uniform.A, ...value);
                                    break;
                            }
                            this.currentUniforms[key] = [...value];
                        }
                    });
                    
                    this.animating = false;
                    this.transitionStartTime = null;
                }
            }

            animate() {
                if (!this.isRunning) return;
                
                this.time += 0.003;
                this.gl.uniform1f(this.uTime, this.time);
                this.gl.uniform1i(this.colorToggleLocation, this.animateColors);
                
                this.updateSpheres();
                this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

                this.animateUniforms();
                
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
            console.log('Setting up Aurora and event listeners');
            animationRef.current = new ShaderAnimation(canvasRef.current);
            
            const handleThemeChange = (event) => {
                console.log('Theme change event received:', event.detail);
                if (animationRef.current) {
                    console.log('Starting uniform animation');
                    animationRef.current.startUniformAnimation(
                        animationRef.current.colorThemes[event.detail.theme], 
                        event.detail.duration || 2000,
                        event.detail.easingFunction || "smoothStep"
                    );
                }
            };

            window.addEventListener('themeChange', handleThemeChange);
            console.log('Theme change event listener added');

            return () => {
                console.log('Cleaning up Aurora event listeners');
                window.removeEventListener('themeChange', handleThemeChange);
                if (animationRef.current) {
                    animationRef.current.cleanup();
                }
            };
        }
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