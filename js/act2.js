/* ==========================================================================
   ACT II JS — Rain Canvas, 6 Plumb Drops, Sound Frequencies & Marble Plaques
   ========================================================================== */

function initAct2() {
  /* ------------------------------------------------------------------------
     1. RAIN CANVAS BACKGROUND
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById("rain-canvas");
  let rainCtx = null;
  let rainAnimationId = null;
  let drops = [];
  const DROP_COUNT = 150;

  if (canvas) {
    rainCtx = canvas.getContext("2d");

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    drops = Array.from({ length: DROP_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: 12 + Math.random() * 18,
      speed: 18 + Math.random() * 16,
      opacity: 0.12 + Math.random() * 0.22
    }));

    function drawRain() {
      rainCtx.clearRect(0, 0, canvas.width, canvas.height);
      rainCtx.lineWidth = 1.2;

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        rainCtx.strokeStyle = `rgba(180, 190, 205, ${d.opacity})`;
        rainCtx.beginPath();
        rainCtx.moveTo(d.x, d.y);
        rainCtx.lineTo(d.x - 3, d.y + d.len);
        rainCtx.stroke();

        d.x -= 1.5;
        d.y += d.speed;

        if (d.y > canvas.height) {
          d.y = -20;
          d.x = Math.random() * (canvas.width + 100);
        }
      }

      rainAnimationId = requestAnimationFrame(drawRain);
    }

    drawRain();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (rainAnimationId) cancelAnimationFrame(rainAnimationId);
      } else {
        drawRain();
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. 6 PLUMB BLOCKS & MARBLE ANALYSIS REVEAL
     ------------------------------------------------------------------------ */
  const plumbButtons = document.querySelectorAll(".plumb");
  const analysisPanels = document.querySelectorAll(".analysis-panel");
  const compPanel = document.querySelector(".composition-panel");
  const placeholder = document.querySelector(".analysis-placeholder");
  const weightIndicators = document.querySelectorAll(".weight-indicator");
  const symmetryDivider = document.querySelector(".symmetry-divider");
  const poemTitle = document.querySelector(".poem-main-title");
  const scrollPrompt = document.querySelector(".act3-scroll-prompt");
  const svgLinesContainer = document.getElementById("connector-svg");

  // Descending frequencies in Hz for occurrences 1 to 6
  const NOTES = [130.81, 110.00, 98.00, 82.41, 73.42, 55.00];

  function drawConnectorLine(wordEl, panelEl) {
    if (!svgLinesContainer || window.innerWidth < 960) return;
    const wordRect = wordEl.getBoundingClientRect();
    const panelRect = panelEl.getBoundingClientRect();
    const svgRect = svgLinesContainer.getBoundingClientRect();

    const x1 = wordRect.right - svgRect.left;
    const y1 = wordRect.top + wordRect.height / 2 - svgRect.top;
    const x2 = panelRect.left - svgRect.left;
    const y2 = panelRect.top + 25 - svgRect.top;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("class", `connector-${wordEl.dataset.i}`);

    // Remove any previous line for this index
    const oldLine = svgLinesContainer.querySelector(`.connector-${wordEl.dataset.i}`);
    if (oldLine) oldLine.remove();

    svgLinesContainer.appendChild(line);
  }

  function revealAnalysis(index, wordEl) {
    if (placeholder) placeholder.style.display = "none";

    // Dim older panels and highlight the newest
    analysisPanels.forEach(panel => {
      panel.classList.remove("active-panel");
      panel.classList.add("dimmed");
    });

    const targetPanel = document.getElementById(`panel-${index}`);
    if (targetPanel) {
      targetPanel.classList.add("revealed", "active-panel");
      targetPanel.classList.remove("dimmed");

      // GSAP Unfold animation: clip-path inset top-to-bottom
      gsap.fromTo(targetPanel, 
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 0.75, ease: "power3.out" }
      );

      // Stagger text lines
      gsap.fromTo(targetPanel.querySelectorAll(".panel-header, .panel-body"),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.5, delay: 0.2, ease: "power2.out" }
      );

      if (wordEl) {
        setTimeout(() => drawConnectorLine(wordEl, targetPanel), 100);
      }
    }
  }

  function activatePlumb(el, i) {
    AudioEngine.unlock();

    // If already activated, replay the dark bell note and slight bounce
    if (el.dataset.done === "1") {
      AudioEngine.bell(NOTES[i - 1]);
      gsap.fromTo(el, { y: 6 }, { y: 10, yoyo: true, repeat: 1, duration: 0.2 });
      // Bring corresponding panel to front
      analysisPanels.forEach(p => p.classList.add("dimmed"));
      const p = document.getElementById(`panel-${i}`);
      if (p) {
        p.classList.remove("dimmed");
        p.classList.add("active-panel");
      }
      return;
    }

    el.dataset.done = "1";

    // Heavy lead drop physics
    gsap.timeline()
      .to(el, { y: 10, duration: 0.35, ease: "power4.in" })
      .to(el, { y: 6, duration: 0.45, ease: "bounce.out" })
      .to(".poem-frame", { y: 2, duration: 0.06, yoyo: true, repeat: 1 }, "<");

    // Play tone
    AudioEngine.bell(NOTES[i - 1]);

    // Progress updates
    const doneCount = document.querySelectorAll(".plumb[data-done='1']").length;
    document.documentElement.style.setProperty("--vignette", (0.5 + doneCount * 0.06).toFixed(2));

    // Fill corresponding lead weight icon
    if (weightIndicators[i - 1]) {
      weightIndicators[i - 1].classList.add("filled");
    }

    revealAnalysis(i, el);

    // ★ ALL 6 COMPLETED: AUTO-UNLOCK COMPOSITION PANEL
    if (doneCount === 6) {
      setTimeout(() => {
        // Darken & sink title
        if (poemTitle) poemTitle.classList.add("sunk");
        // Highlight symmetry split
        if (symmetryDivider) symmetryDivider.classList.add("highlight");

        // Unfold composition panel
        if (compPanel) {
          compPanel.classList.add("revealed");
          gsap.fromTo(compPanel,
            { clipPath: "inset(0 0 100% 0)", opacity: 0 },
            { clipPath: "inset(0 0 0% 0)", opacity: 1, duration: 1.1, ease: "power3.out" }
          );
        }

        // Show scroll prompt to Act III
        if (scrollPrompt) {
          scrollPrompt.classList.add("visible");
        }

        // Deep closing chord
        AudioEngine.bell(45);
      }, 700);
    }
  }

  // Bind clicks and Draggable to each plumb button
  plumbButtons.forEach((btn, idx) => {
    const plumbIndex = parseInt(btn.dataset.i, 10) || (idx + 1);

    btn.addEventListener("click", () => {
      activatePlumb(btn, plumbIndex);
    });

    if (typeof Draggable !== "undefined") {
      Draggable.create(btn, {
        type: "y",
        bounds: { minY: 0, maxY: 24 },
        onPress() {
          AudioEngine.unlock();
        },
        onRelease() {
          if (this.y > 8 || btn.dataset.done !== "1") {
            activatePlumb(btn, plumbIndex);
          } else {
            gsap.to(btn, { y: btn.dataset.done === "1" ? 6 : 0, duration: 0.3 });
          }
        }
      });
    }
  });

  // Prompt click scrolls down to Act III
  if (scrollPrompt) {
    const promptBtn = scrollPrompt.querySelector(".scroll-btn-act3");
    if (promptBtn) {
      promptBtn.addEventListener("click", () => {
        const act3 = document.getElementById("act3");
        if (act3) {
          act3.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  }

  // Redraw SVG connector lines on window resize
  window.addEventListener("resize", () => {
    const activeWord = document.querySelector(".plumb[data-done='1']");
    const activePanel = document.querySelector(".analysis-panel.active-panel");
    if (activeWord && activePanel) {
      drawConnectorLine(activeWord, activePanel);
    }
  });
}
