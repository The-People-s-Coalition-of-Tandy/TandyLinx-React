import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'

export default function Box(props) {

    const meshRef = useRef()
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
  
    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta;
    })

    function handleClick() {
        console.log(props.link.url)
        window.open(props.link.url, '_blank');
    }
    return (
        <mesh
        {...props}
        ref={meshRef}
        onClick={(event) => handleClick()}
        onPointerOver={(event) => setHover(true)}
        onPointerOut={(event) => setHover(false)}>
        <RoundedBox args={[2, 2, 2]} radius={0.2}>
          <meshPhysicalMaterial color={hovered ? 'black' : '#F010D4'} metalness={1} roughness={0.02} envMapIntensity={2} 
          clearcoat={1} clearcoatRoughness={0.05} reflectivity={1} ior={1} specularIntensity={1} specularColor={0xff00ff}
           castShadow={true} receiveShadow={true} />
        </RoundedBox>
      </mesh>
    )
}