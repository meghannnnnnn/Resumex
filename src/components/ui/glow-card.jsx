import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function GlowCard({ 
  children, 
  className = '', 
  containerClassName = '', 
  glowClassName = '',
  isHoverable = true 
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current || !isHoverable) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPosition({ x, y });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    if (!isHoverable) return;
    setOpacity(0);
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative group rounded-xl overflow-hidden",
        containerClassName
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow effect */}
      <motion.div
        className={cn(
          "pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 duration-300",
          glowClassName
        )}
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(120, 130, 255, 0.1), transparent 40%)`,
          opacity: opacity,
        }}
      />
      
      {/* Content */}
      <div className={cn(
        "glow-card relative border border-white/[0.08] bg-white bg-opacity-[0.02] backdrop-blur-sm p-4",
        className
      )}>
        {children}
      </div>
    </div>
  );
} 