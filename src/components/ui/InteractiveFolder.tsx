"use client";

/**
 * InteractiveFolder Component
 * A premium, interactive folder UI element that opens on click
 * to reveal contents with a "drifting" animation effect.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FolderProps {
  /** Main color of the folder */
  color?: string;
  /** Scale factor for the folder */
  size?: number;
  /** Array of React elements to display as "papers" inside the folder */
  items?: React.ReactNode[];
  /** Optional CSS class for the wrapper */
  className?: string;
  /** Title or label to display on the folder */
  label?: string;
}

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase().padStart(6, '0');
};

export function InteractiveFolder({ 
  color = '#1A3C2B', // Forest default
  size = 1, 
  items = [], 
  className = '',
  label
}: FolderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const maxVisibleItems = 3;
  const displayItems = items.slice(0, maxVisibleItems);
  while (displayItems.length < maxVisibleItems) {
    displayItems.push(null);
  }

  const folderBackColor = darkenColor(color, 0.12);
  const paperColors = [
    darkenColor('#F7F7F5', 0.1),
    darkenColor('#F7F7F5', 0.05),
    '#F7F7F5'
  ];

  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    if (!isOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.2;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.2;
    setMousePos({ x, y });
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setHoveredIndex(null);
  };

  const getPaperTransform = (index: number) => {
    if (!isOpen) return { x: '-50%', y: '10%', rotate: 0 };
    
    const baseTransforms = [
      { x: '-120%', y: '-75%', rotate: -15 },
      { x: '10%', y: '-75%', rotate: 15 },
      { x: '-50%', y: '-105%', rotate: 5 }
    ];

    const base = baseTransforms[index] || { x: '-50%', y: '-50%', rotate: 0 };
    
    if (hoveredIndex === index) {
      return {
        x: `calc(${base.x} + ${mousePos.x}px)`,
        y: `calc(${base.y} + ${mousePos.y}px)`,
        rotate: base.rotate,
        scale: 1.1,
      };
    }
    
    return base;
  };

  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ transform: `scale(${size})`, width: 120, height: 100 }}
    >
      <div
        className="relative cursor-pointer group select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Folder Back */}
        <div
          className="relative w-[110px] h-[85px] transition-all duration-500 rounded-b-[2px] rounded-tr-[2px]"
          style={{ 
            backgroundColor: folderBackColor,
            border: '1px solid rgba(58, 58, 56, 0.2)'
          }}
        >
          {/* Tab */}
          <div
            className="absolute bottom-full left-[-1px] w-[35px] h-[12px] rounded-t-[2px] border-t border-l border-r border-[rgba(58,58,56,0.2)]"
            style={{ backgroundColor: folderBackColor }}
          />

          {/* Papers */}
          {displayItems.map((item, i) => (
            <motion.div
              key={i}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={handleMouseLeave}
              animate={getPaperTransform(i)}
              transition={{ 
                type: 'spring', 
                stiffness: 260, 
                damping: 20,
                mass: 1 
              }}
              className="absolute left-1/2 flex items-center justify-center overflow-hidden"
              style={{
                zIndex: 20,
                backgroundColor: paperColors[i],
                borderRadius: '2px', // Technical Minimalist constraint
                width: i === 0 ? '75px' : i === 1 ? '85px' : '95px',
                height: i === 0 ? '65px' : i === 1 ? '70px' : '75px',
                border: '1px solid rgba(58,58,56,0.2)'
              }}
            >
              {item || (
                <div className="w-full h-full p-2 flex flex-col gap-1.5 opacity-20">
                  <div className="w-3/4 h-[2px] bg-current rounded-none" />
                  <div className="w-1/2 h-[2px] bg-current rounded-none" />
                  <div className="w-2/3 h-[2px] bg-current rounded-none" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Folder Front Flap - Left Side */}
          <motion.div
            animate={{
              skewX: isOpen ? 15 : 0,
              scaleY: isOpen ? 0.6 : 1,
              translateY: isOpen ? 4 : 0
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute inset-[-1px] z-30 origin-bottom border border-[rgba(58,58,56,0.2)] border-r-0"
            style={{
              backgroundColor: color,
              borderRadius: '2px 2px 2px 2px',
              clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
            }}
          />

          {/* Folder Front Flap - Right Side */}
          <motion.div
            animate={{
              skewX: isOpen ? -15 : 0,
              scaleY: isOpen ? 0.6 : 1,
              translateY: isOpen ? 4 : 0
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute inset-[-1px] z-30 origin-bottom border border-[rgba(58,58,56,0.2)] border-l-0"
            style={{
              backgroundColor: color,
              borderRadius: '2px 2px 2px 2px',
              clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'
            }}
          >
             {label && !isOpen && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 text-[10px] font-mono tracking-widest whitespace-nowrap px-2">
                {label}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveFolder;
