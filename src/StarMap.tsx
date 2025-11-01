import  { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars as DreiStars } from "@react-three/drei"
import type { StarApi } from "./types"
import type { HabitablePlanetApi } from  './types'
import { useTranslation } from "react-i18next"
import "./i18n"

export default function StarMap({
  stars,
  habitablePlanets,
  onSelectStar,
}: {
  stars: StarApi[]
  habitablePlanets: HabitablePlanetApi[]
  onSelectStar: (id: number) => void
}) {
  const { t } = useTranslation()
  const [hoveredStarId, setHoveredStarId] = useState<number | null>(null)

  const hoveredStar = stars.find((s) => s.id === hoveredStarId) ?? null

  const raDecToXYZ = (ra: number, dec: number, radius: number) => {
    const raRad = (ra / 24) * 2 * Math.PI
    const decRad = (dec / 180) * Math.PI
    return [
      radius * Math.cos(decRad) * Math.cos(raRad),
      radius * Math.sin(decRad),
      radius * Math.cos(decRad) * Math.sin(raRad),
    ]
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* 🪐 Informationsruta */}
      {hoveredStar && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.75)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            width: "240px",
            fontSize: "14px",
            lineHeight: "1.4",
          }}
        >
          <b>{hoveredStar.name}</b>
          <br />
          RA: {(hoveredStar.ra ?? 0).toFixed(2)}h
          <br />
          Dec: {(hoveredStar.dec ?? 0).toFixed(2)}°
          {habitablePlanets.some((p) => p.star?.name === hoveredStar.name) && (
            <div style={{ marginTop: "4px", color: "lime" }}>
              🌍 {t("app.habitable_tooltip")}
            </div>
          )}
        </div>
      )}

      {/* 🎇 Själva 3D-kartan */}
      <Canvas camera={{ position: [0, 0, 100], fov: 60 }} style={{ width: '100%', height: '100%', backgroundColor: '#0d1117' }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={1} />
        <DreiStars radius={100} depth={50} count={1000} factor={4} saturation={0} fade />

        {stars.map((star) => {
          const [x, y, z] = raDecToXYZ(star.ra ?? 0, star.dec ?? 0, 40)
          const isHovered = hoveredStarId === star.id
          const isHabitable = habitablePlanets.some((p) => p.star?.name === star.name)

          return (
            <group key={star.id} position={[x, y, z]}>
              {isHabitable && (
                <mesh>
                  <sphereGeometry args={[0.65, 16, 16]} />
                  <meshBasicMaterial color={isHovered ? "yellow" : "green"} transparent opacity={0.5} />
                </mesh>
              )}
              <mesh
                onPointerOver={() => setHoveredStarId(star.id)}
                onPointerOut={() => setHoveredStarId(null)}
                onClick={() => onSelectStar(star.id)}
              >
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial color={isHovered ? "yellow" : "white"} />
              </mesh>
            </group>
          )
        })}

        <OrbitControls />
      </Canvas>
    </div>
  )
}
