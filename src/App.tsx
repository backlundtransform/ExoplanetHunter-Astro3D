import React, { useEffect, useState } from "react"
import StarMap from "./StarMap"
import { ExoplanetSystem } from "./ExoplanetSystem"
import { fetchStars, fetchSystem, fetchHabitablePlanets } from "./api"
import type { StarApi, SystemData } from "./types"
import type { HabitablePlanetApi } from "./types"
import "./App.css"



const App: React.FC = () => {
  const [stars, setStars] = useState<StarApi[]>([])
  const [habitablePlanets, setHabitablePlanets] = useState<HabitablePlanetApi[]>([])
  const [selectedSystem, setSelectedSystem] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredStarId, setHoveredStarId] = useState<number | null>(null)

  // Hämta stjärnor och beboliga planeter vid start
  useEffect(() => {
    fetchStars()
      .then((data: any[]) => setStars(data))
      .catch((err: any) => setError(err.message))

    fetchHabitablePlanets()
      .then((data: HabitablePlanetApi[]) => setHabitablePlanets(data))
      .catch(() => {})
  }, [])

  const handleSelectStar = async (starId: number) => {
    setLoading(true)
    setError(null)
    try {
      const system = await fetchSystem(starId)
      setSelectedSystem(system)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (selectedSystem) return <ExoplanetSystem system={selectedSystem} onBack={() => setSelectedSystem(null)} />

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Vänsterlista med stjärnor */}
      <div
  style={{
    width: "250px",
    overflowY: "auto",
    padding: "10px",
    borderRight: "1px solid #ccc",
  }}
>
  <h2>Välj en stjärna</h2>
  {loading && <p>Laddar...</p>}
  {error && <p style={{ color: "red" }}>Fel: {error}</p>}
  <ul style={{ listStyle: "none", padding: 0 }}>
    {stars.map((star) => {
      const hasHabitablePlanet = habitablePlanets.some(
        (p) => p.star?.name === star.name 
      ) || star.name  === "Sun"

   
      const isHovered = hoveredStarId === star.id

      return (
        <li key={star.id} style={{ marginBottom: "6px" }}>
          <button
            onClick={() => handleSelectStar(star.id)}
            onMouseEnter={() => setHoveredStarId(star.id)}
            onMouseLeave={() => setHoveredStarId(null)}
            style={{
              width: "100%",
              padding: "6px 8px",
              textAlign: "left",
              cursor: "pointer",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: isHovered ? "#e6f7ff" : "#f9f9f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {hasHabitablePlanet ? <span>🌍</span> : null}
           
              {star.name}
            </span>

            {hasHabitablePlanet && (
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "limegreen",
                  display: "inline-block",
                  verticalAlign: "middle",
                }}
                title="Möjligt beboelig planet"
              />
            )}
          </button>
        </li>
      )
    })}
  </ul>
</div>


      {/* 3D-stjärnkarta */}
      <div style={{ flex: 1 }}>
        <StarMap
          stars={stars}
          habitablePlanets={habitablePlanets}
          onSelectStar={handleSelectStar}
          hoveredStarId={hoveredStarId}
          onHoverStar={setHoveredStarId}
        />
      </div>
    </div>
  )
}

export default App
