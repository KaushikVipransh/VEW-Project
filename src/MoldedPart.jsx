import { useState, useEffect } from "react";
import { Decal, RenderTexture, Text } from "@react-three/drei";
import * as THREE from "three";
import { wrap } from "comlink";

const MoldedPart = ({ onModelReady, blackPlasticMaterial, blueBandMaterial, ...props }) => {
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    let worker;
    const load = async () => {
      worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
      const api = wrap(worker);
      const g = await api.generateGeometry();

      const buf = new THREE.BufferGeometry();
      for (const key in g.attributes) {
        const a = g.attributes[key];
        buf.setAttribute(key, new THREE.BufferAttribute(new Float32Array(a.array), a.itemSize));
      }
      if (g.index) {
        buf.setIndex(new THREE.BufferAttribute(new Uint32Array(g.index.array), 1));
      }
      buf.computeVertexNormals();

      setGeometry(buf);
      if (onModelReady) onModelReady();
      worker.terminate();
    };

    load();
    return () => { if (worker) worker.terminate(); };
  }, [onModelReady]);

  if (!geometry) return null;

  /**
   * Blue band geometry:
   *   Base skirt: y 0→1.20, centered at y=0.60
   *   After centering (midY ≈ 0.95), base center in world ≈ y=-0.35
   *   Band sits at mid-height of base: world y ≈ -0.35
   *   Band height: 0.40, radius: 2.27 (just proud of base wall)
   */
  return (
    <group {...props}>
      {/* Main body — black plastic */}
      <mesh castShadow receiveShadow geometry={geometry} material={blackPlasticMaterial}>
        {/* Brand text decal on front face of base skirt */}
        <Decal
          position={[0, -0.35, 2.22]}
          rotation={[0, 0, 0]}
          scale={[1.6, 0.32, 0.32]}
        >
          <meshPhysicalMaterial
            transparent
            polygonOffset
            polygonOffsetFactor={-1}
            roughness={0.88}
            color="#080808"
          >
            <RenderTexture attach="map">
              <Text fontSize={2.4} color="white" fontWeight="bold" letterSpacing={0.10}>
                VEW
              </Text>
            </RenderTexture>
          </meshPhysicalMaterial>
        </Decal>
      </mesh>

      {/* Blue grip band — separate mesh, own material */}
      {/* Positioned at mid-height of base in world space */}
      <mesh castShadow receiveShadow material={blueBandMaterial} position={[0, -0.35, 0]}>
        <cylinderGeometry args={[2.27, 2.27, 0.42, 80, 1]} />
      </mesh>
    </group>
  );
};

export default MoldedPart;