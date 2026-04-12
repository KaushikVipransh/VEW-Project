import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * ExplodeLines — engineering-blueprint guide lines that appear between
 * the exploded cap parts during the product-section scroll animation.
 *
 * Must be placed INSIDE the capRef <group> so its coordinate space
 * matches the part meshes (same local y-axis = the explosion axis).
 *
 * Visual design:
 *   • Dashed lines in blueprint cyan  (#7ed4f7)
 *   • Vertical connector in each gap, drawn on LEFT and RIGHT sides of the cap
 *   • Short horizontal tick marks at each junction boundary
 *   • Opacity tied to explosion progress; invisible when assembled
 */

// ─── Part edge offsets (local space, relative to each mesh's position.y) ─────
// These match the geometry built in worker.js (MID_Y = 0.875 was subtracted).
const PART = {
  top: { bot: -0.275 },          // bottom edge of screw-cap cylinder
  ridges: { top: 0.54, bot: -0.54 }, // approximate half-height of knurling ring
  body: { top: 0.325, bot: -0.60 }, // skirt: raw top was 1.20-MID_Y=0.325, bottom -0.875+0.15≈-0.60
  band: { top: 0.21 },            // top edge of the blue band cylinder (h=0.42)
};

const GUIDE_X = 2.9;   // x-offset for guide lines (just outside cap rim radius ≈ 2.2)
const TICK_W = 0.28;  // half-width of horizontal tick marks
const MAX_EXPLODE = 3.0; // must match EXPLODE constant in App.jsx

// 3 gap slots × 6 line segments each (2 vertical + 4 ticks) = 18 segments
// Each segment = 2 vertices × 3 floats = 6 floats → 18 × 6 = 108 floats total
const TOTAL_PTS = 18 * 2; // 36 vertices
const posData = new Float32Array(TOTAL_PTS * 3); // 108 floats

const ExplodeLines = ({ capRef }) => {
  const segRef = useRef();  // THREE.LineSegments
  const matRef = useRef();  // THREE.LineDashedMaterial

  // Shared typed array — mutated every frame, never recreated
  const positions = useMemo(() => posData, []);

  useFrame(() => {
    const seg = segRef.current;
    const mat = matRef.current;
    if (!seg || !mat || !capRef?.current) return;

    // ── Find part meshes via userData tag ────────────────────────────────────
    let top = null, ridges = null, body = null, band = null;
    capRef.current.traverse((child) => {
      if (!child.isMesh) return;
      const p = child.userData.explodePart;
      if (p === 'top') top = child;
      if (p === 'ridges') ridges = child;
      if (p === 'body') body = child;
      if (p === 'band') band = child;
    });
    if (!top || !body || !band) return;

    const topY = top.position.y;
    const ridgesY = ridges ? ridges.position.y : 0;
    const bodyY = body.position.y;
    const bandY = band.position.y;

    // Explosion factor 0 (assembled) → 1 (fully exploded)
    const t = Math.min(Math.max(Math.abs(topY) / MAX_EXPLODE, 0), 1);
    mat.opacity = t * 0.65;

    // ── Three gap definitions ─────────────────────────────────────────────────
    // Each gap:  lo = top of lower part,  hi = bottom of upper part
    // When not yet separated (hi ≤ lo), draw degenerate zero-length segments.
    const gaps = [
      { // gap A: ridges-top → top-cap-bottom
        lo: ridges ? ridgesY + PART.ridges.top : bodyY + PART.body.top,
        hi: topY + PART.top.bot,
      },
      { // gap B: body-top → ridges-bottom (or body→top if no ridges)
        lo: bodyY + PART.body.top,
        hi: ridges ? ridgesY + PART.ridges.bot : topY + PART.top.bot,
      },
      { // gap C: band-top → body-bottom
        lo: bandY + PART.band.top,
        hi: bodyY + PART.body.bot,
      },
    ];

    // ── Write positions ───────────────────────────────────────────────────────
    let i = 0;
    const v = (x, y, z = 0) => {
      positions[i++] = x;
      positions[i++] = y;
      positions[i++] = z;
    };
    const zero = () => { positions[i++] = 0; positions[i++] = 0; positions[i++] = 0; };

    for (const { lo, hi } of gaps) {
      const open = hi > lo + 0.01; // only draw if there's a real gap

      if (!open) {
        // 6 degenerate (zero-length) segments — invisible but keeps buffer size constant
        for (let k = 0; k < 12; k++) zero();
        continue;
      }

      // Vertical guide left
      v(-GUIDE_X, lo); v(-GUIDE_X, hi);
      // Vertical guide right
      v(GUIDE_X, lo); v(GUIDE_X, hi);

      // Tick at lo — left
      v(-GUIDE_X - TICK_W, lo); v(-GUIDE_X + TICK_W, lo);
      // Tick at lo — right
      v(GUIDE_X - TICK_W, lo); v(GUIDE_X + TICK_W, lo);

      // Tick at hi — left
      v(-GUIDE_X - TICK_W, hi); v(-GUIDE_X + TICK_W, hi);
      // Tick at hi — right
      v(GUIDE_X - TICK_W, hi); v(GUIDE_X + TICK_W, hi);
    }

    // ── Flush to GPU ──────────────────────────────────────────────────────────
    const attr = seg.geometry.attributes.position;
    attr.array.set(positions);
    attr.needsUpdate = true;

    // Required for LineDashedMaterial to calculate dash spacing
    seg.computeLineDistances();
  });

  return (
    <lineSegments ref={segRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={TOTAL_PTS}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineDashedMaterial
        ref={matRef}
        color="#9a2215ff"
        transparent
        opacity={0}
        dashSize={0.12}
        gapSize={0.07}
        depthWrite={false}
      />
    </lineSegments>
  );
};

export default ExplodeLines;
