/* ==========================================================================
   PROLOG II JS — GEORGE BACOVIA (Geamul Aburit, Cartea de Plumb & Călimările)
   ========================================================================== */

function initPrologBacovia() {
  /* ------------------------------------------------------------------------
     1. GEAMUL ABURIT CU CANVAS (Cine a fost și epoca sa)
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById("steam-canvas");
  const wrapper = document.querySelector(".window-pane-wrapper");
  const fallbackBtn = document.querySelector(".btn-wipe-fallback");
  const nameReveal = document.querySelector(".steamy-name-reveal");

  let isWiping = false;
  let isPermanentlyCleared = false;
  let refogInterval = null;
  let lastX = 0;
  let lastY = 0;

  if (canvas && wrapper) {
    const ctx = canvas.getContext("2d");

    function setupSteamCanvas() {
      const rect = wrapper.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Draw initial dense steam layer
      ctx.fillStyle = "rgba(201, 205, 211, 0.78)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add soft cold texture to steam
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = 20 + Math.random() * 60;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, "rgba(220, 225, 235, 0.2)");
        grad.addColorStop(1, "rgba(180, 185, 195, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    setupSteamCanvas();
    window.addEventListener("resize", setupSteamCanvas);

    // Wipe action with soft destination-out brush
    function wipeAt(x, y, speed) {
      if (isPermanentlyCleared) return;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";

      const radius = 38;
      const grad = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
      grad.addColorStop(0, "rgba(0, 0, 0, 1)");
      grad.addColorStop(0.7, "rgba(0, 0, 0, 0.85)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      AudioEngine.glassWipe(speed);
    }

    canvas.addEventListener("pointerdown", (e) => {
      isWiping = true;
      AudioEngine.unlock();
      const rect = canvas.getBoundingClientRect();
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
      wipeAt(lastX, lastY, 150);
    });

    window.addEventListener("pointerup", () => {
      isWiping = false;
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!isWiping) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const speed = Math.hypot(x - lastX, y - lastY);
      wipeAt(x, y, speed);
      lastX = x;
      lastY = y;
    });

    // Check transparency ratio periodically
    function checkSteamCleared() {
      if (isPermanentlyCleared) return;
      const sampleW = 50;
      const sampleH = 30;
      let transparentPixels = 0;
      const totalSamples = sampleW * sampleH;

      for (let i = 0; i < sampleW; i++) {
        for (let j = 0; j < sampleH; j++) {
          const px = Math.floor((i / sampleW) * canvas.width);
          const py = Math.floor((j / sampleH) * canvas.height);
          const pixel = ctx.getImageData(px, py, 1, 1).data;
          if (pixel[3] < 50) {
            transparentPixels++;
          }
        }
      }

      if (transparentPixels / totalSamples >= 0.55) {
        isPermanentlyCleared = true;
        if (refogInterval) clearInterval(refogInterval);
        gsap.to(canvas, { opacity: 0, duration: 1.2, pointerEvents: "none" });
      }
    }

    const checkInterval = setInterval(checkSteamCleared, 500);

    // Subtle re-fogging loop (Bacovia's window gets cloudy again if left alone)
    refogInterval = setInterval(() => {
      if (isPermanentlyCleared || isWiping) return;
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(201, 205, 211, 0.012)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }, 120);

    // Fallback wipe button
    if (fallbackBtn) {
      fallbackBtn.addEventListener("click", () => {
        isPermanentlyCleared = true;
        AudioEngine.glassWipe(250);
        gsap.to(canvas, { opacity: 0, duration: 0.8, pointerEvents: "none" });
      });
    }

    // Name transformation: "Gheorghe Vasiliu" -> "George Bacovia"
    if (nameReveal) {
      setTimeout(() => {
        gsap.to(nameReveal, {
          opacity: 0,
          y: 6,
          filter: "blur(2px)",
          duration: 0.8,
          onComplete: () => {
            nameReveal.textContent = "George Bacovia";
            gsap.to(nameReveal, {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 1.2
            });
          }
        });
      }, 3500);
    }
  }

  /* ------------------------------------------------------------------------
     2. CARTEA DE PLUMB (Viziunea despre lume și universul poetic)
     ------------------------------------------------------------------------ */
  const leadBook = document.querySelector(".lead-book");
  if (leadBook) {
    leadBook.addEventListener("click", () => {
      AudioEngine.unlock();
      AudioEngine.clunk();
      leadBook.classList.toggle("open");
    });
  }

  /* ------------------------------------------------------------------------
     3. CELE 4 CĂLIMĂRI (Culorile obsesive & Simbolismul)
     ------------------------------------------------------------------------ */
  const bottles = document.querySelectorAll(".ink-bottle-btn");
  const spillMeaning = document.querySelector(".spilled-ink-meaning");
  const spillOverlay = document.querySelector(".ink-spill-overlay");
  const triedColors = new Set();

  const INK_DATA = {
    lead: {
      color: "rgba(90, 96, 108, 0.45)",
      note: 98.00,
      text: "Cenușiul / plumbul — sugerează greutatea sufletească și lipsa de scăpare."
    },
    yellow: {
      color: "rgba(184, 162, 74, 0.38)",
      note: 123.47,
      text: "Galbenul — simbolizează boala și deznădejdea profundă."
    },
    black: {
      color: "rgba(11, 11, 13, 0.65)",
      note: 65.41,
      text: "Negrul — imaginea absolută a morții și a sfârșitului."
    },
    violet: {
      color: "rgba(75, 58, 92, 0.42)",
      note: 116.54,
      text: "Violetul — evocă nevroza, halucinația și apăsarea psihică."
    }
  };

  bottles.forEach(btn => {
    btn.addEventListener("click", () => {
      AudioEngine.unlock();
      const inkKey = btn.dataset.ink;
      const data = INK_DATA[inkKey];
      if (!data) return;

      triedColors.add(inkKey);

      // Play ink note
      AudioEngine.bell(data.note);

      // Show exact meaning
      if (spillMeaning) {
        spillMeaning.textContent = data.text;
        gsap.fromTo(spillMeaning, { opacity: 0.4, y: 3 }, { opacity: 1, y: 0, duration: 0.3 });
      }

      // Tint overlay
      if (spillOverlay) {
        spillOverlay.style.backgroundColor = data.color;
        spillOverlay.style.opacity = "1";
      }

      // If all 4 colors tried, settle back to heavy lead tint
      if (triedColors.size >= 4) {
        setTimeout(() => {
          if (spillOverlay) {
            spillOverlay.style.backgroundColor = "rgba(40, 44, 52, 0.5)";
          }
        }, 3000);
      }
    });
  });
}
