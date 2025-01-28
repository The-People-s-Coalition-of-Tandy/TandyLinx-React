export const vertexShaderSource = `#version 300 es
    in vec4 aPosition;
    void main() {
        gl_Position = aPosition;
    }
`;

export const fragmentShaderSource = `#version 300 es
precision mediump float;

out vec4 fragColor;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec4 uSpheres[15];
uniform vec4 uGlowingSpheres[45]; // Changed from 15 to 45
uniform bool uAnimateColors;
uniform bool uEnableDither;
uniform float uWaves[48];

uniform float uTransitionTimeline;

struct AnimatedVec4 {
    vec4 A;
    vec4 B;
};

struct AnimatedVec3 {
    vec3 A;
    vec3 B;
};

struct AnimatedVec2 {
    vec2 A;
    vec2 B;
};

struct AnimatedFloat {
    float A;
    float B;
};

uniform AnimatedVec3 uSkyTop;
uniform AnimatedVec3 uSkyBottom;

uniform AnimatedFloat uCloudFrequency;
uniform AnimatedFloat uCloudAlpha;

uniform AnimatedVec4 uBgGradientLight;
uniform AnimatedVec4 uBgGradientDark;
uniform AnimatedVec4 uBrightColor;
uniform AnimatedVec3 uWaveColor;
uniform AnimatedVec4 uAudioWaveColor;
uniform AnimatedFloat uBgMix;

uniform AnimatedFloat uRainbowTransition;


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
        float freq = mix(uCloudFrequency.A, uCloudFrequency.B, uTransitionTimeline);
        for (int i = 0; i < 5; i++) {
            f += w * noise(p * freq);
            freq *= 2.0;
            w *= 0.5;
        }
        return f;
    }

    vec4 getSkyAndClouds(vec2 pixel) {
        vec2 uv = pixel.xy / uResolution.xy;
        
        // Sky gradient
        vec3 skyTop = mix(uSkyTop.A, uSkyTop.B, uTransitionTimeline);
        vec3 skyBottom = mix(uSkyBottom.A, uSkyBottom.B, uTransitionTimeline);
        vec3 skyColor = mix(skyBottom, skyTop, uv.y);
        
        // Cloud layer
        float time = uTime * 0.1;
        vec2 cloudUV = uv * vec2(1.0, 2.0) + vec2(time * 0.1, 0.0);
        float cloud = fbm(cloudUV * 3.0);
        cloud = smoothstep(0.0, 0.8, cloud);
        
        // Add some variation to cloud color
        vec3 cloudColor = vec3(1.0);
        vec3 finalColor = mix(skyColor, cloudColor, cloud * 0.7);
        float cloudAlpha = mix(uCloudAlpha.A, uCloudAlpha.B, uTransitionTimeline);
        
        // Apply cloud alpha to the cloud effect itself
        finalColor = mix(skyColor, finalColor, cloudAlpha);

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

// Simplified wave parameters struct
struct WaveParams {
    float z;
    float thickness;
    float noiseScale;
    float alpha;
};

// Consolidated wave generation
float getWaveLines(vec2 pixel) {
    WaveParams[8] waves = WaveParams[8](
        WaveParams(900.0, 45.0, 1.0, 0.1),
        WaveParams(800.0, 40.0, 1.2, 0.15),
        WaveParams(700.0, 35.0, 1.4, 0.2),
        WaveParams(500.0, 30.0, 1.6, 0.25),
        WaveParams(400.0, 25.0, 1.8, 0.3),
        WaveParams(300.0, 20.0, 2.0, 0.35),
        WaveParams(200.0, 15.0, 2.2, 0.4),
        WaveParams(100.0, 10.0, 2.4, 0.45)
    );
    
    float totalWave = 0.0;
    for(int i = 0; i < 8; i++) {
        totalWave += getWaveLine(pixel, waves[i].z, waves[i].thickness, waves[i].noiseScale) * waves[i].alpha;
    }
    return totalWave;
}

// Helper functions
float getGradientValue(vec2 normalizedPos) {
    vec2 center = vec2(0.5);
    float radialGradient = distance(normalizedPos, center) * 2.0;
    float diagonal = abs((normalizedPos.x - normalizedPos.y));
    float cornerDarkness = smoothstep(0.0, 1.0, diagonal);
    float gradientValue = mix(radialGradient, cornerDarkness, 0.7);
    return smoothstep(0.0, 1.2, gradientValue);
}



float getSphereGlowIntensity(vec2 pixel) {
    float intensity = 0.0;
    for(int i = 0; i < 45; i++) {
        intensity = max(intensity, getSphereGlow(pixel, uGlowingSpheres[i]));
    }
    return intensity;
}

float getAudioWaveIntensity(vec2 pixel) {
    float intensity = 0.0;
    for(float i = 0.0; i < 20.0; i++) {
        float z = 200.0 + i * 10.0;
        float freq = 0.003 - (i * 0.00005);
        float amp = 80.0 - (i * 5.0);
        intensity += getAudioWave(pixel, z, freq, amp) * 0.15;
    }
    return intensity;
}

// Fix the dithering implementation by using a fixed array instead of mat8
float dither8x8(vec2 position, float brightness) {
    float[64] pattern = float[64](
        0.0, 32.0, 8.0, 40.0, 2.0, 34.0, 10.0, 42.0,
        48.0, 16.0, 56.0, 24.0, 50.0, 18.0, 58.0, 26.0,
        12.0, 44.0, 4.0, 36.0, 14.0, 46.0, 6.0, 38.0,
        60.0, 28.0, 52.0, 20.0, 62.0, 30.0, 54.0, 22.0,
        3.0, 35.0, 11.0, 43.0, 1.0, 33.0, 9.0, 41.0,
        51.0, 19.0, 59.0, 27.0, 49.0, 17.0, 57.0, 25.0,
        15.0, 47.0, 7.0, 39.0, 13.0, 45.0, 5.0, 37.0,
        63.0, 31.0, 55.0, 23.0, 61.0, 29.0, 53.0, 21.0
    );
    
    int x = int(mod(position.x, 8.0));
    int y = int(mod(position.y, 8.0));
    int index = y * 8 + x;
    
    float threshold = pattern[index] / 64.0;
    return brightness < threshold ? 0.0 : 1.0;
}

vec4 applyDither(vec4 color, vec2 pos) {
    if (!uEnableDither) return color;
    
    vec3 dithered;
    dithered.r = dither8x8(pos, color.r);
    dithered.g = dither8x8(pos, color.g);
    dithered.b = dither8x8(pos, color.b);
    
    return vec4(dithered, color.a);
}

void main() {
    vec2 pixel = gl_FragCoord.xy;
    vec2 normalizedPos = pixel / uResolution;
    
    // Background composition
    vec4 backgroundColor = getSkyAndClouds(pixel);
    float gradientValue = getGradientValue(normalizedPos);
    
    // Color calculation
    float colorPhase = uAnimateColors ? sin(uTime * 0.5) * 0.5 + 0.5 : 0.0;
    vec4 brightColor = mix(uBrightColor.A, uBrightColor.B, uTransitionTimeline);
    vec4 bgColorDark = mix(uBgGradientDark.A, uBgGradientDark.B, uTransitionTimeline);
    vec4 bgColorLight = mix(uBgGradientLight.A, uBgGradientLight.B, uTransitionTimeline);
    vec4 audioWaveColorMixed = mix(uAudioWaveColor.A, uAudioWaveColor.B, uTransitionTimeline);

    vec4 bgColor = mix(bgColorDark, bgColorLight, gradientValue);
    
    // Effect layers
    float frontSphereIntensity = 0.0;
    float backSphereIntensity = 0.0;


    for(int i = 0; i < 15; i++) {
        if (uSpheres[i].z < 900.0) {
            frontSphereIntensity += getSphere(pixel, uSpheres[i]);
        } else {
            backSphereIntensity += getSphere(pixel, uSpheres[i]);
        }
    }

    float sphereGlow = getSphereGlowIntensity(pixel);
    float waveIntensity = getAudioWaveIntensity(pixel);
    
    // Wave color with alpha
    vec4 waveColor = mix(
        vec4(uWaveColor.A, getWaveLines(pixel)),
        vec4(uWaveColor.B, getWaveLines(pixel)),
        uTransitionTimeline
    );

    vec3 rainbow = getRainbowColor(pixel.y / uResolution.y);

    float transitionProgress = mix(uRainbowTransition.A, uRainbowTransition.B, uTransitionTimeline);

    float transitionEdge = transitionProgress * (uResolution.x + 200.0) - 400.0; // Add some padding
    float fadeWidth = 400.0; // Width of the transition fade
    float fadeProgress = smoothstep(0.0, 1.0, (pixel.x - transitionEdge) / fadeWidth);
    fadeProgress = clamp(fadeProgress, 0.0, 1.0);
    waveColor.rgb = mix(waveColor.rgb, rainbow, clamp(1.0 - pixel.x/uResolution.x - fadeProgress, 0.0, 1.0));


    float bgMix = mix(uBgMix.A, uBgMix.B, uTransitionTimeline);

    
    // Final composition
    vec4 finalColor = backgroundColor;
    finalColor = mix(finalColor, bgColor, bgMix);
    finalColor = mix(finalColor, brightColor, backSphereIntensity * 0.7);
    finalColor = mix(finalColor, waveColor, waveColor.a * 0.4);
    finalColor = mix(finalColor, brightColor, frontSphereIntensity * 0.7);  // Using interpolated brightColor
    finalColor = mix(finalColor, audioWaveColorMixed, waveIntensity * 0.5);  // Using interpolated audioWaveColor



    // Handle glowing spheres with vibrant colors and transition
    vec3 totalGlow = vec3(0.0);
    float glowIntensity = 0.0;
    for(int i = 0; i < 45; i++) {  // Process all possible glowing spheres
        vec4 sphere = uGlowingSpheres[i];
        // Only process if the sphere is active (not at -1000,-1000)
        if (sphere.x > -999.0) {  // Check if it's an active particle
            float glow = getSphereGlow(pixel, sphere);
            glowIntensity = max(glowIntensity, glow);
            vec3 vibrantColor = getVibrantColor(float(i));
            totalGlow += glow * vibrantColor * 1.5;  // Increased intensity for better visibility
        }
    }
    
    // Add glowing spheres on top
    finalColor = mix(finalColor, brightColor, glowIntensity * 0.6 * uTransitionTimeline);
    finalColor = vec4(finalColor.rgb + (totalGlow * uTransitionTimeline), 1.0);
    
    // Apply dithering as final step
    finalColor = applyDither(finalColor, gl_FragCoord.xy);
    
    fragColor = finalColor;
}
`; 

//todo
// add rainbows back in

// of note:
// wave intensity multiplier is 0.5, could be a uniform
