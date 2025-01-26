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
uniform vec4 uGlowingSpheres[15]; // change to 45 maybe
uniform bool uAnimateColors;
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
    float glow = size / dist;  // try out pow(size / dist, 1.5); 
    float depthFactor = 1.0 - (z / 1000.0);
    
    return glow * depthFactor * 0.5; // possibly use 0.3
}

//         vec3 getVibrantColor(float index) {
    //     float normalizedIndex = mod(index, 6.0);
        
    //     if (normalizedIndex < 1.0) return vec3(1.0, 0.0, 1.0); // Magenta
    //     if (normalizedIndex < 2.0) return vec3(0.0, 1.0, 1.0); // Cyan
    //     if (normalizedIndex < 3.0) return vec3(1.0, 0.0, 0.0); // Red
    //     if (normalizedIndex < 4.0) return vec3(0.0, 1.0, 0.0); // Green
    //     if (normalizedIndex < 5.0) return vec3(0.0, 0.0, 1.0); // Blue
    //     return vec3(1.0, 0.5, 0.0); // Orange
    // }
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

float getSphereIntensity(vec2 pixel) {
    float intensity = 0.0;
    for(int i = 0; i < 15; i++) {
        intensity += getSphere(pixel, uSpheres[i]);
    }
    return intensity;
}

float getSphereGlowIntensity(vec2 pixel) {
    float intensity = 0.0;
    for(int i = 0; i < 15; i++) {
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
    float sphereIntensity = getSphereIntensity(pixel);
    float sphereGlow = getSphereGlowIntensity(pixel);
    float waveIntensity = getAudioWaveIntensity(pixel);
    
    // Wave color with alpha
    vec4 waveColor = mix(
        vec4(uWaveColor.A, getWaveLines(pixel)),
        vec4(uWaveColor.B, getWaveLines(pixel)),
        uTransitionTimeline
    );

 float bgMix = mix(uBgMix.A, uBgMix.B, uTransitionTimeline);
    
    // Final composition
    vec4 finalColor = backgroundColor;
    finalColor = mix(finalColor, bgColor, bgMix);
    finalColor = mix(finalColor, brightColor, sphereIntensity * 0.7);  // Using interpolated brightColor
    finalColor = mix(finalColor, waveColor, waveColor.a * 0.4);
    finalColor = mix(finalColor, audioWaveColorMixed, waveIntensity * 0.5);  // Using interpolated audioWaveColor
    finalColor = mix(finalColor, vec4(1.0, 0.6, 0.9, 0.0), sphereGlow);
    
    fragColor = finalColor;
}
`; 

//todo
// add rainbows back in

// of note:
// wave intensity multiplier is 0.5, could be a uniform
