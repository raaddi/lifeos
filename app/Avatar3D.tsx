"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

type Avatar3DProps = {
  modelUrl: string;
  compact?: boolean;
};

function HumanModel({ modelUrl }: Avatar3DProps) {
  const { scene } = useGLTF(modelUrl);
  const avatar = useMemo(() => clone(scene), [scene]);

  return <primitive object={avatar} position={[0, 0, 0]} rotation={[0, Math.PI, 0]} />;
}

export default function Avatar3D({ modelUrl, compact = false }: Avatar3DProps) {
  return (
    <div className={`avatar-canvas${compact ? " avatar-canvas-compact" : ""}`} aria-label="Interaktywny model 3D postaci">
      <Canvas shadows camera={{ position: [0, 1.05, compact ? 4.65 : 4.25], fov: 28, near: 0.1, far: 30 }} dpr={[1, compact ? 1.25 : 1.7]}>
        <ambientLight intensity={1.55} />
        <directionalLight position={[3.5, 5.5, 4]} intensity={3.2} color="#ffe4c8" castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 3, 2]} intensity={2.1} color="#91a8bd" />
        <pointLight position={[0, 1, -3]} intensity={9} color="#d76f39" distance={7} />
        <Suspense fallback={null}>
          <HumanModel modelUrl={modelUrl} />
        </Suspense>
        <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={4} blur={2.3} far={3} color="#000000" />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={!compact}
          enableRotate={!compact}
          enableDamping
          dampingFactor={0.07}
          minDistance={2.5}
          maxDistance={6.5}
          minPolarAngle={Math.PI * 0.29}
          maxPolarAngle={Math.PI * 0.59}
          target={[0, 0.88, 0]}
        />
      </Canvas>
      {!compact && <div className="model-gesture"><span>↔</span> przeciągnij, aby obracać <i>•</i> kółko lub gest, aby przybliżyć</div>}
      {!compact && <div className="model-quality"><i /> model zapisany w aplikacji · działa offline</div>}
    </div>
  );
}
