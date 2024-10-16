import React, { useEffect, useRef } from "react";

const SmoothHighDPIDynamicGrayscaleAIAgentCollaborationAnimation = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);
    resizeCanvas();

    const agentCount = 75;
    let agents = [];

    class Agent {
      constructor() {
        const rect = container.getBoundingClientRect();
        this.x = Math.random() * rect.width;
        this.y = Math.random() * rect.height;
        this.vx = (Math.random() * 2 - 1) * 0.5; // Reduced initial velocity
        this.vy = (Math.random() * 2 - 1) * 0.5; // Reduced initial velocity
        this.baseRadius = 2; // Reduced from 3.75 to 2.5
        this.radius = this.baseRadius;
        this.brightness = Math.random() * 50 + 25;
        this.attractionTarget = null;
        this.attractionDuration = 0;
        this.group = Math.floor(Math.random() * 5); // Assign to one of 5 groups
        this.groupColor = this.getGroupColor();
      }

      getGroupColor() {
        const shades = [
          [200, 200, 200], // Light gray
          [160, 160, 160], // Medium light gray
          [120, 120, 120], // Medium gray
          [80, 80, 80], // Medium dark gray
          [40, 40, 40], // Dark gray
        ];
        return shades[this.group];
      }

      update() {
        const rect = container.getBoundingClientRect();

        if (this.attractionTarget) {
          // Only attract to agents in the same group
          if (this.group === this.attractionTarget.group) {
            this.vx += (this.attractionTarget.x - this.x) * 0.03;
            this.vy += (this.attractionTarget.y - this.y) * 0.03;
          }

          // Increased attraction to target
          this.attractionDuration--;
          if (this.attractionDuration <= 0) {
            this.attractionTarget = null;
          }
        } else {
          // Existing center attraction logic
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const distToCenter = Math.hypot(this.x - centerX, this.y - centerY);
          if (distToCenter > 200) {
            this.vx += (centerX - this.x) * 0.0001;
            this.vy += (centerY - this.y) * 0.0001;
          }

          // Choose a new attraction target from the same group
          if (Math.random() < 0.05) {
            const sameGroupAgents = agents.filter(
              (a) => a.group === this.group
            );
            this.attractionTarget =
              sameGroupAgents[
                Math.floor(Math.random() * sameGroupAgents.length)
              ];
            this.attractionDuration = Math.floor(Math.random() * 150) + 100;
          }
        }

        // Reduced max speed
        const maxSpeed = 1;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > maxSpeed) {
          this.vx = (this.vx / speed) * maxSpeed;
          this.vy = (this.vy / speed) * maxSpeed;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > rect.width) this.vx *= -1;
        if (this.y < 0 || this.y > rect.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const [r, g, b] = this.groupColor;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fill();
      }
    }

    const init = () => {
      agents = Array.from({ length: agentCount }, () => new Agent());
    };

    const animate = () => {
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      agents.forEach((agent) => {
        agent.update();
      });

      agents.forEach((agent, i) => {
        for (let j = i + 1; j < agents.length; j++) {
          const otherAgent = agents[j];
          const dx = agent.x - otherAgent.x;
          const dy = agent.y - otherAgent.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 100; // Kept the reduced max distance for connections

          if (distance < maxDistance && agent.group === otherAgent.group) {
            const opacity = 1 - distance / maxDistance;
            ctx.beginPath();
            ctx.moveTo(agent.x, agent.y);
            ctx.lineTo(otherAgent.x, otherAgent.y);
            const [r, g, b] = agent.groupColor;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Add slight attraction between connected agents in the same group
            const attractionForce = 0.03;
            agent.vx += (dx / distance) * attractionForce;
            agent.vy += (dy / distance) * attractionForce;
            otherAgent.vx -= (dx / distance) * attractionForce;
            otherAgent.vy -= (dy / distance) * attractionForce;
          }
        }
      });

      agents.forEach((agent) => {
        agent.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default SmoothHighDPIDynamicGrayscaleAIAgentCollaborationAnimation;
