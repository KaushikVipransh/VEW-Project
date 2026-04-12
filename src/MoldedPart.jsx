import { useState, useEffect } from "react";
import { Decal, RenderTexture, Text } from "@react-three/drei";
import * as THREE from "three";
import { wrap } from "comlink";

/**
 * MoldedPart — three independent meshes tagged with userData.explodePart
 * so App.jsx can find them via capRef.current.traverse().
 *
 * Parts start assembled at y=0 (blue band at its natural offset).
 * App.jsx drives the explosion by animating each mesh's position.y via GSAP.
 *
 * onModelReady fires from a useEffect AFTER the meshes are committed
 * to the Three.js scene, preventing the ref-null timing race.
 */
const MoldedPart = ({
  onModelReady,
  blackPlasticMaterial,
  blueBandMaterial,
}) => {
  const [geos, setGeos] = useState(null); // { body, ridges, top }

  useEffect(() => {
    let worker;
    const load = async () => {
      worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
      const api = wrap(worker);
      const result = await api.generateGeometry(); // { body, top }

      const buildBuf = (raw) => {
        const buf = new THREE.BufferGeometry();
        for (const key in raw.attributes) {
          const a = raw.attributes[key];
          buf.setAttribute(
            key,
            new THREE.BufferAttribute(new Float32Array(a.array), a.itemSize)
          );
        }
        if (raw.index) {
          buf.setIndex(new THREE.BufferAttribute(new Uint32Array(raw.index.array), 1));
        }
        buf.computeVertexNormals();
        return buf;
      };

      setGeos({
        body:   buildBuf(result.body),
        ridges: buildBuf(result.ridges),
        top:    buildBuf(result.top),
      });
      // NOTE: Do NOT call onModelReady() here — setGeos is async.
      // The meshes haven't committed yet at this point.
      worker.terminate();
    };

    load();
    return () => { if (worker) worker.terminate(); };
  }, [onModelReady]);

  // Fire onModelReady only after geos has committed and meshes exist in the scene.
  useEffect(() => {
    if (geos && onModelReady) onModelReady();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geos]); // intentionally omit onModelReady to avoid loops

  if (!geos) return null;

  return (
    <group>

      {/* Top Cap — userData tag lets App.jsx find this mesh via capRef.traverse() */}
      <mesh
        userData={{ explodePart: 'top' }}
        castShadow
        receiveShadow
        geometry={geos.top}
        material={blackPlasticMaterial}
        position={[0, 0, 0]}
      />

      {/* Main Body (skirt + bar + latch, no ridges) — stays at y=0 */}
      <mesh
        userData={{ explodePart: 'body' }}
        castShadow
        receiveShadow
        geometry={geos.body}
        material={blackPlasticMaterial}
        position={[0, 0, 0]}
      >
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

      {/* Knurling Ridge Ring — animates to intermediate Y (between body and top) */}
      <mesh
        userData={{ explodePart: 'ridges' }}
        castShadow
        receiveShadow
        geometry={geos.ridges}
        material={blackPlasticMaterial}
        position={[0, 0, 0]}
      />

      {/* Blue Band — preserved local offset; GSAP explosion animates y DOWN */}
      <mesh
        userData={{ explodePart: 'band' }}
        castShadow
        receiveShadow
        material={blueBandMaterial}
        position={[0, -0.35, 0]}
      >
        <cylinderGeometry args={[2.27, 2.27, 0.42, 80, 1]} />
      </mesh>

    </group>
  );
};

export default MoldedPart;