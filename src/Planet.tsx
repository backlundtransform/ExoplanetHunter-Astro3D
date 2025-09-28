import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { Html } from '@react-three/drei'
import type { PlanetData, SystemData } from './types'
import { usePlanetMaterial } from './planetMaterial'
import { getPositionFromAngle } from './utils'

interface PlanetProps {
  planet: PlanetData
  scaleDistanceFn: (distanceAU: number) => number
  scaleRadiusFn: (radiusEarthRadii: number) => number
  system: SystemData
}

export const Planet: React.FC<PlanetProps> = ({
  planet,
  scaleDistanceFn,
  scaleRadiusFn,
  system
}) => {
  const ref = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
 

  const scaledRadius = scaleRadiusFn(planet.radius)
  const material = usePlanetMaterial(planet)

  const a = scaleDistanceFn(planet.meanDistance ?? 0)
  const e = planet.eccentricity ?? 0
  const i = planet.inclination ?? 0

  

  useFrame(({ clock }) => {
    if (ref.current && !hovered) {
      const periodDays = planet.period ?? 1
      const shortestPeriod = Math.min(...system.planets.map(p => p.period ?? 1))
  
      
      const fastestOrbitSeconds = 20
      const angle =
        (clock.getElapsedTime() / fastestOrbitSeconds) *
        (shortestPeriod / periodDays) *
        2 *
        Math.PI
  
      const pos = getPositionFromAngle(a, e, i, angle)
      ref.current.position.set(pos.x, pos.y, pos.z)
    }
  
    document.body.style.cursor = hovered ? "pointer" : "default"
  })

  return (
    <mesh
      ref={ref}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[scaledRadius, 32, 32]} />
      <primitive object={material} attach="material" />

      {hovered && (
        <Html distanceFactor={150}>
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '8px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px',
            pointerEvents: 'none',
            minWidth: '150px',
            maxWidth: '300px',
            minHeight: '100px',
            maxHeight: '200px'
          }}>
            <strong>{planet.name}</strong><br/>
            Mass: {planet.mass} Earths<br/>
            Radius: {planet.radius} Earths<br/>
            Distance: {planet.meanDistance} AU<br/>
            Temp: {planet.tsMean ?? 'N/A'} K
          </div>
        </Html>
      )}
    </mesh>
  )
}
