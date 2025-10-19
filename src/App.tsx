import React, { useEffect, useState } from "react"
import StarMap from "./StarMap"
import { ExoplanetSystem } from "./ExoplanetSystem"
import { fetchStars, fetchSystem, fetchHabitablePlanets } from "./api"
import type { StarApi, HabitablePlanetApi } from "./types"
import "./App.css"

const App: React.FC = () => {
  const [stars, setStars] = useState<StarApi[]>([])
  const [habitablePlanets, setHabitablePlanets] = useState<HabitablePlanetApi[]>([])
  const [selectedSystem, setSelectedSystem] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredStarId, setHoveredStarId] = useState<number | null>(null)

  // Nya state för sökning och filtrering
  const [searchQuery, setSearchQuery] = useState("")
  const [showHabitableOnly, setShowHabitableOnly] = useState(false)

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

  if (selectedSystem) {
    return <ExoplanetSystem system={selectedSystem} onBack={() => setSelectedSystem(null)} />
  }

  const filteredStars = stars
    .filter((star) => {
      const hasHabitablePlanet =
        habitablePlanets.some((p) => p.star?.name === star.name) || star.name === "Sun"
      const matchesSearch = star.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch && (!showHabitableOnly || hasHabitablePlanet)
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#0d1117", color: "#e6edf3" }}>
      {/* 🌌 SIDOLISTA */}
      <div
        style={{
          width: "280px",
          overflowY: "auto",
          padding: "16px",
          borderRight: "1px solid #30363d",
          backgroundColor: "#161b22",
          boxShadow: "0 0 10px rgba(0,0,0,0.4)",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#58a6ff" }}>Exoplanet Hunter</h2>

        {/* 🔍 Sökfält */}
        <input
          type="text"
          placeholder="Search stars..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #30363d",
            backgroundColor: "#0d1117",
            color: "#e6edf3",
            fontSize: "14px",
            outline: "none",
          }}
        />

        {/* 🌍 Checkbox */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
            fontSize: "14px",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={showHabitableOnly}
            onChange={(e) => setShowHabitableOnly(e.target.checked)}
            style={{
              marginRight: "8px",
              accentColor: "#58a6ff",
            }}
          />
          Show only habitable systems 🌍
        </label>

        {/* Status */}
        {loading && <p style={{ color: "#8b949e" }}>Loading...</p>}
        {error && <p style={{ color: "#f85149" }}>Error: {error}</p>}

        {/* Antal resultat */}
        <p style={{ fontSize: "13px", color: "#8b949e", marginBottom: "8px" }}>
          Showing {filteredStars.length} of {stars.length} stars
        </p>

        {/* ⭐ Lista */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filteredStars.map((star) => {
            const hasHabitablePlanet =
              habitablePlanets.some((p) => p.star?.name === star.name) || star.name === "Sun"
            const isHovered = hoveredStarId === star.id

            return (
              <li key={star.id} style={{ marginBottom: "6px" }}>
                <button
                  onClick={() => handleSelectStar(star.id)}
                  onMouseEnter={() => setHoveredStarId(star.id)}
                  onMouseLeave={() => setHoveredStarId(null)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: "6px",
                    border: "1px solid #30363d",
                    backgroundColor: isHovered ? "#1f6feb22" : "#21262d",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "#e6edf3",
                    transition: "background-color 0.2s ease, transform 0.1s ease",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {hasHabitablePlanet && <span>🌍</span>}
                    {star.name}
                  </span>

                  {hasHabitablePlanet && (
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#2ea043",
                        display: "inline-block",
                        boxShadow: "0 0 6px #2ea043aa",
                      }}
                      title="Potentially habitable"
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* 🪐 3D-stjärnkarta */}
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
