import React, { useMemo } from 'react'

import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { LineMaterial } from 'three-stdlib'

interface OrbitPathProps {
  semiMajorAxis: number         
  eccentricity: number          
  inclination: number           
  color?: string              
  segments?: number           
}
const material = new LineMaterial({
  
  linewidth: 0.5,
  transparent: true,
  opacity: 0.1,
  depthWrite: false
})
export const OrbitPath: React.FC<OrbitPathProps> = ({
  semiMajorAxis,
  eccentricity,
  inclination,
  color = 'white',
  segments = 128
}) => {
  const points = useMemo(() => {
    const a = semiMajorAxis
    const b = a * Math.sqrt(1 - eccentricity ** 2)
    const inclinationRad = (inclination * Math.PI) / 180

    const pts = new Array(segments).fill(0).map((_, i) => {
      const angle = (i / segments) * 2 * Math.PI
      const x = a * Math.cos(angle)
      const z = b * Math.sin(angle)
      const y = 0

      const rotatedY = y * Math.cos(inclinationRad) - z * Math.sin(inclinationRad)
      const rotatedZ = y * Math.sin(inclinationRad) + z * Math.cos(inclinationRad)

      return new THREE.Vector3(x, rotatedY, rotatedZ)
    })

    pts.push(pts[0].clone())
    return pts
  }, [semiMajorAxis, eccentricity, inclination, segments])

  return (
    <Line
      points={points}
      color={color}
      lineWidth={0.5}
      dashed={false}
      material={material}
    />
  )
}
