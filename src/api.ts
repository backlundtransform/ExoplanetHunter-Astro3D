import type { SystemData } from "./types"


  export function mapPlanet(api: any): any {
    return {
      id: api.id,
      name: api.name,
      nameKepler: api.nameKepler ?? null,
      nameKOI: api.nameKOI ?? null,
      zoneClass: api.zoneClass ?? null,
      massClass: api.massClass ?? null,
      compositionClass: api.compositionClass ?? null,
      atmosphereClass: api.atmosphereClass ?? null,
      habitableClass: api.habitableClass ?? null,
  
      minMass: api.minMass ?? null,
      mass: api.mass ?? null,
      maxMass: api.maxMass ?? null,
      radius: api.radius ?? null,
      density: api.density ?? null,
      gravity: api.gravity ?? null,
      escVel: api.escVel ?? null,
  
      sFluxMin: api.sFluxMin ?? null,
      sFluxMean: api.sFluxMean ?? null,
      sFluxMax: api.sFluxMax ?? null,
  
      teqMin: api.teqMin ?? null,
      teqMean: api.teqMean ?? null,
      teqMax: api.teqMax ?? null,
  
      tsMin: api.tsMin ?? null,
      tsMean: api.tsMean ?? null,
      tsMax: api.tsMax ?? null,
  
      surfPress: api.surfPress ?? null,
      mag: api.mag ?? null,
      apparSize: api.apparSize ?? null,
  
      period: api.period ?? 1,
      semMajorAxis: api.semMajorAxis ?? null,
      meanDistance: api.meanDistance ?? api.semMajorAxis ?? 0.1,
      eccentricity: api.eccentricity ?? 0,
      inclination: api.inclination ?? 0,
      omega: api.omega ?? null,
  
      hzd: api.hzd ?? null,
      hzc: api.hzc ?? null,
      hza: api.hza ?? null,
      hzi: api.hzi ?? null,
      sph: api.sph ?? null,
      intEsi: api.intEsi ?? null,
      surfEsi: api.surfEsi ?? null,
      esi: api.esi ?? null,
  
      habitable: api.habitable ?? false,
      habMoon: api.habMoon ?? null,
      confirmed: api.confirmed ?? null,
  
      disc_Method: api.disc_Method ?? null,
      disc_Year: api.disc_Year ?? null,
  
      message: api.message ?? null,
    }
  }

  // types.ts
export interface StarApi {
    id: number
    name: string
    nameHD?: string | null
    nameHIP?: string | null
    constellation?: string | null
    type?: string | null
    mass?: number | null
    radius?: number | null
    teff?: number | null
    luminosity?: number | null
    feH?: number | null
    age?: number | null
    apparMag?: number | null
    distance?: number | null
    ra?: number | null
    dec?: number | null
    magfromPlanet?: number | null
    sizefromPlanet?: number | null
    habZoneMin?: number | null
    habZoneMax?: number | null
    habCat?: boolean | null
    planets?: number | null
    message?: string | null
  }
  
  // Din interna struktur
  export interface StarData {
    id: number
    name: string
    nameHD?: string | null
    nameHIP?: string | null
    constellation?: string | null
    type?: string | null
    mass: number
    radius: number
    teff?: number | null
    luminosity?: number | null
    feH?: number | null
    age?: number | null
    apparMag?: number | null
    distance?: number | null
    ra?: number | null
    dec?: number | null
    magfromPlanet?: number | null
    sizefromPlanet?: number | null
    habZoneMin?: number | null
    habZoneMax?: number | null
    habCat?: boolean | null
    planets?: number | null
    message?: string | null
  }
  
  // Mapper-funktion
  export function mapStar(api: any): StarData {
    return {
      id: api.id,
      name: api.name,
      nameHD: api.nameHD ?? null,
      nameHIP: api.nameHIP ?? null,
      constellation: api.constellation ?? null,
      type: api.type ?? null,
      mass: api.mass ?? 1,      // fallback så att visualisering alltid funkar
      radius: api.radius ?? 1,  // samma här
      teff: api.teff ?? null,
      luminosity: api.luminosity ?? null,
      feH: api.feH ?? null,
      age: api.age ?? null,
      apparMag: api.apparMag ?? null,
      distance: api.distance ?? null,
      ra: api.ra ?? null,
      dec: api.dec ?? null,
      magfromPlanet: api.magfromPlanet ?? null,
      sizefromPlanet: api.sizefromPlanet ?? null,
      habZoneMin: api.habZoneMin ?? null,
      habZoneMax: api.habZoneMax ?? null,
      habCat: api.habCat ?? null,
      planets: api.planets ?? null,
      message: api.message ?? null
    }
  }

  export interface HabitablePlanetApi {
    id: number
    name: string
    img?: string | null
    period?: number | null
    habType?: number | null
    meanDistance?: number | null
    distance?: number | null
    esi?: number | null
    radius: number
    eccentricity?: number | null
    coordinate?: {
      longitude: number
      latitude: number
    }
    star?: {
      name: string
      type: string
      mass: number
      radius: number
      temp?: number
    }
  }
  
  
  
  export function mapSystem(star: StarApi, planets: any): any {
    return {
      ... mapStar(star),
      planets: planets.map(mapPlanet)
    }
  }


const API_URL = "/api"



export async function fetchStars(): Promise<StarApi[]> {
    const res = await fetch(`${API_URL}/Stars`)
    if (!res.ok) throw new Error("Kunde inte hämta stjärnor")
    return res.json()
  }

  export async function fetchHabitablePlanets(): Promise<HabitablePlanetApi[]> {
    const res = await fetch(`${API_URL}/ExoSolarSystems/GetHabitablePlanets`)
    if (!res.ok) throw new Error("Kunde inte hämta beboeliga planeter")
    return res.json()
  }
  
  export async function fetchSystem(starId: number): Promise<SystemData> {
    const [starRes, planetRes] = await Promise.all([
      fetch(`${API_URL}/Stars/${starId}`),
      fetch(`${API_URL}/Stars/${starId}/planets`)
    ])
  
    if (!starRes.ok) throw new Error("Kunde inte hämta stjärna")
    if (!planetRes.ok) throw new Error("Kunde inte hämta planeter")
  
    const star = await starRes.json()
    const planets = await planetRes.json()
  
    return mapSystem(star, planets.planets)
  }