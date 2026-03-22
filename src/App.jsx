import {
  useRef,
  useEffect,
  useMemo
} from "react";
import Overlay from "./Overlay";
import gsap from "gsap";
import {
  ScrollTrigger
} from "gsap/ScrollTrigger";
import {
  Canvas,
  useThree
} from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  SpotLight,
} from "@react-three/drei";
import * as THREE from "three";
import AboutSection from "./AboutSection";

gsap.registerPlugin(ScrollTrigger);

const Scene = ({
  capRef,
  heroTitleRef,
  heroSublineRef
}) => {
  const curve = useMemo(() => {
    const points = [
      new THREE.Vector3(0, 0.6, 0),
      new THREE.Vector3(-0.5, 1.8, 0),
      new THREE.Vector3(-1.5, 2.8, 0.2),
      new THREE.Vector3(-2.2, 1.6, 0),
      new THREE.Vector3(-0.1, 0.6, 0),
    ];
    return new THREE.CatmullRomCurve3(points, true);
  }, []);

  const shape = useMemo(() => {
    const rect = new THREE.Shape();
    const width = 0.3;
    const height = 0.02;
    rect.moveTo(-width / 2, -height / 2);
    rect.lineTo(width / 2, -height / 2);
    rect.lineTo(width / 2, height / 2);
    rect.lineTo(-width / 2, height / 2);
    rect.lineTo(-width / 2, -height / 2);
    return rect;
  }, []);

  const extrudeSettings = useMemo(() => {
    return {
      steps: 100,
      bevelEnabled: false,
      extrudePath: curve,
    };
  }, [curve]);

  const {
    camera,
    viewport
  } = useThree();

  useEffect(() => {
    if (capRef.current && heroTitleRef.current && heroSublineRef.current) {
      const tl = gsap.timeline();

      tl.set(capRef.current.position, {
        x: 0,
        y: -0.5
      });
      tl.set(capRef.current.rotation, {
        y: 0
      });

      tl.to(capRef.current.rotation, {
          y: Math.PI * 2,
          duration: 1.5,
          ease: "power2.inOut",
        })
        .to(
          capRef.current.position, {
            x: -3.5,
            duration: 1.5,
            ease: "power2.inOut",
          },
          "-=1"
        )
        .to(
          [heroTitleRef.current, heroSublineRef.current], {
            opacity: 1,
            duration: 1,
            stagger: 0.2,
          },
          "-=1"
        );

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#about",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      scrollTl
        .to(capRef.current.position, {
          x: viewport.width / 2.5,
          y: -1,
        })
        .to(
          capRef.current.rotation, {
            y: Math.PI / 1.5,
          },
          "<"
        )
        .to(
          capRef.current.scale, {
            x: 1.2,
            y: 1.2,
            z: 1.2,
          },
          "<"
        );
    }
  }, [
    capRef,
    heroTitleRef,
    heroSublineRef,
    camera,
    viewport.width,
  ]);

  return (
    <>
      <Environment preset="city" />
      <ContactShadows opacity={0.4} scale={10} blur={2} far={4.5} />
      <SpotLight castShadow position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <group
        ref={capRef}
        position={[0, -0.8, 0]}
        scale={0.8}
      >
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[2, 2, 1.2, 64]} />
          <meshPhysicalMaterial
            color="#e2e2e2"
            metalness={1}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
        <mesh receiveShadow castShadow position={[0, -0.6, 0]}>
          <cylinderGeometry args={[2.1, 2.1, 0.1, 64]} />
          <meshPhysicalMaterial
            color="#e2e2e2"
            metalness={1}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
        <mesh castShadow>
          <extrudeGeometry args={[shape, extrudeSettings]} />
          <meshStandardMaterial
            color={"#ffffff"}
            roughness={1}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh receiveShadow position={[-0.05, 0.6, 0]}>
          <boxGeometry args={[0.35, 0.08, 0.1]} />
          <meshStandardMaterial color="#111111" roughness={1} />
        </mesh>
      </group>
    </>
  );
};

function App() {
  const capRef = useRef();
  const heroTitleRef = useRef();
  const heroSublineRef = useRef();

  return (
    <>
      <div className="fixed top-0 left-0 w-screen h-screen">
        <Canvas
          shadows
          camera={{ position: [0, 4, 12], fov: 30 }}
          gl={{ alpha: true }}
        >
          <Scene
            capRef={capRef}
            heroTitleRef={heroTitleRef}
            heroSublineRef={heroSublineRef}
          />
        </Canvas>
      </div>

      <div className="relative z-10">
        <div className="relative h-screen">
          <Overlay
            heroTitleRef={heroTitleRef}
            heroSublineRef={heroSublineRef}
          />
        </div>
        <section id="about" className="h-[100vh]">
          <AboutSection />
        </section>
      </div>
    </>
  );
}

export default App;
