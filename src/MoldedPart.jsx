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
      buf.center(); 

      setGeometry(buf);
      if (onModelReady) onModelReady();
      worker.terminate();
    };

    load();
    return () => { if (worker) worker.terminate(); };
  }, [onModelReady]);

  if (!geometry) return null;

  return (
    <group {...props}>
      <mesh castShadow receiveShadow geometry={geometry} material={blackPlasticMaterial}>
        <Decal
          position={[0, -0.35, 2.22]}
          rotation={[0, 0, 0]}
          scale={[1.6, 0.32, 0.32]}
        >
          <meshPhysicalMaterial
            transparent
            polygonOffset
            polygonOffsetFactor={-1}
            roughness={0.8}
            color="#050505"
          >
            <RenderTexture attach="map">
              <Text fontSize={2.4} color="white" fontWeight="bold" letterSpacing={0.10}>
                VEW
              </Text>
            </RenderTexture>
          </meshPhysicalMaterial>
        </Decal>
      </mesh>

      <mesh castShadow receiveShadow material={blueBandMaterial} position={[0.13, -0.35, 0]}>
        <cylinderGeometry args={[2.27, 2.27, 0.42, 80, 1]} />
      </mesh>
    </group>
  );
};

export default MoldedPart;