"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { DoubleSide } from "three";
import type { Mesh, Object3D } from "three";
import { bodyComposition, clampBodyValue } from "./bodyMath";

type Avatar3DProps = {
  heightCm: number;
  weightKg: number;
  bodyFat: number;
};

const BODY_MODEL = "/models/parametric-body.glb?v=4";

function setMorph(mesh: Mesh, name: string, value: number) {
  const index = mesh.morphTargetDictionary?.[name];
  if (index === undefined || !mesh.morphTargetInfluences) return;
  mesh.morphTargetInfluences[index] = clampBodyValue(value, 0, 1);
}

type ClothingShape = {
  heightScale: number;
  width: number;
  depth: number;
};

function Fabric() {
  return <meshStandardMaterial color="#111517" roughness={0.88} side={DoubleSide} />;
}

function BoxerBriefs({ heightScale, width, depth }: ClothingShape) {
  return (
    <group>
      <mesh position={[0, 0.79 * heightScale, 0.055]} scale={[0.185 * width, 0.1 * heightScale, 0.14 * depth]} castShadow>
        <cylinderGeometry args={[0.92, 1, 2, 48, 3, true]} />
        <Fabric />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={`leg-${side}`}
          position={[side * 0.095 * width, 0.655 * heightScale, 0.055]}
          scale={[0.1 * width, 0.06 * heightScale, 0.13 * depth]}
          castShadow
        >
          <cylinderGeometry args={[1, 0.9, 2, 36, 2, true]} />
          <Fabric />
        </mesh>
      ))}
      <mesh position={[0, 0.887 * heightScale, 0.055]} scale={[0.177 * width, 0.012 * heightScale, 0.137 * depth]} castShadow>
        <cylinderGeometry args={[1, 1, 2, 48, 1, true]} />
        <meshStandardMaterial color="#252b2e" roughness={0.78} side={DoubleSide} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={`hem-${side}`}
          position={[side * 0.095 * width, 0.598 * heightScale, 0.055]}
          scale={[0.091 * width, 0.008 * heightScale, 0.119 * depth]}
          castShadow
        >
          <cylinderGeometry args={[1, 1, 2, 36, 1, true]} />
          <meshStandardMaterial color="#252b2e" roughness={0.78} side={DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function HumanModel({ heightCm, weightKg, bodyFat }: Avatar3DProps) {
  const { scene } = useGLTF(BODY_MODEL);
  const avatar = useMemo(() => clone(scene), [scene]);
  const composition = bodyComposition(heightCm, weightKg, bodyFat);

  const morphs = useMemo(() => {
    const neutralHeight = 175;
    const neutralMuscle = 0.38;
    const neutralFat = 18;
    return {
      HeightUp: (heightCm - neutralHeight) / (210 - neutralHeight),
      HeightDown: (neutralHeight - heightCm) / (neutralHeight - 145),
      MuscleUp: (composition.muscle - neutralMuscle) / (1 - neutralMuscle),
      MuscleDown: (neutralMuscle - composition.muscle) / neutralMuscle,
      FatUp: (bodyFat - neutralFat) / (45 - neutralFat),
      FatDown: (neutralFat - bodyFat) / (neutralFat - 5),
    };
  }, [bodyFat, composition.muscle, heightCm]);

  const clothing = useMemo(() => {
    const heightScale = clampBodyValue(heightCm / 175, 0.83, 1.2);
    return {
      heightScale,
      width: 1 + composition.fat * 0.18 + composition.mass * 0.07 + composition.muscle * 0.03,
      depth: 1 + composition.fat * 0.25 + composition.mass * 0.06,
    };
  }, [composition.fat, composition.mass, composition.muscle, heightCm]);

  useEffect(() => {
    avatar.traverse((object: Object3D) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) return;
      for (const [name, value] of Object.entries(morphs)) setMorph(mesh, name, value);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }, [avatar, morphs]);

  return (
    <group>
      <primitive object={avatar} />
      <BoxerBriefs {...clothing} />
    </group>
  );
}

export default function Avatar3D(props: Avatar3DProps) {
  return (
    <div className="avatar-canvas" aria-label="Interaktywny parametryczny model ludzkiego ciała 3D">
      <Canvas shadows camera={{ position: [0, 0.98, 4.6], fov: 27, near: 0.1, far: 30 }} dpr={[1, 1.7]}>
        <ambientLight intensity={1.35} />
        <directionalLight position={[3.5, 5.5, 4]} intensity={3.4} color="#ffe2c4" castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 3, 2]} intensity={1.9} color="#91a8bd" />
        <pointLight position={[0, 1, -3]} intensity={8} color="#d76f39" distance={7} />
        <Suspense fallback={null}>
          <HumanModel {...props} />
        </Suspense>
        <ContactShadows position={[0, 0, 0]} opacity={0.62} scale={3.5} blur={2.1} far={2.6} color="#000000" />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.07}
          minDistance={2.6}
          maxDistance={6.2}
          minPolarAngle={Math.PI * 0.28}
          maxPolarAngle={Math.PI * 0.59}
          target={[0, 0.86, 0]}
        />
      </Canvas>
      <div className="model-gesture"><span>↔</span> przeciągnij, aby obracać <i>•</i> kółko lub gest, aby przybliżyć</div>
      <div className="model-quality"><i /> anatomia MakeHuman · 6 deformacji ciała</div>
    </div>
  );
}

useGLTF.preload(BODY_MODEL);
