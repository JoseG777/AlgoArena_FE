import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";

const AlgorithmVortex: React.FC = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const options = {
    fullScreen: { enable: false },
    fpsLimit: 60,
    background: { color: { value: "#000" } },
    particles: {
      number: { value: 100, density: { enable: true } },
      color: { value: ["#00FFFF", "#FF008C", "#8A2BE2"] },
      shape: {
        type: "char",
        options: {
          character: [
            { value: "0" },
            { value: "1" },
            { value: "<" },
            { value: ">" },
            { value: "/" },
            { value: "λ" },
            { value: "{}" },
            { value: "()" },
          ],
        },
      },
      opacity: { value: 0.8 },
      size: { value: { min: 8, max: 16 } },
      move: {
        enable: true,
        speed: 1.6,
        random: true,
        attract: { enable: true, rotate: { x: 6000, y: 1200 } },
      },
      rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 4 } },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "attract" },
        onClick: { enable: true, mode: "push" },
      },
      modes: { attract: { distance: 150, duration: 0.4 }, push: { quantity: 4 } },
    },
    detectRetina: true,
  };

  return (
    <Particles
      id="algo-vortex"
      options={options as any}
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
      init={particlesInit as any}
    />
  );
};

export default AlgorithmVortex;
