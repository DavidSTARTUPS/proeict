/* ==========================================================================
   ACT I JS — Flip Cards, Theater Stage Didascalii & Iron Lever Transition
   ========================================================================== */

function initAct1() {
  /* ------------------------------------------------------------------------
     1. DOSSIER FLIP CARDS
     ------------------------------------------------------------------------ */
  const cards = document.querySelectorAll(".dossier-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      AudioEngine.unlock();
      const isFlipped = card.classList.toggle("flipped");
      card.setAttribute("aria-pressed", isFlipped ? "true" : "false");

      // Lift card slightly on flip
      gsap.fromTo(card, 
        { y: 0 }, 
        { y: -12, yoyo: true, repeat: 1, duration: 0.4, ease: "power1.out" }
      );

      AudioEngine.paperFlip();

      // Stamp impact when back is first revealed
      if (isFlipped && !card.dataset.stamped) {
        card.dataset.stamped = "true";
        const stampEl = card.querySelector(".card-thunk-stamp");
        if (stampEl) {
          gsap.fromTo(stampEl, 
            { scale: 2.4, opacity: 0 }, 
            { scale: 1, opacity: 0.85, duration: 0.35, delay: 0.3, ease: "power4.in",
              onStart: () => AudioEngine.stamp()
            }
          );
        }
      }
    });

    // Keyboard support
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  /* ------------------------------------------------------------------------
     2. THEATER STAGE & DIDASCALII
     ------------------------------------------------------------------------ */
  const tabBtns = document.querySelectorAll(".stage-tab-btn");
  const scenePanes = document.querySelectorAll(".scene-pane");
  let activeSceneNum = 1;
  let isSwitchingScene = false;

  function showScene(n) {
    scenePanes.forEach(pane => {
      pane.classList.remove("active");
      if (pane.id === `scene-${n}`) {
        pane.classList.add("active");
      }
    });
    tabBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.scene === String(n));
    });
  }

  function switchScene(n, isInitial = false) {
    if (isSwitchingScene) return;
    isSwitchingScene = true;
    activeSceneNum = n;
    AudioEngine.unlock();

    const tl = gsap.timeline({
      onComplete: () => {
        isSwitchingScene = false;
      }
    });

    if (isInitial) {
      showScene(n);
      tl.to(".curtain-l", { xPercent: -100, duration: 1.1, ease: "power3.out" })
        .to(".curtain-r", { xPercent: 100,  duration: 1.1, ease: "power3.out" }, "<")
        .fromTo(".spotlight", { opacity: 0 }, { opacity: 1, duration: 0.7 }, "<0.2")
        .to(`#scene-${n} .didascalie`, { color: "var(--red-ink)", stagger: 0.35, duration: 0.4 }, "-=0.3")
        .to(`#scene-${n} .didascalie path`, { strokeDashoffset: 0, stagger: 0.35, duration: 0.5 }, "<");
    } else {
      tl.to(".curtain-l", { xPercent: 0, duration: 0.7, ease: "power2.inOut" })
        .to(".curtain-r", { xPercent: 0, duration: 0.7, ease: "power2.inOut" }, "<")
        .add(() => {
          showScene(n);
          AudioEngine.curtain();
        })
        .to(".curtain-l", { xPercent: -100, duration: 1.0, ease: "power3.out" }, "+=0.15")
        .to(".curtain-r", { xPercent: 100,  duration: 1.0, ease: "power3.out" }, "<")
        .fromTo(".spotlight", { opacity: 0.3 }, { opacity: 1, duration: 0.6 }, "<0.3")
        .set(`#scene-${n} .didascalie`, { color: "var(--ink)" })
        .set(`#scene-${n} .didascalie path`, { strokeDashoffset: 200 })
        .to(`#scene-${n} .didascalie`, { color: "var(--red-ink)", stagger: 0.35, duration: 0.4 }, "-=0.3")
        .to(`#scene-${n} .didascalie path`, { strokeDashoffset: 0, stagger: 0.35, duration: 0.5 }, "<");
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const sceneNum = parseInt(btn.dataset.scene, 10);
      if (sceneNum !== activeSceneNum) {
        switchScene(sceneNum);
      }
    });
  });

  // Stage Curtain idle subtle breathing sway
  gsap.to(".curtain-l", {
    skewX: 1,
    duration: 3.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
  gsap.to(".curtain-r", {
    skewX: -1,
    duration: 3.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // ScrollTrigger for auto-opening stage curtains when scrolled into view
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.create({
      trigger: ".stage-section",
      start: "top 70%",
      once: true,
      onEnter: () => {
        switchScene(1, true);
      }
    });
  } else {
    // Fallback if ScrollTrigger is not present
    switchScene(1, true);
  }

  /* ------------------------------------------------------------------------
     3. IRON LEVER & TRANSITION TIMELINE
     ------------------------------------------------------------------------ */
  const leverHandle = document.getElementById("lever-handle");
  const leverPlate = document.querySelector(".lever-plate");
  let transitionFired = false;

  // Intriga unfold interaction
  const intrigaBox = document.querySelector(".intriga-pretext-box");
  if (intrigaBox) {
    intrigaBox.addEventListener("click", () => {
      AudioEngine.unlock();
      AudioEngine.paperFlip();
      gsap.fromTo(intrigaBox, { scale: 0.98 }, { scale: 1, duration: 0.35, ease: "back.out(2)" });
    });
  }

  function dropCurtain() {
    if (transitionFired) return;
    transitionFired = true;
    AudioEngine.unlock();

    const fallingEl = document.querySelector(".act1-falling") || document.querySelector(".newspaper");
    const leadCurtain = document.querySelector(".lead-curtain");

    const tl = gsap.timeline({
      onComplete: () => {
        if (window.App && window.App.go) {
          window.App.go("act2");
        }
      }
    });

    tl.add(() => {
      AudioEngine.clunk();
    })
    // Lights out
    .to(".spotlight, .curtain", { opacity: 0, duration: 0.25, stagger: 0.05 })
    // Falling element tilts then falls heavily
    .to(fallingEl, { rotation: 4, duration: 0.3, ease: "power1.in" })
    .to(fallingEl, { 
      y: "115vh", 
      rotation: 9, 
      duration: 1.4, 
      ease: "bounce.out" 
    })
    .to("body", { backgroundColor: "#1a1d24", duration: 1.6 }, "<")
    .add(() => {
      AudioEngine.pianoChord();
      AudioEngine.startRain();
      // Screen shake on impact
      gsap.to("main", { y: 6, yoyo: true, repeat: 3, duration: 0.05 });
      // Fade in rain canvas
      gsap.to("#rain-canvas", { opacity: 0.7, duration: 2.5 });
    }, "<0.2")
    // Heavy grey lead sheet descends
    .to(leadCurtain, { y: 0, duration: 1.2, ease: "power4.in" }, "<0.3")
    .to(leadCurtain, { opacity: 0, duration: 1.0 })
    .set(fallingEl, { display: "none" });
  }

  if (leverHandle && typeof Draggable !== "undefined") {
    Draggable.create(leverHandle, {
      type: "rotation",
      bounds: { minRotation: 0, maxRotation: 70 },
      onDrag() {
        if (this.rotation >= 58) {
          dropCurtain();
        }
      },
      onRelease() {
        if (this.rotation < 58 && !transitionFired) {
          gsap.to(leverHandle, { rotation: 0, duration: 0.4, ease: "back.out(2)" });
        }
      }
    });
  }

  // Clickable lever fallback
  if (leverPlate) {
    leverPlate.addEventListener("click", () => {
      if (!transitionFired) {
        gsap.to(leverHandle, {
          rotation: 65,
          duration: 0.45,
          ease: "power2.in",
          onComplete: dropCurtain
        });
      }
    });
  }

  window.dropCurtain = dropCurtain;
}
