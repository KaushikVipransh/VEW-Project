import {
  useRef,
  useEffect,
  useState,
  useMemo,
  Suspense,
  lazy
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
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import AboutSection from "./AboutSection";

const MoldedPart = lazy(() => import("./MoldedPart"));

gsap.registerPlugin(ScrollTrigger);

const Scene = ({
  capRef,
  heroTitleRef,
  heroSublineRef,
  onModelReady,
  isModelReady,
}) => {
  const {
    camera,
    viewport
  } = useThree();

  useEffect(() => {
    const cap = capRef.current;
    const title = heroTitleRef.current;
    const subline = heroSublineRef.current;

    if (
      isModelReady &&
      cap &&
      title &&
      subline
    ) {
      const tl = gsap.timeline();
      tl.set(cap.position, {
        x: 0,
        y: -0.5
      });
      tl.set(cap.rotation, {
        y: 0
      });
      tl.to(cap.rotation, {
          y: Math.PI * 2,
          duration: 1.5,
          ease: "power2.inOut",
        })
        .to(
          cap.position, {
            x: -3.5,
            duration: 1.5,
            ease: "power2.inOut",
          },
          "-=1"
        )
        .to(
          [title, subline], {
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
        .to(cap.position, {
          x: viewport.width / 2.5,
          y: -1,
        })
        .to(cap.rotation, {
            y: Math.PI / 1.5,
          }, "<")
        .to(cap.scale, {
          x: 1.2,
          y: 1.2,
          z: 1.2,
        }, "<");
    }
  }, [isModelReady, capRef, heroTitleRef, heroSublineRef, camera, viewport.width]);

  const blackPlastic = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#121212", // Deep Obsidian/Charcoal (Black Plastic)
    roughness: 0.6, // High roughness for that "matte" feel
    metalness: 0.0, // Real plastic has ZERO metalness
    ior: 1.45, // Standard Index of Refraction for Plastic
    reflectivity: 0.5, // How much light it reflects at 90 degrees

    // CLEARCOAT: This is the "magic" for the black background.
    // It adds a thin glossy layer on top of the matte plastic.
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,

    // SHEEN: Gives it that soft "dusty" feel on the edges
    sheen: 1.0,
    sheenRoughness: 0.5,
    sheenColor: "#ffffff",

    envMapIntensity: 1.5, // Ensures the Environment map "highlights" the ribs
  }), []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 0]} intensity={1} />
      <Environment preset="studio" />
      <ContactShadows opacity={0.4} scale={10} blur={2} far={4.5} />
      {/* <SpotLight
        castShadow
        position={[5, 10, 5]}
        intensity={150}
        angle={0.6}
        penumbra={1}
      />
      <pointLight position={[0, 2, 0]} intensity={1} color="#ffffff" /> */}
      
      <group ref={capRef} position={[0, -0.8, 0]} scale={0.8} dispose={null}>
        <Suspense fallback={<Text>Loading...</Text>}>
          <MoldedPart material={blackPlastic} onModelReady={onModelReady} />
        </Suspense>
      </group>
    </>
  );
};

function App() {
  const capRef = useRef();
  const heroTitleRef = useRef();
  const heroSublineRef = useRef();
  const [isModelReady, setIsModelReady] = useState(false);

  const handleModelReady = () => {
    setIsModelReady(true);
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-screen h-screen">
        <Canvas
          shadows
          camera={{
            position: [0, 4, 12],
            fov: 30
          }}
          gl={{
            alpha: true,
            antialias: true
          }}
        >
          <Scene
            capRef={capRef}
            heroTitleRef={heroTitleRef}
            heroSublineRef={heroSublineRef}
            onModelReady={handleModelReady}
            isModelReady={isModelReady}
          />
        </Canvas>
      </div>

      {isModelReady && (
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
      )}
    </>
  );
}


export default App;
