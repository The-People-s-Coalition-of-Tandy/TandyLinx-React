import React, { useEffect, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Environment, Text3D, OrbitControls, Float } from '@react-three/drei'
import Box from './components/Box';
import styles from './index.module.css';


function AdaptiveCamera() {
    const { camera, size } = useThree();
  
    useEffect(() => {
      const aspect = size.width / size.height;
      const zoom = 2; // Adjust zoom to control the size of the view
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;
      camera.updateProjectionMatrix();
    }, [camera, size]);
  
    return null; // This component only updates the camera
  }

  function Title({pageTitle}) {
    const { viewport } = useThree();
    const textRef = useRef();
  
    useEffect(() => {
      if (textRef.current) {
        // Compute the bounding box using the ref
        const geometry = textRef.current.geometry;
        geometry.computeBoundingBox();
        const { min, max } = geometry.boundingBox;
  
        // Calculate the dimensions of the text
        const width = max.x - min.x;
        const height = max.y - min.y;
  
        // Center the text horizontally and vertically
        textRef.current.position.x = -width / 2;
        textRef.current.position.y = viewport.height / 2 - height - 0.5;
      }
    }, [viewport]);

    useFrame((state, delta) => {
        textRef.current.rotation.x = Math.sin(Math.PI/2+delta/2);
        // textRef.current.rotation.y = Math.cos(Math.PI/2+delta/2);
    })
  
    return (
        <Float speed={1.75} floatIntensity={1} >
      <Text3D
        ref={textRef}
        font={'../../assets/fonts/three/Play_Regular.json'}
        size={0.3} // Size of the text
        height={0.02} // Depth of the 3D text
        curveSegments={12} // Smoothing of the text edges
        bevelEnabled
        bevelThickness={0.03}
        bevelSize={0.02}
        bevelSegments={5}
        rotation={[Math.PI / 8, 0, 0]}
      >
        {pageTitle}
        <meshPhysicalMaterial color="#600090" roughness={0.02} envMapIntensity={2} 
        clearcoat={1} clearcoatRoughness={0.05} reflectivity={1} ior={1} specularIntensity={1} specularColor={0xff00ff}
         castShadow={true} receiveShadow={true} />
      </Text3D>
      </Float>
    );
  }

  function Grid({ links }) {
    const { viewport } = useThree();
  
    const totalCubes = links.length;
  
    // Define how much of the screen each cube should occupy
    const screenCoverage = 0.5; // Each cube takes up 50% of the screen width
    const cubeSize = viewport.width * screenCoverage; // Cube size in screen space
  
    // Calculate grid dimensions
    const gridColumns = Math.ceil(Math.sqrt(totalCubes)); // Number of columns
    const gridRows = Math.ceil(totalCubes / gridColumns); // Number of rows
  
    // Calculate spacing between cubes
    const spacing = cubeSize * 1.2; // Add some padding between cubes
  
    // Calculate offsets to center the grid
    const offsetX = -(gridColumns - 1) * spacing * 0.5;
    const offsetY = -(gridRows - 1) * spacing * 0.5;
  
    return (
      <>
        {links.map((link, index) => {
          const row = Math.floor(index / gridColumns); // Row index
          const col = index % gridColumns; // Column index
  
          // Position each cube in screen space
          const x = col * spacing + offsetX;
          const y = -row * spacing + offsetY; // Negative y to match 3D coordinates
  
          return (
            <Box
              key={index}
              position={[x, y, 0]} // Set cube position
              scale={[cubeSize, cubeSize, cubeSize]} // Scale cubes based on screen coverage
            />
          );
        })}
      </>
    );
  }
  
  
  
  export default function Cubes({ pageTitle, links }) {
    return (
      <Canvas className={styles.canvas}>
        <AdaptiveCamera />
        <OrbitControls />
        <Environment preset="sunset" />
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 100]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <Title pageTitle={pageTitle} />
  
        {/* Grid of cubes */}
        <Grid links={links} />
      </Canvas>
    );
  }
  