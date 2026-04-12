import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { expose } from "comlink";

// ─── Serialise a BufferGeometry so it can cross the Worker boundary ──────────
const serialize = (geo) => {
  geo.computeVertexNormals();
  const out = { attributes: {}, index: null };
  for (const key in geo.attributes) {
    const a = geo.attributes[key];
    out.attributes[key] = { array: Array.from(a.array), itemSize: a.itemSize };
  }
  if (geo.index) {
    out.index = { array: Array.from(geo.index.array) };
  }
  return out;
};

const generateGeometry = () => {

  // ══════════════════════════════════════════════════════════════
  // SHARED: compute the vertical midpoint of the full assembly
  // so every part can be centred around y=0.
  //
  // Assembly y-range (raw, before centering):
  //   bottom  = 0   (base skirt bottom)
  //   top     = 1.75 (screw-cap top, ~screwY + screwH/2)
  //   midY    ≈ 0.875
  // We subtract midY from every translate so all parts sit at y=0 assembled.
  // ══════════════════════════════════════════════════════════════
  const MID_Y = 0.875;

  // ────────────────────────────────────────────────────────────
  // PART 1 — BODY  (base skirt + knurling + bar + latch)
  // ────────────────────────────────────────────────────────────
  const bodyGeos = [];

  // Base skirt
  const baseGeo = new THREE.CylinderGeometry(2.20, 2.20, 1.20, 80, 1);
  baseGeo.translate(0, 0.60 - MID_Y, 0);
  bodyGeos.push(baseGeo);

  const baseBotCap = new THREE.CircleGeometry(2.20, 80);
  baseBotCap.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  baseBotCap.translate(0, 0.005 - MID_Y, 0);
  bodyGeos.push(baseBotCap);

  const baseTopCap = new THREE.CircleGeometry(2.20, 80);
  baseTopCap.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  baseTopCap.translate(0, 1.195 - MID_Y, 0);
  bodyGeos.push(baseTopCap);

  // Body knurling ridges — built SEPARATELY so they animate independently
  const ridgeGeoList = [];
  for (let i = 0; i < 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    const geo = new THREE.BoxGeometry(0.055, 1.08, 0.075);
    const m = new THREE.Matrix4();
    m.makeRotationY(-angle);
    m.setPosition(
      Math.cos(angle) * 2.238,
      0.60 - MID_Y,
      Math.sin(angle) * 2.238
    );
    geo.applyMatrix4(m);
    ridgeGeoList.push(geo);
  }
  const ridgeGeo = BufferGeometryUtils.mergeGeometries(ridgeGeoList);
  // (ridges are NOT pushed into bodyGeos — they get their own mesh)

  // Bar / stand
  const barW = 0.36, barD = 0.55, barH = 0.72;
  const barX = 2.20 - barW / 2;
  const barYCenter = 1.20 + barH / 2;
  const barGeo = new THREE.BoxGeometry(barW, barH, barD);
  barGeo.translate(barX, barYCenter - MID_Y, 0);
  bodyGeos.push(barGeo);

  const barMountGeo = new THREE.BoxGeometry(barW + 0.14, 0.08, barD + 0.14);
  barMountGeo.translate(barX, 1.24 - MID_Y, 0);
  bodyGeos.push(barMountGeo);

  // Latch clip
  const latchBody = new THREE.BoxGeometry(0.28, 0.20, 0.48);
  latchBody.translate(-2.30, 0.80 - MID_Y, 0);
  bodyGeos.push(latchBody);

  const latchTab = new THREE.BoxGeometry(0.14, 0.10, 0.32);
  latchTab.translate(-2.46, 0.80 - MID_Y, 0.18);
  bodyGeos.push(latchTab);

  const bodyGeo = BufferGeometryUtils.mergeGeometries(bodyGeos, false);

  // ────────────────────────────────────────────────────────────
  // PART 2 — TOP CAP  (screw cap + knurling)
  // ────────────────────────────────────────────────────────────
  const topGeos = [];

  const screwX = -0.80;
  const screwY  = 1.475;
  const screwR  = 0.85;
  const screwH  = 0.55;

  const screwBody = new THREE.CylinderGeometry(screwR, screwR, screwH, 48, 1);
  screwBody.translate(screwX, screwY - MID_Y, 0);
  topGeos.push(screwBody);

  const screwRidgeGeos = [];
  for (let i = 0; i < 28; i++) {
    const angle = (i / 28) * Math.PI * 2;
    const geo = new THREE.BoxGeometry(0.048, screwH, 0.065);
    const m = new THREE.Matrix4();
    m.makeRotationY(-angle);
    m.setPosition(
      screwX + Math.cos(angle) * (screwR + 0.02),
      screwY - MID_Y,
      Math.sin(angle) * (screwR + 0.02)
    );
    geo.applyMatrix4(m);
    screwRidgeGeos.push(geo);
  }
  topGeos.push(BufferGeometryUtils.mergeGeometries(screwRidgeGeos));

  const topGeo = BufferGeometryUtils.mergeGeometries(topGeos, false);

  // ────────────────────────────────────────────────────────────
  // PART 3 — BLUE BAND
  // This stays as a R3F <cylinderGeometry> primitive in MoldedPart.
  // Its local position is [0, -0.35, 0] which, in the centred
  // coordinate space, means it sits at the band groove on the body.
  // We return nothing for it here.
  // ────────────────────────────────────────────────────────────

  return {
    body:   serialize(bodyGeo),
    ridges: serialize(ridgeGeo),
    top:    serialize(topGeo),
    // blue band is a Three.js primitive in MoldedPart
  };
};

expose({ generateGeometry });