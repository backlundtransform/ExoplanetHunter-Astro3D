import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Planet } from './Planet'
import { Star } from './Star'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { HabitableZone } from './HabitableZone'
import { OrbitPath } from './OrbitRing'
import type { SystemData, PlanetData } from './types'
import { makeScaleDistanceFn, makeScaleRadiusFn, scaleStarRadiusToUnits } from './utils'
import { useTranslation } from 'react-i18next'
import './i18n'
import './App.css'

interface ExoplanetSystemProps {
  system: SystemData
  onBack: () => void
}

export const ExoplanetSystem: React.FC<ExoplanetSystemProps> = ({ system, onBack }) => {
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetData | null>(null)
  const { t } = useTranslation()

  const scaleDistanceFn = makeScaleDistanceFn(system, 200)
  const scaleRadiusFn = makeScaleRadiusFn(system, 5, 0.8)
  const maxDistanceAU = Math.max(...system.planets.map(p => p.meanDistance ?? 0))
  const maxDistance = scaleDistanceFn(maxDistanceAU)
  const cameraZ = maxDistance * 1.5

  return (
    <div className="canvas-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          padding: '8px 12px',
          borderRadius: 4,
          border: 'none',
          backgroundColor: '#007bff',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        ← {t('app.title')}
      </button>

      {hoveredPlanet && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.75)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            width: '250px',
            lineHeight: '1.4',
          }}
        >
          <b>{hoveredPlanet.name}</b>
          <br />
          {t('app.planet_mass')}: {hoveredPlanet.mass ?? t('app.unknown')} M⊕
          <br />
          {t('app.planet_radius')}: {hoveredPlanet.radius ?? t('app.unknown')} R⊕
          <br />
          {t('app.planet_distance')}: {hoveredPlanet.meanDistance ?? t('app.unknown')} AU
          <br />
          {t('app.planet_temp')}: {hoveredPlanet.tsMean ? `${hoveredPlanet.tsMean} K` : 'N/A'}
          <br />
          {t('app.planet_period')}: {hoveredPlanet.period ?? t('app.unknown')} {t('app.planet_days')}
        </div>
      )}

      {/* 🌟 3D-systemet */}
      <Canvas camera={{ position: [0, maxDistance * 0.3, cameraZ], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2} />
        <Stars radius={300} depth={60} count={10000} factor={7} saturation={0} fade speed={1} />

        <Star radius={scaleStarRadiusToUnits(system.radius ?? 0, maxDistance)} spectralType={system.type} />
        <HabitableZone innerRadius={system.habZoneMin} outerRadius={system.habZoneMax} scaleDistanceFn={scaleDistanceFn} />

        {system.planets.map((planet) => (
          <React.Fragment key={planet.id}>
            <OrbitPath
              semiMajorAxis={scaleDistanceFn(planet.meanDistance ?? 0)}
              eccentricity={planet.eccentricity ?? 0}
              inclination={planet.inclination ?? 0}
              color="white"
            />
            <Planet
              planet={planet}
              scaleDistanceFn={scaleDistanceFn}
              scaleRadiusFn={scaleRadiusFn}
              system={system}
              onHover={setHoveredPlanet}
            />
          </React.Fragment>
        ))}

        <EffectComposer>
          <Bloom intensity={1.5} kernelSize={3} luminanceThreshold={0.1} luminanceSmoothing={0.9} />
        </EffectComposer>

        <OrbitControls />
      </Canvas>
    </div>
  )
}
