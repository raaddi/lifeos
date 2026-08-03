"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { bodyComposition, clampBodyValue } from "./bodyMath";

type Avatar3DProps = {
  heightCm: number;
  weightKg: number;
  bodyFat: number;
};

function HumanModel({ heightCm, weightKg, bodyFat }: Avatar3DProps) {
  const body = bodyComposition(heightCm, weightKg, bodyFat);
  const heightScale = clampBodyValue(heightCm / 175, 0.72, 1.25);
  const shoulder = 1 + body.muscle * 0.26 + body.mass * 0.08;
  const chestDepth = 1 + body.muscle * 0.18 + body.fat * 0.16;
  const waist = 1 + body.fat * 0.46 + body.mass * 0.1 - body.muscle * 0.05;
  const arm = 1 + body.muscle * 0.52 + body.fat * 0.1;
  const forearm = 1 + body.muscle * 0.34 + body.fat * 0.08;
  const thigh = 1 + body.muscle * 0.4 + body.fat * 0.2;
  const calf = 1 + body.muscle * 0.28 + body.fat * 0.1;
  const hip = 1 + body.fat * 0.25 + body.mass * 0.08;
  const skin = "#b98769";
  const skinLight = "#c79576";
  const cloth = "#242a26";
  const clothLight = "#313932";
  const accent = "#d8733a";

  return (
    <group scale={[heightScale, heightScale, heightScale]} position={[0, -0.05, 0]}>
      <mesh position={[0, 4.18, 0]} scale={[shoulder, 1, chestDepth]} castShadow>
        <capsuleGeometry args={[0.68, 1.18, 10, 20]} />
        <meshStandardMaterial color={cloth} roughness={0.7} metalness={0.02} />
      </mesh>

      <mesh position={[0, 3.36, 0.02]} scale={[waist, 0.95, waist]} castShadow>
        <capsuleGeometry args={[0.48, 0.62, 10, 20]} />
        <meshStandardMaterial color={clothLight} roughness={0.74} />
      </mesh>

      <mesh position={[0, 2.83, 0]} scale={[hip, 0.9, 0.94 + body.fat * 0.2]} castShadow>
        <capsuleGeometry args={[0.54, 0.34, 8, 18]} />
        <meshStandardMaterial color="#1d221f" roughness={0.8} />
      </mesh>

      <mesh position={[0, 5.25, 0]} castShadow>
        <cylinderGeometry args={[0.23, 0.29, 0.45, 20]} />
        <meshStandardMaterial color={skin} roughness={0.64} />
      </mesh>
      <mesh position={[0, 5.87, 0]} scale={[0.92 + body.fat * 0.07, 1.08, 0.94]} castShadow>
        <capsuleGeometry args={[0.42, 0.56, 10, 24]} />
        <meshStandardMaterial color={skinLight} roughness={0.62} />
      </mesh>
      <mesh position={[0, 6.22, -0.04]} scale={[1.03, 0.62, 1.02]} castShadow>
        <sphereGeometry args={[0.45, 24, 18]} />
        <meshStandardMaterial color="#1e1c19" roughness={0.86} />
      </mesh>
      <mesh position={[-0.15, 5.97, 0.39]}><sphereGeometry args={[0.034, 12, 12]} /><meshStandardMaterial color="#1a1715" /></mesh>
      <mesh position={[0.15, 5.97, 0.39]}><sphereGeometry args={[0.034, 12, 12]} /><meshStandardMaterial color="#1a1715" /></mesh>
      <mesh position={[0, 5.76, 0.43]} scale={[1.3, 0.35, 0.45]}><sphereGeometry args={[0.07, 14, 10]} /><meshStandardMaterial color="#7f4d43" roughness={0.8} /></mesh>

      {[-1, 1].map((side) => (
        <group key={`arm-${side}`}>
          <mesh position={[side * (0.82 * shoulder), 4.72, 0]} scale={[1 + body.muscle * 0.25, 0.9, 1]} castShadow>
            <sphereGeometry args={[0.31, 18, 14]} />
            <meshStandardMaterial color={cloth} roughness={0.7} />
          </mesh>
          <mesh position={[side * (1.03 * shoulder), 3.95, 0]} rotation={[0, 0, side * -0.08]} scale={[arm, 1, arm]} castShadow>
            <capsuleGeometry args={[0.2, 0.92, 8, 18]} />
            <meshStandardMaterial color={skin} roughness={0.65} />
          </mesh>
          <mesh position={[side * (1.11 * shoulder), 2.88, 0.02]} rotation={[0, 0, side * 0.02]} scale={[forearm, 1, forearm]} castShadow>
            <capsuleGeometry args={[0.16, 0.9, 8, 18]} />
            <meshStandardMaterial color={skinLight} roughness={0.65} />
          </mesh>
          <mesh position={[side * (1.12 * shoulder), 2.18, 0.05]} scale={[0.75, 1.15, 0.55]} castShadow>
            <capsuleGeometry args={[0.17, 0.28, 8, 14]} />
            <meshStandardMaterial color={skinLight} roughness={0.65} />
          </mesh>
        </group>
      ))}

      {[-1, 1].map((side) => (
        <group key={`leg-${side}`}>
          <mesh position={[side * (0.39 * hip), 2.02, 0]} scale={[thigh, 1, thigh * (1 + body.fat * 0.1)]} castShadow>
            <capsuleGeometry args={[0.29, 1.03, 10, 18]} />
            <meshStandardMaterial color="#202521" roughness={0.8} />
          </mesh>
          <mesh position={[side * (0.39 * hip), 0.89, -0.015]} scale={[calf, 1, calf]} castShadow>
            <capsuleGeometry args={[0.22, 0.86, 10, 18]} />
            <meshStandardMaterial color={skin} roughness={0.68} />
          </mesh>
          <mesh position={[side * (0.39 * hip), 0.2, 0.13]} scale={[1, 0.52, 1.65]} castShadow>
            <capsuleGeometry args={[0.23, 0.38, 8, 16]} />
            <meshStandardMaterial color="#181c19" roughness={0.8} />
          </mesh>
          <mesh position={[side * (0.39 * hip), 0.12, 0.48]} scale={[1.05, 0.7, 1.75]} castShadow>
            <boxGeometry args={[0.38, 0.2, 0.46]} />
            <meshStandardMaterial color="#d8d2c4" roughness={0.78} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 4.35, 0.62]} scale={[0.75 + body.muscle * 0.22, 0.05, 0.8]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
      </mesh>
    </group>
  );
}

export default function Avatar3D(props: Avatar3DProps) {
  return (
    <div className="avatar-canvas" aria-label="Interaktywny model 3D postaci">
      <Canvas shadows camera={{ position: [0, 3.3, 9.2], fov: 33, near: 0.1, far: 50 }} dpr={[1, 1.75]}>
        <ambientLight intensity={1.25} />
        <directionalLight position={[4, 8, 6]} intensity={2.6} color="#ffe0bd" castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-5, 4, 2]} intensity={1.7} color="#8aa6bd" />
        <pointLight position={[0, 2, -4]} intensity={18} color="#d76f39" distance={8} />
        <HumanModel {...props} />
        <ContactShadows position={[0, -0.08, 0]} opacity={0.55} scale={7} blur={2.5} far={4.5} color="#000000" />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={6.5}
          maxDistance={12}
          minPolarAngle={Math.PI * 0.32}
          maxPolarAngle={Math.PI * 0.61}
          target={[0, 3.15, 0]}
        />
      </Canvas>
      <div className="model-gesture"><span>↔</span> przeciągnij, aby obrócić <i>•</i> kółko lub gest, aby przybliżyć</div>
    </div>
  );
}
