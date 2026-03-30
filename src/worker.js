import { Evaluator, Brush, ADDITION, SUBTRACTION } from "three-bvh-csg";
import * as THREE from "three";
import { expose } from "comlink";

const generateGeometry = (serializedTextGeo) => {
  const textGeo = new THREE.BufferGeometry();
  for (const key in serializedTextGeo.attributes) {
    textGeo.setAttribute(
      key,
      new THREE.BufferAttribute(
        serializedTextGeo.attributes[key].array,
        serializedTextGeo.attributes[key].itemSize
      )
    );
  }
  if (serializedTextGeo.index) {
    textGeo.setIndex(new THREE.BufferAttribute(serializedTextGeo.index.array, 1));
  }

  const csgEvaluator = new Evaluator();

  // 1. THE BASE (Thick & Knurled Foundation)
  const base = new Brush(new THREE.CylinderGeometry(2.2, 2.2, 0.7, 128));
  base.updateMatrixWorld();

  let knurledBase = base;
  const baseRidgeCount = 45; 
  for (let i = 0; i < baseRidgeCount; i++) {
    const angle = (i / baseRidgeCount) * Math.PI * 2;
    const ridge = new Brush(new THREE.BoxGeometry(0.12, 0.8, 0.12));
    ridge.position.set(Math.cos(angle) * 2.2, 0, Math.sin(angle) * 2.2);
    ridge.rotation.y = angle;
    ridge.updateMatrixWorld();
    knurledBase = csgEvaluator.evaluate(knurledBase, ridge, SUBTRACTION);
  }

  // 2. THE UPPER COMPONENT (The Ribbed Cap)
  // We start with a slightly rounded cylinder (tapered)
  const capBody = new Brush(new THREE.CylinderGeometry(0.9, 1.0, 0.8, 64));
  capBody.position.set(0.6, 0.75, 0); 
  capBody.updateMatrixWorld();

  // Create the wide vertical ribs seen in the reference
  let ribbedCap = capBody;
  const ribCount = 12; // Fewer, thicker ribs like the photo
  for (let i = 0; i < ribCount; i++) {
    const angle = (i / ribCount) * Math.PI * 2;
    // We use a Cylinder to subtract "U-shaped" grooves
    const groove = new Brush(new THREE.CylinderGeometry(0.15, 0.15, 0.9, 16));
    groove.position.set(
      0.6 + Math.cos(angle) * 0.95, 
      0.75, 
      Math.sin(angle) * 0.95
    );
    groove.updateMatrixWorld();
    ribbedCap = csgEvaluator.evaluate(ribbedCap, groove, SUBTRACTION);
  }

  // Add a small "Top Fillet" to round the top edge of the cap
  const capTopFillet = new Brush(new THREE.TorusGeometry(0.85, 0.1, 16, 64));
  capTopFillet.position.set(0.6, 1.1, 0);
  capTopFillet.rotation.x = Math.PI / 2;
  capTopFillet.updateMatrixWorld();
  ribbedCap = csgEvaluator.evaluate(ribbedCap, capTopFillet, ADDITION);

  // 3. THE STRAP (Extreme Edge)
  const strapPoints = [
    new THREE.Vector3(-1.2, 0.35, 1.4),   
    new THREE.Vector3(-2.0, 1.4, 1.2),   
    new THREE.Vector3(-2.4, 2.0, 0),     
    new THREE.Vector3(-2.0, 1.4, -1.2),  
    new THREE.Vector3(-1.2, 0.35, -1.4)  
  ];
  const strapCurve = new THREE.CatmullRomCurve3(strapPoints);
  const strapGeo = new THREE.TubeGeometry(strapCurve, 64, 0.18, 16, false);
  const strap = new Brush(strapGeo);
  strap.updateMatrixWorld();

  // 4. THE CONNECTION MOUNDS
  const moundGeo = new THREE.CylinderGeometry(0.18, 0.35, 0.2, 32);
  const moundFront = new Brush(moundGeo);
  moundFront.position.set(-1.2, 0.4, 1.4);
  moundFront.updateMatrixWorld();
  const moundBack = new Brush(moundGeo);
  moundBack.position.set(-1.2, 0.4, -1.4);
  moundBack.updateMatrixWorld();

  // 5. THE BRANDING (VEW)
  const textBrush = new Brush(textGeo);
  textBrush.scale.set(0.6, 0.6, 0.6); // Smaller scale to fit the ribbed top
  textBrush.position.set(0.6, 1.15, 0);
  textBrush.rotation.x = -Math.PI / 2;
  textBrush.updateMatrixWorld();

  // --- ASSEMBLY ---
  let result = knurledBase;
  result = csgEvaluator.evaluate(result, ribbedCap, ADDITION);
  result = csgEvaluator.evaluate(result, strap, ADDITION);
  result = csgEvaluator.evaluate(result, moundFront, ADDITION);
  result = csgEvaluator.evaluate(result, moundBack, ADDITION);
  result = csgEvaluator.evaluate(result, textBrush, SUBTRACTION);

  return result.geometry;
};

expose({ generateGeometry });