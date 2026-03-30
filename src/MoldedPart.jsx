import { useState, useEffect } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { wrap } from "comlink";

const MoldedPart = ({ onModelReady, ...props }) => {
  const [geometry, setGeometry] = useState(null);
  const [textGeo, setTextGeo] = useState(null);

  useEffect(() => {
    if (!textGeo) return;

    const worker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });
    const { generateGeometry } = wrap(worker);

    const serializedTextGeo = {
      attributes: {
        position: textGeo.attributes.position.clone(),
        normal: textGeo.attributes.normal.clone(),
        uv: textGeo.attributes.uv.clone(),
      },
      index: textGeo.index ? textGeo.index.clone() : null,
    };

    generateGeometry(serializedTextGeo).then((g) => {
      const bufferGeometry = new THREE.BufferGeometry();
      for (const key in g.attributes) {
        bufferGeometry.setAttribute(
          key,
          new THREE.BufferAttribute(g.attributes[key].array, g.attributes[key].itemSize)
        );
      }
      if (g.index) {
        bufferGeometry.setIndex(new THREE.BufferAttribute(g.index.array, 1));
      }
      
      bufferGeometry.computeVertexNormals();
      setGeometry(bufferGeometry);
      if (onModelReady) onModelReady();
      
      worker.terminate();
    });
  }, [textGeo, onModelReady]);

  return (
    <>
      <Text
        fontSize={0.2}
        position={[100, 100, 100]}
        onSync={(mesh) => setTextGeo(mesh.geometry)}
      >
        VEW
      </Text>

      {geometry && (
        <mesh castShadow receiveShadow geometry={geometry} {...props}>
          
        </mesh>
      )}
    </>
  );
};

export default MoldedPart;