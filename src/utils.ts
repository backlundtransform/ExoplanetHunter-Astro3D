import * as THREE from 'three'
import type { SystemData } from './types'

/**
 * Beräknar planetens position på banan utifrån semi-major axis, excentricitet,
 * inklination och orbital vinkel.
 */
export function getOrbitalPosition(
  semiMajorAxis: number,
  eccentricity: number,
  inclinationDeg: number,
  orbitalAngle: number
): THREE.Vector3 {
  const a = semiMajorAxis
  const b = a * Math.sqrt(1 - eccentricity ** 2)
  const inclinationRad = (inclinationDeg * Math.PI) / 180

  const x = a * Math.cos(orbitalAngle)
  const z = b * Math.sin(orbitalAngle)

  const y = 0
  const rotatedY = y * Math.cos(inclinationRad) - z * Math.sin(inclinationRad)
  const rotatedZ = y * Math.sin(inclinationRad) + z * Math.cos(inclinationRad)

  return new THREE.Vector3(x, rotatedY, rotatedZ)
}


export const getPositionFromAngle = getOrbitalPosition

export function getAngleFromPosition(
  semiMajorAxis: number,
  mousePoint: THREE.Vector3
): number {

  const dx = mousePoint.x
  const dz = mousePoint.z

  const a = semiMajorAxis
  const e = 0 
  const b = a * Math.sqrt(1 - e ** 2)


  const angle = Math.atan2(dz / b, dx / a)
  return angle
}

export function significantDigits(num: number): number {
  if (num === 0) return 0;

  const abs = Math.abs(num);
  const log10 = Math.floor(Math.log10(abs));

  let decimaler;
  if (log10 >= 3) decimaler = 0;         
  else if (log10 >= 2) decimaler = 1;    
  else if (log10 >= 1) decimaler = 2;    
  else if (log10 >= 0) decimaler = 3;    
  else if (log10 >= -1) decimaler = 4;   
  else if (log10 >= -2) decimaler = 5;   
  else decimaler = 6;                    

  const faktor = Math.pow(10, decimaler);
  const avrundat = Math.round((num + Number.EPSILON) * faktor) / faktor;
  
  return Number(avrundat.toFixed(decimaler));
}

export function makeScaleDistanceFn(system: SystemData, targetMax = 200) {
  const maxDistanceAU = Math.max(...system.planets.map(p => p.meanDistance ?? 0))

  return (distanceAU: number) => {
    if (!maxDistanceAU || distanceAU <= 0) return 0

    
    const logPart = Math.log10(distanceAU + 1) / Math.log10(maxDistanceAU + 1)
    return logPart * targetMax
  }
}

export function makeScaleRadiusFn(system: SystemData, targetMax = 5, minSize = 0.8) {
  const maxRadius = Math.max(...system.planets.map(p => p.radius ?? 0))
  return (radiusEarthRadii: number) => {
    if (!maxRadius) return minSize
    return (radiusEarthRadii / maxRadius) * targetMax + minSize
  }
}

export function computeOrbitSpeed(periodDays: number, baseOrbitTime = 30) {
 
  const logPeriod = Math.log10(periodDays + 1)
  const speed = (2 * Math.PI) / (baseOrbitTime * logPeriod)
  return speed
}


export function scaleStarRadiusToUnits(radiusSolarRadii: number, maxPlanetDistanceAU: number){

  const base = Math.log10(radiusSolarRadii + 1) * 10
  const maxScaled = Math.log10(maxPlanetDistanceAU + 1) * 0.2
  return Math.min(Math.max(base, 3), maxScaled)

}