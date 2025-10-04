
import { Canvas } from "@react-three/fiber"
import { Html, OrbitControls, Stars as DreiStars } from "@react-three/drei"
import type { StarApi } from "./types"
import type { HabitablePlanetApi } from "./api"


interface StarMapProps {
  stars: StarApi[]
  habitablePlanets: HabitablePlanetApi[]
  onSelectStar: (starId: number) => void
  hoveredStarId: number | null
  onHoverStar: (id: number | null) => void
}

export default function StarMap({
  stars,
  habitablePlanets,
  onSelectStar,
  hoveredStarId,
  onHoverStar,
}: StarMapProps) {
  const raDecToXYZ = (ra: number, dec: number, radius: number) => {
    const raRad = (ra / 24) * 2 * Math.PI
    const decRad = (dec / 180) * Math.PI
    const x = radius * Math.cos(decRad) * Math.cos(raRad)
    const y = radius * Math.sin(decRad)
    const z = radius * Math.cos(decRad) * Math.sin(raRad)
    return [x, y, z]
  }

  return (
    <Canvas camera={{ position: [0, 0, 100], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={1} />
      <DreiStars radius={100} depth={50} count={1000} factor={4} saturation={0} fade />

      {stars.map((star) => {
        const [x, y, z] = raDecToXYZ(star.ra ?? 0, star.dec ?? 0, 40)
        const isHovered = hoveredStarId === star.id
        const isHabitable = habitablePlanets.some((p) => p.star?.name === star.name)

        return (
          <group key={star.id} position={[x, y, z]}>
          {/* Grön ring runt beboliga stjärnor */}
{isHabitable && (
  <mesh renderOrder={0}>
    <sphereGeometry args={[0.65, 16, 16]} /> {/* något större än stjärnan */}
    <meshBasicMaterial
      color={isHovered ? "yellow" : "green"}
      transparent
      opacity={0.5} // gör den lite genomskinlig så stjärnan syns
    />
  </mesh>
)}

/* Själva stjärnan */
<mesh
  renderOrder={isHovered ? 2 : 1}
  onPointerOver={() => onHoverStar(star.id)}
  onPointerOut={() => onHoverStar(null)}
  onClick={() => onSelectStar(star.id)}
>
  <sphereGeometry args={[0.5, 16, 16]} />
  <meshBasicMaterial
    color={isHovered ? "yellow" : "white"}
    depthTest={false} // hovrad stjärna alltid över
  />
</mesh>

            {/* Tooltip */}
            {isHovered && (
              <Html distanceFactor={10} style={{ pointerEvents: "none" }}>
                <div
                  style={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "200px",  // lägg till px
                    minHeight: "80px", // säkerställ höjd
                    border: isHabitable ? "1px solid lime" : "none",
                  }}
                >
                  <b>{star.name}</b> <br />
                  RA: {(star.ra ?? 0).toFixed(2)}h <br />
                  Dec: {(star.dec ?? 0).toFixed(2)}° <br />
                  {isHabitable && (
                    <div style={{ marginTop: "4px", color: "green" }}>🌍 Möjligt beboelig</div>
                  )}
                </div>
              </Html>
            )}
          </group>
        )
      })}

      <OrbitControls />
    </Canvas>
  )
}
