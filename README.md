# Techfest IIT Bombay 2026 — 3D Interactive Website

A fully immersive 3D interactive website for Techfest IIT Bombay — Asia's Largest Science and Technology Festival.

## Features

* Three.js WebGL 3D engine with animated wireframe geometry and particle fields
* GSAP ScrollTrigger scroll animations — camera physically moves through 3D space across every section
* Dynamic section objects: Icosahedron hero, rotating rings, floating tetrahedra, wireframe globe and DNA helix
* 2,200 particle star field spanning the full scene
* Animated loading screen with live progress
* Custom cursor with follower ring
* Stats counter animation, 3D card tilt and auto scrolling speaker marquee

## Sections

1. Hero — Animated TF logotype with floating wireframe icosahedron
2. About — Three category cards with 3D tilt on hover
3. Events — Six flagship Techfest events with colored orbs
4. Speakers — Global visionaries marquee and speaker cards
5. Stats — Animated counters for 190,000 participants, 56 nations and 2,300 colleges
6. Register — Call to action with DNA helix 3D background

## Setup

```bash
npm install
npm run dev
npm run build
```

## Stack

* Three.js 0.169
* GSAP 3.12 with ScrollTrigger
* Vite 5.4
* Orbitron, Space Grotesk, JetBrains Mono
