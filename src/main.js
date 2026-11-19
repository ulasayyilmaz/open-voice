import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  clamp, lerp, smooth, neckW, deformXY, setRigid, makeMaterials, extrudeFromPts, smoothClosed, smoothOpen,
  makeStrap, setStrap, makeVarTube, makeDeformable, makeSkin, makeNose,
} from './anatomy.js';
import { BASE, OPEN, THROATY, STRUCTS, STATES, STRUCT_TOGGLES, EXERCISES, CHECKS, PLAN, SOURCES } from './content.js';

const $ = (s) => document.querySelector(s);
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);

// ---------------- params ----------------
const cur = { ...BASE, adenoid: 0, tonsil: 0, turb: 0, septum: 0 };
const tgt = { ...cur };
const RATE = { breath: 1.6, hf: 1.8 };
let T = 0;

// ---------------- renderer / scene ----------------
const stage = $('#stage');
const renderer = new THREE.WebGLRenderer({ canvas: $('#c3d'), antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.localClippingEnabled = true;
renderer.setClearColor(0x0d1317);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0d1317, 90, 180);
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 500);
camera.position.set(10, 4, 36);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(2, -2, 0);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.minDistance = 4; controls.maxDistance = 140;
controls.zoomSpeed = 0.9;

scene.add(new THREE.HemisphereLight(0xdfefff, 0x302020, 1.1));
const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(20, 30, 40); scene.add(key);
const rim = new THREE.DirectionalLight(0x88bbff, 0.7); rim.position.set(-30, 10, -20); scene.add(rim);
const fill = new THREE.DirectionalLight(0xffe0d0, 0.5); fill.position.set(10, -20, 30); scene.add(fill);

const M = makeMaterials();
const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
const NOCLIP = new Set([M.tvf, M.fvf, M.straw, M.septum, M.esoph]);
let section = true;
function applyClip() {
  Object.values(M).forEach(m => { if (!NOCLIP.has(m)) { m.clippingPlanes = section ? [clipPlane] : null; m.needsUpdate = true; } });
}

const LAYERS = { skin: [], bone: [], muscle: [], air: [], labels: true, sens: true };
const pickables = [];
function tag(mesh, keyName, layer) {
  if (keyName) { mesh.userData.key = keyName; pickables.push(mesh); }
  if (layer) LAYERS[layer].push(mesh);
  return mesh;
}

// ---------------- groups ----------------
const headG = new THREE.Group(); scene.add(headG);
const jawG = new THREE.Group(); headG.add(jawG);
const TMJ = { x: 0.3, y: 2.9 };
const larG = new THREE.Group(); scene.add(larG);
const thorax = new THREE.Group(); scene.add(thorax);
const neckDeformables = [];

// ---------------- skin & skull ----------------
const skin = tag(makeSkin(M.skin), null, 'skin'); scene.add(skin); neckDeformables.push(skin);
const nose = tag(makeNose(M.skin), null, 'skin'); headG.add(nose);
{
  const cran = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), M.bone);
  cran.scale.set(8.3, 7.0, 6.8); cran.position.set(-0.2, 9.8, 0); headG.add(tag(cran, 'spine', 'bone'));
  cran.userData.key = null;
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 16), M.eye);
    eye.position.set(6.6, 6.2, 3.1 * s); headG.add(tag(eye, null, 'skin'));
    const sin = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), M.chamber);
    sin.scale.set(1.8, 1.2, 1.3); sin.position.set(5.4, 3.5, 2.6 * s); headG.add(tag(sin, 'nasal', 'bone'));
  }
}
// hard palate
const palatePts = [[7.7, 0.85], [6.6, 1.2], [5.0, 1.42], [3.5, 1.48], [2.45, 1.5], [2.45, 1.9], [4.5, 1.98], [7.0, 1.98], [8.0, 1.55]];
{
  const g = extrudeFromPts(palatePts, 3.4, 0.18);
  headG.add(tag(new THREE.Mesh(g, M.boneSolid), 'palate', 'bone'));
}
setTimeout(() => setCap(palateCap, palatePts, 0.16), 0);
// nasal chamber
const nasalOutline = [[2.5, 1.98], [8.0, 1.98], [9.1, 2.05], [9.2, 2.6], [8.4, 5.7], [6.6, 6.5], [4.2, 6.6], [2.7, 5.6], [2.45, 3.6]];
{
  const g = extrudeFromPts(nasalOutline, 2.8, 0.25);
  headG.add(tag(new THREE.Mesh(g, M.chamber), 'nasal', 'bone'));
}
// septum (deformable for deviation)
const septumGeom = extrudeFromPts(nasalOutline.map(([x, y]) => [lerp(5.2, x, 0.93), lerp(4.0, y, 0.93)]), 0.12, 0.04, 1);
const septumBase = septumGeom.attributes.position.array.slice();
const septum = tag(new THREE.Mesh(septumGeom, M.septum), 'septum', 'bone'); headG.add(septum);
function updateSeptum() {
  const p = septumGeom.attributes.position.array, s = cur.septum;
  for (let i = 0; i < p.length; i += 3) {
    const x = septumBase[i], y = septumBase[i + 1];
    p[i + 2] = septumBase[i + 2] + s * 1.0 * Math.exp(-((x - 5.0) ** 2) / 3.5 - ((y - 3.4) ** 2) / 1.6);
  }
  septumGeom.attributes.position.needsUpdate = true; septumGeom.computeVertexNormals();
}
// turbinates
const turbs = [];
for (const s of [-1, 1]) {
  [[5.2, 2.78, 2.4, 0.42, 0.34], [4.7, 3.95, 2.0, 0.38, 0.3], [4.0, 5.0, 1.3, 0.3, 0.26]].forEach(([x, y, a, b, c]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), M.turb);
    m.position.set(x, y, 0.95 * s); m.userData.base = [a, b, c, s];
    m.scale.set(a, b, c); headG.add(tag(m, 'turb', 'muscle')); turbs.push(m);
  });
}
// teeth (upper fixed, lower in jaw)
function archPts(y, front, back, half, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = -1 + (2 * i) / n;
    pts.push([front - (front - back) * t * t, y, half * Math.sin(t * Math.PI / 2)]);
  }
  return pts;
}
function addTeeth(parent, y, front, back, half, h) {
  const pts = archPts(y, front, back, half, 15);
  pts.forEach(([x, yy, z], i) => {
    const molar = Math.abs(i - 7.5) > 4;
    const g = new THREE.BoxGeometry(molar ? 0.85 : 0.55, h, molar ? 0.85 : 0.3);
    const m = new THREE.Mesh(g, M.tooth);
    m.position.set(x, yy, z);
    m.rotation.y = Math.atan2(-(z), (front - x) * 2 + 0.01) * 0.0 + (z === 0 ? 0 : -Math.atan2(z, half) * 0.9);
    parent.add(tag(m, null, 'bone'));
  });
}
addTeeth(headG, 0.55, 7.75, 2.6, 2.6, 0.95);
// mandible
{
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const t = -1 + (2 * i) / 24;
    pts.push(V(8.0 - 6.8 * t * t, -3.3 - 0.4 * (1 - t * t), 4.6 * Math.sin(t * Math.PI / 2)));
  }
  const body = new THREE.CatmullRomCurve3(pts);
  const mb = new THREE.Mesh(new THREE.TubeGeometry(body, 60, 0.6, 10, false), M.boneSolid);
  mb.scale.set(1, 1.4, 1); mb.position.y = 1.3;
  jawG.add(tag(mb, 'mandible', 'bone'));
  for (const s of [-1, 1]) {
    const ram = new THREE.CatmullRomCurve3([V(1.25, -2.0, 4.6 * s), V(0.6, 0.3, 4.75 * s), V(0.3, 2.6, 4.8 * s)]);
    jawG.add(tag(new THREE.Mesh(new THREE.TubeGeometry(ram, 16, 0.5, 8, false), M.boneSolid), 'mandible', 'bone'));
  }
  // chin front plate
  const chin = new THREE.Mesh(extrudeFromPts([[7.2, -0.9], [8.1, -1.1], [8.5, -2.6], [8.3, -3.6], [7.4, -3.7], [7.0, -2.0]], 1.8, 0.3), M.boneSolid);
  jawG.add(tag(chin, 'mandible', 'bone'));
  addTeeth(jawG, -0.45, 7.55, 2.7, 2.4, 0.85);
}
// lips
function lipGeom() {
  const pts = [];
  for (let i = 0; i <= 20; i++) { const z = -2.2 + 4.4 * i / 20; pts.push(V(8.95 - 0.95 * (z / 2.2) ** 2, 0, z)); }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.4, 10, false);
}
const lipU = tag(new THREE.Mesh(lipGeom(), M.lip), 'lips', 'muscle'); headG.add(lipU);
const lipL = tag(new THREE.Mesh(lipGeom(), M.lip), 'lips', 'muscle'); headG.add(lipL);
const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 6, 16, 1, true), M.straw);
straw.rotation.z = Math.PI / 2 + 0.12; headG.add(straw);

// ---------------- dynamic soft tissue: tongue, velum ----------------
let tongueMesh = null, velumMesh = null, lastTongueKey = '', lastVelKey = '';
// flat "cut faces" so the sagittal section looks solid
const capMat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1 });
const tongueCap = new THREE.Mesh(new THREE.BufferGeometry(), capMat(0xb84a55)); headG.add(tag(tongueCap, 'tongue', 'muscle'));
const velumCap = new THREE.Mesh(new THREE.BufferGeometry(), capMat(0xc8606c)); headG.add(tag(velumCap, 'velum', 'muscle'));
const palateCap = new THREE.Mesh(new THREE.BufferGeometry(), capMat(0xd9ceb2)); headG.add(tag(palateCap, 'palate', 'bone'));
const fiberGeom = new THREE.BufferGeometry(); fiberGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18 * 3), 3));
const fibers = new THREE.LineSegments(fiberGeom, new THREE.LineBasicMaterial({ color: 0x7a2630, transparent: true, opacity: 0.55 }));
fibers.frustumCulled = false; headG.add(fibers); LAYERS.muscle.push(fibers);
function setCap(mesh, prof, off) {
  // offset polygon outward by bevel size
  let area = 0; for (let i = 0; i < prof.length; i++) { const a = prof[i], b = prof[(i + 1) % prof.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sg = area > 0 ? 1 : -1, n = prof.length;
  const pts = prof.map((p, i) => {
    const a = prof[(i - 1 + n) % n], b = prof[(i + 1) % n];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1;
    return new THREE.Vector2(p[0] + sg * (ty / l) * off, p[1] - sg * (tx / l) * off);
  });
  mesh.geometry.dispose();
  mesh.geometry = new THREE.ShapeGeometry(new THREE.Shape(pts));
  mesh.visible = section && LAYERS_VIS(mesh);
}
const LAYERS_VIS = (m) => m.userData.layerOn !== false;
function tongueCtrl() {
  const { tr, tf, jaw, ng, lx } = cur;
  const ngx = ng;
  return [
    [6.9 + 2.3 * tf, -0.35 - 1.1 * jaw - 0.15 * tf],
    [5.9 + 1.2 * tf, 0.42 - 1.35 * jaw],
    [4.4 + 0.5 * tf, 0.62 - 1.55 * jaw + 0.25 * tr],
    [2.9 + 0.3 * tf - 0.3 * tr - 0.5 * ngx, 0.62 - 1.05 * jaw + 0.45 * tr + 1.25 * ngx],
    [1.35 - 1.0 * tr + 0.5 * tf, -0.05 + 0.25 * tr + 0.35 * ngx],
    [0.7 - 1.35 * tr + 0.75 * tf, -2.0],
    [0.75 - 1.2 * tr + 0.6 * tf, -3.6 + 0.4 * lx],
    [1.7, -4.5 + 0.5 * lx],
    [3.6, -3.7 - 0.3 * jaw],
    [5.6, -2.7 - 0.6 * jaw],
    [6.7, -1.4 - 0.7 * jaw],
  ];
}
const TB = 0.32; // bevel on tongue
function updateTongue(force) {
  const c = tongueCtrl();
  const k = c.map(p => p[0].toFixed(2) + p[1].toFixed(2)).join();
  if (!force && k === lastTongueKey) return c;
  lastTongueKey = k;
  const prof = smoothClosed(c, 90);
  const g = extrudeFromPts(prof, 3.3, TB, 3);
  const pa = g.attributes.position.array;
  for (let i = 0; i < pa.length; i += 3) pa[i + 2] *= lerp(1, 0.5, smooth(4.5, 8.5, pa[i]));
  g.computeVertexNormals();
  if (!tongueMesh) { tongueMesh = tag(new THREE.Mesh(g, M.tongue), 'tongue', 'muscle'); headG.add(tongueMesh); }
  else { tongueMesh.geometry.dispose(); tongueMesh.geometry = g; }
  setCap(tongueCap, prof, TB * 0.9);
  // genioglossus fan
  const fp = fiberGeom.attributes.position.array; let fi = 0;
  const O = [6.2 + 0.5 * cur.tf, -2.75 - 0.4 * cur.jaw];
  const curve = new THREE.CatmullRomCurve3(c.slice(0, 7).map(q => V(q[0], q[1], 0)));
  for (let i = 0; i < 9; i++) {
    const q = curve.getPoint(0.12 + 0.86 * i / 8);
    fp[fi++] = lerp(O[0], q.x, 0.12); fp[fi++] = lerp(O[1], q.y, 0.12); fp[fi++] = 0.02;
    fp[fi++] = lerp(O[0], q.x, 0.88); fp[fi++] = lerp(O[1], q.y, 0.88); fp[fi++] = 0.02;
  }
  fiberGeom.attributes.position.needsUpdate = true;
  return c;
}
function velumCenter() {
  const v = cur.vel;
  const low = [[2.45, 1.62], [1.55, 1.0], [0.9, 0.05], [0.5, -0.8]];
  const high = [[2.45, 1.62], [1.1, 2.0], [-0.6, 1.9], [-0.95, 1.05]];
  const pts = low.map((p, i) => [lerp(p[0], high[i][0], v), lerp(p[1], high[i][1], v)]);
  const s = smoothOpen(pts, 26);
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const a = s[Math.max(0, i - 1)], b = s[Math.min(s.length - 1, i + 1)];
    let tx = b.x - a.x, ty = b.y - a.y; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const u = i / (s.length - 1);
    const th = lerp(0.95, 0.38, Math.pow(u, 1.2));
    out.push({ x: s[i].x, y: s[i].y, nx: ty, ny: -tx, th });
  }
  return out;
}
const VB = 0.18;
function updateVelum(vc) {
  const k = cur.vel.toFixed(3);
  if (k === lastVelKey && velumMesh) return;
  lastVelKey = k;
  const up = vc.map(p => [p.x + p.nx * p.th / 2, p.y + p.ny * p.th / 2]);
  const dn = vc.map(p => [p.x - p.nx * p.th / 2, p.y - p.ny * p.th / 2]).reverse();
  const vprof = [...up, ...dn];
  const g = extrudeFromPts(vprof, 2.5, VB, 3);
  setCap(velumCap, vprof, VB * 0.9);
  if (!velumMesh) { velumMesh = tag(new THREE.Mesh(g, M.velum), 'velum', 'muscle'); headG.add(velumMesh); }
  else { velumMesh.geometry.dispose(); velumMesh.geometry = g; }
}

// lymphoid tissue
const adenoid = tag(new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), M.lymph), 'adenoid', 'muscle'); headG.add(adenoid);
const tonsils = [-1, 1].map(s => { const m = tag(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), M.lymph), 'tonsil', 'muscle'); m.userData.s = s; headG.add(m); return m; });

// ---------------- pharyngeal wall ----------------
const WALL0 = [[1.8, 4.5], [0.5, 4.45], [-0.6, 3.95], [-1.15, 2.95], [-1.32, 1.8], [-1.35, 0.5], [-1.35, -1.0], [-1.3, -2.5], [-1.2, -4.0], [-1.1, -5.5], [-1.0, -7.0], [-0.95, -8.5], [-0.9, -9.8]];
function wallPts() {
  const pw = cur.pw;
  return WALL0.map(([x, y]) => [x + 0.85 * pw * smooth(1.6, -0.3, y) * (1 - smooth(-6.5, -9.5, y)), y]);
}
function wallXAt(W, y) {
  for (let i = 3; i < W.length - 1; i++) {
    const a = W[i], b = W[i + 1];
    if (y <= a[1] && y >= b[1]) return lerp(a[0], b[0], (a[1] - y) / (a[1] - b[1]));
  }
  return y > W[3][1] ? W[3][0] : W[W.length - 1][0];
}
const WR = 70, WA = 18;
const wallGeom = new THREE.BufferGeometry();
{
  wallGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(WR * (WA + 1) * 3), 3));
  const idx = [];
  for (let i = 0; i < WR - 1; i++) for (let j = 0; j < WA; j++) { const a = i * (WA + 1) + j, b = a + WA + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  wallGeom.setIndex(idx);
}
const wallMesh = tag(new THREE.Mesh(wallGeom, M.wall), 'constrictor', 'muscle'); scene.add(wallMesh);
wallMesh.frustumCulled = false;
function updateWall(W) {
  const curve = new THREE.CatmullRomCurve3(W.map(([x, y]) => V(x, y, 0)), false, 'centripetal');
  const pts = curve.getSpacedPoints(WR - 1);
  const p = wallGeom.attributes.position.array, o = [0, 0];
  for (let i = 0; i < WR; i++) {
    const c = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(WR - 1, i + 1)];
    let tx = b.x - a.x, ty = b.y - a.y; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const nx = -ty, ny = tx; // anterior normal
    let Wd = c.y > 2.5 ? 1.55 : c.y > -5 ? 1.95 : lerp(1.95, 1.0, smooth(-5, -9.8, c.y));
    Wd *= 1 - 0.25 * cur.pw * smooth(1.6, -0.3, c.y);
    const D = Wd * 0.85;
    for (let j = 0; j <= WA; j++) {
      const ph = -Math.PI / 2 + Math.PI * j / WA;
      const x = c.x + nx * D * (1 - Math.cos(ph)), y = c.y + ny * D * (1 - Math.cos(ph)), z = Wd * Math.sin(ph);
      deformXY(x, y, neckW(y), cur.hf, o);
      const k = (i * (WA + 1) + j) * 3; p[k] = o[0]; p[k + 1] = o[1]; p[k + 2] = z;
    }
  }
  wallGeom.attributes.position.needsUpdate = true; wallGeom.computeVertexNormals(); wallGeom.computeBoundingSphere();
}

// ---------------- larynx ----------------
// local coords: origin at glottis (0.8,-8)
{
  const thy = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.25, 2.9, 32, 1, true, Math.PI / 2 - 1.35 + Math.PI, 2.7), M.cart);
  thy.position.set(0.25, 0.75, 0); thy.scale.set(1.25, 1, 1); larG.add(tag(thy, 'larynx', 'bone'));
  const prom = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), M.cart); prom.position.set(2.15, 2.0, 0); larG.add(tag(prom, 'larynx', 'bone'));
  const cri = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.55, 28, 1, true), M.cart); cri.position.set(0.2, -1.15, 0); larG.add(tag(cri, 'larynx', 'bone'));
  const criP = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.5, 1.7), M.cart); criP.position.set(-0.85, -0.8, 0); larG.add(tag(criP, 'larynx', 'bone'));
  for (const s of [-1, 1]) {
    const ary = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 10), M.cart); ary.position.set(-0.55, 0.25, 0.35 * s); larG.add(tag(ary, 'larynx', 'bone'));
  }
  // epiglottis leaf (local)
  const ep = extrudeFromPts([[0.55, 1.4], [0.35, 2.6], [-0.2, 3.7], [-0.75, 4.35], [-0.6, 4.45], [-0.05, 3.75], [0.5, 2.6], [0.75, 1.4]], 1.9, 0.12, 2);
  larG.add(tag(new THREE.Mesh(ep, M.cart), 'epiglottis', 'bone'));
  // hyoid
  const hp = []; for (let i = 0; i <= 16; i++) { const t = -1 + 2 * i / 16; hp.push(V(1.75 - 2.2 * t * t, 2.85 + 0.2 * t * t, 1.9 * Math.sin(t * Math.PI / 2))); }
  larG.add(tag(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hp), 30, 0.18, 8, false), M.boneSolid), 'hyoid', 'bone'));
}
const tvf = [-1, 1].map(s => {
  const g = new THREE.BoxGeometry(1.95, 0.32, 0.36); g.translate(-0.97, 0, 0.18 * s);
  const m = tag(new THREE.Mesh(g, M.tvf), 'tvf', 'muscle'); m.position.set(1.15, 0, 0); m.userData.s = s; larG.add(m); return m;
});
const fvf = [-1, 1].map(s => {
  const g = new THREE.BoxGeometry(1.85, 0.42, 0.5); g.translate(-0.92, 0, 0.25 * s);
  const m = tag(new THREE.Mesh(g, M.fvf), 'fvf', 'muscle'); m.position.set(1.1, 0.62, 0); m.userData.s = s; larG.add(m); return m;
});
// trachea rings
const rings = [];
for (let i = 0; i < 15; i++) {
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.13, 8, 24, Math.PI * 1.6), M.cart);
  r.rotation.x = Math.PI / 2; r.userData.i = i; scene.add(tag(r, 'trachea', 'bone')); rings.push(r);
}
const esoph = makeVarTube(M.esoph, 40, 12); scene.add(tag(esoph.mesh, 'esoph', 'muscle'));

// ---------------- spine ----------------
const verts = [];
const VERT = [
  [-3.1, 1.25, 'C1'], [-3.05, -0.35, 'C2'], [-2.95, -1.95], [-2.9, -3.5], [-2.85, -5.05], [-2.9, -6.6], [-3.05, -8.15],
  [-3.35, -10.0], [-3.7, -12.2], [-4.1, -14.5], [-4.45, -16.9], [-4.7, -19.3], [-4.85, -21.8], [-4.9, -24.3], [-4.85, -26.8], [-4.7, -29.3], [-4.5, -31.8], [-4.25, -34.4], [-4.0, -37.0],
];
VERT.forEach(([x, y], i) => {
  const cerv = i < 7, g = new THREE.Group();
  const r = cerv ? 0.8 : 1.15 + i * 0.015, h = cerv ? 1.1 : 1.75;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), M.boneSolid); body.scale.z = 1.25; g.add(body);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(cerv ? 0.95 : 1.1, cerv ? 0.22 : 0.28, 8, 20, Math.PI), M.boneSolid);
  arch.rotation.x = Math.PI / 2; arch.rotation.z = Math.PI / 2; arch.position.set(-r - (cerv ? 0.85 : 1.0), 0, 0); g.add(arch);
  const spg = new THREE.ConeGeometry(cerv ? 0.28 : 0.36, cerv ? 1.6 : 2.4, 8); spg.rotateZ(Math.PI / 2);
  const sp = new THREE.Mesh(spg, M.boneSolid); sp.position.set(-(r + (cerv ? 2.5 : 3.0)), -0.35, 0); sp.rotation.z = cerv ? -0.25 : -0.55; g.add(sp);
  g.children.forEach(c => tag(c, 'spine', 'bone'));
  g.userData.base = [x, y]; g.userData.i = i;
  scene.add(g); verts.push(g);
});
// ribs, sternum, clavicles
const ribG = new THREE.Group(); thorax.add(ribG);
for (let i = 0; i < 10; i++) {
  const [vx, vy] = VERT[7 + i];
  for (const s of [-1, 1]) {
    const w = lerp(8.5, 12.5, Math.min(1, i / 5)) - Math.max(0, i - 6) * 0.6;
    const pts = [V(vx - 0.3, vy, 1.2 * s), V(vx - 1.6, vy - 0.7, 5.5 * s), V(-1.5, vy - 2.6, w * s), V(3.6, vy - 4.4 - i * 0.15, (w * 0.8) * s), V(6.3, -15.8 - i * 1.55, 1.6 * s)];
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.32, 6, false), M.bone);
    ribG.add(tag(m, 'ribs', 'bone'));
  }
}
const stern = new THREE.Mesh(extrudeFromPts([[6.0, -14.6], [7.0, -14.6], [7.2, -30], [6.6, -31.5], [6.0, -30]], 2.6, 0.2), M.bone); thorax.add(tag(stern, 'ribs', 'bone'));
for (const s of [-1, 1]) {
  const c = new THREE.CatmullRomCurve3([V(6.4, -14.4, 1.4 * s), V(5.2, -13.6, 6 * s), V(1.0, -13.4, 11 * s), V(-2.2, -13.0, 13.5 * s)]);
  thorax.add(tag(new THREE.Mesh(new THREE.TubeGeometry(c, 30, 0.42, 8, false), M.bone), 'ribs', 'bone'));
}
// lungs & diaphragm
const lungs = [-1, 1].map(s => {
  const g = new THREE.SphereGeometry(1, 40, 28);
  const p = g.attributes.position.array;
  for (let i = 0; i < p.length; i += 3) { const y = p[i + 1]; p[i] *= 1 - 0.35 * Math.max(0, y); p[i + 2] *= 1 - 0.4 * Math.max(0, y); }
  g.computeVertexNormals();
  const m = tag(new THREE.Mesh(g, M.lung), 'lungs', 'muscle'); m.position.set(0.6, -26.5, 5.6 * s); m.scale.set(5.6, 10.5, 4.9); thorax.add(m); return m;
});
const diaph = tag(new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), M.diaphragm), 'diaphragm', 'muscle');
thorax.add(diaph);
// bronchi
for (const s of [-1, 1]) {
  const c = new THREE.CatmullRomCurve3([V(0.0, -21.5, 0), V(0.2, -23.5, 1.6 * s), V(0.5, -25.5, 3.6 * s)]);
  thorax.add(tag(new THREE.Mesh(new THREE.TubeGeometry(c, 16, 0.6, 10, false), M.cart), 'trachea', 'bone'));
}

// ---------------- muscles (straps) ----------------
const straps = {
  scm: [-1, 1].map(s => { const m = tag(makeStrap(M.muscleStrap, 0.55), 'scm', 'muscle'); scene.add(m); m.userData.s = s; return m; }),
  supra: [-1, 1].map(s => { const m = tag(makeStrap(M.muscleStrap, 0.32), 'supra', 'muscle'); scene.add(m); m.userData.s = s; return m; }),
  infra: [-1, 1].map(s => { const m = tag(makeStrap(M.muscleStrap, 0.32), 'infra', 'muscle'); scene.add(m); m.userData.s = s; return m; }),
  lev: [-1, 1].map(s => { const m = tag(makeStrap(M.muscleStrap, 0.22), 'levator', 'muscle'); scene.add(m); m.userData.s = s; return m; }),
  mass: [-1, 1].map(s => { const m = tag(makeStrap(M.muscleStrap, 0.7), 'masseter', 'muscle'); scene.add(m); m.userData.s = s; return m; }),
};

// ---------------- airflow ----------------
const airMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide });
NOCLIP.add(airMat);
const airMatO = airMat.clone(), airMatN = airMat.clone(); NOCLIP.add(airMatO); NOCLIP.add(airMatN);
const tubeLower = makeVarTube(airMat, 110, 14), tubeOral = makeVarTube(airMatO, 90, 14), tubeNasal = makeVarTube(airMatN, 90, 12);
[tubeLower, tubeOral, tubeNasal].forEach(t => scene.add(tag(t.mesh, null, 'air')));
const NP = 700;
const pGeom = new THREE.BufferGeometry();
const pPos = new Float32Array(NP * 3), pCol = new Float32Array(NP * 3);
pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeom.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
function dotTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}
const DOT = dotTex();
const pMat = new THREE.PointsMaterial({ size: 0.42, map: DOT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.95 });
const particles = new THREE.Points(pGeom, pMat); particles.frustumCulled = false; scene.add(tag(particles, null, 'air'));
const P = Array.from({ length: NP }, () => ({ u: Math.random(), b: Math.random() < 0.5 ? 0 : 1, j: (Math.random() - 0.5), k: (Math.random() - 0.5) }));

function gapColor(g, src, press, ref = 1.5) {
  let c; g = g / ref * 1.5;
  if (src) c = [1, 0.95, 0.75];
  else if (g < 0.35) c = [1, 0.18, 0.2];
  else if (g < 0.9) { const t = (g - 0.35) / 0.55; c = [1, lerp(0.25, 0.85, t), lerp(0.2, 0.3, t)]; }
  else { const t = clamp((g - 0.9) / 0.6, 0, 1); c = [lerp(1, 0.25, t), lerp(0.85, 0.85, t), lerp(0.3, 1, t)]; }
  if (press > 0) c = c.map((v, i) => lerp(v, [0.72, 0.5, 1][i], press * 0.55));
  return c;
}

// ---------------- sensation sprites ----------------
const SENS = {
  lips: [9.3, 0.0, 0, 'h'], mask: [8.7, 4.2, 0, 'h'], hardPalate: [5.0, 1.55, 0, 'h'], softPalate: [1.3, 2.2, 0, 'h'],
  larynx: [2.7, -6.4, 0, 'lar'], tongueRoot: [5.6, -4.6, 0, 'h'], ribs: [1.5, -25, 11.5, 'n'], belly: [7.4, -38, 0, 'n'],
  neckBack: [-6.0, -3.0, 0, 'n'], crown: [0, 16.8, 0, 'h'],
};
const sensTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,240,150,1)'); g.addColorStop(0.25, 'rgba(255,200,80,.7)'); g.addColorStop(1, 'rgba(255,160,40,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
})();
const sensSprites = {};
for (const k in SENS) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sensTex, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  s.scale.set(2.4, 2.4, 1); s.renderOrder = 10; scene.add(s); sensSprites[k] = s;
}
let activeSens = [];

// ---------------- labels ----------------
const LABELS = [
  ['nasal', 'Nasal cavity', () => [6.3, 5.4, 0, 1], 1],
  ['turb', 'Turbinates', () => [4.2, 4.6, -0.9, 1], 3],
  ['palate', 'Hard palate', () => [5.5, 1.7, 0, 1], 2],
  ['velum', 'Soft palate (velum)', () => { const v = VC[10]; return [v.x, v.y + 0.4, 0, 1]; }, 1],
  ['uvula', 'Uvula', () => { const v = VC[VC.length - 1]; return [v.x, v.y - 0.1, 0, 1]; }, 3],
  ['adenoid', 'Adenoids', () => [-0.4, 3.6, 0, 1], 3],
  ['naso', 'Nasopharynx', () => [0.1, 3.0, 0, 1], 2],
  ['oro', 'Oropharynx', () => [-0.5, -1.3, 0, 1], 1],
  ['laryngo', 'Laryngopharynx', () => [-0.4, -5.2, 0, neckW(-5.2)], 3],
  ['tongue', 'Tongue', () => [4.0, -1.2, 1.7, 1], 1],
  ['root', 'Tongue root', () => { const c = TC[5]; return [c[0] + 0.3, c[1], 0, 1]; }, 2],
  ['tonsil', 'Tonsils', () => [0.75, -1.3, 1.6, 1], 3],
  ['epiglottis', 'Epiglottis', () => [-0.1, -4.0 + cur.lx, 0, 'lar'], 2],
  ['hyoid', 'Hyoid bone', () => [2.6, -5.15 + cur.lx, 0, 'lar'], 2],
  ['larynx', 'Larynx (Adam\'s apple)', () => [2.95, -6.0 + cur.lx, 0, 'lar'], 1],
  ['fvf', 'False vocal folds', () => [0.3, -7.38 + cur.lx, 0.6, 'lar'], 3],
  ['tvf', 'True vocal folds', () => [0.3, -8.0 + cur.lx, 0.5, 'lar'], 2],
  ['trachea', 'Trachea', () => [0.6, -14, 0, 0], 2],
  ['esoph', 'Esophagus', () => [-1.2, -14, 0, 0], 3],
  ['spine', 'Cervical spine', () => [-3.0, -3.5, 0, neckW(-3.5)], 2],
  ['mandible', 'Jaw', () => [7.9, -3.6, 0, 1], 2],
  ['lips', 'Lips', () => [9.4, 0.4, 0, 1], 3],
  ['constrictor', 'Pharyngeal constrictors', () => [-1.6, -2.6, -1.4, 1], 3],
  ['levator', 'Levator veli palatini', () => [0.3, 3.4, 1.5, 1], 3],
  ['scm', 'Sternocleidomastoid', () => [-1.5, -6.5, 5.0, neckW(-6.5)], 2],
  ['supra', 'Suprahyoid muscles', () => [5.2, -4.4, 0.6, 1], 3],
  ['infra', 'Infrahyoid (strap) muscles', () => [3.6, -10.5, 0.9, neckW(-10.5)], 3],
  ['lungs', 'Lungs', () => [0.6, -24, 9, 0], 1],
  ['diaphragm', 'Diaphragm', () => [3, -36, 0, 0], 1],
  ['ribs', 'Ribs', () => [4, -21, 10, 0], 2],
];
const labelLayer = $('#labels');
const labelEls = LABELS.map(([k, name]) => {
  const d = document.createElement('div'); d.className = 'lbl'; d.innerHTML = `<i></i><span>${name}</span>`;
  d.addEventListener('click', (e) => { e.stopPropagation(); selectStruct(k); });
  labelLayer.appendChild(d); return d;
});

const WARN = [
  ['Throat narrowed: tongue root + walls', () => geo.oroMin < 1.15, () => [geo.L.L6.x, geo.L.L6.y, 0, 1]],
  ['False folds squeezing', () => cur.fvf > 0.5, () => [0.75, -7.4 + cur.lx, 0, 'lar']],
  ['Larynx pulled up', () => cur.lx > 0.7, () => [3.2, -6.4 + cur.lx, 0, 'lar']],
  ['Head forward: neck braces', () => cur.hf > 0.5, () => [-6.5, -2.0, 0, neckW(-2)]],
  ['Sound leaking into nose', () => cur.phon > 0.5 && cur.ng < 0.3 && cur.lipAp > 0.2 && geo.port > 0.45, () => [geo.nasalPts[geo.nasalStart + 2].x, geo.nasalPts[geo.nasalStart + 2].y, 0, 1]],
  ['Adenoids block the nasopharynx', () => cur.adenoid > 0.4, () => [0.0, 3.4, 0, 1]],
  ['Tonsils narrow the throat', () => cur.tonsil > 0.4, () => [1.2, -1.0, 0, 1]],
  ['Swollen turbinates', () => cur.turb > 0.4, () => [5.0, 3.6, 0, 1]],
  ['Septum narrows the nose', () => cur.septum > 0.4, () => [6.5, 4.4, 0, 1]],
  ['Mouth-nose valve closed (ng)', () => cur.ng > 0.5, () => [2.4, 1.3, 0, 1]],
];
const warnEls = WARN.map(([t]) => { const d = document.createElement('div'); d.className = 'warn'; d.textContent = t; labelLayer.appendChild(d); return d; });
function updateWarn() {
  const rect = renderer.domElement.getBoundingClientRect(), o = [0, 0];
  WARN.forEach(([t, cond, at], i) => {
    const el = warnEls[i];
    let on = false; try { on = cond(); } catch (e) { }
    if (!on) { el.classList.remove('on'); return; }
    let [x, y, z, w] = at(); if (w === 'lar') w = larW();
    deformXY(x, y, w, cur.hf, o); _v.set(o[0], o[1], z).project(camera);
    el.classList.add('on');
    el.classList.toggle('info', i === 9);
    el.style.transform = `translate(${(_v.x * 0.5 + 0.5) * rect.width}px, ${(-_v.y * 0.5 + 0.5) * rect.height}px)`;
  });
}
// ---------------- computed frame state ----------------
let VC = velumCenter(), TC = tongueCtrl(), WALL = wallPts();
const geo = { gaps: {}, oralOpen: 1, nasalOpen: 0, oralPts: [], nasalPts: [], port: 0, oroMin: 2 };
const larW = () => neckW(-8 + cur.lx);
function W2(x, y, w) { const o = [0, 0]; deformXY(x, y, w, cur.hf, o); return o; }

function tongueBackX(y) {
  const pts = [TC[4], TC[5], TC[6]];
  if (y >= pts[0][1]) return pts[0][0] + TB;
  for (let i = 0; i < 2; i++) { const a = pts[i], b = pts[i + 1]; if (y <= a[1] && y >= b[1]) return lerp(a[0], b[0], (a[1] - y) / (a[1] - b[1])) + TB; }
  return pts[2][0] + TB;
}
function tongueTopY(x) {
  const pts = [TC[0], TC[1], TC[2], TC[3], TC[4]]; // descending x
  for (let i = 0; i < 4; i++) { const a = pts[i], b = pts[i + 1]; const hi = Math.max(a[0], b[0]), lo = Math.min(a[0], b[0]); if (x <= hi && x >= lo) return lerp(a[1], b[1], (a[0] - x) / ((a[0] - b[0]) || 1)) + TB; }
  return (x > pts[0][0] ? pts[0][1] : pts[4][1]) + TB;
}
const PAL = [[7.7, 0.85], [6.6, 1.2], [5.0, 1.42], [3.5, 1.48], [2.45, 1.5]];
function roofY(x) {
  if (x >= 2.45) { for (let i = 0; i < PAL.length - 1; i++) { const a = PAL[i], b = PAL[i + 1]; if (x <= a[0] && x >= b[0]) return lerp(a[1], b[1], (a[0] - x) / (a[0] - b[0])) - 0.15; } return 0.7; }
  // velum underside: nearest sample by x among front half
  let best = null, bd = 1e9;
  for (const p of VC) { const ux = p.x - p.nx * p.th / 2; const d = Math.abs(ux - x); if (d < bd) { bd = d; best = p; } }
  return best.y - best.ny * best.th / 2 - VB;
}

function computeGeometry() {
  TC = tongueCtrl(); VC = velumCenter(); WALL = wallPts();
  const { lx, fvf, pw, phon, tonsil, adenoid, turb, septum: sep } = cur;
  // oropharynx
  const oro = (y, extra = 0) => { const wx = wallXAt(WALL, y); const tx = tongueBackX(y); return { x: (wx + tx) / 2, y, g: Math.max(0.02, tx - wx - extra) }; };
  const y5 = -3.75 + 0.45 * lx;
  const L5 = oro(y5), L6 = oro(-2.0, 0.75 * tonsil), L7 = oro(-0.6, 0.55 * tonsil);
  geo.oroMin = Math.min(L5.g, L6.g, L7.g);
  // port
  let port = 9, portPt = null;
  for (let i = 4; i < VC.length; i++) {
    const p = VC[i]; const sx = p.x + p.nx * (p.th / 2 + VB), sy = p.y + p.ny * (p.th / 2 + VB);
    if (sy < 0.2 || sy > 3.2) continue;
    const g = sx - wallXAt(WALL, sy);
    if (g < port) { port = g; portPt = [(sx + wallXAt(WALL, sy)) / 2, sy]; }
  }
  port = clamp(port, 0, 3); if (!portPt) portPt = [-0.6, 1.8];
  const gNP = Math.max(0.03, 1.6 - 1.45 * adenoid);
  geo.port = port;
  // lips
  const ap = cur.trill > 0.5 ? cur.lipAp * (0.25 + 0.75 * Math.abs(Math.sin(T * Math.PI * 2 * 7))) : cur.lipAp;
  const upY = 0.35 + 0.25 * ap, loY = -0.45 - 0.5 * ap - 2.0 * cur.jaw * clamp(ap * 2.5, 0, 1);
  geo.lipU = upY; geo.lipL = loY;
  let lipGap = Math.max(0.02, upY - loY - 0.8);
  const lipMid = (upY + loY) / 2;
  if (cur.straw > 0.5) lipGap = 0.3;
  const o = (x) => { const top = tongueTopY(x), r = roofY(x); return { x, y: (top + r) / 2, g: Math.max(0.02, r - top) }; };
  const O0 = o(1.25), O1 = o(2.5), O2 = o(4.2), O3 = o(6.1);
  if (cur.ttrill > 0.5) { O3.g = Math.max(0.04, O3.g * (0.2 + 0.8 * Math.abs(Math.sin(T * Math.PI * 2 * 9)))); }
  const tipOut = TC[0][0] > 8.6;
  const O4 = { valve: true, x: 9.05, y: tipOut ? Math.max(lipMid, TC[0][1] + 0.7) : lipMid, g: lipGap };
  const O5 = cur.straw > 0.5 ? { x: 14.0, y: -0.4, g: 0.3 } : { x: 11.2, y: lipMid - 0.25, g: Math.max(lipGap, 0.9) };
  geo.oralOpen = Math.min(O0.g, O1.g, O2.g, O3.g, O4.g);
  // nasal
  const N = [
    { x: portPt[0], y: portPt[1], g: port, lat: 0.9, valve: true },
    { x: 0.25, y: 3.1, g: gNP, lat: 0.9 },
    { x: 2.6, y: 3.1, g: Math.max(0.05, 1.0 - 0.45 * turb), lat: 0.6 },
    { x: 5.2, y: 3.25, g: Math.max(0.05, 0.95 - 0.62 * turb - 0.4 * sep), lat: 0.5 },
    { x: 7.6, y: 2.9, g: Math.max(0.05, 0.85 - 0.35 * turb - 0.3 * sep), lat: 0.5 },
    { x: 9.35, y: 2.05, g: 0.65, lat: 0.6 },
    { x: 10.9, y: 1.3, g: 0.8, lat: 0.7 },
  ];
  geo.nasalOpen = Math.min(...N.slice(0, 6).map(n => n.g));
  geo.nasalStruct = Math.min(...N.slice(1, 6).map(n => n.g));
  // lower
  const wl = larW();
  const glot = phon > 0.5 ? 0.22 : 0.85;
  const lower = [
    { x: 0.0, y: -21, g: 1.5, w: 0, lat: 1.0, ref: 1.5 }, { x: 0.45, y: -15, g: 1.6, w: 0, lat: 1.0, ref: 1.5 },
    { x: 0.65, y: -10.5 + 0.7 * lx, g: 1.55, w: neckW(-10.5), lat: 1.0, ref: 1.5 },
    { x: 0.8, y: -9.0 + lx, g: 1.3, w: wl, lat: 1.0, ref: 1.3 },
    { x: 0.8, y: -8.0 + lx, g: glot, w: wl, src: true, lat: 1.3, ref: 1.0 },
    { x: 0.75, y: -7.4 + lx, g: 0.22 + 0.95 * (1 - fvf), w: wl, lat: 1.1, k: 'fvf', ref: 1.17 },
    { x: 0.55, y: -6.6 + lx, g: 1.05 - 0.35 * fvf, w: wl, lat: 1.1, ref: 1.05 },
    { x: 0.25, y: -5.5 + lx, g: 1.25 - 0.45 * fvf - 0.2 * pw, w: wl, lat: 1.2, ref: 1.25 },
    { ...L5, w: neckW(L5.y), lat: 1.4, k: 'oro', ref: 1.75 }, { ...L6, w: 1, lat: 1.4, k: 'oro', ref: 1.85 }, { ...L7, w: 1, lat: 1.4, k: 'oro', ref: 1.9 },
  ];
  geo.fvfGap = lower[5].g;
  const ngv = cur.ng > 0.3;
  const oral = [{ ...O0, lat: 1.5, valve: ngv, ref: 1.1 }, { ...O1, lat: 1.6, valve: ngv, ref: 1.0 }, { ...O2, lat: 1.7, ref: 0.9 }, { ...O3, lat: 1.5, ref: 0.8 }, { ...O4, lat: 1.3, ref: 0.9 }, { ...O5, lat: 1.0, ref: 0.9 }].map(p => ({ ...p, w: 1 }));
  geo.oralPts = [...lower, ...oral];
  geo.nasalPts = [...lower, ...N.map((p, i) => ({ ...p, w: 1, ref: [1.2, 1.6, 1.0, 0.95, 0.85, 0.65, 0.8][i] }))];
  geo.nasalStart = lower.length - 2;
  geo.lower = lower; geo.L = { L5, L6, L7 }; geo.O = { O0, O1, O2, O3, O4 };
}

function buildCurve(pts) {
  const o = [0, 0];
  const v = pts.map(p => { deformXY(p.x, p.y, p.w, cur.hf, o); return V(o[0], o[1], 0); });
  return new THREE.CatmullRomCurve3(v, false, 'catmullrom', 0.3);
}
function interpAt(pts, u, key) {
  const f = u * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), t = f - i;
  return lerp(pts[i][key] ?? 0, pts[i + 1][key] ?? 0, t);
}
let curveOral, curveNasal, lenOral = 1, lenNasal = 1;
function updateAir() {
  curveOral = buildCurve(geo.oralPts);
  const nasalSub = geo.nasalPts.slice(geo.nasalStart);
  curveNasal = buildCurve(geo.nasalPts);
  lenOral = curveOral.getLength(); lenNasal = curveNasal.getLength();
  const fill = (tube, curve, pts, N, uStart, uEnd) => {
    const P = [], RA = [], RB = [], C = [];
    for (let i = 0; i < N; i++) {
      const u = uStart + (uEnd - uStart) * i / (N - 1);
      P.push(curve.getPoint(u));
      const g = interpAt(pts, u, 'g'), lat = interpAt(pts, u, 'lat');
      const f = u * (pts.length - 1), src = pts[Math.round(f)].src && Math.abs(f - Math.round(f)) < 0.25;
      RA.push(clamp(g / 2 * 0.9, 0.03, 1.0)); RB.push(clamp(g / 2 * 0.9 * lat + 0.15, 0.05, 1.3));
      const valve = (pts[Math.floor(f)].valve || pts[Math.min(pts.length - 1, Math.ceil(f))].valve) && Math.min(pts[Math.floor(f)].g, pts[Math.min(pts.length - 1, Math.ceil(f))].g) < 0.5;
      C.push(valve ? [0.5, 0.62, 0.72] : gapColor(g, src, cur.press, interpAt(pts, u, 'ref') || 1.5));
    }
    tube.update(P, RA, RB, C);
  };
  const nl = geo.nasalStart + 1;
  fill(tubeLower, curveOral, geo.oralPts, 110, 0, nl / (geo.oralPts.length - 1));
  fill(tubeOral, curveOral, geo.oralPts, 90, (nl - 1) / (geo.oralPts.length - 1), 1);
  fill(tubeNasal, curveNasal, geo.nasalPts, 90, (nl - 1) / (geo.nasalPts.length - 1), 1);
  const tot = geo.oralOpen + geo.nasalOpen, fN = tot > 0.02 ? geo.nasalOpen / tot : 0.5;
  airMatO.opacity = lerp(airMatO.opacity, 0.025 + 0.4 * clamp((1 - fN) * 2, 0, 1), 0.15);
  airMatN.opacity = lerp(airMatN.opacity, 0.025 + 0.4 * clamp(fN * 2, 0, 1), 0.15);
  airMat.opacity = 0.36 + 0.14 * cur.phon * (0.5 + 0.5 * Math.sin(T * 18));
}

let flowDir = 0, flowMag = 0;
function updateParticles(dt) {
  const oral = geo.oralOpen, nasal = geo.nasalOpen;
  const tot = oral + nasal;
  const fN = tot > 0.02 ? nasal / tot : 0.5;
  const Q = clamp(tot / 0.6, 0, 1) * flowMag;
  const uJ = (geo.nasalStart + 1) / (geo.oralPts.length - 1);
  const uJn = (geo.nasalStart + 1) / (geo.nasalPts.length - 1);
  for (let i = 0; i < NP; i++) {
    const p = P[i];
    const curve = p.b ? curveNasal : curveOral, pts = p.b ? geo.nasalPts : geo.oralPts, len = p.b ? lenNasal : lenOral;
    const inBranch = p.u > (p.b ? uJn : uJ);
    const g = interpAt(pts, p.u, 'g');
    let bf = 1;
    if (inBranch) bf = clamp((p.b ? fN : 1 - fN) * 2, 0, 1.6);
    const speed = 10 * Q * bf / (g + 0.3);
    const prev = p.u, uj = p.b ? uJn : uJ;
    p.u += flowDir * speed * dt / len;
    if (flowDir > 0 && prev < uj && p.u >= uj) { // choose route at the junction
      const nb = Math.random() < fN ? 1 : 0;
      if (nb !== p.b) { p.b = nb; p.u = (nb ? uJn : uJ) + 0.001; }
    }
    if (p.u > 1 || p.u < 0 || (inBranch && bf < 0.1)) {
      p.b = Math.random() < fN ? 1 : 0;
      p.u = flowDir >= 0 ? Math.random() * 0.03 : 1 - Math.random() * 0.03;
    }
    p.u = clamp(p.u, 0, 1);
    const pt = curve.getPoint(p.u);
    const r = clamp(g / 2 * 0.75, 0.02, 0.9);
    pPos[i * 3] = pt.x + p.j * r * 0.9; pPos[i * 3 + 1] = pt.y + p.k * r * 0.9; pPos[i * 3 + 2] = (p.j * p.k * 4) * r * interpAt(pts, p.u, 'lat');
    const c = gapColor(g, false, cur.press, interpAt(pts, p.u, 'ref') || 1.5);
    const bright = 0.35 + 0.65 * clamp(Q * 1.5, 0, 1);
    pCol[i * 3] = c[0] * bright; pCol[i * 3 + 1] = c[1] * bright; pCol[i * 3 + 2] = c[2] * bright;
  }
  pGeom.attributes.position.needsUpdate = true; pGeom.attributes.color.needsUpdate = true;
}

// ---------------- per-frame updates of meshes ----------------
let lastHf = -1;
function updateMeshes() {
  const hf = cur.hf, o = [0, 0];
  setRigid(headG, 1, hf);
  // jaw rotation about TMJ in head space
  const ja = -cur.jaw * 0.32;
  jawG.position.set(TMJ.x, TMJ.y, 0); jawG.rotation.z = ja; jawG.children.forEach(c => { if (!c.userData.off) { c.userData.off = true; c.position.x -= TMJ.x; c.position.y -= TMJ.y; } });
  // larynx group
  const wl = larW();
  const lm = new THREE.Matrix4();
  {
    const th = 0.15 * hf * wl; deformXY(0.8, -8 + cur.lx, wl, hf, o);
    lm.makeTranslation(o[0], o[1], 0).multiply(new THREE.Matrix4().makeRotationZ(th));
    larG.matrixAutoUpdate = false; larG.matrix.copy(lm); larG.matrixWorldNeedsUpdate = true;
  }
  // vocal folds
  const vib = cur.phon > 0.5 ? 0.05 + 0.07 * Math.abs(Math.sin(T * Math.PI * 2 * 6)) : 0;
  const abd = cur.phon > 0.5 ? 0.0 : (0.32 + (flowDir < 0 ? 0.1 * flowMag : 0));
  tvf.forEach(m => { m.rotation.y = m.userData.s * (abd + vib * 0.5); m.position.z = m.userData.s * vib * 0.5; });
  fvf.forEach(m => { m.position.z = m.userData.s * (0.03 + 0.5 * (1 - cur.fvf)); m.rotation.y = m.userData.s * abd * 0.4; });
  // trachea rings
  rings.forEach(r => {
    const i = r.userData.i, y0 = -9.85 - i * 0.78, y = y0 + cur.lx * (1 - i / 15) * 0.9;
    const x = lerp(0.72, 0.05, i / 14);
    deformXY(x, y, neckW(y), hf, o); r.position.set(o[0], o[1], 0); r.rotation.z = Math.PI / 2 + 0.0; r.rotation.set(Math.PI / 2, 0, Math.PI * 0.7);
  });
  // vertebrae
  verts.forEach(g => {
    const [x, y] = g.userData.base, w = neckW(y);
    deformXY(x, y, w, hf, o); g.position.set(o[0], o[1], 0);
    // forward head: lower cervical flexes forward, upper extends
    const i = g.userData.i;
    const extra = i < 7 ? hf * (i < 2 ? 0.1 : -0.18 * (1 - Math.abs(i - 4.5) / 4)) : 0;
    g.rotation.z = 0.15 * hf * w + extra;
  });
  // esophagus
  {
    const P = [], RA = [], RB = [], C = [];
    for (let i = 0; i < 40; i++) {
      const t = i / 39, y = lerp(-9.6 + cur.lx * 0.7, -38, t), x = lerp(-1.0, -1.6, t);
      deformXY(x, y, neckW(y), hf, o); P.push(V(o[0], o[1], 0)); RA.push(0.32); RB.push(0.85); C.push([1, 1, 1]);
    }
    esoph.update(P, RA, RB, C);
  }
  // skin
  if (Math.abs(hf - lastHf) > 1e-4) { skin.userData.deform(hf); lastHf = hf; }
  // lips
  lipU.position.set(0.35 * cur.lipRound, geo.lipU, 0); lipL.position.set(0.3 * cur.lipRound, geo.lipL, 0);
  lipU.scale.z = lipL.scale.z = 1 - 0.4 * cur.lipRound;
  straw.visible = cur.straw > 0.5; straw.position.set(12.1, -0.05, 0);
  // turbinates
  turbs.forEach(m => { const [a, b, c] = m.userData.base; m.scale.set(a, b * (1 + 0.9 * cur.turb), c * (1 + 1.1 * cur.turb)); });
  M.turb.color.setRGB(lerp(0.89, 0.95, cur.turb), lerp(0.54, 0.35, cur.turb), lerp(0.54, 0.38, cur.turb));
  // lymphoid
  const ar = 0.35 + 0.9 * cur.adenoid;
  adenoid.scale.set(ar * 0.9, ar, 1.3 * ar); adenoid.position.set(-0.55 + 0.55 * cur.adenoid, 3.55 - 0.45 * cur.adenoid, 0);
  tonsils.forEach(m => { const r = 0.38 + 0.6 * cur.tonsil; m.scale.set(r * 0.9, r * 1.3, r); m.position.set(0.9, -1.25, m.userData.s * (1.75 - 0.5 * cur.tonsil)); });
  // straps
  const W3 = (x, y, z, w) => { deformXY(x, y, w, hf, o); return V(o[0], o[1], z); };
  const hy = [2.55, -5.15 + cur.lx];
  const jawPt = (x, y) => { const c = Math.cos(ja), s = Math.sin(ja); const px = x - TMJ.x, py = y - TMJ.y; return [TMJ.x + px * c - py * s, TMJ.y + px * s + py * c]; };
  straps.scm.forEach(m => { const s = m.userData.s; setStrap(m, W3(5.9, -14.3, 1.8 * s, 0), W3(-3.8, 0.9, 5.4 * s, 1)); });
  straps.supra.forEach(m => { const s = m.userData.s; const c = jawPt(7.4, -3.2); setStrap(m, W3(hy[0], hy[1], 0.55 * s, wl), W3(c[0], c[1], 0.55 * s, 1)); });
  straps.infra.forEach(m => { const s = m.userData.s; setStrap(m, W3(5.8, -14.6, 1.0 * s, 0), W3(hy[0] - 0.2, hy[1] - 0.1, 0.8 * s, wl)); });
  straps.lev.forEach(m => { const s = m.userData.s; const v = VC[8]; setStrap(m, W3(-0.4, 4.6, 1.9 * s, 1), W3(v.x, v.y + 0.3, 0.8 * s, 1)); });
  straps.mass.forEach(m => { const s = m.userData.s; const c = jawPt(1.6, -3.0); setStrap(m, W3(3.6, 3.0, 5.6 * s, 1), W3(c[0], c[1], 4.9 * s, 1)); });
  // breathing body
  const b = cur.breath;
  lungs.forEach(m => { m.scale.set(5.6 * (1 + 0.06 * b), 10.5 * (1 + 0.08 * b), 4.9 * (1 + 0.1 * b)); m.position.y = -26.5 - 0.8 * b; });
  diaph.scale.set(8.0, 4.6 - 1.6 * b, 7.6); diaph.position.set(0.5, -38.5 - 1.8 * b, 0);
  ribG.scale.set(1 + 0.03 * b, 1, 1 + 0.06 * b);
  // sensations
  for (const k in SENS) {
    const [x, y, z, m] = SENS[k];
    const w = m === 'h' ? 1 : m === 'lar' ? wl : neckW(y);
    deformXY(x, m === 'lar' ? y + cur.lx : y, w, hf, o);
    const s = sensSprites[k];
    s.position.set(o[0], o[1], z);
    const on = LAYERS.sens && activeSens.includes(k);
    s.material.opacity = lerp(s.material.opacity, on ? 0.65 + 0.35 * Math.sin(T * 5) : 0, 0.12);
    const sc = 2.2 + 0.5 * Math.sin(T * 5); s.scale.set(sc, sc, 1);
  }
}

// ---------------- labels projection ----------------
const _v = new THREE.Vector3();
function updateLabels() {
  const show = LAYERS.labels;
  const dist = camera.position.distanceTo(controls.target);
  const rect = renderer.domElement.getBoundingClientRect();
  const small = rect.width < 600 ? 1 : 0;
  const maxLevel = (dist > 55 ? 1 : dist > 26 ? 2 : 3) - small;
  const o = [0, 0];
  LABELS.forEach(([k, , fn, lvl], i) => {
    const el = labelEls[i];
    if (!show || (lvl > maxLevel && k !== selected)) { el.style.display = 'none'; return; }
    let [x, y, z, w] = fn();
    if (w === 'lar') w = larW();
    deformXY(x, y, w, cur.hf, o);
    _v.set(o[0], o[1], z).project(camera);
    if (_v.z > 1) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.style.transform = `translate(${(_v.x * 0.5 + 0.5) * rect.width}px, ${(-_v.y * 0.5 + 0.5) * rect.height}px)`;
    el.classList.toggle('sel', k === selected);
  });
}

// ---------------- laryngoscope inset & meters ----------------
const scope = $('#scope'), sctx = scope.getContext('2d');
function drawScope() {
  const W = scope.width, H = scope.height, cx = W / 2;
  sctx.clearRect(0, 0, W, H);
  const top = H * 0.2, bot = H * 0.8;
  sctx.fillStyle = '#3a1418'; sctx.beginPath(); sctx.ellipse(cx, H / 2 + 4, W * 0.46, H * 0.42, 0, 0, Math.PI * 2); sctx.fill();
  sctx.fillStyle = '#e8b2a8'; sctx.beginPath(); sctx.ellipse(cx, top - 2, W * 0.2, H * 0.09, 0, Math.PI, 0); sctx.fill();
  const phon = cur.phon > 0.5;
  const vib = phon ? Math.abs(Math.sin(T * Math.PI * 2 * 6)) : 0;
  const g = phon ? W * (0.004 + 0.03 * vib) : W * (0.13 + (flowDir < 0 ? 0.04 * flowMag : 0)); // half-width of glottis at back
  const fv = cur.fvf;
  const fo = lerp(W * 0.1, -W * 0.06, fv); // false fold medial offset beyond true fold edge
  // glottis
  sctx.fillStyle = '#0b0405'; sctx.beginPath(); sctx.moveTo(cx, top); sctx.lineTo(cx - g, bot); sctx.lineTo(cx + g, bot); sctx.closePath(); sctx.fill();
  for (const s of [-1, 1]) {
    // true fold
    sctx.fillStyle = '#f7f2ec'; sctx.beginPath();
    sctx.moveTo(cx, top); sctx.lineTo(cx + s * g, bot); sctx.lineTo(cx + s * (g + W * 0.07), bot); sctx.lineTo(cx + s * W * 0.05, top); sctx.closePath(); sctx.fill();
    // ventricle shadow
    sctx.fillStyle = '#5a1d22'; sctx.beginPath();
    sctx.moveTo(cx + s * W * 0.05, top); sctx.lineTo(cx + s * (g + W * 0.07), bot); sctx.lineTo(cx + s * (g + W * 0.1), bot); sctx.lineTo(cx + s * W * 0.09, top); sctx.closePath(); sctx.fill();
    // false fold
    const i0 = W * 0.03 + Math.max(fo, -W * 0.03), i1 = g + W * 0.04 + fo;
    sctx.fillStyle = fv > 0.55 ? '#e0505c' : '#d77078'; sctx.beginPath();
    sctx.moveTo(cx + s * i0, top); sctx.lineTo(cx + s * Math.max(i1, 1), bot); sctx.lineTo(cx + s * (i1 + W * 0.17), bot); sctx.lineTo(cx + s * (i0 + W * 0.16), top); sctx.closePath(); sctx.fill();
    // arytenoid
    sctx.fillStyle = '#e19a96'; sctx.beginPath(); sctx.ellipse(cx + s * (g + W * 0.05), bot + 6, 10, 7, 0, 0, Math.PI * 2); sctx.fill();
  }
  sctx.fillStyle = '#9fb3bf'; sctx.font = '10px system-ui'; sctx.textAlign = 'center';
  sctx.fillText('front', cx, 10); sctx.fillText('back', cx, H - 2);
  
  $('#scopeState').innerHTML = (fv > 0.55 ? 'False folds squeezing in' : fv > 0.25 ? 'False folds partly narrowed' : 'False folds retracted') + `<br><span style="color:#9fb3bf">True folds: ${phon ? 'vibrating' : 'open (breathing)'}</span>`;
  $('#scopeState').className = fv > 0.55 ? 'bad' : fv > 0.25 ? 'mid' : 'good';
}
function meter(id, val, label, inverse) {
  const el = $(id); const v = clamp(val, 0, 1);
  el.querySelector('b').style.width = (v * 100).toFixed(0) + '%';
  const q = inverse ? 1 - v : v;
  el.querySelector('b').style.background = q > 0.66 ? '#4fd1a5' : q > 0.38 ? '#f2c14e' : '#ff5a5f';
  el.querySelector('em').textContent = label;
}
function updateMeters() {
  meter('#mPhar', geo.oroMin / 2.4, geo.oroMin > 1.6 ? 'wide' : geo.oroMin > 1.0 ? 'medium' : 'narrow');
  meter('#mLar', clamp((cur.lx + 1.2) / 2.8, 0, 1), cur.lx > 0.6 ? 'high (pulled up)' : cur.lx < -0.6 ? 'low' : 'neutral-low', true);
  meter('#mFvf', 1 - cur.fvf, cur.fvf > 0.55 ? 'constricted' : cur.fvf > 0.25 ? 'partly' : 'retracted');
  meter('#mVel', cur.vel, cur.vel > 0.8 ? 'raised · nose sealed' : cur.vel > 0.35 ? 'half · nasal leak' : 'lowered · nose open');
  $('#mVel b').style.background = '#7cc4ff';
  meter('#mNose', clamp(geo.nasalStruct / 0.85, 0, 1), geo.nasalStruct > 0.55 ? 'clear' : geo.nasalStruct > 0.3 ? 'narrowed' : 'blocked');
  meter('#mHead', 1 - cur.hf, cur.hf > 0.5 ? 'forward' : cur.hf > 0.2 ? 'slightly forward' : 'aligned');
}

// ---------------- camera presets ----------------
const CAMS = {
  context: { t: [1, -16, 0], p: [32, -6, 88] },
  head: { t: [2.0, -3.5, 0], p: [11, 2, 47] },
  throat: { t: [1.2, -1.8, 0], p: [3.5, -0.5, 25] },
  larynx: { t: [0.8, -7.4, 0], p: [4.5, -5, 12] },
  nose: { t: [3.8, 1.5, 0], p: [5.5, 3.0, 24] },
  front: { t: [2.5, -4, 0], p: [32, 5, 22] },
};
let camTween = null;
function goCam(name) {
  const c = CAMS[name]; if (!c) return;
  const o = [0, 0], w = name === 'larynx' ? neckW(-8 + (tgt.lx || 0)) : neckW(c.t[1]);
  deformXY(c.t[0], c.t[1] + (name === 'larynx' ? (tgt.lx || 0) : 0), w, tgt.hf || 0, o);
  const dx = o[0] - c.t[0], dy = o[1] - c.t[1];
  camTween = { t0: performance.now(), from: { p: camera.position.clone(), t: controls.target.clone() }, to: { p: V(c.p[0] + dx, c.p[1] + dy, c.p[2]), t: V(o[0], o[1], c.t[2]) } };
  document.querySelectorAll('[data-cam]').forEach(b => b.classList.toggle('on', b.dataset.cam === name));
}
function stepCam() {
  if (!camTween) return;
  const k = clamp((performance.now() - camTween.t0) / 1100, 0, 1), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  camera.position.lerpVectors(camTween.from.p, camTween.to.p, e);
  controls.target.lerpVectors(camTween.from.t, camTween.to.t, e);
  if (k >= 1) camTween = null;
}

// ---------------- UI ----------------
let selected = null;
function selectStruct(k) {
  selected = k;
  const s = STRUCTS[k]; if (!s) return;
  $('#info').innerHTML = `<h3>${s[0]}</h3><p>${s[1]}</p>`;
  $('#info').classList.add('show');
  if (activeTab !== 'explore') showTab('explore');
}
let activeTab = 'explore';
function showTab(id) {
  activeTab = id;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === id));
  document.querySelectorAll('.pane').forEach(p => p.classList.toggle('on', p.id === 'p-' + id));
}
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));
document.querySelectorAll('[data-cam]').forEach(b => b.addEventListener('click', () => goCam(b.dataset.cam)));
document.querySelectorAll('[data-layer]').forEach(b => b.addEventListener('click', () => {
  const l = b.dataset.layer; b.classList.toggle('on');
  const on = b.classList.contains('on');
  if (l === 'hud') { $('#hud').style.display = on ? '' : 'none'; return; }
  if (l === 'labels' || l === 'sens') LAYERS[l] = on;
  else if (l === 'section') { section = on; applyClip(); [tongueCap, velumCap, palateCap].forEach(m => m.visible = on && m.userData.layerOn !== false); }
  else LAYERS[l].forEach(m => { m.visible = on; m.userData.layerOn = on; if ([tongueCap, velumCap, palateCap].includes(m)) m.visible = on && section; });
}));

// explore chips
$('#chips').innerHTML = Object.entries(STRUCTS).map(([k, v]) => `<button class="chip" data-k="${k}">${v[0].replace(/ \(.*\)/, '')}</button>`).join('');
$('#chips').addEventListener('click', e => { const k = e.target.dataset?.k; if (k) selectStruct(k); });

// states
let mode = 'state', exercise = null, phaseIdx = 0, phaseT = 0, playing = true;
function setTargets(p) { for (const k in p) tgt[k] = p[k]; }
function applyState(id) {
  const s = STATES.find(x => x.id === id); if (!s) return;
  stopExercise();
  mode = 'state';
  setTargets({ ...BASE, ...s.params });
  $('#stateText').innerHTML = s.text;
  document.querySelectorAll('[data-state]').forEach(b => b.classList.toggle('on', b.dataset.state === id));
  $('#morph').value = id === 'throaty' ? 0 : id === 'open' ? 100 : $('#morph').value;
  goCam(s.cam);
  setCaption(s.name.replace(/^[^\w]+/, ''), s.text.replace(/<[^>]+>/g, '').split('. ')[0] + '.');
}
$('#states').innerHTML = STATES.map(s => `<button class="state" data-state="${s.id}">${s.name}</button>`).join('');
$('#states').addEventListener('click', e => { const id = e.target.dataset?.state; if (id) applyState(id); });
$('#morph').addEventListener('input', e => {
  stopExercise(); mode = 'state';
  const t = e.target.value / 100; const p = {};
  for (const k in OPEN) p[k] = typeof OPEN[k] === 'number' ? lerp(THROATY[k] ?? OPEN[k], OPEN[k], t) : OPEN[k];
  setTargets({ ...BASE, ...p, phon: 1, flow: 1, auto: 0 });
  document.querySelectorAll('[data-state]').forEach(b => b.classList.remove('on'));
  $('#stateText').innerHTML = `<b>${Math.round(t * 100)}% open.</b> Watch the air column change from red to blue as the larynx drops, the tongue root moves forward, the walls relax, the false folds retract and the head realigns.`;
});
$('#structs').innerHTML = STRUCT_TOGGLES.map(s => `<label class="sl"><span><b>${s.name}</b><small>${s.text}</small></span><input type="range" min="0" max="100" value="0" data-sid="${s.id}"></label>`).join('');
$('#structs').addEventListener('input', e => { const id = e.target.dataset?.sid; if (id) { tgt[id] = e.target.value / 100; } });

// exercises
$('#exList').innerHTML = EXERCISES.map((x, i) => `<button class="ex" data-ex="${x.id}"><span class="n">${i + 1}</span><span><b>${x.name}</b><small>${x.tag}</small></span><span class="play">▶</span></button>`).join('');
$('#exList').addEventListener('click', e => { const b = e.target.closest('[data-ex]'); if (b) startExercise(b.dataset.ex); });
function exDetail(x) {
  return `<div class="exd"><h3>${x.name}</h3><p class="goal">${x.goal}</p>
  <h4>How to do it</h4><ol>${x.how.map(h => `<li>${h}</li>`).join('')}</ol>
  <h4>What you should feel</h4><p>${x.feel}</p>
  <h4>Common mistakes</h4><ul>${x.mistakes.map(h => `<li>${h}</li>`).join('')}</ul>
  <h4>Dose</h4><p>${x.dose}</p>
  <h4>Evidence & rationale</h4><p class="ev">${x.evidence}</p></div>`;
}
function startExercise(id) {
  const x = EXERCISES.find(e => e.id === id); if (!x) return;
  exercise = x; phaseIdx = 0; phaseT = 0; mode = 'ex'; playing = true;
  setTargets({ ...BASE, ...x.base, ...x.phases[0].p, auto: 0 });
  document.querySelectorAll('[data-ex]').forEach(b => b.classList.toggle('on', b.dataset.ex === id));
  $('#exDetail').innerHTML = exDetail(x);
  goCam(x.cam);
  $('#ctrls').classList.add('show');
  renderPhase();
  if (activeTab !== 'exercises') showTab('exercises');
}
function stopExercise() {
  exercise = null; activeSens = [];
  $('#ctrls').classList.remove('show');
  document.querySelectorAll('[data-ex]').forEach(b => b.classList.remove('on'));
}
function renderPhase() {
  const ph = exercise.phases[phaseIdx];
  setTargets({ ...BASE, ...exercise.base, ...ph.p, auto: 0 });
  activeSens = ph.sens || [];
  setCaption(`${exercise.name} · step ${phaseIdx + 1}/${exercise.phases.length}`, ph.cap);
  $('#dots').innerHTML = exercise.phases.map((_, i) => `<i class="${i === phaseIdx ? 'on' : i < phaseIdx ? 'done' : ''}"></i>`).join('');
}
function setCaption(title, text) { $('#capTitle').textContent = title; $('#capText').textContent = text; }
$('#bPrev').addEventListener('click', () => { if (!exercise) return; phaseIdx = (phaseIdx - 1 + exercise.phases.length) % exercise.phases.length; phaseT = 0; renderPhase(); });
$('#bNext').addEventListener('click', () => { if (!exercise) return; phaseIdx = (phaseIdx + 1) % exercise.phases.length; phaseT = 0; renderPhase(); });
$('#bPlay').addEventListener('click', () => { playing = !playing; $('#bPlay').textContent = playing ? '❚❚' : '▶'; });
$('#bStop').addEventListener('click', () => { applyState('open'); });
$('#speed').addEventListener('input', e => { speed = e.target.value / 100; });
let speed = 1;

// static panes
$('#checks').innerHTML = CHECKS.map(([a, b]) => `<div class="card"><h4>${a}</h4><p>${b}</p></div>`).join('');
$('#plan').innerHTML = PLAN;
$('#sources').innerHTML = SOURCES.map(([a, b]) => `<li><a href="${b}" target="_blank" rel="noopener">${a}</a></li>`).join('');

// picking
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(); let down = null;
renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
  const r = renderer.domElement.getBoundingClientRect();
  mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  const hits = ray.intersectObjects(pickables.filter(m => m.visible && m.userData.key), false);
  const h = hits.find(h => !h.object.material.clippingPlanes || !section || h.point.z <= 0.01);
  if (h) selectStruct(h.object.userData.key);
});

// ---------------- resize & loop ----------------
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize); resize();

applyClip();
updateTongue(true);
let last = performance.now();
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  // exercise sequencing
  if (mode === 'ex' && exercise && playing) {
    phaseT += dt * speed;
    if (phaseT > exercise.phases[phaseIdx].d) { phaseIdx = (phaseIdx + 1) % exercise.phases.length; phaseT = 0; renderPhase(); }
    $('#prog').style.width = (100 * phaseT / exercise.phases[phaseIdx].d).toFixed(1) + '%';
  }
  // auto breathing
  if (tgt.auto > 0.5) {
    const ph = T * 0.9; tgt.breath = 0.5 + 0.5 * Math.sin(ph); tgt.flow = Math.cos(ph) > 0 ? -1 : 1;
    flowMag = lerp(flowMag, Math.min(1, Math.abs(Math.cos(ph)) * 1.4), 0.1);
  } else flowMag = lerp(flowMag, Math.abs(tgt.flow) > 0.1 ? 1 : 0.0, 0.08);
  flowDir = (tgt.flow || 0) >= 0 ? 1 : -1;
  // smooth params
  for (const k in tgt) {
    if (typeof tgt[k] !== 'number') continue;
    const r = RATE[k] || 3.2;
    cur[k] = lerp(cur[k], tgt[k], 1 - Math.exp(-dt * r));
  }
  ['straw', 'trill', 'ttrill', 'auto'].forEach(k => cur[k] = tgt[k]);
  computeGeometry();
  updateTongue(false); updateVelum(VC); updateSeptum();
  updateWall(WALL);
  updateMeshes();
  updateAir(); updateParticles(dt);
  stepCam(); controls.update();
  renderer.render(scene, camera);
  updateLabels(); updateWarn();
  drawScope(); updateMeters();
  requestAnimationFrame(tick);
}
applyState('rest');
goCam('head');
if (window.innerWidth < 900) { $('#hud').style.display = 'none'; document.querySelector('[data-layer=hud]').classList.remove('on'); }
requestAnimationFrame(tick);
window.__ready = true;
