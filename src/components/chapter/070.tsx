import React, { useEffect, useRef } from "react";

const AutonomousAgentsVisualization = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const MAX_HEIGHT = 400; // Set maximum height to 600px

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let agents = [];
    const numAgents = 100;
    const connectionDistance = 100;

    function initializeAgents() {
      agents = [];
      for (let i = 0; i < numAgents; i++) {
        agents.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          radius: 5,
        });
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Enable anti-aliasing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Get the current color based on the color scheme
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue("--foreground")
        .trim();

      // Update and draw agents
      agents.forEach((agent) => {
        // Update position
        agent.x += agent.vx;
        agent.y += agent.vy;

        // Bounce off the left and right walls
        if (agent.x - agent.radius <= 0) {
          agent.vx = Math.abs(agent.vx);
          agent.x = agent.radius;
        } else if (agent.x + agent.radius >= canvas.width) {
          agent.vx = -Math.abs(agent.vx);
          agent.x = canvas.width - agent.radius;
        }

        // Bounce off the top and bottom walls
        if (agent.y - agent.radius <= 0) {
          agent.vy = Math.abs(agent.vy);
          agent.y = agent.radius;
        } else if (agent.y + agent.radius >= canvas.height) {
          agent.vy = -Math.abs(agent.vy);
          agent.y = canvas.height - agent.radius;
        }

        // Draw agent with smoother edges
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, agent.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${color}`;
        ctx.fill();

        // Add a subtle glow effect
        const gradient = ctx.createRadialGradient(
          agent.x,
          agent.y,
          0,
          agent.x,
          agent.y,
          agent.radius * 2
        );
        gradient.addColorStop(0, `${color}4D`); // 30% opacity
        gradient.addColorStop(1, `${color}00`); // 0% opacity
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, agent.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Connect nearby agents with improved line quality
        agents.forEach((otherAgent) => {
          if (agent === otherAgent) return; // Avoid connecting the agent to itself

          const dx = otherAgent.x - agent.x;
          const dy = otherAgent.y - agent.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(agent.x, agent.y);
            ctx.lineTo(otherAgent.x, otherAgent.y);
            const alpha = 1 - distance / connectionDistance;
            ctx.strokeStyle = `${color}${Math.round(alpha * 0.5 * 255)
              .toString(16)
              .padStart(2, "0")}`;
            ctx.lineWidth = 0.75;
            ctx.lineCap = "round";
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    function handleResize() {
      const container = canvas.parentElement;
      const { width } = container.getBoundingClientRect();
      const height = Math.min(width * 0.75, MAX_HEIGHT); // Set height to 3/4 of width, but not exceeding MAX_HEIGHT

      const dpr = window.devicePixelRatio || 1;

      // Reset the transformation matrix before scaling
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      initializeAgents();
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    animate();

    // Add event listener for color scheme changes
    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    colorSchemeQuery.addListener(handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      colorSchemeQuery.removeListener(handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      className="w-full"
      style={{ maxHeight: `${MAX_HEIGHT}px`, aspectRatio: "4 / 3" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: "transparent" }}
      />
    </div>
  );
};

export default AutonomousAgentsVisualization;
