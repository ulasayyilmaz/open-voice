// Procedural 3D vocal tract model. Units ~cm. x = forward (face), y = up, z = lateral.
import * as THREE from 'three';

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);

// ---------- pose / deformation (forward-head posture) ----------
export const PIVOT = { x: -2.8, y: 2.3 };
export const neckW = (y) => smooth(-13, -3.5, y);
export function headXform(hf) {
  const th = 0.15 * hf, dx = 2.8 * hf, dy = -0.35 * hf;
  return { th, dx, dy };
}
// deform a neutral-space point with blend weight w (1 = moves fully with head)
export function deformXY(x, y, w, hf, out) {
  if (hf < 1e-5 || w < 1e-5) { out[0] = x; out[1] = y; return out; }
  const th = 0.15 * hf * w;
  const c = Math.cos(th), s = Math.sin(th);
  const px = x - PIVOT.x, py = y - PIVOT.y;
  out[0] = PIVOT.x + px * c - py * s + 2.8 * hf * w;
  out[1] = PIVOT.y + px * s + py * c - 0.35 * hf * w;
  return out;
}
export function setRigid(obj, w, hf) {
  const th = 0.15 * hf * w;
  const m = new THREE.Matrix4();
  m.makeTranslation(PIVOT.x + 2.8 * hf * w, PIVOT.y - 0.35 * hf * w, 0)
    .multiply(new THREE.Matrix4().makeRotationZ(th))
    .multiply(new THREE.Matrix4().makeTranslation(-PIVOT.x, -PIVOT.y, 0));
  obj.matrixAutoUpdate = false;
  obj.matrix.copy(m);
  obj.matrixWorldNeedsUpdate = true;
}

// ---------- materials ----------
export function makeMaterials() {
  const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.65, metalness: 0.0 }, o));
  return {
    skin: std({ color: 0xe8b796, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide, roughness: 0.9 }),
    bone: std({ color: 0xeee6d2, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide }),
    boneSolid: std({ color: 0xe9dfc6, roughness: 0.55, side: THREE.DoubleSide }),
    tooth: std({ color: 0xfbf8ef, roughness: 0.3, side: THREE.DoubleSide }),
    cart: std({ color: 0xb9d4e6, roughness: 0.4, transparent: true, opacity: 0.8 }),
    tongue: std({ color: 0xd8656e, roughness: 0.5, side: THREE.DoubleSide }),
    velum: std({ color: 0xe0808a, roughness: 0.45, side: THREE.DoubleSide }),
    mucosa: std({ color: 0xe9a0a4, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }),
    muscle: std({ color: 0xb8433f, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
    muscleStrap: std({ color: 0xc0504a, transparent: true, opacity: 0.4, roughness: 0.5, depthWrite: false }),
    wall: std({ color: 0xc2484a, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false }),
    lymph: std({ color: 0xf0b77a, roughness: 0.6 }),
    turb: std({ color: 0xe48a8a, roughness: 0.5 }),
    fvf: std({ color: 0xe0636b, roughness: 0.4 }),
    tvf: std({ color: 0xf8f3ee, roughness: 0.25, emissive: 0x222222 }),
    lung: std({ color: 0xf5a3b0, transparent: true, opacity: 0.26, depthWrite: false, side: THREE.DoubleSide }),
    diaphragm: std({ color: 0xd65a52, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }),
    eye: std({ color: 0xffffff, transparent: true, opacity: 0.18, depthWrite: false }),
    lip: std({ color: 0xc8696c, roughness: 0.5, side: THREE.DoubleSide }),
    septum: std({ color: 0xf2c4c4, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }),
    chamber: std({ color: 0xa8d8ff, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide }),
    straw: std({ color: 0x7fd3ff, transparent: true, opacity: 0.55, roughness: 0.15 }),
    esoph: std({ color: 0xd0787a, transparent: true, opacity: 0.35, depthWrite: false }),
  };
}

// ---------- geometry helpers ----------
export function extrudeFromPts(pts, depth, bevel = 0.3, segs = 3) {
  const shape = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1])));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.9,
    bevelSegments: segs, curveSegments: 6, steps: 1,
  });
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  return g;
}
export function smoothClosed(pts, n = 80) {
  const c = new THREE.CatmullRomCurve3(pts.map(p => V(p[0], p[1], 0)), true, 'centripetal');
  return c.getPoints(n).slice(0, n).map(v => [v.x, v.y]);
}
export function smoothOpen(pts, n = 40) {
  const c = new THREE.CatmullRomCurve3(pts.map(p => V(p[0], p[1], p[2] || 0)), false, 'centripetal');
  return c.getPoints(n);
}
// strap: cylinder between two points (updated each frame)
export function makeStrap(mat, r = 0.25) {
  const g = new THREE.CylinderGeometry(r, r, 1, 10, 1);
  g.translate(0, 0.5, 0);
  const m = new THREE.Mesh(g, mat);
  m.userData.strap = true;
  return m;
}
const _up = V(0, 1, 0), _d = V(0, 0, 0);
export function setStrap(m, a, b) {
  _d.subVectors(b, a);
  const len = _d.length();
  m.position.copy(a);
  m.quaternion.setFromUnitVectors(_up, _d.normalize());
  m.scale.set(1, len, 1);
}
// tube with variable elliptical cross-section; returns object with update(points, ra, rb, colors)
export function makeVarTube(mat, maxPts = 160, radial = 14) {
  const g = new THREE.BufferGeometry();
  const nV = maxPts * (radial + 1);
  const pos = new Float32Array(nV * 3), col = new Float32Array(nV * 3), nor = new Float32Array(nV * 3);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  const idx = [];
  for (let i = 0; i < maxPts - 1; i++) for (let j = 0; j < radial; j++) {
    const a = i * (radial + 1) + j, b = a + radial + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  g.setIndex(idx);
  const mesh = new THREE.Mesh(g, mat);
  mesh.frustumCulled = false;
  function update(P, RA, RB, C) {
    const n = Math.min(P.length, maxPts);
    for (let i = 0; i < maxPts; i++) {
      const ii = Math.min(i, n - 1);
      const p = P[ii];
      const pn = P[Math.min(ii + 1, n - 1)], pp = P[Math.max(ii - 1, 0)];
      let tx = pn.x - pp.x, ty = pn.y - pp.y;
      const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const nx = -ty, ny = tx; // in-plane normal
      for (let j = 0; j <= radial; j++) {
        const a = (j / radial) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        const k = (i * (radial + 1) + j) * 3;
        pos[k] = p.x + nx * RA[ii] * ca; pos[k + 1] = p.y + ny * RA[ii] * ca; pos[k + 2] = p.z + RB[ii] * sa;
        nor[k] = nx * ca; nor[k + 1] = ny * ca; nor[k + 2] = sa;
        col[k] = C[ii][0]; col[k + 1] = C[ii][1]; col[k + 2] = C[ii][2];
      }
    }
    g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; g.attributes.normal.needsUpdate = true;
  }
  return { mesh, update };
}

// Deformable mesh: stores neutral positions, re-applies deform on demand (per-vertex neck weights)
export function makeDeformable(geom, mat, mode = 'neck') {
  const mesh = new THREE.Mesh(geom, mat);
  const base = geom.attributes.position.array.slice();
  mesh.userData.deform = (hf) => {
    const p = geom.attributes.position.array, o = [0, 0];
    for (let i = 0; i < p.length; i += 3) {
      const w = mode === 'head' ? 1 : neckW(base[i + 1]);
      deformXY(base[i], base[i + 1], w, hf, o);
      p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = base[i + 2];
    }
    geom.attributes.position.needsUpdate = true;
    geom.computeVertexNormals();
  };
  mesh.userData.setBase = (newGeom) => { };
  return mesh;
}

// ---------- lofted skin / body ----------
const SKIN_ROWS = [
  // y, front x, back x, half width
  [16.6, 0.6, -0.6, 0.6], [16.2, 2.6, -2.8, 2.8], [15.0, 5.2, -5.6, 5.4], [13.0, 7.4, -7.6, 7.0], [10.5, 8.4, -8.4, 7.6],
  [8.0, 8.6, -8.6, 7.6], [6.4, 8.5, -8.3, 7.4], [4.6, 8.4, -7.7, 7.2], [3.0, 8.7, -7.0, 7.0], [1.6, 9.1, -6.4, 6.5],
  [0.6, 9.45, -5.9, 6.0], [-0.15, 9.0, -5.6, 5.7], [-1.0, 9.3, -5.3, 5.5], [-2.2, 8.6, -5.0, 5.2], [-3.5, 8.9, -4.8, 5.0],
  [-4.4, 7.6, -4.7, 5.3], [-5.0, 4.6, -4.7, 5.1], [-6.3, 3.6, -4.9, 4.8], [-8.5, 3.2, -5.1, 4.9], [-11.0, 3.2, -5.6, 5.4],
  [-13.0, 3.8, -6.4, 6.8], [-14.6, 5.4, -7.6, 11.0], [-15.8, 6.6, -8.2, 15.5], [-18.0, 7.4, -8.6, 16.0], [-24, 8.0, -8.8, 15.2],
  [-31, 8.2, -8.6, 14.6], [-38, 8.4, -8.2, 14.2], [-44, 7.8, -7.8, 13.8], [-47, 7.4, -7.4, 13.6],
];
export function makeSkin(mat) {
  // densify rows
  const rows = [];
  for (let i = 0; i < SKIN_ROWS.length - 1; i++) {
    const a = SKIN_ROWS[i], b = SKIN_ROWS[i + 1];
    const n = Math.max(1, Math.round(Math.abs(a[0] - b[0]) / 0.6));
    for (let k = 0; k < n; k++) {
      const t = k / n, s = t * t * (3 - 2 * t);
      rows.push([lerp(a[0], b[0], t), lerp(a[1], b[1], s), lerp(a[2], b[2], s), lerp(a[3], b[3], s)]);
    }
  }
  rows.push(SKIN_ROWS[SKIN_ROWS.length - 1]);
  const R = 48, pos = [], idx = [];
  rows.forEach(([y, f, b, w]) => {
    const c = (f + b) / 2, a = (f - b) / 2;
    for (let j = 0; j <= R; j++) {
      const t = (j / R) * Math.PI * 2;
      const ct = Math.cos(t), st = Math.sin(t);
      // superellipse: flatter sides on the face
      const e = 2.4;
      const cx = Math.sign(ct) * Math.pow(Math.abs(ct), 2 / e), sz = Math.sign(st) * Math.pow(Math.abs(st), 2 / e);
      const front = ct > 0 ? Math.pow(Math.abs(st), 1.0) : 0; // narrower toward front for face
      pos.push(c + a * cx, y, w * sz * (1 - 0.18 * front * (y > -4.5 && y < 13 ? 1 : 0)));
    }
  });
  for (let i = 0; i < rows.length - 1; i++) for (let j = 0; j < R; j++) {
    const a = i * (R + 1) + j, b = a + R + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return makeDeformable(g, mat, 'neck');
}
export function makeNose(mat) {
  const g = extrudeFromPts(smoothClosed([[8.2, 5.8], [8.9, 4.6], [10.2, 2.9], [10.4, 2.3], [9.9, 1.75], [9.0, 1.7], [8.6, 2.6]], 40), 1.6, 0.6, 4);
  return new THREE.Mesh(g, mat);
}
