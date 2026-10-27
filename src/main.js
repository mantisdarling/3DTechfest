import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// SYSTEM LOADER
// ============================================================
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loaderBar');
const loaderLabel = document.getElementById('loaderLabel');

let loadProgress = 0;
const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 16 + 6;
  if (loadProgress > 100) loadProgress = 100;
  if (loaderBar) loaderBar.style.width = `${loadProgress}%`;
  if (loaderLabel) loaderLabel.textContent = `INITIALIZING SYSTEMS ${Math.floor(loadProgress)} PERCENT`;
  
  if (loadProgress >= 100) {
    clearInterval(loadInterval);
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
      startHeroAnimations();
    }, 320);
  }
}, 60);

// ============================================================
// TOP SCROLL PROGRESS
// ============================================================
const scrollProgressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollProgressBar && total > 0) {
    scrollProgressBar.style.width = `${(scrolled / total) * 100}%`;
  }
}, { passive: true });

// ============================================================
// NAVIGATION BLUR
// ============================================================
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
}, { passive: true });

// ============================================================
// SYNTHWAVE NEON THREE.JS 3D ENGINE
// ============================================================
const canvas = document.getElementById('webgl');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 150);
camera.position.set(0, 0, 6);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.setClearColor(0x000000, 0);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
});

// Ambient & 3 Synthwave Dynamic Point Lights (Magenta Violet, Sunset Coral, Cyan)
const ambientLight = new THREE.AmbientLight(0x160824, 0.6);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xE024C3, 9.5, 34);
pointLight1.position.set(4, 3, 4);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xFF5E3A, 8, 30);
pointLight2.position.set(-5, -2, 3);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0x06B6D4, 5.5, 24);
pointLight3.position.set(0, 5, -4);
scene.add(pointLight3);

// Star Particle Field (Optimized to 1,200 for 60 FPS performance)
const PARTICLE_COUNT = 1200;
const particlePositions = new Float32Array(PARTICLE_COUNT * 3);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 75;
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 75;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 55;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

const particleMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.045,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.52,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Hero Object: Neon Magenta Wireframe Icosahedron & Obsidian Core
const icoGeo = new THREE.IcosahedronGeometry(1.8, 1);
const icoEdges = new THREE.EdgesGeometry(icoGeo);
const icoMat = new THREE.LineBasicMaterial({
  color: 0xE024C3,
  transparent: true,
  opacity: 0.65,
  blending: THREE.AdditiveBlending
});
const icoMesh = new THREE.LineSegments(icoEdges, icoMat);
icoMesh.position.set(3.4, 0, 0);
scene.add(icoMesh);

const innerIcoGeo = new THREE.IcosahedronGeometry(1.38, 0);
const innerIcoMat = new THREE.MeshStandardMaterial({
  color: 0x080210,
  emissive: 0x1f062c,
  metalness: 0.88,
  roughness: 0.15,
  transparent: true,
  opacity: 0.88
});
const innerIco = new THREE.Mesh(innerIcoGeo, innerIcoMat);
innerIco.position.copy(icoMesh.position);
scene.add(innerIco);

// Radiant Sunset Coral Orbiting Torus
const torusGeo = new THREE.TorusGeometry(0.92, 0.18, 16, 50);
const torusMat = new THREE.MeshStandardMaterial({
  color: 0xFF5E3A,
  emissive: 0x6e1b00,
  metalness: 0.82,
  roughness: 0.2
});
const torus = new THREE.Mesh(torusGeo, torusMat);
torus.position.set(3.4, 0, 0);
torus.rotation.x = Math.PI * 0.32;
scene.add(torus);

// Section 1 About: Rotating Celestial Rings
const ring1Geo = new THREE.TorusGeometry(2.3, 0.024, 8, 100);
const ring1Mat = new THREE.MeshBasicMaterial({
  color: 0xFF5E3A,
  transparent: true,
  opacity: 0.32,
  blending: THREE.AdditiveBlending
});
const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
ring1.visible = false;
scene.add(ring1);

const ring2Geo = new THREE.TorusGeometry(2.9, 0.02, 8, 100);
const ring2Mat = new THREE.MeshBasicMaterial({
  color: 0xE024C3,
  transparent: true,
  opacity: 0.28,
  blending: THREE.AdditiveBlending
});
const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
ring2.rotation.x = Math.PI * 0.42;
ring2.visible = false;
scene.add(ring2);

// Section 2 Events: Floating Synthwave Polyhedra
const tetraGroup = new THREE.Group();
tetraGroup.visible = false;
scene.add(tetraGroup);

const tetraColors = [0xE024C3, 0xFF5E3A, 0x06B6D4, 0xF59E0B, 0xA855F7, 0xEC4899];
for (let i = 0; i < 6; i++) {
  const geo = new THREE.TetrahedronGeometry(0.38, 0);
  const edges = new THREE.EdgesGeometry(geo);
  const mat = new THREE.LineBasicMaterial({
    color: tetraColors[i],
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending
  });
  const mesh = new THREE.LineSegments(edges, mat);
  const angle = (i / 6) * Math.PI * 2;
  mesh.position.set(
    Math.cos(angle) * 3.2,
    (Math.random() - 0.5) * 3,
    Math.sin(angle) * 2.2
  );
  mesh.userData = {
    floatSpeed: 0.4 + Math.random() * 0.5,
    floatOffset: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.025
  };
  tetraGroup.add(mesh);
}

// Section 4 Stats: Sunset Coral Coordinate Sphere
const sphereGeo = new THREE.SphereGeometry(2, 28, 28);
const sphereEdgesGeo = new THREE.EdgesGeometry(sphereGeo);
const sphereMat = new THREE.LineBasicMaterial({
  color: 0xFF5E3A,
  transparent: true,
  opacity: 0.32,
  blending: THREE.AdditiveBlending
});
const sphereMesh = new THREE.LineSegments(sphereEdgesGeo, sphereMat);
sphereMesh.visible = false;
scene.add(sphereMesh);

// Section 5 Register: Synthwave Double Helix
const helixGroup = new THREE.Group();
helixGroup.visible = false;
scene.add(helixGroup);

const helixMat1 = new THREE.MeshBasicMaterial({
  color: 0xE024C3,
  transparent: true,
  opacity: 0.68,
  blending: THREE.AdditiveBlending
});
const helixMat2 = new THREE.MeshBasicMaterial({
  color: 0xFF5E3A,
  transparent: true,
  opacity: 0.68,
  blending: THREE.AdditiveBlending
});

for (let i = 0; i < 36; i++) {
  const t = (i / 36) * Math.PI * 6 - Math.PI * 3;
  const dotGeo = new THREE.SphereGeometry(0.065, 6, 6);

  const m1 = new THREE.Mesh(dotGeo, helixMat1);
  m1.position.set(Math.cos(t) * 1.2, t * 0.38, Math.sin(t) * 0.4);
  helixGroup.add(m1);

  const m2 = new THREE.Mesh(dotGeo, helixMat2);
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
      opacity: 0.16,
      blending: THREE.AdditiveBlending
    });
    helixGroup.add(new THREE.Line(bridgeGeo, bridgeMat));
  }
}
helixGroup.position.set(3, 0, 0);

// Synthwave Violet Coordinate Ground Grid
const gridHelper = new THREE.GridHelper(60, 50, 0x2D0D4B, 0x120422);
gridHelper.position.y = -4;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.5;
scene.add(gridHelper);

// Mouse 3D Parallax Tracking
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

window.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

// ============================================================
// SCROLL-DRIVEN 3D CAMERA & OBJECT TRANSITIONS
// ============================================================
function setupScrollTransitions() {
  // Hero to About
  ScrollTrigger.create({
    trigger: '#about',
    start: 'top 80%',
    end: 'top 20%',
    scrub: 1.2,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set(camera.position, {
        x: gsap.utils.interpolate(0, -3.8, p),
        y: gsap.utils.interpolate(0, 1.4, p),
        z: gsap.utils.interpolate(6, 4.6, p)
      });
      icoMesh.material.opacity = gsap.utils.interpolate(0.65, 0, p);
      innerIco.material.opacity = gsap.utils.interpolate(0.88, 0, p);
      torus.material.opacity = gsap.utils.interpolate(1, 0, p);
      
      ring1.visible = true;
      ring2.visible = true;
      ring1.material.opacity = gsap.utils.interpolate(0, 0.32, p);
      ring2.material.opacity = gsap.utils.interpolate(0, 0.28, p);
    }
  });

  // Events Section
  ScrollTrigger.create({
    trigger: '#events',
    start: 'top 80%',
    end: 'top 20%',
    scrub: 1.2,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set(camera.position, {
        x: gsap.utils.interpolate(-3.8, 0, p),
        y: gsap.utils.interpolate(1.4, 0, p),
        z: gsap.utils.interpolate(4.6, 5.2, p)
      });
      ring1.material.opacity = gsap.utils.interpolate(0.32, 0, p);
      ring2.material.opacity = gsap.utils.interpolate(0.28, 0, p);
      
      tetraGroup.visible = true;
      tetraGroup.children.forEach((child) => {
        if (child.material) {
          child.material.opacity = gsap.utils.interpolate(0, 0.72, p);
        }
      });
    }
  });

  // Speakers Section
  ScrollTrigger.create({
    trigger: '#speakers',
    start: 'top 80%',
    end: 'top 20%',
    scrub: 1.2,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set(camera.position, {
        x: gsap.utils.interpolate(0, 3, p),
        y: gsap.utils.interpolate(0, -1, p),
        z: gsap.utils.interpolate(5.2, 5.5, p)
      });
      tetraGroup.children.forEach((child) => {
        if (child.material) {
          child.material.opacity = gsap.utils.interpolate(0.72, 0, p);
        }
      });
    }
  });

  // Stats Section
  ScrollTrigger.create({
    trigger: '#stats',
    start: 'top 80%',
    end: 'top 20%',
    scrub: 1.2,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set(camera.position, {
        x: gsap.utils.interpolate(3, 0, p),
        y: gsap.utils.interpolate(-1, 0.4, p),
        z: gsap.utils.interpolate(5.5, 5, p)
      });
      sphereMesh.visible = true;
      sphereMesh.material.opacity = gsap.utils.interpolate(0, 0.32, p);
      sphereMesh.scale.setScalar(gsap.utils.interpolate(0.4, 1, p));
    }
  });

  // Register Section
  ScrollTrigger.create({
    trigger: '#register',
    start: 'top 80%',
    end: 'top 20%',
    scrub: 1.2,
    onUpdate: (self) => {
      const p = self.progress;
      sphereMesh.material.opacity = gsap.utils.interpolate(0.32, 0, p);
      helixGroup.visible = true;
      helixGroup.children.forEach((child) => {
        if (child.material) {
          child.material.opacity = gsap.utils.interpolate(0, 0.68, p);
        }
      });
    }
  });
}

// ============================================================
// HERO ENTRANCE
// ============================================================
function startHeroAnimations() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('#heroBadge', { opacity: 1, y: 0, duration: 0.7 }, 0.15)
    .to('#titleLine1', { opacity: 1, y: 0, duration: 0.8 }, 0.35)
    .to('#titleLine2', { opacity: 1, y: 0, duration: 0.8 }, 0.5)
    .to('#heroSub', { opacity: 1, y: 0, duration: 0.7 }, 0.65)
    .to('#heroMeta', { opacity: 1, y: 0, duration: 0.7 }, 0.8)
    .to('#heroActions', { opacity: 1, y: 0, duration: 0.7 }, 0.95);
}

// ============================================================
// SECTION FADE-IN TRIGGERS
// ============================================================
document.querySelectorAll('.section-title, .section-body, .about-card, .event-card, .speaker-card, .stat-block, .panel-label, .section-sub, .about-tagline, .patronage-box, .reg-tag, .reg-body, .reg-portal-card').forEach((el, i) => {
  el.classList.add('fade-up');
  ScrollTrigger.create({
    trigger: el,
    start: 'top 88%',
    once: true,
    onEnter: () => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        delay: (i % 3) * 0.08,
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
    start: 'top 82%',
    once: true,
    onEnter: () => {
      gsap.to({ val: 0 }, {
        val: target,
        duration: 2.2,
        ease: 'power2.out',
        delay: i * 0.12,
        onUpdate() {
          if (el) {
            el.textContent = Math.floor(this.targets()[0].val).toLocaleString() + suffix;
          }
        }
      });
    }
  });
});

// ============================================================
// 3D CARD TILT ON HOVER
// ============================================================
document.querySelectorAll('[data-tilt]').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateX: -y * 10,
      rotateY: x * 10,
      transformPerspective: 600,
      duration: 0.35,
      ease: 'power2.out'
    });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  });
});

// ============================================================
// REAL WORKING INTERACTIVE REGISTRATION SYSTEM
// ============================================================
const regForm = document.getElementById('techfestRegForm');
const regSuccessCard = document.getElementById('regSuccessCard');
const passResetBtn = document.getElementById('passResetBtn');

if (regForm) {
  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('regName').value.trim();
    const college = document.getElementById('regCollege').value.trim();
    const event = document.getElementById('regEvent').value;
    
    if (!name || !college) return;

    // Generate unique serial pass
    const randomSerial = Math.floor(1000 + Math.random() * 9000);
    const passId = `PASS TF2026 ${randomSerial}`;

    // Populate Pass Card
    document.getElementById('passIdDisplay').textContent = passId;
    document.getElementById('passDelegateName').textContent = name.toUpperCase();
    document.getElementById('passCollegeName').textContent = college.toUpperCase();
    document.getElementById('passTrackName').textContent = event.toUpperCase();

    // Transition smoothly to Pass Card
    regForm.style.display = 'none';
    regSuccessCard.style.display = 'block';
    gsap.fromTo(regSuccessCard, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
  });
}

if (passResetBtn) {
  passResetBtn.addEventListener('click', () => {
    regSuccessCard.style.display = 'none';
    regForm.reset();
    regForm.style.display = 'flex';
    gsap.fromTo(regForm, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  });
}

// ============================================================
// SMOOTH ANCHOR SCROLL
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ============================================================
// 60 FPS RENDER LOOP
// ============================================================
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  // Mouse Parallax Lerping
  mouseX += (targetMouseX - mouseX) * 0.04;
  mouseY += (targetMouseY - mouseY) * 0.04;
  camera.rotation.x = -mouseY * 0.05;
  camera.rotation.y = -mouseX * 0.05;

  // Particle Drift
  particles.rotation.y = t * 0.012;
  particles.rotation.x = t * 0.007;

  // Hero Objects Rotation
  icoMesh.rotation.x = t * 0.22;
  icoMesh.rotation.y = t * 0.32;
  innerIco.rotation.x = -t * 0.18;
  innerIco.rotation.y = -t * 0.26;
  torus.rotation.y = t * 0.45;
  torus.rotation.z = t * 0.16;

  torus.position.y = Math.sin(t * 0.75) * 0.35;
  innerIco.position.y = Math.sin(t * 0.55 + 0.4) * 0.18;

  // Point Light Oscillation
  pointLight1.position.x = 4 + Math.sin(t * 0.45) * 2;
  pointLight1.position.y = 3 + Math.cos(t * 0.35) * 1.5;
  pointLight2.position.x = -5 + Math.cos(t * 0.3) * 2;
  pointLight2.position.y = -2 + Math.sin(t * 0.5) * 1;

  // About Section Rings
  if (ring1.visible) {
    ring1.rotation.z = t * 0.35;
    ring1.rotation.x = Math.PI * 0.3 + Math.sin(t * 0.25) * 0.1;
    ring2.rotation.y = t * 0.28;
    ring2.rotation.z = -t * 0.18;
  }

  // Events Section Polyhedra
  if (tetraGroup.visible) {
    tetraGroup.children.forEach((child) => {
      if (child.userData.floatSpeed) {
        child.position.y += Math.sin(t * child.userData.floatSpeed + child.userData.floatOffset) * 0.0025;
        child.rotation.x += child.userData.rotSpeed;
        child.rotation.y += child.userData.rotSpeed * 0.7;
      }
    });
    tetraGroup.rotation.y = t * 0.08;
  }

  // Stats Sphere
  if (sphereMesh.visible) {
    sphereMesh.rotation.y = t * 0.18;
    sphereMesh.rotation.x = t * 0.1;
  }

  // Register Helix
  if (helixGroup.visible) {
    helixGroup.rotation.y = t * 0.28;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  setupScrollTransitions();
  animate();
});
