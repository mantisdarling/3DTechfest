import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useInView
} from 'framer-motion';
import * as THREE from 'three';

// ============================================================
// ANIMATION VARIANTS
// ============================================================
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.7, delay: i * 0.12, ease: 'easeOut' }
  })
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

// ============================================================
// REUSABLE REVEAL COMPONENT (Framer Motion whileInView)
// ============================================================
function Reveal({ children, variants = fadeUp, custom = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={variants}
      custom={custom}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// THREE.JS CANVAS
// ============================================================
function ThreeScene() {
  const canvasRef = useRef(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const pl1 = new THREE.PointLight(0x0072ff, 10, 30);
    pl1.position.set(5, 4, 4);
    scene.add(pl1);
    const pl2 = new THREE.PointLight(0x00c6ff, 6, 25);
    pl2.position.set(-4, -3, 3);
    scene.add(pl2);

    // Particle field — optimised count
    const PC = 1600;
    const pPos = new Float32Array(PC * 3);
    for (let i = 0; i < PC; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 80;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, sizeAttenuation: true, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Hero: wireframe icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(1.7, 1);
    const icoEdgeGeo = new THREE.EdgesGeometry(icoGeo);
    const icoMat = new THREE.LineBasicMaterial({ color: 0x00c6ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending });
    const ico = new THREE.LineSegments(icoEdgeGeo, icoMat);
    ico.position.set(3.2, 0.3, 0);
    scene.add(ico);

    // Inner solid ico
    const innerGeo = new THREE.IcosahedronGeometry(1.3, 0);
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x050512, emissive: 0x07091a, metalness: 0.9, roughness: 0.1 });
    const innerIco = new THREE.Mesh(innerGeo, innerMat);
    innerIco.position.copy(ico.position);
    scene.add(innerIco);

    // Floating ring
    const ringGeo = new THREE.TorusGeometry(2.4, 0.018, 8, 120);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0072ff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.35;
    ring.position.set(3.2, 0, 0);
    scene.add(ring);

    // Grid
    const grid = new THREE.GridHelper(80, 80, 0x0a0d1a, 0x0a0d1a);
    grid.position.y = -4.5;
    grid.material.transparent = true;
    grid.material.opacity = 0.4;
    scene.add(grid);

    // Mouse tracking
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    const onMouseMove = (e) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Scroll progress ref
    let scrollProg = 0;
    const unsubscribe = scrollYProgress.on('change', (v) => { scrollProg = v; });

    // Render loop — throttled to 60fps max
    const clock = new THREE.Clock();
    let animId;
    let lastTime = 0;
    function animate(timestamp) {
      animId = requestAnimationFrame(animate);
      if (timestamp - lastTime < 14) return; // ~60fps cap
      lastTime = timestamp;

      const t = clock.getElapsedTime();

      // Smooth mouse
      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;
      camera.rotation.x = -my * 0.05;
      camera.rotation.y = -mx * 0.05;

      // Move camera based on scroll
      camera.position.y = scrollProg * -3;

      // Particles slow drift
      particles.rotation.y = t * 0.012;

      // Ico rotation
      ico.rotation.x = t * 0.22;
      ico.rotation.y = t * 0.35;
      innerIco.rotation.x = -t * 0.18;
      innerIco.rotation.y = -t * 0.28;
      innerIco.position.y = ico.position.y + Math.sin(t * 0.5) * 0.2;

      // Ring
      ring.rotation.z = t * 0.3;

      // Light orbit
      pl1.position.x = 5 + Math.sin(t * 0.4) * 2;
      pl1.position.y = 4 + Math.cos(t * 0.3) * 1.5;

      // Fade hero objects on scroll
      const heroFade = Math.max(0, 1 - scrollProg * 5);
      ico.material.opacity = 0.55 * heroFade;
      ring.material.opacity = 0.22 * heroFade;

      renderer.render(scene, camera);
    }
    animate(0);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      unsubscribe();
      renderer.dispose();
      pGeo.dispose(); pMat.dispose();
      icoGeo.dispose(); icoEdgeGeo.dispose(); icoMat.dispose();
      innerGeo.dispose(); innerMat.dispose();
      ringGeo.dispose(); ringMat.dispose();
    };
  }, [scrollYProgress]);

  return <canvas ref={canvasRef} id="webgl-canvas" />;
}

// ============================================================
// COUNTER — animated number
// ============================================================
function Counter({ target, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2200;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}{suffix}
    </span>
  );
}

// ============================================================
// SCROLL PROGRESS BAR
// ============================================================
function ScrollBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="scroll-bar"
      style={{ scaleX, transformOrigin: 'left', width: '100%' }}
    />
  );
}

// ============================================================
// LOADER
// ============================================================
function Loader({ onDone }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 15 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(id);
        setTimeout(onDone, 350);
      }
      setPct(Math.floor(p));
    }, 80);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <motion.div
      className="loader-overlay"
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
    >
      <div className="loader-logo-wrap">
        <motion.div
          className="loader-tf"
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          TECHFEST
        </motion.div>
        <div className="loader-subtitle">IIT BOMBAY &nbsp; 2026</div>
      </div>
      <div className="loader-track">
        <motion.div className="loader-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="loader-pct">{pct}% &nbsp; INITIALIZING</div>
    </motion.div>
  );
}

// ============================================================
// NAV
// ============================================================
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo">
        <div className="nav-logo-badge">TF</div>
        <div className="nav-logo-text">
          <span className="nav-logo-name">TECHFEST</span>
          <span className="nav-logo-sub">IIT BOMBAY</span>
        </div>
      </div>
      <div className="nav-links">
        <a href="#about" className="nav-link">About</a>
        <a href="#events" className="nav-link">Events</a>
        <a href="#speakers" className="nav-link">Speakers</a>
        <a href="#stats" className="nav-link">Statistics</a>
      </div>
      <a href="#register" className="nav-cta">Register Now</a>
    </nav>
  );
}

// ============================================================
// HERO
// ============================================================
function Hero() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } }
  };
  const item = {
    hidden: { opacity: 0, y: 48 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] } }
  };

  return (
    <section className="hero section" id="hero">
      <div className="hero-inner">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div className="hero-eyebrow" variants={item}>
            ASIA'S LARGEST SCIENCE AND TECHNOLOGY FESTIVAL
          </motion.div>
          <motion.h1 className="hero-title" variants={item}>
            <span className="gradient-text">TECHFEST</span>
            <span className="outline-text">IIT BOMBAY</span>
          </motion.h1>
          <motion.p className="hero-year" variants={item}>
            EDITION &nbsp; 2026
          </motion.p>
          <motion.p className="hero-desc" variants={item}>
            Techfest is the annual science and technology festival of the Indian Institute of Technology Bombay. Since its inception in 1998, it has grown into Asia's foremost gathering of scientific minds, drawing participants from across 56 nations to engage with the frontiers of human knowledge.
          </motion.p>
          <motion.div className="hero-buttons" variants={item}>
            <a href="#events" className="btn-primary">Explore Events</a>
            <a href="#about" className="btn-outline">Learn More</a>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-stats-card"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="hero-stats-card-title">EDITION 2026 AT A GLANCE</div>
          {[
            { val: '180,000+', label: 'Annual participants from across India and the world' },
            { val: '56+', label: 'Nations represented across all editions' },
            { val: '2,300+', label: 'Colleges participating in competitions' },
            { val: '28', label: 'Years of continuous excellence since 1998' },
          ].map((s, i) => (
            <div className="hero-stat-row" key={i}>
              <div>
                <div className="hero-stat-val">{s.val}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// ABOUT
// ============================================================
function About() {
  const pillars = [
    {
      num: '01',
      name: 'Competitions',
      desc: 'Engineering, coding and problem solving challenges spanning artificial intelligence, aerospace, robotics and green technology, with substantial prize pools attracting the finest technical talent nationwide.'
    },
    {
      num: '02',
      name: 'International Robowars',
      desc: 'One of Techfest\'s most iconic segments. Heavy duty combat robots clash in a battle tested arena, drawing roboticists and spectators from across the globe in an electrifying spectacle.'
    },
    {
      num: '03',
      name: 'Lecture Series',
      desc: 'A prestigious global speakers programme hosting Nobel Laureates, Turing Award recipients, heads of state and industry pioneers. Past speakers include Dr. A.P.J. Abdul Kalam, Amartya Sen and the 14th Dalai Lama.'
    },
    {
      num: '04',
      name: 'International Exhibitions',
      desc: 'Showcasing cutting edge innovations, advanced humanoid robotics and artificial intelligence demonstrations contributed by institutions and corporations from multiple countries.'
    },
    {
      num: '05',
      name: 'Workshops and Tech Expo',
      desc: 'Hands on training sessions conducted in partnership with leading technology corporations, alongside a curated expo where startups, research labs and global firms present their most groundbreaking prototypes.'
    },
    {
      num: '06',
      name: 'Social Initiatives',
      desc: 'Year round outreach programmes, awareness campaigns and health camps addressing pressing societal challenges in education, environment and public health, supported by UNESCO and UNICEF.'
    },
  ];

  return (
    <section className="about section" id="about">
      <div className="container">
        <div className="about-grid">
          <div>
            <Reveal>
              <div className="section-tag">About Techfest</div>
            </Reveal>
            <Reveal custom={1}>
              <h2 className="section-heading">
                Redefining the<br /><span className="hl">Boundaries</span><br />of Innovation
              </h2>
            </Reveal>
            <Reveal custom={2}>
              <p className="section-body">
                Techfest is the annual science and technology festival of the Indian Institute of Technology Bombay, widely recognised as Asia's largest festival of its kind. Established in 1998 by the student community of IIT Bombay, the festival operates as a nonprofit student organisation and has received patronage from UNESCO, UNICEF and the Centre for Environment Education.
              </p>
            </Reveal>
            <Reveal custom={3}>
              <p className="section-body" style={{ marginTop: 16 }}>
                Spanning three days on the IIT Bombay campus, Techfest brings together more than 180,000 participants annually across competitions, exhibitions, workshops, lecture series, social initiatives and the celebrated Technoholix night programme.
              </p>
            </Reveal>
            <Reveal custom={4}>
              <div className="about-badges">
                {['UNESCO Patronage', 'UNICEF Patronage', 'IIT Bombay', 'Non Profit', 'Since 1998', 'Three Days'].map((b) => (
                  <span className="about-badge" key={b}>{b}</span>
                ))}
              </div>
            </Reveal>
          </div>

          <motion.div
            className="pillars-list"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {pillars.map((p, i) => (
              <motion.div className="pillar-item" key={p.num} variants={fadeUp} custom={i}>
                <span className="pillar-num">{p.num}</span>
                <div>
                  <div className="pillar-name">{p.name}</div>
                  <div className="pillar-desc">{p.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// EVENTS
// ============================================================
function Events() {
  const events = [
    {
      icon: '🤖',
      name: 'International Robowars',
      desc: 'Techfest\'s most celebrated segment since its early editions. Combat robots from institutions across the globe clash in a purpose built arena, testing engineering ingenuity, real time control algorithms and mechanical resilience.',
      tags: ['Combat Robotics', 'Autonomous', 'Mechanical Design'],
      featured: true,
      color: '#00c6ff'
    },
    {
      icon: '🧠',
      name: 'Artificial Intelligence Olympiad',
      desc: 'Participants build intelligent agents that learn, adapt and solve problems in complex simulated environments. Covers machine learning, computer vision and reinforcement learning domains.',
      tags: ['Machine Learning', 'Computer Vision', 'Reinforcement Learning'],
      featured: false,
      color: '#6d28d9'
    },
    {
      icon: '🛸',
      name: 'Cosmos Challenge',
      desc: 'Design and simulate satellite trajectories, solve orbital mechanics problems and engage with real mission data in association with national space research institutions.',
      tags: ['Orbital Mechanics', 'Simulation', 'Space Research'],
      featured: false,
      color: '#059669'
    },
    {
      icon: '⚡',
      name: 'Energy Horizon',
      desc: 'Prototype renewable energy harvesters and optimise grid simulations in the most rigorous clean energy engineering challenge in Asia, addressing real world sustainability imperatives.',
      tags: ['Renewable Energy', 'Grid Simulation', 'Sustainability'],
      featured: false,
      color: '#f59e0b'
    },
    {
      icon: '🔬',
      name: 'BioSynth Lab',
      desc: 'Synthetic biology meets computational design. Participants engineer genetic circuits and protein structures in a fully guided wet lab environment led by faculty from IIT Bombay.',
      tags: ['Synthetic Biology', 'Wet Lab', 'Protein Design'],
      featured: false,
      color: '#10b981'
    },
    {
      icon: '💡',
      name: 'Ideate Social Innovation',
      desc: 'A social and technical innovation challenge connecting young problem solvers with corporate and government support to develop solutions addressing agriculture, healthcare and education.',
      tags: ['Social Impact', 'Design Thinking', 'Innovation'],
      featured: false,
      color: '#ec4899'
    },
  ];

  return (
    <section className="events section" id="events">
      <div className="container">
        <div className="events-header">
          <Reveal>
            <div className="section-tag">Flagship Events</div>
          </Reveal>
          <Reveal custom={1}>
            <h2 className="section-heading">What Awaits You at <span className="hl">Techfest 2026</span></h2>
          </Reveal>
          <Reveal custom={2}>
            <p className="section-body">
              From combat robots to cosmic simulations, each segment of Techfest is meticulously crafted to challenge, inspire and connect the finest technical minds across Asia and the world.
            </p>
          </Reveal>
        </div>

        <motion.div
          className="events-grid"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {events.map((ev, i) => (
            <motion.div
              key={ev.name}
              className={`event-card ${ev.featured ? 'featured' : ''}`}
              variants={fadeUp}
              custom={i}
              style={{ '--accent-color': ev.color }}
              whileHover={{ y: -5, transition: { duration: 0.25 } }}
            >
              {ev.featured && <div className="event-featured-tag">FLAGSHIP</div>}
              <div className="event-icon" style={{ background: `${ev.color}18`, border: `1px solid ${ev.color}33` }}>
                {ev.icon}
              </div>
              <h3 className="event-name">{ev.name}</h3>
              <p className="event-desc">{ev.desc}</p>
              <div className="event-tags-row">
                {ev.tags.map(t => <span className="event-tag" key={t}>{t}</span>)}
              </div>
              <a href="#register" className="event-link">
                Register &rarr;
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// MARQUEE
// ============================================================
function Marquee() {
  const items = [
    'Dr. A.P.J. Abdul Kalam',
    'Amartya Sen',
    'The 14th Dalai Lama',
    'Ada Yonath',
    'Serge Haroche',
    'Leland H. Hartwell',
    'Vint Cerf',
    'Bjarne Stroustrup',
    'Jimmy Wales',
    'Rakesh Sharma',
    'Dr. A.P.J. Abdul Kalam',
    'Amartya Sen',
    'The 14th Dalai Lama',
    'Ada Yonath',
    'Serge Haroche',
    'Leland H. Hartwell',
    'Vint Cerf',
    'Bjarne Stroustrup',
    'Jimmy Wales',
    'Rakesh Sharma',
  ];

  return (
    <div className="marquee-section">
      <div className="marquee-track">
        {items.map((item, i) => (
          <div className="marquee-item" key={i}>{item}</div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// SPEAKERS
// ============================================================
function Speakers() {
  const speakers = [
    { initials: 'APJ', name: 'Dr. A.P.J. Abdul Kalam', role: '11th President of India', bio: 'Aerospace scientist, visionary and former President of India. Addressed Techfest 2015 on the theme of World Vision 2030 and the transformative potential of solar energy for humanity.', grad: 'linear-gradient(135deg, #0072ff, #00c6ff)' },
    { initials: 'AS', name: 'Amartya Sen', role: 'Nobel Laureate in Economics', bio: 'Professor of Economics and Philosophy at Harvard University. Nobel Prize recipient in 1998 for his contributions to welfare economics and social choice theory.', grad: 'linear-gradient(135deg, #6d28d9, #a855f7)' },
    { initials: 'AY', name: 'Ada Yonath', role: 'Nobel Laureate in Chemistry', bio: 'Israeli crystallographer and Director of the Helen and Milton A. Kimmelman Center for Biomolecular Structure. Awarded the Nobel Prize in Chemistry in 2009 for studies on the structure of the ribosome.', grad: 'linear-gradient(135deg, #059669, #34d399)' },
    { initials: 'VC', name: 'Vint Cerf', role: 'Father of the Internet', bio: 'American computer scientist widely credited as one of the founders of the Internet. Co designed the TCP and IP protocols that form the technical backbone of modern global communications.', grad: 'linear-gradient(135deg, #d97706, #fbbf24)' },
  ];

  return (
    <section className="speakers section" id="speakers">
      <div className="container">
        <div className="speakers-header">
          <Reveal>
            <div className="section-tag">Distinguished Speakers</div>
          </Reveal>
          <Reveal custom={1}>
            <h2 className="section-heading">Voices That <span className="hl">Shaped the World</span></h2>
          </Reveal>
        </div>
        <Reveal custom={2}>
          <p className="speakers-note">
            Techfest has hosted Nobel Laureates, Turing Award recipients, astronauts, heads of state and founders of the defining technologies of our era. The following represent a selection of speakers across the festival's 28 year history.
          </p>
        </Reveal>

        <motion.div
          className="speakers-grid"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {speakers.map((s, i) => (
            <motion.div
              key={s.name}
              className="speaker-card"
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -5, transition: { duration: 0.25 } }}
            >
              <div className="speaker-avatar" style={{ background: s.grad }}>{s.initials}</div>
              <div className="speaker-name">{s.name}</div>
              <div className="speaker-role">{s.role}</div>
              <p className="speaker-bio">{s.bio}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// STATS
// ============================================================
function Stats() {
  const statData = [
    { count: 180000, suffix: '+', label: 'Annual\nParticipants' },
    { count: 56, suffix: '+', label: 'Nations\nRepresented' },
    { count: 2300, suffix: '+', label: 'Colleges\nParticipating' },
    { count: 28, suffix: '', label: 'Years of\nExcellence' },
  ];

  return (
    <section className="stats section" id="stats">
      <div className="container">
        <div className="stats-header">
          <Reveal>
            <div className="section-tag">Techfest by the Numbers</div>
          </Reveal>
          <Reveal custom={1}>
            <h2 className="section-heading">A <span className="hl">Global</span> Phenomenon</h2>
          </Reveal>
          <Reveal custom={2}>
            <p className="section-body" style={{ margin: '0 auto', textAlign: 'center' }}>
              Since 1998, Techfest has grown from a campus level competition into the definitive meeting point for scientific innovation across Asia and the wider world.
            </p>
          </Reveal>
        </div>

        <motion.div
          className="stats-grid"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {statData.map((s, i) => (
            <motion.div key={i} className="stat-cell" variants={fadeUp} custom={i}>
              <div className="stat-val">
                <Counter target={s.count} suffix={s.suffix} />
              </div>
              <div className="stat-label" style={{ whiteSpace: 'pre-line' }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <Reveal custom={3}>
          <div className="patronage-strip">
            <span className="patronage-label">PATRONAGE</span>
            {['UNESCO', 'UNICEF', 'Centre for Environment Education', 'IIT Bombay', 'Government of India'].map(o => (
              <span className="patronage-org" key={o}>{o}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// REGISTER
// ============================================================
function Register() {
  return (
    <section className="register section" id="register">
      <div className="container">
        <Reveal>
          <div className="register-tag">LIMITED REGISTRATIONS OPEN</div>
        </Reveal>
        <Reveal custom={1}>
          <h2 className="register-title">
            Join 180,000 Minds<br />Shaping the <span className="hl">Future</span>
          </h2>
        </Reveal>
        <Reveal custom={2}>
          <p className="register-body">
            Techfest 2026 invites students, researchers and innovators from across the world to participate in Asia's foremost science and technology festival. Registrations are open until 30 November 2026. Seats are strictly limited.
          </p>
        </Reveal>
        <Reveal custom={3}>
          <div className="register-buttons">
            <a href="#" className="btn-primary">Register Now</a>
            <a href="#" className="btn-outline">Download Brochure</a>
          </div>
        </Reveal>
        <Reveal custom={4}>
          <p className="register-meta">
            Enquiries: <a href="mailto:techfest@iitb.ac.in">techfest@iitb.ac.in</a>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            Website: <a href="https://techfest.org" target="_blank" rel="noopener noreferrer">techfest.org</a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="nav-logo-badge" style={{ width: 40, height: 40, fontSize: '0.95rem' }}>TF</div>
          <div className="footer-brand-info">
            <strong>Techfest IIT Bombay</strong>
            <p>Asia's Largest Science and Technology Festival</p>
          </div>
        </div>
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#events">Events</a>
          <a href="#speakers">Speakers</a>
          <a href="#stats">Statistics</a>
          <a href="#register">Register</a>
          <a href="https://techfest.org" target="_blank" rel="noopener noreferrer">Official Site</a>
        </div>
        <div className="footer-copy">
          Techfest 2026 &nbsp;&middot;&nbsp; IIT Bombay &nbsp;&middot;&nbsp; All rights reserved
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!loaded && <Loader key="loader" onDone={() => setLoaded(true)} />}
      </AnimatePresence>

      {loaded && (
        <>
          <ThreeScene />
          <ScrollBar />
          <Nav />
          <Hero />
          <Marquee />
          <About />
          <Events />
          <Speakers />
          <Stats />
          <Register />
          <Footer />
        </>
      )}
    </>
  );
}
