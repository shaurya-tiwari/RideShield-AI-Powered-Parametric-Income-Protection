import { useRef, useEffect, useCallback } from "react";

export default function TiltWrapper({ children, className = "", intensity = 8, style = {} }) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * -intensity;
    const ry = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * intensity;
    
    // Low latency transition during movement
    el.style.transition = "transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)";
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Smooth reset transition
    el.style.transition = "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)";
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div ref={ref} className={className} style={{ transformStyle: "preserve-3d", ...style }}>
      {children}
    </div>
  );
}
