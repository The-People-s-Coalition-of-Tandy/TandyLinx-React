export const vertexShaderSource = `
    attribute vec4 aPosition;
    void main() {
        gl_Position = aPosition;
    }
`;

export const fragmentShaderSource = `
    precision mediump float;
    
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec4 uSpheres[15];
    uniform vec4 uGlowingSpheres[15];
    uniform bool uAnimateColors;
    uniform float uWaves[48];

    float getWaveLine(vec2 pixel, float z, float thickness, float noiseScale) {
        vec2 center = uResolution.xy * 0.5;
        float angle = -0.2;
        
        vec2 rotated = pixel - center;
        rotated = vec2(
            rotated.x * cos(angle) - rotated.y * sin(angle),
            rotated.x * sin(angle) + rotated.y * cos(angle)
        );
        rotated += center;
        
        float noiseAmount = mix(0.5, 2.0, 1.0 - thickness / 50.0);
        
        float y = center.y + 
            sin(rotated.x * 0.003 + uTime * 0.2) * thickness * 3.0 +
            sin(rotated.x * 0.007 + uTime * 0.1) * thickness * noiseAmount * noiseScale;
        
        float dist = abs(rotated.y - y);
        
        float blurAmount = mix(2.0, 20.0, z / 1000.0);
        return smoothstep(thickness + blurAmount, thickness - blurAmount, dist);
    }

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
        
        float blurAmount = mix(5.0, 50.0, sphere.z / 1000.0);
        float size = sphere.w;
        
        float blur1 = smoothstep(size + blurAmount, size - blurAmount, dist);
        float blur2 = smoothstep(size + blurAmount * 0.7, size - blurAmount * 0.7, dist);
        float blur3 = smoothstep(size + blurAmount * 0.4, size - blurAmount * 0.4, dist);
        
        return (blur1 * 0.4 + blur2 * 0.35 + blur3 * 0.25);
    }

    float getSphereGlow(vec2 pixel, vec4 sphere) {
        vec2 pos = vec2(sphere.x, sphere.y);
        float size = sphere.w * .05;
        float z = sphere.z;
        
        float dist = length(pixel - pos);
        float glow = size / dist;
        float depthFactor = 1.0 - (z / 1000.0);
        
        return glow * depthFactor * 0.5;
    }

    void main() {
        vec2 pixel = gl_FragCoord.xy;
        
        vec2 normalizedPos = pixel / uResolution;
        vec2 center = vec2(0.5, 0.5);
        float radialGradient = distance(normalizedPos, center) * 2.0;
        
        float diagonal = abs((normalizedPos.x - normalizedPos.y));
        float cornerDarkness = smoothstep(0.0, 1.0, diagonal);
        
        float gradientValue = mix(radialGradient, cornerDarkness, 0.7);
        gradientValue = smoothstep(0.0, 1.2, gradientValue);
        
        float colorPhase = uAnimateColors ? sin(uTime * 0.5) * 0.5 + 0.5 : 0.0;
        
        vec4 brightColor1 = vec4(1.0, 0.4, 0.8, 1.0);
        vec4 brightColor2 = vec4(0.4, 0.8, 1.0, 1.0);
        vec4 darkColor1 = vec4(0.15, 0.0, 0.1, 1.0);
        vec4 darkColor2 = vec4(0.0, 0.1, 0.15, 1.0);
        
        vec4 brightPink = uAnimateColors ? mix(brightColor1, brightColor2, colorPhase) : brightColor1;
        vec4 darkPink = uAnimateColors ? mix(darkColor1, darkColor2, colorPhase) : darkColor1;
        
        vec4 bgColor = mix(darkPink, brightPink, gradientValue);
        
        float sphereIntensity = 0.0;
        for(int i = 0; i < 15; i++) {
            sphereIntensity += getSphere(pixel, uSpheres[i]);
        }
        
        float sphereGlow = 0.0;
        for(int i = 0; i < 15; i++) {
            sphereGlow = max(sphereGlow, getSphereGlow(pixel, uGlowingSpheres[i]));
        }
        
        vec4 waveColor = mix(
            vec4(1.0, 0.6, 0.9, 0.0),
            vec4(0.6, 0.9, 1.0, 0.0),
            colorPhase
        );
        
        float wave = getWaveLine(pixel, 900.0, 45.0, 1.0);
        waveColor.a += wave * 0.1;
        
        wave = getWaveLine(pixel, 800.0, 40.0, 1.2);
        waveColor.a += wave * 0.15;
        
        wave = getWaveLine(pixel, 700.0, 35.0, 1.4);
        waveColor.a += wave * 0.2;
        
        wave = getWaveLine(pixel, 500.0, 30.0, 1.6);
        waveColor.a += wave * 0.25;
        
        wave = getWaveLine(pixel, 400.0, 25.0, 1.8);
        waveColor.a += wave * 0.3;
        
        wave = getWaveLine(pixel, 300.0, 20.0, 2.0);
        waveColor.a += wave * 0.35;
        
        wave = getWaveLine(pixel, 200.0, 15.0, 2.2);
        waveColor.a += wave * 0.4;
        
        wave = getWaveLine(pixel, 100.0, 10.0, 2.4);
        waveColor.a += wave * 0.45;

        float waveIntensity = 0.0;
        for(float i = 0.0; i < 20.0; i++) {
            float z = 200.0 + i * 10.0;
            float freq = 0.003 - (i * 0.00005);
            float amp = 80.0 - (i * 5.0);
            waveIntensity += getAudioWave(pixel, z, freq, amp) * 0.15;
        }
        
        vec4 finalColor = mix(bgColor, brightPink, sphereIntensity * 0.5);
        finalColor = mix(finalColor, waveColor, waveColor.a * 0.3);
        finalColor = mix(finalColor, vec4(.9, 0.5, 0.7, 0.9), waveIntensity);
        finalColor = mix(finalColor, vec4(1.0, 0.6, 0.9, 0.0), sphereGlow);
        
        gl_FragColor = finalColor;
    }
`; 