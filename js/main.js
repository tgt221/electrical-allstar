/* =====================================================
   ELECTRICAL ALLSTAR — GSAP + Three.js experience
   ===================================================== */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LIGHT = !!window.ALLSTAR_LIGHT; // light.html sets this flag
  var SCENE = window.ALLSTAR_SCENE || "panel"; // "panel" (default) or "star" (dark-star.html)
  var hasGSAP = typeof gsap !== "undefined";
  var hasThree = typeof THREE !== "undefined";

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* =====================================================
     THREE.JS HERO — electrical box, arcs, particles
     ===================================================== */
  var renderActive = true;

  function initHeroScene() {
    var canvas = document.getElementById("hero-canvas");
    if (!canvas || !hasThree) return;

    var hero = document.getElementById("hero");
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (e) { return; } // no WebGL — CSS gradient background remains

    var DPR = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(DPR);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    var COL = {
      red: new THREE.Color(0xC8102E),
      redHot: new THREE.Color(0xEF2B47),
      gold: new THREE.Color(0xF5C518),
      steel: new THREE.Color(0xA8B2BD),
      white: new THREE.Color(0xffffff)
    };
    if (LIGHT) { // deeper tones read better on a light page
      COL.gold = new THREE.Color(0xC99700);
      COL.steel = new THREE.Color(0x5B6472);
      COL.white = new THREE.Color(0xC8102E); // bolt cores go red on light
    }
    // additive glow washes out to invisible on white, so blend normally there
    var BLEND = LIGHT ? THREE.NormalBlending : THREE.AdditiveBlending;

    /* --- lighting (solid breaker box needs it) --- */
    scene.add(new THREE.AmbientLight(0x9aa2b0, LIGHT ? 0.9 : 0.5));
    var keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
    keyLight.position.set(-4, 5, 7);
    scene.add(keyLight);
    var redLight = new THREE.PointLight(0xC8102E, 1.0, 14);
    redLight.position.set(3.4, -1.6, 3);
    scene.add(redLight);
    var goldLight = new THREE.PointLight(0xF5C518, 0.8, 12);
    goldLight.position.set(0.6, 2.6, 2.4);
    scene.add(goldLight);

    /* --- central 3D piece (sits right of center) --- */
    var box = new THREE.Group();
    box.position.set(2.1, 0.15, 0);
    scene.add(box);

    var coreGlow, mainToggle;
    if (SCENE === "star") buildStar(); else buildPanel();

    /* --- alt centerpiece: spinning 3D Allstar star with energy rings --- */
    function buildStar() {
      var shape = new THREE.Shape();
      for (var i = 0; i < 10; i++) {
        var r = i % 2 === 0 ? 1.9 : 0.8;
        var a = Math.PI / 2 + (i * Math.PI) / 5;
        if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      shape.closePath();
      var geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.42, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.09, bevelSegments: 2
      });
      geo.center();
      box.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        color: 0xC8102E, roughness: 0.32, metalness: 0.6
      })));
      box.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(geo, 28),
        new THREE.LineBasicMaterial({ color: COL.gold, transparent: true, opacity: 0.45 })
      ));

      coreGlow = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 16, 16),
        new THREE.MeshBasicMaterial({ color: COL.red, transparent: true, opacity: LIGHT ? 0.1 : 0.2, blending: BLEND, depthWrite: false })
      );
      box.add(coreGlow);

      // tilted energy rings — the group spin turns them into a gyroscope
      var ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(2.6, 0.025, 8, 90),
        new THREE.MeshBasicMaterial({ color: COL.gold, transparent: true, opacity: 0.55, blending: BLEND, depthWrite: false })
      );
      ring1.rotation.x = 1.25;
      box.add(ring1);
      var ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(3.0, 0.02, 8, 90),
        new THREE.MeshBasicMaterial({ color: COL.steel, transparent: true, opacity: 0.3, blending: BLEND, depthWrite: false })
      );
      ring2.rotation.x = -0.85;
      ring2.rotation.y = 0.45;
      box.add(ring2);
    }

    /* --- default centerpiece: 3D breaker box --- */
    function buildPanel() {
    var matBody = new THREE.MeshStandardMaterial({ color: 0x424953, roughness: 0.5, metalness: 0.72 });
    var matFace = new THREE.MeshStandardMaterial({ color: 0x22262c, roughness: 0.6, metalness: 0.55 });
    var matDark = new THREE.MeshStandardMaterial({ color: 0x101215, roughness: 0.65, metalness: 0.4 });
    var matToggleOff = new THREE.MeshStandardMaterial({ color: 0xb9c1cc, roughness: 0.35, metalness: 0.6 });

    // enclosure + steel edge highlight so the silhouette reads on dark bg
    box.add(new THREE.Mesh(new THREE.BoxGeometry(2.35, 3.15, 0.6), matBody));
    box.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2.36, 3.16, 0.61)),
      new THREE.LineBasicMaterial({ color: COL.steel, transparent: true, opacity: 0.35 })
    ));

    // recessed dead-front panel
    var face = new THREE.Mesh(new THREE.BoxGeometry(1.95, 2.75, 0.1), matFace);
    face.position.z = 0.28;
    box.add(face);

    // top conduit feed
    var conduit = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 14), matBody);
    conduit.position.set(0.55, 1.95, 0);
    box.add(conduit);

    // main breaker with glowing red handle
    var mainBrk = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.34, 0.14), matDark);
    mainBrk.position.set(0, 1.02, 0.36);
    box.add(mainBrk);
    mainToggle = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.14, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xEF2B47 })
    );
    mainToggle.position.set(0, 1.02, 0.44);
    box.add(mainToggle);

    // yellow warning label beside the main
    var label = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xF5C518, roughness: 0.8, metalness: 0.1 })
    );
    label.position.set(-0.58, 1.02, 0.34);
    box.add(label);

    // two columns of branch breakers, toggles ON toward the center spine
    for (var col = -1; col <= 1; col += 2) {
      for (var row = 0; row < 6; row++) {
        var by = 0.62 - row * 0.34;
        var brk = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.26, 0.12), matDark);
        brk.position.set(col * 0.42, by, 0.35);
        box.add(brk);
        var on = (row * 7 + col + 9) % 4 !== 0; // deterministic mix of on/off
        var lit = on && row % 2 === 0;
        var tog = new THREE.Mesh(
          new THREE.BoxGeometry(0.11, 0.15, 0.09),
          lit ? new THREE.MeshBasicMaterial({ color: 0xF5C518 }) : matToggleOff
        );
        tog.position.set(col * 0.42 + (on ? -col : col) * 0.12, by, 0.42);
        box.add(tog);
      }
    }

    // center spine between the columns
    var spine = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.3, 0.11),
      new THREE.MeshStandardMaterial({ color: 0x272b31, roughness: 0.6, metalness: 0.5 })
    );
    spine.position.set(0, -0.1, 0.33);
    box.add(spine);

    // open door hinged on the left edge
    var hinge = new THREE.Group();
    hinge.position.set(-1.18, 0, 0.25);
    box.add(hinge);
    var door = new THREE.Mesh(new THREE.BoxGeometry(2.3, 3.13, 0.07), matBody);
    door.position.x = 1.15;
    hinge.add(door);
    hinge.rotation.y = -1.9;

    // inner energy glow behind the panel
    coreGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshBasicMaterial({ color: COL.red, transparent: true, opacity: LIGHT ? 0.1 : 0.16, blending: BLEND, depthWrite: false })
    );
    coreGlow.position.z = 0.2;
    box.add(coreGlow);

    // energized feeder cables dropping out the bottom
    function addCable(x0, colorHex, sway) {
      var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x0, -1.55, 0.1),
        new THREE.Vector3(x0 + sway * 0.45, -2.25, 0.32),
        new THREE.Vector3(x0 + sway, -3.1, 0.05)
      ]);
      var tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 24, 0.035, 8, false),
        new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.72, blending: BLEND, depthWrite: false })
      );
      box.add(tube);
    }
    addCable(-0.45, 0xF5C518, -0.3);
    addCable(0.08, 0xEF2B47, 0.12);
    addCable(0.55, 0xF5C518, 0.4);
    } // end buildPanel

    /* --- particle field --- */
    var P = 520;
    var pos = new Float32Array(P * 3);
    var colArr = new Float32Array(P * 3);
    var speeds = new Float32Array(P);
    for (var i = 0; i < P; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7 - 1;
      var c = Math.random() < 0.55 ? COL.steel : (Math.random() < 0.6 ? COL.gold : COL.redHot);
      colArr[i * 3] = c.r; colArr[i * 3 + 1] = c.g; colArr[i * 3 + 2] = c.b;
      speeds[i] = 0.12 + Math.random() * 0.35;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(colArr, 3));
    var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.045, vertexColors: true, transparent: true, opacity: 0.75,
      blending: BLEND, depthWrite: false
    }));
    scene.add(particles);

    /* --- procedural lightning arcs --- */
    var bolts = [];

    function jaggedPoints(a, b, segs, jitter) {
      var pts = [];
      for (var s = 0; s <= segs; s++) {
        var t = s / segs;
        var p = new THREE.Vector3().lerpVectors(a, b, t);
        if (s > 0 && s < segs) {
          p.x += (Math.random() - 0.5) * jitter;
          p.y += (Math.random() - 0.5) * jitter;
          p.z += (Math.random() - 0.5) * jitter * 0.6;
        }
        pts.push(p);
      }
      return pts;
    }

    function spawnBolt() {
      // arc from the box outward
      var start = new THREE.Vector3(
        box.position.x + (Math.random() - 0.5) * 1.6,
        box.position.y + (Math.random() - 0.5) * 2.4,
        (Math.random() - 0.5) * 0.8
      );
      var end = new THREE.Vector3(
        start.x + (Math.random() < 0.6 ? -1 : 1) * (2.2 + Math.random() * 3.4),
        start.y + (Math.random() - 0.5) * 3.4,
        (Math.random() - 0.5) * 2
      );
      var group = new THREE.Group();
      var main = jaggedPoints(start, end, 9, 0.5);
      var colors = [COL.white, COL.gold, COL.redHot];
      for (var l = 0; l < 3; l++) {
        var pts = l === 0 ? main : jaggedPoints(start, end, 9, 0.5 + l * 0.25);
        var g = new THREE.BufferGeometry().setFromPoints(pts);
        var m = new THREE.LineBasicMaterial({
          color: colors[l], transparent: true,
          opacity: l === 0 ? 0.95 : 0.4,
          blending: BLEND, depthWrite: false
        });
        group.add(new THREE.Line(g, m));
      }
      // small branch fork
      if (Math.random() < 0.7) {
        var mid = main[4].clone();
        var forkEnd = mid.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 2.4, -0.6 - Math.random() * 1.6, (Math.random() - 0.5) * 1.2
        ));
        var fg = new THREE.BufferGeometry().setFromPoints(jaggedPoints(mid, forkEnd, 5, 0.35));
        group.add(new THREE.Line(fg, new THREE.LineBasicMaterial({
          color: COL.gold, transparent: true, opacity: 0.6,
          blending: BLEND, depthWrite: false
        })));
      }
      scene.add(group);
      bolts.push({ group: group, life: 0, maxLife: 0.45 + Math.random() * 0.3 });
    }

    /* --- sizing --- */
    function resize() {
      var w = hero.clientWidth, h = hero.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // on narrow screens center the box behind the text, pushed back so it stays subtle
      box.position.x = w < 1020 ? 0 : 2.1;
      box.position.z = w < 1020 ? -2.2 : 0;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    /* --- mouse parallax --- */
    var mx = 0, my = 0;
    window.addEventListener("pointermove", function (ev) {
      mx = (ev.clientX / window.innerWidth - 0.5) * 2;
      my = (ev.clientY / window.innerHeight - 0.5) * 2;
    });

    /* --- visibility gating --- */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        renderActive = entries[0].isIntersecting;
      }, { threshold: 0.02 }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) renderActive = false;
      else renderActive = true;
    });

    /* --- animate --- */
    var clock = new THREE.Clock();
    var nextBolt = 0.8;

    function frame() {
      requestAnimationFrame(frame);
      if (!renderActive) { clock.getDelta(); return; }
      var dt = Math.min(clock.getDelta(), 0.05);
      var t = clock.elapsedTime;

      if (!reducedMotion) {
        if (SCENE === "star") {
          // slow full spin — the star reads from every angle
          box.rotation.y = t * 0.35 + mx * 0.25;
          box.rotation.x = Math.sin(t * 0.4) * 0.08 + my * 0.12;
        } else {
          // gentle sway keeps the panel face toward the viewer
          box.rotation.y = -0.3 + Math.sin(t * 0.45) * 0.22 + mx * 0.2;
          box.rotation.x = Math.sin(t * 0.35) * 0.05 + my * 0.1;
        }
        box.position.y = 0.15 + Math.sin(t * 0.8) * 0.12;

        coreGlow.scale.setScalar(1 + Math.sin(t * 3.2) * 0.25);
        goldLight.intensity = 0.8 + Math.sin(t * 7.3) * 0.12 + (Math.random() < 0.02 ? 0.5 : 0);
        if (mainToggle) mainToggle.material.color.setHex(Math.sin(t * 2.6) > -0.9 ? 0xEF2B47 : 0x8a0f22);

        // drift particles upward
        var arr = pGeo.attributes.position.array;
        for (var i = 0; i < P; i++) {
          arr[i * 3 + 1] += speeds[i] * dt;
          if (arr[i * 3 + 1] > 6) arr[i * 3 + 1] = -6;
        }
        pGeo.attributes.position.needsUpdate = true;
        particles.rotation.y = mx * 0.03;

        // lightning lifecycle
        nextBolt -= dt;
        if (nextBolt <= 0 && bolts.length < 3) {
          spawnBolt();
          nextBolt = 1.1 + Math.random() * 1.9;
        }
        for (var b = bolts.length - 1; b >= 0; b--) {
          var bolt = bolts[b];
          bolt.life += dt;
          var k = 1 - bolt.life / bolt.maxLife;
          var flicker = k * (0.55 + Math.random() * 0.45);
          bolt.group.children.forEach(function (line, idx) {
            line.material.opacity = (idx === 0 ? 0.95 : 0.45) * flicker;
          });
          if (bolt.life >= bolt.maxLife) {
            bolt.group.children.forEach(function (line) {
              line.geometry.dispose(); line.material.dispose();
            });
            scene.remove(bolt.group);
            bolts.splice(b, 1);
          }
        }

        camera.position.x = mx * 0.28;
        camera.position.y = -my * 0.22;
        camera.lookAt(0.8, 0, 0);
      }

      renderer.render(scene, camera);
    }
    frame();
  }

  /* =====================================================
     PRELOADER + HERO INTRO
     ===================================================== */
  function splitLetters() {
    document.querySelectorAll("[data-split]").forEach(function (line) {
      var frag = document.createDocumentFragment();
      Array.prototype.forEach.call(line.childNodes, function (node) {
        if (node.nodeType === 3) { // text
          node.textContent.split("").forEach(function (ch) {
            var s = document.createElement("span");
            s.className = "ch";
            s.innerHTML = ch === " " ? "&nbsp;" : ch;
            frag.appendChild(s);
          });
        } else if (node.nodeType === 1) { // <em>
          var emEl = document.createElement("em");
          node.textContent.split("").forEach(function (ch) {
            var s = document.createElement("span");
            s.className = "ch";
            s.innerHTML = ch === " " ? "&nbsp;" : ch;
            emEl.appendChild(s);
          });
          frag.appendChild(emEl);
        }
      });
      line.innerHTML = "";
      line.appendChild(frag);
    });
  }

  function heroIntro() {
    if (!hasGSAP || reducedMotion) {
      document.querySelectorAll("[data-hero],.hero-line .ch").forEach(function (el) {
        el.style.opacity = 1; el.style.transform = "none";
      });
      return;
    }
    gsap.set("[data-hero]", { opacity: 0, y: 30 });
    gsap.set(".hero-line .ch", { yPercent: 110, rotate: 6 });

    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to(".hero-line .ch", { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.035 }, 0.1)
      .to('[data-hero="eyebrow"]', { opacity: 1, y: 0, duration: .7 }, 0.3)
      .to('[data-hero="tag"]', { opacity: 1, y: 0, duration: .7 }, 0.75)
      .to('[data-hero="sub"]', { opacity: 1, y: 0, duration: .7 }, 0.9)
      .to('[data-hero="cta"]', { opacity: 1, y: 0, duration: .7 }, 1.05)
      .to('[data-hero="badge"]', { opacity: 1, y: 0, duration: 1, ease: "back.out(1.4)" }, 0.7);

    // gentle float on badge
    gsap.to(".hero-badge", {
      y: -14, rotate: 1.4, duration: 3.2,
      ease: "sine.inOut", yoyo: true, repeat: -1
    });
  }

  function hidePreloader(then) {
    var pre = document.getElementById("preloader");
    if (!pre) { then(); return; }
    if (!hasGSAP || reducedMotion) {
      pre.style.display = "none"; then(); return;
    }
    gsap.timeline()
      .to("#preloader-fill", { width: "100%", duration: 0.9, ease: "power2.inOut" })
      .to(pre, {
        opacity: 0, duration: 0.55, ease: "power2.out",
        onComplete: function () { pre.style.display = "none"; then(); }
      }, "+=0.1");
  }

  /* =====================================================
     SCROLL ANIMATIONS
     ===================================================== */
  function initScroll() {
    if (!hasGSAP) return;

    // nav state
    var nav = document.getElementById("nav");
    ScrollTrigger.create({
      start: 60,
      onUpdate: function (self) {
        nav.classList.toggle("scrolled", self.scroll() > 60);
      }
    });

    if (reducedMotion) {
      document.querySelectorAll("[data-reveal],[data-reveal-group] > *").forEach(function (el) {
        el.style.opacity = 1; el.style.transform = "none";
      });
      return;
    }

    // marquee
    gsap.to("#marquee-track", { xPercent: -50, duration: 22, ease: "none", repeat: -1 });

    // generic reveals
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%" }
      });
    });
    document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      gsap.to(group.children, {
        opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.12,
        scrollTrigger: { trigger: group, start: "top 84%" }
      });
    });

    // circuit line draw + traveling pulse (why section)
    var livePath = document.getElementById("circuit-why-path");
    var pulseDot = document.getElementById("circuit-why-pulse");
    if (livePath && pulseDot) {
      var len = livePath.getTotalLength();
      livePath.style.strokeDasharray = len;
      livePath.style.strokeDashoffset = len;
      gsap.to(livePath, {
        strokeDashoffset: 0, ease: "none",
        scrollTrigger: {
          trigger: "#why", start: "top 80%", end: "bottom 40%", scrub: 0.6,
          onUpdate: function (self) {
            var p = livePath.getPointAtLength(len * self.progress);
            pulseDot.setAttribute("cx", p.x);
            pulseDot.setAttribute("cy", p.y);
            pulseDot.style.opacity = self.progress > 0.01 && self.progress < 0.995 ? 1 : 0;
          }
        }
      });
    }

    // truck parallax
    gsap.fromTo("#truck-img", { yPercent: -6 }, {
      yPercent: 6, ease: "none",
      scrollTrigger: { trigger: "#truck", start: "top bottom", end: "bottom top", scrub: 0.5 }
    });

    // horizontal work gallery (desktop only)
    ScrollTrigger.matchMedia({
      "(min-width: 641px)": function () {
        var track = document.getElementById("work-track");
        var pin = document.getElementById("work-pin");
        function dist() { return Math.max(0, track.scrollWidth - window.innerWidth); }
        gsap.to(track, {
          x: function () { return -dist(); },
          ease: "none",
          scrollTrigger: {
            trigger: pin, start: "top 12%",
            end: function () { return "+=" + dist(); },
            pin: true, scrub: 0.7, invalidateOnRefresh: true, anticipatePin: 1
          }
        });
      }
    });
  }

  /* =====================================================
     BOOT
     ===================================================== */
  function boot() {
    splitLetters();
    initHeroScene();
    initScroll();
    hidePreloader(heroIntro);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
