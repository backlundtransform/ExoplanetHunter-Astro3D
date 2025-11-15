import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars as DreiStars } from "@react-three/drei";
import type { StarApi, HabitablePlanetApi } from "./types";
import useDeviceAstronomy from "./hooks/useDeviceAstronomy";
import "./App.css"
// RA/Dec → XYZ
const raDecToXYZ = (ra: number, dec: number, radius: number) => {
    const raRad = (ra / 24) * 2 * Math.PI;
    const decRad = (dec / 180) * Math.PI;
    return [
        radius * Math.cos(decRad) * Math.cos(raRad),
        radius * Math.sin(decRad),
        radius * Math.cos(decRad) * Math.sin(raRad)
    ];
};

// Kamerahook som följer enhetens RA/Dec
const CameraMover = ({ ra, dec, radius }: { ra: number; dec: number; radius: number }) => {
    const { camera } = useThree();
    const raRef = useRef(ra);
    const decRef = useRef(dec);

    useEffect(() => {
        raRef.current = ra;
        decRef.current = dec;
    }, [ra, dec]);

    useFrame(() => {
        const [x, y, z] = raDecToXYZ(raRef.current, decRef.current, radius);
        camera.position.lerp({ x, y, z }, 0.1);
        camera.lookAt(0, 0, 0);
    });

    return null;
};

export default function StarMap({
    stars,
    habitablePlanets,
    onSelectStar,
}: {
    stars: StarApi[];
    habitablePlanets: HabitablePlanetApi[];
    onSelectStar: (id: number) => void;
}) {
    const [hoveredStarId, setHoveredStarId] = useState<number | null>(null);
    const [gpsActive, setGpsActive] = useState(false);

    const deviceAstronomy = useDeviceAstronomy();
    const hoveredStar = stars.find(s => s.id === hoveredStarId) ?? null;

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            {hoveredStar && <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10, backgroundColor: "rgba(0,0,0,0.75)", color: "white", padding: "12px", borderRadius: "8px" }}>{hoveredStar.name}</div>}

            <button style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }} onClick={() => setGpsActive(!gpsActive)}>📡</button>

            <Canvas camera={{ position: [0, 0, 100], fov: 60 }} style={{ width: "100%", height: "100%", backgroundColor: "#0d1117" }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[0, 0, 0]} intensity={1} />
                <DreiStars radius={100} depth={50} count={1000} factor={4} saturation={0} fade />

                {stars.map(star => {
                    const [x, y, z] = raDecToXYZ(star.ra ?? 0, star.dec ?? 0, 40);
                    return (
                        <mesh key={star.id} position={[x, y, z]} onClick={() => onSelectStar(star.id)}>
                            <sphereGeometry args={[0.5, 16, 16]} />
                            <meshBasicMaterial color="white" />
                        </mesh>
                    );
                })}

                <OrbitControls enablePan={!gpsActive} enableRotate={!gpsActive} enableZoom={!gpsActive} />

                {gpsActive && deviceAstronomy.ra && deviceAstronomy.dec && (
                    <CameraMover ra={deviceAstronomy.ra} dec={deviceAstronomy.dec} radius={40} />
                )}
            </Canvas>
        </div>
    );
}
