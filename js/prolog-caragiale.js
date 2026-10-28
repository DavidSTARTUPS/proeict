/* ==========================================================================
   PROLOG I JS — I.L. CARAGIALE (Lupa, Legitimațiile, Ruloul & Sertarele)
   ========================================================================== */

function initPrologCaragiale() {
  /* ------------------------------------------------------------------------
     1. LUPA CARE DEMASCĂ (Viziunea despre lume)
     ------------------------------------------------------------------------ */
  const lensContainer = document.querySelector(".newspaper-lens-container");
  const magnifier = document.getElementById("caragiale-lens");
  const revealLayer = document.querySelector(".text-layer-reveal");
  const stamp = document.querySelector(".magnifier-stamp");
  const fallbackScanBtn = document.querySelector(".btn-scan-fallback");

  if (lensContainer && magnifier && revealLayer) {
    let visitedCells = new Set();
    const GRID_COLS = 6;
    const GRID_ROWS = 4;
    const TOTAL_CELLS = GRID_COLS * GRID_ROWS;
    let isFullyRevealed = false;

    function updateLensPosition(x, y) {
      if (isFullyRevealed) return;
      revealLayer.style.clipPath = `circle(48px at ${x}px ${y}px)`;

      // Calculate grid cell
      const rect = lensContainer.getBoundingClientRect();
      const normX = Math.max(0, Math.min(1, x / rect.width));
      const normY = Math.max(0, Math.min(1, y / rect.height));
      const col = Math.floor(normX * GRID_COLS);
      const row = Math.floor(normY * GRID_ROWS);
      visitedCells.add(`${col}_${row}`);

      if (visitedCells.size / TOTAL_CELLS >= 0.65) {
        completeLensReveal();
      }
    }

    function completeLensReveal() {
      if (isFullyRevealed) return;
      isFullyRevealed = true;
      revealLayer.classList.add("fully-revealed");
      if (stamp) stamp.classList.add("show");
      AudioEngine.stamp();
    }

    // Draggable registration
    if (typeof Draggable !== "undefined") {
      Draggable.create(magnifier, {
        bounds: lensContainer,
        edgeResistance: 0.8,
        onPress() {
          AudioEngine.unlock();
        },
        onDrag() {
          const rect = lensContainer.getBoundingClientRect();
          const x = this.x + 50; // offset center
          const y = this.y + 50;
          updateLensPosition(x, y);
        }
      });
    }

    // Pointer move listener on container as fallback
    lensContainer.addEventListener("pointermove", (e) => {
      const rect = lensContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      gsap.to(magnifier, { x: x - 50, y: y - 50, duration: 0.1 });
      updateLensPosition(x, y);
    });

    if (fallbackScanBtn) {
      fallbackScanBtn.addEventListener("click", () => {
        AudioEngine.unlock();
        const tl = gsap.timeline({ onComplete: completeLensReveal });
        tl.to(magnifier, { x: 40, y: 30, duration: 0.4 })
          .to(magnifier, { x: 200, y: 60, duration: 0.4 })
          .to(magnifier, { x: 120, y: 140, duration: 0.4 })
          .to(magnifier, { x: 260, y: 150, duration: 0.4 });
      });
    }
  }

  /* ------------------------------------------------------------------------
     2. TEANCUL DE LEGITIMAȚII (Cine a fost și epoca sa)
     ------------------------------------------------------------------------ */
  const cards = Array.from(document.querySelectorAll(".id-card-item"));
  const bioCard = document.querySelector(".caragiale-full-bio");
  let currentCardIndex = 0;

  cards.forEach((card, idx) => {
    // Stack cards visually
    card.style.zIndex = cards.length - idx;
    card.style.transform = `translateY(${idx * 4}px) scale(${1 - idx * 0.03})`;

    card.addEventListener("click", () => {
      AudioEngine.unlock();
      AudioEngine.paperFlip();

      // Discard card to right
      gsap.to(card, {
        x: 280,
        rotation: 16,
        opacity: 0,
        duration: 0.45,
        ease: "power2.in",
        onComplete: () => {
          card.style.display = "none";
          currentCardIndex++;

          // If all cards discarded, reveal full bio
          if (currentCardIndex >= cards.length && bioCard) {
            bioCard.classList.add("revealed");
            gsap.fromTo(bioCard, 
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
            );
          }
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     3. SERTARELE DE BIROU (Schițe & Nuvele)
     ------------------------------------------------------------------------ */
  const drawers = document.querySelectorAll(".desk-drawer");
  drawers.forEach(drawer => {
    drawer.addEventListener("click", () => {
      AudioEngine.unlock();
      AudioEngine.drawer();
      drawer.classList.toggle("open");
    });
  });
}
