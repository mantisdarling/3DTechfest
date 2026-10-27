import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// LOADER
// ============================================================
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loaderBar');
const loaderLabel = document.getElementById('loaderLabel');

let loadProgress = 0;
const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 14;
  if (loadProgress > 100) loadProgress = 100;
  loaderBar.style.width = loadProgress + '%';
  loaderLabel.textContent = `INITIALIZING SYSTEMS — ${Math.floor(loadProgress)}%`;
  if (loadProgress >= 100) {
    clearInterval(loadInterval);
    setTimeout(() => {
      loader.classList.add('hidden');
      startHeroAnimations();
    }, 400);
  }
}, 80);

// ============================================================
// CUSTOM CURSOR
// ============================================================
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
let fx = cx, fy = cy;

window.addEventListener('mousemove', (e) => {
  cx = e.clientX;
  cy = e.clientY;
  gsap.to(cursor, { x: cx, y: cy, duration: 0.05, ease: 'none' });
});

function animateCursorFollower() {
  fx += (cx - fx) * 0.1;
  fy += (cy - fy) * 0.1;
  gsap.set(cursorFollower, { x: fx, y: fy });
  requestAnimationFrame(animateCursorFollower);
}
animateCursorFollower();

// ============================================================
// SCROLL PROGRESS
// ============================================================
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = ((scrolled / total) * 100) + '%';
});

// ============================================================
// NAV SCROLL BEHAVIOR
// ============================================================
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ============================================================
// THREE.JS ENGINE
// ============================================================
const canvas = document.getElementById('webgl');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0, 6);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ---- LIGHTS ----
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x4FC3F7, 8, 30);
pointLight1.position.set(4, 3, 4);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x7C3AED, 6, 25);
pointLight2.position.set(-5, -2, 3);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0x10B981, 4, 20);
pointLight3.position.set(0, 5, -4);
scene.add(pointLight3);

// ---- PARTICLE FIELD ----
const PARTICLE_COUNT = 2200;
const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
const particleSizes = new Float32Array(PARTICLE_COUNT);
const particleAlphas = new Float32Array(PARTICLE_COUNT);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 80;
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
  particleSizes[i] = 0.5 + Math.random() * 1.5;
  particleAlphas[i] = 0.2 + Math.random() * 0.6;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

const particleMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.04,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.55,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ---- HERO OBJECT: WIREFRAME ICOSAHEDRON ----
const icoGeo = new THREE.IcosahedronGeometry(1.8, 1);
const icoEdges = new THREE.EdgesGeometry(icoGeo);
const icoMat = new THREE.LineBasicMaterial({
  color: 0x4FC3F7,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending
});
const icoMesh = new THREE.LineSegments(icoEdges, icoMat);
icoMesh.position.set(3.5, 0, 0);
scene.add(icoMesh);

// inner solid ico
const innerIcoGeo = new THREE.IcosahedronGeometry(1.4, 0);
const innerIcoMat = new THREE.MeshStandardMaterial({
  color: 0x050510,
  emissive: 0x0a0a20,
  metalness: 0.9,
  roughness: 0.1,
  transparent: true,
  opacity: 0.8
});
const innerIco = new THREE.Mesh(innerIcoGeo, innerIcoMat);
innerIco.position.copy(icoMesh.position);
scene.add(innerIco);

// ---- FLOATING TORUS ----
const torusGeo = new THREE.TorusGeometry(0.9, 0.2, 16, 60);
const torusMat = new THREE.MeshStandardMaterial({
  color: 0x7C3AED,
  emissive: 0x3b0072,
  metalness: 0.85,
  roughness: 0.15,
  wireframe: false
});
const torus = new THREE.Mesh(torusGeo, torusMat);
torus.position.set(3.5, 0, 0);
torus.rotation.x = Math.PI * 0.3;
scene.add(torus);

// ---- SECTION 2: ABOUT — ROTATING RINGS ----
const ring1Geo = new THREE.TorusGeometry(2.2, 0.025, 8, 120);
const ring1Mat = new THREE.MeshBasicMaterial({
  color: 0x4FC3F7,
  transparent: true,
  opacity: 0.3,
  blending: THREE.AdditiveBlending
});
const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
ring1.visible = false;
scene.add(ring1);

const ring2Geo = new THREE.TorusGeometry(2.8, 0.02, 8, 120);
const ring2Mat = new THREE.MeshBasicMaterial({
  color: 0x7C3AED,
  transparent: true,
  opacity: 0.25,
  blending: THREE.AdditiveBlending
});
const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
ring2.rotation.x = Math.PI * 0.4;
ring2.visible = false;
scene.add(ring2);

// ---- SECTION 4: STATS — SPHERE ----
const sphereGeo = new THREE.SphereGeometry(2, 36, 36);
const sphereEdgesGeo = new THREE.EdgesGeometry(sphereGeo);
const sphereMat = new THREE.LineBasicMaterial({
  color: 0x10B981,
  transparent: true,
  opacity: 0.3,
  blending: THREE.AdditiveBlending
});
const sphereMesh = new THREE.LineSegments(sphereEdgesGeo, sphereMat);
sphereMesh.visible = false;
scene.add(sphereMesh);

// ---- GRID PLANE ----
const gridHelper = new THREE.GridHelper(60, 60, 0x111122, 0x0a0a1a);
gridHelper.position.y = -4;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.5;
scene.add(gridHelper);

// ---- SECTION 3: EVENTS — FLOATING TETRAHEDRA ----
const tetraGroup = new THREE.Group();
tetraGroup.visible = false;
scene.add(tetraGroup);

const tetraColors = [0x4FC3F7, 0x7C3AED, 0x10B981, 0xF59E0B, 0xEF4444, 0x06B6D4];
for (let i = 0; i < 6; i++) {
  const geo = new THREE.TetrahedronGeometry(0.35 + Math.random() * 0.2, 0);
  const edges = new THREE.EdgesGeometry(geo);
  const mat = new THREE.LineBasicMaterial({
    color: tetraColors[i],
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });
  const mesh = new THREE.LineSegments(edges, mat);
  const angle = (i / 6) * Math.PI * 2;
  mesh.position.set(
    Math.cos(angle) * 3,
    (Math.random() - 0.5) * 3,
    Math.sin(angle) * 2
  );
  mesh.userData = {
    floatSpeed: 0.4 + Math.random() * 0.6,
    floatOffset: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.03
  };
  tetraGroup.add(mesh);
}

// ---- SECTION 5: REGISTER — DNA HELIX ----
const helixGroup = new THREE.Group();
helixGroup.visible = false;
scene.add(helixGroup);

const helixMat = new THREE.MeshBasicMaterial({
  color: 0x4FC3F7,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending
});
const helixMat2 = new THREE.MeshBasicMaterial({
  color: 0x7C3AED,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending
});

for (let i = 0; i < 40; i++) {
  const t = (i / 40) * Math.PI * 6 - Math.PI * 3;
  const geo = new THREE.SphereGeometry(0.07, 6, 6);

  const m1 = new THREE.Mesh(geo, helixMat);
  m1.position.set(Math.cos(t) * 1.2, t * 0.38, Math.sin(t) * 0.4);
  helixGroup.add(m1);

  const m2 = new THREE.Mesh(geo, helixMat2);
  m2.position.set(Math.cos(t + Math.PI) * 1.2, t * 0.38, Math.sin(t + Math.PI) * 0.4);
  helixGroup.add(m2);

  if (i % 4 === 0) {
    const bridgeGeo = new THREE.BufferGeometry().setFromPoints([
      m1.position.clone(),
      m2.position.clone()
    ]);
    const bridgeMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });
    helixGroup.add(new THREE.Line(bridgeGeo, bridgeMat));
  }
}

helixGroup.position.set(3, 0, 0);

// ---- MOUSE 3D PARALLAX ----
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

window.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ============================================================
// SCROLL-DRIVEN SCENE TRANSITIONS (GSAP SCROLLTRIGGER)
// ============================================================
const totalSections = 6;

// Each section controls camera + object visibility
function setupScrollAnimations() {

  // Section 0 → 1: Hero to About
  ScrollTrigger.create({
    trigger: '#sec-about',
    start: 'top 80%',
    end: 'top 20%',
    scrub: 1.5,
    onUpdate: (self) => {
      const p = self.progress;
      // Camera drifts left and in
      gsap.set(camera.position, {
        x: gsap.utils.interpolate(0, -4, p),
        y: gsap.utils.interpolate(0, 1.5, p),
        z: gsap.utils.interpolate(6, 4.5, p)
      });
      // Hero ico fades
      icoMesh.material.opacity = gsap.utils.interpolate(0.6, 0, p);
      innerIco.material.opacity = gsap.utils.interpolate(0.8, 0, p);
      torus.material.opacity = gsap.utils.interpolate(1, 0, p);
      // Rings appear
      ring1.visible = true;
      ring2.visible = true;
      ring1.material.opacity = gsap.utils.interpolate(0, 0.3, p);
      ring2.material.opacity = gsap.utils.interpolate(0, 0.25, p);
    }
  });

  // Section 2: Events — tetrahedra
  ScrollTrigger.create({
    trigger: '#sec-events',
    start: 'top 80%',
    end: 'top 20%',
    scrub: 1.5,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set(camera.position, {
        x: gsap.utils.interpolate(-4, 0, p),
        y: gsap.utils.interpolate(1.5, 0, p),
        z: gsap.utils.interpolate(4.5, 5, p)
      });
      ring1.material.opacity = gsap.utils.interpolate(0.3, 0, p);
      ring2.material.opacity = gsap.utils.interpolate(0.25, 0, p);
      tetraGroup.visible = true;
      tetraGroup.children.forEach((child, i) => {
        if (child.material) {
          child.material.opacity = gsap.utils.interpolate(0, 0.7, p);
        }
      });
    }
  });

  // Section 3: Speakers — rings come back
  ScrollTrigger.create({
    trigger: '#sec-speakers',
    start: 'top 80%',
    end: 'top 20%',
    scrub: 1.5,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set(camera.position, {
        x: gsap.utils.interpolate(0, 3, p),
        y: gsap.utils.interpolate(0, -1, p),
        z: gsap.utils.interpolate(5, 5.5, p)
      });
      tetraGroup.children.forEach(child => {
        if (child.material) {
          child.material.opacity = gsap.utils.interpolate(0.7, 0, p);
        }
      });
    }
  });

  // Section 4: Stats — sphere
  ScrollTrigger.create({
    trigger: '#sec-stats',
    start: 'top 80%',
    end: 'top 20%',
    scrub: 1.5,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set(camera.position, {
        x: gsap.utils.interpolate(3, 0, p),
        y: gsap.utils.interpolate(-1, 0.5, p),
        z: gsap.utils.interpolate(5.5, 5, p)
      });
      sphereMesh.visible = true;
      sphereMesh.material.opacity = gsap.utils.interpolate(0, 0.3, p);
      sphereMesh.scale.setScalar(gsap.utils.interpolate(0.4, 1, p));
    }
  });

  // Section 5: Register — helix
  ScrollTrigger.create({
    trigger: '#sec-register',
    start: 'top 80%',
    end: 'top 20%',
    scrub: 1.5,
    onUpdate: (self) => {
      const p = self.progress;
      sphereMesh.material.opacity = gsap.utils.interpolate(0.3, 0, p);
      helixGroup.visible = true;
      helixGroup.children.forEach(child => {
        if (child.material) {
          child.material.opacity = child.material.opacity = gsap.utils.interpolate(0, 0.7, p);
        }
      });
    }
  });
}

setupScrollAnimations();

// ============================================================
// HERO ENTRANCE ANIMATIONS
// ============================================================
function startHeroAnimations() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('#heroBadge', { opacity: 1, y: 0, duration: 0.8 }, 0.2)
    .to('#titleLine1', { opacity: 1, y: 0, duration: 1 }, 0.5)
    .to('#titleLine2', { opacity: 1, y: 0, duration: 1 }, 0.7)
    .to('#heroSub', { opacity: 1, y: 0, duration: 0.8 }, 0.9)
    .to('#heroMeta', { opacity: 1, y: 0, duration: 0.8 }, 1.1)
    .to('#heroActions', { opacity: 1, y: 0, duration: 0.8 }, 1.3)
    .to('#scrollHint', { opacity: 1, duration: 0.8 }, 1.6)
    .to(icoMesh.position, { x: 3.5, duration: 1.2, ease: 'power2.out' }, 0.5)
    .from(icoMesh.position, { x: 8, duration: 1.2, ease: 'power2.out' }, 0.5)
    .from(innerIco.position, { x: 8, duration: 1.2, ease: 'power2.out' }, 0.5)
    .from(torus.position, { x: 8, y: -3, duration: 1.4, ease: 'power2.out' }, 0.6);
}

// ============================================================
// SECTION FADE-IN TRIGGERS
// ============================================================
document.querySelectorAll('.section-title, .section-body, .about-card, .event-card, .speaker-card, .stat-block, .panel-label, .section-sub, .hero-meta, .about-cta, .reg-tag, .reg-body, .reg-actions').forEach((el, i) => {
  el.classList.add('fade-up');
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: (i % 4) * 0.08,
        ease: 'power3.out',
        onStart: () => el.classList.add('visible')
      });
    }
  });
});

// ============================================================
// STATS COUNTER ANIMATION
// ============================================================
document.querySelectorAll('.stat-block').forEach((block, i) => {
  const target = parseInt(block.dataset.count);
  const suffix = block.dataset.suffix || '';
  const el = block.querySelector('.stat-number');

  ScrollTrigger.create({
    trigger: block,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to({ val: 0 }, {
        val: target,
        duration: 2.5,
        ease: 'power2.out',
        delay: i * 0.15,
        onUpdate() {
          el.textContent = Math.floor(this.targets()[0].val).toLocaleString() + suffix;
        }
      });
    }
  });
});

// ============================================================
// 3D CARD TILT ON HOVER
// ============================================================
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateX: -y * 12,
      rotateY: x * 12,
      transformPerspective: 600,
      duration: 0.4,
      ease: 'power2.out'
    });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: 'power2.out'
    });
  });
});

// ============================================================
// RENDER LOOP
// ============================================================
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  const delta = clock.getDelta ? 0.016 : 0.016;

  // Mouse parallax on camera
  mouseX += (targetMouseX - mouseX) * 0.04;
  mouseY += (targetMouseY - mouseY) * 0.04;
  camera.rotation.x = -mouseY * 0.06;
  camera.rotation.y = -mouseX * 0.06;

  // Particle drift
  particles.rotation.y = t * 0.015;
  particles.rotation.x = t * 0.008;

  // Hero objects
  icoMesh.rotation.x = t * 0.25;
  icoMesh.rotation.y = t * 0.38;
  innerIco.rotation.x = -t * 0.2;
  innerIco.rotation.y = -t * 0.3;
  torus.rotation.y = t * 0.5;
  torus.rotation.z = t * 0.18;

  // Float torus
  torus.position.y = Math.sin(t * 0.8) * 0.4;
  innerIco.position.y = Math.sin(t * 0.6 + 0.5) * 0.2;

  // Point light animation
  pointLight1.position.x = 4 + Math.sin(t * 0.5) * 2;
  pointLight1.position.y = 3 + Math.cos(t * 0.4) * 1.5;
  pointLight2.position.x = -5 + Math.cos(t * 0.3) * 2;
  pointLight2.position.y = -2 + Math.sin(t * 0.6) * 1;

  // About rings
  if (ring1.visible) {
    ring1.rotation.z = t * 0.4;
    ring1.rotation.x = Math.PI * 0.3 + Math.sin(t * 0.3) * 0.1;
    ring2.rotation.y = t * 0.3;
    ring2.rotation.z = -t * 0.2;
  }

  // Events tetrahedra
  if (tetraGroup.visible) {
    tetraGroup.children.forEach((child) => {
      if (child.userData.floatSpeed) {
        child.position.y += Math.sin(t * child.userData.floatSpeed + child.userData.floatOffset) * 0.003;
        child.rotation.x += child.userData.rotSpeed;
        child.rotation.y += child.userData.rotSpeed * 0.7;
      }
    });
    tetraGroup.rotation.y = t * 0.1;
  }

  // Stats sphere
  if (sphereMesh.visible) {
    sphereMesh.rotation.y = t * 0.2;
    sphereMesh.rotation.x = t * 0.12;
  }

  // Register helix
  if (helixGroup.visible) {
    helixGroup.rotation.y = t * 0.3;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// ============================================================
// SMOOTH ANCHOR SCROLL
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
