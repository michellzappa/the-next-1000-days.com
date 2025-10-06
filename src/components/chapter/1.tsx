import React, { useEffect, useRef } from "react";

const AugmentedIntelligenceMonochrome: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const dpr = window.devicePixelRatio || 1;

    const prefersDark = !!(
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );

    const colorNode = prefersDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.9)";

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);
    resizeCanvas();

    const agentCount = 160; // more points to form the ring visually
    const springStrength = 0.02; // pull toward ring
    const damping = 0.92; // calm motion
    const maxSpeed = 1.4; // px/frame

    type AgentType = "human" | "ai";
    class Agent {
      x: number;
      y: number;
      vx: number;
      vy: number;
      type: AgentType;
      visualRadius: number;
      angle: number;
      angularSpeed: number;

      constructor(width: number, height: number, type: AgentType) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() * 2 - 1) * 0.6;
        this.vy = (Math.random() * 2 - 1) * 0.6;
        this.type = type;
        this.visualRadius = this.type === "human" ? 1.9 : 1.5; // subtle distinction, still monochrome
        this.angle = Math.random() * Math.PI * 2;
        this.angularSpeed =
          (Math.random() * 0.006 + 0.002) * (Math.random() < 0.5 ? -1 : 1);
      }

      update(
        width: number,
        height: number,
        centerX: number,
        centerY: number,
        ringRadius: number
      ) {
        // Desired point on the shared ring, advancing slowly to create flow
        this.angle += this.angularSpeed;
        const desiredX = centerX + ringRadius * Math.cos(this.angle);
        const desiredY = centerY + ringRadius * Math.sin(this.angle);

        // Spring toward the ring position
        this.vx += (desiredX - this.x) * springStrength;
        this.vy += (desiredY - this.y) * springStrength;

        // Gentle stochasticity so points subtly shift
        this.vx += (Math.random() - 0.5) * 0.02;
        this.vy += (Math.random() - 0.5) * 0.02;

        // Damping for smoothness
        this.vx *= damping;
        this.vy *= damping;

        // Limit speed for a calm feel
        const speed = Math.hypot(this.vx, this.vy);
        if (speed > maxSpeed) {
          this.vx = (this.vx / speed) * maxSpeed;
          this.vy = (this.vy / speed) * maxSpeed;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Soft containment
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.visualRadius, 0, Math.PI * 2);
        ctx.fillStyle = colorNode;
        ctx.fill();
      }
    }

    const makeAgents = (width: number, height: number) => {
      const humans = Math.floor(agentCount * 0.6);
      const ais = agentCount - humans;
      const arr: Agent[] = [];
      for (let i = 0; i < humans; i++)
        arr.push(new Agent(width, height, "human"));
      for (let i = 0; i < ais; i++) arr.push(new Agent(width, height, "ai"));
      return arr;
    };

    const agents = makeAgents(canvas.width / dpr, canvas.height / dpr);
    let currentRingRadius = 24; // px

    const animate = () => {
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Target radius scales with viewport; nodes form this single circle
      const targetRingRadius = Math.min(width, height) * 0.35;
      currentRingRadius += (targetRingRadius - currentRingRadius) * 0.05;

      // Update and draw agents (nodes make up the circle; no outline, no connections)
      for (const a of agents) {
        a.update(width, height, cx, cy, currentRingRadius);
        a.draw(ctx);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[75vh] max-h-[400px] min-h-[300px] bg-transparent relative"
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

export default AugmentedIntelligenceMonochrome;
