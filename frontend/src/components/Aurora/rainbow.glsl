 precision mediump float;
        
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec4 uSpheres[15];
        uniform vec4 uGlowingSpheres[45];
        uniform bool uAnimateColors;  // New uniform for toggle
        uniform float uWaves[48];  // 8 waves * 6 components each
        uniform float uTransition;  // Controls the transition state (0 to 1)

        float getWaveLine(vec2 pixel, float z, float thickness, float noiseScale) {
            vec2 center = uResolution.xy * 0.5;
            float angle = -0.2; // Slight upward angle for all lines
            
            // Rotate pixel around center
            vec2 rotated = pixel - center;
            rotated = vec2(
                rotated.x * cos(angle) - rotated.y * sin(angle),
                rotated.x * sin(angle) + rotated.y * cos(angle)
            );
            rotated += center;
            
            // More noise for thinner lines
            float noiseAmount = mix(0.5, 2.0, 1.0 - thickness / 50.0);
            
            // Base wave with varying noise based on thickness
            float y = center.y + 
                sin(rotated.x * 0.003 + uTime * 0.2) * thickness * 3.0 +
                sin(rotated.x * 0.007 + uTime * 0.1) * thickness * noiseAmount * noiseScale;
            
            float dist = abs(rotated.y - y);
            
            // Create blur based on z-depth
            float blurAmount = mix(2.0, 20.0, z / 1000.0);
            return smoothstep(thickness + blurAmount, thickness - blurAmount, dist);
        }

        // Audio-inspired wave function
        float getAudioWave(vec2 pixel, float z, float freq, float amp) {
            vec2 center = uResolution.xy * 0.8;
            float angle = 1.2;
            
            vec2 rotated = pixel - center;
            rotated = vec2(
                rotated.x * cos(angle) - rotated.y * sin(angle),
                rotated.x * sin(angle) + rotated.y * cos(angle)
            );
            rotated += center;
            
            float wave = sin(rotated.x * freq + uTime) * amp +
                        sin(rotated.x * freq * 0.5 + uTime * 1.5) * amp * 0.5;
            
            float y = center.y + wave;
            float dist = abs(rotated.y - y);
            float thickness = mix(2.0, 8.0, z / 1000.0);
            
            return smoothstep(thickness + 1.0, thickness - 1.0, dist);
        }

        float getSphere(vec2 pixel, vec4 sphere) {
            float dist = length(pixel - sphere.xy);
            
            // Create a more intense blur based on z-depth
            float blurAmount = mix(5.0, 50.0, sphere.z / 1000.0);
            float size = sphere.w;
            
            // Approximate Gaussian blur with multiple smoothsteps
            float blur1 = smoothstep(size + blurAmount, size - blurAmount, dist);
            float blur2 = smoothstep(size + blurAmount * 0.7, size - blurAmount * 0.7, dist);
            float blur3 = smoothstep(size + blurAmount * 0.4, size - blurAmount * 0.4, dist);
            
            // Combine the blurs with different weights
            return (blur1 * 0.4 + blur2 * 0.35 + blur3 * 0.25);
        }
        float getSphereGlow(vec2 pixel, vec4 sphere) {
            vec2 pos = vec2(sphere.x, sphere.y);
            float size = sphere.w * 0.05;  // Reduced size multiplier for tighter glow
            float z = sphere.z;
            
            float dist = length(pixel - pos);
            float glow = pow(size / dist, 1.5);  // Adjusted power for smoother falloff
            float depthFactor = 1.0 - (z / 1000.0);
            
            return glow * depthFactor * 0.3;  // Reduced intensity multiplier
        }

        vec3 getVibrantColor(float index) {
            // Create 6 different vibrant colors
            float normalizedIndex = mod(index, 6.0);
            
            if (normalizedIndex < 1.0) return vec3(1.0, 0.0, 1.0); // Magenta
            if (normalizedIndex < 2.0) return vec3(0.0, 1.0, 1.0); // Cyan
            if (normalizedIndex < 3.0) return vec3(1.0, 0.0, 0.0); // Red
            if (normalizedIndex < 4.0) return vec3(0.0, 1.0, 0.0); // Green
            if (normalizedIndex < 5.0) return vec3(0.0, 0.0, 1.0); // Blue
            return vec3(1.0, 0.5, 0.0); // Orange
        }

        // Add these new functions at the top of the shader
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        vec2 hash(vec2 p) {
            p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
            return -1.0 + 2.0*fract(sin(p)*43758.5453123);
        }

        float noise(vec2 p) {
            const float K1 = 0.366025404;
            const float K2 = 0.211324865;
            
            vec2 i = floor(p + (p.x+p.y)*K1);
            vec2 a = p - i + (i.x+i.y)*K2;
            vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
            vec2 b = a - o + K2;
            vec2 c = a - 1.0 + 2.0*K2;
            
            vec3 h = max(0.5-vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);
            vec3 n = h*h*h*h*vec3(dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
            
            return dot(n, vec3(70.0));
        }

        float fbm(vec2 p) {
            float f = 0.0;
            float w = 0.5;
            float freq = 1.0;
            for (int i = 0; i < 5; i++) {
                f += w * noise(p * freq);
                freq *= 2.0;
                w *= 0.5;
            }
            return f;
        }

        vec4 getSkyAndClouds(vec2 pixel) {
            vec2 uv = pixel.xy / uResolution.xy;
            
            // Sky gradient with transition
            vec3 skyTop = vec3(0.4, 0.6, 1.0) * uTransition;  // Blue
            vec3 skyBottom = vec3(0.8, 0.9, 1.0) * uTransition;  // Light blue
            vec3 skyColor = mix(skyBottom, skyTop, uv.y);
            
            // Cloud layer with transition opacity
            float time = uTime * 0.1;
            vec2 cloudUV = uv * vec2(1.0, 2.0) + vec2(time * 0.1, 0.0);
            float cloud = fbm(cloudUV * 3.0);
            cloud = smoothstep(0.0, 0.8, cloud) * uTransition;  // Apply transition to clouds
            
            // Add some variation to cloud color
            vec3 cloudColor = vec3(1.0);
            vec3 finalColor = mix(skyColor, cloudColor, cloud * 0.7);
            
            return vec4(finalColor, 1.0);
        }

        vec3 getRainbowColor(float t) {
            t = fract(t * 4.0);
            if (t < 0.166) return mix(vec3(1.0, 0.0, 0.2), vec3(1.0, 0.5, 0.0), t * 6.0);  // Brighter red to orange
            if (t < 0.333) return mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.166) * 6.0);  // Orange to yellow
            if (t < 0.5) return mix(vec3(1.0, 1.0, 0.0), vec3(0.0, 1.0, 0.2), (t - 0.333) * 6.0);    // Yellow to green
            if (t < 0.666) return mix(vec3(0.0, 1.0, 0.2), vec3(0.0, 0.5, 1.0), (t - 0.5) * 6.0);    // Green to blue
            if (t < 0.833) return mix(vec3(0.0, 0.5, 1.0), vec3(0.7, 0.0, 1.0), (t - 0.666) * 6.0);  // Blue to purple
            return mix(vec3(0.7, 0.0, 1.0), vec3(1.0, 0.0, 0.2), (t - 0.833) * 6.0);                 // Purple to red
        }

        void main() {
            vec2 pixel = gl_FragCoord.xy;
            
            // Get sky and clouds background
            vec4 backgroundColor = getSkyAndClouds(pixel);
            
            // Create radial gradient from center
            vec2 normalizedPos = pixel / uResolution;
            vec2 center = vec2(0.5, 0.5);
            float radialGradient = distance(normalizedPos, center) * 2.0;
            
            float diagonal = abs((normalizedPos.x - normalizedPos.y));
            float cornerDarkness = smoothstep(0.0, 1.0, diagonal);
            
            float gradientValue = mix(radialGradient, cornerDarkness, 0.7);
            gradientValue = smoothstep(0.0, 1.2, gradientValue);
            
            // Create monochromatic color palette
            vec4 brightColor = vec4(1.0, 1.0, 1.0, 1.0);     // Pure white
            vec4 darkColor = vec4(0.8, 0.8, 0.8, 1.0);    // Very light gray
            
            // Background color
            vec4 bgColor = mix(darkColor, brightColor, gradientValue);
            
            // Process regular spheres
            float sphereIntensity = 0.0;
            for(int i = 0; i < 15; i++) {
                sphereIntensity += getSphere(pixel, uSpheres[i]);
            }

            
            // Process waves with white colors
            vec4 waveColor = vec4(1.0, 1.0, 1.0, 0.0);
            // rainbow color based on position
            vec3 rainbow = getRainbowColor(pixel.y / uResolution.y);
            waveColor.rgb = mix(waveColor.rgb, rainbow, 1.- pixel.x/uResolution.x );
            
            // Larger waves in back
            float wave = getWaveLine(pixel, 900.0, 45.0, 1.0);
            waveColor.a += wave * 0.1;
            
            wave = getWaveLine(pixel, 800.0, 40.0, 1.2);
            waveColor.a += wave * 0.15;
            
            wave = getWaveLine(pixel, 700.0, 35.0, 1.4);
            waveColor.a += wave * 0.2;
            
            // Medium waves in middle
            wave = getWaveLine(pixel, 500.0, 30.0, 1.6);
            waveColor.a += wave * 0.25;
            
            wave = getWaveLine(pixel, 400.0, 25.0, 1.8);
            waveColor.a += wave * 0.3;
            
            // Smaller waves in front
            wave = getWaveLine(pixel, 300.0, 20.0, 2.0);
            waveColor.a += wave * 0.35;
            
            wave = getWaveLine(pixel, 200.0, 15.0, 2.2);
            waveColor.a += wave * 0.4;
            
            wave = getWaveLine(pixel, 100.0, 10.0, 2.4);
            waveColor.a += wave * 0.45;

            // Add audio waves
            float waveIntensity = 0.0;
            vec3 audioWaveColor = vec3(0.0);
            for(float i = 0.0; i < 20.0; i++) {
                float z = 200.0 + i * 10.0;
                float freq = 0.003 - (i * 0.00005);
                float amp = 80.0 - (i * 5.0);
                float wave = getAudioWave(pixel, z, freq, amp) * 0.15;
                
                // Get rainbow color based on index
                vec3 waveColor = getRainbowColor(i / 20.0);
                
                waveIntensity += wave;
                audioWaveColor += wave * waveColor;
            }
            
            // Modify the final color blending to include transition
            vec4 finalColor = backgroundColor;
            
            // Add spheres with increased contrast and transition
            finalColor = mix(finalColor, brightColor, sphereIntensity * 0.7 * uTransition);
            
            // Add waves with slightly increased opacity and transition
            finalColor = mix(finalColor, waveColor, waveColor.a * 0.4 * uTransition);
            
            // Modify the audio wave blending with transition
            finalColor = mix(finalColor, vec4(audioWaveColor, 0.9), waveIntensity * 0.5 * uTransition);
            
            // Handle glowing spheres with vibrant colors and transition
            vec3 totalGlow = vec3(0.0);
            float sphereGlow = 0.0;
            for(int i = 0; i < 45; i++) {  // Process all possible glowing spheres
                vec4 sphere = uGlowingSpheres[i];
                // Only process if the sphere is active (not at -1000,-1000)
                if (sphere.x > -999.0) {  // Check if it's an active particle
                    float glow = getSphereGlow(pixel, sphere);
                    sphereGlow = max(sphereGlow, glow);
                    vec3 vibrantColor = getVibrantColor(float(i));
                    totalGlow += glow * vibrantColor * 1.5;  // Increased intensity for better visibility
                }
            }
            
            // Add glowing spheres on top
            finalColor = mix(finalColor, brightColor, sphereGlow * 0.6 * uTransition);
            finalColor = vec4(finalColor.rgb + (totalGlow * uTransition), 1.0);
            
            gl_FragColor = finalColor;
        }