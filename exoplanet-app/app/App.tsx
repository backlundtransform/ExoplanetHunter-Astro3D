import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { fetchStars, fetchHabitablePlanets, fetchSystem } from "./api";
import type { StarApi, SystemData } from "./types";

export default function App() {
  const [stars, setStars] = useState<any[]>([]);
  const [habitablePlanets, setHabitablePlanets] = useState<any[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStars().then(setStars).catch(err => setError(err.message));
    fetchHabitablePlanets().then(setHabitablePlanets).catch(() => {});
  }, []);

  const handleSelectStar = async (starId: number) => {
    setLoading(true);
    setError(null);
    try {
      const system = await fetchSystem(starId);
      setSelectedSystem(system);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (selectedSystem) return <Text>System selected: {selectedSystem.name}</Text>;

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Välj en stjärna</Text>
      {loading && <Text>Laddar...</Text>}
      {error && <Text style={{ color: "red" }}>Fel: {error}</Text>}
      <ScrollView>
        {stars.map(star => {
          const hasHabitable = habitablePlanets.some(p => p.star?.name === star.name) || star.name === "Sun";
          return (
            <TouchableOpacity
              key={star.id}
              onPress={() => handleSelectStar(star.id)}
              style={{
                padding: 10,
                marginBottom: 6,
                backgroundColor: hasHabitable ? "#e6f7ff" : "#f9f9f9",
                borderRadius: 4,
              }}
            >
              <Text>{star.name} {hasHabitable ? "🌍" : ""}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}