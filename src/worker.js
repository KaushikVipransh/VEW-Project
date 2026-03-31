import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { expose } from "comlink";

const generateGeometry = () => {
  const geos = [];

  // ════════════════════════════════════════════════
  // 1. BASE SKIRT — wide, short cylinder
  //    Radius: 2.20  Height: 1.20  (y: 0 → 1.20)
  // ════════════════════════════════════════════════
  const baseGeo = new THREE.CylinderGeometry(2.20, 2.20, 1.20, 80, 1);
  baseGeo.translate(0, 0.60, 0);
  geos.push(baseGeo);

  const baseBotCap = new THREE.CircleGeometry(2.20, 80);
  baseBotCap.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  baseBotCap.translate(0, 0.005, 0);
  geos.push(baseBotCap);

  const baseTopCap = new THREE.CircleGeometry(2.20, 80);
  baseTopCap.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  baseTopCap.translate(0, 1.195, 0);
  geos.push(baseTopCap);

  // ════════════════════════════════════════════════
  // 2. KNURLING — 64 ridges on base side wall
  // ════════════════════════════════════════════════
  const ridgeCount = 64;
  const ridgeGeos = [];
  for (let i = 0; i < ridgeCount; i++) {
    const angle = (i / ridgeCount) * Math.PI * 2;
    const geo = new THREE.BoxGeometry(0.055, 1.08, 0.075);
    const m = new THREE.Matrix4();
    m.makeRotationY(-angle);
    m.setPosition(
      Math.cos(angle) * 2.238,
      0.60,
      Math.sin(angle) * 2.238
    );
    geo.applyMatrix4(m);
    ridgeGeos.push(geo);
  }
  geos.push(BufferGeometryUtils.mergeGeometries(ridgeGeos));

  // ════════════════════════════════════════════════
  // 3. SCREW CAP — left of center on top of base
  //    Center x=-0.80, y: 1.20 → 1.75
  //    Radius: 0.85  Height: 0.55
  // ════════════════════════════════════════════════
  const screwX = -0.80;
  const screwY  = 1.475;
  const screwR  = 0.85;
  const screwH  = 0.55;

  const screwBody = new THREE.CylinderGeometry(screwR, screwR, screwH, 48, 1);
  screwBody.translate(screwX, screwY, 0);
  geos.push(screwBody);

 

  // Screw cap knurling — 28 ridges
  const screwRidgeCount = 28;
  const screwRidgeGeos = [];
  for (let i = 0; i < screwRidgeCount; i++) {
    const angle = (i / screwRidgeCount) * Math.PI * 2;
    const geo = new THREE.BoxGeometry(0.048, screwH, 0.065);
    const m = new THREE.Matrix4();
    m.makeRotationY(-angle);
    m.setPosition(
      screwX + Math.cos(angle) * (screwR + 0.02),
      screwY,
      Math.sin(angle) * (screwR + 0.02)
    );
    geo.applyMatrix4(m);
    screwRidgeGeos.push(geo);
  }
  geos.push(BufferGeometryUtils.mergeGeometries(screwRidgeGeos));

  // ════════════════════════════════════════════════
  // 4. BAR / STAND — at the RIGHT EDGE of the base
  //    Sits flush with the outer rim at x=+2.20
  //    Width: 0.30  Depth: 0.55  Height: 0.70
  //    y: 1.20 → 1.90
  //    Centered on x so its outer face aligns with base edge
  // ════════════════════════════════════════════════
  const barW = 0.36;
  const barD = 0.55;
  const barH = 0.72;
  // Place bar center so its OUTER face sits at x = 2.20 (base edge)
  const barX = 2.20 - barW / 2; // = 2.02
  const barYCenter = 1.20 + barH / 2;

  const barGeo = new THREE.BoxGeometry(barW, barH, barD);
  barGeo.translate(barX, barYCenter, 0);
  geos.push(barGeo);

  // Small fillet mount where bar meets base top
  const barMountGeo = new THREE.BoxGeometry(barW + 0.14, 0.08, barD + 0.14);
  barMountGeo.translate(barX, 1.24, 0);
  geos.push(barMountGeo);

  // ════════════════════════════════════════════════
  // 5. LATCH CLIP — small bump, opposite side from bar
  // ════════════════════════════════════════════════
  const latchBody = new THREE.BoxGeometry(0.28, 0.20, 0.48);
  latchBody.translate(-2.30, 0.80, 0);
  geos.push(latchBody);

  const latchTab = new THREE.BoxGeometry(0.14, 0.10, 0.32);
  latchTab.translate(-2.46, 0.80, 0.18);
  geos.push(latchTab);

  // ════════════════════════════════════════════════
  // 6. MERGE & CENTER
  // ════════════════════════════════════════════════
  const merged = BufferGeometryUtils.mergeGeometries(geos, false);
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  const midY = (merged.boundingBox.max.y + merged.boundingBox.min.y) / 2;
  merged.translate(0, -midY, 0);

  return merged;
};

expose({ generateGeometry });