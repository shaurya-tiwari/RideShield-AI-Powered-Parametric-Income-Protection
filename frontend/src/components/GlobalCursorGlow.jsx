import { useEffect, useState } from "react";

export default function GlobalCursorGlow() {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    let animationFrameId;
    const updatePosition = (e) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
      });
    };
    
    window.addEventListener("mousemove", updatePosition, { passive: true });
    return () => {
      window.removeEventListener("mousemove", updatePosition);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 hidden dark:block opacity-60"
      style={{
        background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(16,185,129,0.06), transparent 50%)`,
      }}
    />
  );
}
