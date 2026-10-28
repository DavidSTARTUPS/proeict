/* ==========================================================================
   MAIN JS — State Machine, App Router, Mute Controller & Initialization
   ========================================================================== */

window.App = (() => {
  let currentState = "gate";

  function go(newState) {
    currentState = newState;
    document.body.setAttribute("data-state", newState);

    if (newState === "act1") {
      document.body.style.overflow = "auto";
      const act1 = document.getElementById("act1");
      if (act1) {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    } else if (newState === "act2") {
      document.body.style.overflow = "auto";
      const act2 = document.getElementById("act2");
      if (act2) {
        act2.scrollIntoView({ behavior: "smooth" });
      }
    } else if (newState === "act3") {
      document.body.style.overflow = "auto";
      const act3 = document.getElementById("act3");
      if (act3) {
        act3.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  function initMuteButton() {
    const muteBtn = document.querySelector(".audio-toggle-btn");
    const muteLabel = muteBtn ? muteBtn.querySelector(".mute-label") : null;
    const muteIcon = muteBtn ? muteBtn.querySelector(".mute-icon") : null;

    function updateMuteUI(isMuted) {
      if (muteLabel) {
        muteLabel.textContent = isMuted ? "SUNET: OPRIT" : "SUNET: ACTIV";
      }
      if (muteIcon) {
        muteIcon.innerHTML = isMuted
          ? `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`
          : `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
      }
    }

    if (muteBtn) {
      updateMuteUI(AudioEngine.isMuted());
      muteBtn.addEventListener("click", () => {
        AudioEngine.unlock();
        const nextState = !AudioEngine.isMuted();
        AudioEngine.setMuted(nextState);
        updateMuteUI(nextState);
      });
    }
  }

  function init() {
    // Register GSAP plugins
    if (typeof gsap !== "undefined") {
      if (typeof Draggable !== "undefined") gsap.registerPlugin(Draggable);
      if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
    }

    // Set initial gate state
    go("gate");

    // Initialize audio controls
    initMuteButton();

    // Initialize all modules
    if (typeof initGate === "function") initGate();
    if (typeof initPrologCaragiale === "function") initPrologCaragiale();
    if (typeof initAct1 === "function") initAct1();
    if (typeof initPrologBacovia === "function") initPrologBacovia();
    if (typeof initAct2 === "function") initAct2();
    if (typeof initAct3 === "function") initAct3();
  }

  return {
    get state() { return currentState; },
    go,
    init
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
