/* ==========================================================================
   ACT III JS — Typewriter Mechanics, Text Splitting & Reflection Reveal
   ========================================================================== */

function initAct3() {
  const paperSheet = document.getElementById("reflection-paper");
  const typedContainer = document.getElementById("typed-content");
  const skipBtn = document.querySelector(".skip-typing-btn");
  const statusTag = document.querySelector(".typewriter-status-tag");
  const mask = document.querySelector(".comedy-mask-hanging");
  const maskString = document.querySelector(".mask-string");
  const maskShards = document.querySelector(".mask-shards-wrap");

  if (!paperSheet || !typedContainer) return;

  let hasStarted = false;
  let isFinished = false;
  let typingTimeout = null;
  let allCharSpans = [];

  // Animate the falling comedy mask that breaks to reveal the bare lead face
  function dropMaskAndStart() {
    if (mask && !mask.dataset.broken) {
      mask.dataset.broken = "true";
      if (maskString) maskString.style.opacity = "0";

      gsap.to(mask, {
        y: 120,
        rotation: 140,
        duration: 0.85,
        ease: "power2.in",
        onComplete: () => {
          AudioEngine.ceramicBreak();
          mask.style.opacity = "0";
          if (maskShards) {
            maskShards.style.opacity = "1";
            gsap.fromTo(".shard", 
              { scale: 0.2, y: -10 },
              { scale: 1, y: 0, stagger: 0.04, duration: 0.4, ease: "bounce.out" }
            );
          }
          startTyping();
        }
      });
    } else {
      startTyping();
    }
  }

  // Parse paragraphs and wrap words + characters for authentic typewriter strike rendering
  function prepareTypewriterDOM() {
    const rawParagraphs = typedContainer.querySelectorAll("p");
    allCharSpans = [];

    rawParagraphs.forEach((p) => {
      const text = p.textContent.trim();
      p.innerHTML = ""; // Clear plain text

      // Split words cleanly on one or more whitespace
      const words = text.split(/\s+/);
      words.forEach((word, wIdx) => {
        const wordSpan = document.createElement("span");
        wordSpan.className = "type-word";

        // Character breakdown preserving Romanian diacritics
        const chars = Array.from(word);
        chars.forEach((char) => {
          const charSpan = document.createElement("span");
          charSpan.className = "type-char";
          charSpan.textContent = char;

          // Authentic uneven ink strike variations
          const randOpacity = (0.86 + Math.random() * 0.14).toFixed(2);
          const randY = (Math.random() * 0.6 - 0.3).toFixed(1);
          charSpan.style.setProperty("--target-opacity", randOpacity);
          charSpan.style.setProperty("--target-y", `${randY}px`);

          wordSpan.appendChild(charSpan);
          allCharSpans.push({ span: charSpan, isSpace: false, isParaEnd: false });
        });

        p.appendChild(wordSpan);

        // Add breakable space between words
        if (wIdx < words.length - 1) {
          const spaceSpan = document.createElement("span");
          spaceSpan.className = "type-space";
          spaceSpan.textContent = " ";
          p.appendChild(spaceSpan);
          allCharSpans.push({ span: spaceSpan, isSpace: true, isParaEnd: false });
        }
      });

      // Mark the end of paragraph for carriage return bell & paper slide
      if (allCharSpans.length > 0) {
        allCharSpans[allCharSpans.length - 1].isParaEnd = true;
      }
    });
  }

  prepareTypewriterDOM();

  function startTyping() {
    if (hasStarted) return;
    hasStarted = true;
    AudioEngine.unlock();

    if (statusTag) statusTag.textContent = "Se redactează...";

    let currentIndex = 0;
    let paperShift = 0;

    function step() {
      if (isFinished || currentIndex >= allCharSpans.length) {
        finishTyping();
        return;
      }

      const item = allCharSpans[currentIndex];
      const span = item.span;

      // Reveal char
      span.classList.add("typed");
      if (item.isSpace) {
        span.style.opacity = "1";
      } else {
        const targetOpacity = span.style.getPropertyValue("--target-opacity") || "1";
        const targetY = span.style.getPropertyValue("--target-y") || "0px";
        span.style.opacity = targetOpacity;
        span.style.transform = `translateY(${targetY})`;
        span.style.filter = "blur(0px)";
        AudioEngine.typeKey();
      }

      let delay = 26 + Math.random() * 12;

      // Paragraph end: carriage return
      if (item.isParaEnd) {
        AudioEngine.carriageBell();
        paperShift += 18;
        gsap.to(paperSheet, {
          y: -paperShift,
          duration: 0.45,
          ease: "power2.out"
        });
        delay = 480; // Pause at end of paragraph
      } else if (item.span.textContent === "." || item.span.textContent === "!" || item.span.textContent === "?") {
        delay = 140; // Slight pause after punctuation
      } else if (item.span.textContent === ",") {
        delay = 80;
      }

      currentIndex++;
      typingTimeout = setTimeout(step, delay);
    }

    step();
  }

  function finishTyping() {
    if (isFinished) return;
    isFinished = true;
    if (typingTimeout) clearTimeout(typingTimeout);

    allCharSpans.forEach(item => {
      const span = item.span;
      span.classList.add("typed");
      span.style.opacity = item.isSpace ? "1" : (span.style.getPropertyValue("--target-opacity") || "1");
      span.style.filter = "blur(0px)";
      span.style.transform = "none";
    });
      span.classList.add("typed");
      span.style.opacity = "1";
      span.style.filter = "blur(0px)";
      span.style.transform = "none";
    });

    AudioEngine.carriageBell();
    if (statusTag) statusTag.textContent = "Redactat complet";

    // Reveal signature smoothly
    const sign = document.querySelector(".reflection-signature");
    if (sign) {
      gsap.fromTo(sign, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" });
    }
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      finishTyping();
    });
  }

  // Trigger when sheet comes into view
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.create({
      trigger: "#act3",
      start: "top 60%",
      once: true,
      onEnter: () => {
        dropMaskAndStart();
      }
    });
  } else {
    // Fallback: start on click or interaction
    paperSheet.addEventListener("click", () => {
      dropMaskAndStart();
    });
  }

  if (mask) {
    mask.addEventListener("click", () => {
      dropMaskAndStart();
    });
  }

  window.startAct3Typing = dropMaskAndStart;
}
