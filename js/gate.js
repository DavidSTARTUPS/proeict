/* ==========================================================================
   GATE JS — Opening Envelope Draggable Interaction & Transition
   ========================================================================== */

function initGate() {
  const letter = document.getElementById("letter");
  const envelope = document.querySelector(".envelope");
  const gate = document.getElementById("gate");
  const skipBtn = document.querySelector(".gate-skip-btn");

  if (!letter || !envelope) return;

  const maxPull = 260; // px upward
  let isOpened = false;

  // Subtle idle bobbing animation
  const bobTween = gsap.to(letter, {
    y: -8,
    duration: 1.4,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut"
  });

  function stopIdle() {
    if (bobTween) bobTween.kill();
  }

  function openDossier() {
    if (isOpened) return;
    isOpened = true;
    stopIdle();
    AudioEngine.unlock();
    AudioEngine.paperFlip();

    // Disable Draggable
    const draggableInstance = Draggable.get(letter);
    if (draggableInstance) draggableInstance.disable();

    const tl = gsap.timeline({
      onComplete: () => {
        if (gate) {
          gate.classList.add("hidden");
        }
        if (window.App && window.App.go) {
          window.App.go("act1");
        }
      }
    });

    // 1. Envelope falls away in 3D
    tl.to(envelope, {
      rotateX: 75,
      y: 420,
      opacity: 0,
      duration: 1.1,
      ease: "power3.in"
    });

    // 2. Letter expands smoothly into full dossier screen
    tl.to(letter, {
      y: -maxPull - 80,
      scale: 1.45,
      opacity: 0.2,
      duration: 0.9,
      ease: "power2.inOut"
    }, "-=0.8");

    // 3. Fade out gate container smoothly
    tl.to(gate, {
      opacity: 0,
      duration: 0.7,
      ease: "power2.out"
    }, "-=0.4");
  }

  // Draggable registration
  if (typeof Draggable !== "undefined") {
    Draggable.create(letter, {
      type: "y",
      bounds: { minY: -maxPull, maxY: 0 },
      edgeResistance: 0.85,
      onPress() {
        AudioEngine.unlock();
        stopIdle();
      },
      onDrag() {
        const p = Math.min(1, -this.y / maxPull);
        AudioEngine.rustle(this.deltaY);
        gsap.set(envelope, {
          rotateX: p * 24,
          rotateZ: p * -3.5,
          z: -p * 75
        });
        document.documentElement.style.setProperty("--vignette", 0.5 + p * 0.25);
        const stain = document.querySelector(".letter-ink-stain");
        if (stain) {
          stain.style.opacity = p > 0.5 ? Math.min(1, (p - 0.5) * 2) : 0;
        }
      },
      onRelease() {
        const p = -this.y / maxPull;
        if (p > 0.7) {
          openDossier();
        } else {
          const stain = document.querySelector(".letter-ink-stain");
          if (stain) stain.style.opacity = 0;
          gsap.to(letter, {
            y: 0,
            duration: 0.6,
            ease: "back.out(2)"
          });
          gsap.to(envelope, {
            rotateX: 0,
            rotateZ: 0,
            z: 0,
            duration: 0.6,
            ease: "power2.out"
          });
        }
      }
    });
  }

  // Click & keyboard accessibility fallback
  letter.addEventListener("click", () => {
    openDossier();
  });

  letter.setAttribute("tabindex", "0");
  letter.setAttribute("role", "button");
  letter.setAttribute("aria-label", "Deschide dosarul");
  letter.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDossier();
    }
  });

  if (skipBtn) {
    skipBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openDossier();
    });
  }

  window.openDossier = openDossier;
}
